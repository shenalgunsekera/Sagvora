import { readBlob } from "@/lib/media-store";

/**
 * Serves an uploaded file from Firestore. URLs carry the media id and never
 * change for a given file, so the CDN may keep them for a year.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string; name: string }> }) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return new Response("Not found", { status: 404 });

  const blob = await readBlob(n);
  if (!blob) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(blob.data), {
    headers: {
      "content-type": blob.mime,
      "content-length": String(blob.data.byteLength),
      "cache-control": "public, max-age=31536000, immutable",
      // SVG uploads are served from our origin; never let them run script.
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "x-content-type-options": "nosniff",
    },
  });
}
