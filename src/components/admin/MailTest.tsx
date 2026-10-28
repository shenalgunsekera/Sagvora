"use client";

import { useActionState } from "react";
import { sendTestEmailAction, type ActionState } from "@/app/admin/actions";

/** "Send test email": shows whether the contact-form email works, and why not. */
export default function MailTest() {
  const [state, action, pending] = useActionState<ActionState & { message?: string }>(sendTestEmailAction, {});
  return (
    <form action={action} className="mb-6 flex flex-col gap-3 rounded-[4px] border border-line bg-ink-1 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-paper-60">Contact-form messages are also emailed to you through Gmail.</p>
        <button type="submit" disabled={pending} className="admin-btn">
          {pending ? "Sending…" : "Send test email"}
        </button>
      </div>
      {state.error && <p className="border-l-2 border-[#ff8b7a] pl-3 text-sm text-[#ff8b7a]">{state.error}</p>}
      {state.ok && <p className="text-sm text-signal">{state.message}</p>}
    </form>
  );
}
