"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { uploadMediaAction, type ActionState } from "@/app/admin/actions";

/**
 * Phone photos are often 5–15 MB, over what the server accepts in one request.
 * Large rasters are scaled to 2400px and re-encoded in the browser first (the
 * server stores them at that size anyway), so any photo uploads.
 */
const MAX_SIDE = 2400;
const SHRINK_OVER = 3 * 1024 * 1024;

async function shrink(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= SHRINK_OVER) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.9));
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
}

function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="admin-btn admin-btn-primary shrink-0"
    >
      {pending ? "Uploading…" : "Upload"}
    </button>
  );
}

export default function MediaUploader() {
  const [state, formAction] = useActionState<ActionState, FormData>(uploadMediaAction, {});
  const [filename, setFilename] = useState("");
  const [dragging, setDragging] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const takeFiles = async (files: FileList | null) => {
    if (!files?.length || !inputRef.current) return;
    const original = files[0];
    setFilename(original.name);
    setPreparing(true);
    const ready = await shrink(original).catch(() => original);
    setPreparing(false);
    // DataTransfer lets the prepared (or dropped) file populate the real input.
    const dt = new DataTransfer();
    dt.items.add(ready);
    inputRef.current.files = dt.files;
  };

  return (
    <form action={formAction} className="rounded-[4px] border border-line bg-ink-1 p-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          takeFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-[3px] border border-dashed px-6 py-10 text-center transition-colors duration-200"
        style={{
          borderColor: dragging ? "var(--color-signal)" : "var(--color-line-strong)",
          background: dragging ? "var(--color-signal-ghost)" : "transparent",
        }}
      >
        <svg width="30" height="30" viewBox="0 0 30 30" className="text-paper-30" aria-hidden="true">
          <path
            d="M15 21V6m0 0-6 6m6-6 6 6M4 24h22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-4 text-sm text-paper-60">
          {filename || "Drop an image here, or click to choose"}
        </p>
        <p className="index mt-1">JPEG · PNG · WebP · AVIF · SVG · any size photo</p>

        <input
          ref={inputRef}
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const list = e.target.files;
            if (list?.length) void takeFiles(list);
            else setFilename("");
          }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[14rem] flex-1">
          <label className="admin-label" htmlFor="alt">
            Alt text
          </label>
          <input
            id="alt"
            name="alt"
            className="admin-input"
            placeholder="Describe the image for screen readers"
          />
        </div>
        <Submit disabled={!filename || preparing} />
      </div>

      {preparing && <p className="mt-3 text-sm text-paper-45">Preparing the image…</p>}
      {state.error && (
        <p className="mt-3 border-l-2 border-[#ff8b7a] pl-3 text-sm text-[#ff8b7a]">{state.error}</p>
      )}
      {state.ok && <p className="mt-3 text-sm text-signal">Uploaded.</p>}
    </form>
  );
}
