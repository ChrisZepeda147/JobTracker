#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadMonorepoEnv } from "./load-env.mjs";
import { isWin, requirePythonVenv, resolveProjectRoot, resolvePython } from "./run-utils.mjs";

const root = resolveProjectRoot(import.meta.url);
loadMonorepoEnv(root);

const python = resolvePython(root);
requirePythonVenv(python);

const worker = path.join(root, "job_worker.py");
const args = [worker, ...process.argv.slice(2)];
const child = spawn(python, ["-u", ...args], { cwd: root, stdio: "inherit", shell: isWin });

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});