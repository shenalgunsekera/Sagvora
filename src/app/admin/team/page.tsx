import Link from "next/link";
import { deleteTeamMemberAction, moveItemAction } from "@/app/admin/actions";
import { DeleteButton, PageHeader, Pill, ReorderButtons } from "@/components/admin/ui";
import { cardPath, cardUrl, qrSvg } from "@/lib/card";
import { getTeam } from "@/lib/queries";
import { requireAdmin } from "@/lib/guard";

export const metadata = { title: "Team cards" };

export default async function TeamAdmin() {
  await requireAdmin();
  const team = await getTeam(false);
  const qrs = await Promise.all(team.map((m) => qrSvg(cardUrl(m.slug), "#f4f4f0", "#0b0b0e")));

  return (
    <>
      <PageHeader
        title="Team cards"
        subtitle="Each person gets a QR code that opens their digital card: photo, role, one-tap call, WhatsApp, email and Save contact. Print the card, or share the QR on its own."
        action={{ href: "/admin/team/new", label: "+ New person" }}
      />

      {team.length === 0 ? (
        <div className="rounded-[4px] border border-dashed border-line p-12 text-center">
          <p className="text-sm text-paper-45">No one yet. Add yourself first.</p>
          <Link href="/admin/team/new" className="admin-btn admin-btn-primary mt-5">
            Create a card
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {team.map((m, i) => (
            <li key={m.id} className="flex gap-5 rounded-[4px] border border-line bg-ink-1 p-5">
              <div
                className="w-28 shrink-0 self-start rounded-[4px] border border-line p-1.5"
                role="img"
                aria-label={`QR code for ${m.name}`}
                dangerouslySetInnerHTML={{ __html: qrs[i] }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo} alt="" className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-ink-3 text-sm font-bold text-paper">
                      {m.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-paper">{m.name}</p>
                    <p className="truncate text-sm text-paper-45">{m.position}</p>
                  </div>
                  <div className="ml-auto">{m.published ? <Pill tone="live">Live</Pill> : <Pill>Hidden</Pill>}</div>
                </div>
                <p className="index mt-3 truncate text-paper-45">{cardUrl(m.slug).replace(/^https?:\/\//, "")}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link href={`/admin/team/${m.id}`} className="admin-btn text-[0.625rem]">
                    Edit
                  </Link>
                  <Link href={`/admin/team/${m.id}/card`} className="admin-btn admin-btn-primary text-[0.625rem]">
                    Print card
                  </Link>
                  <a href={cardPath(m.slug)} target="_blank" rel="noopener noreferrer" className="admin-btn text-[0.625rem]">
                    Open ↗
                  </a>
                  <a href={`${cardPath(m.slug)}/qr?format=png&download`} className="admin-btn text-[0.625rem]">
                    QR .png
                  </a>
                  <ReorderButtons
                    action={moveItemAction}
                    table="team"
                    id={m.id}
                    isFirst={i === 0}
                    isLast={i === team.length - 1}
                  />
                  <DeleteButton
                    action={deleteTeamMemberAction}
                    id={m.id}
                    confirmText={`Delete the card for ${m.name}? Its QR code will stop working.`}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
