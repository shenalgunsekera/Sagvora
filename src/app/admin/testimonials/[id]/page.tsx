import { notFound } from "next/navigation";
import { saveTestimonialAction } from "@/app/admin/actions";
import { Field, MediaPicker, PageHeader, SaveBar, Toggle } from "@/components/admin/ui";
import { getMedia, getTestimonial, getTestimonials } from "@/lib/queries";
import { requireAdmin } from "@/lib/guard";

export const metadata = { title: "Edit testimonial" };

export default async function TestimonialEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const isNew = id === "new";

  const item = isNew ? null : getTestimonial(Number(id));
  if (!isNew && !item) notFound();

  const media = getMedia();
  const nextOrder = getTestimonials(false).length;

  return (
    <form action={saveTestimonialAction}>
      <PageHeader
        title={item ? `Testimonial · ${item.author || "Untitled"}` : "New testimonial"}
        subtitle="Keep quotes specific. A number or a behaviour change reads as true; an adjective does not."
      />

      {item && <input type="hidden" name="id" value={item.id} />}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Field label="Quote">
            <textarea
              name="quote"
              rows={5}
              required
              defaultValue={item?.quote ?? ""}
              className="admin-input"
              placeholder="They spent three weeks refusing to sell us anything…"
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-3">
            <Field label="Author">
              <input
                name="author"
                defaultValue={item?.author ?? ""}
                className="admin-input"
                placeholder="Operations Director"
              />
            </Field>
            <Field label="Role">
              <input name="role" defaultValue={item?.role ?? ""} className="admin-input" />
            </Field>
            <Field label="Company">
              <input
                name="company"
                defaultValue={item?.company ?? ""}
                className="admin-input"
                placeholder="Industrial manufacturing client"
              />
            </Field>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-[4px] border border-line bg-ink-1 p-5">
            <Toggle
              name="published"
              label="Published"
              defaultChecked={item ? Boolean(item.published) : true}
            />
            <div className="mt-5">
              <Field label="Order">
                <input
                  name="orderIndex"
                  type="number"
                  defaultValue={item?.orderIndex ?? nextOrder}
                  className="admin-input"
                />
              </Field>
            </div>
          </div>

          <div className="rounded-[4px] border border-line bg-ink-1 p-5">
            <MediaPicker
              name="avatar"
              label="Avatar (optional)"
              initial={item?.avatar ?? null}
              media={media}
            />
          </div>
        </div>
      </div>

      <SaveBar backHref="/admin/testimonials" />
    </form>
  );
}
