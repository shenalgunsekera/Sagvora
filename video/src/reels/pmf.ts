import { centre, pageOf } from '../kit/kit';
import type { ReelConfig } from '../kit/Reel';
import rects from '../../public/pmf/rects.json';

const P = (n: string) => pageOf('pmf', rects, n);
const home = P('home'), general = P('general'), login = P('login');

const quote = home.find('GET MY FREE QUOTE');
const cyber = general.find('Cyber Risk');
const fleet = general.find('Motor Fleet');
const business = home.find('Business Insurance', 1);
const logIn = login.find('LOG IN', 1);

export const pmf: ReelConfig = {
  slug: 'pmf',
  transpose: -2,
  theme: { bg: ['#3d0c10', '#160406', '#070203'], primary: '#E3262F', secondary: '#FF7A7F', soft: 'rgba(255,205,208,.75)', url: 'ceilaoib.lk' },
  logo: { src: 'pmf/logo.webp', ratio: 0.384 },
  hook: {
    words: ['YOUR', 'BUSINESS', 'IS', 'ONE', 'BAD DAY.'],
    noise: ['Warehouse fire?', 'Fleet uninsured', 'Cyber attack', 'Cargo lost at sea', 'Supplier down', 'Who do I call?'],
    aside: 'A fire, a breach, a lost shipment. Most businesses find out what they are not covered for too late.',
  },
  reveal: { name: 'PMF', page: home, click: quote },
  features: [
    {
      kind: 'page', label: 'Ceilao × PMF', accent: 2,
      lines: { tall: ['Cover built', 'for business.'], wide: ['Cover', 'built for', 'business.'] },
      frames: [[0, general]],
      cam: [
        { f: 0, cx: 720, cy: 450, w: { tall: 1000, wide: 1440 } },
        { f: 30, cx: 720, cy: 760, w: { tall: 760, wide: 1300 } },
        { f: 60, cx: centre(cyber).x, cy: centre(cyber).y + 60, w: { tall: 520, wide: 860 } },
        { f: 90, cx: 900, cy: 800, w: { tall: 860, wide: 1300 } },
      ],
      cursor: { path: [[6, 300, 760], [24, centre(fleet).x, centre(fleet).y + 6], [40, centre(cyber).x, centre(cyber).y + 6], [88, 1200, 1000]], clicks: [44] },
      highlight: { rect: { x: cyber.x - 26, y: cyber.y - 60, w: 335, h: 230 }, at: 48 },
    },
    {
      kind: 'page', label: 'Ceilao × PMF', accent: 3,
      lines: { tall: ['Every insurer.', 'One broker.'], wide: ['Every', 'insurer.', 'One broker.'] },
      frames: [[0, home]],
      cam: [
        { f: 0, cx: 720, cy: 2650, w: { tall: 1000, wide: 1440 } },
        { f: 30, cx: 720, cy: 3000, w: { tall: 760, wide: 1300 } },
        { f: 60, cx: centre(business).x, cy: centre(business).y + 30, w: { tall: 560, wide: 900 } },
        { f: 90, cx: 720, cy: 3050, w: { tall: 900, wide: 1300 } },
      ],
      cursor: { path: [[6, 1200, 2800], [36, centre(business).x, centre(business).y + 10], [88, 300, 3150]], clicks: [42] },
      highlight: { rect: { x: business.x - 4, y: business.y - 26, w: 335, h: 186 }, at: 46 },
    },
    {
      kind: 'page', label: 'Ceilao × PMF', accent: 2,
      lines: { tall: ['Your policies,', 'one login.'], wide: ['Your', 'policies,', 'one login.'] },
      frames: [[0, login]],
      cam: [
        { f: 0, cx: 720, cy: 450, w: { tall: 900, wide: 1440 } },
        { f: 34, cx: 720, cy: 470, w: { tall: 560, wide: 900 } },
        { f: 90, cx: 720, cy: 500, w: { tall: 620, wide: 1000 } },
      ],
      cursor: { path: [[6, 1000, 700], [26, centre(logIn).x, centre(logIn).y], [88, centre(logIn).x + 80, centre(logIn).y + 90]], clicks: [30] },
      highlight: { rect: logIn, at: 34 },
    },
  ],
  metric: {
    value: 8, line1: 'business risks covered.', line2: 'One partner to call.',
    chips: ['Property Loss', 'Fire Risk', 'Motor Fleet', 'Equipment Breakdown', 'Marine Cargo', 'Product Liability', 'Cyber Risk', 'Supply Chain'],
    wall: [home, general, login, P('learn')],
  },
  end: { tagline: 'Ceilao Insurance Brokers × PMF Finance', cta: 'Get a quote' },
};
