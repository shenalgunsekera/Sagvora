/** Shared list filtering for the admin index pages. */

export type ListQuery = { q?: string; status?: string };

/**
 * Apply the `?q=` and `?status=` filters.
 *
 * `fields` names the values a search should look through, so each list decides
 * what "searchable" means for it rather than everything matching on title only.
 */
export function filterList<T extends { published: number }>(
  items: T[],
  query: ListQuery,
  fields: (item: T) => (string | undefined | null)[],
): T[] {
  const q = (query.q ?? "").trim().toLowerCase();
  const status = query.status ?? "all";

  return items.filter((item) => {
    if (status === "live" && !item.published) return false;
    if (status === "draft" && item.published) return false;
    if (!q) return true;

    return fields(item).some((value) => value?.toLowerCase().includes(q));
  });
}
