import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  Browser, Caption, Cursor, Highlight, INTER, LogoMark, LogoSpec, Page, PerMode, Rect, boxFor, centre, clamp, ease, easeInOut,
  fitFocus, lerp, per, useLayout, useTheme,
} from './kit';

/* ── 1. Hook: the problem in five words ─────────────────────────────────── */

export type HookSpec = {
  words: string[];
  /** Short notes that drift behind the words: the mess the product replaces. */
  noise: string[];
  /** Wide layout only: a supporting line on the right. */
  aside: string;
};

const BEATS = [0, 15, 30, 45, 60];
const fitSize = (word: string, w: number, max: number) => Math.min(max, w / (word.length * 0.72));

const Noise: React.FC<{ items: string[]; start: number }> = ({ items, start }) => {
  const f = useCurrentFrame();
  const { width, height, u } = useLayout();
  const t = useTheme();
  const d = f - start;
  if (d < -2) return null;
  return (
    <AbsoluteFill>
      {Array.from({ length: 14 }).map((_, i) => {
        const text = items[i % items.length];
        const appear = interpolate(d - i * 1.2, [0, 6], [0, 1], clamp);
        const x = random(`nx${i}`) * width * 0.9;
        const y = random(`ny${i}`) * height * 0.92;
        const rot = (random(`nr${i}`) - 0.5) * 18;
        return (
          <div key={i} style={{
            position: 'absolute', left: x - 120 * u, top: y, transform: `rotate(${rot}deg) translateY(${-d * 1.6 * u}px) scale(${lerp(0.7, 1, appear)})`,
            opacity: appear * 0.85, fontFamily: INTER, fontSize: 24 * u, fontWeight: 600, color: '#fff',
            padding: `${12 * u}px ${18 * u}px`, borderRadius: 14 * u, whiteSpace: 'nowrap',
            background: 'rgba(20,20,26,.72)', border: `${2 * u}px solid ${i % 4 === 0 ? t.secondary : 'rgba(255,255,255,.14)'}`,
            boxShadow: '0 18px 40px rgba(0,0,0,.45)',
          }}>{text}</div>
        );
      })}
    </AbsoluteFill>
  );
};

export const Hook: React.FC<{ spec: HookSpec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, mode, u } = useLayout();
  const t = useTheme();
  const avail = width * (mode === 'wide' ? 0.42 : 0.86);
  const max = (mode === 'tall' ? 250 : 200) * u;
  const suck = interpolate(f, [80, 92], [0, 1], { ...clamp, easing: (x) => x * x * x });
  let shake = 0;
  for (const b of BEATS) { const d = f - b; if (d >= 0 && d < 10) shake = Math.max(shake, (1 - d / 10) * 14 * u); }
  const sx = (random(`sx${f}`) - 0.5) * shake, sy = (random(`sy${f}`) - 0.5) * shake;

  const words = spec.words.map((w, i) => {
    const d = f - BEATS[i];
    if (d < 0) return null;
    const s = spring({ frame: d, fps, config: { damping: 12, stiffness: 260, mass: 0.6 } });
    const size = fitSize(w, avail, max);
    const isLast = i === spec.words.length - 1;
    const glitch = isLast && d > 6 ? (random(`gl${f}`) > 0.75 ? (random(`gx${f}`) - 0.5) * 30 * u : 0) : 0;
    return (
      <div key={w + i} style={{
        fontFamily: INTER, fontWeight: 900, fontSize: size, lineHeight: 0.92, letterSpacing: -size * 0.04,
        color: isLast ? t.secondary : '#fff', transform: `translateX(${glitch}px) scale(${lerp(2.6, 1, s)})`,
        opacity: Math.min(1, d / 2), filter: `blur(${Math.max(0, (1 - s) * 10)}px)`, whiteSpace: 'nowrap',
        textShadow: isLast ? `0 0 ${40 * u}px ${t.secondary}99, ${-glitch * 0.4}px 0 0 ${t.primary}` : `0 ${10 * u}px ${40 * u}px rgba(0,0,0,.5)`,
      }}>{w}</div>
    );
  });

  return (
    <AbsoluteFill>
      <div style={{ opacity: (1 - suck) * (mode === 'wide' ? 0.55 : 0.8) }}><Noise items={spec.noise} start={52} /></div>
      <AbsoluteFill style={{
        justifyContent: 'center', alignItems: mode === 'wide' ? 'flex-start' : 'center', paddingLeft: mode === 'wide' ? width * 0.08 : 0,
        transform: `translate(${sx}px, ${sy}px) scale(${lerp(1, 0.04, suck)}) rotate(${suck * 25}deg)`,
        opacity: 1 - interpolate(suck, [0.7, 1], [0, 1], clamp),
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: mode === 'wide' ? 'flex-start' : 'center', gap: 6 * u }}>{words}</div>
      </AbsoluteFill>
      {mode === 'wide' && (
        <div style={{
          position: 'absolute', right: width * 0.07, top: height * 0.5 - 120 * u, width: width * 0.36, fontFamily: INTER, color: t.soft,
          fontSize: 34 * u, fontWeight: 600, lineHeight: 1.35, opacity: interpolate(f, [62, 72], [0, 1], clamp) * (1 - suck),
          transform: `translateY(${interpolate(f, [62, 75], [30, 0], { ...clamp, easing: ease })}px)`,
        }}>{spec.aside}</div>
      )}
      <AbsoluteFill style={{ background: '#fff', opacity: interpolate(f, [88, 90, 92], [0, 0.5, 0], clamp) }} />
    </AbsoluteFill>
  );
};

