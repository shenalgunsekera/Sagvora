"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { damp, raf } from "@/components/fx/motion";
import ProjectVisual from "./ProjectVisual";
import { ReelLightbox, ReelPoster, useReel } from "./Reel";
import type { Project } from "@/lib/types";

/**
 * Editorial index of case studies.
 *
 * Rows are the interface; the artwork lives on a panel that trails the cursor
 * and swaps as you move between rows. Nothing is shown until you show interest
 * in it, which keeps the list quiet and the reveal earned.
 *
 * Projects with a showreel prompt "Click to watch" on hover, start buffering
 * the video right then, and open it in a lightbox instead of navigating.
 */
export default function WorkList({ projects }: { projects: Project[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const pointer = useRef({ x: 0, y: 0, cx: 0, cy: 0 });
  const reel = useReel();

  const startFollow = () => {
    if (stopRef.current) return;
    stopRef.current = raf((dt) => {
      const k = damp(dt, 0.13);
      pointer.current.cx += (pointer.current.x - pointer.current.cx) * k;
      pointer.current.cy += (pointer.current.y - pointer.current.cy) * k;
      if (previewRef.current) {
        previewRef.current.style.transform = `translate3d(${pointer.current.cx}px, ${pointer.current.cy}px, 0) translate(-50%, -50%)`;
      }
    });
  };

  const stopFollow = () => {
    stopRef.current?.();
    stopRef.current = null;
  };

  const onMove = (e: React.PointerEvent) => {
    pointer.current.x = e.clientX;
    pointer.current.y = e.clientY;
  };

  const onEnter = (i: number, e: React.PointerEvent) => {
    // Jump the panel to the cursor on first entry so it does not fly in.
    if (hovered === null) {
      pointer.current.cx = e.clientX;
      pointer.current.cy = e.clientY;
    }
    setHovered(i);
    startFollow();
  };

  const onLeaveList = () => {
    setHovered(null);
    stopFollow();
  };

  return (
    <div className="relative" onPointerMove={onMove} onPointerLeave={onLeaveList}>
      {/* Floating preview — desktop only */}
      <div
        ref={previewRef}
        className="pointer-events-none fixed left-0 top-0 z-30 hidden h-[16rem] w-[22rem] overflow-hidden rounded-[3px] border border-line-strong lg:block"
        style={{
          borderColor: hovered !== null && projects[hovered]?.accent ? projects[hovered].accent! : undefined,
          boxShadow: hovered !== null && projects[hovered]?.accent ? `0 24px 80px -20px ${projects[hovered].accent}66` : undefined,
          opacity: hovered === null ? 0 : 1,
          scale: hovered === null ? "0.92" : "1",
          transition: "opacity 420ms var(--ease-expo), scale 620ms var(--ease-expo)",
        }}
        aria-hidden="true"
      >
        {projects.map((p, i) => (
          <div
            key={p.id}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: hovered === i ? 1 : 0 }}
          >
            {p.video ? <ReelPoster project={p} /> : <ProjectVisual slug={p.slug} cover={p.cover} />}
          </div>
        ))}
      </div>

      <ul className="border-t border-line">
        {projects.map((p, i) => (
          <li key={p.id} className="border-b border-line">
            <Link
              href={`/work/${p.slug}`}
              onPointerEnter={(e) => {
                onEnter(i, e);
                if (p.video) reel.warm(p);
              }}
              onFocus={() => p.video && reel.warm(p)}
              onClick={(e) => {
                if (!p.video || e.metaKey || e.ctrlKey || e.shiftKey) return;
                e.preventDefault();
                reel.open(p);
              }}
              className="group relative block py-9 md:py-12"
              data-reveal="up"
              style={{
                ["--reveal-delay" as string]: `${i * 70}ms`,
                // Each case study can carry its client's brand colour.
                ["--accent" as string]: p.accent ?? "var(--color-signal)",
              }}
            >
              {/* Hover wash, tinted with the project colour */}
              <span
                className="pointer-events-none absolute inset-x-[-1.5rem] inset-y-0 origin-left scale-x-0 bg-[color-mix(in_srgb,var(--accent)_7%,transparent)] transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none absolute inset-y-0 left-[-1.5rem] w-[2px] origin-top scale-y-0 bg-[var(--accent)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
                aria-hidden="true"
              />

              <div className="relative flex flex-col gap-6 transition-[padding] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:pl-3 lg:flex-row lg:items-center lg:gap-10">
                <span className="index w-10 shrink-0 pt-1 transition-colors duration-500 group-hover:text-[var(--accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {p.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.logo} alt={p.client} className="h-4 w-auto md:h-5" loading="lazy" />
                    ) : (
                      <span className="kicker">{p.client}</span>
                    )}
                    <span className="h-px w-4 bg-line-strong" aria-hidden="true" />
                    <span className="index">{p.industry}</span>
                  </div>

                  <h3 className="display-sm mt-3 max-w-3xl text-paper-80 transition-colors duration-500 group-hover:text-paper md:text-[1.75rem]">
                    {p.title}
                  </h3>

                  {p.video && (
                    <span className="index mt-4 inline-flex items-center gap-2 text-[var(--accent)]">
                      <svg viewBox="0 0 24 24" width="10" height="10" aria-hidden="true"><path d="M7 4v16l13-8z" fill="currentColor" /></svg>
                      Watch the 20s reel
                    </span>
                  )}

                  {/* Mobile artwork — the floating panel is desktop-only */}
                  <div className="mt-5 h-40 overflow-hidden rounded-[3px] border border-line lg:hidden">
                    {p.video ? (
                      <ReelPoster project={p} prompt="Tap to watch" />
                    ) : (
                      <ProjectVisual slug={p.slug} cover={p.cover} />
                    )}
                  </div>
                </div>

                {/* Fixed columns rather than wrapping flex, so the numbers line
                    up across every row however long the labels run. */}
                <div className="flex shrink-0 items-start gap-6 lg:w-[26rem]">
                  <div className="grid flex-1 grid-cols-2 gap-6">
                    {p.metrics.slice(0, 2).map((m) => (
                      <div key={m.label} className="lg:text-right">
                        <div
                          className="font-[family-name:var(--font-display)] text-lg leading-tight text-paper"
                          style={p.accent ? { color: p.accent } : undefined}
                        >
                          {m.value}
                        </div>
                        <div className="index mt-1 leading-snug">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <span className="index hidden w-10 shrink-0 pt-1 text-right lg:block">
                    {p.year}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <ReelLightbox warmed={reel.warmed} open={!!reel.project} onClose={reel.close} />
    </div>
  );
}
