// Original 120 BPM score + UI sound design, synthesized sample by sample.
// Reads the same timeline the video uses so every click, whoosh and impact
// lands on the frame it belongs to. Output: public/music.wav (48 kHz stereo).
import fs from 'node:fs';

const T = JSON.parse(fs.readFileSync(new URL('../src/timeline.json', import.meta.url)));
const SR = 48000;
const LEN = T.durationInFrames / T.fps + 0.6; // small tail past the last frame
const N = Math.ceil(LEN * SR);
const L = new Float32Array(N), R = new Float32Array(N);
const BEAT = 60 / T.bpm;
const f2s = (f) => f / T.fps;

// Seeded noise so renders are reproducible.
let seed = 7;
const noise = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x3fffffff) - 1;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const add = (t0, buf, gain = 1, pan = 0) => {
  const i0 = Math.round(t0 * SR);
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < buf.length; i++) { const j = i0 + i; if (j < 0 || j >= N) continue; L[j] += buf[i] * gl; R[j] += buf[i] * gr; }
};
const render = (dur, fn) => { const n = Math.floor(dur * SR), b = new Float32Array(n); for (let i = 0; i < n; i++) b[i] = fn(i / SR, i); return b; };

// ── Instruments ────────────────────────────────────────────────────────────
const kick = render(0.45, (t) => {
  const f = 45 + 110 * Math.exp(-t * 28);
  const ph = 2 * Math.PI * (45 * t + (110 / 28) * (1 - Math.exp(-t * 28)));
  return Math.tanh(1.6 * Math.sin(ph) * Math.exp(-t * 7)) + 0.3 * noise() * Math.exp(-t * 200) + 0 * f;
});
const clap = render(0.3, (t) => {
  const bursts = [0, 0.011, 0.022].reduce((a, d) => a + (t >= d ? Math.exp(-(t - d) * 120) : 0), 0);
  return noise() * (0.55 * bursts + 0.5 * Math.exp(-t * 18)) * 0.6;
});
const hat = (open) => {
  let prev = 0;
  return render(open ? 0.22 : 0.05, (t) => { const n = noise(); const hp = n - prev; prev = n; return hp * Math.exp(-t * (open ? 14 : 70)) * 0.35; });
};
const hatC = hat(false), hatO = hat(true);

const saw = (ph) => 2 * (ph - Math.floor(ph + 0.5));
const bassNote = (m, dur) => {
  const f = mtof(m); let lp = 0;
  return render(dur, (t) => {
    const raw = saw(f * t) * 0.6 + Math.sin(2 * Math.PI * f * t) * 0.8;
    const cut = 0.08 + 0.25 * Math.exp(-t * 14);
    lp += cut * (raw - lp);
    return Math.tanh(lp * 1.6) * Math.min(1, t * 400) * Math.min(1, (dur - t) * 60) * 0.55;
  });
};
const pluck = (m, dur = 0.35) => {
  const f = mtof(m); let lp = 0;
  return render(dur, (t) => {
    const raw = saw(f * t) + 0.5 * saw(f * 1.005 * t);
    lp += (0.05 + 0.5 * Math.exp(-t * 22)) * (raw - lp);
    return lp * Math.exp(-t * 9) * 0.22;
  });
};
const pad = (notes, dur) => render(dur, (t) => {
  let s = 0;
  for (const m of notes) for (const d of [-0.12, 0, 0.12]) s += saw(mtof(m + d / 1) * t) * 0.5 + Math.sin(2 * Math.PI * mtof(m - 12) * t) * 0.15;
  const env = Math.min(1, t / 0.35) * Math.min(1, (dur - t) / 0.4);
  return s * env * 0.028;
});
const riser = (dur) => { let lp = 0; return render(dur, (t) => { const k = t / dur; lp += (0.02 + 0.5 * k * k) * (noise() - lp); return lp * k * k * 0.9; }); };

