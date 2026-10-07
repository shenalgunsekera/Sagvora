/**
 * Line glyphs for capabilities. Drawn on a 40×40 grid with a single 1px
 * stroke so they sit at the same optical weight as the hairline rules.
 * Each one has a part that reacts when its card is hovered.
 */

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const glyphs: Record<string, React.ReactNode> = {
  // Workflow forensics — a frame with a scanning line
  scan: (
    <>
      <path {...S} d="M4 11V5h6M30 5h6v6M36 29v6h-6M10 35H4v-6" />
      <rect {...S} x="12" y="13" width="16" height="14" />
      <line
        {...S}
        x1="12"
        y1="20"
        x2="28"
        y2="20"
        stroke="var(--color-signal)"
        className="origin-center transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[5px]"
      />
    </>
  ),

  // Process automation — sequential blocks
  flow: (
    <>
      <rect {...S} x="3" y="15" width="10" height="10" />
      <rect {...S} x="27" y="15" width="10" height="10" />
      <path
        {...S}
        d="M13 20h14"
        className="transition-all duration-700 group-hover:[stroke-dasharray:2_3]"
      />
      <path {...S} d="M23 16.5 27 20l-4 3.5" />
      <circle {...S} cx="20" cy="9" r="2.5" stroke="var(--color-signal)" />
      <path {...S} d="M20 11.5V15" opacity="0.5" />
    </>
  ),

  // Integration — a small network
  nodes: (
    <>
      <circle {...S} cx="20" cy="20" r="3.5" stroke="var(--color-signal)" />
      <circle {...S} cx="7" cy="9" r="2.5" />
      <circle {...S} cx="33" cy="9" r="2.5" />
      <circle {...S} cx="7" cy="31" r="2.5" />
      <circle {...S} cx="33" cy="31" r="2.5" />
      <g
        {...S}
        opacity="0.55"
        className="transition-opacity duration-700 group-hover:opacity-100"
      >
        <path d="M9.2 10.6 17.3 18M30.8 10.6 22.7 18M9.2 29.4l8.1-7.4M30.8 29.4l-8.1-7.4" />
      </g>
    </>
  ),

  // Copilot — human and machine side by side
  assist: (
    <>
      <circle {...S} cx="14" cy="14" r="5" />
      <path {...S} d="M5 33c0-5 4-8 9-8s9 3 9 8" />
      <rect
        {...S}
        x="24"
        y="18"
        width="13"
        height="13"
        rx="2"
        stroke="var(--color-cool)"
        className="origin-center transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-[3px]"
      />
      <path {...S} d="M28 24.5h5M28 27.5h3" opacity="0.6" />
    </>
  ),

  // Document intelligence
  doc: (
    <>
      <path {...S} d="M9 4h14l8 8v24H9z" />
      <path {...S} d="M23 4v8h8" />
      <path {...S} d="M14 20h12M14 25h12" opacity="0.55" />
      <path
        {...S}
        d="M14 30h7"
        stroke="var(--color-cool)"
        className="origin-left transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-[1.6]"
      />
    </>
  ),

  // Autonomous agent — a core with an orbit
  agent: (
    <>
      <path {...S} d="M20 5.5 32.6 12.8v14.4L20 34.5 7.4 27.2V12.8z" />
      <circle {...S} cx="20" cy="20" r="4" stroke="var(--color-cool)" />
      <circle
        {...S}
        cx="20"
        cy="20"
        r="9"
        opacity="0.4"
        strokeDasharray="2 4"
        className="origin-center transition-transform duration-[1400ms] ease-linear group-hover:rotate-180"
      />
    </>
  ),

  // AI department — a supervised team
  dept: (
    <>
      <rect {...S} x="15" y="3" width="10" height="8" rx="1.5" stroke="var(--color-cool)" />
      <rect {...S} x="3" y="26" width="10" height="8" rx="1.5" />
      <rect {...S} x="15" y="26" width="10" height="8" rx="1.5" />
      <rect {...S} x="27" y="26" width="10" height="8" rx="1.5" />
      <path
        {...S}
        d="M20 11v8M8 26v-7h24v7M20 19v7"
        opacity="0.5"
        className="transition-opacity duration-700 group-hover:opacity-100"
      />
    </>
  ),

  // Continuous evolution — a loop that never closes
  loop: (
    <>
      <path
        {...S}
        d="M33 20a13 13 0 1 1-4.2-9.6"
        className="origin-center transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[120deg]"
      />
      <path {...S} d="M29 4v7h-7" stroke="var(--color-cool)" />
      <circle {...S} cx="20" cy="20" r="3" opacity="0.6" />
    </>
  ),

  // Fallback
  grid: (
    <g {...S}>
      {[8, 20, 32].map((y) =>
        [8, 20, 32].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />),
      )}
    </g>
  ),
};

export const GLYPH_KEYS = Object.keys(glyphs);

export default function Glyph({
  name,
  className = "",
  size = 40,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {glyphs[name] ?? glyphs.grid}
    </svg>
  );
}
