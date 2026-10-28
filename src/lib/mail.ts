import "server-only";
import nodemailer from "nodemailer";

/**
 * Contact-form notifications, sent through a Gmail account over SMTP.
 *
 *   GMAIL_USER          the Gmail address that sends (e.g. you@gmail.com)
 *   GMAIL_APP_PASSWORD  a 16-character Google App Password for that account
 *   CONTACT_TO          where enquiries land (default: shgunasekera@sagvora.lk)
 *
 * Without GMAIL_USER / GMAIL_APP_PASSWORD nothing is sent; messages are still
 * saved and shown in Admin → Messages.
 */
const DEFAULT_TO = "shgunasekera@sagvora.lk";

export const mailConfigured = () => Boolean(clean(process.env.GMAIL_USER) && clean(process.env.GMAIL_APP_PASSWORD));

let transport: nodemailer.Transporter | null = null;
function transporter() {
  transport ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    // Never let a slow SMTP handshake hold the visitor's request open.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    auth: { user: clean(process.env.GMAIL_USER), pass: clean(process.env.GMAIL_APP_PASSWORD).replace(/\s+/g, "") },
  });
  return transport;
}

/** Env values pasted with quotes or stray whitespace still work. */
function clean(v: string | undefined) {
  return (v ?? "").trim().replace(/^["']|["']$/g, "").trim();
}

/** Plain-English reason for an SMTP failure, for the Admin test button. */
function explain(err: unknown) {
  const e = err as { responseCode?: number; response?: string; code?: string; message?: string };
  const raw = (e.response || e.message || String(err)).slice(0, 300);
  if (e.responseCode === 535 || /BadCredentials|not accepted/i.test(raw))
    return `Google rejected the login. Check that GMAIL_USER is the Gmail address that created the App Password and that GMAIL_APP_PASSWORD is that 16-letter App Password (not your normal password). Google said: ${raw}`;
  if (e.responseCode === 534 || /Application-specific password required/i.test(raw))
    return `Google wants an App Password, not your normal password. Create one at myaccount.google.com/apppasswords. Google said: ${raw}`;
  return raw;
}

/** Logs in and sends a test message to CONTACT_TO. Admin-only diagnostics. */
export async function sendTestMail(): Promise<{ ok: true; to: string } | { ok: false; error: string }> {
  if (!mailConfigured()) return { ok: false, error: "GMAIL_USER or GMAIL_APP_PASSWORD is not set on this deployment." };
  const to = process.env.CONTACT_TO || DEFAULT_TO;
  try {
    await transporter().verify();
    await transporter().sendMail({
      from: { name: "Sagvora website", address: clean(process.env.GMAIL_USER) },
      to,
      subject: "Test: Sagvora contact form email",
      text: "This is a test from Admin. If you can read this, contact form enquiries will arrive here.",
    });
    return { ok: true, to };
  } catch (err) {
    transport = null; // retry with fresh credentials next time
    return { ok: false, error: explain(err) };
  }
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export type Enquiry = { name: string; email: string; company: string; subject: string; message: string };

/** Emails one enquiry. Reply goes straight to the visitor. */
export async function sendEnquiry(e: Enquiry): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!mailConfigured()) return { ok: false, error: "Email is not set up on this deployment." };
  const to = process.env.CONTACT_TO || DEFAULT_TO;
  const rows: [string, string][] = [
    ["Name", e.name],
    ["Email", e.email],
    ["Company", e.company],
    ["Subject", e.subject],
  ];
  const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").slice(0, 160);
  try {
    await transporter().sendMail({
      from: { name: "Sagvora website", address: clean(process.env.GMAIL_USER) },
      to,
      replyTo: { name: oneLine(e.name), address: e.email },
      subject: oneLine(`New enquiry: ${e.subject || e.name}${e.company ? ` (${e.company})` : ""}`),
      text: [...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`), "", e.message].join("\n"),
      html: `<table style="font:14px/1.5 system-ui,sans-serif;border-collapse:collapse">${rows
        .filter(([, v]) => v)
        .map(([k, v]) => `<tr><td style="padding:2px 16px 2px 0;color:#666">${k}</td><td>${escape(v)}</td></tr>`)
        .join("")}</table><p style="font:14px/1.6 system-ui,sans-serif;white-space:pre-wrap">${escape(e.message)}</p>`,
    });
    return { ok: true };
  } catch (err) {
    const error = explain(err);
    console.error("contact mail failed:", error);
    transport = null;
    return { ok: false, error };
  }
}
