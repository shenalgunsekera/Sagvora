"use client";

import { useState } from "react";
import { saveStageAction } from "@/app/admin/actions";
import { Field, ListEditor, PageHeader, SaveBar, Toggle } from "@/components/admin/ui";
import type { Stage } from "@/lib/types";

export default function StageForm({
  stage,
  nextNumber,
  nextOrder,
}: {
  stage: Stage | null;
  nextNumber: number;
  nextOrder: number;
}) {
  const [humanShare, setHumanShare] = useState(stage?.humanShare ?? 50);

  return (
    <form action={saveStageAction}>
      <PageHeader
        title={stage ? `Stage ${stage.number} · ${stage.title}` : "New stage"}
        subtitle="Stages render in order on the home page, with a sticky rail that tracks the reader."
      />

      {stage && <input type="hidden" name="id" value={stage.id} />}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-3">
            <Field label="Stage number">
              <input
                name="number"
                type="number"
                min={1}
                required
                defaultValue={stage?.number ?? nextNumber}
                className="admin-input"
              />
            </Field>
            <Field label="Title" className="sm:col-span-2">
              <input
                name="title"
                required
                defaultValue={stage?.title ?? ""}
                className="admin-input"
                placeholder="AI Assist"
              />
            </Field>
          </div>

          <Field label="Subtitle" hint="One line, sets up what changes at this stage.">
            <input
              name="subtitle"
              defaultValue={stage?.subtitle ?? ""}
              className="admin-input"
              placeholder="Intelligence enters the workflow — as a colleague, not a replacement."
            />
          </Field>

          <Field label="Goal" hint="Printed large in the stage panel.">
            <input
              name="goal"
              defaultValue={stage?.goal ?? ""}
              className="admin-input"
              placeholder="Build confidence."
            />
          </Field>

          <ListEditor
            name="bullets"
            label="What happens"
            initial={stage?.bullets ?? []}
            placeholder="Introduce AI into the automated workflow."
            multiline
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-[4px] border border-line bg-ink-1 p-5">
            <Toggle
              name="published"
              label="Published"
              defaultChecked={stage ? Boolean(stage.published) : true}
            />
            <div className="mt-5">
              <Field label="Order">
                <input
                  name="orderIndex"
                  type="number"
                  defaultValue={stage?.orderIndex ?? nextOrder}
                  className="admin-input"
                />
              </Field>
            </div>
          </div>

          <div className="rounded-[4px] border border-line bg-ink-1 p-5">
            <label className="admin-label">Who does the work</label>

            <input type="hidden" name="humanShare" value={humanShare} />
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={humanShare}
              onChange={(e) => setHumanShare(Number(e.target.value))}
              className="w-full accent-[#d9b978]"
              aria-label="Percentage of the work done by humans"
            />

            <div className="mt-4 flex h-8 gap-px overflow-hidden rounded-[2px]">
              <div
                className="flex items-center justify-center"
                style={{ width: `${humanShare}%`, background: "rgba(244,244,240,0.14)" }}
              >
                <span className="index">{humanShare >= 20 ? "HUMAN" : ""}</span>
              </div>
              <div
                className="flex items-center justify-center"
                style={{ width: `${100 - humanShare}%`, background: "rgba(217,185,120,0.25)" }}
              >
                <span className="index text-signal">{100 - humanShare >= 20 ? "AI" : ""}</span>
              </div>
            </div>

            <p className="index mt-2">
              {humanShare}% human · {100 - humanShare}% AI
            </p>
            <p className="mt-3 text-xs leading-relaxed text-paper-30">
              This is the balance bar shown inside the stage panel. Later stages should tilt
              further toward AI.
            </p>
          </div>
        </div>
      </div>

      <SaveBar backHref="/admin/stages" />
    </form>
  );
}
