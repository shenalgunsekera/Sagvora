-- Single source of truth for the Sagvora content store.
-- Read at runtime by src/lib/db.ts and by scripts/seed.mjs. Every statement is
-- idempotent, so it is safe to re-run on every boot.

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL DEFAULT 'Administrator',
  passwordHash  TEXT NOT NULL,
  -- Bumped on every password change; a session carrying an older value is
  -- rejected, so changing the password signs every other device out.
  tokenVersion  INTEGER NOT NULL DEFAULT 0,
  createdAt     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  number      INTEGER NOT NULL,
  title       TEXT NOT NULL,
  subtitle    TEXT NOT NULL DEFAULT '',
  goal        TEXT NOT NULL DEFAULT '',
  bullets     TEXT NOT NULL DEFAULT '[]',
  humanShare  INTEGER NOT NULL DEFAULT 50,
  orderIndex  INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS services (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  kicker      TEXT NOT NULL DEFAULT '',
  summary     TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL DEFAULT '',
  stage       INTEGER NOT NULL DEFAULT 0,
  glyph       TEXT NOT NULL DEFAULT 'grid',
  image       TEXT,
  features    TEXT NOT NULL DEFAULT '[]',
  outcomes    TEXT NOT NULL DEFAULT '[]',
  orderIndex  INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1,
  createdAt   TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  client      TEXT NOT NULL DEFAULT '',
  industry    TEXT NOT NULL DEFAULT '',
  year        TEXT NOT NULL DEFAULT '',
  summary     TEXT NOT NULL DEFAULT '',
  challenge   TEXT NOT NULL DEFAULT '',
  approach    TEXT NOT NULL DEFAULT '',
  outcome     TEXT NOT NULL DEFAULT '',
  cover       TEXT,
  video       TEXT,
  logo        TEXT,
  accent      TEXT,
  gallery     TEXT NOT NULL DEFAULT '[]',
  tags        TEXT NOT NULL DEFAULT '[]',
  metrics     TEXT NOT NULL DEFAULT '[]',
  stage       INTEGER NOT NULL DEFAULT 1,
  featured    INTEGER NOT NULL DEFAULT 0,
  orderIndex  INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1,
  createdAt   TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS testimonials (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  quote       TEXT NOT NULL,
  author      TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT '',
  company     TEXT NOT NULL DEFAULT '',
  avatar      TEXT,
  orderIndex  INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  company    TEXT NOT NULL DEFAULT '',
  subject    TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'new',
  createdAt  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS media (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  filename   TEXT NOT NULL,
  url        TEXT NOT NULL,
  mime       TEXT NOT NULL DEFAULT '',
  size       INTEGER NOT NULL DEFAULT 0,
  width      INTEGER,
  height     INTEGER,
  alt        TEXT NOT NULL DEFAULT '',
  createdAt  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_services_order  ON services(orderIndex);
CREATE INDEX IF NOT EXISTS idx_projects_order  ON projects(orderIndex);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status, createdAt DESC);
