import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/forms/ProjectForm";
import { getMedia, getProject, getProjects, getStages } from "@/lib/queries";
import { requireAdmin } from "@/lib/guard";

export const metadata = { title: "Edit case study" };

export default async function WorkEditor({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;
  const isNew = id === "new";

  const project = isNew ? null : await getProject(Number(id));
  if (!isNew && !project) notFound();

  return (
    <ProjectForm
      project={project}
      media={await getMedia()}
      stages={await getStages(false)}
      nextOrder={(await getProjects(false)).length}
    />
  );
}
