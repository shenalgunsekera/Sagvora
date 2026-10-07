import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Background, CutFlash } from './Background';
import { Hook } from './scenes/Hook';
import { Assemble } from './scenes/Assemble';
import { Feature, FeatureProps } from './scenes/Feature';
import { Metric } from './scenes/Metric';
import { Logo } from './scenes/Logo';
import T from './timeline.json';

const S = T.scenes;
const W = (tall: number, square: number, wide: number) => ({ tall, square, wide });

// Local frames inside each 92-frame feature scene. Click frames match timeline.json sfx.
const COMPARE: FeatureProps = {
  index: '01', accent: 2, duration: S.compare.duration,
  lines: { tall: ['Compare every', 'insurer.'], square: ['Compare every insurer.'], wide: ['Compare', 'every', 'insurer.'] },
  frames: [[0, 'screens/quotes.png'], [48, 'screens/quotes-compare.png']],
  cam: [
    { f: 0, cx: W(820, 850, 850), cy: 560, w: W(820, 1150, 1150) },
    { f: 38, cx: W(930, 1000, 1000), cy: 660, w: W(860, 900, 900) },
    { f: 50, cx: W(930, 1000, 1000), cy: 660, w: W(860, 900, 900) },
    { f: 62, cx: W(640, 850, 850), cy: 690, w: W(720, 1110, 1110) },
    { f: 90, cx: W(1060, 850, 850), cy: 700, w: W(720, 1110, 1110) },
  ],
  cursor: { path: [[8, 980, 900], [40, 1300, 717], [76, 1210, 870]], clicks: [45] },
  highlight: { rect: { x: 301, y: 789, w: 1098, h: 46 }, at: 58 },
};

const SEARCH: FeatureProps = {
  index: '02', accent: 3, duration: S.search.duration,
  lines: { tall: ['Find any policy.', 'Instantly.'], square: ['Find any policy. Instantly.'], wide: ['Find any', 'policy.', 'Instantly.'] },
  frames: [[0, 'screens/uw.png'], ...[1, 2, 3, 4, 5, 6].map((i) => [15 + i * 6, `screens/uw-search-${i}.png`] as [number, string])],
  cam: [
    { f: 0, cx: W(1060, 860, 860), cy: W(260, 420, 420), w: W(760, 1160, 1160) },
    { f: 18, cx: W(1100, 980, 980), cy: W(230, 330, 330), w: W(640, 1000, 1000) },
    { f: 52, cx: W(1100, 980, 980), cy: W(230, 330, 330), w: W(640, 1000, 1000) },
    { f: 70, cx: W(700, 850, 850), cy: W(300, 380, 380), w: W(860, 1150, 1150) },
  ],
  cursor: { path: [[2, 1260, 330], [12, 1170, 32], [60, 1300, 130]], clicks: [14] },
  highlight: { rect: { x: 287, y: 262, w: 1129, h: 122 }, at: 60 },
};

const CLAIMS: FeatureProps = {
  index: '03', accent: 4, duration: S.claims.duration,
  lines: { tall: ['Track every claim', 'to payout.'], square: ['Track every claim to payout.'], wide: ['Track every', 'claim to', 'payout.'] },
  frames: [[0, 'screens/claims.png'], [33, 'screens/claims-open.png']],
  cam: [
    { f: 0, cx: W(720, 850, 850), cy: 520, w: W(780, 1100, 1100) },
    { f: 26, cx: W(640, 820, 820), cy: 640, w: W(640, 950, 950) },
    { f: 40, cx: W(640, 820, 820), cy: 660, w: W(640, 950, 950) },
    { f: 62, cx: W(1000, 850, 850), cy: 720, w: W(720, 1060, 1060) },
  ],
  cursor: { path: [[6, 760, 860], [26, 430, 688], [70, 1120, 820]], clicks: [30] },
  highlight: { rect: { x: 1180, y: 678, w: 122, h: 40 }, at: 54 },
};

export const Promo: React.FC = () => (
  <AbsoluteFill style={{ background: '#050C20' }}>
    <Background />
    <Sequence from={S.hook.from} durationInFrames={S.hook.duration}><Hook /></Sequence>
    <Sequence from={S.assemble.from} durationInFrames={S.assemble.duration}><Assemble /></Sequence>
    <Sequence from={S.compare.from} durationInFrames={S.compare.duration}><Feature {...COMPARE} /></Sequence>
    <Sequence from={S.search.from} durationInFrames={S.search.duration}><Feature {...SEARCH} /></Sequence>
    <Sequence from={S.claims.from} durationInFrames={S.claims.duration}><Feature {...CLAIMS} /></Sequence>
    <Sequence from={S.metric.from} durationInFrames={S.metric.duration}><Metric /></Sequence>
    <Sequence from={S.logo.from} durationInFrames={S.logo.duration}><Logo /></Sequence>
    <CutFlash />
    <Audio src={staticFile('music.wav')} />
  </AbsoluteFill>
);
