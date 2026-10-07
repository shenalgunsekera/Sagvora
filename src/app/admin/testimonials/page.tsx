import Link from "next/link";
import { deleteTestimonialAction, moveItemAction } from "@/app/admin/actions";
import { DeleteButton, PageHeader, Pill, ReorderButtons } from "@/components/admin/ui";
import { getTestimonials } from "@/lib/queries";
import { requireAdmin } from "@/lib/guard";

export const metadata = { title: "Testimonials" };

export default async function TestimonialsAdmin() {
  await requireAdmin();

  const items = getTestimonials(false);

  return (
    <>
      <PageHeader
        title="Testimonials"
        subtitle="Quotes rotate in the Voices section. Publish only what the client has approved in writing."
        action={{ href: "/admin/testimonials/new", label: "+ New testimonial" }}
      />

      {items.some((t) => !t.published) && (
        <div className="mb-6 rounded-[4px] border border-signal-dim bg-ink-1 p-5">
          <div className="kicker kicker-signal">Drafts present</div>
          <p className="mt-2 max-w-3xl text-sm text-paper-60">
            The quotes shipped with this site are illustrative examples, seeded as drafts so
            nothing invented can reach the public site by accident. Replace them with real,
            approved quotes before publishing. While no testimonial is published, the Voices
            section is hidden from the home page entirely.
          </p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-[4px] border border-dashed border-line p-12 text-center">
          <p className="text-sm text-paper-45">No testimonials yet.</p>
          <Link href="/admin/testimonials/new" className="admin-btn admin-btn-primary mt-5">
            Add one
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((t, i) => (
            <li key={t.id} className="rounded-[4px] border border-line bg-ink-1 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <blockquote className="min-w-0 max-w-3xl">
                  <p className="text-sm leading-relaxed text-paper-80">“{t.quote}”</p>
                  <footer className="index mt-3">
                    {[t.author, t.role, t.company].filter(Boolean).join(" · ")}
                  </footer>
                </blockquote>

                <div className="flex shrink-0 items-center gap-2">
                  {t.published ? <Pill tone="live">Live</Pill> : <Pill>Draft</Pill>}
                  <ReorderButtons
                    action={moveItemAction}
                    table="testimonials"
                    id={t.id}
                    isFirst={i === 0}
                    isLast={i === items.length - 1}
                  />
                  <Link href={`/admin/testimonials/${t.id}`} className="admin-btn text-[0.625rem]">
                    Edit
                  </Link>
                  <DeleteButton
                    action={deleteTestimonialAction}
                    id={t.id}
                    confirmText="Delete this testimonial?"
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
