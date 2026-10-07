import React from 'react';
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

export const { fontFamily: INTER } = loadFont('normal', { weights: ['400', '600', '800', '900'], subsets: ['latin'] });

// InsureSAAS brand tokens (from frontend/src/index.css + App.js theme)
export const C = {
  navy: '#1D4E96',
  blue: '#2E76C4',
  sky: '#38A3E0',
  amber: '#E89A2A',
  gold: '#E8C42A',
  ink: '#0A1A3E',
  night: '#050C20',
  chrome: '#1E1E2E',
  white: '#FFFFFF',
};

export type Rect = { x: number; y: number; w: number; h: number };
export const SCREEN = { w: 1440, h: 900 };

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const ease = Easing.bezier(0.16, 1, 0.3, 1); // expo-out
export const easeInOut = Easing.bezier(0.83, 0, 0.17, 1);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

/** Layout helper: one timeline, three aspect ratios. */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const ratio = height / width;
  const mode: 'tall' | 'square' | 'wide' = ratio > 1.3 ? 'tall' : ratio < 0.77 ? 'wide' : 'square';
  const u = Math.min(width, height) / 1080;
  return { width, height, mode, u };
};

/** Keyframed value: [[frame, value], ...] with expo easing between keys. */
export const keys = (frame: number, kf: [number, number][], e = easeInOut) => {
  if (frame <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) {
    if (frame <= kf[i][0]) {
      const t = e((frame - kf[i - 1][0]) / (kf[i][0] - kf[i - 1][0]));
      return lerp(kf[i - 1][1], kf[i][1], t);
    }
  }
  return kf[kf.length - 1][1];
};
export const keyRects = (frame: number, kf: [number, Rect][], e = easeInOut): Rect => {
  if (frame <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) {
    if (frame <= kf[i][0]) return lerpRect(kf[i - 1][1], kf[i][1], e((frame - kf[i - 1][0]) / (kf[i][0] - kf[i - 1][0])));
  }
  return kf[kf.length - 1][1];
};

/** Camera transform: fit `focus` (screen px) inside `box` (video px). */
export const camera = (focus: Rect, box: Rect) => {
  const s = Math.min(box.w / focus.w, box.h / focus.h);
  const ox = box.x + box.w / 2 - (focus.x + focus.w / 2) * s;
  const oy = box.y + box.h / 2 - (focus.y + focus.h / 2) * s;
  return { s, ox, oy, map: (x: number, y: number) => ({ x: ox + x * s, y: oy + y * s }) };
};

/**
 * A real screenshot seen through a framed "device" window. The camera inside
 * the frame is driven by `focus`. Several srcs can be cross-faded via `mix`.
 */
export const Shot: React.FC<{
  srcs: string[];
  mix?: number[]; // opacity per src
  focus: Rect;
  box: Rect;
  radius?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode; // overlays in video px relative to box
}> = ({ srcs, mix, focus, box, radius = 28, style, children }) => {
  const cam = camera(focus, { x: 0, y: 0, w: box.w, h: box.h });
  return (
    <div
      style={{
        position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h,
        borderRadius: radius, overflow: 'hidden', background: '#F2F7FC',
        boxShadow: `0 ${40 * (box.w / 1000)}px ${120 * (box.w / 1000)}px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.08), 0 0 80px rgba(56,163,224,.18)`,
        ...style,
      }}
    >
      {srcs.map((src, i) => (
        <Img
          key={src}
          src={staticFile(src)}
          style={{
            position: 'absolute', left: cam.ox, top: cam.oy,
            width: SCREEN.w * cam.s, height: SCREEN.h * cam.s,
            opacity: mix ? mix[i] : i === 0 ? 1 : 0, maxWidth: 'none',
          }}
        />
      ))}
      {children}
    </div>
  );
};

/** Crop of a screenshot rendered at an arbitrary position/scale. */
export const Crop: React.FC<{ src: string; rect: Rect; scale: number; style?: React.CSSProperties; radius?: number }> = ({ src, rect, scale, style, radius = 0 }) => (
  <div style={{ position: 'absolute', width: rect.w * scale, height: rect.h * scale, overflow: 'hidden', borderRadius: radius, ...style }}>
    <Img src={staticFile(src)} style={{ position: 'absolute', left: -rect.x * scale, top: -rect.y * scale, width: SCREEN.w * scale, height: SCREEN.h * scale, maxWidth: 'none' }} />
  </div>
);

