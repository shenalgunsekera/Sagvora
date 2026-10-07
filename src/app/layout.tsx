import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* Archivo carries a width axis, which is what lets the headings match the
   condensed Sagvora lockup without shipping a second display face. */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-jb",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sagvora Innovations — Business Transformation Company",
    template: "%s · Sagvora Innovations",
  },
  description:
    "We automate first, then introduce AI, then AI employees, then AI departments — a five-stage transformation ladder for businesses that intend to still be here in ten years.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  colorScheme: "dark",
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
