import React from 'react';
import { Composition } from 'remotion';
import { Promo } from './Promo';
import T from './timeline.json';

// One timeline, three canvases. Every scene lays itself out from useLayout().
export const Root: React.FC = () => (
  <>
    <Composition id="Vertical" component={Promo} durationInFrames={T.durationInFrames} fps={T.fps} width={1080} height={1920} />
    <Composition id="Square" component={Promo} durationInFrames={T.durationInFrames} fps={T.fps} width={1080} height={1080} />
    <Composition id="Wide" component={Promo} durationInFrames={T.durationInFrames} fps={T.fps} width={1920} height={1080} />
  </>
);
