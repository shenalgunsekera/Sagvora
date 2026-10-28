import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebase";
import { mailConfigured } from "@/lib/mail";

// Deployment check: can this instance reach Firestore? Reports status only —
// no content and no environment values.
export const dynamic = "force-dynamic";

export async function GET() {
  const report: Record<string, unknown> = {
    node: process.version,
    firebaseConfigured: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT),
    authSecretSet: Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16),
    mailConfigured: mailConfigured(),
  };
  try {
    const snap = await firestore().collection("projects").count().get();
    report.projects = snap.data().count;
    report.ok = true;
  } catch (err) {
    report.ok = false;
    report.error = (err as Error).message;
  }
  return NextResponse.json(report, { status: report.ok ? 200 : 500, headers: { "cache-control": "no-store" } });
}
