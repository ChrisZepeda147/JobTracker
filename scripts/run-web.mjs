#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { killProcessTreeByPid, stopStaleNextDev } from "./stop-stale-next.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const webDir = path.join(root, "web");
const win = process.platform === "win32";
const nextBin = path.join(webDir, "node_modules", ".bin", win ? "next.cmd" : "next");

if (!fs.existsSync(nextBin)) {
  console.error("Web dependencies missing. Run: npm install --prefix web");
  process.exit(1);
}

stopStaleNextDev();

const child = spawn(nextBin, ["dev", "-p", "3000"], {
  cwd: webDir,
  stdio: "inherit",
  shell: win,
  env: { ...process.env, PORT: "3000" },
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
