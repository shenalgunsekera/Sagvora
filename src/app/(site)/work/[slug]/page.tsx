import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SplitText from "@/components/fx/SplitText";
import ProjectVisual from "@/components/site/ProjectVisual";
import { ReelCover } from "@/components/site/Reel";
import { BreadcrumbLd, CaseStudyLd } from "@/components/site/StructuredData";
import { getProjectBySlug, getProjects, getStages } from "@/lib/queries";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Not found" };

  // Share the case study's own cover when it has one; fall back to the site card.
  const images = [{ url: project.cover ?? "/og.png", alt: project.title }];

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.summary,
      type: "article",
      url: `/work/${project.slug}`,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
      images,
    },
  };
}

export default async function WorkPage({ params }: Params) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project || !project.published) notFound();

  const all = getProjects();
  const idx = all.findIndex((p) => p.slug === project.slug);
  const next = all[(idx + 1) % all.length];
  const stage = getStages().find((s) => s.number === project.stage);

  const chapters = [
    { label: "The situation", body: project.challenge },
    { label: "What we did", body: project.approach },
    { label: "Where it landed", body: project.outcome },
  ].filter((c) => c.body);

  // The client's brand colour, when set, replaces the house gold on this page.
  const accent = project.accent ?? "var(--color-signal)";

  return (
    <div style={{ ["--accent" as string]: accent }}>
      <CaseStudyLd project={project} />
      <BreadcrumbLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Work", path: "/#work" },
          { name: project.title, path: `/work/${project.slug}` },
        ]}
      />

      {/* Header */}
      <section className="pb-16 pt-40">
        <div className="shell">
          <Link href="/#work" className="index link-wipe inline-block">
            ← All work
          </Link>

          <div className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-2">
            {project.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.logo} alt={project.client} className="h-6 w-auto md:h-8" />
            ) : (
              <span className="kicker kicker-signal">{project.client}</span>
            )}
            <span className="h-px w-6 bg-line-strong" aria-hidden="true" />
            <span className="index">{project.industry}</span>
            <span className="index">{project.year}</span>
          </div>

          <SplitText
            as="h1"
            text={project.title}
            className="display-lg mt-6 max-w-5xl text-paper"
          />

          <p
            className="lead mt-8 max-w-2xl"
            data-reveal="up"
            style={{ ["--reveal-delay" as string]: "220ms" }}
          >
            {project.summary}
          </p>
        </div>
      </section>

      {/* Cover */}
      <div className="shell">
        <div
          className="ticks relative h-[42vh] min-h-[18rem] overflow-hidden rounded-[3px] border border-line md:h-[62vh]"
          data-reveal="scale"
        >
          {project.video ? (
            <ReelCover project={project} />
          ) : (
            <ProjectVisual slug={project.slug} cover={project.cover} alt={project.title} />
          )}
        </div>
      </div>

      {/* Metrics */}
      {project.metrics.length > 0 && (
        <section className="shell mt-20">
          <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
            {project.metrics.map((m, i) => (
              <div
                key={i}
                className="bg-ink-0 p-8"
                data-reveal="up"
                style={{ ["--reveal-delay" as string]: `${i * 100}ms` }}
              >
                <div className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-none tracking-[-0.03em] text-[var(--accent)]">
                  {m.value}
                </div>
                <div className="mt-3 text-sm text-paper-45">{m.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Chapters */}
      <section className="section">
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-16">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              {stage && (
                <>
                  <div className="kicker">Reached</div>
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="index text-[var(--accent)]">
                      {String(stage.number).padStart(2, "0")}
                    </span>
                    <span className="display-sm text-paper">{stage.title}</span>
                  </div>
                  <p className="mt-3 max-w-xs text-sm text-paper-45">{stage.goal}</p>
                </>
              )}

              {project.tags.length > 0 && (
                <div className="mt-10">
                  <div className="kicker">Involved</div>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((t) => (
                      <li
                        key={t}
                        className="border border-line px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-paper-60"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>

          <div className="flex flex-col gap-14 lg:col-span-8">
            {chapters.map((c, i) => (
              <article
                key={c.label}
                className="border-t border-line pt-8"
                data-reveal="up"
                style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
              >
                <div className="flex items-baseline gap-5">
                  <span className="index">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="display-sm text-paper">{c.label}</h2>
                </div>
                <div className="prose-body mt-6 max-w-none">
                  {c.body.split(/\n{2,}/).map((p, pi) => (
                    <p key={pi}>{p}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {project.gallery.length > 0 && (
        <section className="shell pb-24">
          <div className="grid gap-6 md:grid-cols-2">
            {project.gallery.map((src, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[3px] border border-line"
                data-reveal="scale"
                style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${project.title} — image ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Next project */}
      {next && next.slug !== project.slug && (
        <section className="border-t border-line">
          <Link href={`/work/${next.slug}`} className="group block py-20">
            <div className="shell flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="kicker">Next case study</div>
                <h2 className="display-md mt-4 max-w-3xl text-paper-60 transition-colors duration-500 group-hover:text-paper">
                  {next.title}
                </h2>
              </div>
              <span className="index flex items-center gap-3">
                {next.client}
                <span className="inline-block text-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
                  →
                </span>
              </span>
            </div>
          </Link>
        </section>
      )}
    </div>
  );
}
