import { getProjects, getServices, getSettings } from "@/lib/queries";
import { siteUrl } from "@/lib/site-url";

/**
 * /llms.txt — a plain-text brief of the company for AI assistants and answer
 * engines (llmstxt.org). Built from the same content as the site, so it can
 * only say what the site says.
 */
export async function GET() {
  const [s, services, projects] = await Promise.all([getSettings(), getServices(), getProjects()]);
  const url = siteUrl();
  const name = `${s.brandName.charAt(0)}${s.brandName.slice(1).toLowerCase()} ${s.brandSuffix.charAt(0)}${s.brandSuffix.slice(1).toLowerCase()}`;

  const lines = [
    `# ${name}`,
    "",
    `> ${s.seoDescription}`,
    "",
    `${name} (also written "Sagvora") is based in ${s.address}.`,
    ...(s.founderName ? [`Founder: ${s.founderName}.`] : []),
    `Contact: ${[s.email, s.phone].filter(Boolean).join(" · ")}.`,
    "",
    "## Capabilities",
    ...services.map((x) => `- [${x.title}](${url}/capabilities/${x.slug}): ${x.summary}`),
    "",
    "## Work",
    ...projects.map((p) => `- [${p.client}: ${p.title}](${url}/work/${p.slug}): ${p.summary}`),
    "",
    "## Pages",
    `- [Home](${url}/)`,
    `- [Contact](${url}/#contact)`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
