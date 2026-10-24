import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin", "bcryptjs"],
  images: {
    // Uploads are served from /media/... (Firestore) and are already sized by
    // the upload pipeline, so Next's optimizer only needs local paths.
    formats: ["image/avif", "image/webp"],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
