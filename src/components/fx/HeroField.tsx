"use client";

import { useEffect, useRef } from "react";
import { clamp, damp, prefersReducedMotion, raf } from "./motion";

type Node = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  phase: number;
  energy: number;
};

/**
 * The hero's signal field: a lattice of nodes that breathes on its own and
 * bends away from the cursor, wiring itself together where the pointer passes.
 *
 * It is the site's central metaphor — an organisation of discrete parts that
 * only becomes a network when something moves through it.
 */
export default function HeroField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const SPACING = 38;
    const INFLUENCE = 190;

    let nodes: Node[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    // Canvas origin in page coordinates, so pointer moves never force a layout read.
    let pageLeft = 0;
    let pageTop = 0;

    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: 0 };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      pageLeft = rect.left + window.scrollX;
      pageTop = rect.top + window.scrollY;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      const offsetX = (width - (cols - 1) * SPACING) / 2;
      const offsetY = (height - (rows - 1) * SPACING) / 2;

      nodes = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * SPACING;
          const y = offsetY + r * SPACING;
          nodes.push({ x, y, ox: x, oy: y, phase: (c + r) * 0.35, energy: 0 });
        }
      }
    };

    build();

    const resize = new ResizeObserver(build);
    resize.observe(canvas);

    const onMove = (e: PointerEvent) => {
      pointer.tx = e.clientX + window.scrollX - pageLeft;
      pointer.ty = e.clientY + window.scrollY - pageTop;
      pointer.active = 1;
    };
    const onLeave = () => {
      pointer.active = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    // Once the hero is off-screen there is nothing to animate, so stop doing
    // per-frame work entirely rather than merely drawing something invisible.
    // A canvas quietly burning a rAF loop for the whole page is a battery leak.
    let onScreen = true;
    const visibility = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    visibility.observe(canvas);

    const stop = raf((dt, t) => {
      if (!onScreen || document.hidden) return;

      ctx.clearRect(0, 0, width, height);

      const k = damp(dt, 0.16);
      pointer.x += (pointer.tx - pointer.x) * k;
      pointer.y += (pointer.ty - pointer.y) * k;

      // Dim the whole field as the hero scrolls away.
      const scrolled = clamp(window.scrollY / Math.max(window.innerHeight, 1));
      const globalAlpha = 1 - scrolled * 0.9;
      if (globalAlpha <= 0.01) return;

      const lit: Node[] = [];
      // Batch nodes into one path per colour/alpha bucket: ~30 fills per frame
      // instead of one fill (and one colour-string parse) per node.
      const buckets = new Map<string, Path2D>();

      for (const n of nodes) {
        // Ambient drift keeps the lattice alive with no pointer at all.
        const drift = reduced ? 0 : Math.sin(t * 0.5 + n.phase) * 1.6;

        const dx = n.ox - pointer.x;
        const dy = n.oy - pointer.y;
        const dist = Math.hypot(dx, dy);
        const falloff = dist < INFLUENCE ? 1 - dist / INFLUENCE : 0;
        const push = falloff * falloff * pointer.active;

        const targetX = n.ox + (dx / (dist || 1)) * push * 26;
        const targetY = n.oy + (dy / (dist || 1)) * push * 26 + drift;

        n.x += (targetX - n.x) * damp(dt, 0.12);
        n.y += (targetY - n.y) * damp(dt, 0.12);
        n.energy += (push - n.energy) * damp(dt, 0.1);

        const alpha = (0.1 + n.energy * 0.75) * globalAlpha;
        if (alpha < 0.012) continue;

        const size = 1 + n.energy * 1.6;
        // Nodes warm to cool as they take on energy — dormant parts are neutral,
        // the ones carrying signal go pastel blue, and the very hottest tip gold.
        const rgb = n.energy > 0.78 ? "217, 185, 120" : n.energy > 0.32 ? "166, 200, 232" : "244, 244, 240";
        const key = `rgba(${rgb}, ${(Math.round(alpha * 40) / 40).toFixed(3)})`;
        let path = buckets.get(key);
        if (!path) buckets.set(key, (path = new Path2D()));
        path.moveTo(n.x + size, n.y);
        path.arc(n.x, n.y, size, 0, Math.PI * 2);

        if (n.energy > 0.22) lit.push(n);
      }

      for (const [style, path] of buckets) {
        ctx.fillStyle = style;
        ctx.fill(path);
      }

      // Wire together only the nodes the pointer has energised.
      ctx.lineWidth = 0.6;
      for (let i = 0; i < lit.length; i++) {
        for (let j = i + 1; j < lit.length; j++) {
          const a = lit[i];
          const b = lit[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > SPACING * 1.55) continue;
          const strength = Math.min(a.energy, b.energy) * (1 - d / (SPACING * 1.55));
          ctx.strokeStyle = `rgba(166, 200, 232, ${strength * 0.42 * globalAlpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    });

    return () => {
      stop();
      resize.disconnect();
      visibility.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
