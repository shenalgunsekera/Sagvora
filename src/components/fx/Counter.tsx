"use client";

import { useEffect, useRef, useState } from "react";
import { ease, prefersReducedMotion } from "./motion";

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
};

/**
 * Counts up once, the first time it enters the viewport.
 *
 * The server renders the real number, so crawlers, link previews and no-JS
 * visitors never read "0". Only a counter still below the fold is reset to 0
 * on mount and animated in; one already on screen (or scrolled past) just
 * shows its value.
 */
export default function Counter({
  value,
  prefix = "",
  suffix = "",
  duration = 1800,
  className = "",
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    setDisplay(value);
    if (prefersReducedMotion()) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already seen
    setDisplay(0);

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          setDisplay(Math.round(ease(t) * value));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
