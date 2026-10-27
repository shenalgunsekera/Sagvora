import { GRID, ReelConfig } from './Reel';

/** The sound-effect cues for one reel, on the same frames its cursor clicks and messages land. */
export const timelineFor = (c: ReelConfig) => {
  const g = GRID;
  const click = [g.reveal.from + 23];
  const key: number[] = [];
  const pop: number[] = [];
  (['f1', 'f2', 'f3'] as const).forEach((k, i) => {
    const s = c.features[i];
    const from = g[k].from;
    if (s.kind === 'page') {
      s.cursor.clicks.forEach((f) => click.push(from + f));
      s.keys?.forEach((f) => key.push(from + f));
    } else {
      for (const m of s.messages) {
        if (m.from === 'bot') pop.push(from + m.at);
        else for (let t = 6; t >= 1; t--) key.push(from + m.at - t * 2);
        if (m.tap !== undefined) click.push(from + m.at + 14);
      }
    }
  });
  return {
    fps: g.fps,
    bpm: 120,
    durationInFrames: g.durationInFrames,
    scenes: {
      hook: g.hook, assemble: g.reveal, compare: g.f1, search: g.f2, claims: g.f3,
      metric: g.metric, logo: g.end,
    },
    sfx: {
      impact: [0, 15, 30, 45, 60, g.metric.from, g.end.from],
      whoosh: [84, 174, 264, 354, 444, 519],
      click, key, pop,
    },
  };
};
