import { notFound } from "next/navigation";
import { companyName, vcard } from "@/lib/card";
import { getSettings, getTeamMemberBySlug } from "@/lib/queries";

/** "Save contact": a vCard the phone's contacts app opens directly. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);
  if (!member) notFound();
  const s = await getSettings();
  const body = await vcard(member, companyName(s.brandName, s.brandSuffix));
  return new Response(body, {
    headers: {
      "content-type": "text/vcard; charset=utf-8",
      "content-disposition": `attachment; filename="${slug}.vcf"`,
      "cache-control": "public, max-age=300",
    },
  });
}
