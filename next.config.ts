import type { NextConfig } from "next";
import { siteUrl } from "./src/lib/site-url";

/**
 * The one address search engines should know. The site is reachable on
 * several hosts (the custom domain, the apex, sagvora.vercel.app); everything
 * else redirects here so they never compete as duplicates.
 */
const CANONICAL = siteUrl();
const canonicalHost = new URL(CANONICAL).host;

const nextConfig: NextConfig = {
  // Lets a production build run beside `next dev` without sharing .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  serverExternalPackages: ["firebase-admin", "bcryptjs"],
  images: {
    // Uploads are served from /media/... (Firestore) and are already sized by
    // the upload pipeline, so Next's optimizer only needs local paths.
    formats: ["image/avif", "image/webp"],
  },
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Scripts aren't pinned here (analytics may load after consent), but
          // framing, plugins and <base> hijacking are shut off.
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
        ],
      },
    ];
  },
  async redirects() {
    // Only the production vercel.app alias — preview deployments keep working.
    if (canonicalHost === "sagvora.vercel.app") return [];
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "sagvora.vercel.app" }],
        destination: `${CANONICAL}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
