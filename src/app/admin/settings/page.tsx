import { resetSettingsAction, saveSettingsAction } from "@/app/admin/actions";
import {
  Field,
  ListEditor,
  MediaPicker,
  PageHeader,
  PairEditor,
  SaveBar,
} from "@/components/admin/ui";
import { getMedia, getSettings } from "@/lib/queries";
import { requireAdmin } from "@/lib/guard";

export const metadata = { title: "Settings & copy" };

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[4px] border border-line bg-ink-1 p-6">
      <h2 className="kicker">{title}</h2>
      {hint && <p className="mt-2 max-w-2xl text-xs text-paper-30">{hint}</p>}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

export default async function SettingsAdmin() {
  await requireAdmin();

  const s = getSettings();
  const media = getMedia();

  return (
    <form action={saveSettingsAction}>
      <PageHeader
        title="Settings & copy"
        subtitle="Every line of text on the home page, plus contact details and SEO. Nothing here is hard-coded."
      />

      <div className="flex flex-col gap-6">
        <Group title="Brand">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Brand name">
              <input name="brandName" defaultValue={s.brandName} className="admin-input" />
            </Field>
            <Field label="Brand suffix">
              <input name="brandSuffix" defaultValue={s.brandSuffix} className="admin-input" />
            </Field>
            <Field label="Tagline">
              <input name="tagline" defaultValue={s.tagline} className="admin-input" />
            </Field>
          </div>
        </Group>

        <Group title="Hero" hint="The first screen. The headline is set in the oversized display face and animates character by character.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Kicker">
              <input name="heroKicker" defaultValue={s.heroKicker} className="admin-input" />
            </Field>
            <Field label="Headline" hint="Short. One word reads best.">
              <input name="heroHeadline" defaultValue={s.heroHeadline} className="admin-input" />
            </Field>
          </div>
          <Field label="Lead paragraph">
            <textarea name="heroLead" rows={3} defaultValue={s.heroLead} className="admin-input" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Primary button">
              <input name="heroPrimaryCta" defaultValue={s.heroPrimaryCta} className="admin-input" />
            </Field>
            <Field label="Secondary button">
              <input
                name="heroSecondaryCta"
                defaultValue={s.heroSecondaryCta}
                className="admin-input"
              />
            </Field>
          </div>
        </Group>

        <Group title="Position" hint="The statement ledger — one line per row.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Kicker">
              <input
                name="manifestoKicker"
                defaultValue={s.manifestoKicker}
                className="admin-input"
              />
            </Field>
            <Field label="Title">
              <input name="manifestoTitle" defaultValue={s.manifestoTitle} className="admin-input" />
            </Field>
          </div>
          <ListEditor
            name="manifestoLines"
            label="Statements"
            initial={s.manifestoLines}
            placeholder="We automate first."
          />
          <Field label="Closing note">
            <textarea
              name="manifestoClosing"
              rows={2}
              defaultValue={s.manifestoClosing}
              className="admin-input"
            />
          </Field>
        </Group>

        <Group
          title="Image band"
          hint="The full-bleed photograph between Position and Method. Clear the image path to remove the band entirely."
        >
          <MediaPicker
            name="bandImage"
            label="Image"
            initial={s.bandImage}
            media={media}
            hint="Landscape works best — it is cropped to a wide band."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Kicker">
              <input name="bandKicker" defaultValue={s.bandKicker} className="admin-input" />
            </Field>
            <Field label="Line">
              <input name="bandLine" defaultValue={s.bandLine} className="admin-input" />
            </Field>
          </div>
        </Group>

        <Group title="Method section" hint="Wrapper copy for the five stages. Edit the stages themselves under Ladder stages.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Kicker">
              <input name="ladderKicker" defaultValue={s.ladderKicker} className="admin-input" />
            </Field>
            <Field label="Title">
              <input name="ladderTitle" defaultValue={s.ladderTitle} className="admin-input" />
            </Field>
          </div>
          <Field label="Lead">
            <textarea name="ladderLead" rows={3} defaultValue={s.ladderLead} className="admin-input" />
          </Field>
        </Group>

        <Group title="Numbers" hint="The counter strip. Values count up when they scroll into view, so use plain numbers and put symbols in the prefix or suffix.">
          <PairEditor
            name="metrics"
            label="Metrics"
            initial={s.metrics}
            fields={[
              { key: "label", placeholder: "Manual hours removed / month", width: "3 1 0" },
              { key: "value", placeholder: "12400", type: "number", width: "1 1 0" },
              { key: "prefix", placeholder: "prefix", width: "0.6 1 0" },
              { key: "suffix", placeholder: "+", width: "0.6 1 0" },
            ]}
          />
        </Group>

        <Group title="Capabilities section">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Kicker">
              <input name="servicesKicker" defaultValue={s.servicesKicker} className="admin-input" />
            </Field>
            <Field label="Title">
              <input name="servicesTitle" defaultValue={s.servicesTitle} className="admin-input" />
            </Field>
          </div>
          <Field label="Lead">
            <textarea
              name="servicesLead"
              rows={2}
              defaultValue={s.servicesLead}
              className="admin-input"
            />
          </Field>
        </Group>

        <Group title="Work section">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Kicker">
              <input name="workKicker" defaultValue={s.workKicker} className="admin-input" />
            </Field>
            <Field label="Title">
              <input name="workTitle" defaultValue={s.workTitle} className="admin-input" />
            </Field>
          </div>
          <Field label="Lead">
            <textarea name="workLead" rows={2} defaultValue={s.workLead} className="admin-input" />
          </Field>
        </Group>

        <Group title="Contact">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Kicker">
              <input name="contactKicker" defaultValue={s.contactKicker} className="admin-input" />
            </Field>
            <Field label="Title">
              <input name="contactTitle" defaultValue={s.contactTitle} className="admin-input" />
            </Field>
          </div>
          <Field label="Lead">
            <textarea
              name="contactLead"
              rows={3}
              defaultValue={s.contactLead}
              className="admin-input"
            />
          </Field>
          <Field label="Contact name" hint="Shown with the contact details in the footer and contact section.">
            <input name="contactName" defaultValue={s.contactName} className="admin-input" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Email">
              <input name="email" type="email" defaultValue={s.email} className="admin-input" />
            </Field>
            <Field label="Phone">
              <input name="phone" defaultValue={s.phone} className="admin-input" />
            </Field>
            <Field label="Address">
              <input name="address" defaultValue={s.address} className="admin-input" />
            </Field>
          </div>
          <PairEditor
            name="socials"
            label="Social links"
            initial={s.socials}
            fields={[
              { key: "label", placeholder: "LinkedIn" },
              { key: "url", placeholder: "https://…", width: "2 1 0" },
            ]}
          />
          <Field label="Footer note">
            <input name="footerNote" defaultValue={s.footerNote} className="admin-input" />
          </Field>
        </Group>

        <Group title="Search & sharing">
          <Field label="Page title" hint="Shown in the browser tab and in search results.">
            <input name="seoTitle" defaultValue={s.seoTitle} className="admin-input" />
          </Field>
          <Field label="Meta description" hint="Around 150–160 characters works best.">
            <textarea
              name="seoDescription"
              rows={3}
              defaultValue={s.seoDescription}
              className="admin-input"
            />
          </Field>
        </Group>
      </div>

      <SaveBar>
        <ResetButton />
      </SaveBar>
    </form>
  );
}

/** Nested in its own form element would be invalid; use formAction instead. */
function ResetButton() {
  return (
    <button type="submit" formAction={resetSettingsAction} className="admin-btn text-[0.625rem]">
      Restore defaults
    </button>
  );
}
