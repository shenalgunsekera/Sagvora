"use client";

import { useEffect } from "react";
import { clamp, damp, prefersReducedMotion, raf } from "./motion";

/**
 * One observer, one rAF loop, one pointer listener for the whole document.
 *
 * Responsibilities
 *  1. Reveal `[data-reveal]` and `.split` elements as they enter the viewport.
 *  2. Publish scroll progress as `--scroll` on `[data-scroll-progress]` elements.
 *     Scoped on purpose: a custom property on <html> inherits into every node,
 *     so writing it there forced a style recalc of the whole page every frame.
 *  3. Drive `[data-magnetic]` elements toward the cursor.
 *  4. Keep `--vh` accurate on mobile browsers with collapsing chrome.
 *  5. Pause infinite `.fx-loop` animations while they are off-screen.
 *
 * A MutationObserver re-scans on route changes, so client navigation gets the
 * same treatment as a fresh load without any per-page wiring.
 */
export default function MotionRoot() {
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const root = document.documentElement;

    /* ---------------------------------------------------------- viewport unit */
    const setVh = () => root.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    setVh();
    window.addEventListener("resize", setVh);

    /* ---------------------------------------------------------- reveals */
    const seen = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    /* ---------------------------------------------------------- off-screen loops */
    const loops = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) el.dataset.live = "";
          else delete el.dataset.live;
        }
      },
      { rootMargin: "120px 0px" },
    );

    let magnets: HTMLElement[] = [];
    let meters: HTMLElement[] = [];

    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal], .split").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (reduced) {
          el.classList.add("is-in");
          return;
        }
        observer.observe(el);
      });
      document.querySelectorAll<HTMLElement>(".fx-loop").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        loops.observe(el);
      });
      magnets = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
      meters = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-progress]"));
    };

    scan();

    // Coalesce DOM churn into one re-scan per frame instead of one per mutation.
    let scanRaf = 0;
    const mutation = new MutationObserver(() => {
      if (scanRaf) return;
      scanRaf = requestAnimationFrame(() => {
        scanRaf = 0;
        scan();
      });
    });
    mutation.observe(document.body, { childList: true, subtree: true });

    /* ---------------------------------------------------------- scroll progress */
    // Frames the magnet solver keeps running after the last pointer/scroll input.
    let settle = 0;
    let scrollRaf = 0;
    const onScroll = () => {
      settle = 90;
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = String(max > 0 ? clamp(window.scrollY / max) : 0);
        for (const m of meters) m.style.setProperty("--scroll", progress);
        const scrolled = window.scrollY > 24 ? "true" : "false";
        if (root.dataset.scrolled !== scrolled) root.dataset.scrolled = scrolled;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const cleanup = () => {
      observer.disconnect();
      loops.disconnect();
      mutation.disconnect();
      cancelAnimationFrame(scanRaf);
      cancelAnimationFrame(scrollRaf);
      window.removeEventListener("resize", setVh);
      window.removeEventListener("scroll", onScroll);
    };

    /* ---------------------------------------------------------- magnetic */
    if (reduced) return cleanup;

    const pointer = { x: -9999, y: -9999 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      settle = 90;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const state = new WeakMap<HTMLElement, { x: number; y: number }>();

    const stop = raf((dt) => {
      // Idle when nothing moved recently — no per-frame layout reads at rest.
      if (document.hidden || magnets.length === 0 || settle <= 0) return;
      settle--;

      const k = damp(dt, 0.14);
      // Read every rect first, then write. Interleaving the two forced a
      // synchronous layout per magnet per frame.
      const rects = magnets.map((el) => el.getBoundingClientRect());

      for (let i = 0; i < magnets.length; i++) {
        const el = magnets[i];
        const rect = rects[i];
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;

        const strength = Number(el.dataset.magnetic) || 0.35;
        const cur = state.get(el) ?? { x: 0, y: 0 };
        // The rect includes the current offset; measure from the resting centre.
        const cx = rect.left + rect.width / 2 - cur.x;
        const cy = rect.top + rect.height / 2 - cur.y;
        const radius = Math.max(rect.width, rect.height) * 1.1 + 40;
        const dx = pointer.x - cx;
        const dy = pointer.y - cy;
        const dist = Math.hypot(dx, dy);

        const pull = dist < radius ? 1 - dist / radius : 0;
        const targetX = dx * strength * pull;
        const targetY = dy * strength * pull;
        if (targetX === 0 && targetY === 0 && cur.x === 0 && cur.y === 0) continue;

        cur.x += (targetX - cur.x) * k;
        cur.y += (targetY - cur.y) * k;
        if (Math.abs(cur.x) < 0.05 && Math.abs(cur.y) < 0.05) cur.x = cur.y = 0;
        state.set(el, cur);

        el.style.transform =
          cur.x === 0 && cur.y === 0
            ? ""
            : `translate3d(${cur.x.toFixed(2)}px, ${cur.y.toFixed(2)}px, 0)`;
      }
    });

    return () => {
      cleanup();
      stop();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return null;
}
