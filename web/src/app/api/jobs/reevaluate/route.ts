import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

function repoRoot(): string {
  if (process.env.JOBTRACKER_ROOT) {
    return process.env.JOBTRACKER_ROOT;
  }
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, "job_worker.py"))) {
    return cwd;
  }
  return path.resolve(cwd, "..");
}

function workerPaths() {
  const root = repoRoot();
  const win = process.platform === "win32";
  const python = win
    ? path.join(root, ".venv", "Scripts", "python.exe")
    : path.join(root, ".venv", "bin", "python");
  const worker = path.join(root, "job_worker.py");
  return { root, win, python, worker };
}

function assertWorkerReady(): { root: string; win: boolean; python: string; worker: string } {
  const paths = workerPaths();
  if (!fs.existsSync(paths.python) || !fs.existsSync(paths.worker)) {
    throw new Error("Worker not found. Run from repo root with .venv installed.");
  }
  return paths;
}

/** Fire-and-forget — used after saving preferences so the UI is not blocked for minutes. */
function startReevaluateBackground(userId: string): void {
  const { root, win, python, worker } = assertWorkerReady();
  const child = spawn(python, [worker, "--reevaluate-all", userId], {
    cwd: root,
    shell: win,
    env: process.env,
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}

function runReevaluate(userId: string): Promise<{ refiltered: number; rescored: number }> {
  const { root, win, python, worker } = assertWorkerReady();

  return new Promise((resolve, reject) => {
    const child = spawn(python, [worker, "--reevaluate-all", userId], {
      cwd: root,
      shell: win,
      env: process.env,
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      const combined = `${stdout}\n${stderr}`;
      const match = combined.match(/REEVAL_RESULT refiltered=(\d+) rescored=(\d+)/);
      if (code !== 0 || !match) {
        reject(new Error(stderr.trim() || stdout.trim() || `Worker exited ${code}`));
        return;
      }
      resolve({
        refiltered: Number(match[1]),
        rescored: Number(match[2]),
      });
    });
  });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Immediate re-evaluate is only available in local development." },
      { status: 501 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const sync = new URL(request.url).searchParams.get("sync") === "1";

  try {
    if (!sync) {
      startReevaluateBackground(user.id);
      return NextResponse.json(
        {
          started: true,
          message:
            "Re-evaluation started in the background. Refresh the Jobs page in a few minutes to see updates.",
        },
        { status: 202 },
      );
    }
    const result = await runReevaluate(user.id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Re-evaluate failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
