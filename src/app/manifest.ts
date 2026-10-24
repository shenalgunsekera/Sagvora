import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sagvora Innovations",
    short_name: "Sagvora",
    description: "Business transformation company in Colombo, Sri Lanka — automation, then AI.",
    start_url: "/",
    display: "standalone",
    background_color: "#08080a",
    theme_color: "#08080a",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
