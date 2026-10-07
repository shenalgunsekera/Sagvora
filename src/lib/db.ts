import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

/**
 * Serverless hosts (Vercel) can only write to /tmp and start every instance
 * from a clean filesystem. There the store is a copy of data/content.db — the
 * published content snapshot (see scripts/snapshot-content.mjs). Writes made
 * there (admin edits, contact messages) last only as long as the instance.
 */
const SERVERLESS = Boolean(process.env.VERCEL);
const SNAPSHOT_PATH = path.join(process.cwd(), "data", "content.db");
const DATA_DIR = SERVERLESS ? path.join("/tmp", "sagvora") : path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "sagvora.db");
const SCHEMA_PATH = path.join(process.cwd(), "src", "lib", "schema.sql");

declare global {
  // Next dev server hot-reloads modules; keep one handle per process.
  // eslint-disable-next-line no-var
  var __sagvoraDb: Database.Database | undefined;
}

/**
 * Additive migration.
 *
 * `CREATE TABLE IF NOT EXISTS` in schema.sql only shapes a *new* database — it
 * cannot add a column to a table that already exists. Anything introduced after
 * the first release therefore needs listing here as well, so existing installs
 * pick it up on boot instead of failing on a missing column.
 */
function ensureColumn(
  db: Database.Database,
  table: string,
  column: string,
  ddl: string,
) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (columns.some((c) => c.name === column)) return;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
}

export function getDb(): Database.Database {
  if (global.__sagvoraDb) return global.__sagvoraDb;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (SERVERLESS && !fs.existsSync(DB_PATH) && fs.existsSync(SNAPSHOT_PATH)) {
    fs.copyFileSync(SNAPSHOT_PATH, DB_PATH);
  }
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(fs.readFileSync(SCHEMA_PATH, "utf8"));

  ensureColumn(db, "users", "tokenVersion", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn(db, "projects", "video", "TEXT");
  ensureColumn(db, "projects", "logo", "TEXT");
  ensureColumn(db, "projects", "accent", "TEXT");

  global.__sagvoraDb = db;
  return db;
}

/** Parse a JSON column, falling back to `fallback` on anything malformed. */
export function parseJson<T>(raw: unknown, fallback: T): T {
  if (raw == null) return fallback;
  if (typeof raw !== "string") return raw as T;
  try {
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}
