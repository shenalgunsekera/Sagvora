// Contact sheet: one frame per story beat, for every format, tiled with sharp.
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import sharp from '../../node_modules/sharp/lib/index.js';
import path from 'node:path';
import fs from 'node:fs';

const BEATS = [['1 Hook', 72], ['2 Product', 160], ['3a Compare', 250], ['3b Search', 335], ['3c Claims', 425], ['4 Metric', 492], ['5 Logo', 572]];
const ids = (process.argv[2] || 'Vertical').split(',');
const OUT = path.resolve('out/contact');
fs.mkdirSync(OUT, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });

for (const id of ids) {
  const composition = await selectComposition({ serveUrl, id });
  const files = [];
  for (const [label, frame] of BEATS) {
    const output = path.join(OUT, `${id}-${frame}.png`);
    await renderStill({ composition, serveUrl, output, frame, scale: 0.5 });
    files.push(output);
    console.log(id, label, frame);
  }
  const w = composition.width / 2, h = composition.height / 2, pad = 16, lab = 40;
  const cols = id === 'Vertical' ? 7 : 4, rows = Math.ceil(files.length / cols);
  const tiles = [];
  for (let i = 0; i < files.length; i++) {
    const x = pad + (i % cols) * (w + pad), y = pad + Math.floor(i / cols) * (h + pad + lab);
    tiles.push({ input: files[i], left: x, top: y + lab });
    const svg = `<svg width="${w}" height="${lab}"><text x="0" y="28" font-family="Segoe UI" font-weight="700" font-size="24" fill="#E89A2A">${BEATS[i][0]}  <tspan fill="#9fb3d1">f${BEATS[i][1]}</tspan></text></svg>`;
    tiles.push({ input: Buffer.from(svg), left: x, top: y });
  }
  await sharp({ create: { width: pad + cols * (w + pad), height: pad + rows * (h + pad + lab), channels: 3, background: '#0b1020' } })
    .composite(tiles).png().toFile(path.join(OUT, `contact-${id}.png`));
  console.log('contact sheet', id);
}
