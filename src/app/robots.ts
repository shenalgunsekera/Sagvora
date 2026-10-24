import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The control room and the form endpoint have no business in an index.
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
