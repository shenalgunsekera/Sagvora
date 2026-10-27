import { apt } from './apt';
import { araksha } from './araksha';
import { ascend } from './ascend';
import { bot } from './bot';
import { ceilao } from './ceilao';
import { pmf } from './pmf';
import type { ReelConfig } from '../kit/Reel';

/** Every project reel. Each renders as <slug>-wide (16:9) and <slug>-tall (9:16). */
export const REELS: ReelConfig[] = [ceilao, pmf, araksha, ascend, apt, bot];
