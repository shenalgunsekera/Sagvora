"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { uploadMediaAction, type ActionState } from "@/app/admin/actions";

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
  const inputRef = useRef<HTMLInputElement>(null);

  const takeFiles = (files: FileList | null) => {
    if (!files?.length || !inputRef.current) return;
    // DataTransfer lets a dropped file populate the real input.
    const dt = new DataTransfer();
    dt.items.add(files[0]);
    inputRef.current.files = dt.files;
    setFilename(files[0].name);
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
        <p className="index mt-1">JPEG · PNG · WebP · AVIF · SVG · up to 8 MB</p>

        <input
          ref={inputRef}
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
          className="hidden"
          onChange={(e) => setFilename(e.target.files?.[0]?.name ?? "")}
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
        <Submit disabled={!filename} />
      </div>

      {state.error && (
        <p className="mt-3 border-l-2 border-[#ff8b7a] pl-3 text-sm text-[#ff8b7a]">{state.error}</p>
      )}
      {state.ok && <p className="mt-3 text-sm text-signal">Uploaded.</p>}
    </form>
  );
}
