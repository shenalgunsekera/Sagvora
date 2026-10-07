/**
 * Publishable copy of the content store, for serverless hosts (Vercel).
 *
 * Serverless functions cannot write next to the code and start from a clean
 * filesystem, so the live database never ships. This writes data/content.db:
 * the same site content, minus anything private — admin users (password
 * hashes) and contact-form messages are removed. src/lib/db.ts copies it into
 * /tmp on cold start.
 *
 * Re-run after editing content locally, then commit data/content.db:
 *   npm run snapshot
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "data", "sagvora.db");
const out = path.join(root, "data", "content.db");

if (!fs.existsSync(src)) {
  console.error("No data/sagvora.db — run `npm run setup` first.");
  process.exit(1);
}

fs.rmSync(out, { force: true });
const db = new Database(src, { readonly: true });
db.prepare("VACUUM INTO ?").run(out);
db.close();

const snap = new Database(out);
snap.exec("DELETE FROM users; DELETE FROM messages;");
snap.pragma("journal_mode = DELETE");
snap.exec("VACUUM");
const counts = ["settings", "stages", "services", "projects", "testimonials", "media", "users", "messages"]
  .map((t) => `${t} ${snap.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get().c}`)
  .join(", ");
snap.close();

console.log(`data/content.db written (${(fs.statSync(out).size / 1024).toFixed(0)} KB): ${counts}`);
