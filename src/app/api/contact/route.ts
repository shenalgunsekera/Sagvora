import { NextResponse, after } from "next/server";
import { z } from "zod";
import { createMessage, setMessageMail } from "@/lib/queries";
import { sendEnquiry } from "@/lib/mail";

const schema = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(120),
  email: z.string().trim().email("That email address does not look right.").max(200),
  company: z.string().trim().max(160).optional().default(""),
  subject: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().min(10, "A little more detail, please.").max(6000),
  // Honeypot: real people never fill this in. Kept permissive on purpose so a
  // filled-in value reaches the handler and can be swallowed silently rather
  // than bounced with a validation error that names the trap.
  sv_hp: z.string().optional(),
  // The trap's old name. Browsers autofilled it, so it is accepted and ignored.
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

  // A filled trap gets a normal-looking success, so bots learn nothing.
  // Malformed spam is swallowed outright; anything that passes validation is
  // still kept in Admin (flagged, not emailed) in case a person tripped it.
  const trapped = typeof (body as { sv_hp?: unknown })?.sv_hp === "string" && (body as { sv_hp: string }).sv_hp.length > 0;

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    if (trapped) return NextResponse.json({ ok: true });
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form." },
      { status: 422 },
    );
  }

  const { sv_hp: _trap, website: _old, ...data } = parsed.data;
  const id = await createMessage(data);
  if (trapped) {
    await setMessageMail(id, "failed: held as likely spam (hidden field was filled), not emailed").catch(() => {});
    return NextResponse.json({ ok: true });
  }
  // Saved first, so a mail hiccup never loses an enquiry; it stays in Admin,
  // marked with what happened to the email.
  // The visitor gets their answer straight away; Gmail is talked to after the
  // response is sent (it can take several seconds on a cold start).
  after(async () => {
    const mail = await sendEnquiry(data);
    await setMessageMail(id, mail.ok ? "sent" : `failed: ${mail.error}`).catch(() => {});
  });
  return NextResponse.json({ ok: true });
}
