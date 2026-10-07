"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

const FIELDS = [
  { name: "name", label: "Your name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "company", label: "Company", type: "text", required: false },
  { name: "subject", label: "The process that costs you most", type: "text", required: false },
] as const;

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");

      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="panel ticks flex min-h-[24rem] flex-col items-start justify-center gap-5 p-10"
      >
        <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true" className="text-signal">
          <circle cx="23" cy="23" r="22" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
          <path
            d="M14 23.5 20 29.5 32 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1}
            style={{ animation: "draw-check 900ms cubic-bezier(0.16,1,0.3,1) 120ms forwards" }}
          />
        </svg>
        <h3 className="display-sm text-paper">Received.</h3>
        <p className="max-w-sm text-paper-45">
          We read every message ourselves. Expect a reply within one business day — with a first
          question, not a brochure.
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="btn mt-2">
          <span>Send another</span>
        </button>

        <style>{`@keyframes draw-check { to { stroke-dashoffset: 0 } }`}</style>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="panel p-8 md:p-10" noValidate>
      {/* Honeypot — hidden from people, irresistible to bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-px w-px opacity-0"
        style={{ left: "-9999px" }}
      />

      <div className="grid gap-7 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.name} className={`field ${f.name === "subject" ? "sm:col-span-2" : ""}`}>
            <span className="field-label">
              {f.label}
              {f.required && <span className="text-signal"> *</span>}
            </span>
            <input
              type={f.type}
              name={f.name}
              required={f.required}
              autoComplete={
                f.name === "email" ? "email" : f.name === "name" ? "name" : "organization"
              }
              placeholder="—"
            />
            <span className="field-rule" />
          </label>
        ))}

        <label className="field sm:col-span-2">
          <span className="field-label">
            What is happening today<span className="text-signal"> *</span>
          </span>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Describe the workflow, who touches it, and roughly what it costs you."
          />
          <span className="field-rule" />
        </label>
      </div>

      {/* Always present so a screen reader is already watching when the message
          appears — a region added at the same moment as its content is often
          missed entirely. */}
      <p
        role="status"
        aria-live="polite"
        className={
          status === "error"
            ? "mt-6 border-l-2 border-[#ff8b7a] pl-4 text-sm text-[#ff8b7a]"
            : "sr-only"
        }
      >
        {status === "error" ? error : status === "sending" ? "Sending your message…" : ""}
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-between gap-5">
        <p className="index max-w-xs leading-relaxed">
          No sales sequence. No newsletter. One reply from a person.
        </p>
        <button type="submit" disabled={status === "sending"} className="btn btn-solid">
          <span>{status === "sending" ? "Sending" : "Send message"}</span>
          <span className="btn-arrow">→</span>
        </button>
      </div>
    </form>
  );
}
