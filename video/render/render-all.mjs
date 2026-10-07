// Full render: 9:16 first, then 1:1 and 16:9 from the same timeline.
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const ids = (process.argv[2] || 'Vertical,Square,Wide').split(',');
const OUT = path.resolve('out');
fs.mkdirSync(OUT, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
for (const id of ids) {
  const composition = await selectComposition({ serveUrl, id });
  const outputLocation = path.join(OUT, `insuresaas-${id.toLowerCase()}.mp4`);
  let last = -1;
  await renderMedia({
    composition, serveUrl, codec: 'h264', crf: 16, audioCodec: 'aac', audioBitrate: '256k', outputLocation,
    concurrency: 6,
    onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log(id, p * 10 + '%'); } },
  });
  console.log('done', outputLocation, (fs.statSync(outputLocation).size / 1e6).toFixed(1) + 'MB');
}
