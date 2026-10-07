import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, Caption, Crop, Cursor, INTER, Rect, Shot, camera, clamp, ease, lerp, useLayout } from '../lib';
import rects from '../../public/rects.json';

// Local frames (scene starts at global 90).
const CLICK = 23;      // global 113 — "Sign In"
const SWAP = 28;       // login → module menu
const POP0 = 40;       // global 130 — first module card
const PUSH = 74;       // camera dives into Quotations

const LOGIN_CARD: Rect = { x: 500, y: 160, w: 440, h: 580 };
const SIGN_IN = { x: 720, y: 628 };
const STAGE: Rect = { x: 220, y: 0, w: 1000, h: 800 };

export const Assemble: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, mode, u } = useLayout();

  const capH = mode === 'tall' ? 420 * u : mode === 'square' ? 170 * u : 0;
  const box: Rect = mode === 'wide'
    ? { x: width * 0.42, y: 70 * u, w: width * 0.54, h: height - 140 * u }
    : { x: 50 * u, y: capH + 40 * u, w: width - 100 * u, h: height - capH - 100 * u };
  // Size the canvas to the menu's own aspect so the assembly fills the frame.
  if (mode === 'square') { const h = Math.min(box.h, box.w * 0.8); box.y += (box.h - h) / 2; box.h = h; }

  // ── Part A: the login card rises out of depth and gets clicked ───────────
  const rise = spring({ frame: f, fps, config: { damping: 15, stiffness: 120 } });
  const loginOut = interpolate(f, [SWAP - 4, SWAP], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const loginBox: Rect = { x: box.x + box.w * 0.08, y: box.y, w: box.w * 0.84, h: Math.min(box.h, box.w * 0.84 * (LOGIN_CARD.h / LOGIN_CARD.w)) };
  loginBox.y = box.y + (box.h - loginBox.h) / 2;
  const loginCam = camera(LOGIN_CARD, { x: 0, y: 0, w: loginBox.w, h: loginBox.h });
  const btn = loginCam.map(SIGN_IN.x, SIGN_IN.y);

  // ── Part B: the module menu assembles piece by piece ─────────────────────
  // 9:16 re-flows the real card crops into two columns so they fill the frame.
  const tall = mode === 'tall';
  const stage = camera(tall ? { x: 220, y: 0, w: 680, h: 1220 } : STAGE, box);
  const dest = (i: number, c: Rect) => (tall ? { x: 230 + (i % 2) * 340, y: 280 + Math.floor(i / 2) * 188 } : c);
  const push = interpolate(f, [PUSH, 92], [0, 1], { ...clamp, easing: Easing.in(Easing.exp) });
  const card0 = rects.menu.cards[0];
  const d0 = dest(0, card0);
  const target = stage.map(d0.x + card0.w / 2, d0.y + card0.h / 2);
  const zoom = lerp(1, 4.2, push);
  const piece = (rect: Rect, at: number, from: 'down' | 'up' | 'wipe', z = 1, to: { x: number; y: number } = rect) => {
    const s = spring({ frame: f - at, fps, config: { damping: 13, stiffness: 170, mass: 0.7 } });
    if (f < at) return null;
    const p = stage.map(to.x, to.y);
    const tr = from === 'wipe' ? '' : `translateY(${(1 - s) * (from === 'down' ? 140 : -100) * u}px) rotateX(${(1 - s) * 50}deg) scale(${lerp(0.7, 1, s)})`;
    return (
      <Crop key={`${rect.x}-${rect.y}`} src="screens/menu.png" rect={rect} scale={stage.s} radius={from === 'down' ? 16 * stage.s : 0}
        style={{
          left: p.x, top: p.y, zIndex: z, transform: tr, opacity: Math.min(1, s * 1.6),
          clipPath: from === 'wipe' ? `inset(0 ${100 - s * 100}% 0 0)` : undefined,
          boxShadow: from === 'down' ? `0 ${20 * u}px ${50 * u}px rgba(10,26,62,${0.35 * (1 - s) + 0.08})` : undefined,
        }} />
    );
  };

  return (
    <AbsoluteFill>
      <Caption index="00" lines={mode === 'wide' ? ['Meet', 'InsureSAAS.'] : ['Meet InsureSAAS.']} accent={1} at={2} exitAt={PUSH}
        size={(mode === 'tall' ? 108 : mode === 'square' ? 78 : 92) * u} align={mode === 'wide' ? 'left' : 'center'}
        style={mode === 'wide' ? { left: width * 0.06, top: height * 0.36, width: width * 0.34 } : { left: 0, right: 0, top: (mode === 'tall' ? 170 : 40) * u }} />

      {f < SWAP && (
        <div style={{
          position: 'absolute', inset: 0, perspective: 1600 * u,
          transform: `scale(${lerp(1, 0.6, loginOut)})`, opacity: 1 - loginOut, filter: `blur(${loginOut * 14}px)`,
        }}>
          <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - rise) * 500 * u}px) rotateX(${(1 - rise) * 55}deg)`, transformOrigin: '50% 100%' }}>
            <Shot srcs={['screens/login.png']} focus={LOGIN_CARD} box={loginBox} radius={36 * u}>
              <div style={{
                position: 'absolute', left: btn.x - 230 * loginCam.s, top: btn.y - 34 * loginCam.s, width: 460 * loginCam.s, height: 68 * loginCam.s,
                borderRadius: 14 * loginCam.s, background: '#fff', opacity: interpolate(f - CLICK, [0, 2, 8], [0, 0.35, 0], clamp),
              }} />
            </Shot>
            <div style={{ position: 'absolute', left: loginBox.x, top: loginBox.y }}>
              <Cursor path={[[6, btn.x + 300 * u, btn.y + 380 * u], [CLICK - 2, btn.x + 40 * u, btn.y + 6 * u]]} clicks={[CLICK]} size={64 * u} />
            </div>
          </div>
        </div>
      )}

      {f >= SWAP && (
        <div style={{
          position: 'absolute', inset: 0, perspective: 2000 * u,
          transformOrigin: `${target.x}px ${target.y}px`, transform: `scale(${zoom})`, filter: `blur(${push * 16}px)`, opacity: 1 - push * 0.7,
        }}>
          {/* the app canvas itself unrolls first */}
          <div style={{
            position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: 32 * u,
            background: 'linear-gradient(180deg,#EDF3FA,#F2F7FC)', overflow: 'hidden',
            transform: `scaleY(${interpolate(f, [SWAP, SWAP + 8], [0, 1], { ...clamp, easing: ease })})`, transformOrigin: '50% 0%',
            boxShadow: `0 ${40 * u}px ${120 * u}px rgba(0,0,0,.55), 0 0 80px rgba(56,163,224,.2)`,
          }} />
          <div style={{ position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: 32 * u, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: -box.x, top: -box.y, width, height }}>
              {piece(tall ? { x: 40, y: 0, w: 680, h: 80 } : { x: STAGE.x, y: 0, w: STAGE.w, h: 80 }, SWAP + 2, 'up', 3, tall ? { x: 220, y: 0 } : undefined)}
              {piece({ x: 225, y: 105, w: 520, h: 75 }, SWAP + 6, 'wipe')}
              {piece({ x: 225, y: 240, w: 120, h: 26 }, SWAP + 9, 'wipe')}
              {rects.menu.cards.map((c, i) => piece(c, POP0 + i * 4, 'down', 2, dest(i, c)))}
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
