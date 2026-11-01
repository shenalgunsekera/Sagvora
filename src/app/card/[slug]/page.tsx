import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShareButton from "@/components/card/ShareButton";
import Wordmark from "@/components/site/Wordmark";
import { cardPath, companyName } from "@/lib/card";
import { getSettings, getTeam, getTeamMemberBySlug } from "@/lib/queries";
import { siteUrl } from "@/lib/site-url";

/**
 * The page a printed card's QR code opens: who this is, and one tap to call,
 * message, email or save them as a contact. Standalone (no site nav or
 * preloader) so it is instant on a phone that just scanned it.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getTeam(true)).map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const m = await getTeamMemberBySlug(slug);
  if (!m) return {};
  const s = await getSettings();
  const company = companyName(s.brandName, s.brandSuffix);
  return {
    title: { absolute: `${m.name} · ${company}` },
    description: [m.position, company].filter(Boolean).join(" at "),
    // Personal contact pages are for people who scan the card, not for search.
    robots: { index: false, follow: false },
    alternates: { canonical: cardPath(slug) },
    openGraph: {
      title: m.name,
      description: [m.position, company].filter(Boolean).join(" · "),
      images: m.photo ? [{ url: m.photo }] : undefined,
    },
  };
}

const ICON = {
  phone: "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.57 3.6a1 1 0 0 1-.25 1l-2.2 2.2Z",
  mail: "M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.2L4.2 7H19.8L12 12.2ZM4 8.4V17h16V8.4l-8 5.3-8-5.3Z",
  whatsapp: "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.25-.12-1.47-.73-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.8.98-.14.17-.3.19-.54.06a6.7 6.7 0 0 1-3.34-2.92c-.25-.43.25-.4.72-1.34.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48a.92.92 0 0 0-.67.31 2.8 2.8 0 0 0-.87 2.08 4.9 4.9 0 0 0 1.02 2.58 11.1 11.1 0 0 0 4.26 3.77c1.59.69 2.21.75 3 .63.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29Z",
  linkedin: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.83v1.54h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13V21h-4v-4.98c0-1.19-.02-2.72-1.66-2.72-1.66 0-1.92 1.3-1.92 2.63V21h-4V9.75Z",
  save: "M12 3a1 1 0 0 1 1 1v8.6l2.8-2.8a1 1 0 1 1 1.4 1.4l-4.5 4.5a1 1 0 0 1-1.4 0l-4.5-4.5a1 1 0 1 1 1.4-1.4l2.8 2.8V4a1 1 0 0 1 1-1ZM5 18a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z",
};

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

export default async function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = await getTeamMemberBySlug(slug);
  if (!m) notFound();
  const s = await getSettings();
  const company = companyName(s.brandName, s.brandSuffix);
  const initials = m.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const actions = [
    m.phone && { label: "Call", sub: m.phone, href: `tel:${m.phone.replace(/\s/g, "")}`, icon: ICON.phone },
    m.whatsapp && { label: "WhatsApp", sub: "Message", href: `https://wa.me/${m.whatsapp}`, icon: ICON.whatsapp, external: true },
    m.email && { label: "Email", sub: m.email, href: `mailto:${m.email}`, icon: ICON.mail },
    m.linkedin && { label: "LinkedIn", sub: "Profile", href: m.linkedin, icon: ICON.linkedin, external: true },
  ].filter(Boolean) as { label: string; sub: string; href: string; icon: string; external?: boolean }[];

  return (
    <main className="vcard-page">
      <div className="vcard-aurora" aria-hidden="true" />

      <article className="vcard">
        <header className="vcard-top">
          <a href={siteUrl()} aria-label={`${company} website`} className="text-[1.35rem] text-paper">
            <Wordmark />
          </a>
          <span className="index text-paper-45">Digital card</span>
        </header>

        <div className="vcard-photo" data-in="1">
          <div className="vcard-ring" aria-hidden="true" />
          {m.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.photo} alt={m.name} width={176} height={176} />
          ) : (
            <span className="vcard-initials">{initials}</span>
          )}
        </div>

        <h1 className="vcard-name" data-in="2">{m.name}</h1>
        {m.position && <p className="vcard-role" data-in="3">{m.position}</p>}
        <p className="vcard-company" data-in="3">{company}</p>

        {m.bio && <p className="vcard-bio" data-in="4">{m.bio}</p>}

        {actions.length > 0 && (
          <ul className="vcard-actions" data-in="4">
            {actions.map((a) => (
              <li key={a.label}>
                <a href={a.href} {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  <Icon d={a.icon} />
                  <span className="vcard-action-label">{a.label}</span>
                  <span className="vcard-action-sub">{a.sub}</span>
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="vcard-cta" data-in="5">
          <a href={`${cardPath(m.slug)}/vcard`} className="vcard-save">
            <Icon d={ICON.save} />
            Save contact
          </a>
          <ShareButton title={`${m.name} · ${company}`} />
        </div>

        <footer className="vcard-foot" data-in="5">
          <a href={siteUrl()} className="link-wipe">{new URL(siteUrl()).host.replace(/^www\./, "")}</a>
        </footer>
      </article>
    </main>
  );
}
