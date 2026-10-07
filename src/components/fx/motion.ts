/**
 * Small motion primitives shared by every effect on the site.
 * Deliberately dependency-free — the animation vocabulary is ours, not a library's.
 */

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smootherstep — flatter at both ends than the classic smoothstep. */
export const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/** Map v from [inMin,inMax] to [outMin,outMax], clamped. */
export function mapRange(
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (inMax === inMin) return outMin;
  return outMin + (clamp((v - inMin) / (inMax - inMin)) * (outMax - outMin));
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** rAF loop that can be cancelled; callback receives seconds since last frame. */
export function raf(cb: (dt: number, t: number) => void): () => void {
  let id = 0;
  let last = performance.now();
  const start = last;
  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05); // clamp tab-switch spikes
    last = now;
    cb(dt, (now - start) / 1000);
    id = requestAnimationFrame(tick);
  };
  id = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(id);
}

/** Frame-rate independent smoothing factor for a lerp. */
export const damp = (dt: number, smoothing = 0.12) => 1 - Math.pow(1 - smoothing, dt * 60);

/**
 * Split a string into DOM-ready units with a stagger index.
 * `mode: "chars"` keeps whitespace as non-animating spacers.
 */
export function splitUnits(text: string, mode: "words" | "chars") {
  const raw = mode === "chars" ? Array.from(text) : text.split(/(\s+)/);
  let i = 0;
  return raw
    .filter((u) => u.length > 0)
    .map((value) => {
      const isSpace = /^\s+$/.test(value);
      return { value, isSpace, index: isSpace ? -1 : i++ };
    });
}

/** How far an element has travelled through the viewport, 0 → 1. */
export function viewportProgress(el: Element, offset = 0): number {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  return clamp((vh - r.top - offset) / (vh + r.height - offset * 2));
}
