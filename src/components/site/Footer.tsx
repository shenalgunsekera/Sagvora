import Link from "next/link";
import Marquee from "@/components/fx/Marquee";
import CookieSettingsButton from "./CookieSettingsButton";
import Wordmark from "./Wordmark";
import type { SiteSettings } from "@/lib/types";

export default function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-clip border-t border-line pt-14 md:pt-20">
      <div className="shell grid grid-cols-2 gap-x-6 gap-y-10 pb-12 md:grid-cols-12 md:gap-12 md:pb-16">
        <div className="col-span-2 md:col-span-5">
          <Wordmark className="text-[1.6rem]" />
          <p className="mt-6 max-w-xs text-paper-45">{settings.footerNote}</p>
        </div>

        <nav className="col-span-1 md:col-span-3">
          <div className="kicker">Site</div>
          <ul className="mt-5 flex flex-col gap-3">
            {[
              { label: "Position", href: "/#position" },
              { label: "Method", href: "/#method" },
              { label: "Capabilities", href: "/#capabilities" },
              { label: "Work", href: "/#work" },
              { label: "Contact", href: "/#contact" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-wipe text-paper-60 hover:text-paper">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-1 min-w-0 md:col-span-4">
          <div className="kicker">Direct</div>
          <ul className="mt-5 flex flex-col gap-3">
            {settings.contactName && <li className="text-paper">{settings.contactName}</li>}
            <li>
              <a href={`mailto:${settings.email}`} className="link-wipe break-all text-paper-60 hover:text-paper">
                {settings.email}
              </a>
            </li>
            {settings.phone && (
              <li>
                <a
                  href={`tel:${settings.phone.replace(/s/g, "")}`}
                  className="link-wipe text-paper-60 hover:text-paper"
                >
                  {settings.phone}
                </a>
              </li>
            )}
            <li className="text-paper-45">{settings.address}</li>
          </ul>

          {settings.socials?.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
              {settings.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="index transition-colors duration-500 hover:text-paper"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Oversized band — the sign-off */}
      <div className="border-t border-line py-6 md:py-10">
        <Marquee duration={38}>
          <span className="wordmark whitespace-nowrap px-6 text-[clamp(3.5rem,11vw,10rem)] leading-none text-white/[0.055]">
            Automate · Assist · Execute · Workforce · Evolve ·
          </span>
        </Marquee>
      </div>

      <div className="shell flex flex-col gap-2 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between md:py-7">
        <span className="index">
          © {year} {settings.brandName} {settings.brandSuffix}. All rights reserved.
        </span>
        <div className="flex items-center gap-6">
          <span className="index hidden md:inline">{settings.tagline}</span>
          <CookieSettingsButton className="index transition-colors duration-500 hover:text-paper" />
          <a href="#main" className="index transition-colors duration-500 hover:text-paper">
            Top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
