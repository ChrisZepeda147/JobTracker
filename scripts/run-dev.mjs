#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { killProcessTreeByPid, stopStaleNextDev } from "./stop-stale-next.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const webDir = path.join(root, "web");
const win = process.platform === "win32";
const python = win
  ? path.join(root, ".venv", "Scripts", "python.exe")
  : path.join(root, ".venv", "bin", "python");
const nextBin = path.join(webDir, "node_modules", ".bin", win ? "next.cmd" : "next");

if (!fs.existsSync(python)) {
  console.error(
    "Python venv not found. From the project root run:\n" +
      "  python -m venv .venv\n" +
      (win
        ? "  .venv\\Scripts\\pip install -r requirements.txt"
        : "  .venv/bin/pip install -r requirements.txt"),
  );
  process.exit(1);
}

if (!fs.existsSync(nextBin)) {
  console.error("Web dependencies missing. Run: npm install --prefix web");
  process.exit(1);
}

stopStaleNextDev();

const children = [];
let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  for (const child of children) {
    if (child.pid) {
      killProcessTreeByPid(child.pid);
    }
  }
  setTimeout(() => process.exit(code), 300);
}

function start(name, command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: win,
    ...options,
  });
  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }
    if (signal) {
      shutdown(0);
      return;
    }
    shutdown(code ?? 1);
  });
  children.push(child);
  console.log(`[dev] started ${name}`);
  return child;
}

console.log("[dev] starting web app and job worker (Ctrl+C to stop both)");

start("web", nextBin, ["dev", "-p", "3000"], {
  cwd: webDir,
  env: { ...process.env, PORT: "3000" },
});
start("worker", python, [path.join(root, "job_worker.py")], { cwd: root });

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
