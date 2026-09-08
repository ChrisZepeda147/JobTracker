#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const win = process.platform === "win32";
const python = win
  ? path.join(root, ".venv", "Scripts", "python.exe")
  : path.join(root, ".venv", "bin", "python");

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

const worker = path.join(root, "job_worker.py");
const args = [worker, ...process.argv.slice(2)];
const child = spawn(python, args, { cwd: root, stdio: "inherit", shell: win });

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
