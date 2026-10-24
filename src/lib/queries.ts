import "server-only";
import { revalidateTag, unstable_cache } from "next/cache";
import { mergeSettings } from "./defaults";
import { firestore } from "./firebase";
import type {
  MediaItem,
  Message,
  Project,
  Service,
  SiteSettings,
  Stage,
  Testimonial,
} from "./types";

/**
 * Content store on Firestore.
 *
 * Every record keeps the numeric `id` it always had (handed out by a counter
 * document), so admin URLs and forms are unchanged. Documents are stored under
 * that id as their key.
 *
 * Public reads go through Next's data cache, one tag per collection, so a page
 * view costs no Firestore reads once warm. Every write revalidates its tag, so
 * an admin save shows up on the live site immediately.
 */

type Collection =
  | "settings"
  | "stages"
  | "services"
  | "projects"
  | "testimonials"
  | "messages"
  | "media";

const col = (name: Collection | "counters") => firestore().collection(name);
const now = () => new Date().toISOString();
const tag = (name: Collection) => `content:${name}`;

/** Clear the cached copy of a collection after a write. */
function changed(...names: Collection[]) {
  for (const n of names) revalidateTag(tag(n));
}

/** Next numeric id for a collection, allocated atomically. */
async function nextId(name: Collection): Promise<number> {
  const ref = col("counters").doc(name);
  return firestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const next = ((snap.exists ? (snap.data()?.next as number) : 0) || 0) + 1;
    tx.set(ref, { next });
    return next;
  });
}

async function readAll<T>(name: Collection): Promise<T[]> {
  const snap = await col(name).get();
  return snap.docs.map((d) => d.data() as T);
}

/** Cached whole-collection read; collections here are small (tens of docs). */
function cachedAll<T>(name: Collection) {
  return unstable_cache(() => readAll<T>(name), ["all", name], {
    tags: [tag(name)],
    revalidate: 3600,
  })();
}

const byOrder = <T extends { orderIndex: number; id: number }>(a: T, b: T) =>
  a.orderIndex - b.orderIndex || a.id - b.id;

/** Insert or update a document keyed by its numeric id. */
async function upsert<T extends { id?: number }>(
  name: Collection,
  input: T,
  build: (existing: Record<string, unknown> | null) => Record<string, unknown>,
): Promise<number> {
  const id = input.id || (await nextId(name));
  const ref = col(name).doc(String(id));
  const existing = input.id ? ((await ref.get()).data() ?? null) : null;
  await ref.set({ ...build(existing), id });
  changed(name);
  return id;
}

async function remove(name: Collection, id: number) {
  await col(name).doc(String(id)).delete();
  changed(name);
}

/* ------------------------------------------------------------------ slugs */

/**
 * Resolve a slug that is free to use, suffixing until it is. The record being
 * edited is ignored so re-saving an unchanged record does not rename it.
 */
