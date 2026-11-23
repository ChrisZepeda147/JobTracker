import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadMonorepoEnv, parseEnvFile } from "./load-env.mjs";

export const isWin = process.platform === "win32";

export function resolveProjectRoot(fromImportMetaUrl) {
  return path.resolve(path.dirname(fileURLToPath(fromImportMetaUrl)), "..");
}

export function resolvePython(root) {
  return isWin
    ? path.join(root, ".venv", "Scripts", "python.exe")
    : path.join(root, ".venv", "bin", "python");
}

export function requirePythonVenv(python) {
  if (fs.existsSync(python)) {
    return true;
  }
  console.error(
    "Python venv not found. From the project root run:\n" +
      "  python -m venv .venv\n" +
      (isWin
        ? "  .venv\\Scripts\\pip install -r requirements.txt"
        : "  .venv/bin/pip install -r requirements.txt"),
  );
  process.exit(1);
}

export function resolveNextBin(webDir) {
  const nextBin = path.join(webDir, "node_modules", ".bin", isWin ? "next.cmd" : "next");
  if (!fs.existsSync(nextBin)) {
    console.error("Web dependencies missing. Run: npm install --prefix web");
    process.exit(1);
  }
  return nextBin;
}

/** Env for Next.js dev: root .env + web overrides + public Supabase mapping. */
export function webDevEnv(root) {
  loadMonorepoEnv(root);
  const webDir = path.join(root, "web");
  const webLocal = {
    ...parseEnvFile(path.join(webDir, ".env")),
    ...parseEnvFile(path.join(webDir, ".env.local")),
  };
  return {
    ...process.env,
    ...webLocal,
    PORT: "3000",
    JOBTRACKER_ROOT: root,
  };
}