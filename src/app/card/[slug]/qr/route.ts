import { notFound } from "next/navigation";
import { cardUrl, qrPng, qrSvg } from "@/lib/card";
import { getTeamMemberBySlug } from "@/lib/queries";

/** The QR code for a card, as SVG (print) or PNG (?format=png, for sharing). */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await getTeamMemberBySlug(slug))) notFound();
  const url = cardUrl(slug);
  const download = new URL(req.url).searchParams.has("download");
  const png = new URL(req.url).searchParams.get("format") === "png";
  const headers: Record<string, string> = { "cache-control": "public, max-age=3600" };
  if (download) headers["content-disposition"] = `attachment; filename="${slug}-qr.${png ? "png" : "svg"}"`;
  if (png) return new Response(new Uint8Array(await qrPng(url)), { headers: { ...headers, "content-type": "image/png" } });
  return new Response(await qrSvg(url, "#08080a", "#ffffff"), { headers: { ...headers, "content-type": "image/svg+xml" } });
}
