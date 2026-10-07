import Link from "next/link";
import { deleteStageAction, moveItemAction } from "@/app/admin/actions";
import { DeleteButton, PageHeader, Pill, ReorderButtons } from "@/components/admin/ui";
import { getStages } from "@/lib/queries";
import { requireAdmin } from "@/lib/guard";

export const metadata = { title: "Ladder stages" };

export default async function StagesAdmin() {
  await requireAdmin();

  const stages = getStages(false);

  return (
    <>
      <PageHeader
        title="Ladder stages"
        subtitle="The five-stage method on the home page. The human/AI split drives the balance bar on each stage panel."
        action={{ href: "/admin/stages/new", label: "+ New stage" }}
      />

      <ul className="flex flex-col gap-3">
        {stages.map((s, i) => (
          <li key={s.id} className="rounded-[4px] border border-line bg-ink-1 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="index text-signal">
                    Stage {String(s.number).padStart(2, "0")}
                  </span>
                  <Link
                    href={`/admin/stages/${s.id}`}
                    className="text-sm text-paper underline-offset-4 hover:underline"
                  >
                    {s.title}
                  </Link>
                  {s.published ? <Pill tone="live">Live</Pill> : <Pill>Draft</Pill>}
                </div>
                <p className="mt-2 max-w-2xl text-sm text-paper-45">{s.subtitle}</p>
                <p className="index mt-2">Goal — {s.goal}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <ReorderButtons
                  action={moveItemAction}
                  table="stages"
                  id={s.id}
                  isFirst={i === 0}
                  isLast={i === stages.length - 1}
                />
                <Link href={`/admin/stages/${s.id}`} className="admin-btn text-[0.625rem]">
                  Edit
                </Link>
                <DeleteButton
                  action={deleteStageAction}
                  id={s.id}
                  confirmText={`Delete stage “${s.title}”?`}
                />
              </div>
            </div>

            {/* Balance preview */}
            <div className="mt-4 flex h-2 gap-px overflow-hidden rounded-[2px]">
              <div style={{ width: `${s.humanShare}%`, background: "rgba(244,244,240,0.18)" }} />
              <div
                style={{ width: `${100 - s.humanShare}%`, background: "rgba(217,185,120,0.35)" }}
              />
            </div>
            <div className="index mt-1.5">
              {s.humanShare}% human · {100 - s.humanShare}% AI · {s.bullets.length} bullet
              {s.bullets.length === 1 ? "" : "s"}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
