import type { MetadataRoute } from "next";
import { getProjects, getServices } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** Built from the content store, so publishing a page lists it automatically. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  const services = getServices().map((s) => ({
    url: `${base}/capabilities/${s.slug}`,
    lastModified: new Date(s.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const projects = getProjects().map((p) => ({
    url: `${base}/work/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...projects,
    ...services,
  ];
}
