#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadMonorepoEnv, parseEnvFile } from "./load-env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const webDir = path.join(root, "web");

loadMonorepoEnv(root);
Object.assign(process.env, parseEnvFile(path.join(webDir, ".env.local")));

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "").trim();
if (!url) {
  console.error("No NEXT_PUBLIC_SUPABASE_URL in web/.env.local or root .env");
  process.exit(1);
}

const health = `${url.replace(/\/$/, "")}/auth/v1/health`;
console.log("Checking", health);

try {
  const res = await fetch(health, { signal: AbortSignal.timeout(10_000) });
  const reachable = res.status > 0 && res.status < 500;
  console.log("HTTP", res.status, reachable ? "reachable" : "FAIL");
  process.exit(reachable ? 0 : 1);
} catch (err) {
  console.error("Cannot reach Supabase:", err instanceof Error ? err.message : err);
  console.error(
    "Fix: internet/VPN/DNS, confirm project is active at supabase.com, URL matches your project ref.",
  );
  process.exit(1);
}
