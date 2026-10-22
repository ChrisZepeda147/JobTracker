import fs from "node:fs";
import path from "node:path";

export function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

/** Merge repo-root .env into process env and map worker keys → Next public keys. */
export function loadMonorepoEnv(rootDir) {
  const merged = {
    ...parseEnvFile(path.join(rootDir, ".env")),
    ...parseEnvFile(path.join(rootDir, ".env.local")),
  };

  for (const [key, value] of Object.entries(merged)) {
    if (process.env[key] == null || process.env[key] === "") {
      process.env[key] = value;
    }
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL && merged.SUPABASE_URL) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = merged.SUPABASE_URL;
  }
  const anon =
    merged.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    merged.SUPABASE_PUBLISHABLE_KEY ??
    merged.SUPABASE_ANON_KEY;
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && anon) {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anon;
  }
}
