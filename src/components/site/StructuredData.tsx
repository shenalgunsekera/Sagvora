import type { Project, Service, SiteSettings } from "@/lib/types";

const base = () =>
  (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/**
 * JSON-LD. Emitted as a single graph per page so search engines read Sagvora as
 * one organisation with services and cases attached, rather than as unrelated
 * fragments.
 *
 * Nothing here is invented: every value comes from the content store, so the
 * markup can never claim something the page does not say.
 */
function Ld({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // The payload is our own serialised object, not user-controlled markup.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function OrganisationLd({
  settings,
  services,
}: {
  settings: SiteSettings;
  services: Service[];
}) {
  const url = base();
  const name = `${settings.brandName} ${settings.brandSuffix}`;

  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${url}/#organization`,
            name,
            url,
            description: settings.seoDescription,
            slogan: settings.tagline,
            logo: `${url}/logo-light.png`,
            image: `${url}/og.png`,
            ...(settings.email ? { email: settings.email } : {}),
            ...(settings.phone ? { telephone: settings.phone } : {}),
            ...(settings.address
              ? { address: { "@type": "PostalAddress", addressLocality: settings.address } }
              : {}),
            ...(settings.socials?.length
              ? { sameAs: settings.socials.map((s) => s.url).filter(Boolean) }
              : {}),
          },
          {
            "@type": "WebSite",
            "@id": `${url}/#website`,
            url,
            name,
            description: settings.seoDescription,
            publisher: { "@id": `${url}/#organization` },
          },
          ...(services.length
            ? [
                {
                  "@type": "OfferCatalog",
                  "@id": `${url}/#capabilities`,
                  name: settings.servicesTitle,
                  itemListElement: services.map((s, i) => ({
                    "@type": "Offer",
                    position: i + 1,
                    itemOffered: {
                      "@type": "Service",
                      "@id": `${url}/capabilities/${s.slug}#service`,
                      name: s.title,
                      description: s.summary,
                      url: `${url}/capabilities/${s.slug}`,
                      provider: { "@id": `${url}/#organization` },
                    },
                  })),
                },
              ]
            : []),
        ],
      }}
    />
  );
}

export function ServiceLd({ service }: { service: Service }) {
  const url = base();

  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${url}/capabilities/${service.slug}#service`,
        name: service.title,
        description: service.summary,
        url: `${url}/capabilities/${service.slug}`,
        ...(service.image ? { image: `${url}${service.image}` } : {}),
        provider: { "@type": "Organization", name: "Sagvora Innovations", url },
        ...(service.features.length
          ? {
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "What is included",
                itemListElement: service.features.map((f, i) => ({
                  "@type": "Offer",
                  position: i + 1,
                  itemOffered: { "@type": "Service", name: f },
                })),
              },
            }
          : {}),
      }}
    />
  );
}

export function CaseStudyLd({ project }: { project: Project }) {
  const url = base();

  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${url}/work/${project.slug}#article`,
        headline: project.title,
        description: project.summary,
        url: `${url}/work/${project.slug}`,
        ...(project.cover ? { image: `${url}${project.cover}` } : {}),
        ...(project.year ? { datePublished: project.year } : {}),
        dateModified: project.updatedAt,
        author: { "@type": "Organization", name: "Sagvora Innovations", url },
        publisher: { "@type": "Organization", name: "Sagvora Innovations", url },
        ...(project.industry ? { about: project.industry } : {}),
        ...(project.tags.length ? { keywords: project.tags.join(", ") } : {}),
      }}
    />
  );
}

export function BreadcrumbLd({
  trail,
}: {
  trail: { name: string; path: string }[];
}) {
  const url = base();

  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.name,
          item: `${url}${t.path}`,
        })),
      }}
    />
  );
}
