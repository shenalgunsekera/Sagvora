import { pageOf } from '../kit/kit';
import type { ReelConfig } from '../kit/Reel';
import { spadeLogo } from './logos';
import rects from '../../public/bot/rects.json';

const login = pageOf('bot', rects, 'login');

// Message copy follows the bot's own wording (apps/bot/src in the Union
// Settlement repo); the admin deposit card is condensed for the frame.
export const bot: ReelConfig = {
  slug: 'bot',
  transpose: 1,
  theme: { bg: ['#0f3a2a', '#06170f', '#020805'], primary: '#2AABEE', secondary: '#3DDC97', soft: 'rgba(205,240,225,.78)', url: 'aptbot-panel.vercel.app', pageBg: '#f4f5fa' },
  logo: spadeLogo('UNION SETTLEMENT', 'TELEGRAM · DISCORD · ADMIN PANEL'),
  hook: {
    words: ['PAYMENTS', 'IN', 'FIVE', 'DIFFERENT', 'APPS.'],
    noise: ['Cash App?', 'PayPal pending', 'Who paid who?', 'Screenshot pls', 'Balance off by $40', 'Chips not loaded', 'Crypto tx?'],
    aside: 'A poker union settling deposits and cash-outs by hand, across DMs and spreadsheets.',
  },
  reveal: { name: 'Union Settlement', page: login, click: login.find('Continue with Google') },
  features: [
    {
      kind: 'chat', label: 'Telegram bot', title: 'Union Bot', accent: 2,
      lines: { tall: ['Add money in', 'one message.'], wide: ['Add money', 'in one', 'message.'] },
      messages: [
        { at: 10, from: 'me', text: '/deposit' },
        { at: 20, from: 'bot', text: 'How much do you want to add to *ClubGG*?' },
        { at: 38, from: 'me', text: '100' },
        { at: 48, from: 'bot', text: 'How do you want to pay?', buttons: ['Cash App', 'PayPal', 'Card'], tap: 0 },
      ],
    },
    {
      kind: 'chat', label: 'Telegram bot', title: 'Union Bot', accent: 3,
      lines: { tall: ['Proof in.', 'Chips loaded.'], wide: ['Proof in.', 'Chips', 'loaded.'] },
      messages: [
        { at: 6, from: 'bot', text: '*💸 Send your payment now — you have 15 min*\nPay *$100* to *$unionpay* on Cash App.' },
        { at: 30, from: 'me', text: 'Sent!', image: true },
        { at: 44, from: 'bot', text: '✅ Got your screenshot. Send a *second* one now if you have it — or /done.' },
        { at: 66, from: 'bot', text: '🎰 *$100 added to your account!*' },
      ],
    },
    {
      kind: 'chat', label: 'Admin group', title: 'Union Admins', accent: 2,
      lines: { tall: ['Admins approve', 'in one tap.'], wide: ['Admins', 'approve in', 'one tap.'] },
      messages: [
        { at: 8, from: 'bot', text: '🧾 *New deposit* · Alex · *$100* via Cash App\nScreenshot attached.', image: true, buttons: ['✅ Credit', 'Reject'], tap: 0 },
        { at: 44, from: 'bot', text: '✅ Credited *$100*. The player has been told and their table is being loaded.' },
      ],
    },
  ],
  metric: {
    value: 43, line1: 'database tests.', line2: 'Every ledger sums to zero.',
    chips: ['Deposits', 'Cash-outs', 'Cash App', 'PayPal', 'Crypto', 'Stripe', 'Telegram', 'Discord', 'Admin panel'],
    wall: [login],
  },
  end: { tagline: 'Peer-to-peer settlement for a ClubGG union', cta: 'Telegram + Discord' },
};
