import { getDb, parseJson } from "./db";
import { mergeSettings } from "./defaults";
import type {
  MediaItem,
  Message,
  Project,
  Service,
  SiteSettings,
  Stage,
  Testimonial,
} from "./types";

/* ------------------------------------------------------------------ rows -> models */

type Row = Record<string, unknown>;

const toStage = (r: Row): Stage => ({
  id: r.id as number,
  number: r.number as number,
  title: r.title as string,
  subtitle: r.subtitle as string,
  goal: r.goal as string,
  bullets: parseJson<string[]>(r.bullets, []),
  humanShare: r.humanShare as number,
  orderIndex: r.orderIndex as number,
  published: r.published as number,
});

const toService = (r: Row): Service => ({
  id: r.id as number,
  slug: r.slug as string,
  title: r.title as string,
  kicker: r.kicker as string,
  summary: r.summary as string,
  body: r.body as string,
  stage: r.stage as number,
  glyph: r.glyph as string,
  image: (r.image as string) ?? null,
  features: parseJson<string[]>(r.features, []),
  outcomes: parseJson<Service["outcomes"]>(r.outcomes, []),
  orderIndex: r.orderIndex as number,
  published: r.published as number,
  createdAt: r.createdAt as string,
  updatedAt: r.updatedAt as string,
});

const toProject = (r: Row): Project => ({
  id: r.id as number,
  slug: r.slug as string,
  title: r.title as string,
  client: r.client as string,
  industry: r.industry as string,
  year: r.year as string,
  summary: r.summary as string,
  challenge: r.challenge as string,
  approach: r.approach as string,
  outcome: r.outcome as string,
  cover: (r.cover as string) ?? null,
  video: (r.video as string) ?? null,
  logo: (r.logo as string) ?? null,
  accent: (r.accent as string) ?? null,
  gallery: parseJson<string[]>(r.gallery, []),
  tags: parseJson<string[]>(r.tags, []),
  metrics: parseJson<Project["metrics"]>(r.metrics, []),
  stage: r.stage as number,
  featured: r.featured as number,
  orderIndex: r.orderIndex as number,
  published: r.published as number,
  createdAt: r.createdAt as string,
  updatedAt: r.updatedAt as string,
});

const toTestimonial = (r: Row): Testimonial => ({
  id: r.id as number,
  quote: r.quote as string,
  author: r.author as string,
  role: r.role as string,
  company: r.company as string,
  avatar: (r.avatar as string) ?? null,
  orderIndex: r.orderIndex as number,
  published: r.published as number,
});

/* ------------------------------------------------------------------ slugs */

/**
 * Resolve a slug that is free to use.
 *
 * `slug` carries a UNIQUE index, so two records sharing a title would other-
 * wise abort the write and throw away everything the author had typed. Suffix
 * until it is free instead, ignoring the row being edited so re-saving an
 * unchanged record does not keep renaming it.
 */
export function uniqueSlug(
  table: "services" | "projects",
  base: string,
  excludeId?: number,
): string {
  const db = getDb();
  // `table` is a literal union, never caller-supplied text.
  const taken = db.prepare(
    `SELECT 1 FROM ${table} WHERE slug = ? AND id IS NOT ?`,
  );

  const root = base || "item";
  let candidate = root;
  let n = 2;

  while (taken.get(candidate, excludeId ?? null)) {
    candidate = `${root}-${n}`;
    n += 1;
  }
  return candidate;
}

/* ------------------------------------------------------------------ ordering */

export type OrderedTable = "services" | "projects" | "stages" | "testimonials";

const ORDERED_TABLES: OrderedTable[] = ["services", "projects", "stages", "testimonials"];

export const isOrderedTable = (v: string): v is OrderedTable =>
  (ORDERED_TABLES as string[]).includes(v);

/**
 * Move one row up or down within its list.
 *
 * Rather than swapping two values, this rewrites the whole list to sequential
 * positions with the pair exchanged — which also repairs duplicate or gapped
 * `orderIndex` values left behind by editing the numbers directly.
 */
