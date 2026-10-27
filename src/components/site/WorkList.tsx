"use client";

import Link from "next/link";
import ProjectVisual from "./ProjectVisual";
import { ReelLightbox, ReelPoster, useReel } from "./Reel";
import type { Project } from "@/lib/types";

/**
 * Case studies as feature cards: artwork on one side, the story and its
 * numbers on the other, alternating down the page. Each card wears its
 * client's brand colour. Projects with a showreel play it in a lightbox; the
 * video starts buffering as soon as the visitor shows interest (hover/focus).
 */
export default function WorkList({ projects }: { projects: Project[] }) {
  const reel = useReel();

  return (
    <div className="flex flex-col gap-20 md:gap-32">
      {projects.map((p, i) => {
        const flip = i % 2 === 1;
        const accent = p.accent ?? "var(--color-signal)";
        return (
          <article
            key={p.id}
            className="grid items-center gap-7 lg:grid-cols-12 lg:gap-14"
            style={{ ["--accent" as string]: accent }}
            data-reveal="up"
          >
            {/* Artwork */}
            <div className={`lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
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
            <div className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="index text-[var(--accent)]">{String(i + 1).padStart(2, "0")}</span>
                {p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo} alt={p.client} className="h-5 w-auto md:h-6" loading="lazy" />
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

              {p.tags.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2" aria-label="Scope">
                  {p.tags.map((t) => (
                    <li
                      key={t}
                      className="index rounded-full border border-line-strong px-3 py-1.5 text-paper-60"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
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

      <ReelLightbox warmed={reel.warmed} open={!!reel.project} onClose={reel.close} />
    </div>
  );
}
