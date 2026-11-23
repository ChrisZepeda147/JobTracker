#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { killProcessTreeByPid, stopStaleNextDev } from "./stop-stale-next.mjs";
import {
  isWin,
  requirePythonVenv,
  resolveNextBin,
  resolveProjectRoot,
  resolvePython,
  webDevEnv,
} from "./run-utils.mjs";

const root = resolveProjectRoot(import.meta.url);
const webDir = path.join(root, "web");
const python = resolvePython(root);
requirePythonVenv(python);
const nextBin = resolveNextBin(webDir);

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
    shell: isWin,
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

start("web", nextBin, ["dev", "--turbo", "-p", "3000"], {
  cwd: webDir,
  env: webDevEnv(root),
});
start("worker", python, ["-u", path.join(root, "job_worker.py")], { cwd: root });

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));