import React from 'react';
import { Composition } from 'remotion';
import { Promo } from './Promo';
import { GRID, Reel } from './kit/Reel';
import { REELS } from './reels';
import T from './timeline.json';

// One timeline, three canvases. Every scene lays itself out from useLayout().
export const Root: React.FC = () => (
  <>
    <Composition id="Vertical" component={Promo} durationInFrames={T.durationInFrames} fps={T.fps} width={1080} height={1920} />
    <Composition id="Square" component={Promo} durationInFrames={T.durationInFrames} fps={T.fps} width={1080} height={1080} />
    <Composition id="Wide" component={Promo} durationInFrames={T.durationInFrames} fps={T.fps} width={1920} height={1080} />
    {REELS.flatMap((r) => {
      // Configs hold functions (drawn logos, page lookups), which props can't
      // carry, so each reel gets its own closed-over component.
      const C: React.FC = () => <Reel config={r} />;
      return [
        <Composition key={`${r.slug}-wide`} id={`${r.slug}-wide`} component={C} durationInFrames={GRID.durationInFrames} fps={GRID.fps} width={1920} height={1080} />,
        <Composition key={`${r.slug}-tall`} id={`${r.slug}-tall`} component={C} durationInFrames={GRID.durationInFrames} fps={GRID.fps} width={1080} height={1920} />,
      ];
    })}
  </>
);
