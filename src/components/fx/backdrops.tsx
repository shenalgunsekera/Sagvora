/**
 * Generated SVG backdrops.
 *
 * All three are pure server-rendered SVG animated with CSS only — no runtime
 * JS, no layout cost, and they scale to any viewport. Geometry is produced by
 * a seeded PRNG so the server and client always agree on the markup.
 */

/** mulberry32 — tiny, deterministic, good enough for decorative geometry. */
function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ==========================================================================
   Circuit — orthogonal traces with travelling pulses.
   Used behind the five-stage ladder: discrete parts becoming a network.
   ========================================================================== */

type Trace = { d: string; nodes: [number, number][] };

function buildTraces(count: number, seed: number, w = 1200, h = 900): Trace[] {
  const rand = prng(seed);
  const traces: Trace[] = [];

  for (let i = 0; i < count; i++) {
    let x = 0;
    let y = Math.round(((i + 0.5) / count) * h + (rand() - 0.5) * 40);
    const points: [number, number][] = [[x, y]];
    const nodes: [number, number][] = [];

    while (x < w) {
      const run = 70 + Math.round(rand() * 190);
      x = Math.min(x + run, w);
      points.push([x, y]);

      if (x < w && rand() > 0.32) {
        const rise = (rand() > 0.5 ? 1 : -1) * (40 + Math.round(rand() * 110));
        y = Math.max(20, Math.min(h - 20, y + rise));
        points.push([x, y]);
        nodes.push([x, y]);
      }
    }

    traces.push({
      d: points.map((p, idx) => `${idx === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" "),
      nodes,
    });
  }
  return traces;
}

export function CircuitBackdrop({
  className = "",
  seed = 7,
  traces: traceCount = 9,
}: {
  className?: string;
  seed?: number;
  traces?: number;
}) {
  const traces = buildTraces(traceCount, seed);

  return (
    <svg
      className={`fx-loop pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 1200 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      // Edge fade as a CSS mask: an SVG <mask> re-composited the whole layer on
      // every frame of the pulse animation.
      style={{
        maskImage: "linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent)",
      }}
    >
      <g fill="none" strokeLinejoin="round" strokeLinecap="round">
        {/* Static traces */}
        {traces.map((t, i) => (
          <path key={`t${i}`} d={t.d} stroke="rgba(244,244,240,0.075)" strokeWidth="1" />
        ))}

        {/* Pulses. pathLength normalises every trace to 1000 units so one dash
            pattern and one keyframe work for all of them. Mostly cool — this is
            the machine running — with every third pulse warm so the two accents
            stay in conversation. */}
        {traces.map((t, i) => (
          <path
            key={`p${i}`}
            d={t.d}
            pathLength={1000}
            stroke={i % 3 === 0 ? "rgba(217,185,120,0.8)" : "rgba(166,200,232,0.85)"}
            strokeWidth="1.4"
            strokeDasharray="42 958"
            style={{
              animation: `dash-travel ${11 + (i % 5) * 3.5}s linear infinite`,
              animationDelay: `${-i * 2.3}s`,
            }}
          />
        ))}

        {/* Junction nodes */}
        {traces.flatMap((t, i) =>
          t.nodes.map((n, j) => (
            <circle
              key={`n${i}-${j}`}
              cx={n[0]}
              cy={n[1]}
              r="2.2"
              fill="rgba(244,244,240,0.5)"
              style={{
                animation: "pulse-node 4.5s ease-in-out infinite",
                animationDelay: `${((i * 7 + j * 3) % 20) * 0.31}s`,
              }}
            />
          )),
        )}
      </g>
    </svg>
  );
}

/* ==========================================================================
   Perspective grid — a floor receding to a horizon.
   Used behind the capabilities section.
   ========================================================================== */

export function PerspectiveGrid({ className = "" }: { className?: string }) {
  const W = 1200;
  const H = 600;
  const horizon = 90;
  const vanishing = W / 2;

  // Verticals converging on the vanishing point.
  const verticals = Array.from({ length: 25 }, (_, i) => {
    const t = i / 24;
    const xBottom = -W * 0.6 + t * W * 2.2;
    return { x1: vanishing, y1: horizon, x2: xBottom, y2: H };
  });

  // Horizontals with exponential spacing so they bunch toward the horizon.
  const horizontals = Array.from({ length: 18 }, (_, i) => {
    const t = i / 17;
    const y = horizon + Math.pow(t, 2.4) * (H - horizon);
    return { y, o: 0.03 + t * 0.09 };
  });

  return (
    <svg
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-full w-full ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="grid-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="grid-mask">
          <rect width={W} height={H} fill="url(#grid-fade)" />
        </mask>
      </defs>

      <g mask="url(#grid-mask)">
        {verticals.map((v, i) => (
          <line
            key={`v${i}`}
            x1={v.x1}
            y1={v.y1}
            x2={v.x2}
            y2={v.y2}
            stroke="rgba(244,244,240,0.07)"
            strokeWidth="1"
          />
        ))}
        {horizontals.map((h, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={h.y}
            x2={W}
            y2={h.y}
            stroke={`rgba(244,244,240,${h.o})`}
            strokeWidth="1"
          />
        ))}
        {/* The vanishing point glows cool — it is where the system is heading. */}
        <circle cx={vanishing} cy={horizon} r="70" fill="rgba(166,200,232,0.06)" />
        <circle cx={vanishing} cy={horizon} r="2.5" fill="rgba(166,200,232,0.8)" />
      </g>
    </svg>
  );
}

/* ==========================================================================
   Topographic rings — slowly rotating contour field.
   Used behind the contact section.
   ========================================================================== */

export function TopoRings({ className = "", seed = 21 }: { className?: string; seed?: number }) {
  const rand = prng(seed);
  const rings = Array.from({ length: 16 }, (_, i) => {
    const r = 60 + i * 34;
    const points = 60;
    const wobble = 6 + i * 1.9;
    const phase = rand() * Math.PI * 2;

    const d = Array.from({ length: points }, (_, p) => {
      const a = (p / points) * Math.PI * 2;
      const rr =
        r + Math.sin(a * 3 + phase) * wobble + Math.cos(a * 5 + phase * 1.7) * (wobble * 0.45);
      return `${p === 0 ? "M" : "L"}${(500 + Math.cos(a) * rr).toFixed(1)} ${(
        400 +
        Math.sin(a) * rr * 0.72
      ).toFixed(1)}`;
    }).join(" ");

    return { d: `${d} Z`, o: 0.055 - i * 0.0022, dur: 90 + i * 9 };
  });

  return (
    <svg
      className={`fx-loop pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 1000 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" style={{ transformOrigin: "500px 400px" }}>
        {rings.map((r, i) => (
          <path
            key={i}
            d={r.d}
            // Every fourth contour picks up the cool accent so the field has
            // depth without ever reading as a colour wash.
            stroke={
              i % 4 === 1
                ? `rgba(166,200,232,${Math.max(r.o * 1.5, 0.018)})`
                : `rgba(244,244,240,${Math.max(r.o, 0.012)})`
            }
            strokeWidth="1"
            style={{
              transformOrigin: "500px 400px",
              animation: `spin-slow ${r.dur}s linear infinite`,
              animationDirection: i % 2 ? "reverse" : "normal",
            }}
          />
        ))}
      </g>
    </svg>
  );
}
