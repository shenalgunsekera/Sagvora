import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, useLayout } from './lib';
import T from './timeline.json';

/** Deep navy field with drifting brand glows, a perspective grid and grain. */
export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height, u } = useLayout();
  const beat = (f % 15) / 15;
  const pulse = Math.exp(-beat * 5) * (f >= T.scenes.assemble.from && f < T.scenes.metric.from ? 1 : 0.4);
  const blob = (x: number, y: number, r: number, color: string, o: number) => (
    <div style={{
      position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, transparent 65%)`, opacity: o,
    }} />
  );
  const gridShift = (f * 2.2) % 80;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 0%, #0E2A5C 0%, ${C.ink} 45%, ${C.night} 100%)`, overflow: 'hidden' }}>
      {blob(width * (0.2 + 0.08 * Math.sin(f / 60)), height * (0.25 + 0.05 * Math.cos(f / 50)), 700 * u, C.blue, 0.55 + pulse * 0.15)}
      {blob(width * (0.85 + 0.06 * Math.cos(f / 70)), height * (0.7 + 0.06 * Math.sin(f / 45)), 650 * u, C.sky, 0.32 + pulse * 0.12)}
      {blob(width * (0.6 + 0.1 * Math.sin(f / 90)), height * 1.05, 520 * u, C.amber, 0.18)}
      {/* perspective floor grid */}
      <div style={{
        position: 'absolute', left: -width, right: -width, bottom: -height * 0.1, height: height * 0.75,
        transform: 'perspective(900px) rotateX(68deg)', transformOrigin: '50% 100%',
        backgroundImage: `linear-gradient(rgba(56,163,224,.22) 2px, transparent 2px), linear-gradient(90deg, rgba(56,163,224,.22) 2px, transparent 2px)`,
        backgroundSize: '80px 80px', backgroundPosition: `0 ${gridShift}px`,
        maskImage: 'linear-gradient(to top, black 0%, transparent 85%)', WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 85%)',
        opacity: 0.5,
      }} />
      {/* vignette */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,.55) 100%)' }} />
      {/* grain */}
      <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: 'overlay' }}>
        <svg width="100%" height="100%">
          <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 12} /></filter>
          <rect width="100%" height="100%" filter="url(#g)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Short flash on every scene cut. */
export const CutFlash: React.FC = () => {
  const f = useCurrentFrame();
  let o = 0;
  for (const s of Object.values(T.scenes)) {
    if (s.from === 0) continue;
    o = Math.max(o, interpolate(f - s.from, [-2, 0, 5], [0, 0.35, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  }
  return <AbsoluteFill style={{ background: `radial-gradient(circle, #CFE9FF 0%, ${C.sky} 60%)`, opacity: o, mixBlendMode: 'screen', pointerEvents: 'none' }} />;
};
