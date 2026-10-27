import { centre, pageOf } from '../kit/kit';
import type { ReelConfig } from '../kit/Reel';
import rects from '../../public/ascend/rects.json';

const P = (n: string) => pageOf('ascend', rects, n);
const home = P('home'), services = P('services'), program = P('program');

const climb = home.find('Start the climb');
const tms = home.find('Talent Management Services');
const assess = services.find('Leadership Assessments');
const discover = program.find('Discover');
const launch = program.find('Launch, Evaluate & Sustain');

export const ascend: ReelConfig = {
  slug: 'ascend',
  transpose: 3,
  theme: { bg: ['#173a63', '#0a1a33', '#040a17'], primary: '#3B82C4', secondary: '#6FE0B0', soft: 'rgba(205,232,240,.78)', url: 'theascend.ca' },
  logo: { src: 'ascend/logo.webp', ratio: 0.386 },
  hook: {
    words: ['GREAT', 'WORKSHOP.', 'GONE', 'BY', 'MONDAY.'],
    noise: ['Training budget: spent', 'Engagement 41%', 'Who leads next?', 'Exit interview', '2-day offsite', 'Slides nobody opened'],
    aside: 'Most learning programmes are forgotten within a week. Teams stay the same.',
  },
  reveal: { name: 'The Ascend', page: home, click: climb },
  features: [
    {
      kind: 'page', label: 'The Ascend', accent: 1,
      lines: { tall: ['High-performing', 'teams, by design.'], wide: ['High-performing', 'teams,', 'by design.'] },
      frames: [[0, home]],
      cam: [
        { f: 0, cx: 720, cy: 2300, w: { tall: 1000, wide: 1440 } },
        { f: 30, cx: 720, cy: 2750, w: { tall: 800, wide: 1300 } },
        { f: 60, cx: centre(tms).x + 40, cy: centre(tms).y - 120, w: { tall: 520, wide: 860 } },
        { f: 90, cx: 720, cy: 2900, w: { tall: 900, wide: 1300 } },
      ],
      cursor: { path: [[6, 1100, 2500], [38, centre(tms).x, centre(tms).y], [88, 900, 3100]], clicks: [44] },
      highlight: { rect: { x: tms.x - 24, y: tms.y - 270, w: 360, h: 460 }, at: 48 },
    },
    {
      kind: 'page', label: 'The Ascend', accent: 2,
      lines: { tall: ['Measure the', 'leaders you have.'], wide: ['Measure', 'the leaders', 'you have.'] },
      frames: [[0, services]],
      cam: [
        { f: 0, cx: 720, cy: 1300, w: { tall: 1000, wide: 1440 } },
        { f: 30, cx: centre(assess).x + 120, cy: centre(assess).y + 160, w: { tall: 600, wide: 1000 } },
        { f: 62, cx: centre(assess).x + 120, cy: centre(assess).y + 200, w: { tall: 600, wide: 1000 } },
        { f: 90, cx: 720, cy: 1900, w: { tall: 900, wide: 1440 } },
      ],
      cursor: { path: [[6, 1100, 1300], [36, centre(assess).x, centre(assess).y], [88, 400, 1800]], clicks: [42] },
      highlight: { rect: assess, at: 46 },
    },
    {
      kind: 'page', label: 'The Ascend', accent: 1,
      lines: { tall: ['Five steps to', 'lasting change.'], wide: ['Five steps', 'to lasting', 'change.'] },
      frames: [[0, program]],
      cam: [
        { f: 0, cx: 720, cy: 2550, w: { tall: 1000, wide: 1440 } },
        { f: 30, cx: 640, cy: centre(discover).y + 40, w: { tall: 600, wide: 1000 } },
        { f: 70, cx: 640, cy: centre(launch).y, w: { tall: 600, wide: 1000 } },
        { f: 90, cx: 720, cy: 2900, w: { tall: 900, wide: 1300 } },
      ],
      cursor: { path: [[6, 1100, 2500], [26, centre(discover).x - 120, centre(discover).y], [66, centre(launch).x - 120, centre(launch).y], [88, 900, 3300]], clicks: [30] },
      highlight: { rect: { x: launch.x - 120, y: launch.y - 30, w: 800, h: 130 }, at: 70 },
    },
  ],
  metric: {
    value: 5, line1: 'steps from insight', line2: 'to lasting change.',
    chips: ['Talent Management', 'Leadership Assessments', 'Employee Surveys', 'Learning Management', 'Leadership Coaching'],
    wall: [home, services, program, P('about')],
  },
  end: { tagline: 'Your partner for people transformation', cta: 'Start the climb' },
};
