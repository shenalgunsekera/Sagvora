"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import type { MediaItem } from "@/lib/types";

/* ------------------------------------------------------------------ page header */

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
}) {
  return (
    <header className="mb-9 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <h1 className="display-sm text-paper">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-paper-45">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className="admin-btn admin-btn-primary">
          {action.label}
        </Link>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ field wrappers */

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="admin-label">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-paper-30">{hint}</p>}
    </div>
  );
}

export function Toggle({
  name,
  label,
  defaultChecked,
  hint,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  const [on, setOn] = useState(Boolean(defaultChecked));

  return (
    <div>
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          name={name}
          checked={on}
          onChange={(e) => setOn(e.target.checked)}
          className="sr-only"
        />
        <span
          className="relative h-5 w-9 rounded-full border transition-colors duration-300"
          style={{
            borderColor: on ? "var(--color-signal)" : "var(--color-line-strong)",
            background: on ? "var(--color-signal-ghost)" : "transparent",
          }}
        >
          <span
            className="absolute top-1/2 block h-3 w-3 -translate-y-1/2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              left: on ? "1.125rem" : "0.25rem",
              background: on ? "var(--color-signal)" : "var(--color-paper-30)",
            }}
          />
        </span>
        <span className="text-sm text-paper-60">{label}</span>
      </label>
      {hint && <p className="mt-1.5 text-xs text-paper-30">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ list editor */

export function ListEditor({
  name,
  label,
  initial,
  placeholder = "",
  hint,
  multiline = false,
}: {
  name: string;
  label: string;
  initial: string[];
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
}) {
  const [items, setItems] = useState<string[]>(initial.length ? initial : [""]);

  const update = (i: number, v: string) =>
    setItems((prev) => prev.map((item, idx) => (idx === i ? v : item)));
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) =>
    setItems((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  return (
    <div>
      <label className="admin-label">{label}</label>
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(items.map((i) => i.trim()).filter(Boolean))}
      />

      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-2.5 w-5 shrink-0 font-mono text-[0.625rem] text-paper-30">
              {String(i + 1).padStart(2, "0")}
            </span>

            {multiline ? (
              <textarea
                value={item}
                rows={2}
                onChange={(e) => update(i, e.target.value)}
                placeholder={placeholder}
                className="admin-input"
              />
            ) : (
              <input
                value={item}
                onChange={(e) => update(i, e.target.value)}
                placeholder={placeholder}
                className="admin-input"
              />
            )}

            <div className="flex shrink-0 gap-1">
              <IconBtn onClick={() => move(i, -1)} label="Move up">
                ↑
              </IconBtn>
              <IconBtn onClick={() => move(i, 1)} label="Move down">
                ↓
              </IconBtn>
              <IconBtn onClick={() => remove(i)} label="Remove" danger>
                ×
              </IconBtn>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setItems((p) => [...p, ""])}
        className="admin-btn mt-3 text-[0.625rem]"
      >
        + Add row
      </button>
      {hint && <p className="mt-2 text-xs text-paper-30">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ pair editor */

type PairField = { key: string; placeholder: string; width?: string; type?: "text" | "number" };

export function PairEditor<T extends Record<string, string | number>>({
  name,
  label,
  initial,
  fields,
  hint,
}: {
  name: string;
  label: string;
  initial: T[];
  fields: PairField[];
  hint?: string;
}) {
  const blank = () =>
    Object.fromEntries(fields.map((f) => [f.key, f.type === "number" ? 0 : ""])) as T;

  const [rows, setRows] = useState<T[]>(initial.length ? initial : [blank()]);

  const update = (i: number, key: string, value: string, type?: string) =>
    setRows((prev) =>
      prev.map((row, idx) =>
        idx === i ? { ...row, [key]: type === "number" ? Number(value) || 0 : value } : row,
      ),
    );

  const remove = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) =>
    setRows((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  // Drop rows where every text field is blank.
  const cleaned = rows.filter((r) =>
    fields.some((f) => String(r[f.key] ?? "").trim().length > 0),
  );

  return (
    <div>
      <label className="admin-label">{label}</label>
      <input type="hidden" name={name} value={JSON.stringify(cleaned)} />

      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-start gap-2">
            {fields.map((f) => (
              <input
                key={f.key}
                value={String(row[f.key] ?? "")}
                type={f.type ?? "text"}
                onChange={(e) => update(i, f.key, e.target.value, f.type)}
                placeholder={f.placeholder}
                className="admin-input"
                style={{ flex: f.width ?? "1 1 0" }}
              />
            ))}
            <div className="flex shrink-0 gap-1">
              <IconBtn onClick={() => move(i, -1)} label="Move up">
                ↑
              </IconBtn>
              <IconBtn onClick={() => move(i, 1)} label="Move down">
                ↓
              </IconBtn>
              <IconBtn onClick={() => remove(i)} label="Remove" danger>
                ×
              </IconBtn>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows((p) => [...p, blank()])}
        className="admin-btn mt-3 text-[0.625rem]"
      >
        + Add row
      </button>
      {hint && <p className="mt-2 text-xs text-paper-30">{hint}</p>}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-9 w-8 items-center justify-center rounded-[3px] border border-line text-sm transition-colors duration-200 hover:border-paper-30"
      style={danger ? { color: "#ff8b7a" } : undefined}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ media picker */

export function MediaPicker({
  name,
  label,
  initial,
  media,
  hint,
  multiple = false,
}: {
  name: string;
  label: string;
  initial: string | string[] | null;
  media: MediaItem[];
  hint?: string;
  multiple?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(
    multiple
      ? Array.isArray(initial)
        ? initial
        : []
      : initial && typeof initial === "string"
        ? [initial]
        : [],
  );
  const [browsing, setBrowsing] = useState(false);

  const toggle = (url: string) =>
    setSelected((prev) =>
      multiple
        ? prev.includes(url)
          ? prev.filter((u) => u !== url)
          : [...prev, url]
        : prev[0] === url
          ? []
          : [url],
    );

  return (
    <div>
      <label className="admin-label">{label}</label>
      <input
        type="hidden"
        name={name}
        value={multiple ? JSON.stringify(selected) : (selected[0] ?? "")}
      />

      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selected.map((url) => (
            <div key={url} className="relative h-20 w-28 overflow-hidden rounded-[3px] border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => toggle(url)}
                aria-label="Remove image"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-[2px] bg-ink-0/85 text-xs text-paper"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setBrowsing((v) => !v)} className="admin-btn">
          {browsing ? "Close library" : selected.length ? "Change" : "Choose from library"}
        </button>
        <Link href="/admin/media" target="_blank" className="admin-btn">
          Upload new ↗
        </Link>
      </div>

      {browsing && (
        <div className="mt-3 max-h-72 overflow-y-auto rounded-[3px] border border-line p-3">
          {media.length === 0 ? (
            <p className="p-4 text-sm text-paper-30">
              Nothing uploaded yet — add images from the Media page.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {media.map((m) => {
                const active = selected.includes(m.url);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggle(m.url)}
                    className="relative aspect-[4/3] overflow-hidden rounded-[2px] border transition-all duration-200"
                    style={{
                      borderColor: active ? "var(--color-signal)" : "var(--color-line)",
                      opacity: active ? 1 : 0.75,
                    }}
                    title={m.filename}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt={m.alt} className="h-full w-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {hint && <p className="mt-2 text-xs text-paper-30">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ save bar */

export function SaveBar({
  backHref,
  label = "Save changes",
  children,
}: {
  backHref?: string;
  label?: string;
  children?: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="sticky bottom-0 z-20 mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-ink-0/90 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link href={backHref} className="admin-btn">
            Back
          </Link>
        )}
        {children}
      </div>
      <button type="submit" disabled={pending} className="admin-btn admin-btn-primary">
        {pending ? "Saving…" : label}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ delete */

export function DeleteButton({
  action,
  id,
  label = "Delete",
  confirmText = "Delete this permanently?",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: number;
  label?: string;
  confirmText?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="admin-btn admin-btn-danger text-[0.625rem]">
        {label}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ reorder */

/**
 * Up/down controls for a list row. Ends of the list are disabled rather than
 * hidden, so the buttons never shift position between rows.
 */
export function ReorderButtons({
  action,
  table,
  id,
  isFirst,
  isLast,
}: {
  action: (formData: FormData) => void | Promise<void>;
  table: string;
  id: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-1">
      {([-1, 1] as const).map((dir) => {
        const disabled = dir === -1 ? isFirst : isLast;
        return (
          <form action={action} key={dir}>
            <input type="hidden" name="table" value={table} />
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="dir" value={dir} />
            <button
              type="submit"
              disabled={disabled}
              aria-label={dir === -1 ? "Move up" : "Move down"}
              title={dir === -1 ? "Move up" : "Move down"}
              className="flex h-8 w-7 items-center justify-center rounded-[3px] border border-line text-xs transition-colors duration-200 enabled:hover:border-paper-30 disabled:opacity-25"
            >
              {dir === -1 ? "↑" : "↓"}
            </button>
          </form>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ list filter */

/**
 * Search + status filter for the long content lists. State lives in the URL, so
 * a filtered view can be bookmarked and survives a save-and-return.
 */
export function ListFilter({
  total,
  shown,
  placeholder = "Search…",
}: {
  total: number;
  shown: number;
  placeholder?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const q = params.get("q") ?? "";
  const status = params.get("status") ?? "all";

  const apply = (next: Record<string, string>) => {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === "all") sp.delete(k);
      else sp.set(k, v);
    }
    const query = sp.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <input
        type="search"
        defaultValue={q}
        placeholder={placeholder}
        aria-label="Search this list"
        onChange={(e) => apply({ q: e.target.value })}
        className="admin-input max-w-xs flex-1"
      />

      <div className="flex gap-1" role="group" aria-label="Filter by status">
        {[
          { value: "all", label: "All" },
          { value: "live", label: "Live" },
          { value: "draft", label: "Draft" },
        ].map((option) => {
          const active = status === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => apply({ status: option.value })}
              aria-pressed={active}
              className="rounded-[3px] border px-3 py-2 font-mono text-[0.625rem] uppercase tracking-[0.14em] transition-colors duration-200"
              style={{
                borderColor: active ? "var(--color-signal-dim)" : "var(--color-line)",
                color: active ? "var(--color-signal)" : "var(--color-paper-45)",
                background: active ? "var(--color-signal-ghost)" : "transparent",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <span className="index ml-auto">
        {shown === total ? `${total} total` : `${shown} of ${total}`}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ status pill */

export function Pill({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "signal" | "live";
}) {
  const tones = {
    muted: { color: "var(--color-paper-30)", border: "var(--color-line)" },
    signal: { color: "var(--color-signal)", border: "var(--color-signal-dim)" },
    live: { color: "var(--color-paper)", border: "var(--color-line-strong)" },
  } as const;

  return (
    <span
      className="inline-block rounded-full border px-2.5 py-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.14em]"
      style={{ color: tones[tone].color, borderColor: tones[tone].border }}
    >
      {children}
    </span>
  );
}
