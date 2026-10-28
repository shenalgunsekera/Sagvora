import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

/* Fonts are self-hosted (latin variable files from Google Fonts in ./fonts).
   next/font/google fetches them during every build, and a Google hiccup on
   Vercel's build machine failed whole deploys. */

/* Archivo carries a width axis, which is what lets the headings match the
   condensed Sagvora lockup without shipping a second display face. */
const archivo = localFont({
  src: "./fonts/archivo.woff2",
  weight: "100 900",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  variable: "--font-archivo",
  display: "swap",
});

const inter = localFont({
  src: "./fonts/inter.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = localFont({
  src: "./fonts/jetbrains-mono.woff2",
  weight: "400 500",
  variable: "--font-mono-jb",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sagvora Innovations | Business Transformation Company",
    template: "%s · Sagvora Innovations",
  },
  description:
    "We automate first, then introduce AI, then AI employees, then AI departments: a five-stage transformation ladder for businesses that intend to still be here in ten years.",
  metadataBase: new URL(siteUrl()),
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  colorScheme: "dark",
  // Android: the on-screen keyboard shrinks the page instead of covering it.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      {/* The preloader gate script sets data-locked before hydration. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
