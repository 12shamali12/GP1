import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't get confused by the
  // pnpm-lock.yaml at the repo root vs. the one in frontend/ — that
  // ambiguity triggered the "inferred workspace root" warning.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
