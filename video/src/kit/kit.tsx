/**
 * Reel kit: the building blocks every project reel shares.
 *
 * The InsureSAAS promo (src/Promo.tsx) was hand-built around one product. The
 * kit generalises it: a theme (brand colours), real page captures from
 * capture/sites.mjs, and a config per project in src/reels/. Scene timing is
 * the same 120 BPM grid as the InsureSAAS cut, so music stays on the beat.
 */
import React, { createContext, useContext } from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { INTER, Rect, camera, clamp, ease, easeInOut, keys, lerp, useLayout } from '../lib';

/* ── Theme ────────────────────────────────────────────────────────────────── */

export type Theme = {
  /** Deep background: centre glow → mid → edge. */
  bg: [string, string, string];
  primary: string;
  secondary: string;
  /** Muted text on the dark background. */
  soft: string;
  /** Address shown in the browser bar and the end card. */
  url: string;
  /** Fill behind a page shorter than the window (dark sites). */
  pageBg?: string;
  /** Text on the end-card button when the brand gradient is light. */
  ctaText?: string;
};

const ThemeCtx = createContext<Theme | null>(null);
export const ThemeProvider = ThemeCtx.Provider;
export const useTheme = () => {
  const t = useContext(ThemeCtx);
  if (!t) throw new Error('useTheme outside a reel');
  return t;
};

export type Mode = 'tall' | 'square' | 'wide';
export type PerMode<T> = T | { tall: T; wide: T; square?: T };
export const per = <T,>(v: PerMode<T>, mode: Mode): T =>
  v !== null && typeof v === 'object' && 'tall' in (v as object) && 'wide' in (v as object)
    ? ((v as { tall: T; wide: T; square?: T })[mode] ?? (v as { wide: T }).wide)
    : (v as T);

/* ── Pages (real captures) ───────────────────────────────────────────────── */

type RectsFile = Record<string, { w: number; h: number; items: { tag: string; text: string; x: number; y: number; w: number; h: number }[] }>;

export type Page = { src: string; w: number; h: number; find: (text: string, nth?: number) => Rect };

/** A captured page plus a lookup for the boxes recorded on it. */
export const pageOf = (slug: string, rects: RectsFile, name: string): Page => {
  const d = rects[name];
  if (!d) throw new Error(`no capture ${slug}/${name}`);
  return {
    src: `${slug}/${name}.jpg`,
    w: d.w,
    h: d.h,
    find: (text, nth = 0) => {
      const hits = d.items.filter((i) => i.text.toLowerCase().includes(text.toLowerCase()));
      const r = hits[nth] ?? hits[0];
      if (!r) throw new Error(`"${text}" not found on ${slug}/${name}`);
      return { x: r.x, y: r.y, w: r.w, h: r.h };
    },
  };
};

export const centre = (r: Rect) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

/* ── Browser window with a camera over a page ────────────────────────────── */

/**
 * A browser window (chrome bar + address) showing a real page capture. The
 * camera inside is `focus`, in page CSS px; `mix` cross-fades several pages.
 * Children are overlays positioned in window-viewport px (use `map`).
 */
export const Browser: React.FC<{
  pages: Page[];
  mix?: number[];
  focus: Rect;
  box: Rect;
  radius?: number;
  children?: (map: (x: number, y: number) => { x: number; y: number }, s: number) => React.ReactNode;
}> = ({ pages, mix, focus, box, radius = 26, children }) => {
  const t = useTheme();
  const { u } = useLayout();
  const bar = Math.max(34, 54 * u * Math.min(1, box.w / (1100 * u)));
  const view: Rect = { x: 0, y: bar, w: box.w, h: box.h - bar };
  const cam = camera(focus, { x: 0, y: 0, w: view.w, h: view.h });
  return (
    <div
      style={{
        position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: radius, overflow: 'hidden',
        background: t.pageBg ?? '#fff',
        boxShadow: `0 ${40 * u}px ${120 * u}px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.1), 0 0 ${90 * u}px ${t.primary}33`,
      }}
    >
      {/* chrome bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: bar, background: '#1b1c22', display: 'flex', alignItems: 'center', gap: bar * 0.18, padding: `0 ${bar * 0.42}px` }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span key={c} style={{ width: bar * 0.24, height: bar * 0.24, borderRadius: 99, background: c, flexShrink: 0 }} />
        ))}
        <div style={{
          marginLeft: bar * 0.3, flex: 1, maxWidth: box.w * 0.55, height: bar * 0.56, borderRadius: 99, background: '#2a2b33',
          display: 'flex', alignItems: 'center', gap: bar * 0.16, padding: `0 ${bar * 0.32}px`,
          fontFamily: INTER, fontSize: bar * 0.3, color: 'rgba(255,255,255,.72)', whiteSpace: 'nowrap', overflow: 'hidden',
        }}>
          <svg width={bar * 0.26} height={bar * 0.26} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="rgba(255,255,255,.6)" strokeWidth="2.4" fill="none" />
            <rect x="5" y="11" width="14" height="10" rx="2" fill="rgba(255,255,255,.6)" />
          </svg>
          {t.url}
        </div>
      </div>
      {/* viewport */}
      <div style={{ position: 'absolute', left: view.x, top: view.y, width: view.w, height: view.h, overflow: 'hidden' }}>
        {pages.map((p, i) => (
          <Img
            key={p.src + i}
            src={staticFile(p.src)}
            style={{
              position: 'absolute', left: cam.ox, top: cam.oy, width: p.w * cam.s, height: p.h * cam.s, maxWidth: 'none',
              opacity: mix ? mix[i] : i === 0 ? 1 : 0,
            }}
          />
        ))}
        {children?.(cam.map, cam.s)}
      </div>
    </div>
  );
};

