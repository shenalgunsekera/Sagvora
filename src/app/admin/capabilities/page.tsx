import Link from "next/link";
import { deleteServiceAction, moveItemAction } from "@/app/admin/actions";
import {
  DeleteButton,
  ListFilter,
  PageHeader,
  Pill,
  ReorderButtons,
} from "@/components/admin/ui";
import Glyph from "@/components/fx/Glyph";
import { filterList } from "@/lib/filter";
import { getServices } from "@/lib/queries";
import { requireAdmin } from "@/lib/guard";

export const metadata = { title: "Capabilities" };

export default async function CapabilitiesAdmin({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();

  const query = await searchParams;
  const all = getServices(false);
  // Titles, labels and slugs only. Including the summary and body made short
  // queries useless — "ai" hit "wait state" and "audit trail" and matched
  // almost everything.
  const services = filterList(all, query, (s) => [s.title, s.kicker, s.slug]);

  return (
    <>
      <PageHeader
        title="Capabilities"
        subtitle="The cards in the Capabilities grid, and a detail page for each. Use the arrows to reorder — the grid follows this order."
        action={{ href: "/admin/capabilities/new", label: "+ New capability" }}
      />

      {all.length > 0 && (
        <ListFilter
          total={all.length}
          shown={services.length}
          placeholder="Search capabilities…"
        />
      )}

      {all.length === 0 ? (
        <EmptyState />
      ) : services.length === 0 ? (
        <NoMatches />
      ) : (
        <ul className="overflow-hidden rounded-[4px] border border-line">
          {services.map((s) => {
            // Position is relative to the full list, not the filtered view, so
            // the arrows stay meaningful while a search is active.
            const index = all.findIndex((x) => x.id === s.id);
            return (
              <li
                key={s.id}
                className="flex flex-wrap items-center gap-4 border-b border-line bg-ink-1 px-5 py-4 last:border-b-0"
              >
                <Glyph name={s.glyph} size={26} className="shrink-0 text-paper-30" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/admin/capabilities/${s.id}`}
                      className="truncate text-sm text-paper underline-offset-4 hover:underline"
                    >
                      {s.title}
                    </Link>
                    {s.published ? <Pill tone="live">Live</Pill> : <Pill>Draft</Pill>}
                    {s.stage > 0 && <Pill tone="signal">Stage {s.stage}</Pill>}
                  </div>
                  <div className="index mt-1 truncate">/capabilities/{s.slug}</div>
                </div>

                <ReorderButtons
                  action={moveItemAction}
                  table="services"
                  id={s.id}
                  isFirst={index === 0}
                  isLast={index === all.length - 1}
                />

                <div className="flex shrink-0 gap-2">
                  <Link href={`/admin/capabilities/${s.id}`} className="admin-btn text-[0.625rem]">
                    Edit
                  </Link>
                  <DeleteButton
                    action={deleteServiceAction}
                    id={s.id}
                    confirmText={`Delete “${s.title}”? This cannot be undone.`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[4px] border border-dashed border-line p-12 text-center">
      <p className="text-sm text-paper-45">No capabilities yet.</p>
      <Link href="/admin/capabilities/new" className="admin-btn admin-btn-primary mt-5">
        Create the first one
      </Link>
    </div>
  );
}

function NoMatches() {
  return (
    <div className="rounded-[4px] border border-dashed border-line p-10 text-center text-sm text-paper-30">
      Nothing matches that filter.
    </div>
  );
}
