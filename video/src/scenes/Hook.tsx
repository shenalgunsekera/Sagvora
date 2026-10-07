import React from 'react';
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, INTER, clamp, ease, lerp, useLayout } from '../lib';

// The problem, in five words — one per beat.
const WORDS = ['INSURANCE', 'BROKERS', 'DROWN', 'IN', 'SPREADSHEETS.'];
const BEATS = [0, 15, 30, 45, 60];

/** Fit a word's font size to a width (Inter Black caps ≈ 0.72em per glyph). */
const fit = (word: string, w: number, max: number) => Math.min(max, w / (word.length * 0.72));

/** The chaos the product replaces: a spreadsheet grid that floods in. */
const SheetChaos: React.FC<{ start: number }> = ({ start }) => {
  const f = useCurrentFrame();
  const { width, height, u } = useLayout();
  const cell = 120 * u;
  const cols = Math.ceil(width / cell) + 1;
  const rows = Math.ceil(height / (cell * 0.38)) + 1;
  const t = f - start;
  if (t < -2) return null;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const d = random(`d${r}-${c}`) * 14;
      const o = interpolate(t - d, [0, 4], [0, 1], clamp);
      if (o <= 0) continue;
      const v = random(`v${r}-${c}`);
      const red = v > 0.93;
      cells.push(
        <div key={`${r}-${c}`} style={{
          position: 'absolute', left: c * cell, top: r * cell * 0.38, width: cell, height: cell * 0.38,
          border: '1px solid rgba(56,163,224,.25)', fontFamily: 'Consolas, monospace', fontSize: 18 * u,
          color: red ? '#FF6B6B' : 'rgba(207,233,255,.55)', padding: `${6 * u}px ${8 * u}px`, opacity: o * 0.8,
          background: red ? 'rgba(220,38,38,.18)' : v > 0.8 ? 'rgba(56,163,224,.08)' : 'transparent',
          overflow: 'hidden', whiteSpace: 'nowrap',
        }}>
          {red ? '#REF!' : v > 0.55 ? (Math.floor(v * 990000)).toLocaleString('en-US') : v > 0.3 ? 'LKR' : ''}
        </div>,
      );
    }
  }
  return <AbsoluteFill style={{ transform: `rotate(${-8 + t * 0.15}deg) scale(1.3)`, opacity: interpolate(t, [0, 6], [0, 0.9], clamp) }}>{cells}</AbsoluteFill>;
};

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, mode, u } = useLayout();
  const avail = width * (mode === 'wide' ? 0.42 : 0.86);
  const max = (mode === 'tall' ? 260 : mode === 'square' ? 190 : 200) * u;

  // Final beat: everything gets sucked into the centre (whoosh into the product).
  const suck = interpolate(f, [80, 92], [0, 1], { ...clamp, easing: (x) => x * x * x });
  // Camera shake that decays after each slam.
  let shake = 0;
  for (const b of BEATS) { const d = f - b; if (d >= 0 && d < 10) shake = Math.max(shake, (1 - d / 10) * 14 * u); }
  const sx = (random(`sx${f}`) - 0.5) * shake, sy = (random(`sy${f}`) - 0.5) * shake;

  const words = WORDS.map((w, i) => {
    const d = f - BEATS[i];
    if (d < 0) return null;
    const s = spring({ frame: d, fps, config: { damping: 12, stiffness: 260, mass: 0.6 } });
    const size = fit(w, avail, max);
    const isLast = i === WORDS.length - 1;
    const glitch = isLast && d > 6 ? (random(`gl${f}`) > 0.75 ? (random(`gx${f}`) - 0.5) * 30 * u : 0) : 0;
    return (
      <div key={w} style={{
        fontFamily: INTER, fontWeight: 900, fontSize: size, lineHeight: 0.92, letterSpacing: -size * 0.04,
        color: isLast ? C.amber : C.white,
        transform: `translateX(${glitch}px) scale(${lerp(2.6, 1, s)})`, opacity: Math.min(1, d / 2),
        filter: `blur(${Math.max(0, (1 - s) * 10)}px)`,
        textShadow: isLast ? `0 0 ${40 * u}px rgba(232,154,42,.6), ${-glitch * 0.4}px 0 0 rgba(56,163,224,.8)` : `0 ${10 * u}px ${40 * u}px rgba(0,0,0,.5)`,
        whiteSpace: 'nowrap',
      }}>{w}</div>
    );
  });

  return (
    <AbsoluteFill>
      <SheetChaos start={58} />
      <AbsoluteFill style={{
        justifyContent: 'center', alignItems: mode === 'wide' ? 'flex-start' : 'center', paddingLeft: mode === 'wide' ? width * 0.08 : 0,
        transform: `translate(${sx}px, ${sy}px) scale(${lerp(1, 0.04, suck)}) rotate(${suck * 25}deg)`,
        opacity: 1 - interpolate(suck, [0.7, 1], [0, 1], clamp),
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: mode === 'wide' ? 'flex-start' : 'center', gap: 6 * u }}>{words}</div>
      </AbsoluteFill>
      {mode === 'wide' && (
        <div style={{
          position: 'absolute', right: width * 0.07, top: height * 0.5 - 140 * u, width: width * 0.38, fontFamily: INTER, color: 'rgba(207,233,255,.7)',
          fontSize: 34 * u, fontWeight: 600, lineHeight: 1.35, opacity: interpolate(f, [62, 72], [0, 1], clamp) * (1 - suck),
          transform: `translateY(${interpolate(f, [62, 75], [30, 0], { ...clamp, easing: ease })}px)`,
        }}>
          Quotes by email. Claims in folders.<br />Renewals in someone's head.
        </div>
      )}
      <AbsoluteFill style={{ background: C.white, opacity: interpolate(f, [88, 90, 92], [0, 0.5, 0], clamp) }} />
    </AbsoluteFill>
  );
};
