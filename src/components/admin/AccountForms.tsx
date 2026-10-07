"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  changePasswordAction,
  updateAccountAction,
  type ActionState,
} from "@/app/admin/actions";
import { Field } from "./ui";
import type { AdminUser } from "@/lib/types";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="admin-btn admin-btn-primary">
      {pending ? "Saving…" : label}
    </button>
  );
}

function Notice({ state }: { state: ActionState }) {
  if (state.error) {
    return <p className="border-l-2 border-[#ff8b7a] pl-3 text-sm text-[#ff8b7a]">{state.error}</p>;
  }
  if (state.ok) return <p className="text-sm text-signal">Saved.</p>;
  return null;
}

export default function AccountForms({ user }: { user: AdminUser }) {
  const [profileState, profileAction] = useActionState<ActionState, FormData>(
    updateAccountAction,
    {},
  );
  const [passwordState, passwordAction] = useActionState<ActionState, FormData>(
    changePasswordAction,
    {},
  );

  return (
    <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
      <form action={profileAction} className="flex flex-col gap-5 rounded-[4px] border border-line bg-ink-1 p-6">
        <h2 className="kicker">Profile</h2>

        <Field label="Name">
          <input name="name" defaultValue={user.name} className="admin-input" />
        </Field>

        <Field label="Email" hint="This is also your sign-in username.">
          <input
            name="email"
            type="email"
            required
            defaultValue={user.email}
            className="admin-input"
          />
        </Field>

        <Notice state={profileState} />
        <div>
          <Submit label="Update profile" />
        </div>
      </form>

      <form
        action={passwordAction}
        className="flex flex-col gap-5 rounded-[4px] border border-line bg-ink-1 p-6"
      >
        <h2 className="kicker">Password</h2>

        <Field label="New password" hint="At least 10 characters.">
          <input
            name="password"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            className="admin-input"
          />
        </Field>

        <Field label="Confirm new password">
          <input
            name="confirm"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            className="admin-input"
          />
        </Field>

        <Notice state={passwordState} />
        <div>
          <Submit label="Change password" />
        </div>
      </form>
    </div>
  );
}
