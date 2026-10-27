import type { SiteSettings } from "@/lib/types";

/**
 * "Trusted by": an endless strip of client logos, drawn in one paper colour
 * straight on the page (see scripts/prepare-client-logos.mjs). The list renders twice and
 * the track slides by exactly half its width, so the loop has no seam. The
 * first copy is the real, readable list; the second is decorative and hidden
 * from assistive tech. Pauses on hover/focus; stands still for reduced motion.
 */
export default function Clients({ settings }: { settings: SiteSettings }) {
  const clients = settings.clients.filter((c) => c.name && c.logo);
  if (clients.length === 0) return null;

  // Speed scales with the list so it reads at the same pace however many logos.
  const duration = `${Math.max(30, clients.length * 4.5)}s`;

  const tile = (c: SiteSettings["clients"][number], decorative: boolean) => {
    const body = (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.logo} alt={decorative ? "" : c.name} title={c.name} loading="lazy" decoding="async" />
      </>
    );
    return c.url ? (
      <a
        href={c.url}
        target="_blank"
        rel="noopener noreferrer"
        className="client"
        tabIndex={decorative ? -1 : undefined}
      >
        {body}
      </a>
    ) : (
      <div className="client">{body}</div>
    );
  };

  return (
    <section id="clients" aria-labelledby="clients-title" className="relative border-y border-line py-14 md:py-24">
      <div className="shell flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="kicker" data-reveal="fade">
            {settings.clientsKicker}
          </span>
          <h2 id="clients-title" className="display-sm mt-4 max-w-xl text-paper" data-reveal="up">
            {settings.clientsTitle}
          </h2>
        </div>
        <p className="index hidden text-paper-45 md:block" data-reveal="fade">
          {clients.length} companies and counting
        </p>
      </div>

      <div className="clients-viewport fx-loop mt-10 overflow-hidden md:mt-14">
        <div className="clients-track" style={{ ["--clients-duration" as string]: duration }}>
          <ul className="clients-list">
            {clients.map((c) => (
              <li key={c.name}>{tile(c, false)}</li>
            ))}
          </ul>
          <ul className="clients-list" aria-hidden="true">
            {clients.map((c) => (
              <li key={c.name}>{tile(c, true)}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
