import { centre, pageOf } from '../kit/kit';
import type { ReelConfig } from '../kit/Reel';
import { arakshaLogo } from './logos';
import rects from '../../public/araksha/rects.json';

const P = (n: string) => pageOf('araksha', rects, n);
const home = P('home'), insurance = P('insurance'), partners = P('partners');

const quote = home.find('GET A QUOTE', 1);
const fleet = insurance.find('Fleet Cover');
const compare = insurance.find('GET A FREE COMPARISON');
const lifeP = partners.find('OUR LIFE INSURANCE PARTNERS');
const genP = partners.find('OUR GENERAL INSURANCE PARTNERS');
const vehicle = home.find('Vehicle Insurance');

export const araksha: ReelConfig = {
  slug: 'araksha',
  transpose: 2,
  theme: { bg: ['#0f2f6b', '#06132e', '#020713'], primary: '#2F7BE0', secondary: '#7FC0FF', soft: 'rgba(200,222,255,.78)', url: 'araksha.lk' },
  logo: arakshaLogo,
  hook: {
    words: ['WHICH', 'INSURER', 'IS', 'ACTUALLY', 'RIGHT?'],
    noise: ['AIA?', 'Ceylinco?', 'SLIC?', 'Allianz?', 'Union Assurance?', 'HNB?', 'Fairfirst?', 'Softlogic?'],
    aside: 'Two dozen insurers, a hundred policies, and nobody on your side of the table.',
  },
  reveal: { name: 'Araksha', page: home, click: quote },
  features: [
    {
      kind: 'page', label: 'Araksha', accent: 2,
      lines: { tall: ['Every kind', 'of cover.'], wide: ['Every', 'kind of', 'cover.'] },
      frames: [[0, home], [46, insurance]],
      cam: [
        { f: 0, cx: 720, cy: 2550, w: { tall: 1000, wide: 1440 } },
        { f: 26, cx: centre(vehicle).x + 120, cy: centre(vehicle).y + 10, w: { tall: 560, wide: 900 } },
        { f: 44, cx: centre(vehicle).x + 120, cy: centre(vehicle).y + 10, w: { tall: 560, wide: 900 } },
        { f: 52, cx: 720, cy: 1000, w: { tall: 900, wide: 1440 } },
        { f: 90, cx: centre(fleet).x, cy: centre(fleet).y + 40, w: { tall: 620, wide: 1000 } },
      ],
      cursor: { path: [[6, 600, 2400], [36, centre(vehicle).x, centre(vehicle).y], [70, centre(fleet).x - 60, centre(fleet).y], [88, centre(fleet).x, centre(fleet).y + 50]], clicks: [42] },
      highlight: { rect: { x: fleet.x, y: fleet.y, w: fleet.w, h: 46 * 3 }, at: 66 },
    },
    {
      kind: 'page', label: 'Araksha', accent: 3,
      lines: { tall: ['23 insurers,', 'side by side.'], wide: ['23 insurers,', 'side by', 'side.'] },
      frames: [[0, partners]],
      cam: [
        { f: 0, cx: 720, cy: 900, w: { tall: 1000, wide: 1440 } },
        { f: 34, cx: 720, cy: centre(lifeP).y + 300, w: { tall: 760, wide: 1300 } },
        { f: 62, cx: 720, cy: centre(genP).y + 300, w: { tall: 760, wide: 1300 } },
        { f: 90, cx: 720, cy: centre(genP).y + 380, w: { tall: 900, wide: 1440 } },
      ],
      cursor: { path: [[6, 1100, 1000], [40, 720, 1400], [88, 900, 1900]], clicks: [44] },
      highlight: { rect: genP, at: 48 },
    },
    {
      kind: 'page', label: 'Araksha', accent: 3,
      lines: { tall: ['One request.', 'Every quote.'], wide: ['One', 'request.', 'Every quote.'] },
      frames: [[0, insurance]],
      cam: [
        { f: 0, cx: 720, cy: 1300, w: { tall: 900, wide: 1440 } },
        { f: 30, cx: centre(compare).x, cy: centre(compare).y, w: { tall: 560, wide: 900 } },
        { f: 90, cx: centre(compare).x, cy: centre(compare).y - 20, w: { tall: 640, wide: 1000 } },
      ],
      cursor: { path: [[6, 300, 1400], [26, centre(compare).x, centre(compare).y], [88, centre(compare).x + 90, centre(compare).y + 80]], clicks: [30] },
      highlight: { rect: compare, at: 34 },
    },
  ],
  metric: {
    value: 23, line1: 'insurer partners.', line2: 'One trusted broker.',
    chips: ['Life', 'Vehicle', 'Health', 'Property', 'Home', 'Marine', 'Fleet', 'Solar', 'Travel', 'Liability', 'Engineering', 'Pension'],
    wall: [home, insurance, partners, P('login')],
  },
  end: { tagline: 'Samson Insurance Brokers · since 2008', cta: 'Get a free comparison' },
};