/** macOS-style pointer that travels along keyframes and clicks. */
export const Cursor: React.FC<{ path: [number, number, number][]; clicks: number[]; size?: number }> = ({ path, clicks, size = 54 }) => {
  const f = useCurrentFrame();
  const x = keys(f, path.map(([fr, px]) => [fr, px]) as [number, number][], ease);
  const y = keys(f, path.map(([fr, , py]) => [fr, py]) as [number, number][], ease);
  const appear = interpolate(f, [path[0][0] - 6, path[0][0]], [0, 1], clamp);
  let press = 1;
  let ripple: React.ReactNode = null;
  for (const c of clicks) {
    const d = f - c;
    if (d >= -3 && d < 6) press = Math.min(press, interpolate(d, [-3, 0, 6], [1, 0.78, 1], clamp));
    if (d >= 0 && d < 18) {
      const t = d / 18;
      ripple = (
        <div key={c} style={{
          position: 'absolute', left: -size * 1.2 * (0.3 + t), top: -size * 1.2 * (0.3 + t),
          width: size * 2.4 * (0.3 + t), height: size * 2.4 * (0.3 + t), borderRadius: '50%',
          border: `${size * 0.08}px solid ${C.amber}`, opacity: 1 - t, boxShadow: `0 0 ${size * 0.6}px ${C.amber}`,
        }} />
      );
    }
  }
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: appear, zIndex: 50 }}>
      {ripple}
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ transform: `scale(${press})`, transformOrigin: '4px 2px', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.45))', overflow: 'visible' }}>
        <path d="M4 2 L4 19.5 L8.6 15.4 L11.6 22 L14.6 20.7 L11.7 14.3 L18 14.3 Z" fill="#fff" stroke="#0A1A3E" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** Pulsing highlight ring drawn over a UI region. */
export const Highlight: React.FC<{ rect: Rect; from: number; color?: string }> = ({ rect, from, color = C.amber }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [from, from + 10], [0, 1], { ...clamp, easing: ease });
  const pulse = 0.6 + 0.4 * Math.sin((f - from) / 4);
  if (f < from) return null;
  const pad = 8;
  return (
    <div style={{
      position: 'absolute', left: rect.x - pad, top: rect.y - pad, width: rect.w + pad * 2, height: rect.h + pad * 2,
      borderRadius: 14, border: `4px solid ${color}`, opacity: p,
      transform: `scale(${lerp(1.15, 1, p)})`,
      boxShadow: `0 0 ${30 * pulse}px ${color}, inset 0 0 ${24 * pulse}px ${color}55`,
      background: `${color}14`,
    }} />
  );
};

/** Masked word-by-word caption reveal. */
export const Caption: React.FC<{
  index: string; lines: string[]; accent?: number; at: number; size: number; align?: 'left' | 'center'; style?: React.CSSProperties; exitAt?: number;
}> = ({ index, lines, accent = -1, at, size, align = 'center', style, exitAt }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  let w = 0;
  const out = exitAt ? interpolate(f, [exitAt, exitAt + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  return (
    <div style={{ position: 'absolute', fontFamily: INTER, color: C.white, textAlign: align, ...style }}>
      <div style={{
        fontSize: size * 0.24, fontWeight: 800, letterSpacing: size * 0.04, color: C.sky, marginBottom: size * 0.12,
        opacity: interpolate(f, [at, at + 8], [0, 1], clamp) * (1 - out),
        transform: `translateX(${interpolate(f, [at, at + 12], [-30, 0], { ...clamp, easing: ease })}px)`,
      }}>
        <span style={{ color: C.amber }}>{index}</span> &nbsp;/&nbsp; INSURESAAS
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
                  color: k === accent ? C.amber : C.white,
                }}>{word}</span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Enter/exit envelope shared by every scene: zoom-blur in, whip out. */
export const useSceneEnvelope = (duration: number) => {
  const f = useCurrentFrame();
  const inT = interpolate(f, [0, 9], [0, 1], { ...clamp, easing: ease });
  const outT = interpolate(f, [duration - 8, duration], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return {
    style: {
      transform: `scale(${lerp(1.12, 1, inT) * lerp(1, 0.9, outT)}) translateY(${outT * -8}%)`,
      filter: `blur(${(1 - inT) * 18 + outT * 22}px)`,
      opacity: Math.min(inT * 1.4, 1 - outT * 0.6),
    } as React.CSSProperties,
  };
};
