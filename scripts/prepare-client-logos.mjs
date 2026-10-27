/**
 * Client logos for the "Trusted by" carousel → public/clients/*.webp
 *
 * Sources are the original files in each client project on D:. Each logo is
 * trimmed of its padding and capped at 240px tall, keeping transparency. Logos
 * that are a square badge on their own background are kept whole.
 *
 *   node scripts/prepare-client-logos.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "clients");
fs.mkdirSync(OUT, { recursive: true });

const PMF_BANNER = "D:/PMF/pmf-website/public/pmf-logo.png"; // Ceilao | PMF co-brand, 1200×400

const LOGOS = [
  // Cropped from the co-brand banner: it carries both marks at 1200px.
  { slug: "ceilao", src: PMF_BANNER, crop: { left: 50, top: 50, width: 560, height: 240 }, knockout: true },
  { slug: "pmf-finance", src: PMF_BANNER, crop: { left: 670, top: 80, width: 480, height: 200 }, knockout: true },
  { slug: "araksha", src: "D:/Araksha Insurance Brokers/araksha-website/public/araksha-logo.png" },
  { slug: "insureme", src: "D:/Insurance Project/insuremelk-frontend/src/insureme-logo.png" },
  { slug: "power-mate", src: "D:/Shenals Portfolio/public/assets/img/powermate-logo.png" },
  { slug: "sterling", src: "D:/Shenals Portfolio/company logos/Sterling Automobiles  back-01.png" },
  { slug: "galactic-arcade", src: "D:/Shenals Portfolio/public/assets/img/galactic-logo.png", badge: true },
  { slug: "kids-and-teens", src: "D:/Kids and Teens/public/logo.png" },
  { slug: "the-ascend", src: "D:/TheAscend/theascend/Final-Logo.png" },
  { slug: "with-purpose", src: "D:/WithPurposeAcademy/WithPurpose_Logo.webp", badge: true },
  { slug: "my-banker", src: "D:/Upwork/banker-experts/frontend/src/assets/images/Logo.png" },
  // The Adaptis mark ships white for dark UI; recolour it for light tiles.
  {
    slug: "adaptis",
    svg: fs.existsSync("D:/Adaptis Website/adaptis-web/public/brand/adaptis-logo-card.svg")
      ? fs.readFileSync("D:/Adaptis Website/adaptis-web/public/brand/adaptis-logo-card.svg", "utf8").replace(/#FFFDF9/gi, "#14141a")
      : null,
  },
];

for (const l of LOGOS) {
  try {
    let img;
    if (l.svg) img = sharp(Buffer.from(l.svg), { density: 600 });
    else if (!fs.existsSync(l.src)) {
      console.warn(`  ! missing ${l.slug}: ${l.src}`);
      continue;
    } else img = sharp(l.src);

    if (l.crop) img = sharp(await img.extract(l.crop).png().toBuffer());
    let buf = await img.png().toBuffer();
    // The co-brand banner is opaque white: turn near-white pixels transparent,
    // feathering the edge so anti-aliasing stays smooth.
    if (l.knockout) {
      const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      for (let i = 0; i < data.length; i += 4) {
        const min = Math.min(data[i], data[i + 1], data[i + 2]);
        if (min > 200) data[i + 3] = Math.max(0, Math.round(255 * (1 - (min - 200) / 45)));
      }
      buf = await sharp(data, { raw: info }).png().toBuffer();
    }
    // Trim padding (white or transparent edges) unless the logo is a full badge.
    if (!l.badge) buf = await sharp(buf).trim({ threshold: 18 }).png().toBuffer();
    const out = await sharp(buf)
      .resize({ height: 240, width: 640, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 90, alphaQuality: 100 })
      .toFile(path.join(OUT, `${l.slug}.webp`));
    console.log(`  ${l.slug.padEnd(16)} ${out.width}×${out.height}  ${(out.size / 1024).toFixed(1)} KB`);
  } catch (e) {
    console.warn(`  ! ${l.slug}: ${e.message}`);
  }
}
