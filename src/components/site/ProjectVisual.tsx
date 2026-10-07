/**
 * Cover art for a case study.
 *
 * If the record has an uploaded cover we show it. If it does not, we generate a
 * deterministic diagram from the slug — a "before" column of scattered manual
 * steps resolving into an "after" column of ordered ones. Every project gets a
 * distinct, on-brand image without anyone opening a design tool.
 */

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function ProjectVisual({
  slug,
  cover,
  alt,
  className = "",
}: {
  slug: string;
  cover?: string | null;
  alt?: string;
  className?: string;
}) {
  if (cover) {
    // Plain <img>: uploads are already sized and this component is rendered
    // inside client-side hover previews where the optimizer adds no value.
    // width/height are declared so the browser reserves the box before the
    // bytes land — without them every cover contributes layout shift.
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={cover}
        alt={alt ?? ""}
        width={1920}
        height={1080}
        className={`h-full w-full object-cover ${className}`}
        loading="lazy"
        decoding="async"
      />
    );
  }

  const rand = prng(hash(slug));
  const rows = 9;

  // Left: scattered. Right: aligned. The arcs are the transformation.
  const left = Array.from({ length: rows }, (_, i) => ({
    y: 40 + i * 26,
    x: 40 + rand() * 90,
    w: 22 + rand() * 76,
  }));
  const right = Array.from({ length: rows }, (_, i) => ({
    y: 40 + i * 26,
    x: 300,
    w: 92,
  }));

  return (
    <div className={`relative h-full w-full overflow-hidden bg-ink-1 ${className}`}>
      <svg
        viewBox="0 0 440 300"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`pv-${slug}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#16161c" />
            <stop offset="100%" stopColor="#0b0b0e" />
          </linearGradient>
        </defs>

        <rect width="440" height="300" fill={`url(#pv-${slug})`} />

        {/* Connective arcs */}
        {left.map((l, i) => (
          <path
            key={`a${i}`}
            d={`M${l.x + l.w} ${l.y + 4} C 240 ${l.y + 4}, 250 ${right[i].y + 4}, ${right[i].x} ${
              right[i].y + 4
            }`}
            fill="none"
            stroke="rgba(244,244,240,0.09)"
            strokeWidth="1"
          />
        ))}

        {/* Manual steps */}
        {left.map((l, i) => (
          <rect
            key={`l${i}`}
            x={l.x}
            y={l.y}
            width={l.w}
            height="8"
            rx="1"
            fill="rgba(244,244,240,0.16)"
          />
        ))}

        {/* Ordered output — the systematised side reads cool. */}
        {right.map((r, i) => (
          <rect
            key={`r${i}`}
            x={r.x}
            y={r.y}
            width={r.w}
            height="8"
            rx="1"
            fill={
              i % 4 === 0
                ? "rgba(217,185,120,0.5)"
                : i % 2 === 0
                  ? "rgba(166,200,232,0.55)"
                  : "rgba(166,200,232,0.3)"
            }
          />
        ))}

        <line x1="270" y1="24" x2="270" y2="276" stroke="rgba(244,244,240,0.08)" strokeWidth="1" />
      </svg>
    </div>
  );
}
