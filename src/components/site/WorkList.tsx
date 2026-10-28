"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import ProjectVisual from "./ProjectVisual";
import { ReelLightbox, ReelPoster, useReel } from "./Reel";
import type { Project } from "@/lib/types";

/**
 * Case studies as a slider: one project at a time, full width, artwork on one
 * side and the story and its numbers on the other. Arrows, the client tabs,
 * the keyboard (← →) and a swipe on touch all move between them. Every slide
 * stays in the page (inactive ones are `hidden`) so each case-study link is
 * still crawlable. Showreels play in a lightbox; the video starts buffering
 * as soon as the visitor shows interest (hover/focus).
 */
export default function WorkList({ projects }: { projects: Project[] }) {
  const reel = useReel();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const touch = useRef<{ x: number; y: number } | null>(null);
  const count = projects.length;

  const go = useCallback(
    (to: number, d?: "next" | "prev") => {
      const next = (to + count) % count;
      setDir(d ?? (next > index ? "next" : "prev"));
      setIndex(next);
    },
    [count, index],
  );

  const arrow = (d: "next" | "prev") => (
    <button
      type="button"
      onClick={() => go(index + (d === "next" ? 1 : -1), d)}
      aria-label={d === "next" ? "Next project" : "Previous project"}
      aria-controls="work-slides"
      className="work-arrow"
    >
      <span aria-hidden="true">{d === "next" ? "→" : "←"}</span>
    </button>
  );

  return (
    <div data-reveal="up">
      {/* Controls: client tabs on the left, counter + arrows on the right. */}
      {count > 1 && (
        <div className="mb-8 flex items-center justify-between gap-6 border-b border-line pb-5 md:mb-12">
          <div className="work-tabs" role="tablist" aria-label="Projects">
            {projects.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-controls={`work-slide-${p.id}`}
                onClick={() => go(i)}
                className="work-tab index"
                style={{ ["--accent" as string]: p.accent ?? "var(--color-signal)" }}
              >
                {p.client}
              </button>
            ))}
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-4">
            <span className="index tabular-nums text-paper-45" aria-live="polite">
              <span className="text-paper">{String(index + 1).padStart(2, "0")}</span> / {String(count).padStart(2, "0")}
            </span>
            <div className="flex gap-2">
              {arrow("prev")}
              {arrow("next")}
            </div>
          </div>
        </div>
      )}

      <div
        id="work-slides"
        data-dir={dir}
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(index + 1, "next");
          if (e.key === "ArrowLeft") go(index - 1, "prev");
        }}
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={(e) => {
          const t = touch.current;
          touch.current = null;
          if (!t || count < 2) return;
          const dx = e.changedTouches[0].clientX - t.x;
          const dy = e.changedTouches[0].clientY - t.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) go(index + (dx < 0 ? 1 : -1), dx < 0 ? "next" : "prev");
        }}
      >
        {projects.map((p, i) => {
          const accent = p.accent ?? "var(--color-signal)";
          return (
            <article
              key={p.id}
              id={`work-slide-${p.id}`}
              role="tabpanel"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${p.client}`}
              hidden={i !== index}
              className="work-slide grid items-center gap-7 lg:grid-cols-12 lg:gap-14"
              style={{ ["--accent" as string]: accent }}
            >
              {/* Artwork */}
              <div className="lg:col-span-7">
                {p.video ? (
                  <button
                    type="button"
                    onClick={() => reel.open(p)}
                    onPointerEnter={() => reel.warm(p)}
                    onFocus={() => reel.warm(p)}
                    aria-label={`Play the ${p.client} showreel`}
                    className="work-media group/reel block aspect-video w-full overflow-hidden rounded-[6px] text-left"
                  >
                    <ReelPoster project={p} />
                  </button>
                ) : (
                  <Link
                    href={`/work/${p.slug}`}
                    className="work-media block aspect-video w-full overflow-hidden rounded-[6px]"
                    aria-label={p.title}
                  >
                    <ProjectVisual slug={p.slug} cover={p.cover} alt={p.title} />
                  </Link>
                )}
              </div>

              {/* Story */}
              <div className="lg:col-span-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="index text-[var(--accent)]">{String(i + 1).padStart(2, "0")}</span>
                  {p.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logo} alt={p.client} className="h-5 w-auto max-w-[11rem] object-contain object-left md:h-6" loading="lazy" />
                  ) : (
                    <span className="kicker">{p.client}</span>
                  )}
                  <span className="h-px w-5 bg-line-strong" aria-hidden="true" />
                  <span className="index">{p.industry}</span>
                  {p.year && <span className="index">{p.year}</span>}
                </div>

                <h3 className="display-md mt-5 leading-[1.05] text-paper md:mt-8">{p.title}</h3>
                <p className="mt-4 leading-relaxed text-paper-60 md:mt-6">{p.summary}</p>

                {p.metrics.length > 0 && (
                  <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5 md:mt-8 md:pt-6">
                    {p.metrics.slice(0, 3).map((m) => (
                      <div key={m.label}>
                        <dt className="sr-only">{m.label}</dt>
                        <dd className="font-[family-name:var(--font-display)] text-[clamp(1.6rem,3vw,2.25rem)] font-bold leading-none tracking-[-0.03em] text-[var(--accent)]">
                          {m.value}
                        </dd>
                        <dd className="index mt-2 leading-snug" aria-hidden="true">
                          {m.label}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                <div className="btn-row mt-8 flex flex-wrap gap-3 md:mt-9">
                  {p.video && (
                    <button
                      type="button"
                      onClick={() => reel.open(p)}
                      onPointerEnter={() => reel.warm(p)}
                      onFocus={() => reel.warm(p)}
                      className="btn btn-solid"
                    >
                      <span>Watch the reel</span>
                      <span className="btn-arrow">▶</span>
                    </button>
                  )}
                  <Link href={`/work/${p.slug}`} className="btn">
                    <span>Read the case study</span>
                    <span className="btn-arrow">→</span>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <ReelLightbox warmed={reel.warmed} open={!!reel.project} onClose={reel.close} />
    </div>
  );
}
