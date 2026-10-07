"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearLoginFailures,
  loginLockedOut,
  recordLoginFailure,
  setSessionCookie,
  signSession,
  verifyCredentials,
} from "@/lib/auth";
import { str } from "@/lib/form";

export type LoginState = { error?: string };

async function callerKey() {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0].trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = str(formData, "email");
  const password = str(formData, "password");
  const next = str(formData, "next") || "/admin";
  const key = await callerKey();

  const lockedFor = loginLockedOut(key);
  if (lockedFor > 0) {
    const minutes = Math.ceil(lockedFor / 60);
    return {
      error: `Too many failed attempts. Try again in ${minutes} minute${
        minutes === 1 ? "" : "s"
      }.`,
    };
  }

  if (!email || !password) return { error: "Email and password are both required." };

  const user = verifyCredentials(email, password);
  if (!user) {
    recordLoginFailure(key);
    // One message for both cases — never confirm which half was wrong.
    return { error: "Those credentials were not recognised." };
  }

  clearLoginFailures(key);
  await setSessionCookie(await signSession(user));

  // Only ever bounce to an internal admin path.
  redirect(next.startsWith("/admin") ? next : "/admin");
}
