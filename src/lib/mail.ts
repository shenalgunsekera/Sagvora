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

export const mailConfigured = () => Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

let transport: nodemailer.Transporter | null = null;
function transporter() {
  transport ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "") },
  });
  return transport;
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export type Enquiry = { name: string; email: string; company: string; subject: string; message: string };

/** Emails one enquiry. Reply goes straight to the visitor. Returns false on failure. */
export async function sendEnquiry(e: Enquiry): Promise<boolean> {
  if (!mailConfigured()) return false;
  const to = process.env.CONTACT_TO || DEFAULT_TO;
  const rows: [string, string][] = [
    ["Name", e.name],
    ["Email", e.email],
    ["Company", e.company],
    ["Subject", e.subject],
  ];
  const clean = (s: string) => s.replace(/[\r\n]+/g, " ").slice(0, 160);
  try {
    await transporter().sendMail({
      from: { name: "Sagvora website", address: process.env.GMAIL_USER! },
      to,
      replyTo: { name: clean(e.name), address: e.email },
      subject: clean(`New enquiry: ${e.subject || e.name}${e.company ? ` (${e.company})` : ""}`),
      text: [...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`), "", e.message].join("\n"),
      html: `<table style="font:14px/1.5 system-ui,sans-serif;border-collapse:collapse">${rows
        .filter(([, v]) => v)
        .map(([k, v]) => `<tr><td style="padding:2px 16px 2px 0;color:#666">${k}</td><td>${escape(v)}</td></tr>`)
        .join("")}</table><p style="font:14px/1.6 system-ui,sans-serif;white-space:pre-wrap">${escape(e.message)}</p>`,
    });
    return true;
  } catch (err) {
    console.error("contact mail failed:", err instanceof Error ? err.message : err);
    return false;
  }
}
