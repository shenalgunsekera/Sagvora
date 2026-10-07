import Link from "next/link";
import Glyph from "@/components/fx/Glyph";
import SheenCard from "@/components/fx/SheenCard";
import { PerspectiveGrid } from "@/components/fx/backdrops";
import SectionHeader from "./SectionHeader";
import type { Service, SiteSettings } from "@/lib/types";

export default function Capabilities({
  services,
  settings,
}: {
  services: Service[];
  settings: SiteSettings;
}) {
  if (services.length === 0) return null;

  return (
    <section id="capabilities" className="section relative overflow-clip">
      <PerspectiveGrid />

      <SectionHeader
        index="03"
        kicker={settings.servicesKicker}
        title={settings.servicesTitle}
        lead={settings.servicesLead}
      />

      <div className="shell relative mt-20">
        {/* Hairline matrix: the gaps are the rules. */}
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <SheenCard key={s.id} className="group relative bg-ink-0">
              <Link
                href={`/capabilities/${s.slug}`}
                className="relative flex h-full min-h-[19rem] flex-col justify-between overflow-hidden p-8 md:p-9"
                data-reveal="up"
                style={{ ["--reveal-delay" as string]: `${(i % 3) * 90}ms` }}
              >
                {/* The photograph stays out of the way until you show interest,
                    then surfaces behind the type — never above 22%, so the card
                    is always read as text first. */}
                {s.image && (
                  <span className="pointer-events-none absolute inset-0" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.image}
                      alt=""
                      width={1920}
                      height={1080}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full scale-110 object-cover opacity-0 transition-all duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-hover:opacity-40"
                      style={{ filter: "brightness(1.45) saturate(0.8)" }}
                    />
                    <span
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(8,8,10,0.93), rgba(8,8,10,0.42) 62%, rgba(8,8,10,0.7))",
                      }}
                    />
                  </span>
                )}

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <Glyph
                      name={s.glyph}
                      className="text-paper-60 transition-colors duration-500 group-hover:text-paper"
                    />
                    <span className="index">{String(i + 1).padStart(2, "0")}</span>
                  </div>

                  {s.kicker && (
                    <div className="mt-8 kicker transition-colors duration-500 group-hover:text-signal">
                      {s.kicker}
                    </div>
                  )}

                  <h3 className="display-sm mt-3 text-paper">{s.title}</h3>

                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-paper-45">
                    {s.summary}
                  </p>
                </div>

                <div className="relative mt-8 flex items-center justify-between border-t border-line pt-5">
                  <span className="index">
                    {s.features.length} component{s.features.length === 1 ? "" : "s"}
                  </span>
                  <span className="flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-paper-45 transition-colors duration-500 group-hover:text-paper">
                    Detail
                    <span className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>

                {/* Rule that draws across the top on hover */}
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-signal transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                  aria-hidden="true"
                />
              </Link>
            </SheenCard>
          ))}

          {/* Closes the grid and gives the section somewhere to go. */}
          <SheenCard className="group relative bg-ink-0">
            <Link
              href="/#contact"
              className="relative flex h-full min-h-[19rem] flex-col justify-between p-8 md:p-9"
              data-reveal="up"
            >
              <span className="index">{String(services.length + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="display-sm text-paper-45 transition-colors duration-500 group-hover:text-paper">
                  Something here that
                  <br />
                  is not on this list?
                </h3>
                <span className="index mt-6 flex items-center gap-2 text-signal">
                  Describe the workflow
                  <span className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>
            </Link>
          </SheenCard>

          {/* Blank cells keep the last row square so the backdrop never shows
              through a half-finished grid. Counts differ per breakpoint. */}
          {Array.from({ length: fillFor(services.length + 1, 3) }).map((_, i) => (
            <div key={`lg${i}`} className="hidden bg-ink-0 lg:block" aria-hidden="true" />
          ))}
          {Array.from({ length: fillFor(services.length + 1, 2) }).map((_, i) => (
            <div key={`sm${i}`} className="hidden bg-ink-0 sm:block lg:hidden" aria-hidden="true" />
          ))}
        </div>
      </div>
    </section>
  );
}

/** How many blank cells are needed to complete the final row. */
const fillFor = (count: number, columns: number) => (columns - (count % columns)) % columns;
