"use client";

import { useEffect, useRef, useState } from "react";
import { ease, prefersReducedMotion } from "./motion";

const COLUMNS = 6;

/**
 * First-visit curtain: a counter runs to 100 while the page settles, then the
 * curtain leaves as six columns with a staggered lift. Shown once per tab
 * session so navigating back to the home page is never punished.
 *
 * The curtain is part of the server HTML so it covers the very first paint —
 * rendering it only after hydration let the bare page flash first. The inline
 * PRELOADER_GATE script decides before paint whether it is shown at all.
 */

/** Runs inline before first paint: hides the curtain on repeat visits. */
export const PRELOADER_GATE = `try{var s=sessionStorage.getItem("sagvora:intro")==="seen"||matchMedia("(prefers-reduced-motion: reduce)").matches;document.documentElement.dataset.intro=s?"skip":"play";if(!s)document.body.dataset.locked="true"}catch(e){document.documentElement.dataset.intro="skip"}`;
export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const frame = useRef(0);

  useEffect(() => {
    const skip =
      prefersReducedMotion() || sessionStorage.getItem("sagvora:intro") === "seen";

    if (skip) {
      setGone(true);
      document.body.dataset.locked = "false";
      return;
    }

    document.body.dataset.locked = "true";

    const DURATION = 1700;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      setProgress(Math.round(ease(t) * 100));

      if (t < 1) {
        frame.current = requestAnimationFrame(tick);
        return;
      }
      sessionStorage.setItem("sagvora:intro", "seen");
      setLeaving(true);
      document.body.dataset.locked = "false";
      window.setTimeout(() => setGone(true), 1400);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, []);

  if (gone) return null;

  return (
    <div
      className="preloader fixed inset-0 z-[100] pointer-events-none"
      aria-hidden="true"
      data-leaving={leaving}
    >
      {/* Curtain columns */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: COLUMNS }).map((_, i) => (
          <div
            key={i}
            className="h-full flex-1 bg-ink-0 transition-transform duration-[1100ms]"
            style={{
              transitionTimingFunction: "cubic-bezier(0.83, 0, 0.17, 1)",
              transitionDelay: `${i * 55}ms`,
              transform: leaving ? "translate3d(0, -101%, 0)" : "none",
            }}
          />
        ))}
      </div>

      {/* Content sits above the columns and fades first */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-8 transition-opacity duration-500"
        style={{ opacity: leaving ? 0 : 1 }}
      >
        <div className="flex items-end gap-4">
          <span
            className="wordmark text-[clamp(2.5rem,9vw,6rem)] text-paper"
            style={{ fontVariationSettings: '"wdth" 70' }}
          >
            Sagvora
          </span>
        </div>

        <div className="flex w-[min(22rem,70vw)] flex-col gap-3">
          <div className="h-px w-full bg-line-strong">
            <div
              className="h-px"
              style={{
                width: `${progress}%`,
                transition: "width 90ms linear",
                background:
                  "linear-gradient(90deg, var(--color-signal), var(--color-cool))",
              }}
            />
          </div>
          <div className="flex justify-between kicker">
            <span>Business Transformation</span>
            <span className="tabular-nums text-paper-60">
              {String(progress).padStart(3, "0")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
