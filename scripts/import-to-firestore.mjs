/**
 * Copy the local SQLite content store (data/sagvora.db) into Firestore.
 *
 * `npm run setup` still builds content into SQLite (seed + imagery); this pushes
 * it to Firestore, which is what the site reads and the admin writes. It runs
 * once: if Firestore already holds content it stops, so it can never overwrite
 * edits made in the admin. Pass --force to replace everything deliberately.
 *
 * The admin account is NOT copied from SQLite (that one carries the seeded
 * default password). It is created from ADMIN_EMAIL / ADMIN_PASSWORD instead.
 *
 * Needs FIREBASE_SERVICE_ACCOUNT in .env.local (base64 service account JSON).
 *
 *   npm run firestore:import            # first time
 *   npm run firestore:import -- --force # replace Firestore with local content
 */
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const force = process.argv.includes("--force");

// Minimal .env.local reader (no dependency).
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) {
  console.error("FIREBASE_SERVICE_ACCOUNT is missing from .env.local");
  process.exit(1);
}
const sa = JSON.parse(raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8"));
initializeApp({ credential: cert({ projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key }) });
const fsdb = getFirestore();
fsdb.settings({ ignoreUndefinedProperties: true });

const sqlite = new Database(path.join(root, "data", "sagvora.db"), { readonly: true });
const rows = (table) => sqlite.prepare(`SELECT * FROM ${table} ORDER BY id`).all();
const parse = (v, fallback) => {
  if (v == null) return fallback;
  try {
    return JSON.parse(v) ?? fallback;
  } catch {
    return fallback;
  }
};

const existing = await fsdb.collection("settings").doc("site").get();
if (existing.exists && !force) {
  console.log("Firestore already has content — nothing imported (use --force to replace it).");
  process.exit(0);
}

/** Write records keyed by numeric id, and set the id counter past the highest. */
async function put(name, records) {
  const col = fsdb.collection(name);
  if (force) {
    const old = await col.get();
    for (let i = 0; i < old.docs.length; i += 400) {
      const b = fsdb.batch();
      old.docs.slice(i, i + 400).forEach((d) => b.delete(d.ref));
      await b.commit();
    }
  }
  for (let i = 0; i < records.length; i += 400) {
    const b = fsdb.batch();
    records.slice(i, i + 400).forEach((r) => b.set(col.doc(String(r.id)), r));
    await b.commit();
  }
  const max = records.reduce((m, r) => Math.max(m, r.id), 0);
  await fsdb.collection("counters").doc(name).set({ next: max });
  console.log(`  ${name.padEnd(13)} ${records.length}`);
}

console.log("Importing data/sagvora.db → Firestore");

const settingsRow = sqlite.prepare("SELECT value FROM settings WHERE key = 'site'").get();
await fsdb.collection("settings").doc("site").set(parse(settingsRow?.value, {}));
console.log("  settings      1");

await put("stages", rows("stages").map((r) => ({ ...r, bullets: parse(r.bullets, []) })));
await put("services", rows("services").map((r) => ({
  ...r,
  image: r.image ?? null,
  features: parse(r.features, []),
  outcomes: parse(r.outcomes, []),
})));
await put("projects", rows("projects").map((r) => ({
  ...r,
  cover: r.cover ?? null,
  video: r.video ?? null,
  logo: r.logo ?? null,
  accent: r.accent ?? null,
  gallery: parse(r.gallery, []),
  tags: parse(r.tags, []),
  metrics: parse(r.metrics, []),
})));
await put("testimonials", rows("testimonials").map((r) => ({ ...r, avatar: r.avatar ?? null })));
await put("messages", rows("messages"));
await put("media", rows("media"));

const email = process.env.ADMIN_EMAIL?.trim();
const password = process.env.ADMIN_PASSWORD;
const users = fsdb.collection("users");
if ((await users.limit(1).get()).empty && email && password && password !== "sagvora2026") {
  await users.doc("1").set({
    id: 1,
    email,
    emailLower: email.toLowerCase(),
    name: process.env.ADMIN_NAME?.trim() || "Administrator",
    passwordHash: bcrypt.hashSync(password, 12),
    tokenVersion: 0,
    createdAt: new Date().toISOString(),
  });
  console.log(`  users         1 (${email})`);
} else {
  console.log("  users         skipped (exists, or ADMIN_EMAIL/ADMIN_PASSWORD unset or still the default)");
}

console.log("Done.");
process.exit(0);
