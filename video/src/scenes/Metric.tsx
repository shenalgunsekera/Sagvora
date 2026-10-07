import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, INTER, clamp, ease, lerp, useLayout } from '../lib';

// Verifiable from the product: frontend/src/config/products.js defines 18 lines.
const VALUE = 18;
const WALL = ['menu', 'renewals', 'quotes-compare', 'claims', 'uw', 'quotes', 'claims-open', 'renewals', 'menu'];
const LINES = ['Motor', 'Fire', 'Marine', 'Travel', 'Cyber', 'Medical', 'Liability', 'WCI', 'Life', 'CAR', 'EAR', 'Fleet'];

export const Metric: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, mode, u } = useLayout();

  const count = Math.round(interpolate(f, [0, 22], [0, VALUE], { ...clamp, easing: ease }));
  const slam = spring({ frame: f, fps, config: { damping: 10, stiffness: 200, mass: 0.8 } });
  const out = interpolate(f, [68, 77], [0, 1], clamp);
  const numSize = (mode === 'tall' ? 560 : mode === 'square' ? 420 : 460) * u;

  // A wall of real screens drifting in 3D behind the number.
  const tileW = 560 * u, tileH = 350 * u;
  const wall = WALL.map((src, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    return (
      <Img key={i} src={staticFile(`screens/${src}.png`)} style={{
        position: 'absolute', width: tileW, height: tileH, borderRadius: 18 * u,
        left: (col - 1) * (tileW + 40 * u) - tileW / 2, top: (row - 1) * (tileH + 40 * u) - tileH / 2,
        boxShadow: '0 30px 80px rgba(0,0,0,.6)', objectFit: 'cover',
      }} />
    );
  });

  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `scale(${lerp(1, 1.3, out)})`, filter: `blur(${out * 14}px)` }}>
      <div style={{ position: 'absolute', left: width / 2, top: height / 2, perspective: 1400 * u }}>
        <div style={{
          transform: `rotateX(${32 - f * 0.12}deg) rotateZ(${-14 + f * 0.08}deg) translateY(${-f * 2.5 * u}px) scale(${mode === 'tall' ? 1.35 : 1.1})`,
          opacity: 0.32, filter: 'saturate(.7)',
        }}>{wall}</div>
      </div>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, ${C.ink}EE 20%, ${C.ink}88 60%, transparent 100%)` }} />

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: INTER }}>
        <div style={{
          fontSize: numSize, fontWeight: 900, lineHeight: 0.85, letterSpacing: -numSize * 0.06,
          backgroundImage: `linear-gradient(180deg, #FFFFFF 10%, ${C.sky} 70%, ${C.blue})`, WebkitBackgroundClip: 'text', color: 'transparent',
          transform: `scale(${lerp(2.2, 1, slam)})`, filter: `drop-shadow(0 0 ${60 * u}px rgba(56,163,224,.55))`,
          fontVariantNumeric: 'tabular-nums',
        }}>{count}</div>
        <div style={{
          fontSize: 76 * u, fontWeight: 900, color: C.white, letterSpacing: -2 * u, marginTop: 10 * u,
          opacity: interpolate(f, [10, 18], [0, 1], clamp), transform: `translateY(${interpolate(f, [10, 22], [40, 0], { ...clamp, easing: ease })}px)`,
        }}>insurance lines.</div>
        <div style={{
          fontSize: 76 * u, fontWeight: 900, color: C.amber, letterSpacing: -2 * u,
          opacity: interpolate(f, [24, 30], [0, 1], clamp), transform: `scale(${lerp(1.6, 1, spring({ frame: f - 24, fps, config: { damping: 12, stiffness: 220 } }))})`,
        }}>One portal.</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 * u, maxWidth: width * 0.86, marginTop: 40 * u }}>
          {LINES.map((l, i) => {
            const s = spring({ frame: f - 30 - i * 1.5, fps, config: { damping: 14, stiffness: 240 } });
            return (
              <span key={l} style={{
                fontSize: 26 * u, fontWeight: 800, color: '#CFE9FF', padding: `${8 * u}px ${18 * u}px`, borderRadius: 999,
                border: `${2 * u}px solid rgba(56,163,224,.45)`, background: 'rgba(29,78,150,.35)',
                transform: `scale(${s})`, opacity: s,
              }}>{l}</span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
