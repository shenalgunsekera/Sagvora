/** The domain the brand lives on. Every other host redirects here. */
export const PRIMARY_ORIGIN = "https://www.sagvora.lk";

/**
 * The site's public origin, without a trailing slash.
 *
 * Canonical URLs, the sitemap, robots.txt, Open Graph and JSON-LD are all built
 * from this, so a wrong value tells search engines the site lives elsewhere.
 * NEXT_PUBLIC_SITE_URL wins, except a *.vercel.app value: that alias redirects
 * to the real domain, so it must never be named as canonical. Local
 * development uses localhost.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit && !/\.vercel\.app$/i.test(new URL(explicit).host)) return explicit;
  return process.env.NODE_ENV === "production" ? PRIMARY_ORIGIN : explicit || "http://localhost:3000";
}
