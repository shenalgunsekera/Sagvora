import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "bcryptjs"],
  images: {
    // Uploads are served from /public/uploads and are already sized by the
    // upload pipeline, so Next's optimizer only needs to handle local files.
    formats: ["image/avif", "image/webp"],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
