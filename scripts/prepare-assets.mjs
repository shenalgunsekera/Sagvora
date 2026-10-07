/**
 * Turns the supplied brand PNGs (2.png / 3.png) into web-ready assets:
 *
 *   public/logo-light.png   white wordmark, transparent background (dark UI)
 *   public/logo-dark.png    black wordmark, transparent background (light UI)
 *   public/brand/*.png      untouched originals, kept for reference
 *   src/app/icon.svg        the ascending-ladder mark used as the favicon
 *   src/app/apple-icon.png  180×180 raster of the same mark
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

fs.writeFileSync(path.join(appDir, "icon.svg"), markSvg);
await sharp(Buffer.from(markSvg)).resize(180, 180).png().toFile(path.join(appDir, "apple-icon.png"));
fs.writeFileSync(path.join(pub, "mark.svg"), markSvg);

console.log("  icon.svg / apple-icon.png / mark.svg written");
console.log("\n  Assets ready.\n");
