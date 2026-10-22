import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const webDir = path.dirname(fileURLToPath(import.meta.url));

/** Turbopack root = this app only (not the monorepo parent with .venv / Python). */
const nextConfig: NextConfig = {
  turbopack: {
    root: webDir,
  },
};

export default nextConfig;
