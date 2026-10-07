import Link from "next/link";
import HeroField from "@/components/fx/HeroField";
import SplitText from "@/components/fx/SplitText";
import type { SiteSettings } from "@/lib/types";

export default function Hero({ settings }: { settings: SiteSettings }) {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-clip pb-16 pt-32"
    >
      {/* Interactive lattice */}
      <div className="absolute inset-0">
        <HeroField />
      </div>

      {/* Light pooling behind the wordmark */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 62%, rgba(244,244,240,0.07), transparent 70%), radial-gradient(48% 42% at 78% 28%, rgba(166,200,232,0.07), transparent 72%), radial-gradient(40% 38% at 16% 76%, rgba(217,185,120,0.05), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Fixed side rails */}
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[var(--rail)] items-center justify-center lg:flex">
        <span
          className="kicker whitespace-nowrap"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Est. Colombo — Worldwide
        </span>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[var(--rail)] items-center justify-center lg:flex">
        <span
          className="kicker whitespace-nowrap"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll to begin
        </span>
      </div>

      <div className="shell relative">
        {/* Kicker line */}
        <div className="flex items-center gap-4" data-reveal="fade">
          <span className="h-1.5 w-1.5 rounded-full bg-signal anim-blink" />
          <span className="kicker">{settings.heroKicker}</span>
        </div>

        {/* The wordmark, character by character */}
        <h1 className="mt-6">
          <SplitText
            text={settings.heroHeadline}
            mode="chars"
            delay={260}
            className="display-xl block text-paper"
          />
        </h1>

        {/* Baseline row: lead + CTAs */}
        <div className="mt-10 grid gap-10 border-t border-line pt-8 md:grid-cols-12 md:gap-8">
          <p
            className="lead md:col-span-6 lg:col-span-5"
            data-reveal="up"
            style={{ ["--reveal-delay" as string]: "520ms" }}
          >
            {settings.heroLead}
          </p>

          <div
            className="flex flex-wrap items-start gap-4 md:col-span-6 md:justify-end lg:col-span-7"
            data-reveal="up"
            style={{ ["--reveal-delay" as string]: "620ms" }}
          >
            <span className="magnetic" data-magnetic="0.3">
              <Link href="#contact" className="btn btn-solid">
                <span>{settings.heroPrimaryCta}</span>
                <span className="btn-arrow">→</span>
              </Link>
            </span>
            <span className="magnetic" data-magnetic="0.3">
              <Link href="#method" className="btn">
                <span>{settings.heroSecondaryCta}</span>
                <span className="btn-arrow">↓</span>
              </Link>
            </span>
          </div>
        </div>

        {/* Stage ticker across the bottom */}
        <div
          className="mt-12 hidden grid-cols-5 gap-px overflow-hidden border-t border-line lg:grid"
          data-reveal="fade"
          style={{ ["--reveal-delay" as string]: "760ms" }}
        >
          {["Automate", "AI Assist", "AI Execute", "AI Workforce", "Evolve"].map((s, i) => (
            <div key={s} className="group relative pt-4">
              <div className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-signal transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
              <div className="index">0{i + 1}</div>
              <div className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-paper-60 transition-colors duration-500 group-hover:text-paper">
                {s}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
