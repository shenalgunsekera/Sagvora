"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/lib/types";

/**
 * Showreels for case studies that have one.
 *
 * Loading is staged so the page never pays for video it does not play:
 *   rest   → only the poster (a ~40 KB WebP) is on the page.
 *   hover  → `warm()` mounts a hidden <video preload="auto"> so the file starts
 *            buffering while the visitor decides.
 *   click  → the same element is shown and played; usually already buffered.
 *
 * Portrait screens get the 9:16 cut, everything else the 16:9 one. Both live
 * next to the 16:9 file the project record points at.
 */

export const verticalOf = (src: string) => src.replace(/-16x9\.mp4$/, "-9x16.mp4");
export const posterOf = (src: string) => src.replace(/reel-16x9\.mp4$/, "poster.webp");

const pickSource = (src: string) =>
  typeof window !== "undefined" && window.matchMedia("(orientation: portrait)").matches
    ? verticalOf(src)
    : src;

export function useReel() {
  const [project, setProject] = useState<Project | null>(null);
  const [warmed, setWarmed] = useState<Project | null>(null);
  const warm = useCallback((p: Project) => setWarmed((w) => (w?.id === p.id ? w : p)), []);
  const open = useCallback((p: Project) => {
    setWarmed(p);
    setProject(p);
  }, []);
  const close = useCallback(() => setProject(null), []);
  return { project, warmed, warm, open, close };
}

export function ReelLightbox({
  warmed,
  open,
  onClose,
}: {
  warmed: Project | null;
  open: boolean;
  onClose: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  // Resolve the cut once per warmed project (orientation is a client-only fact).
  useEffect(() => {
    setSrc(warmed?.video ? pickSource(warmed.video) : null);
  }, [warmed]);

  useEffect(() => {
    const v = video.current;
    if (!open) {
      v?.pause();
      return;
    }
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.dataset.locked = "true";
    closeBtn.current?.focus({ preventScroll: true });
    if (v) {
      v.currentTime = 0;
      void v.play().catch(() => {
        // Autoplay with sound can be refused; fall back to muted playback.
        v.muted = true;
        void v.play();
      });
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.dataset.locked = "false";
      prevFocus?.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!warmed?.video || !src) return null;
  const portrait = src !== warmed.video;

  // Portalled to <body>: reveal wrappers use clip-path/transform, which would
  // otherwise clip or re-anchor a fixed overlay rendered inside them.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${warmed.client} showreel`}
      aria-hidden={!open}
      className="reel-lightbox fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-10"
      style={{ ["--accent" as string]: warmed.accent ?? "var(--color-signal)" }}
      data-open={open}
      onClick={onClose}
    >
      <div
        className="reel-stage relative flex max-h-full flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={video}
          src={src}
          poster={posterOf(warmed.video)}
          preload="auto"
          playsInline
          controls={open}
          className="reel-video block rounded-[4px] bg-ink-1"
          style={
            portrait
              ? { height: "min(78vh, 160vw)", aspectRatio: "9 / 16" }
              : { width: "min(88vw, 138vh)", aspectRatio: "16 / 9" }
          }
          tabIndex={open ? 0 : -1}
        />
        <div className="mt-5 flex w-full items-center justify-between gap-6">
          <Link
            href={`/work/${warmed.slug}`}
            className="index link-wipe text-paper-80"
            tabIndex={open ? 0 : -1}
            onClick={onClose}
          >
            Read the case study →
          </Link>
          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            className="index text-paper-80 transition-colors hover:text-signal"
            tabIndex={open ? 0 : -1}
          >
            Close ✕
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Poster with a play affordance. Hover warms the video; click opens it. */
export function ReelPoster({
  project,
  onWarm,
  onOpen,
  className = "",
  prompt = "Click to watch",
  button = true,
}: {
  project: Project;
  onWarm?: () => void;
  onOpen?: () => void;
  className?: string;
  prompt?: string;
  /** Off where the site cursor already shows a PLAY disc over the poster. */
  button?: boolean;
}) {
  return (
    <div
      className={`reel-poster group/reel relative h-full w-full overflow-hidden ${className}`}
      onPointerEnter={onWarm}
      onFocus={onWarm}
      onClick={onOpen}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterOf(project.video!)}
        alt={`${project.client} showreel`}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/reel:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <span className="index absolute left-4 top-3 text-paper-60">0:20 · Showreel</span>
      {button ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <span className="reel-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>
          </span>
          <span className="reel-prompt index">{prompt}</span>
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-4 flex justify-center">
          <span className="reel-prompt index">{prompt}</span>
        </div>
      )}
    </div>
  );
}

/** Self-contained cover + lightbox, for the case study page. */
export function ReelCover({ project }: { project: Project }) {
  const reel = useReel();
  return (
    <>
      <button
        type="button"
        className="block h-full w-full text-left"
        onPointerEnter={() => reel.warm(project)}
        onFocus={() => reel.warm(project)}
        onClick={() => reel.open(project)}
        aria-label={`Play the ${project.client} showreel`}
      >
        <ReelPoster project={project} />
      </button>
      <ReelLightbox warmed={reel.warmed} open={!!reel.project} onClose={reel.close} />
    </>
  );
}
