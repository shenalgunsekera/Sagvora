import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { firestore } from "./firebase";
import type { AdminUser } from "./types";

export const SESSION_COOKIE = "sagvora_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error("AUTH_SECRET is missing or too short — set it in .env.local");
  }
  return new TextEncoder().encode(s);
}

export async function signSession(user: AdminUser) {
  return new SignJWT({
    email: user.email,
    name: user.name,
    v: await currentTokenVersion(user.id),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

type UserDoc = {
  id: number;
  email: string;
  emailLower: string;
  name: string;
  passwordHash: string;
  tokenVersion: number;
  createdAt: string;
};

const users = () => firestore().collection("users");

async function getUser(id: number): Promise<UserDoc | null> {
  return ((await users().doc(String(id)).get()).data() as UserDoc) ?? null;
}

async function currentTokenVersion(userId: number): Promise<number> {
  return (await getUser(userId))?.tokenVersion ?? 0;
}

export async function verifySession(token: string): Promise<AdminUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    const id = Number(payload.sub);

    // A valid signature is not enough: a token minted before the last password
    // change must stop working, otherwise a stolen session outlives the reset.
    if (Number(payload.v ?? 0) !== (await currentTokenVersion(id))) return null;

    return {
      id,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? "Administrator"),
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Current admin from the request cookie, or null. */
export async function getCurrentUser(): Promise<AdminUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Throws if not authenticated — use at the top of every admin API route. */
export async function requireUser(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError();
  return user;
}

export class AuthError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "AuthError";
  }
}

/* ------------------------------------------------------------------ credentials */

/**
 * The first admin comes from ADMIN_EMAIL / ADMIN_PASSWORD in the environment,
 * created the first time anyone tries to sign in while no account exists. After
 * that the account lives in Firestore and is managed from /admin/account.
 */
async function ensureFirstAdmin() {
  if (!(await users().limit(1).get()).empty) return;
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) return;
  const user: UserDoc = {
    id: 1,
    email,
    emailLower: email.toLowerCase(),
    name: process.env.ADMIN_NAME?.trim() || "Administrator",
    passwordHash: bcrypt.hashSync(password, 12),
    tokenVersion: 0,
    createdAt: new Date().toISOString(),
  };
  // create() fails if a parallel request got there first — that is fine.
  await users().doc("1").create(user).catch(() => {});
}

export async function verifyCredentials(email: string, password: string): Promise<AdminUser | null> {
  await ensureFirstAdmin();
  const snap = await users().where("emailLower", "==", email.trim().toLowerCase()).limit(1).get();
  const row = snap.docs[0]?.data() as UserDoc | undefined;
  if (!row) return null;
  if (!bcrypt.compareSync(password, row.passwordHash)) return null;
  return { id: row.id, email: row.email, name: row.name };
}

export async function changePassword(userId: number, newPassword: string) {
  const user = await getUser(userId);
  if (!user) return;
  await users()
    .doc(String(userId))
    .update({ passwordHash: bcrypt.hashSync(newPassword, 12), tokenVersion: user.tokenVersion + 1 });
}

/* ------------------------------------------------------------------ throttle */

/**
 * Failed-attempt throttle for the sign-in form.
 *
 * Keyed on the caller's address so guessing at one account cannot lock out
 * another, and in memory because this deployment is a single Node process — the
 * moment it runs behind more than one, this wants moving into the database.
 */
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

export function loginLockedOut(key: string): number {
  const entry = attempts.get(key);
  if (!entry) return 0;
  if (Date.now() > entry.until) {
    attempts.delete(key);
    return 0;
  }
  if (entry.count < MAX_ATTEMPTS) return 0;
  return Math.ceil((entry.until - Date.now()) / 1000);
}

export function recordLoginFailure(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.until) {
    attempts.set(key, { count: 1, until: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
  entry.until = now + WINDOW_MS; // each failure extends the window
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}

export async function updateAccount(userId: number, email: string, name: string) {
  await users().doc(String(userId)).update({ email, emailLower: email.toLowerCase(), name });
}
