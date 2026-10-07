import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, INTER, clamp, ease, lerp, useLayout } from '../lib';

const LOGO_RATIO = 423 / 2416; // logo-white.png

export const Logo: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, mode, u } = useLayout();
  const logoW = Math.min(width * (mode === 'wide' ? 0.5 : 0.84), 1000 * u);
  const s = spring({ frame: f, fps, config: { damping: 11, stiffness: 160, mass: 0.9 } });
  const ring = (delay: number, color: string) => {
    const t = interpolate(f - delay, [0, 26], [0, 1], { ...clamp, easing: ease });
    const r = lerp(50, 1500, t) * u;
    return <div style={{ position: 'absolute', width: r, height: r, borderRadius: '50%', border: `${lerp(14, 1, t) * u}px solid ${color}`, opacity: 1 - t }} />;
  };
  const sweep = interpolate(f, [10, 34], [-0.3, 1.3], clamp);
  const cta = spring({ frame: f - 22, fps, config: { damping: 13, stiffness: 180 } });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: INTER }}>
      {ring(0, C.sky)}
      {ring(5, C.amber)}
      <div style={{ position: 'relative', width: logoW, height: logoW * LOGO_RATIO, transform: `scale(${lerp(0.4, 1, s)})`, filter: `blur(${(1 - Math.min(s, 1)) * 12}px)` }}>
        <Img src={staticFile('logo-white.png')} style={{ width: '100%', height: '100%', filter: `drop-shadow(0 0 ${40 * u}px rgba(56,163,224,.6))` }} />
        {/* light sweep, masked to the wordmark */}
        <div style={{
          position: 'absolute', inset: 0,
          WebkitMaskImage: `url(${staticFile('logo-white.png')})`, WebkitMaskSize: '100% 100%',
          maskImage: `url(${staticFile('logo-white.png')})`, maskSize: '100% 100%',
          background: `linear-gradient(100deg, transparent ${sweep * 100 - 12}%, ${C.amber} ${sweep * 100}%, transparent ${sweep * 100 + 12}%)`,
        }} />
      </div>
      <div style={{
        marginTop: 34 * u, fontSize: 34 * u, fontWeight: 600, letterSpacing: 10 * u, color: '#CFE9FF', textTransform: 'uppercase',
        opacity: interpolate(f, [12, 22], [0, 1], clamp), transform: `translateY(${interpolate(f, [12, 24], [20, 0], { ...clamp, easing: ease })}px)`,
        textAlign: 'center', padding: `0 ${40 * u}px`,
      }}>Insurance Management Portal</div>
      <div style={{
        marginTop: 60 * u, display: 'flex', alignItems: 'center', gap: 18 * u, padding: `${24 * u}px ${44 * u}px`, borderRadius: 999,
        background: `linear-gradient(135deg, ${C.navy}, ${C.blue} 60%, ${C.sky})`, color: C.white, fontSize: 40 * u, fontWeight: 800,
        boxShadow: `0 ${20 * u}px ${60 * u}px rgba(46,118,196,.55), inset 0 0 0 ${2 * u}px rgba(255,255,255,.25)`,
        transform: `scale(${cta}) translateY(${(1 - cta) * 40}px)`, opacity: Math.min(1, cta * 1.5),
      }}>
        Book a demo
        <span style={{ fontWeight: 600, opacity: 0.9 }}>→ insuresaas.lk</span>
      </div>
    </AbsoluteFill>
  );
};
