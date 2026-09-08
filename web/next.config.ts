import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const webDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(webDir, ".."),
  },
};

export default nextConfig;
