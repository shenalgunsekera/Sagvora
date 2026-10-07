import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getMedia,
  getMessages,
  getProjects,
  getServices,
  getSettings,
  getStages,
  getTestimonials,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

/**
 * Portable snapshot of everything editable, as JSON.
 *
 * Copying `sagvora.db` is the real backup, but it is opaque and tied to SQLite.
 * This is the readable companion: diffable in git, greppable, and a viable
 * migration path if the store ever moves to Postgres.
 *
 * Includes drafts — a backup that silently omits unpublished work is a trap.
 * Media is listed by reference; the files themselves live in public/.
 */
export async function GET() {
  // Sits under /admin so the middleware gates it, but re-check regardless:
  // an export is the single most sensitive read in the app.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    exportedBy: user.email,
    schemaVersion: 1,
    settings: getSettings(),
    stages: getStages(false),
    services: getServices(false),
    projects: getProjects(false),
    testimonials: getTestimonials(false),
    messages: getMessages(),
    media: getMedia(),
  };

  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="sagvora-content-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
