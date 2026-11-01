import "server-only";
import QRCode from "qrcode";
import sharp from "sharp";
import { readBlob } from "./media-store";
import { siteUrl } from "./site-url";
import type { TeamMember } from "./types";

/**
 * Digital business cards: each team member has a public profile at
 * /card/<slug>. The QR code on their printed card points there, and the page
 * offers a "Save contact" vCard.
 */

/** "SAGVORA INNOVATIONS" (as stored for the wordmark) reads as "Sagvora Innovations" in text. */
export function companyName(brandName: string, brandSuffix: string) {
  const raw = `${brandName} ${brandSuffix}`.trim();
  return raw === raw.toUpperCase() ? raw.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : raw;
}

export const cardPath = (slug: string) => `/card/${slug}`;
export const cardUrl = (slug: string) => `${siteUrl()}${cardPath(slug)}`;

// Medium error correction survives a scuffed print without making the code dense.
const QR_OPTS = { errorCorrectionLevel: "M" as const, margin: 1 };

/** Ink-on-paper QR as an SVG string (crisp at any print size). */
export function qrSvg(text: string, dark = "#08080a", light = "#f4f4f0") {
  return QRCode.toString(text, { ...QR_OPTS, type: "svg", color: { dark, light } });
}

export function qrPng(text: string, width = 1024) {
  return QRCode.toBuffer(text, { ...QR_OPTS, type: "png", width, color: { dark: "#08080a", light: "#ffffff" } });
}

/** Photo bytes from the media library (/media/<id>/<name>), as a small JPEG for the vCard. */
async function photoJpeg(photo: string | null): Promise<Buffer | null> {
  const id = Number(/^\/media\/(\d+)\//.exec(photo ?? "")?.[1]);
  if (!id) return null;
  const blob = await readBlob(id).catch(() => null);
  if (!blob) return null;
  return sharp(blob.data).resize(400, 400, { fit: "cover" }).jpeg({ quality: 82 }).toBuffer().catch(() => null);
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

/** vCard 3.0, the version iOS and Android contacts both import cleanly. */
export async function vcard(m: TeamMember, company: string) {
  const [first, ...rest] = m.name.trim().split(/\s+/);
  const last = rest.join(" ");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(last)};${esc(first ?? "")};;;`,
    `FN:${esc(m.name)}`,
    `ORG:${esc(company)}`,
    m.position && `TITLE:${esc(m.position)}`,
    m.email && `EMAIL;TYPE=INTERNET,WORK:${m.email}`,
    m.phone && `TEL;TYPE=CELL,VOICE:${m.phone}`,
    `URL:${siteUrl()}`,
    m.linkedin && `URL;TYPE=LinkedIn:${m.linkedin}`,
    m.bio && `NOTE:${esc(m.bio)}`,
  ].filter(Boolean) as string[];

  const jpeg = await photoJpeg(m.photo);
  if (jpeg) lines.push(`PHOTO;ENCODING=b;TYPE=JPEG:${jpeg.toString("base64")}`);
  lines.push("END:VCARD");
  // RFC 6350 line folding: 75 octets max, continuation lines start with a space.
  return lines.map((l) => l.match(/.{1,74}/g)!.join("\r\n ")).join("\r\n") + "\r\n";
}
