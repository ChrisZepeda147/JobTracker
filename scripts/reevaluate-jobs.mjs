#!/usr/bin/env node
/**
 * Re-filter and re-score stored jobs immediately (no worker queue).
 * Usage: node scripts/reevaluate-jobs.mjs [USER_ID]
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const win = process.platform === "win32";
const python = win
  ? path.join(root, ".venv", "Scripts", "python.exe")
  : path.join(root, ".venv", "bin", "python");

if (!fs.existsSync(python)) {
  console.error("Python venv not found at", python);
  process.exit(1);
}

const userId = process.argv[2]?.trim();
const args = [path.join(root, "job_worker.py"), "--reevaluate-all"];
if (userId) {
  args.push(userId);
}

const result = spawnSync(python, args, { cwd: root, encoding: "utf8", shell: win });
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
const match = combined.match(/REEVAL_RESULT refiltered=(\d+) rescored=(\d+)/);
if (match) {
  console.log(
    JSON.stringify({ ok: true, refiltered: Number(match[1]), rescored: Number(match[2]) }),
  );
}

process.exit(result.status ?? 1);