export function moveItem(table: OrderedTable, id: number, dir: -1 | 1) {
  const db = getDb();
  const rows = db
    .prepare(`SELECT id FROM ${table} ORDER BY orderIndex, id`)
    .all() as { id: number }[];

  const from = rows.findIndex((r) => r.id === id);
  if (from === -1) return;

  const to = from + dir;
  if (to < 0 || to >= rows.length) return; // already at the end of the list

  const order = rows.map((r) => r.id);
  [order[from], order[to]] = [order[to], order[from]];

  const update = db.prepare(`UPDATE ${table} SET orderIndex = ? WHERE id = ?`);
  db.transaction(() => {
    order.forEach((rowId, index) => update.run(index, rowId));
  })();
}

/* ------------------------------------------------------------------ settings */

export function getSettings(): SiteSettings {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = 'site'").get() as
    | { value: string }
    | undefined;
  return mergeSettings(parseJson<Partial<SiteSettings> | null>(row?.value, null));
}

export function saveSettings(next: SiteSettings) {
  getDb()
    .prepare(
      `INSERT INTO settings (key, value) VALUES ('site', @value)
       ON CONFLICT(key) DO UPDATE SET value = @value`,
    )
    .run({ value: JSON.stringify(next) });
}

/* ------------------------------------------------------------------ stages */

export function getStages(onlyPublished = true): Stage[] {
  const where = onlyPublished ? "WHERE published = 1" : "";
  return (
    getDb().prepare(`SELECT * FROM stages ${where} ORDER BY orderIndex, number`).all() as Row[]
  ).map(toStage);
}

export function getStage(id: number): Stage | null {
  const r = getDb().prepare("SELECT * FROM stages WHERE id = ?").get(id) as Row | undefined;
  return r ? toStage(r) : null;
}

export function upsertStage(input: Partial<Stage> & { id?: number }) {
  const db = getDb();
  const payload = {
    number: input.number ?? 1,
    title: input.title ?? "",
    subtitle: input.subtitle ?? "",
    goal: input.goal ?? "",
    bullets: JSON.stringify(input.bullets ?? []),
    humanShare: input.humanShare ?? 50,
    orderIndex: input.orderIndex ?? 0,
    published: input.published ?? 1,
  };
  if (input.id) {
    db.prepare(
      `UPDATE stages SET number=@number, title=@title, subtitle=@subtitle, goal=@goal,
       bullets=@bullets, humanShare=@humanShare, orderIndex=@orderIndex, published=@published
       WHERE id=@id`,
    ).run({ ...payload, id: input.id });
    return input.id;
  }
  const res = db
    .prepare(
      `INSERT INTO stages (number, title, subtitle, goal, bullets, humanShare, orderIndex, published)
       VALUES (@number, @title, @subtitle, @goal, @bullets, @humanShare, @orderIndex, @published)`,
    )
    .run(payload);
  return Number(res.lastInsertRowid);
}

export function deleteStage(id: number) {
  getDb().prepare("DELETE FROM stages WHERE id = ?").run(id);
}

/* ------------------------------------------------------------------ services */

export function getServices(onlyPublished = true): Service[] {
  const where = onlyPublished ? "WHERE published = 1" : "";
  return (
    getDb().prepare(`SELECT * FROM services ${where} ORDER BY orderIndex, id`).all() as Row[]
  ).map(toService);
}

export function getServiceBySlug(slug: string): Service | null {
  const r = getDb().prepare("SELECT * FROM services WHERE slug = ?").get(slug) as Row | undefined;
  return r ? toService(r) : null;
}

export function getService(id: number): Service | null {
  const r = getDb().prepare("SELECT * FROM services WHERE id = ?").get(id) as Row | undefined;
  return r ? toService(r) : null;
}

