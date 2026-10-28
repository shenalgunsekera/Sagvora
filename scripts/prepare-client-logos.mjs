/**
 * Client logos for the "Trusted by" strip.
 *
 *   public/clients/color/*.webp  the logo as the client ships it
 *   public/clients/*.webp        a single-colour paper version for the dark strip
 *
 * Sources are the original files in each client project on D:. Each logo is
 * trimmed of its padding and capped at 240px tall, keeping transparency. The
 * mono version keeps the logo's shape and turns its white parts (text knocked
 * out of a badge, a white background) into holes, so every mark sits directly
 * on the page in one colour instead of on a white tile.
 *
 *   node scripts/prepare-client-logos.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "clients");
fs.mkdirSync(path.join(OUT, "color"), { recursive: true });
fs.mkdirSync(path.join(OUT, "tint"), { recursive: true });

/** Paper-coloured silhouette: alpha follows ink, near-white becomes a hole. */
async function mono(buf, { knockDark = false, inkWhite = false } = {}) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    const whiteness = Math.min(1, Math.max(0, (min - 190) / 50));
    // Badges whose mark is drawn in white on a colour field keep the white.
    let ink = inkWhite ? whiteness : 1 - whiteness; // otherwise white → hole
    if (knockDark) ink *= Math.min(1, Math.max(0, (max - 28) / 30)); // badge backdrop → hole
    data[i + 3] = Math.round(data[i + 3] * ink);
    data[i] = 244;
    data[i + 1] = 244;
    data[i + 2] = 240;
  }
  return sharp(data, { raw: info }).trim({ threshold: 1 }).png().toBuffer();
}

/**
 * Same holes as mono(), but keeps the brand colours. Black/grey ink would vanish
 * on the dark page, so neutrals turn paper and dark colours are lifted.
 */
async function tint(buf, { knockDark = false, inkWhite = false } = {}) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const whiteness = Math.min(1, Math.max(0, (min - 190) / 50));
    let ink = inkWhite ? whiteness : 1 - whiteness;
    if (knockDark) ink *= Math.min(1, Math.max(0, (max - 28) / 30));
    data[i + 3] = Math.round(data[i + 3] * ink);
    const chroma = Math.min(1, Math.max(0, (max - min - 24) / 40)); // 0 = grey, 1 = colour
    const lift = max < 150 ? (150 - max) / 150 : 0; // dark colours move toward white
    const paper = [244, 244, 240];
    [r, g, b].forEach((c, k) => {
      const coloured = c + (255 - c) * lift * 0.55;
      data[i + k] = Math.round(paper[k] * (1 - chroma) + coloured * chroma);
    });
  }
  return sharp(data, { raw: info }).trim({ threshold: 1 }).png().toBuffer();
}

const PMF_BANNER = "D:/PMF/pmf-website/public/pmf-logo.png"; // Ceilao | PMF co-brand, 1200×400

const LOGOS = [
  // Cropped from the co-brand banner: it carries both marks at 1200px.
  { slug: "ceilao", src: PMF_BANNER, crop: { left: 50, top: 50, width: 560, height: 240 }, knockout: true },
  // Ceilao × PMF bancassurance lockup ("Powered by InsureSAAS"), opaque white.
  { slug: "ceilao-pmf", src: "D:/PMF/unnamed.png", knockout: true },
  { slug: "araksha", src: "D:/Araksha Insurance Brokers/araksha-website/public/araksha-logo.png" },
  { slug: "power-mate", src: "D:/Shenals Portfolio/public/assets/img/powermate-logo.png" },
  { slug: "sterling", src: "D:/Shenals Portfolio/company logos/Sterling Automobiles  back-01.png" },
  { slug: "galactic-arcade", src: "D:/Shenals Portfolio/public/assets/img/galactic-logo.png", badge: true, mono: { inkWhite: true } },
  { slug: "kids-and-teens", src: "D:/Kids and Teens/public/logo.png" },
  { slug: "the-ascend", src: "D:/TheAscend/theascend/Final-Logo.png" },
  { slug: "with-purpose", src: "D:/WithPurposeAcademy/WithPurpose_Logo.webp", badge: true, mono: { inkWhite: true } },
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
    const save = (b, file) =>
      sharp(b)
        .resize({ height: 240, width: 640, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 90, alphaQuality: 100 })
        .toFile(file);
    await save(buf, path.join(OUT, "color", `${l.slug}.webp`));
    const out = await save(await mono(buf, l.mono), path.join(OUT, `${l.slug}.webp`));
    await save(await tint(buf, l.mono), path.join(OUT, "tint", `${l.slug}.webp`));
    console.log(`  ${l.slug.padEnd(16)} ${out.width}×${out.height}  ${(out.size / 1024).toFixed(1)} KB`);
  } catch (e) {
    console.warn(`  ! ${l.slug}: ${e.message}`);
  }
}
