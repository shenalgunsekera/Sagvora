import Counter from "@/components/fx/Counter";
import Marquee from "@/components/fx/Marquee";
import type { SiteSettings } from "@/lib/types";

export default function Metrics({ settings }: { settings: SiteSettings }) {
  const items = settings.metrics ?? [];

  return (
    <section className="relative overflow-clip border-y border-line bg-ink-1 py-20">
      {/* Ambient wordmark band behind the numbers */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-[0.028]">
        <Marquee duration={64}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="wordmark whitespace-nowrap px-8 text-[7rem] leading-none text-paper"
            >
              Sagvora ·
            </span>
          ))}
        </Marquee>
      </div>

      {items.length > 0 && (
        <div className="shell relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((m, i) => (
            <div
              key={`${m.label}-${i}`}
              className="border-t border-line pt-6"
              data-reveal="up"
              style={{ ["--reveal-delay" as string]: `${i * 110}ms` }}
            >
              <div className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,4rem)] font-bold leading-none tracking-[-0.04em] text-paper">
                <Counter value={m.value} prefix={m.prefix} suffix={m.suffix} />
              </div>
              <div className="mt-4 max-w-[16rem] text-sm leading-snug text-paper-45">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
