import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/components/admin/PrintButton";
import { PageHeader } from "@/components/admin/ui";
import Wordmark from "@/components/site/Wordmark";
import { cardPath, cardUrl, companyName, qrSvg } from "@/lib/card";
import { getSettings, getTeamMember } from "@/lib/queries";
import { requireAdmin } from "@/lib/guard";

export const metadata = { title: "Print card" };

/**
 * Print-ready business card at true size (85 × 55 mm): a dark front with the
 * person, a light back with the QR code. Print at 100% scale, then cut.
 */
export default async function PrintCard({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const m = await getTeamMember(Number(id));
  if (!m) notFound();
  const s = await getSettings();
  const url = cardUrl(m.slug);
  const qr = await qrSvg(url, "#08080a", "#f4f4f0");
  const initials = m.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <PageHeader
        title={`Print card · ${m.name}`}
        subtitle="True size, 85 × 55 mm. Print at 100% scale (not “fit to page”) with background graphics on, then cut along the edges."
      />

      <div className="mb-8 flex flex-wrap gap-2">
        <PrintButton />
        <a href={`${cardPath(m.slug)}/qr?download`} className="admin-btn">QR .svg (for a printer)</a>
        <a href={`${cardPath(m.slug)}/qr?format=png&download`} className="admin-btn">QR .png</a>
        <a href={cardPath(m.slug)} target="_blank" rel="noopener noreferrer" className="admin-btn">Open card ↗</a>
        <Link href={`/admin/team/${m.id}`} className="admin-btn">Edit details</Link>
      </div>

      <div className="print-sheet">
        {/* Front */}
        <section className="bcard bcard-front" aria-label="Card front">
          <div className="bcard-glow" aria-hidden="true" />
          <div className="bcard-front-top">
            <span className="bcard-wordmark"><Wordmark /></span>
            {m.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.photo} alt="" className="bcard-photo" />
            ) : (
              <span className="bcard-photo bcard-initials">{initials}</span>
            )}
          </div>
          <div className="bcard-front-body">
            <p className="bcard-name">{m.name}</p>
            {m.position && <p className="bcard-role">{m.position}</p>}
            <div className="bcard-contacts">
              {m.email && <span>{m.email}</span>}
              {m.phone && <span>{m.phone}</span>}
              <span>{new URL(url).host.replace(/^www\./, "")}</span>
            </div>
          </div>
        </section>

        {/* Back */}
        <section className="bcard bcard-back" aria-label="Card back">
          <div className="bcard-qr" dangerouslySetInnerHTML={{ __html: qr }} />
          <div className="bcard-back-text">
            <p className="bcard-scan">Scan to connect</p>
            <p className="bcard-scan-sub">Save my contact, call or message in one tap.</p>
            <p className="bcard-url">{url.replace(/^https?:\/\/(www\.)?/, "")}</p>
            <p className="bcard-brand">{companyName(s.brandName, s.brandSuffix)}</p>
          </div>
        </section>
      </div>
    </>
  );
}