export async function uniqueSlug(
  table: "services" | "projects",
  base: string,
  excludeId?: number,
): Promise<string> {
  const rows = await readAll<{ id: number; slug: string }>(table);
  const taken = new Set(rows.filter((r) => r.id !== excludeId).map((r) => r.slug));
  const root = base || "item";
  let candidate = root;
  let n = 2;
  while (taken.has(candidate)) {
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
 * Move one record up or down within its list. The whole list is rewritten to
 * sequential positions, which also repairs gapped or duplicate orderIndex values.
 */
export async function moveItem(table: OrderedTable, id: number, dir: -1 | 1) {
  const rows = (await readAll<{ id: number; orderIndex: number }>(table)).sort(byOrder);
  const from = rows.findIndex((r) => r.id === id);
  if (from === -1) return;
  const to = from + dir;
  if (to < 0 || to >= rows.length) return;

  const order = rows.map((r) => r.id);
  [order[from], order[to]] = [order[to], order[from]];

  const batch = firestore().batch();
  order.forEach((rowId, index) => batch.update(col(table).doc(String(rowId)), { orderIndex: index }));
  await batch.commit();
  changed(table);
}

/* ------------------------------------------------------------------ settings */

export async function getSettings(): Promise<SiteSettings> {
  const value = await unstable_cache(
    async () => ((await col("settings").doc("site").get()).data() ?? null) as Partial<SiteSettings> | null,
    ["settings"],
    { tags: [tag("settings")], revalidate: 3600 },
  )();
  return mergeSettings(value);
}

export async function saveSettings(next: SiteSettings) {
  await col("settings").doc("site").set(next);
  changed("settings");
}

/* ------------------------------------------------------------------ stages */

export async function getStages(onlyPublished = true): Promise<Stage[]> {
  const rows = await cachedAll<Stage>("stages");
  return rows
    .filter((s) => !onlyPublished || s.published === 1)
    .sort((a, b) => a.orderIndex - b.orderIndex || a.number - b.number);
}

export async function getStage(id: number): Promise<Stage | null> {
  return (await getStages(false)).find((s) => s.id === id) ?? null;
}

export function upsertStage(input: Partial<Stage> & { id?: number }) {
  return upsert("stages", input, () => ({
    number: input.number ?? 1,
    title: input.title ?? "",
    subtitle: input.subtitle ?? "",
    goal: input.goal ?? "",
    bullets: input.bullets ?? [],
    humanShare: input.humanShare ?? 50,
    orderIndex: input.orderIndex ?? 0,
    published: input.published ?? 1,
  }));
}

export const deleteStage = (id: number) => remove("stages", id);

/* ------------------------------------------------------------------ services */

export async function getServices(onlyPublished = true): Promise<Service[]> {
  const rows = await cachedAll<Service>("services");
  return rows.filter((s) => !onlyPublished || s.published === 1).sort(byOrder);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  return (await getServices(false)).find((s) => s.slug === slug) ?? null;
}

export async function getService(id: number): Promise<Service | null> {
  return (await getServices(false)).find((s) => s.id === id) ?? null;
}

export function upsertService(input: Partial<Service> & { id?: number }) {
  return upsert("services", input, (existing) => ({
    slug: input.slug ?? "",
    title: input.title ?? "",
    kicker: input.kicker ?? "",
    summary: input.summary ?? "",
    body: input.body ?? "",
    stage: input.stage ?? 0,
    glyph: input.glyph ?? "grid",
    image: input.image ?? null,
    features: input.features ?? [],
    outcomes: input.outcomes ?? [],
    orderIndex: input.orderIndex ?? 0,
    published: input.published ?? 1,
    createdAt: (existing?.createdAt as string) ?? now(),
    updatedAt: now(),
  }));
}

export const deleteService = (id: number) => remove("services", id);

/* ------------------------------------------------------------------ projects */

export async function getProjects(onlyPublished = true): Promise<Project[]> {
  const rows = await cachedAll<Project>("projects");
  return rows.filter((p) => !onlyPublished || p.published === 1).sort(byOrder);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return (await getProjects(false)).find((p) => p.slug === slug) ?? null;
}

export async function getProject(id: number): Promise<Project | null> {
  return (await getProjects(false)).find((p) => p.id === id) ?? null;
}

export function upsertProject(input: Partial<Project> & { id?: number }) {
  return upsert("projects", input, (existing) => ({
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
    gallery: input.gallery ?? [],
    tags: input.tags ?? [],
    metrics: input.metrics ?? [],
    stage: input.stage ?? 1,
    featured: input.featured ?? 0,
    orderIndex: input.orderIndex ?? 0,
    published: input.published ?? 1,
    createdAt: (existing?.createdAt as string) ?? now(),
    updatedAt: now(),
  }));
}

export const deleteProject = (id: number) => remove("projects", id);

/* ------------------------------------------------------------------ testimonials */

export async function getTestimonials(onlyPublished = true): Promise<Testimonial[]> {
  const rows = await cachedAll<Testimonial>("testimonials");
  return rows.filter((t) => !onlyPublished || t.published === 1).sort(byOrder);
}

export async function getTestimonial(id: number): Promise<Testimonial | null> {
  return (await getTestimonials(false)).find((t) => t.id === id) ?? null;
}

export function upsertTestimonial(input: Partial<Testimonial> & { id?: number }) {
  return upsert("testimonials", input, () => ({
    quote: input.quote ?? "",
    author: input.author ?? "",
    role: input.role ?? "",
    company: input.company ?? "",
    avatar: input.avatar ?? null,
    orderIndex: input.orderIndex ?? 0,
    published: input.published ?? 1,
  }));
}

export const deleteTestimonial = (id: number) => remove("testimonials", id);

/* ------------------------------------------------------------------ messages
 * Admin-only and always read fresh — never cached.
 */

export async function getMessages(): Promise<Message[]> {
  const rows = await readAll<Message>("messages");
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
}

export async function countNewMessages(): Promise<number> {
  const snap = await col("messages").where("status", "==", "new").count().get();
  return snap.data().count;
}

export async function createMessage(m: Omit<Message, "id" | "status" | "createdAt">) {
  const id = await nextId("messages");
  await col("messages").doc(String(id)).set({ ...m, id, status: "new", createdAt: now() });
  return id;
}

export async function setMessageStatus(id: number, status: Message["status"]) {
  await col("messages").doc(String(id)).update({ status });
}

export async function deleteMessage(id: number) {
  await col("messages").doc(String(id)).delete();
}

/* ------------------------------------------------------------------ media
 * Library records. Uploaded files themselves live in lib/media-store.ts.
 */

export async function getMedia(): Promise<MediaItem[]> {
  const rows = await readAll<MediaItem>("media");
  return rows.sort((a, b) => b.id - a.id);
}

export async function createMedia(m: Omit<MediaItem, "id" | "createdAt">, id?: number) {
  const mediaId = id ?? (await nextId("media"));
  await col("media").doc(String(mediaId)).set({ ...m, id: mediaId, createdAt: now() });
  return mediaId;
}

/** Reserve a media id before the file is stored, so its URL can carry the id. */
export const reserveMediaId = () => nextId("media");

export async function getMediaItem(id: number): Promise<MediaItem | null> {
  return ((await col("media").doc(String(id)).get()).data() as MediaItem) ?? null;
}

export async function deleteMedia(id: number) {
  await col("media").doc(String(id)).delete();
}

/* ------------------------------------------------------------------ dashboard */

export async function getCounts() {
  const count = async (name: Collection) => (await col(name).count().get()).data().count;
  const [services, projects, stages, testimonials, messages, newMessages, media] = await Promise.all([
    count("services"),
    count("projects"),
    count("stages"),
    count("testimonials"),
    count("messages"),
    countNewMessages(),
    count("media"),
  ]);
  return { services, projects, stages, testimonials, messages, newMessages, media };
}

