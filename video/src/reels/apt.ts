import { centre, pageOf } from '../kit/kit';
import type { ReelConfig } from '../kit/Reel';
import { spadeLogo } from './logos';
import rects from '../../public/apt/rects.json';

const P = (n: string) => pageOf('apt', rects, n);
const home = P('home'), day = P('home-day'), slot = P('home-slot'), details = P('home-details'), filled = P('home-filled');

const d29 = home.find('29');
const s315 = day.find('3:15 PM');
const next = slot.find('Next →');
const name = details.find('Full name');
const tg = filled.find('Telegram');
const confirm = filled.find('Confirm 3:15 PM');

export const apt: ReelConfig = {
  slug: 'apt',
  transpose: -3,
  theme: { bg: ['#26262b', '#0e0e11', '#040405'], primary: '#6B6B78', secondary: '#F4F4F5', soft: 'rgba(235,235,240,.72)', url: 'aptfunnel.vercel.app', pageBg: '#0a0a0a', ctaText: '#0a0a0b' },
  logo: spadeLogo('THATPOKERAGENT'),
  hook: {
    words: ['NEW', 'PLAYER?', 'BOOK', 'A', 'CALL.'],
    noise: ['DM me when free', 'What time works?', 'Missed you again', 'Which timezone?', 'Double-booked', 'Seen 2h ago'],
    aside: 'New players were set up over scattered DMs. Times clashed, people slipped through.',
  },
  reveal: { name: 'ThatPokerAgent', page: home, click: d29 },
  features: [
    {
      kind: 'page', label: 'ThatPokerAgent', accent: 1,
      lines: { tall: ['Pick a day.', 'Pick a time.'], wide: ['Pick a day.', 'Pick a', 'time.'] },
      frames: [[0, home], [22, day], [52, slot]],
      cam: [
        { f: 0, cx: 720, cy: 450, w: { tall: 900, wide: 1300 } },
        { f: 20, cx: centre(d29).x, cy: centre(d29).y - 80, w: { tall: 560, wide: 900 } },
        { f: 40, cx: 1000, cy: 420, w: { tall: 560, wide: 900 } },
        { f: 90, cx: 1000, cy: 430, w: { tall: 620, wide: 960 } },
      ],
      cursor: { path: [[4, 500, 600], [16, centre(d29).x, centre(d29).y], [44, centre(s315).x, centre(s315).y], [88, centre(next).x, centre(next).y + 20]], clicks: [18, 48] },
      highlight: { rect: next, at: 60 },
    },
    {
      kind: 'page', label: 'ThatPokerAgent', accent: 2,
      lines: { tall: ['Two steps.', 'No back-and-forth.'], wide: ['Two steps.', 'No back-', 'and-forth.'] },
      frames: [[0, details], [30, filled]],
      cam: [
        { f: 0, cx: 800, cy: 420, w: { tall: 700, wide: 1100 } },
        { f: 30, cx: 800, cy: 330, w: { tall: 560, wide: 900 } },
        { f: 90, cx: 800, cy: 520, w: { tall: 600, wide: 1000 } },
      ],
      cursor: { path: [[4, 1100, 600], [14, centre(name).x, centre(name).y + 20], [56, centre(tg).x, centre(tg).y], [88, centre(tg).x + 60, centre(tg).y + 80]], clicks: [14, 60] },
      keys: [18, 20, 22, 24, 26, 28, 32, 34, 36, 38, 40, 42],
    },
    {
      kind: 'page', label: 'ThatPokerAgent', accent: 2,
      lines: { tall: ['Booked.', 'Never twice.'], wide: ['Booked.', 'Never', 'twice.'] },
      frames: [[0, filled]],
      cam: [
        { f: 0, cx: 800, cy: 600, w: { tall: 700, wide: 1100 } },
        { f: 30, cx: centre(confirm).x, cy: centre(confirm).y - 40, w: { tall: 560, wide: 900 } },
        { f: 90, cx: centre(confirm).x, cy: centre(confirm).y - 60, w: { tall: 620, wide: 1000 } },
      ],
      cursor: { path: [[4, 1100, 860], [26, centre(confirm).x, centre(confirm).y], [88, centre(confirm).x + 80, centre(confirm).y + 60]], clicks: [30] },
      highlight: { rect: confirm, at: 34 },
    },
  ],
  metric: {
    value: 15, suffix: ' min', line1: 'one-on-one with an agent.', line2: 'One calendar. Zero clashes.',
    chips: ['Voice call', 'Text chat', 'Discord', 'Telegram', 'Google Meet', 'Any timezone'],
    wall: [home, day, slot, filled, P('text')],
  },
  end: { tagline: 'Get set up on ClubGG with a real agent', cta: 'Book a call' },
};
