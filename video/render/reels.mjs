/**
 * Project reels: music, contact sheets and renders.
 *
 *   node render/reels.mjs music   [slug,...]   # per-reel timeline + synthesized score
 *   node render/reels.mjs contact [slug,...]   # one frame per beat -> out/contact/<slug>-*.png
 *   node render/reels.mjs render  [slug,...]   # 16:9 + 9:16 masters -> out/<slug>-wide.mp4 / -tall.mp4
 *   node render/reels.mjs web     [slug,...]   # site encodes + poster -> ../public/work/<slug>/
 */
import { build } from '../capture/node_modules/esbuild/lib/main.js';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import sharp from '../../node_modules/sharp/lib/index.js';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const [cmd = 'contact', only] = process.argv.slice(2);
const tmp = path.resolve('out/.reels.cjs');
fs.mkdirSync('out/contact', { recursive: true });

// The configs are TypeScript; bundle them once for Node to read timings.
await build({
  stdin: { contents: "export { REELS } from './src/reels'; export { timelineFor } from './src/kit/sfx';", resolveDir: path.resolve('.'), loader: 'ts' },
  bundle: true, platform: 'node', format: 'cjs', outfile: tmp, jsx: 'automatic', loader: { '.json': 'json' }, logLevel: 'error',
});
const { REELS, timelineFor } = createRequire(import.meta.url)(tmp);
const reels = REELS.filter((r) => !only || only.split(',').includes(r.slug));

if (cmd === 'music') {
  for (const r of reels) {
    const tl = path.resolve(`out/${r.slug}.timeline.json`);
    fs.writeFileSync(tl, JSON.stringify(timelineFor(r), null, 2));
    execFileSync('node', ['audio/synth.mjs', tl, `public/${r.slug}/music.wav`, String(r.transpose ?? 0)], { stdio: 'inherit' });
  }
  process.exit(0);
}

if (cmd === 'web') {
  // Same recipe as the InsureSAAS cut: faststart H.264, the phone cut at 720p.
  const ff = (...a) => execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-loglevel', 'error', ...a], { stdio: 'inherit', shell: true });
  for (const r of reels) {
    const dir = path.resolve(`../public/work/${r.slug}`);
    fs.mkdirSync(dir, { recursive: true });
    ff('-i', `out/${r.slug}-wide.mp4`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', `${dir}/reel-16x9.mp4`);
    ff('-i', `out/${r.slug}-tall.mp4`, '-vf', 'scale=720:-2:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', `${dir}/reel-9x16.mp4`);
    // Poster: the end of the reveal, product on screen with its logo.
    ff('-ss', '5.2', '-i', `out/${r.slug}-wide.mp4`, '-frames:v', '1', `out/${r.slug}-poster.png`);
    await sharp(`out/${r.slug}-poster.png`).resize({ width: 1280 }).webp({ quality: 80 }).toFile(`${dir}/poster.webp`);
    console.log('web', r.slug, fs.readdirSync(dir).join(' '));
  }
  process.exit(0);
}

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const BEATS = [['Hook', 72], ['Reveal', 150], ['Feature 1', 240], ['Feature 2', 330], ['Feature 3', 420], ['Metric', 490], ['End', 575]];

for (const r of reels) {
  for (const fmt of ['wide', 'tall']) {
    const id = `${r.slug}-${fmt}`;
    const composition = await selectComposition({ serveUrl, id });
    if (cmd === 'render') {
      const out = path.resolve(`out/${id}.mp4`);
      await renderMedia({ composition, serveUrl, codec: 'h264', outputLocation: out, crf: 18, concurrency: 4 });
      console.log('rendered', out);
      continue;
    }
    const files = [];
    for (const [, frame] of BEATS) {
      const output = path.resolve(`out/contact/${id}-${frame}.png`);
      await renderStill({ composition, serveUrl, output, frame, scale: fmt === 'wide' ? 0.3 : 0.25 });
      files.push(output);
    }
    const w = Math.round(composition.width * (fmt === 'wide' ? 0.3 : 0.25)), h = Math.round(composition.height * (fmt === 'wide' ? 0.3 : 0.25));
    const cols = fmt === 'wide' ? 4 : 7, pad = 10;
    const rows = Math.ceil(files.length / cols);
    await sharp({ create: { width: pad + cols * (w + pad), height: pad + rows * (h + pad), channels: 3, background: '#111' } })
      .composite(files.map((f, i) => ({ input: f, left: pad + (i % cols) * (w + pad), top: pad + Math.floor(i / cols) * (h + pad) })))
      .png().toFile(path.resolve(`out/contact/${id}.png`));
    console.log('contact', id);
  }
}
