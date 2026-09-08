#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const webDir = path.join(root, "web");
const lockPath = path.join(webDir, ".next", "dev", "lock");
const win = process.platform === "win32";

function isRunning(pid) {
  if (!pid || pid <= 0) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function killProcessTree(pid) {
  if (!pid || pid <= 0) {
    return;
  }
  if (win) {
    spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore", shell: true });
    return;
  }
  try {
    process.kill(pid, "SIGTERM");
  } catch {
    // already gone
  }
}

export function stopStaleNextDev() {
  if (!fs.existsSync(lockPath)) {
    return;
  }

  let lock = null;
  try {
    lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  } catch {
    try {
      fs.unlinkSync(lockPath);
    } catch {
      // ignore
    }
    return;
  }

  const pid = Number(lock?.pid);
  if (isRunning(pid)) {
    console.log(`[dev] stopping stale Next.js dev server (PID ${pid})`);
    killProcessTree(pid);
  }

  try {
    fs.unlinkSync(lockPath);
  } catch {
    // ignore
  }
}

export function killProcessTreeByPid(pid) {
  killProcessTree(pid);
}
