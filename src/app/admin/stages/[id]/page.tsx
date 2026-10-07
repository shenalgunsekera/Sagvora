import { notFound } from "next/navigation";
import StageForm from "@/components/admin/forms/StageForm";
import { getStage, getStages } from "@/lib/queries";
import { requireAdmin } from "@/lib/guard";

export const metadata = { title: "Edit stage" };

export default async function StageEditor({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;
  const isNew = id === "new";

  const stage = isNew ? null : getStage(Number(id));
  if (!isNew && !stage) notFound();

  const existing = getStages(false);

  return (
    <StageForm
      stage={stage}
      nextNumber={existing.length + 1}
      nextOrder={existing.length}
    />
  );
}
