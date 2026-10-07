# InsureSAAS showreel

20-second motion piece for InsureSAAS, built in Remotion from real screenshots
of the product (`D:\InsureSAAS\InsureSAAS\frontend`).

```bash
npm install
npm run music     # synthesize public/music.wav (120 BPM, sfx synced to src/timeline.json)
npm run contact   # contact sheet, one frame per beat -> out/contact/
npm run render    # 9:16, 1:1, 16:9 masters -> out/
npm run studio    # scrub the timeline in the browser
```

## Re-capturing the product screens

`capture/` bundles the real InsureSAAS source against an in-memory Firebase
(`capture/mock/`, demo data in `seed.js`) so screens can be shot without
production credentials or customer data.

```bash
cd capture && npm install
node build.mjs     # bundle InsureSAAS with the mock Firebase
node capture.mjs   # retina screenshots + element rects -> ../assets
```

Copy `assets/screens/*`, `assets/rects.json` and `assets/logo-white.png` into
`public/` afterwards.

## On the website

The site plays web encodes from `/public/work/insuresaas/`
(`reel-16x9.mp4`, `reel-9x16.mp4`, `poster.webp`). Re-encode after a render:

```bash
npx remotion ffmpeg -i out/insuresaas-wide.mp4 -c:v libx264 -preset slow -crf 24 -movflags +faststart -c:a aac -b:a 160k ../public/work/insuresaas/reel-16x9.mp4
npx remotion ffmpeg -i out/insuresaas-vertical.mp4 -c:v libx264 -preset slow -crf 25 -movflags +faststart -c:a aac -b:a 160k ../public/work/insuresaas/reel-9x16.mp4
```
