import type { CSSProperties, ElementType } from "react";
import { splitUnits } from "./motion";

type Props = {
  text: string;
  as?: ElementType;
  mode?: "words" | "chars";
  className?: string;
  /** Extra delay before the stagger begins, in ms. */
  delay?: number;
  style?: CSSProperties;
};

/**
 * Renders text as individually masked units that slide up on reveal.
 * Runs at render time — no layout thrash, no flash of unsplit text, and the
 * original string stays intact for screen readers and copy/paste.
 */
export default function SplitText({
  text,
  as: Tag = "span",
  mode = "words",
  className = "",
  delay = 0,
  style,
}: Props) {
  const units = splitUnits(text, mode);

  return (
    <Tag
      className={`split ${mode === "chars" ? "split-chars" : ""} ${className}`}
      style={{ ...style, ["--split-delay" as string]: `${delay}ms` }}
    >
      <span aria-hidden="true">
        {units.map((u, i) =>
          u.isSpace ? (
            <span key={i}> </span>
          ) : (
            <span className="unit-mask" key={i}>
              <span className="unit" style={{ ["--i" as string]: u.index }}>
                {u.value}
              </span>
            </span>
          ),
        )}
      </span>
      <span className="sr-only">{text}</span>
    </Tag>
  );
}
