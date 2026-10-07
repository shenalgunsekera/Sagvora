"use client";

import { useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Degrees of tilt at the card's corners. 0 disables tilt. */
  tilt?: number;
};

/**
 * Card surface that tracks the pointer: a soft light follows the cursor and
 * the plane tips very slightly toward it. Everything is written to CSS custom
 * properties, so styling stays in the stylesheet.
 */
export default function SheenCard({ children, className = "", tilt = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;

    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);

    if (tilt > 0) {
      el.style.transform = `perspective(1100px) rotateX(${(0.5 - py) * tilt}deg) rotateY(${
        (px - 0.5) * tilt
      }deg)`;
    }
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    if (tilt > 0) el.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`sheen ${className}`}
      style={{ transition: "transform 700ms var(--ease-expo)" }}
    >
      {children}
    </div>
  );
}
