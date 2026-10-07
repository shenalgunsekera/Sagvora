import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, Caption, Cursor, Highlight, Rect, SCREEN, Shot, camera, clamp, ease, easeInOut, lerp, useLayout } from '../lib';

/** A camera key: centre point + visible width (screen px) per layout mode. */
type PerMode = { tall: number; square: number; wide: number };
export type CamKey = { f: number; cx: number | PerMode; cy: number | PerMode; w: PerMode };
const pick = (v: number | PerMode, m: string) => (typeof v === 'number' ? v : v[m as keyof PerMode]);

export type FeatureProps = {
  index: string;
  lines: { tall: string[]; square: string[]; wide: string[] };
  accent: number;
  /** [fromFrame, src] — the screenshot shown from that local frame on. */
  frames: [number, string][];
  cam: CamKey[];
  cursor: { path: [number, number, number][]; clicks: number[] }; // screen px
  highlight?: { rect: Rect; at: number };
  duration: number;
};

export const featureBox = (mode: string, width: number, height: number, u: number): Rect =>
  mode === 'tall' ? { x: 50 * u, y: 600 * u, w: width - 100 * u, h: height - 700 * u }
    : mode === 'square' ? { x: 60 * u, y: 230 * u, w: width - 120 * u, h: height - 290 * u }
      : { x: width * 0.41, y: 90 * u, w: width * 0.55, h: height - 180 * u };

export const Feature: React.FC<FeatureProps> = ({ index, lines, accent, frames, cam, cursor, highlight, duration }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, mode, u } = useLayout();
  const box = featureBox(mode, width, height, u);
  const aspect = box.h / box.w;

  // Camera: interpolate centre + width between keys.
  const k = (() => {
    if (f <= cam[0].f) return { cx: pick(cam[0].cx, mode), cy: pick(cam[0].cy, mode), w: cam[0].w[mode] };
    for (let i = 1; i < cam.length; i++) {
      if (f <= cam[i].f) {
        const t = easeInOut((f - cam[i - 1].f) / (cam[i].f - cam[i - 1].f));
        return { cx: lerp(pick(cam[i - 1].cx, mode), pick(cam[i].cx, mode), t), cy: lerp(pick(cam[i - 1].cy, mode), pick(cam[i].cy, mode), t), w: lerp(cam[i - 1].w[mode], cam[i].w[mode], t) };
      }
    }
    const l = cam[cam.length - 1];
    return { cx: pick(l.cx, mode), cy: pick(l.cy, mode), w: l.w[mode] };
  })();
  // Keep the camera on the screenshot so empty canvas never shows.
  const fit = (p: number, size: number, max: number) => (size >= max ? (max - size) / 2 : Math.min(Math.max(p, 0), max - size));
  const fh = k.w * aspect;
  const focus: Rect = { x: fit(k.cx - k.w / 2, k.w, SCREEN.w), y: fit(k.cy - fh / 2, fh, SCREEN.h), w: k.w, h: fh };
  const cm = camera(focus, { x: 0, y: 0, w: box.w, h: box.h });

  // Which screenshot is live, with a 3-frame cross-fade between states.
  const mix = frames.map(([from], i) => {
    const next = frames[i + 1]?.[0] ?? Infinity;
    const a = i === 0 ? 1 : interpolate(f, [from, from + 3], [0, 1], clamp);
    const b = next === Infinity ? 1 : interpolate(f, [next, next + 3], [1, 0], clamp);
    return Math.min(a, b);
  });

  // Entrance: the window swings in on a 3D hinge.
  const s = spring({ frame: f, fps, config: { damping: 16, stiffness: 110 } });
  const out = interpolate(f, [duration - 9, duration], [0, 1], clamp);
  const swing = mode === 'wide' ? `rotateY(${(1 - s) * -35 + out * 25}deg)` : `rotateX(${(1 - s) * 40 - out * 30}deg)`;

  const capSize = (mode === 'tall' ? 112 : mode === 'square' ? 70 : 104) * u;
  const capStyle: React.CSSProperties = mode === 'wide'
    ? { left: width * 0.055, top: height * 0.3, width: width * 0.33 }
    : { left: 40 * u, right: 40 * u, top: (mode === 'tall' ? 170 : 45) * u };

  const pm = (x: number, y: number) => cm.map(x, y);
  const cursorPath = cursor.path.map(([fr, x, y]) => { const p = pm(x, y); return [fr, p.x, p.y] as [number, number, number]; });
  // Cursor path must follow the camera, so re-evaluate per frame with the live camera.
  const hl = highlight && (() => { const p = pm(highlight.rect.x, highlight.rect.y); return { x: p.x, y: p.y, w: highlight.rect.w * cm.s, h: highlight.rect.h * cm.s }; })();

  return (
    <AbsoluteFill>
      <Caption index={index} lines={lines[mode as 'tall']} accent={accent} at={3} exitAt={duration - 10} size={capSize}
        align={mode === 'wide' ? 'left' : 'center'} style={capStyle} />
      <div style={{ position: 'absolute', inset: 0, perspective: 2200 * u }}>
        <div style={{
          position: 'absolute', inset: 0, transformOrigin: mode === 'wide' ? '100% 50%' : '50% 100%',
          transform: `${swing} translateY(${(1 - s) * 200 * u + out * -120 * u}px) scale(${lerp(1, 0.92, out)})`,
          opacity: Math.min(1, s * 2) * (1 - out), filter: `blur(${out * 12}px)`,
        }}>
          <Shot srcs={frames.map(([, src]) => src)} mix={mix} focus={focus} box={box} radius={30 * u}>
            {hl && <Highlight rect={hl} from={highlight!.at} />}
            <Cursor path={cursorPath} clicks={cursor.clicks} size={60 * u} />
          </Shot>
          {/* glossy sheen sweeping the glass once */}
          <div style={{
            position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: 30 * u, pointerEvents: 'none', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -box.h * 0.5, height: box.h * 2, width: box.w * 0.25,
              left: interpolate(f, [4, 26], [-box.w * 0.4, box.w * 1.2], { ...clamp, easing: ease }),
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)', transform: 'rotate(18deg)',
            }} />
          </div>
        </div>
      </div>
      <div style={{
        position: 'absolute', left: box.x, top: box.y + box.h + 18 * u, width: box.w, height: 4 * u, borderRadius: 4,
        background: 'rgba(255,255,255,.1)', overflow: 'hidden', opacity: (1 - out) * (mode === 'wide' ? 0 : 1),
      }}>
        <div style={{ width: `${(f / duration) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.sky}, ${C.amber})` }} />
      </div>
    </AbsoluteFill>
  );
};
