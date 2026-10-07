import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "bcryptjs"],
  // Read from disk at runtime, so they must be traced into every server bundle
  // (src/lib/db.ts). Without them a serverless deploy has no schema or content.
  outputFileTracingIncludes: {
    "/**": ["./src/lib/schema.sql", "./data/content.db"],
  },
  images: {
    // Uploads are served from /public/uploads and are already sized by the
    // upload pipeline, so Next's optimizer only needs to handle local files.
    formats: ["image/avif", "image/webp"],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
