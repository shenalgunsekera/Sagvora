import { siteUrl } from "@/lib/site-url";
import type { Project, Service, SiteSettings } from "@/lib/types";

const base = siteUrl;

/** "SAGVORA" -> "Sagvora": brand fields are stored in display caps. */
const toTitle = (v: string) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();

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
  const name = `${toTitle(settings.brandName)} ${toTitle(settings.brandSuffix)}`.trim();
  const short = toTitle(settings.brandName);
  // "Colombo, Sri Lanka" -> locality + ISO country, so the entity is placed.
  const [locality, country] = settings.address.split(",").map((p) => p.trim());
  const countryCode = /sri\s*lanka/i.test(settings.address) ? "LK" : country;
  // Profiles only: a WhatsApp chat link is a contact method, not an identity.
  const profiles = (settings.socials ?? [])
    .map((s) => s.url)
    .filter((u) => u && !/wa\.me|whatsapp/i.test(u));

  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${url}/#organization`,
            name,
            // The bare brand is what people type; tie it to this entity.
            alternateName: [short, settings.brandName, `${settings.brandName} ${settings.brandSuffix}`],
            url,
            description: settings.seoDescription,
            slogan: settings.tagline,
            logo: {
              "@type": "ImageObject",
              "@id": `${url}/#logo`,
              url: `${url}/logo-square.png`,
              width: 512,
              height: 512,
              caption: name,
            },
            image: `${url}/og.png`,
            ...(settings.founderName
              ? {
                  founder: {
                    "@type": "Person",
                    "@id": `${url}/#founder`,
                    name: settings.founderName,
                    worksFor: { "@id": `${url}/#organization` },
                  },
                }
              : {}),
            ...(settings.email ? { email: settings.email } : {}),
            ...(settings.phone ? { telephone: settings.phone } : {}),
            ...(settings.address
              ? {
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: locality,
                    ...(countryCode ? { addressCountry: countryCode } : {}),
                  },
                  location: { "@type": "Place", name: settings.address },
                }
              : {}),
            ...(settings.email || settings.phone
              ? {
                  contactPoint: {
                    "@type": "ContactPoint",
                    contactType: "sales",
                    ...(settings.email ? { email: settings.email } : {}),
                    ...(settings.phone ? { telephone: settings.phone } : {}),
                    availableLanguage: ["en"],
                    areaServed: "Worldwide",
                  },
                }
              : {}),
            areaServed: "Worldwide",
            ...(services.length ? { knowsAbout: services.map((s) => s.title) } : {}),
            ...(profiles.length ? { sameAs: profiles } : {}),
          },
          {
            "@type": "WebSite",
            "@id": `${url}/#website`,
            url,
            // Google picks the site name shown in results from these.
            name,
            alternateName: [short, settings.brandName],
            inLanguage: "en",
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
        provider: { "@type": "Organization", "@id": `${url}/#organization`, name: "Sagvora Innovations", url },
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
        author: { "@type": "Organization", "@id": `${url}/#organization`, name: "Sagvora Innovations", url },
        publisher: { "@type": "Organization", "@id": `${url}/#organization`, name: "Sagvora Innovations", url },
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
