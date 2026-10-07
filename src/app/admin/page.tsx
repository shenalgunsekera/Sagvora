import Link from "next/link";
import { PageHeader, Pill } from "@/components/admin/ui";
import { getCounts, getMessages, getProjects, getServices } from "@/lib/queries";
import { requireAdmin } from "@/lib/guard";

export default async function AdminDashboard() {
  await requireAdmin();

  const counts = getCounts();
  const recent = getMessages().slice(0, 5);
  const unpublishedServices = getServices(false).filter((s) => !s.published).length;
  const unpublishedProjects = getProjects(false).filter((p) => !p.published).length;

  const tiles = [
    { label: "Capabilities", value: counts.services, href: "/admin/capabilities" },
    { label: "Case studies", value: counts.projects, href: "/admin/work" },
    { label: "Ladder stages", value: counts.stages, href: "/admin/stages" },
    { label: "Testimonials", value: counts.testimonials, href: "/admin/testimonials" },
    { label: "Media files", value: counts.media, href: "/admin/media" },
    { label: "New messages", value: counts.newMessages, href: "/admin/inbox" },
  ];

  return (
    <>
      <PageHeader
        title="Control room"
        subtitle="Everything on the public site is edited from here. Changes are live the moment you save."
      />

      <div className="grid gap-px overflow-hidden rounded-[4px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="group bg-ink-1 p-6 transition-colors duration-300 hover:bg-ink-2"
          >
            <div className="index">{t.label}</div>
            <div className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold leading-none text-paper">
              {t.value}
            </div>
            <div className="index mt-4 flex items-center gap-2 transition-colors duration-300 group-hover:text-signal">
              Manage
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </div>
          </Link>
        ))}
      </div>

      {(unpublishedServices > 0 || unpublishedProjects > 0) && (
        <div className="mt-6 rounded-[4px] border border-line bg-ink-1 p-5">
          <div className="kicker kicker-signal">Not visible on the site</div>
          <p className="mt-2 text-sm text-paper-60">
            {unpublishedServices > 0 && (
              <>
                {unpublishedServices} capabilit{unpublishedServices === 1 ? "y is" : "ies are"}{" "}
                unpublished
              </>
            )}
            {unpublishedServices > 0 && unpublishedProjects > 0 && " · "}
            {unpublishedProjects > 0 && (
              <>
                {unpublishedProjects} case stud{unpublishedProjects === 1 ? "y is" : "ies are"}{" "}
                unpublished
              </>
            )}
            .
          </p>
        </div>
      )}

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="kicker">Latest enquiries</h2>
          <Link href="/admin/inbox" className="index transition-colors hover:text-paper">
            Open inbox →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-[4px] border border-dashed border-line p-8 text-center text-sm text-paper-30">
            No messages yet. The contact form on the home page writes straight into this inbox.
          </div>
        ) : (
          <ul className="overflow-hidden rounded-[4px] border border-line">
            {recent.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-ink-1 px-5 py-4 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="truncate text-sm text-paper">{m.name}</span>
                    {m.status === "new" && <Pill tone="signal">New</Pill>}
                  </div>
                  <div className="index mt-1 truncate">
                    {m.company ? `${m.company} · ` : ""}
                    {m.email}
                  </div>
                </div>
                <span className="index shrink-0">{m.createdAt}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[4px] border border-line bg-ink-1 p-6">
        <div>
          <h2 className="kicker">Backup</h2>
          <p className="mt-2 max-w-xl text-sm text-paper-45">
            Downloads every editable record — drafts included — as readable JSON. Copying{" "}
            <code className="text-paper-60">data/sagvora.db</code> and{" "}
            <code className="text-paper-60">public/uploads/</code> is still the full restore
            path; this is the diffable companion.
          </p>
        </div>
        <a href="/admin/api/export" className="admin-btn shrink-0">
          Export JSON ↓
        </a>
      </section>

      <section className="mt-6 rounded-[4px] border border-line bg-ink-1 p-6">
        <h2 className="kicker">Quick start</h2>
        <ul className="mt-4 flex flex-col gap-2 text-sm text-paper-45">
          <li>
            1. Replace the sample case studies in{" "}
            <Link href="/admin/work" className="text-paper underline underline-offset-4">
              Work
            </Link>{" "}
            with your own.
          </li>
          <li>
            2. Swap the placeholder quotes in{" "}
            <Link href="/admin/testimonials" className="text-paper underline underline-offset-4">
              Testimonials
            </Link>{" "}
            for approved, attributable ones.
          </li>
          <li>
            3. Set your real contact details and headline numbers in{" "}
            <Link href="/admin/settings" className="text-paper underline underline-offset-4">
              Settings
            </Link>
            .
          </li>
          <li>
            4. Change the seeded password in{" "}
            <Link href="/admin/account" className="text-paper underline underline-offset-4">
              Account
            </Link>
            .
          </li>
        </ul>
      </section>
    </>
  );
}
