import SectionHeader from "./SectionHeader";
import WorkList from "./WorkList";
import type { Project, SiteSettings } from "@/lib/types";

export default function Work({
  projects,
  settings,
}: {
  projects: Project[];
  settings: SiteSettings;
}) {
  if (projects.length === 0) return null;

  return (
    <section id="work" className="section relative">
      <SectionHeader
        index="04"
        kicker={settings.workKicker}
        title={settings.workTitle}
        lead={settings.workLead}
      />

      <div className="shell mt-20">
        <WorkList projects={projects} />
      </div>
    </section>
  );
}
