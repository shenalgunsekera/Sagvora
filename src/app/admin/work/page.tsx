import Link from "next/link";
import { deleteProjectAction, moveItemAction } from "@/app/admin/actions";
import {
  DeleteButton,
  ListFilter,
  PageHeader,
  Pill,
  ReorderButtons,
} from "@/components/admin/ui";
import { filterList } from "@/lib/filter";
import { getProjects } from "@/lib/queries";
import { requireAdmin } from "@/lib/guard";

export const metadata = { title: "Work" };

export default async function WorkAdmin({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();

  const query = await searchParams;
  const all = getProjects(false);
  const projects = filterList(all, query, (p) => [
    p.title,
    p.client,
    p.industry,
    p.year,
    p.slug,
    p.tags.join(" "),
  ]);

  return (
    <>
      <PageHeader
        title="Work"
        subtitle="Case studies. Each one gets a row in the Work index and a full page of its own."
        action={{ href: "/admin/work/new", label: "+ New case study" }}
      />

      {all.length > 0 && (
        <ListFilter
          total={all.length}
          shown={projects.length}
          placeholder="Search by title, client, industry or tag…"
        />
      )}

      {all.length === 0 ? (
        <div className="rounded-[4px] border border-dashed border-line p-12 text-center">
          <p className="text-sm text-paper-45">No case studies yet.</p>
          <Link href="/admin/work/new" className="admin-btn admin-btn-primary mt-5">
            Create the first one
          </Link>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-[4px] border border-dashed border-line p-10 text-center text-sm text-paper-30">
          Nothing matches that filter.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-[4px] border border-line">
          {projects.map((p) => {
            const index = all.findIndex((x) => x.id === p.id);
            return (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-4 border-b border-line bg-ink-1 px-5 py-4 last:border-b-0"
              >
                {p.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.cover}
                    alt=""
                    width={64}
                    height={40}
                    className="h-10 w-16 shrink-0 rounded-[2px] border border-line object-cover"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/admin/work/${p.id}`}
                      className="truncate text-sm text-paper underline-offset-4 hover:underline"
                    >
                      {p.title}
                    </Link>
                    {p.published ? <Pill tone="live">Live</Pill> : <Pill>Draft</Pill>}
                    {Boolean(p.featured) && <Pill tone="signal">Featured</Pill>}
                  </div>
                  <div className="index mt-1 truncate">
                    {p.client} · {p.industry} · {p.year} · /work/{p.slug}
                  </div>
                </div>

                <ReorderButtons
                  action={moveItemAction}
                  table="projects"
                  id={p.id}
                  isFirst={index === 0}
                  isLast={index === all.length - 1}
                />

                <div className="flex shrink-0 gap-2">
                  <Link href={`/admin/work/${p.id}`} className="admin-btn text-[0.625rem]">
                    Edit
                  </Link>
                  <DeleteButton
                    action={deleteProjectAction}
                    id={p.id}
                    confirmText={`Delete “${p.title}”? This cannot be undone.`}
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
