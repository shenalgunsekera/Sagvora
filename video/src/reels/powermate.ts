import { centre, pageOf } from '../kit/kit';
import type { ReelConfig } from '../kit/Reel';
import { powermateLogo } from './logos';
import rects from '../../public/powermate/rects.json';

const P = (n: string) => pageOf('powermate', rects, n);
const home = P('home'), products = P('products');

const apply = home.find('Apply Now', 1);
const micro = home.find('01 Micro Loans Small loans that start big journeys.');
const agri = home.find('03 Agriculture Loans Backing the people who feed the nation.');
const sme = home.find('SME Loans');
const amount = home.find('Loan amount');
const applyLoan = home.find('Apply for this loan');
const smeCard = products.find('SME Loans');

export const powermate: ReelConfig = {
  slug: 'powermate',
  transpose: -2,
  theme: { bg: ['#5a1424', '#2a0710', '#0f0205'], primary: '#C8102E', secondary: '#F2B8A0', soft: 'rgba(250,225,228,.78)', url: '', pageBg: '#ffffff' },
  logo: powermateLogo,
  hook: {
    words: ['CREDIT', 'SHOULDN’T', 'TAKE', 'A', 'SEASON.'],
    noise: ['Come back next week', 'Bring 3 guarantors', 'Form only in English', 'Branch closed', 'Hidden fees?', 'No reply'],
    aside: 'Farmers and small traders wait weeks for credit, in a language that isn’t theirs.',
  },
  reveal: { name: 'Power Mate', page: home, click: apply },
  features: [
    {
      kind: 'page', label: 'Power Mate Investment', accent: 1,
      lines: { tall: ['A loan for every', 'stage of life.'], wide: ['A loan for', 'every stage', 'of life.'] },
      frames: [[0, home]],
      cam: [
        { f: 0, cx: 720, cy: 1350, w: { tall: 1000, wide: 1440 } },
        { f: 28, cx: centre(micro).x + 80, cy: centre(micro).y + 120, w: { tall: 640, wide: 1000 } },
        { f: 66, cx: centre(agri).x + 80, cy: centre(agri).y, w: { tall: 640, wide: 1000 } },
        { f: 90, cx: 720, cy: 1500, w: { tall: 900, wide: 1300 } },
      ],
      cursor: { path: [[6, 1100, 1300], [30, centre(micro).x, centre(micro).y], [62, centre(agri).x, centre(agri).y], [88, 900, 1700]], clicks: [34, 66] },
      highlight: { rect: agri, at: 68 },
    },
    {
      kind: 'page', label: 'Power Mate Investment', accent: 2,
      lines: { tall: ['Know your', 'instalment first.'], wide: ['Know your', 'instalment', 'first.'] },
      frames: [[0, home]],
      cam: [
        { f: 0, cx: 720, cy: 3800, w: { tall: 1000, wide: 1440 } },
        { f: 30, cx: 640, cy: centre(amount).y + 40, w: { tall: 640, wide: 1000 } },
        { f: 64, cx: 840, cy: centre(applyLoan).y - 120, w: { tall: 640, wide: 1000 } },
        { f: 90, cx: 720, cy: 4000, w: { tall: 900, wide: 1300 } },
      ],
      cursor: { path: [[6, 1000, 3800], [26, centre(sme).x, centre(sme).y], [56, centre(applyLoan).x, centre(applyLoan).y], [88, 1100, 4300]], clicks: [30, 60] },
      highlight: { rect: { x: 815, y: 3930, w: 380, h: 100 }, at: 40 },
    },
    {
      kind: 'page', label: 'Power Mate Investment', accent: 1,
      lines: { tall: ['Fair terms.', 'Fast answers.'], wide: ['Fair terms.', 'Fast', 'answers.'] },
      frames: [[0, products]],
      cam: [
        { f: 0, cx: 720, cy: 500, w: { tall: 1000, wide: 1440 } },
        { f: 30, cx: 700, cy: centre(smeCard).y + 60, w: { tall: 960, wide: 1100 } },
        { f: 90, cx: 700, cy: centre(smeCard).y + 160, w: { tall: 1000, wide: 1200 } },
      ],
      cursor: { path: [[6, 1100, 700], [34, centre(smeCard).x - 300, centre(smeCard).y], [88, 1000, 1300]], clicks: [38] },
      highlight: { rect: { x: smeCard.x - 160, y: smeCard.y - 30, w: 1000, h: 210 }, at: 42 },
    },
  ],
  metric: {
    value: 3, line1: 'languages on every page.', line2: 'English · Sinhala · Tamil.',
    chips: ['Micro Loans', 'SME Loans', 'Agriculture Loans', 'Insurance', 'Loan calculator', 'Branch locator'],
    wall: [home, products, P('branches'), P('about')],
  },
  end: { tagline: 'Strengthening your financial power', cta: 'Apply now' },
};
