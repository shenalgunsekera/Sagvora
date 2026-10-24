import "server-only";
import { firestore } from "./firebase";

/**
 * Uploaded files, stored in Firestore so the free Firebase plan covers them.
 *
 * A file lives at blobs/{mediaId} (type + size + chunk count) with its bytes in
 * blobs/{mediaId}/chunks/{n}, each under Firestore's 1 MiB document limit.
 * Uploads are already capped at 2400px WebP, so most are a single chunk.
 */

const CHUNK = 900 * 1024;
const blobs = () => firestore().collection("blobs");

export async function saveBlob(id: number, mime: string, data: Buffer) {
  const ref = blobs().doc(String(id));
  const count = Math.max(1, Math.ceil(data.byteLength / CHUNK));
  const batch = firestore().batch();
  for (let i = 0; i < count; i++) {
    batch.set(ref.collection("chunks").doc(String(i)), { data: data.subarray(i * CHUNK, (i + 1) * CHUNK) });
  }
  batch.set(ref, { mime, size: data.byteLength, chunks: count });
  await batch.commit();
}

export async function readBlob(id: number): Promise<{ mime: string; data: Buffer } | null> {
  const ref = blobs().doc(String(id));
  const meta = (await ref.get()).data() as { mime: string; chunks: number } | undefined;
  if (!meta) return null;
  const parts = await ref.collection("chunks").get();
  const ordered = parts.docs
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map((d) => Buffer.from(d.get("data") as Uint8Array));
  return { mime: meta.mime, data: Buffer.concat(ordered) };
}

export async function deleteBlob(id: number) {
  const ref = blobs().doc(String(id));
  const parts = await ref.collection("chunks").get();
  const batch = firestore().batch();
  parts.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(ref);
  await batch.commit();
}
