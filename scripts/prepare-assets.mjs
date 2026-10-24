/**
 * Turns the supplied brand PNGs (2.png / 3.png) into web-ready assets:
 *
 *   public/logo-light.png   white wordmark, transparent background (dark UI)
 *   public/logo-dark.png    black wordmark, transparent background (light UI)
 *   public/brand/*.png      untouched originals, kept for reference
 *   src/app/icon.png        512px favicon: the logo's S, white on black
 *   src/app/favicon.ico     16/32/48px versions of the same, for /favicon.ico
 *   src/app/apple-icon.png  180px home-screen icon with the SAGVORA wordmark
 *   public/mark.svg         the ascending-ladder mark (brand geometry)
 *
 *   npm run prepare:assets
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const appDir = path.join(root, "src", "app");

fs.mkdirSync(path.join(pub, "brand"), { recursive: true });
fs.mkdirSync(path.join(pub, "uploads"), { recursive: true });
fs.writeFileSync(path.join(pub, "uploads", ".gitkeep"), "");

/* -------------------------------------------------- wordmark → transparent PNG */

// 3.png is the white-on-black lockup; its luminance doubles as a perfect alpha
// mask, so we can recolour the wordmark without any manual cutout.
const source = path.join(root, "3.png");

if (fs.existsSync(source)) {
  const mask = await sharp(source)
    .trim({ threshold: 12 })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = mask.info;

  const recolour = async (rgb, out) => {
    await sharp({ create: { width, height, channels: 3, background: rgb } })
      .joinChannel(mask.data, { raw: { width, height, channels: 1 } })
      .png({ compressionLevel: 9 })
      .toFile(path.join(pub, out));
    console.log(`  ${out.padEnd(20)} ${width}×${height}`);
  };

  await recolour({ r: 255, g: 255, b: 255 }, "logo-light.png");
  await recolour({ r: 10, g: 10, b: 11 }, "logo-dark.png");

  for (const f of ["2.png", "3.png"]) {
    if (fs.existsSync(path.join(root, f))) {
      fs.copyFileSync(path.join(root, f), path.join(pub, "brand", f));
    }
  }
} else {
  console.warn("  ! 3.png not found at project root — skipping wordmark generation");
}

/* -------------------------------------------------- the mark */

// Five ascending bars: the transformation ladder, and the only piece of brand
// geometry that reads at 16px.
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="14" fill="#0A0A0B"/>
  <g fill="#F4F4F0">
    <rect x="12" y="42" width="7" height="10" rx="1.4"/>
    <rect x="22" y="36" width="7" height="16" rx="1.4"/>
    <rect x="32" y="28" width="7" height="24" rx="1.4"/>
    <rect x="42" y="19" width="7" height="33" rx="1.4"/>
  </g>
  <rect x="52" y="12" width="7" height="7" rx="1.4" fill="#D9B978"/>
</svg>`;

fs.writeFileSync(path.join(pub, "mark.svg"), markSvg);
console.log("  mark.svg written");

/* -------------------------------------------------- favicon + app icon */

// Cut straight from the white-on-black logo artwork so the icons are the logo,
// not a redraw. The full wordmark is illegible at 16px, so the favicon uses its
// S; the 180px home-screen icon has room for SAGVORA.
const logoSrc = path.join(pub, "brand", "3.png");
if (fs.existsSync(logoSrc)) {
  const cut = async (left, top, width, height) => {
    const region = await sharp(logoSrc).extract({ left, top, width, height }).png().toBuffer();
    return sharp(region).trim({ threshold: 40 }).toBuffer({ resolveWithObject: true });
  };
  const tile = async (size, glyph, fw, fh, radius) => {
    const g = await sharp(glyph.data)
      .resize({ width: Math.round(size * fw), height: Math.round(size * fh), fit: "inside" })
      .toBuffer({ resolveWithObject: true });
    const bg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#0A0A0B"/></svg>`,
    );
    return sharp(bg)
      .composite([{ input: g.data, left: Math.round((size - g.info.width) / 2), top: Math.round((size - g.info.height) / 2) }])
      .png()
      .toBuffer();
  };

  const letterS = await cut(190, 660, 240, 420);
  const wordmark = await cut(190, 660, 1620, 420);
  const icon = await tile(512, letterS, 0.66, 0.66, 96);
  fs.writeFileSync(path.join(appDir, "icon.png"), icon);
  fs.writeFileSync(path.join(appDir, "apple-icon.png"), await tile(180, wordmark, 0.8, 0.4, 0));

  // favicon.ico holding PNG-encoded 16/32/48px images.
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map((n) => sharp(icon).resize(n, n).png().toBuffer()));
  const head = Buffer.alloc(6 + 16 * sizes.length);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(sizes.length, 4);
  let offset = head.length;
  sizes.forEach((n, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(n, e);
    head.writeUInt8(n, e + 1);
    head.writeUInt16LE(1, e + 4);
    head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(pngs[i].length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += pngs[i].length;
  });
  fs.writeFileSync(path.join(appDir, "favicon.ico"), Buffer.concat([head, ...pngs]));
  console.log("  icon.png / favicon.ico / apple-icon.png written");
} else {
  console.warn("  ! public/brand/3.png not found — skipping favicon generation");
}
console.log("\n  Assets ready.\n");
