"use client";

import { useEffect, useRef, useState } from "react";
import type { Testimonial } from "@/lib/types";

const DWELL = 7000;

/**
 * Testimonial rotator. Quotes cross-dissolve with a small vertical offset and
 * the progress ring shows how long the current one has left. Pauses on hover
 * and whenever the section is off-screen.
 */
export default function Voices({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [visible, setVisible] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef<HTMLElement>(null);

  // Hovering pauses; the button latches it off. WCAG 2.2.2 wants a real
  // mechanism to stop moving content, and hover is not one on a touch screen.
  const paused = hovering || stopped;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (items.length < 2 || paused || !visible) return;
    const started = performance.now() - elapsed;
    let frame = 0;

    const tick = (now: number) => {
      const e = now - started;
      if (e >= DWELL) {
        setIndex((i) => (i + 1) % items.length);
        setElapsed(0);
        return;
      }
      setElapsed(e);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // `elapsed` intentionally omitted: including it would restart the loop on
    // every frame. It is read once when the loop (re)starts after a pause.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, visible, items.length]);

  if (items.length === 0) return null;

  const go = (i: number) => {
    setIndex((i + items.length) % items.length);
    setElapsed(0);
  };

  const ringLength = 2 * Math.PI * 15;
  const progress = Math.min(elapsed / DWELL, 1);

  return (
    <section
      ref={ref}
      className="section relative overflow-clip"
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      aria-roledescription="carousel"
      aria-label="Client testimonials"
    >
      <div className="shell relative">
        <div className="flex items-baseline gap-5">
          <span className="index" data-reveal="fade">
            05
          </span>
          <span className="kicker" data-reveal="fade">
            Voices
          </span>
        </div>
        <div className="mt-5 h-px w-full bg-line" data-reveal="rule" />

        {/* Quote stack. All quotes occupy the same grid cell, so the container
            grows to the tallest one instead of clipping or overlapping the
            controls the way a fixed height would. */}
        {/* Live only while rotation is stopped. An auto-rotating live region
            interrupts a screen reader every few seconds; once the reader has
            taken control, announcing the change is what they want. */}
        <div
          className="mt-16 grid"
          aria-live={paused ? "polite" : "off"}
          aria-atomic="true"
        >
          {items.map((t, i) => (
            <blockquote
              key={t.id}
              className="col-start-1 row-start-1 flex flex-col justify-between"
              style={{
                opacity: i === index ? 1 : 0,
                transform: i === index ? "translateY(0)" : "translateY(1.25rem)",
                transition:
                  "opacity 700ms var(--ease-expo), transform 900ms var(--ease-expo)",
                pointerEvents: i === index ? "auto" : "none",
              }}
              aria-hidden={i !== index}
            >
              <p className="display-md max-w-5xl text-paper">
                <span className="text-signal">“</span>
                {t.quote}
                <span className="text-signal">”</span>
              </p>

              <footer className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="kicker text-paper">{t.author}</span>
                {t.company && (
                  <>
                    <span className="h-px w-5 bg-line-strong" aria-hidden="true" />
                    <span className="index">{t.company}</span>
                  </>
                )}
                {t.role && <span className="index opacity-60">{t.role}</span>}
              </footer>
            </blockquote>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-14 flex items-center justify-between border-t border-line pt-6">
          <div className="flex items-center gap-3">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show testimonial ${i + 1}`}
                aria-current={i === index}
                className="group py-2"
              >
                <span
                  className="block h-px transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    width: i === index ? "2.5rem" : "1rem",
                    background:
                      i === index ? "var(--color-signal)" : "var(--color-line-strong)",
                  }}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setStopped((v) => !v)}
              aria-pressed={stopped}
              className="index flex items-center gap-2 px-1 py-2 transition-colors duration-300 hover:text-paper"
            >
              <span aria-hidden="true">{stopped ? "▶" : "❚❚"}</span>
              {stopped ? "Play" : "Pause"}
            </button>

            {/* Countdown ring */}
            <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
              <circle cx="17" cy="17" r="15" fill="none" stroke="var(--color-line)" strokeWidth="1" />
              <circle
                cx="17"
                cy="17"
                r="15"
                fill="none"
                stroke="var(--color-signal)"
                strokeWidth="1"
                strokeDasharray={ringLength}
                strokeDashoffset={ringLength * (1 - progress)}
                transform="rotate(-90 17 17)"
              />
            </svg>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous testimonial"
                className="flex h-10 w-10 items-center justify-center border border-line transition-colors duration-500 hover:border-paper-30"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next testimonial"
                className="flex h-10 w-10 items-center justify-center border border-line transition-colors duration-500 hover:border-paper-30"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
