import { centre, pageOf } from '../kit/kit';
import type { ReelConfig } from '../kit/Reel';
import rects from '../../public/ceilao/rects.json';

const P = (n: string) => pageOf('ceilao', rects, n);
const home = P('home'), learn = P('learn'), life = P('life');

const quote = home.find('GET MY FREE QUOTE');
const stat = home.find('15+');
const motor = home.find('Motor Insurance', 1);
const claims = learn.find('Claims Process');
const term = life.find('Term Life');

export const ceilao: ReelConfig = {
  slug: 'ceilao',
  theme: { bg: ['#3d1a0b', '#170a05', '#070302'], primary: '#F25C2A', secondary: '#FFA27A', soft: 'rgba(255,214,196,.75)', url: 'ceilaoib.lk' },
  logo: { src: 'ceilao/logo.webp', ratio: 0.457 },
  hook: {
    words: ['TEN', 'INSURERS.', 'TEN', 'QUOTES.', 'NO HELP.'],
    noise: ['Quote #2 — no reply', 'Which one covers floods?', 'Call back tomorrow', 'Excess: ???', 'Claim on hold', 'Premium +18%', 'Fine print, p. 14'],
    aside: 'Calling insurers one by one. Comparing PDFs by hand. Alone at claim time.',
  },
  reveal: { name: 'Ceilao', page: home, click: quote },
  features: [
    {
      kind: 'page', label: 'Ceilao', accent: 3,
      lines: { tall: ['Every insurer.', 'One broker.'], wide: ['Every', 'insurer.', 'One broker.'] },
      frames: [[0, home]],
      cam: [
        { f: 0, cx: 720, cy: 1250, w: { tall: 1000, wide: 1440 } },
        { f: 34, cx: 1000, cy: 1420, w: { tall: 560, wide: 860 } },
        { f: 62, cx: 1000, cy: 1420, w: { tall: 560, wide: 860 } },
        { f: 90, cx: 720, cy: 1330, w: { tall: 900, wide: 1300 } },
      ],
      cursor: { path: [[8, 600, 1180], [40, centre(stat).x + 8, centre(stat).y + 10], [88, 1180, 1500]], clicks: [45] },
      highlight: { rect: { x: stat.x - 18, y: stat.y - 12, w: 270, h: 115 }, at: 50 },
    },
    {
      kind: 'page', label: 'Ceilao', accent: 5,
      lines: { tall: ['Cover for every', 'part of life.'], wide: ['Cover for', 'every part', 'of life.'] },
      frames: [[0, home]],
      cam: [
        { f: 0, cx: 720, cy: 2620, w: { tall: 1000, wide: 1440 } },
        { f: 30, cx: 720, cy: 2950, w: { tall: 760, wide: 1300 } },
        { f: 60, cx: centre(motor).x, cy: centre(motor).y + 30, w: { tall: 560, wide: 900 } },
        { f: 90, cx: 720, cy: 3050, w: { tall: 900, wide: 1300 } },
      ],
      cursor: { path: [[6, 300, 2800], [36, centre(motor).x, centre(motor).y + 10], [88, 1000, 3150]], clicks: [42] },
      highlight: { rect: { x: motor.x - 4, y: motor.y - 26, w: 335, h: 186 }, at: 46 },
    },
    {
      kind: 'page', label: 'Ceilao', accent: 1,
      lines: { tall: ['Insurance,', 'explained.'], wide: ['Insurance,', 'explained.'] },
      frames: [[0, learn], [44, life]],
      cam: [
        { f: 0, cx: 720, cy: 450, w: { tall: 1000, wide: 1440 } },
        { f: 26, cx: centre(claims).x, cy: centre(claims).y + 50, w: { tall: 560, wide: 900 } },
        { f: 42, cx: centre(claims).x, cy: centre(claims).y + 50, w: { tall: 560, wide: 900 } },
        { f: 52, cx: 720, cy: 700, w: { tall: 1000, wide: 1440 } },
        { f: 90, cx: centre(term).x + 120, cy: centre(term).y + 80, w: { tall: 640, wide: 1000 } },
      ],
      cursor: { path: [[6, 400, 900], [26, centre(claims).x - 40, centre(claims).y + 4], [70, centre(term).x, centre(term).y + 10], [88, centre(term).x + 40, centre(term).y + 60]], clicks: [30] },
      highlight: { rect: { x: term.x - 10, y: term.y - 40, w: term.w + 20, h: 300 }, at: 66 },
    },
  ],
  metric: { value: 15, suffix: '+', line1: 'insurers compared.', line2: 'One broker on your side.', chips: ['Health', 'Motor', 'Life', 'Home & Contents', 'Travel', 'Business', 'Income Protection', 'Global Medical', 'Group Life', 'Personal Accident', 'Liability', 'SME & Micro'], wall: [home, learn, life, P('login')] },
  end: { tagline: 'Independent insurance brokers · Sri Lanka', cta: 'Get a free quote' },
};
