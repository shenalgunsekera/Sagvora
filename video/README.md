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

## Project reels (Ceilao, PMF, Araksha, The Ascend, ThatPokerAgent, Union Settlement)

Six more 20-second reels share one kit (`src/kit/`): brand theme, real page
captures, a config per project in `src/reels/`. Same 120 BPM grid as above.

```bash
cd capture && node sites.mjs [slug]        # retina captures + element boxes -> public/<slug>/
# then make the metric-wall thumbnails: <page>-thumb.jpg (top 1440x900, 1120 wide)
node render/reels.mjs music   [slug,...]   # per-reel sfx timeline + score in its own key
node render/reels.mjs contact [slug,...]   # contact sheets -> out/contact/
node render/reels.mjs render  [slug,...]   # 16:9 + 9:16 masters -> out/
node render/reels.mjs web     [slug,...]   # site encodes + poster -> ../public/work/<slug>/
```

PMF's site isn't deployed; capture it from a local `next dev -p 3200` in
`D:\PMF\pmf-website`. The APT booking flow is driven to the confirm button and
never submitted.
