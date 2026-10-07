"use client";

import { saveProjectAction } from "@/app/admin/actions";
import {
  Field,
  ListEditor,
  MediaPicker,
  PageHeader,
  PairEditor,
  SaveBar,
  Toggle,
} from "@/components/admin/ui";
import type { MediaItem, Project, Stage } from "@/lib/types";

export default function ProjectForm({
  project,
  media,
  stages,
  nextOrder,
}: {
  project: Project | null;
  media: MediaItem[];
  stages: Stage[];
  nextOrder: number;
}) {
  return (
    <form action={saveProjectAction}>
      <PageHeader
        title={project ? project.title : "New case study"}
        subtitle={
          project
            ? `Public URL: /work/${project.slug}`
            : "If you leave the cover empty, a diagram is generated from the slug — every case study still gets distinctive artwork."
        }
      />

      {project && <input type="hidden" name="id" value={project.id} />}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Field label="Title" hint="Lead with the result, not the client name.">
            <input
              name="title"
              required
              defaultValue={project?.title ?? ""}
              className="admin-input"
              placeholder="Quotation turnaround cut from six days to four hours"
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Client">
              <input
                name="client"
                defaultValue={project?.client ?? ""}
                className="admin-input"
                placeholder="Regional steel fabricator"
              />
            </Field>
            <Field label="Industry">
              <input
                name="industry"
                defaultValue={project?.industry ?? ""}
                className="admin-input"
                placeholder="Industrial manufacturing"
              />
            </Field>
            <Field label="Year">
              <input
                name="year"
                defaultValue={project?.year ?? String(new Date().getFullYear())}
                className="admin-input"
              />
            </Field>
            <Field label="Slug" hint="Leave blank to generate from the title.">
              <input name="slug" defaultValue={project?.slug ?? ""} className="admin-input" />
            </Field>
          </div>

          <Field label="Summary" hint="Shown under the title on the case study page.">
            <textarea
              name="summary"
              rows={3}
              defaultValue={project?.summary ?? ""}
              className="admin-input"
            />
          </Field>

          <Field label="The situation" hint="What was happening before you arrived.">
            <textarea
              name="challenge"
              rows={6}
              defaultValue={project?.challenge ?? ""}
              className="admin-input"
            />
          </Field>

          <Field label="What we did">
            <textarea
              name="approach"
              rows={6}
              defaultValue={project?.approach ?? ""}
              className="admin-input"
            />
          </Field>

          <Field label="Where it landed">
            <textarea
              name="outcome"
              rows={6}
              defaultValue={project?.outcome ?? ""}
              className="admin-input"
            />
          </Field>

          <PairEditor
            name="metrics"
            label="Headline numbers"
            initial={project?.metrics ?? []}
            fields={[
              { key: "label", placeholder: "Quote turnaround" },
              { key: "value", placeholder: "6 days → 4 hrs" },
            ]}
            hint="The first two appear in the Work index. All of them appear on the case study page."
          />

          <ListEditor
            name="tags"
            label="Tags"
            initial={project?.tags ?? []}
            placeholder="AI Assist"
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-[4px] border border-line bg-ink-1 p-5">
            <Toggle
              name="published"
              label="Published"
              defaultChecked={project ? Boolean(project.published) : true}
            />
            <div className="mt-4">
              <Toggle
                name="featured"
                label="Featured"
                defaultChecked={Boolean(project?.featured)}
                hint="Reserved for emphasis in future layouts."
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <Field label="Order">
                <input
                  name="orderIndex"
                  type="number"
                  defaultValue={project?.orderIndex ?? nextOrder}
                  className="admin-input"
                />
              </Field>
              <Field label="Stage reached">
                <select
                  name="stage"
                  defaultValue={String(project?.stage ?? 1)}
                  className="admin-input"
                >
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
            <MediaPicker
              name="cover"
              label="Cover image"
              initial={project?.cover ?? null}
              media={media}
              hint="Leave empty to use the generated diagram."
            />
          </div>

          <div className="rounded-[4px] border border-line bg-ink-1 p-5">
            <Field label="Showreel video" hint="Path or URL to an MP4, e.g. /work/insuresaas/reel-16x9.mp4. When set, the case study plays it in a lightbox.">
              <input name="video" defaultValue={project?.video ?? ""} className="admin-input" placeholder="/work/…/reel-16x9.mp4" />
            </Field>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Client logo" hint="Light wordmark on a transparent background. Replaces the client name.">
                <input name="logo" defaultValue={project?.logo ?? ""} className="admin-input" placeholder="/work/…/logo.png" />
              </Field>
              <Field label="Brand colour" hint="Hex, e.g. #38A3E0. Leave empty for the house gold.">
                <input name="accent" defaultValue={project?.accent ?? ""} className="admin-input" placeholder="#38A3E0" pattern="#[0-9A-Fa-f]{6}" />
              </Field>
            </div>
          </div>

          <div className="rounded-[4px] border border-line bg-ink-1 p-5">
            <MediaPicker
              name="gallery"
              label="Gallery"
              initial={project?.gallery ?? []}
              media={media}
              multiple
              hint="Shown as a grid near the bottom of the case study."
            />
          </div>
        </div>
      </div>

      <SaveBar backHref="/admin/work" />
    </form>
  );
}
