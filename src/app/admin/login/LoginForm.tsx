"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="admin-btn admin-btn-primary w-full justify-center">
      {pending ? "Checking…" : "Sign in"}
    </button>
  );
}

export default function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="admin-card flex flex-col gap-5 p-7">
      <input type="hidden" name="next" value={next ?? "/admin"} />

      <div>
        <label className="admin-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
          className="admin-input"
          placeholder="admin@sagvora.com"
        />
      </div>

      <div>
        <label className="admin-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="admin-input"
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p className="border-l-2 border-[#ff8b7a] pl-3 text-sm text-[#ff8b7a]">{state.error}</p>
      )}

      <Submit />
    </form>
  );
}
