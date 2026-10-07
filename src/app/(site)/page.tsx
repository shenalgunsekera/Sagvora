import Capabilities from "@/components/site/Capabilities";
import Contact from "@/components/site/Contact";
import Hero from "@/components/site/Hero";
import ImageBand from "@/components/site/ImageBand";
import Ladder from "@/components/site/Ladder";
import Manifesto from "@/components/site/Manifesto";
import Metrics from "@/components/site/Metrics";
import { OrganisationLd } from "@/components/site/StructuredData";
import Voices from "@/components/site/Voices";
import Work from "@/components/site/Work";
import { getProjects, getServices, getSettings, getStages, getTestimonials } from "@/lib/queries";

export default async function HomePage() {
  const settings = getSettings();
  const stages = getStages();
  const services = getServices();
  const projects = getProjects();
  const testimonials = getTestimonials();

  return (
    <>
      <OrganisationLd settings={settings} services={services} />
      <Hero settings={settings} />
      <Manifesto settings={settings} />
      {settings.bandImage && (
        <ImageBand
          src={settings.bandImage}
          alt={settings.bandKicker}
          kicker={settings.bandKicker}
          line={settings.bandLine}
        />
      )}
      <Ladder stages={stages} settings={settings} />
      <Metrics settings={settings} />
      <Capabilities services={services} settings={settings} />
      <Work projects={projects} settings={settings} />
      <Voices items={testimonials} />
      <Contact settings={settings} index={testimonials.length > 0 ? "06" : "05"} />
    </>
  );
}
