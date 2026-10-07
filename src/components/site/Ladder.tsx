"use client";

import { useEffect, useRef, useState } from "react";
import { CircuitBackdrop } from "@/components/fx/backdrops";
import SplitText from "@/components/fx/SplitText";
import { clamp } from "@/components/fx/motion";
import type { SiteSettings, Stage } from "@/lib/types";

/**
 * The transformation ladder.
 *
 * A sticky rail on the left tracks which stage is in view and draws a gold
 * spine through the numbers as the section is read. Each stage carries a
 * human/AI balance bar, so the shift in who does the work is visible at a
 * glance rather than only described.
 */
export default function Ladder({
  stages,
  settings,
}: {
  stages: Stage[];
  settings: SiteSettings;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = Number((entry.target as HTMLElement).dataset.index);
          if (!Number.isNaN(idx)) setActive(idx);
        }
      },
      { rootMargin: "-48% 0px -48% 0px", threshold: 0 },
    );

    panelRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [stages.length]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = sectionRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        setProgress(clamp((vh * 0.5 - r.top) / r.height));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  if (stages.length === 0) return null;

  return (
    <section id="method" ref={sectionRef} className="section relative overflow-clip">
      <CircuitBackdrop className="opacity-[0.85]" seed={11} traces={10} />

      {/* Header */}
      <div className="shell relative">
        <div className="flex items-baseline gap-5">
          <span className="index" data-reveal="fade">
            02
          </span>
          <span className="kicker" data-reveal="fade">
            {settings.ladderKicker}
          </span>
        </div>
        <div className="mt-5 h-px w-full bg-line" data-reveal="rule" />
        <div className="mt-10 grid gap-8 md:grid-cols-12">
          <SplitText
            as="h2"
            text={settings.ladderTitle}
            className="display-lg text-paper md:col-span-7"
          />
          <p
            className="lead md:col-span-5 md:pt-3"
            data-reveal="up"
            style={{ ["--reveal-delay" as string]: "200ms" }}
          >
            {settings.ladderLead}
          </p>
        </div>
      </div>

      {/* Rail + stages */}
      <div className="shell relative mt-24 grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Sticky rail */}
        <nav className="hidden lg:col-span-3 lg:block" aria-label="Transformation stages">
          <div className="sticky top-32">
            <div className="relative pl-8">
              {/* Spine */}
              <div className="absolute left-[3px] top-2 h-[calc(100%-1rem)] w-px bg-line" />
              <div
                className="absolute left-[3px] top-2 w-px bg-signal transition-[height] duration-300 ease-out"
                style={{ height: `calc(${progress * 100}% - 1rem)` }}
              />

              <ul className="flex flex-col gap-7">
                {stages.map((s, i) => {
                  const isActive = i === active;
                  return (
                    <li key={s.id} className="relative">
                      <span
                        className="absolute -left-8 top-[0.55rem] block h-[7px] w-[7px] rounded-full border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        style={{
                          borderColor: isActive
                            ? "var(--color-signal)"
                            : "var(--color-line-strong)",
                          background: isActive ? "var(--color-signal)" : "transparent",
                          transform: isActive ? "scale(1.45)" : "scale(1)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          panelRefs.current[i]?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          })
                        }
                        className="text-left transition-colors duration-500"
                      >
                        <span className="index block">
                          {String(s.number).padStart(2, "0")}
                        </span>
                        <span
                          className="display-sm block transition-colors duration-500"
                          style={{
                            color: isActive ? "var(--color-paper)" : "var(--color-paper-30)",
                          }}
                        >
                          {s.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </nav>

        {/* Stage panels */}
        <div className="flex flex-col gap-6 lg:col-span-9">
          {stages.map((s, i) => (
            <div
              key={s.id}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              data-index={i}
              className="group panel ticks relative overflow-hidden p-8 transition-colors duration-700 md:p-12"
              style={{
                borderColor:
                  i === active ? "var(--color-line-strong)" : "var(--color-line)",
              }}
              data-reveal="up"
            >
              {/* Oversized ghost number */}
              <span
                className="pointer-events-none absolute -right-2 -top-8 select-none font-[family-name:var(--font-display)] text-[9rem] font-bold leading-none text-white/[0.022] md:text-[13rem]"
                aria-hidden="true"
                style={{ fontVariationSettings: '"wdth" 75' }}
              >
                {String(s.number).padStart(2, "0")}
              </span>

              <div className="relative">
                <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                  <span className="index text-signal">
                    Stage {String(s.number).padStart(2, "0")}
                  </span>
                  <h3 className="display-md text-paper">{s.title}</h3>
                </div>

                {s.subtitle && (
                  <p className="mt-4 max-w-xl text-paper-45">{s.subtitle}</p>
                )}

                <div className="mt-9 grid gap-10 md:grid-cols-12">
                  <ul className="flex flex-col gap-3 md:col-span-7">
                    {s.bullets.map((b, bi) => (
                      <li key={bi} className="flex gap-4 text-paper-80">
                        <span
                          className="mt-[0.6rem] h-px w-4 shrink-0 bg-signal-dim"
                          aria-hidden="true"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="md:col-span-5">
                    {/* Who does the work */}
                    <div className="kicker">Who does the work</div>
                    <div
                      className="mt-4 flex h-8 origin-left gap-px overflow-hidden rounded-[2px]"
                      data-reveal="rule"
                    >
                      <div
                        className="flex items-center justify-center bg-white/[0.14] transition-all duration-700"
                        style={{ width: `${s.humanShare}%` }}
                      >
                        <span className="index text-paper-60">
                          {s.humanShare >= 20 ? "HUMAN" : ""}
                        </span>
                      </div>
                      {/* AI reads cool, humans read warm — the bar states the
                          shift before the copy does. */}
                      <div
                        className="flex items-center justify-center bg-cool/25"
                        style={{ width: `${100 - s.humanShare}%` }}
                      >
                        <span className="index text-cool">
                          {100 - s.humanShare >= 20 ? "AI" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="index">{s.humanShare}% human</span>
                      <span className="index text-cool/70">{100 - s.humanShare}% ai</span>
                    </div>

                    {s.goal && (
                      <div className="mt-8 border-t border-line pt-5">
                        <div className="kicker kicker-signal">Goal</div>
                        <p className="display-sm mt-2 text-paper">{s.goal}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