/* ── 2. Reveal: logo, then the site rises and gets its first click ─────── */

export type RevealSpec = {
  name: string;
  page: Page;
  /** What the cursor clicks (page px). */
  click: Rect;
};

const R_CLICK = 23;
const R_PUSH = 72;

export const Reveal: React.FC<{ spec: RevealSpec; logo: LogoSpec }> = ({ spec, logo }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, mode, u } = useLayout();
  const t = useTheme();
  const box = boxFor(mode, width, height, u);
  const rise = spring({ frame: f - 4, fps, config: { damping: 15, stiffness: 110 } });
  const push = interpolate(f, [R_PUSH, 92], [0, 1], { ...clamp, easing: Easing.in(Easing.exp) });
  const aspect = (box.h - 54 * u) / box.w;
  // Open on the top of the page, as wide as the page height allows.
  const w0 = Math.min(mode === 'tall' ? 900 : 1440, spec.page.h / aspect);
  const target = centre(spec.click);
  const zoomW = lerp(w0, w0 * 0.35, push);
  const focus = fitFocus(lerp(spec.page.w / 2, target.x, push), lerp(w0 * aspect / 2, target.y, push), zoomW, aspect, spec.page);
  const logoW = (mode === 'tall' ? 420 : 520) * u;
  const ls = spring({ frame: f, fps, config: { damping: 13, stiffness: 150 } });

  return (
    <AbsoluteFill>
      {/* logo + "Meet X." */}
      <div style={{
        position: 'absolute', display: 'flex', flexDirection: 'column', gap: 26 * u,
        alignItems: mode === 'wide' ? 'flex-start' : 'center',
        ...(mode === 'wide' ? { left: width * 0.06, top: height * 0.3, width: width * 0.32 } : { left: 0, right: 0, top: 70 * u, gap: 14 * u }),
        opacity: 1 - push, transform: `scale(${lerp(0.7, 1, ls)})`, transformOrigin: mode === 'wide' ? '0 50%' : '50% 0',
      }}>
        <LogoMark logo={logo} width={Math.min(logoW, (mode === 'wide' ? width * 0.3 : width * 0.7), (mode === 'tall' ? 250 * u : 1e9) / logo.ratio)} glow={`${t.primary}aa`} />
        <Caption index="00" label={spec.name} lines={[`Meet ${spec.name}.`]} at={6} size={(mode === 'tall' ? 68 : 70) * u}
          align={mode === 'wide' ? 'left' : 'center'} style={{ position: 'relative' }} />
      </div>

      <div style={{ position: 'absolute', inset: 0, perspective: 2000 * u }}>
        <div style={{
          position: 'absolute', inset: 0, transformOrigin: '50% 100%',
          transform: `translateY(${(1 - rise) * 600 * u}px) rotateX(${(1 - rise) * 40}deg) scale(${lerp(1, 1.08, push)})`,
          opacity: Math.min(1, rise * 2) * (1 - push * 0.8), filter: `blur(${push * 14}px)`,
        }}>
          <Browser pages={[spec.page]} focus={focus} box={box} radius={30 * u}>
            {(map) => {
              const c = map(target.x, target.y);
              const r = spec.click;
              const a = map(r.x, r.y), b = map(r.x + r.w, r.y + r.h);
              return (
                <>
                  <div style={{
                    position: 'absolute', left: a.x, top: a.y, width: b.x - a.x, height: b.y - a.y, borderRadius: 10 * u,
                    background: '#fff', opacity: interpolate(f - R_CLICK, [0, 2, 8], [0, 0.45, 0], clamp),
                  }} />
                  <Cursor path={[[8, c.x + 260 * u, c.y + 300 * u], [R_CLICK - 2, c.x + 6 * u, c.y + 4 * u], [92, c.x + 6 * u, c.y + 4 * u]]} clicks={[R_CLICK]} size={58 * u} />
                </>
              );
            }}
          </Browser>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── 3. Page feature: caption + browser camera + cursor ─────────────────── */

export type CamKey = { f: number; cx: number; cy: number; w: PerMode<number> };
export type PageFeatureSpec = {
  kind: 'page';
  label: string;
  lines: { tall: string[]; wide: string[] };
  accent: number;
  /** [fromFrame, page]: the capture shown from that local frame on (cross-fades). */
  frames: [number, Page][];
  cam: CamKey[];
  /** Cursor path in page px: [frame, x, y]. */
  cursor: { path: [number, number, number][]; clicks: number[] };
  highlight?: { rect: Rect; at: number };
  /** Local frames that get a keystroke sound (typing shots). */
  keys?: number[];
};

export const PageFeature: React.FC<{ spec: PageFeatureSpec; index: string; duration: number }> = ({ spec, index, duration }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, mode, u } = useLayout();
  const box = boxFor(mode, width, height, u);
  const aspect = (box.h - 54 * u) / box.w;
  const page = spec.frames[0][1];

  const key = (() => {
    const c = spec.cam;
    const at = (i: number) => ({ cx: c[i].cx, cy: c[i].cy, w: per(c[i].w, mode) });
    if (f <= c[0].f) return at(0);
    for (let i = 1; i < c.length; i++) {
      if (f <= c[i].f) {
        const k = easeInOut((f - c[i - 1].f) / (c[i].f - c[i - 1].f));
        const a = at(i - 1), b = at(i);
        return { cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), w: lerp(a.w, b.w, k) };
      }
    }
    return at(c.length - 1);
  })();
  const focus = fitFocus(key.cx, key.cy, key.w, aspect, page);

  const mix = spec.frames.map(([from], i) => {
    const next = spec.frames[i + 1]?.[0] ?? Infinity;
    const a = i === 0 ? 1 : interpolate(f, [from, from + 3], [0, 1], clamp);
    const b = next === Infinity ? 1 : interpolate(f, [next, next + 3], [1, 0], clamp);
    return Math.min(a, b);
  });

  const s = spring({ frame: f, fps, config: { damping: 16, stiffness: 110 } });
  const out = interpolate(f, [duration - 9, duration], [0, 1], clamp);
  const swing = mode === 'wide' ? `rotateY(${(1 - s) * -35 + out * 25}deg)` : `rotateX(${(1 - s) * 40 - out * 30}deg)`;
  const capSize = (mode === 'tall' ? 104 : 96) * u;
  const capStyle: React.CSSProperties = mode === 'wide'
    ? { left: width * 0.055, top: height * 0.3, width: width * 0.33 }
    : { left: 40 * u, right: 40 * u, top: 150 * u };

  return (
    <AbsoluteFill>
      <Caption index={index} label={spec.label} lines={spec.lines[mode === 'wide' ? 'wide' : 'tall']} accent={spec.accent}
        at={3} exitAt={duration - 10} size={capSize} align={mode === 'wide' ? 'left' : 'center'} style={capStyle} />
      <div style={{ position: 'absolute', inset: 0, perspective: 2200 * u }}>
        <div style={{
          position: 'absolute', inset: 0, transformOrigin: mode === 'wide' ? '100% 50%' : '50% 100%',
          transform: `${swing} translateY(${(1 - s) * 200 * u + out * -120 * u}px) scale(${lerp(1, 0.92, out)})`,
          opacity: Math.min(1, s * 2) * (1 - out), filter: `blur(${out * 12}px)`,
        }}>
          <Browser pages={spec.frames.map(([, p]) => p)} mix={mix} focus={focus} box={box} radius={30 * u}>
            {(map, sc) => {
              const path = spec.cursor.path.map(([fr, x, y]) => { const p = map(x, y); return [fr, p.x, p.y] as [number, number, number]; });
              const hl = spec.highlight && (() => { const p = map(spec.highlight.rect.x, spec.highlight.rect.y); return { x: p.x, y: p.y, w: spec.highlight.rect.w * sc, h: spec.highlight.rect.h * sc }; })();
              return (
                <>
                  {hl && <Highlight rect={hl} from={spec.highlight!.at} />}
                  <Cursor path={path} clicks={spec.cursor.clicks} size={58 * u} />
                </>
              );
            }}
          </Browser>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── 3b. Chat feature: a messenger thread, message by message ──────────── */

export type ChatMsg = { at: number; from: 'bot' | 'me'; text: string; buttons?: string[]; tap?: number; image?: boolean };
export type ChatFeatureSpec = {
  kind: 'chat';
  label: string;
  title: string;
  lines: { tall: string[]; wide: string[] };
  accent: number;
  messages: ChatMsg[];
};

/** Bold *word* spans, Telegram-style. */
const rich = (text: string) => text.split(/(\*[^*]+\*)/g).map((p, i) => (p.startsWith('*') ? <b key={i}>{p.slice(1, -1)}</b> : <React.Fragment key={i}>{p}</React.Fragment>));

export const ChatFeature: React.FC<{ spec: ChatFeatureSpec; index: string; duration: number }> = ({ spec, index, duration }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, mode, u } = useLayout();
  const t = useTheme();
  const box = boxFor(mode, width, height, u);
  const phoneW = Math.min(box.w, box.h * 0.56);
  const phone: Rect = { x: box.x + (box.w - phoneW) / 2, y: box.y, w: phoneW, h: box.h };
  const k = phoneW / 600;
  const s = spring({ frame: f, fps, config: { damping: 16, stiffness: 110 } });
  const out = interpolate(f, [duration - 9, duration], [0, 1], clamp);

  const shown = spec.messages.filter((m) => f >= m.at);
  // Keep the newest message in view: the thread scrolls up as it grows.
  const lineH = 70 * k;
  const est = (m: ChatMsg) => (Math.ceil(m.text.length / 30) * 34 + 40 + (m.buttons ? 64 : 0) + (m.image ? 200 : 0)) * k + lineH * 0.2;
  const total = shown.reduce((a, m) => a + est(m), 0);
  const avail = phone.h - 150 * k;
  const scroll = Math.max(0, total - avail);

  return (
    <AbsoluteFill>
      <Caption index={index} label={spec.label} lines={spec.lines[mode === 'wide' ? 'wide' : 'tall']} accent={spec.accent}
        at={3} exitAt={duration - 10} size={(mode === 'tall' ? 104 : 96) * u} align={mode === 'wide' ? 'left' : 'center'}
        style={mode === 'wide' ? { left: width * 0.055, top: height * 0.3, width: width * 0.33 } : { left: 40 * u, right: 40 * u, top: 150 * u }} />
      <div style={{
        position: 'absolute', left: phone.x, top: phone.y, width: phone.w, height: phone.h, borderRadius: 54 * k, overflow: 'hidden',
        background: 'linear-gradient(180deg,#0e1621,#17212b)', border: `${10 * k}px solid #0b0b0f`,
        boxShadow: `0 ${40 * u}px ${120 * u}px rgba(0,0,0,.6), 0 0 ${90 * u}px ${t.primary}44`,
        transform: `translateY(${(1 - s) * 260 * u + out * -120 * u}px) scale(${lerp(0.9, 1, s) * lerp(1, 0.92, out)})`,
        opacity: Math.min(1, s * 2) * (1 - out), filter: `blur(${out * 12}px)`, fontFamily: INTER,
      }}>
        {/* header */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 110 * k, background: '#17212b', display: 'flex', alignItems: 'center', gap: 18 * k, padding: `${30 * k}px ${26 * k}px 0`, zIndex: 2, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ width: 58 * k, height: 58 * k, borderRadius: 99, background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 900, fontSize: 30 * k }}>♠</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 28 * k }}>{spec.title}</div>
            <div style={{ color: '#6ab3f3', fontSize: 21 * k }}>bot</div>
          </div>
        </div>
        {/* thread */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 120 * k, bottom: 20 * k, overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 * k, padding: `0 ${22 * k}px`, transform: `translateY(${-scroll}px)` }}>
            {shown.map((m, i) => {
              const d = f - m.at;
              const p = spring({ frame: d, fps, config: { damping: 15, stiffness: 220 } });
              const me = m.from === 'me';
              return (
                <div key={i} style={{ alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '82%', transform: `translateY(${(1 - p) * 30 * k}px) scale(${lerp(0.9, 1, p)})`, opacity: p, transformOrigin: me ? '100% 100%' : '0 100%' }}>
                  <div style={{
                    background: me ? '#2b5278' : '#182533', color: '#fff', fontSize: 25 * k, lineHeight: 1.38, whiteSpace: 'pre-wrap',
                    padding: `${14 * k}px ${20 * k}px`, borderRadius: 22 * k, borderBottomRightRadius: me ? 6 * k : 22 * k, borderBottomLeftRadius: me ? 22 * k : 6 * k,
                  }}>
                    {m.image && (
                      <div style={{ height: 190 * k, borderRadius: 14 * k, marginBottom: 10 * k, background: 'linear-gradient(135deg,#0f9d58,#1db954)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 900, fontSize: 38 * k }}>$100 sent ✓</div>
                    )}
                    {rich(m.text)}
                  </div>
                  {m.buttons && (
                    <div style={{ display: 'flex', gap: 8 * k, marginTop: 8 * k }}>
                      {m.buttons.map((b, bi) => {
                        const tapped = m.tap === bi && f >= m.at + 14;
                        return (
                          <div key={b} style={{
                            flex: 1, textAlign: 'center', padding: `${12 * k}px 0`, borderRadius: 14 * k, fontSize: 22 * k, fontWeight: 600, color: '#fff',
                            background: tapped ? t.secondary : 'rgba(43,82,120,.55)', transition: 'none',
                          }}>{b}</div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── 4. Metric ──────────────────────────────────────────────────────────── */

export type MetricSpec = { value: number; prefix?: string; suffix?: string; line1: string; line2: string; chips: string[]; wall: Page[] };

export const Metric: React.FC<{ spec: MetricSpec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, mode, u } = useLayout();
  const t = useTheme();
  const count = Math.round(interpolate(f, [0, 22], [0, spec.value], { ...clamp, easing: ease }));
  const slam = spring({ frame: f, fps, config: { damping: 10, stiffness: 200, mass: 0.8 } });
  const out = interpolate(f, [68, 77], [0, 1], clamp);
  const digits = `${spec.prefix ?? ''}${spec.value}${spec.suffix ?? ''}`.length;
  const numSize = Math.min((mode === 'tall' ? 520 : 440) * u, (width * 0.82) / (digits * 0.62));
  const tileW = 560 * u, tileH = 350 * u;
  const wall = Array.from({ length: 9 }).map((_, i) => {
    const p = spec.wall[i % spec.wall.length];
    const col = i % 3, row = Math.floor(i / 3);
    return (
      <div key={i} style={{
        position: 'absolute', width: tileW, height: tileH, borderRadius: 18 * u, overflow: 'hidden',
        left: (col - 1) * (tileW + 40 * u) - tileW / 2, top: (row - 1) * (tileH + 40 * u) - tileH / 2, boxShadow: '0 30px 80px rgba(0,0,0,.6)',
      }}>
        {/* Screen-sized thumbnails (made with the captures): nine full-length
            pages decoded at once is more than the renderer will hold. */}
        <Img src={staticFile(p.src.replace(/.jpg$/, '-thumb.jpg'))} style={{ width: tileW, height: tileH, objectFit: 'cover', objectPosition: 'top' }} />
      </div>
    );
  });
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `scale(${lerp(1, 1.3, out)})`, filter: `blur(${out * 14}px)` }}>
      <div style={{ position: 'absolute', left: width / 2, top: height / 2, perspective: 1400 * u }}>
        <div style={{ transform: `rotateX(${32 - f * 0.12}deg) rotateZ(${-14 + f * 0.08}deg) translateY(${-f * 2.5 * u}px) scale(${mode === 'tall' ? 1.35 : 1.1})`, opacity: 0.3, filter: 'saturate(.7)' }}>{wall}</div>
      </div>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, ${t.bg[1]}EE 20%, ${t.bg[1]}88 60%, transparent 100%)` }} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: INTER, textAlign: 'center' }}>
        <div style={{
          fontSize: numSize, fontWeight: 900, lineHeight: 0.85, letterSpacing: -numSize * 0.06,
          backgroundImage: `linear-gradient(180deg, #FFFFFF 10%, ${t.primary} 75%)`, WebkitBackgroundClip: 'text', color: 'transparent',
          transform: `scale(${lerp(2.2, 1, slam)})`, filter: `drop-shadow(0 0 ${60 * u}px ${t.primary}88)`, fontVariantNumeric: 'tabular-nums',
        }}>{spec.prefix}{count}{spec.suffix}</div>
        <div style={{ fontSize: 70 * u, fontWeight: 900, color: '#fff', letterSpacing: -2 * u, marginTop: 14 * u, padding: `0 ${40 * u}px`,
          opacity: interpolate(f, [10, 18], [0, 1], clamp), transform: `translateY(${interpolate(f, [10, 22], [40, 0], { ...clamp, easing: ease })}px)` }}>{spec.line1}</div>
        <div style={{ fontSize: 70 * u, fontWeight: 900, color: t.secondary, letterSpacing: -2 * u, padding: `0 ${40 * u}px`,
          opacity: interpolate(f, [24, 30], [0, 1], clamp), transform: `scale(${lerp(1.6, 1, spring({ frame: f - 24, fps, config: { damping: 12, stiffness: 220 } }))})` }}>{spec.line2}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 * u, maxWidth: width * 0.86, marginTop: 40 * u }}>
          {spec.chips.map((c, i) => {
            const s = spring({ frame: f - 30 - i * 1.5, fps, config: { damping: 14, stiffness: 240 } });
            return (
              <span key={c} style={{ fontSize: 26 * u, fontWeight: 800, color: '#fff', padding: `${8 * u}px ${18 * u}px`, borderRadius: 999,
                border: `${2 * u}px solid ${t.primary}88`, background: `${t.primary}33`, transform: `scale(${s})`, opacity: s }}>{c}</span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ── 5. End card ────────────────────────────────────────────────────────── */

export type EndSpec = { tagline: string; cta: string };

export const End: React.FC<{ spec: EndSpec; logo: LogoSpec }> = ({ spec, logo }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, mode, u } = useLayout();
  const t = useTheme();
  const logoW = Math.min(width * (mode === 'wide' ? 0.4 : 0.74), 860 * u);
  const s = spring({ frame: f, fps, config: { damping: 11, stiffness: 160, mass: 0.9 } });
  const ring = (delay: number, color: string) => {
    const k = interpolate(f - delay, [0, 26], [0, 1], { ...clamp, easing: ease });
    const r = lerp(50, 1500, k) * u;
    return <div style={{ position: 'absolute', width: r, height: r, borderRadius: '50%', border: `${lerp(14, 1, k) * u}px solid ${color}`, opacity: 1 - k }} />;
  };
  const cta = spring({ frame: f - 22, fps, config: { damping: 13, stiffness: 180 } });
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: INTER }}>
      {ring(0, t.primary)}
      {ring(5, t.secondary)}
      <div style={{ transform: `scale(${lerp(0.4, 1, s)})`, filter: `blur(${(1 - Math.min(s, 1)) * 12}px)` }}>
        <LogoMark logo={logo} width={logoW} glow={`${t.primary}aa`} />
      </div>
      <div style={{
        marginTop: 38 * u, fontSize: 32 * u, fontWeight: 600, letterSpacing: 9 * u, color: t.soft, textTransform: 'uppercase', textAlign: 'center', padding: `0 ${50 * u}px`,
        opacity: interpolate(f, [12, 22], [0, 1], clamp), transform: `translateY(${interpolate(f, [12, 24], [20, 0], { ...clamp, easing: ease })}px)`,
      }}>{spec.tagline}</div>
      <div style={{
        marginTop: 56 * u, display: 'flex', alignItems: 'center', gap: 18 * u, padding: `${24 * u}px ${44 * u}px`, borderRadius: 999,
        background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`, color: t.ctaText ?? '#fff', fontSize: 38 * u, fontWeight: 800,
        boxShadow: `0 ${20 * u}px ${60 * u}px ${t.primary}88, inset 0 0 0 ${2 * u}px rgba(255,255,255,.25)`,
        transform: `scale(${cta}) translateY(${(1 - cta) * 40}px)`, opacity: Math.min(1, cta * 1.5), whiteSpace: 'nowrap',
      }}>
        {spec.cta}
        <span style={{ fontWeight: 600, opacity: 0.9 }}>→ {t.url}</span>
      </div>
    </AbsoluteFill>
  );
};
