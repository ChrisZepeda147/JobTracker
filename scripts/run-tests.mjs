#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isWin, requirePythonVenv, resolveProjectRoot, resolvePython } from "./run-utils.mjs";

const root = resolveProjectRoot(import.meta.url);
const python = resolvePython(root);
requirePythonVenv(python);

const py = spawnSync(python, ["-m", "pytest", "tests/", "-q"], {
  cwd: root,
  stdio: "inherit",
  shell: isWin,
});
if (py.status !== 0) {
  process.exit(py.status ?? 1);
}

const npmCmd = isWin ? "npm.cmd" : "npm";
const web = spawnSync(npmCmd, ["run", "test:filters", "--prefix", "web"], {
  cwd: root,
  stdio: "inherit",
  shell: isWin,
});
process.exit(web.status ?? 1);