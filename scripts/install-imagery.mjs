/**
 * Installs the shipped photography.
 *
 * Reads scripts/imagery.json (source URL + destination + where it attaches),
 * downloads each image, converts it to a width-capped WebP in public/imagery/,
 * registers it in the media library, and attaches it to the matching project
 * or capability.
 *
 * Idempotent: an image already on disk is not re-downloaded, and attachments
 * are only written when the record has no image yet — so it will never stomp a
 * picture you chose yourself in the admin.
 *
 *   node scripts/install-imagery.mjs
 */
import Database from "better-sqlite3";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "imagery");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "scripts", "imagery.json"), "utf8"));

fs.mkdirSync(outDir, { recursive: true });

const db = new Database(path.join(root, "data", "sagvora.db"));
db.exec(fs.readFileSync(path.join(root, "src", "lib", "schema.sql"), "utf8"));

const hasMedia = db.prepare("SELECT id FROM media WHERE url = ?");
const insertMedia = db.prepare(
  `INSERT INTO media (filename, url, mime, size, width, height, alt)
   VALUES (@filename, @url, @mime, @size, @width, @height, @alt)`,
);

let downloaded = 0;
let attached = 0;

for (const item of manifest) {
  const filename = `${item.name}.webp`;
  const dest = path.join(outDir, filename);
  const url = `/imagery/${filename}`;

  if (!fs.existsSync(dest)) {
    const res = await fetch(item.src);
    if (!res.ok) {
      console.warn(`  ! ${item.name}: source returned ${res.status} — skipped`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 76 })
      .toFile(dest);
    downloaded++;
  }

  const stat = fs.statSync(dest);
  const meta = await sharp(dest).metadata();

  if (!hasMedia.get(url)) {
    insertMedia.run({
      filename,
      url,
      mime: "image/webp",
      size: stat.size,
      width: meta.width ?? null,
      height: meta.height ?? null,
      alt: item.alt,
    });
  }

  // Attach, but never overwrite a choice already made in the admin.
  if (item.project) {
    const r = db
      .prepare("UPDATE projects SET cover = ? WHERE slug = ? AND (cover IS NULL OR cover = '')")
      .run(url, item.project);
    attached += r.changes;
  }
  if (item.service) {
    const r = db
      .prepare("UPDATE services SET image = ? WHERE slug = ? AND (image IS NULL OR image = '')")
      .run(url, item.service);
    attached += r.changes;
  }

  console.log(`  ${filename.padEnd(34)} ${meta.width}×${meta.height}  ${Math.round(stat.size / 1024)} KB`);
}

console.log(`\n  ${downloaded} downloaded, ${attached} attached.`);

/* ------------------------------------------------------------------ share card
 * The 1200×630 card used when a link is posted anywhere.
 *
 * It composites the real logo PNG rather than setting type, so there is no
 * dependency on Archivo being installed on whatever machine runs this — the
 * lockup is always pixel-correct.
 */

const ogBase = path.join(outDir, "band-control-room.webp");
const logo = path.join(root, "public", "logo-light.png");
const ogOut = path.join(root, "public", "og.png");

if (fs.existsSync(ogBase) && fs.existsSync(logo)) {
  const W = 1200;
  const H = 630;

  // Grade the photograph: lift it, then push it back down under a scrim so the
  // white lockup stays legible on every platform's background.
  const plate = await sharp(ogBase)
    .resize({ width: W, height: H, fit: "cover", position: "centre" })
    .modulate({ brightness: 1.32 })
    .toBuffer();

  const scrim = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <linearGradient id="v" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#08080A" stop-opacity="0.96"/>
          <stop offset="55%" stop-color="#08080A" stop-opacity="0.72"/>
          <stop offset="100%" stop-color="#08080A" stop-opacity="0.86"/>
        </linearGradient>
        <radialGradient id="c" cx="0.82" cy="0.24" r="0.6">
          <stop offset="0%" stop-color="#A6C8E8" stop-opacity="0.20"/>
          <stop offset="100%" stop-color="#A6C8E8" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#v)"/>
      <rect width="${W}" height="${H}" fill="url(#c)"/>
      <!-- The two accents, stated as a rule across the top -->
      <rect x="0" y="0" width="${W * 0.46}" height="3" fill="#D9B978"/>
      <rect x="${W * 0.46}" y="0" width="${W * 0.54}" height="3" fill="#A6C8E8"/>
    </svg>`,
  );

  const mark = await sharp(logo).resize({ width: 560 }).toBuffer();
  const markMeta = await sharp(mark).metadata();

  await sharp(plate)
    .composite([
      { input: scrim, top: 0, left: 0 },
      { input: mark, left: 78, top: Math.round(H / 2 - (markMeta.height ?? 240) / 2) },
    ])
    .png({ compressionLevel: 9 })
    .toFile(ogOut);

  const ogStat = fs.statSync(ogOut);
  console.log(`  og.png                             ${W}×${H}  ${Math.round(ogStat.size / 1024)} KB`);
} else {
  console.warn("  ! share card skipped — run prepare:assets and imagery first");
}

console.log("");
db.close();