export function upsertService(input: Partial<Service> & { id?: number }) {
  const db = getDb();
  const payload = {
    slug: input.slug ?? "",
    title: input.title ?? "",
    kicker: input.kicker ?? "",
    summary: input.summary ?? "",
    body: input.body ?? "",
    stage: input.stage ?? 0,
    glyph: input.glyph ?? "grid",
    image: input.image ?? null,
    features: JSON.stringify(input.features ?? []),
    outcomes: JSON.stringify(input.outcomes ?? []),
    orderIndex: input.orderIndex ?? 0,
    published: input.published ?? 1,
  };
  if (input.id) {
    db.prepare(
      `UPDATE services SET slug=@slug, title=@title, kicker=@kicker, summary=@summary, body=@body,
       stage=@stage, glyph=@glyph, image=@image, features=@features, outcomes=@outcomes,
       orderIndex=@orderIndex, published=@published, updatedAt=datetime('now') WHERE id=@id`,
    ).run({ ...payload, id: input.id });
    return input.id;
  }
  const res = db
    .prepare(
      `INSERT INTO services (slug, title, kicker, summary, body, stage, glyph, image, features,
       outcomes, orderIndex, published)
       VALUES (@slug, @title, @kicker, @summary, @body, @stage, @glyph, @image, @features,
       @outcomes, @orderIndex, @published)`,
    )
    .run(payload);
  return Number(res.lastInsertRowid);
}

export function deleteService(id: number) {
  getDb().prepare("DELETE FROM services WHERE id = ?").run(id);
}

/* ------------------------------------------------------------------ projects */

export function getProjects(onlyPublished = true): Project[] {
  const where = onlyPublished ? "WHERE published = 1" : "";
  return (
    getDb().prepare(`SELECT * FROM projects ${where} ORDER BY orderIndex, id`).all() as Row[]
  ).map(toProject);
}

export function getProjectBySlug(slug: string): Project | null {
  const r = getDb().prepare("SELECT * FROM projects WHERE slug = ?").get(slug) as Row | undefined;
  return r ? toProject(r) : null;
}

export function getProject(id: number): Project | null {
  const r = getDb().prepare("SELECT * FROM projects WHERE id = ?").get(id) as Row | undefined;
  return r ? toProject(r) : null;
}

export function upsertProject(input: Partial<Project> & { id?: number }) {
  const db = getDb();
  const payload = {
    slug: input.slug ?? "",
    title: input.title ?? "",
    client: input.client ?? "",
    industry: input.industry ?? "",
    year: input.year ?? "",
    summary: input.summary ?? "",
    challenge: input.challenge ?? "",
    approach: input.approach ?? "",
    outcome: input.outcome ?? "",
    cover: input.cover ?? null,
    video: input.video ?? null,
    logo: input.logo ?? null,
    accent: input.accent ?? null,
    gallery: JSON.stringify(input.gallery ?? []),
    tags: JSON.stringify(input.tags ?? []),
    metrics: JSON.stringify(input.metrics ?? []),
    stage: input.stage ?? 1,
    featured: input.featured ?? 0,
    orderIndex: input.orderIndex ?? 0,
    published: input.published ?? 1,
  };
  if (input.id) {
    db.prepare(
      `UPDATE projects SET slug=@slug, title=@title, client=@client, industry=@industry, year=@year,
       summary=@summary, challenge=@challenge, approach=@approach, outcome=@outcome, cover=@cover, video=@video, logo=@logo, accent=@accent,
       gallery=@gallery, tags=@tags, metrics=@metrics, stage=@stage, featured=@featured,
       orderIndex=@orderIndex, published=@published, updatedAt=datetime('now') WHERE id=@id`,
    ).run({ ...payload, id: input.id });
    return input.id;
  }
  const res = db
    .prepare(
      `INSERT INTO projects (slug, title, client, industry, year, summary, challenge, approach,
       outcome, cover, video, logo, accent, gallery, tags, metrics, stage, featured, orderIndex, published)
       VALUES (@slug, @title, @client, @industry, @year, @summary, @challenge, @approach,
       @outcome, @cover, @video, @logo, @accent, @gallery, @tags, @metrics, @stage, @featured, @orderIndex, @published)`,
    )
    .run(payload);
  return Number(res.lastInsertRowid);
}

export function deleteProject(id: number) {
  getDb().prepare("DELETE FROM projects WHERE id = ?").run(id);
}

/* ------------------------------------------------------------------ testimonials */

