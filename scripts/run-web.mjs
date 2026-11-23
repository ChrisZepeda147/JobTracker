#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { killProcessTreeByPid, stopStaleNextDev } from "./stop-stale-next.mjs";
import { resolveNextBin, resolveProjectRoot, webDevEnv } from "./run-utils.mjs";

const root = resolveProjectRoot(import.meta.url);
const webDir = path.join(root, "web");
const nextBin = resolveNextBin(webDir);

stopStaleNextDev();

const child = spawn(nextBin, ["dev", "--turbo", "-p", "3000"], {
  cwd: webDir,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: webDevEnv(root),
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.exit(0);
  }
  process.exit(code ?? 1);
});

process.on("SIGINT", () => {
  if (child.pid) {
    killProcessTreeByPid(child.pid);
  }
  process.exit(0);
});

process.on("SIGTERM", () => {
  if (child.pid) {
    killProcessTreeByPid(child.pid);
  }
  process.exit(0);
});