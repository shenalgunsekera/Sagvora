import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Glyph from "@/components/fx/Glyph";
import SplitText from "@/components/fx/SplitText";
import { CircuitBackdrop } from "@/components/fx/backdrops";
import { BreadcrumbLd, ServiceLd } from "@/components/site/StructuredData";
import { getServiceBySlug, getServices, getSettings, getStages } from "@/lib/queries";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return { title: "Not found" };

  const images = [{ url: service.image ?? "/og.png", alt: service.title }];

  return {
    title: service.title,
    description: service.summary,
    alternates: { canonical: `/capabilities/${service.slug}` },
    openGraph: {
      title: service.title,
      description: service.summary,
      type: "article",
      url: `/capabilities/${service.slug}`,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: service.title,
      description: service.summary,
      images,
    },
  };
}

export default async function CapabilityPage({ params }: Params) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service || !service.published) notFound();

  const settings = getSettings();
  const stage = getStages().find((s) => s.number === service.stage);
  const others = getServices()
    .filter((s) => s.slug !== service.slug)
    .slice(0, 3);

  const paragraphs = service.body.split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <ServiceLd service={service} />
      <BreadcrumbLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Capabilities", path: "/#capabilities" },
          { name: service.title, path: `/capabilities/${service.slug}` },
        ]}
      />

      {/* Header */}
      <section className="relative overflow-clip pb-20 pt-40">
        <CircuitBackdrop className="opacity-60" seed={service.id * 13 + 3} traces={7} />

        <div className="shell relative">
          <Link href="/#capabilities" className="index link-wipe inline-block">
            ← All capabilities
          </Link>

          <div className="mt-12 flex items-start justify-between gap-8">
            <div className="max-w-4xl">
              {service.kicker && (
                <div className="kicker kicker-signal" data-reveal="fade">
                  {service.kicker}
                </div>
              )}
              <SplitText as="h1" text={service.title} className="display-lg mt-5 text-paper" />
              <p
                className="lead mt-8 max-w-2xl"
                data-reveal="up"
                style={{ ["--reveal-delay" as string]: "220ms" }}
              >
                {service.summary}
              </p>
            </div>

            <Glyph
              name={service.glyph}
              size={72}
              className="hidden shrink-0 text-paper-30 md:block"
            />
          </div>
        </div>
      </section>

      {/* Image */}
      {service.image && (
        <div className="shell mb-20 md:mb-28">
          <div
            className="ticks relative h-[38vh] min-h-[15rem] overflow-hidden rounded-[3px] border border-line md:h-[52vh]"
            data-reveal="scale"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={service.image}
              alt={service.title}
              width={1920}
              height={1080}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div
              className="absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  "linear-gradient(to top, rgba(8,8,10,0.75), transparent 45%), radial-gradient(60% 55% at 80% 20%, rgba(166,200,232,0.14), transparent 70%)",
              }}
            />
          </div>
        </div>
      )}

      {/* Body */}
      <section className="section pt-0">
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="prose-body max-w-none border-t border-line pt-10" data-reveal="up">
              {paragraphs.map((p, i) => (
                <p key={i} className={i === 0 ? "text-paper-80" : ""}>
                  {p}
                </p>
              ))}
            </div>

            {service.features.length > 0 && (
              <div className="mt-16">
                <div className="kicker" data-reveal="fade">
                  What is included
                </div>
                <ul className="mt-6">
                  {service.features.map((f, i) => (
                    <li
                      key={i}
                      className="group flex items-baseline gap-6 border-t border-line py-5 last:border-b"
                      data-reveal="up"
                      style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}
                    >
                      <span className="index transition-colors duration-500 group-hover:text-signal">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-paper-80 transition-colors duration-500 group-hover:text-paper">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              {service.outcomes.length > 0 && (
                <div className="panel ticks p-8" data-reveal="up">
                  <div className="kicker">At a glance</div>
                  <dl className="mt-6 flex flex-col">
                    {service.outcomes.map((o, i) => (
                      <div
                        key={i}
                        className="flex items-baseline justify-between gap-6 border-t border-line py-4 last:pb-0"
                      >
                        <dt className="index">{o.label}</dt>
                        <dd className="display-sm text-right text-paper">{o.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {stage && (
                <div className="mt-8 border-t border-line pt-8" data-reveal="up">
                  <div className="kicker">Sits at</div>
                  <Link href="/#method" className="group mt-4 block">
                    <div className="flex items-baseline gap-4">
                      <span className="index text-signal">
                        Stage {String(stage.number).padStart(2, "0")}
                      </span>
                      <span className="display-sm text-paper">{stage.title}</span>
                    </div>
                    <p className="mt-3 text-sm text-paper-45">{stage.subtitle}</p>
                    <span className="index mt-4 inline-flex items-center gap-2 transition-colors duration-500 group-hover:text-paper">
                      See the full method
                      <span className="transition-transform duration-500 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </Link>
                </div>
              )}

              <div className="mt-8" data-reveal="up">
                <span className="magnetic inline-block" data-magnetic="0.25">
                  <Link href="/#contact" className="btn btn-solid">
                    <span>Discuss this</span>
                    <span className="btn-arrow">→</span>
                  </Link>
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Next */}
      {others.length > 0 && (
        <section className="border-t border-line py-20">
          <div className="shell">
            <div className="kicker">Also available</div>
            <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-3">
              {others.map((o) => (
                <Link
                  key={o.id}
                  href={`/capabilities/${o.slug}`}
                  className="group bg-ink-0 p-7 transition-colors duration-500"
                >
                  <Glyph
                    name={o.glyph}
                    size={30}
                    className="text-paper-30 transition-colors duration-500 group-hover:text-signal"
                  />
                  <div className="display-sm mt-6 text-paper-80 transition-colors duration-500 group-hover:text-paper">
                    {o.title}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-paper-45">{o.summary}</p>
                </Link>
              ))}
            </div>
            <p className="index mt-8">
              {settings.brandName} {settings.brandSuffix}
            </p>
          </div>
        </section>
      )}
    </>
  );
}
