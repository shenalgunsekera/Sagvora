import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Seconds for one full pass. Larger = slower. */
  duration?: number;
  reverse?: boolean;
  className?: string;
};

/**
 * Seamless horizontal loop. The track holds two identical halves and shifts by
 * exactly -50%, so there is never a visible seam. Pauses on hover.
 */
export default function Marquee({
  children,
  duration = 42,
  reverse = false,
  className = "",
}: Props) {
  return (
    <div className={`fx-loop relative overflow-hidden ${className}`} aria-hidden="true">
      <div
        className="marquee"
        style={{
          ["--marquee-duration" as string]: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0">{children}</div>
      </div>
    </div>
  );
}
