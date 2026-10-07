import type { Metadata } from "next";
import Grain from "@/components/fx/Grain";
import MotionRoot from "@/components/fx/MotionRoot";
import Preloader, { PRELOADER_GATE } from "@/components/fx/Preloader";
import Footer from "@/components/site/Footer";
import Nav from "@/components/site/Nav";
import { getSettings } from "@/lib/queries";

// Content is editable from /admin, so pages always read the current store.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  let s;
  try { s = getSettings(); } catch { return {}; } // TEMP-DIAG
  const name = `${s.brandName} ${s.brandSuffix}`;
  const image = { url: "/og.png", width: 1200, height: 630, alt: name };

  return {
    title: { default: s.seoTitle, template: `%s · ${name}` },
    description: s.seoDescription,
    alternates: { canonical: "/" },
    openGraph: {
      title: s.seoTitle,
      description: s.seoDescription,
      siteName: name,
      type: "website",
      locale: "en",
      url: "/",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: s.seoTitle,
      description: s.seoDescription,
      images: [image],
    },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let settings;
  try { settings = getSettings(); } catch (e) { return <pre data-diag="layout">{String((e as Error)?.stack ?? e)}</pre>; } // TEMP-DIAG

  return (
    <>
      {/* Decides before first paint whether the intro curtain shows. */}
      <script dangerouslySetInnerHTML={{ __html: PRELOADER_GATE }} />
      <noscript>
        <style>{".preloader{display:none}"}</style>
      </noscript>
      <Preloader />
      <MotionRoot />
      <Grain />

      {/* Scroll progress — reads the --scroll variable MotionRoot publishes.
          Runs warm to cool across the page, the same journey the content makes. */}
      <div
        data-scroll-progress
        className="fixed inset-x-0 top-0 z-[60] h-px origin-left"
        style={{
          transform: "scaleX(var(--scroll, 0))",
          background:
            "linear-gradient(90deg, var(--color-signal), var(--color-haze) 55%, var(--color-cool))",
        }}
        aria-hidden="true"
      />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[110] focus:bg-paper focus:px-4 focus:py-2 focus:text-ink-0"
      >
        Skip to content
      </a>

      <Nav />
      <main id="main">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
