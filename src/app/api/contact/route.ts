import { NextResponse } from "next/server";
import { z } from "zod";
import { createMessage } from "@/lib/queries";

const schema = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(120),
  email: z.string().trim().email("That email address does not look right.").max(200),
  company: z.string().trim().max(160).optional().default(""),
  subject: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().min(10, "A little more detail, please.").max(6000),
  // Honeypot: real people never fill this in. Kept permissive on purpose so a
  // filled-in value reaches the handler and can be swallowed silently rather
  // than bounced with a validation error that names the trap.
  website: z.string().optional(),
});

/** Naive in-memory throttle. Enough to stop casual form spam on a single node. */
const hits = new Map<string, { count: number; reset: number }>();
const LIMIT = 5;
const WINDOW = 10 * 60 * 1000;

function throttled(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW });
    return false;
  }
  entry.count += 1;
  return entry.count > LIMIT;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (throttled(ip)) {
    return NextResponse.json(
      { error: "Too many messages from this address. Try again shortly." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  // Honeypot first: a filled trap gets a normal-looking success and nothing
  // else, so bots learn neither that they were caught nor which field caught
  // them. Checked before validation so malformed spam is swallowed too.
  if (typeof (body as { website?: unknown })?.website === "string" && (body as { website: string }).website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form." },
      { status: 422 },
    );
  }

  const { website: _honeypot, ...data } = parsed.data;
  createMessage(data);
  return NextResponse.json({ ok: true });
}
