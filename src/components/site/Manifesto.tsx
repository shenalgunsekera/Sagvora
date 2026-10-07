import SplitText from "@/components/fx/SplitText";
import type { SiteSettings } from "@/lib/types";

export default function Manifesto({ settings }: { settings: SiteSettings }) {
  const lines = settings.manifestoLines;

  return (
    <section id="position" className="section relative overflow-clip">
      <div className="ruled" aria-hidden="true" />

      <div className="shell relative grid gap-14 lg:grid-cols-12 lg:gap-16">
        {/* Sticky column */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <div className="flex items-baseline gap-5">
              <span className="index" data-reveal="fade">
                01
              </span>
              <span className="kicker" data-reveal="fade">
                {settings.manifestoKicker}
              </span>
            </div>

            <SplitText
              as="h2"
              text={settings.manifestoTitle}
              className="display-md mt-8 text-paper"
            />

            <p
              className="mt-8 max-w-sm text-paper-45"
              data-reveal="up"
              style={{ ["--reveal-delay" as string]: "200ms" }}
            >
              {settings.manifestoClosing}
            </p>

            {/* Scroll-linked meter */}
            <div className="mt-10 hidden items-center gap-4 lg:flex" data-reveal="fade">
              <div className="relative h-24 w-px bg-line">
                <div
                  data-scroll-progress
                  className="absolute inset-0 origin-top bg-signal"
                  style={{ transform: "scaleY(var(--scroll, 0))" }}
                />
              </div>
              <span className="index">Position statement</span>
            </div>
          </div>
        </div>

        {/* The ledger */}
        <ol className="lg:col-span-8">
          {lines.map((line, i) => (
            <li
              key={i}
              className="group relative border-b border-line first:border-t"
              data-reveal="up"
              style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}
            >
              {/* Fill that wipes across on hover */}
              <span
                className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-white/[0.025] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                aria-hidden="true"
              />

              <div className="relative flex items-start gap-6 py-6 transition-[padding] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:pl-4 md:gap-8 md:py-7">
                <span className="index pt-2 transition-colors duration-500 group-hover:text-signal">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="display-sm flex-1 text-paper-80 transition-colors duration-500 group-hover:text-paper">
                  {line}
                </span>

                {/* Confirmation mark — draws itself on hover */}
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  className="mt-2 shrink-0 text-signal"
                  aria-hidden="true"
                >
                  <path
                    d="M4 11.5 9 16.5 18 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1}
                    className="transition-[stroke-dashoffset] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:[stroke-dashoffset:0]"
                  />
                </svg>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
