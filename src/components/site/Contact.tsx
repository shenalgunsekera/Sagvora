import { TopoRings } from "@/components/fx/backdrops";
import SplitText from "@/components/fx/SplitText";
import ContactForm from "./ContactForm";
import type { SiteSettings } from "@/lib/types";

export default function Contact({
  settings,
  index = "06",
}: {
  settings: SiteSettings;
  /** Section number — shifts up when the Voices section has nothing to show. */
  index?: string;
}) {
  const details = [
    { label: "Contact", value: settings.contactName, href: null },
    { label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    { label: "Phone", value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
    { label: "Studio", value: settings.address, href: null },
  ].filter((d) => d.value);

  // On phones the fastest route is a tap: call, WhatsApp or email directly.
  const whatsapp = settings.socials?.find((s) => /whatsapp/i.test(s.label))?.url;
  const quick = [
    settings.phone && { label: "Call", href: `tel:${settings.phone.replace(/s/g, "")}` },
    whatsapp && { label: "WhatsApp", href: whatsapp },
    settings.email && { label: "Email", href: `mailto:${settings.email}` },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <section id="contact" className="section relative overflow-clip">
      <TopoRings className="opacity-70" />

      <div className="shell relative">
        <div className="flex items-baseline gap-5">
          <span className="index" data-reveal="fade">
            {index}
          </span>
          <span className="kicker" data-reveal="fade">
            {settings.contactKicker}
          </span>
        </div>
        <div className="mt-5 h-px w-full bg-line" data-reveal="rule" />

        <div className="mt-8 grid gap-10 md:mt-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SplitText as="h2" text={settings.contactTitle} className="display-lg text-paper" />

            <p
              className="lead mt-6 max-w-md md:mt-8"
              data-reveal="up"
              style={{ ["--reveal-delay" as string]: "180ms" }}
            >
              {settings.contactLead}
            </p>

            {quick.length > 0 && (
              <div className="mt-8 grid grid-cols-3 gap-2 md:hidden">
                {quick.map((q) => (
                  <a
                    key={q.label}
                    href={q.href}
                    target={q.href.startsWith("http") ? "_blank" : undefined}
                    rel={q.href.startsWith("http") ? "noreferrer noopener" : undefined}
                    className="btn justify-center px-2 py-4"
                  >
                    <span>{q.label}</span>
                  </a>
                ))}
              </div>
            )}

            <dl className="mt-8 flex flex-col md:mt-12">
              {details.map((d, i) => (
                <div
                  key={d.label}
                  className="group flex items-baseline justify-between gap-6 border-t border-line py-4 last:border-b md:py-5"
                  data-reveal="up"
                  style={{ ["--reveal-delay" as string]: `${240 + i * 80}ms` }}
                >
                  <dt className="index">{d.label}</dt>
                  <dd className="text-right">
                    {d.href ? (
                      <a href={d.href} className="link-wipe text-paper-80 hover:text-paper">
                        {d.value}
                      </a>
                    ) : (
                      <span className="text-paper-80">{d.value}</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            {settings.socials?.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 md:mt-10">
                {settings.socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    // The WhatsApp button above already covers it on phones.
                    className={`link-wipe kicker transition-colors duration-500 hover:text-paper ${
                      /whatsapp/i.test(s.label) ? "max-md:!hidden" : ""
                    }`}
                  >
                    {s.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>

          <div
            className="lg:col-span-7"
            data-reveal="up"
            style={{ ["--reveal-delay" as string]: "160ms" }}
          >
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
