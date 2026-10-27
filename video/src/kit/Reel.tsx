import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Background, CutFlash, LogoSpec, Theme, ThemeProvider } from './kit';
import { ChatFeatureSpec, ChatFeature, End, EndSpec, Hook, HookSpec, Metric, MetricSpec, PageFeature, PageFeatureSpec, Reveal, RevealSpec } from './scenes';

/** Same 120 BPM grid as the InsureSAAS cut: 20 s, a scene every 92 frames. */
export const GRID = {
  fps: 30,
  durationInFrames: 600,
  hook: { from: 0, duration: 92 },
  reveal: { from: 90, duration: 92 },
  f1: { from: 180, duration: 92 },
  f2: { from: 270, duration: 92 },
  f3: { from: 360, duration: 92 },
  metric: { from: 450, duration: 77 },
  end: { from: 525, duration: 75 },
};

export type ReelConfig = {
  slug: string;
  theme: Theme;
  logo: LogoSpec;
  hook: HookSpec;
  reveal: RevealSpec;
  features: [Feature, Feature, Feature];
  metric: MetricSpec;
  end: EndSpec;
  /** Semitones to shift the score, so every reel has its own key. */
  transpose?: number;
};
type Feature = PageFeatureSpec | ChatFeatureSpec;

const FeatureScene: React.FC<{ spec: Feature; index: string; duration: number }> = ({ spec, index, duration }) =>
  spec.kind === 'chat' ? <ChatFeature spec={spec} index={index} duration={duration} /> : <PageFeature spec={spec} index={index} duration={duration} />;

export const Reel: React.FC<{ config: ReelConfig }> = ({ config: c }) => {
  const g = GRID;
  return (
    <ThemeProvider value={c.theme}>
      <AbsoluteFill style={{ background: c.theme.bg[2] }}>
        <Background grooveFrom={g.reveal.from} grooveTo={g.metric.from} />
        <Sequence from={g.hook.from} durationInFrames={g.hook.duration}><Hook spec={c.hook} /></Sequence>
        <Sequence from={g.reveal.from} durationInFrames={g.reveal.duration}><Reveal spec={c.reveal} logo={c.logo} /></Sequence>
        {(['f1', 'f2', 'f3'] as const).map((k, i) => (
          <Sequence key={k} from={g[k].from} durationInFrames={g[k].duration}>
            <FeatureScene spec={c.features[i]} index={`0${i + 1}`} duration={g[k].duration} />
          </Sequence>
        ))}
        <Sequence from={g.metric.from} durationInFrames={g.metric.duration}><Metric spec={c.metric} /></Sequence>
        <Sequence from={g.end.from} durationInFrames={g.end.duration}><End spec={c.end} logo={c.logo} /></Sequence>
        <CutFlash cuts={[g.reveal.from, g.f1.from, g.f2.from, g.f3.from, g.metric.from, g.end.from]} />
        <Audio src={staticFile(`${c.slug}/music.wav`)} />
      </AbsoluteFill>
    </ThemeProvider>
  );
};