export function getTestimonials(onlyPublished = true): Testimonial[] {
  const where = onlyPublished ? "WHERE published = 1" : "";
  return (
    getDb().prepare(`SELECT * FROM testimonials ${where} ORDER BY orderIndex, id`).all() as Row[]
  ).map(toTestimonial);
}

export function getTestimonial(id: number): Testimonial | null {
  const r = getDb().prepare("SELECT * FROM testimonials WHERE id = ?").get(id) as Row | undefined;
  return r ? toTestimonial(r) : null;
}

export function upsertTestimonial(input: Partial<Testimonial> & { id?: number }) {
  const db = getDb();
  const payload = {
    quote: input.quote ?? "",
    author: input.author ?? "",
    role: input.role ?? "",
    company: input.company ?? "",
    avatar: input.avatar ?? null,
    orderIndex: input.orderIndex ?? 0,
    published: input.published ?? 1,
  };
  if (input.id) {
    db.prepare(
      `UPDATE testimonials SET quote=@quote, author=@author, role=@role, company=@company,
       avatar=@avatar, orderIndex=@orderIndex, published=@published WHERE id=@id`,
    ).run({ ...payload, id: input.id });
    return input.id;
  }
  const res = db
    .prepare(
      `INSERT INTO testimonials (quote, author, role, company, avatar, orderIndex, published)
       VALUES (@quote, @author, @role, @company, @avatar, @orderIndex, @published)`,
    )
    .run(payload);
  return Number(res.lastInsertRowid);
}

export function deleteTestimonial(id: number) {
  getDb().prepare("DELETE FROM testimonials WHERE id = ?").run(id);
}

/* ------------------------------------------------------------------ messages */

export function getMessages(): Message[] {
  return getDb()
    .prepare("SELECT * FROM messages ORDER BY createdAt DESC, id DESC")
    .all() as Message[];
}

export function countNewMessages(): number {
  const r = getDb()
    .prepare("SELECT COUNT(*) AS n FROM messages WHERE status = 'new'")
    .get() as { n: number };
  return r.n;
}

export function createMessage(m: Omit<Message, "id" | "status" | "createdAt">) {
  const res = getDb()
    .prepare(
      `INSERT INTO messages (name, email, company, subject, message)
       VALUES (@name, @email, @company, @subject, @message)`,
    )
    .run(m);
  return Number(res.lastInsertRowid);
}

export function setMessageStatus(id: number, status: Message["status"]) {
  getDb().prepare("UPDATE messages SET status = ? WHERE id = ?").run(status, id);
}

export function deleteMessage(id: number) {
  getDb().prepare("DELETE FROM messages WHERE id = ?").run(id);
}

/* ------------------------------------------------------------------ media */

export function getMedia(): MediaItem[] {
  return getDb().prepare("SELECT * FROM media ORDER BY id DESC").all() as MediaItem[];
}

export function createMedia(m: Omit<MediaItem, "id" | "createdAt">) {
  const res = getDb()
    .prepare(
      `INSERT INTO media (filename, url, mime, size, width, height, alt)
       VALUES (@filename, @url, @mime, @size, @width, @height, @alt)`,
    )
    .run(m);
  return Number(res.lastInsertRowid);
}

export function getMediaItem(id: number): MediaItem | null {
  return (getDb().prepare("SELECT * FROM media WHERE id = ?").get(id) as MediaItem) ?? null;
}

export function deleteMedia(id: number) {
  getDb().prepare("DELETE FROM media WHERE id = ?").run(id);
}

/* ------------------------------------------------------------------ dashboard */

export function getCounts() {
  const db = getDb();
  const one = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  return {
    services: one("SELECT COUNT(*) AS n FROM services"),
    projects: one("SELECT COUNT(*) AS n FROM projects"),
    stages: one("SELECT COUNT(*) AS n FROM stages"),
    testimonials: one("SELECT COUNT(*) AS n FROM testimonials"),
    messages: one("SELECT COUNT(*) AS n FROM messages"),
    newMessages: one("SELECT COUNT(*) AS n FROM messages WHERE status = 'new'"),
    media: one("SELECT COUNT(*) AS n FROM media"),
  };
}
