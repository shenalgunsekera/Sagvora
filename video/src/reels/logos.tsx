import React from 'react';
import { Img, staticFile } from 'remotion';
import { INTER } from '../lib';
import type { LogoSpec } from '../kit/kit';

/** Badge + wordmark lockup, the way Araksha's own header sets it. */
export const arakshaLogo: LogoSpec = {
  ratio: 0.3,
  draw: (w) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: w * 0.045, height: w * 0.3, fontFamily: INTER, color: '#fff' }}>
      <Img src={staticFile('araksha/logo.webp')} style={{ height: w * 0.28, width: w * 0.28 * 0.958 }} />
      <div>
        <div style={{ fontSize: w * 0.15, fontWeight: 900, letterSpacing: w * 0.004, lineHeight: 0.95 }}>ARAKSHA</div>
        <div style={{ fontSize: w * 0.04, fontWeight: 600, letterSpacing: w * 0.008, opacity: 0.8, marginTop: w * 0.012, whiteSpace: 'nowrap' }}>SAMSON INSURANCE BROKERS</div>
      </div>
    </div>
  ),
};

/** Spade-in-a-ring mark with a wordmark beside it (ThatPokerAgent). */
export const spadeLogo = (word: string, sub?: string): LogoSpec => ({
  ratio: 0.2,
  draw: (w) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: w * 0.04, height: w * 0.2, fontFamily: INTER, color: '#fff' }}>
      <div style={{ width: w * 0.19, height: w * 0.19, borderRadius: 999, border: `${w * 0.006}px solid rgba(255,255,255,.35)`, background: '#18181b', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <svg width={w * 0.09} height={w * 0.1} viewBox="0 0 24 26">
          <path fill="#fff" d="M12 1C9 6 2 9.5 2 15a5 5 0 0 0 8.4 3.6c-.3 2.6-1.2 4.6-2.9 6.4h9c-1.7-1.8-2.6-3.8-2.9-6.4A5 5 0 0 0 22 15c0-5.5-7-9-10-14Z" />
        </svg>
      </div>
      <div>
        {/* Long names shrink so the lockup always fits its width. */}
        <div style={{ fontSize: Math.min(w * 0.085, (w * 0.7) / (word.length * 0.68)), fontWeight: 900, letterSpacing: w * 0.006, lineHeight: 1, whiteSpace: 'nowrap' }}>{word}</div>
        {sub && <div style={{ fontSize: w * 0.03, fontWeight: 600, letterSpacing: w * 0.005, opacity: 0.7, marginTop: w * 0.012, whiteSpace: 'nowrap' }}>{sub}</div>}
      </div>
    </div>
  ),
});

/** Power Mate's "S" mark with the wordmark set beside it. */
export const powermateLogo: LogoSpec = {
  ratio: 0.26,
  draw: (w) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: w * 0.04, height: w * 0.26, fontFamily: INTER, color: '#fff' }}>
      <Img src={staticFile('powermate/logo.webp')} style={{ height: w * 0.24, width: w * 0.24 * (195 / 140), objectFit: 'contain' }} />
      <div>
        <div style={{ fontSize: w * 0.11, fontWeight: 900, letterSpacing: w * 0.004, lineHeight: 0.95, whiteSpace: 'nowrap' }}>POWER MATE</div>
        <div style={{ fontSize: w * 0.05, fontWeight: 700, letterSpacing: w * 0.02, opacity: 0.8, marginTop: w * 0.014, whiteSpace: 'nowrap' }}>INVESTMENT</div>
      </div>
    </div>
  ),
};
