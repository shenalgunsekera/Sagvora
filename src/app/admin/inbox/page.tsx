import { deleteMessageAction, setMessageStatusAction } from "@/app/admin/actions";
import { DeleteButton, PageHeader, Pill } from "@/components/admin/ui";
import { getMessages } from "@/lib/queries";
import { requireAdmin } from "@/lib/guard";

export const metadata = { title: "Inbox" };

export default async function InboxAdmin() {
  await requireAdmin();

  const messages = getMessages();
  const unread = messages.filter((m) => m.status === "new").length;

  return (
    <>
      <PageHeader
        title="Inbox"
        subtitle={
          messages.length === 0
            ? "Submissions from the contact form land here."
            : `${messages.length} message${messages.length === 1 ? "" : "s"} · ${unread} unread`
        }
      />

      {messages.length === 0 ? (
        <div className="rounded-[4px] border border-dashed border-line p-12 text-center text-sm text-paper-30">
          Nothing yet. The contact form writes straight into this table — no third-party service
          involved.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className="rounded-[4px] border bg-ink-1 p-5"
              style={{
                borderColor:
                  m.status === "new" ? "var(--color-signal-dim)" : "var(--color-line)",
                opacity: m.status === "archived" ? 0.55 : 1,
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-paper">{m.name}</span>
                    {m.status === "new" && <Pill tone="signal">New</Pill>}
                    {m.status === "archived" && <Pill>Archived</Pill>}
                  </div>

                  <div className="index mt-1">
                    <a href={`mailto:${m.email}`} className="underline-offset-4 hover:underline">
                      {m.email}
                    </a>
                    {m.company && ` · ${m.company}`} · {m.createdAt}
                  </div>

                  {m.subject && (
                    <p className="mt-3 text-sm text-paper-60">
                      <span className="index">Process: </span>
                      {m.subject}
                    </p>
                  )}

                  <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-paper-80">
                    {m.message}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent(
                      `Re: ${m.subject || "your enquiry"}`,
                    )}`}
                    className="admin-btn text-[0.625rem]"
                  >
                    Reply
                  </a>

                  <StatusButton id={m.id} status={m.status === "read" ? "new" : "read"}>
                    {m.status === "read" ? "Mark unread" : "Mark read"}
                  </StatusButton>

                  <StatusButton id={m.id} status={m.status === "archived" ? "read" : "archived"}>
                    {m.status === "archived" ? "Restore" : "Archive"}
                  </StatusButton>

                  <DeleteButton
                    action={deleteMessageAction}
                    id={m.id}
                    confirmText={`Delete the message from ${m.name}?`}
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

function StatusButton({
  id,
  status,
  children,
}: {
  id: number;
  status: string;
  children: React.ReactNode;
}) {
  return (
    <form action={setMessageStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className="admin-btn text-[0.625rem]">
        {children}
      </button>
    </form>
  );
}
