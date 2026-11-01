import { notFound } from "next/navigation";
import { saveTeamMemberAction } from "@/app/admin/actions";
import { Field, MediaPicker, PageHeader, SaveBar, Toggle } from "@/components/admin/ui";
import { getMedia, getTeam, getTeamMember } from "@/lib/queries";
import { requireAdmin } from "@/lib/guard";

export const metadata = { title: "Edit card" };

export default async function TeamMemberEditor({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;
  const isNew = id === "new";
  const m = isNew ? null : await getTeamMember(Number(id));
  if (!isNew && !m) notFound();

  const media = await getMedia();
  const nextOrder = (await getTeam(false)).length;

  return (
    <form action={saveTeamMemberAction}>
      <PageHeader
        title={m ? `Card · ${m.name}` : "New card"}
        subtitle="Everything here shows on the page the QR code opens. Leave a field empty to hide its button."
      />

      {m && <input type="hidden" name="id" value={m.id} />}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Name">
              <input name="name" required defaultValue={m?.name ?? ""} className="admin-input" placeholder="Shenal Gunasekera" />
            </Field>
            <Field label="Position">
              <input name="position" defaultValue={m?.position ?? ""} className="admin-input" placeholder="Founder & CEO" />
            </Field>
            <Field label="Email">
              <input name="email" type="email" defaultValue={m?.email ?? ""} className="admin-input" placeholder="name@sagvora.lk" />
            </Field>
            <Field label="Phone">
              <input name="phone" type="tel" defaultValue={m?.phone ?? ""} className="admin-input" placeholder="+94 74 336 4614" />
            </Field>
            <Field label="WhatsApp" hint="Number with country code. A leading 0 becomes 94.">
              <input name="whatsapp" type="tel" defaultValue={m?.whatsapp ?? ""} className="admin-input" placeholder="94743364614" />
            </Field>
            <Field label="LinkedIn">
              <input name="linkedin" defaultValue={m?.linkedin ?? ""} className="admin-input" placeholder="linkedin.com/in/your-name" />
            </Field>
          </div>
          <Field label="Short bio (optional)" hint="One or two lines under the name.">
            <textarea name="bio" rows={3} maxLength={240} defaultValue={m?.bio ?? ""} className="admin-input" />
          </Field>
          <Field
            label="Card address"
            hint="The QR code points to sagvora.lk/card/<this>. Leave empty to make it from the name. Changing it breaks cards already printed."
          >
            <input name="slug" defaultValue={m?.slug ?? ""} className="admin-input" placeholder="made-from-the-name" />
          </Field>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-[4px] border border-line bg-ink-1 p-5">
            <MediaPicker
              name="photo"
              label="Photo"
              initial={m?.photo ?? null}
              media={media}
              hint="A square, well-lit head-and-shoulders shot works best."
            />
          </div>
          <div className="rounded-[4px] border border-line bg-ink-1 p-5">
            <Toggle name="published" label="Card live" defaultChecked={m ? Boolean(m.published) : true} />
            <div className="mt-5">
              <Field label="Order">
                <input name="orderIndex" type="number" defaultValue={m?.orderIndex ?? nextOrder} className="admin-input" />
              </Field>
            </div>
          </div>
        </div>
      </div>

      <SaveBar backHref="/admin/team" />
    </form>
  );
}
