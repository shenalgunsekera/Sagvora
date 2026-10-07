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

        <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SplitText as="h2" text={settings.contactTitle} className="display-lg text-paper" />

            <p
              className="lead mt-8 max-w-md"
              data-reveal="up"
              style={{ ["--reveal-delay" as string]: "180ms" }}
            >
              {settings.contactLead}
            </p>

            <dl className="mt-12 flex flex-col">
              {details.map((d, i) => (
                <div
                  key={d.label}
                  className="group flex items-baseline justify-between gap-6 border-t border-line py-5 last:border-b"
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
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                {settings.socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-wipe kicker transition-colors duration-500 hover:text-paper"
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