/** Keep a camera rect on the page so empty canvas never shows. */
export const fitFocus = (cx: number, cy: number, w: number, aspect: number, page: { w: number; h: number }): Rect => {
  const h = w * aspect;
  const fit = (p: number, size: number, max: number) => (size >= max ? (max - size) / 2 : Math.min(Math.max(p, 0), max - size));
  return { x: fit(cx - w / 2, w, page.w), y: fit(cy - h / 2, h, page.h), w, h };
};

/* ── Cursor, highlight, caption ─────────────────────────────────────────── */

export const Cursor: React.FC<{ path: [number, number, number][]; clicks: number[]; size?: number }> = ({ path, clicks, size = 54 }) => {
  const f = useCurrentFrame();
  const t = useTheme();
  const x = keys(f, path.map(([fr, px]) => [fr, px]) as [number, number][], ease);
  const y = keys(f, path.map(([fr, , py]) => [fr, py]) as [number, number][], ease);
  const appear = interpolate(f, [path[0][0] - 6, path[0][0]], [0, 1], clamp);
  let press = 1;
  let ripple: React.ReactNode = null;
  for (const c of clicks) {
    const d = f - c;
    if (d >= -3 && d < 6) press = Math.min(press, interpolate(d, [-3, 0, 6], [1, 0.78, 1], clamp));
    if (d >= 0 && d < 18) {
      const k = d / 18;
      ripple = (
        <div key={c} style={{
          position: 'absolute', left: -size * 1.2 * (0.3 + k), top: -size * 1.2 * (0.3 + k),
          width: size * 2.4 * (0.3 + k), height: size * 2.4 * (0.3 + k), borderRadius: '50%',
          border: `${size * 0.08}px solid ${t.secondary}`, opacity: 1 - k, boxShadow: `0 0 ${size * 0.6}px ${t.secondary}`,
        }} />
      );
    }
  }
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: appear, zIndex: 50 }}>
      {ripple}
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ transform: `scale(${press})`, transformOrigin: '4px 2px', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.45))', overflow: 'visible' }}>
        <path d="M4 2 L4 19.5 L8.6 15.4 L11.6 22 L14.6 20.7 L11.7 14.3 L18 14.3 Z" fill="#fff" stroke="#111" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export const Highlight: React.FC<{ rect: Rect; from: number }> = ({ rect, from }) => {
  const f = useCurrentFrame();
  const { secondary: color } = useTheme();
  if (f < from) return null;
  const p = interpolate(f, [from, from + 10], [0, 1], { ...clamp, easing: ease });
  const pulse = 0.6 + 0.4 * Math.sin((f - from) / 4);
  const pad = 8;
  return (
    <div style={{
      position: 'absolute', left: rect.x - pad, top: rect.y - pad, width: rect.w + pad * 2, height: rect.h + pad * 2,
      borderRadius: 14, border: `4px solid ${color}`, opacity: p, transform: `scale(${lerp(1.15, 1, p)})`,
      boxShadow: `0 0 ${30 * pulse}px ${color}, inset 0 0 ${24 * pulse}px ${color}55`, background: `${color}14`,
    }} />
  );
};

