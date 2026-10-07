"use client";

import { saveServiceAction } from "@/app/admin/actions";
import { Field, ListEditor, MediaPicker, PageHeader, PairEditor, SaveBar, Toggle } from "@/components/admin/ui";
import { GLYPH_KEYS } from "@/components/fx/Glyph";
import Glyph from "@/components/fx/Glyph";
import { useState } from "react";
import type { MediaItem, Service, Stage } from "@/lib/types";

export default function ServiceForm({
  service,
  media,
  stages,
  nextOrder,
}: {
  service: Service | null;
  media: MediaItem[];
  stages: Stage[];
  nextOrder: number;
}) {
  const [glyph, setGlyph] = useState(service?.glyph ?? "grid");

  return (
    <form action={saveServiceAction}>
      <PageHeader
        title={service ? service.title : "New capability"}
        subtitle={
          service
            ? `Public URL: /capabilities/${service.slug}`
            : "Appears as a card in the Capabilities grid and gets its own detail page."
        }
      />

      {service && <input type="hidden" name="id" value={service.id} />}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Field label="Title">
            <input
              name="title"
              required
              defaultValue={service?.title ?? ""}
              className="admin-input"
              placeholder="Process Automation"
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Slug" hint="Leave blank to generate from the title.">
              <input
                name="slug"
                defaultValue={service?.slug ?? ""}
                className="admin-input"
                placeholder="process-automation"
              />
            </Field>

            <Field label="Kicker" hint="Small label above the title on the card.">
              <input
                name="kicker"
                defaultValue={service?.kicker ?? ""}
                className="admin-input"
                placeholder="Stage 01 · Automate"
              />
            </Field>
          </div>

          <Field label="Summary" hint="One or two sentences. Shown on the card and in search results.">
            <textarea
              name="summary"
              rows={3}
              defaultValue={service?.summary ?? ""}
              className="admin-input"
            />
          </Field>

          <Field
            label="Body"
            hint="The detail page copy. Separate paragraphs with a blank line."
          >
            <textarea
              name="body"
              rows={10}
              defaultValue={service?.body ?? ""}
              className="admin-input"
            />
          </Field>

          <ListEditor
            name="features"
            label="What is included"
            initial={service?.features ?? []}
            placeholder="Approval, routing and escalation logic"
          />

          <PairEditor
            name="outcomes"
            label="At a glance"
            initial={service?.outcomes ?? []}
            fields={[
              { key: "label", placeholder: "Typical engagement" },
              { key: "value", placeholder: "2–3 weeks" },
            ]}
            hint="Shown in the sidebar of the detail page."
          />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="rounded-[4px] border border-line bg-ink-1 p-5">
            <Toggle
              name="published"
              label="Published"
              defaultChecked={service ? Boolean(service.published) : true}
              hint="Unpublished items disappear from the site but stay here."
            />

            <div className="mt-5 grid grid-cols-2 gap-4">
              <Field label="Order">
                <input
                  name="orderIndex"
                  type="number"
                  defaultValue={service?.orderIndex ?? nextOrder}
                  className="admin-input"
                />
              </Field>

              <Field label="Stage">
                <select
                  name="stage"
                  defaultValue={String(service?.stage ?? 0)}
                  className="admin-input"
                >
                  <option value="0">None</option>
                  {stages.map((s) => (
                    <option key={s.id} value={s.number}>
                      {s.number} · {s.title}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <div className="rounded-[4px] border border-line bg-ink-1 p-5">
            <label className="admin-label">Glyph</label>
            <input type="hidden" name="glyph" value={glyph} />
            <div className="grid grid-cols-4 gap-2">
              {GLYPH_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setGlyph(key)}
                  title={key}
                  className="flex aspect-square items-center justify-center rounded-[3px] border transition-colors duration-200"
                  style={{
                    borderColor:
                      glyph === key ? "var(--color-signal)" : "var(--color-line)",
                    color: glyph === key ? "var(--color-paper)" : "var(--color-paper-30)",
                  }}
                >
                  <Glyph name={key} size={26} />
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-paper-30">Line mark shown on the card.</p>
          </div>

          <div className="rounded-[4px] border border-line bg-ink-1 p-5">
            <MediaPicker
              name="image"
              label="Image (optional)"
              initial={service?.image ?? null}
              media={media}
            />
          </div>
        </div>
      </div>

      <SaveBar backHref="/admin/capabilities" />
    </form>
  );
}
