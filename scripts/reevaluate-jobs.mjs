#!/usr/bin/env node
/**
 * Re-filter and re-score stored jobs immediately (no worker queue).
 * Usage: node scripts/reevaluate-jobs.mjs [USER_ID]
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { loadMonorepoEnv } from "./load-env.mjs";
import {
  isWin,
  requirePythonVenv,
  resolveProjectRoot,
  resolvePython,
} from "./run-utils.mjs";

const root = resolveProjectRoot(import.meta.url);
loadMonorepoEnv(root);
const python = resolvePython(root);
requirePythonVenv(python);

const userId = process.argv[2]?.trim();
const args = [path.join(root, "job_worker.py"), "--reevaluate-all"];
if (userId) {
  args.push(userId);
}

const result = spawnSync(python, ["-u", ...args], { cwd: root, encoding: "utf8", shell: isWin });
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