/** Masked word-by-word caption with a "NN / BRAND" label above it. */
export const Caption: React.FC<{
  index: string; label: string; lines: string[]; accent?: number; at: number; size: number;
  align?: 'left' | 'center'; style?: React.CSSProperties; exitAt?: number;
}> = ({ index, label, lines, accent = -1, at, size, align = 'center', style, exitAt }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = useTheme();
  let w = 0;
  const out = exitAt ? interpolate(f, [exitAt, exitAt + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  return (
    <div style={{ position: 'absolute', fontFamily: INTER, color: '#fff', textAlign: align, ...style }}>
      <div style={{
        fontSize: size * 0.24, fontWeight: 800, letterSpacing: size * 0.04, color: t.soft, marginBottom: size * 0.12,
        opacity: interpolate(f, [at, at + 8], [0, 1], clamp) * (1 - out),
        transform: `translateX(${interpolate(f, [at, at + 12], [-30, 0], { ...clamp, easing: ease })}px)`,
        textTransform: 'uppercase',
      }}>
        <span style={{ color: t.secondary }}>{index}</span> &nbsp;/&nbsp; {label}
      </div>
      {lines.map((line, li) => (
        <div key={li} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', gap: `0 ${size * 0.26}px` }}>
          {line.split(' ').map((word) => {
            const k = w++;
            const s = spring({ frame: f - at - 2 - k * 2.5, fps, config: { damping: 16, stiffness: 180, mass: 0.7 } });
            return (
              <span key={k} style={{ overflow: 'hidden', display: 'inline-block', paddingBottom: size * 0.08, marginBottom: -size * 0.08 }}>
                <span style={{
                  display: 'inline-block', fontSize: size, fontWeight: 900, lineHeight: 1.02, letterSpacing: -size * 0.035,
                  transform: `translateY(${(1 - s) * 110 + out * -110}%) rotate(${(1 - s) * 6}deg)`,
                  color: k === accent ? t.secondary : '#fff',
                }}>{word}</span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ── Background + cut flash ─────────────────────────────────────────────── */

export const Background: React.FC<{ grooveFrom: number; grooveTo: number }> = ({ grooveFrom, grooveTo }) => {
  const f = useCurrentFrame();
  const t = useTheme();
  const { width, height, u } = useLayout();
  const beat = (f % 15) / 15;
  const pulse = Math.exp(-beat * 5) * (f >= grooveFrom && f < grooveTo ? 1 : 0.4);
  const blob = (x: number, y: number, r: number, color: string, o: number) => (
    <div style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, ${color} 0%, transparent 65%)`, opacity: o }} />
  );
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 0%, ${t.bg[0]} 0%, ${t.bg[1]} 45%, ${t.bg[2]} 100%)`, overflow: 'hidden' }}>
      {blob(width * (0.2 + 0.08 * Math.sin(f / 60)), height * (0.25 + 0.05 * Math.cos(f / 50)), 700 * u, t.primary, 0.42 + pulse * 0.14)}
      {blob(width * (0.85 + 0.06 * Math.cos(f / 70)), height * (0.7 + 0.06 * Math.sin(f / 45)), 650 * u, t.secondary, 0.26 + pulse * 0.12)}
      <div style={{
        position: 'absolute', left: -width, right: -width, bottom: -height * 0.1, height: height * 0.75,
        transform: 'perspective(900px) rotateX(68deg)', transformOrigin: '50% 100%',
        backgroundImage: `linear-gradient(${t.primary}38 2px, transparent 2px), linear-gradient(90deg, ${t.primary}38 2px, transparent 2px)`,
        backgroundSize: '80px 80px', backgroundPosition: `0 ${(f * 2.2) % 80}px`,
        maskImage: 'linear-gradient(to top, black 0%, transparent 85%)', WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 85%)', opacity: 0.5,
      }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,.55) 100%)' }} />
      <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: 'overlay' }}>
        <svg width="100%" height="100%">
          <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 12} /></filter>
          <rect width="100%" height="100%" filter="url(#g)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const CutFlash: React.FC<{ cuts: number[] }> = ({ cuts }) => {
  const f = useCurrentFrame();
  const t = useTheme();
  let o = 0;
  for (const c of cuts) o = Math.max(o, interpolate(f - c, [-2, 0, 5], [0, 0.32, 0], clamp));
  return <AbsoluteFill style={{ background: `radial-gradient(circle, #fff 0%, ${t.primary} 60%)`, opacity: o, mixBlendMode: 'screen', pointerEvents: 'none' }} />;
};

/* ── Logo ───────────────────────────────────────────────────────────────── */

/** A light logo (image) or a component drawn in code, at a given width. */
export type LogoSpec = { src: string; ratio: number } | { draw: (w: number) => React.ReactNode; ratio: number };

export const LogoMark: React.FC<{ logo: LogoSpec; width: number; glow?: string }> = ({ logo, width, glow }) => (
  <div style={{ width, height: width * logo.ratio, position: 'relative', filter: glow ? `drop-shadow(0 0 ${width * 0.05}px ${glow})` : undefined }}>
    {'src' in logo ? <Img src={staticFile(logo.src)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : logo.draw(width)}
  </div>
);

/* ── Shared scene envelope helpers ──────────────────────────────────────── */

export const boxFor = (mode: Mode, width: number, height: number, u: number): Rect =>
  mode === 'tall' ? { x: 50 * u, y: 560 * u, w: width - 100 * u, h: height - 660 * u }
    : mode === 'square' ? { x: 60 * u, y: 230 * u, w: width - 120 * u, h: height - 290 * u }
      : { x: width * 0.41, y: 90 * u, w: width * 0.55, h: height - 180 * u };

export { INTER, clamp, ease, easeInOut, lerp, keys, random, useLayout };
export type { Rect };
