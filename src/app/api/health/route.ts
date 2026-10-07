import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Deployment check: can this instance open the content store? Reports file
// presence and the failure message only — no content, no environment values.
export const dynamic = "force-dynamic";

export async function GET() {
  const cwd = process.cwd();
  const report: Record<string, unknown> = {
    node: process.version,
    serverless: Boolean(process.env.VERCEL),
    authSecretSet: Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16),
    files: {
      schema: fs.existsSync(path.join(cwd, "src", "lib", "schema.sql")),
      snapshot: fs.existsSync(path.join(cwd, "data", "content.db")),
      tmpStore: fs.existsSync("/tmp/sagvora/sagvora.db"),
    },
  };
  try {
    const db = getDb();
    report.projects = (db.prepare("SELECT COUNT(*) AS c FROM projects").get() as { c: number }).c;
    report.ok = true;
  } catch (err) {
    const e = err as Error;
    report.ok = false;
    report.error = `${e.name}: ${e.message}`;
    report.stack = e.stack?.split("\n").slice(0, 6);
  }
  return NextResponse.json(report, { status: report.ok ? 200 : 500, headers: { "cache-control": "no-store" } });
}
