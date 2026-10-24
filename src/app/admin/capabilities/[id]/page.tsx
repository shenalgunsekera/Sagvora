import { notFound } from "next/navigation";
import ServiceForm from "@/components/admin/forms/ServiceForm";
import { getMedia, getService, getServices, getStages } from "@/lib/queries";
import { requireAdmin } from "@/lib/guard";

export const metadata = { title: "Edit capability" };

export default async function CapabilityEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const isNew = id === "new";

  const service = isNew ? null : await getService(Number(id));
  if (!isNew && !service) notFound();

  // A sensible default order for new entries: append to the end.
  const nextOrder = (await getServices(false)).length;

  return (
    <ServiceForm
      service={service}
      media={await getMedia()}
      stages={await getStages(false)}
      nextOrder={nextOrder}
    />
  );
}
