/** Tiny FormData readers so the actions stay declarative. */

export const str = (fd: FormData, key: string, fallback = "") => {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : fallback;
};

export const num = (fd: FormData, key: string, fallback = 0) => {
  const v = Number(fd.get(key));
  return Number.isFinite(v) ? v : fallback;
};

/** Checkboxes are absent when unchecked, so presence is the signal. */
export const bool = (fd: FormData, key: string) => (fd.get(key) ? 1 : 0);

/** Repeating fields are posted as a JSON string from the list editors. */
export function json<T>(fd: FormData, key: string, fallback: T): T {
  const raw = fd.get(key);
  if (typeof raw !== "string" || !raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}

const COMBINING_MARKS = /[̀-ͯ]/g;

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Ensure a slug exists; callers still handle DB uniqueness conflicts. */
export function slugFrom(fd: FormData, titleKey = "title", slugKey = "slug") {
  const explicit = str(fd, slugKey);
  return slugify(explicit || str(fd, titleKey)) || `item-${Date.now()}`;
}