// Sound design
const impact = render(1.4, (t) => {
  const sub = Math.sin(2 * Math.PI * (38 * t + 60 * (1 - Math.exp(-t * 9)) / 9)) * Math.exp(-t * 3.2);
  return Math.tanh(1.8 * sub) * 0.9 + noise() * Math.exp(-t * 30) * 0.35;
});
const whoosh = (() => { let lp = 0, bp = 0; const D = 0.55; return render(D, (t) => {
  const k = t / D; const env = Math.sin(Math.PI * Math.min(1, k * 1.15)) ** 2;
  const c = 0.03 + 0.35 * Math.sin(Math.PI * k);
  lp += c * (noise() - lp); bp += c * (lp - bp); return (lp - bp) * env * 2.2;
}); })();
const click = render(0.06, (t) => Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-t * 160) * 0.5 + noise() * Math.exp(-t * 600) * 0.4);
const key = render(0.04, (t) => (Math.sin(2 * Math.PI * 1700 * t) * 0.4 + noise() * 0.5) * Math.exp(-t * 260) * 0.45);
const pop = (i) => render(0.12, (t) => Math.sin(2 * Math.PI * (500 + i * 70) * t * (1 + 2 * Math.exp(-t * 40))) * Math.exp(-t * 32) * 0.28);

// ── Arrangement ───────────────────────────────────────────────────────────
// A minor: Am – F – C – G, one chord per bar (2 s).
const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
const ROOTS = [33, 29, 36, 31];
const bars = Math.ceil(LEN / (BEAT * 4));
const grooveFrom = f2s(T.scenes.assemble.from);   // groove kicks in with the product
const breakFrom = f2s(T.scenes.metric.from);       // drums drop out for the number
const endAt = f2s(T.durationInFrames);

for (let b = 0; b < bars; b++) {
  const t0 = b * BEAT * 4;
  if (t0 >= endAt) break;
  const ch = CHORDS[b % 4];
  add(t0, pad(ch, BEAT * 4 + 0.3), 1, 0);
  for (let s = 0; s < 16; s++) {
    const t = t0 + s * BEAT / 4;
    if (t >= endAt - 0.05) continue;
    const groove = t >= grooveFrom && !(t >= breakFrom && t < f2s(T.scenes.logo.from));
    if (groove) {
      if (s % 4 === 0) add(t, kick, 0.95);
      if (s === 4 || s === 12) add(t, clap, 0.8, 0.05);
      add(t, s % 4 === 2 ? hatO : hatC, s % 2 ? 0.55 : 0.35, 0.3);
      if (s % 4 === 2) add(t, bassNote(ROOTS[b % 4] + (s === 14 ? 7 : 0), BEAT / 2 - 0.02), 1);
      const arp = [0, 2, 1, 2, 0, 1, 2, 1];
      if (s % 2 === 0) add(t, pluck(ch[arp[(s / 2) % 8]] + 12), 1, (s % 4 ? -0.4 : 0.4));
    } else if (t < grooveFrom && s % 8 === 0) {
      add(t, bassNote(ROOTS[b % 4], BEAT * 1.8), 0.9);
    }
  }
}
// Risers into the groove, into the number and into the logo.
for (const at of [T.scenes.assemble.from, T.scenes.metric.from, T.scenes.logo.from]) { const d = 1.4; add(f2s(at) - d, riser(d), 0.5); }

T.sfx.impact.forEach((f) => add(f2s(f), impact, 0.85));
T.sfx.whoosh.forEach((f, i) => add(f2s(f) - 0.18, whoosh, 0.55, i % 2 ? 0.5 : -0.5));
T.sfx.click.forEach((f) => add(f2s(f), click, 0.9, 0.15));
T.sfx.key.forEach((f, i) => add(f2s(f), key, 0.8, (i % 2 ? 0.2 : -0.2)));
T.sfx.pop.forEach((f, i) => add(f2s(f), pop(i), 1, (i % 3 - 1) * 0.5));

// ── Master: fade tail, soft clip, normalise ──────────────────────────────
const fadeFrom = endAt - 0.5;
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR; const g = t > fadeFrom ? Math.max(0, 1 - (t - fadeFrom) / 0.9) : 1;
  L[i] = Math.tanh(L[i] * g * 0.9); R[i] = Math.tanh(R[i] * g * 0.9);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(L[i] * norm * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(R[i] * norm * 32767), 46 + i * 4); }
fs.mkdirSync(new URL('../public/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('../public/music.wav', import.meta.url), buf);
console.log('music.wav', (N / SR).toFixed(2) + 's', 'peak', peak.toFixed(2));
