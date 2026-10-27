"use client";

import { useEffect, useState } from "react";

/**
 * Position dots for a `.swipe` row on phones. Hidden from `sm` up, where the
 * row is a grid again. Decorative: the cards themselves are the content.
 */
export default function SwipeDots({ target, count }: { target: string; count: number }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = document.getElementById(target);
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const first = el.firstElementChild as HTMLElement | null;
        if (!first) return;
        const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
        setActive(Math.min(count - 1, Math.round(el.scrollLeft / Math.max(1, step))));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [target, count]);

  return (
    <div className="swipe-dots mt-6 sm:hidden" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} data-on={i === active ? "" : undefined} />
      ))}
    </div>
  );
}
