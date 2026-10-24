"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import {
  changePassword,
  clearSessionCookie,
  requireUser,
  setSessionCookie,
  signSession,
  updateAccount,
} from "@/lib/auth";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { bool, json, num, slugFrom, str } from "@/lib/form";
import { deleteBlob, saveBlob } from "@/lib/media-store";
import {
  createMedia,
  deleteMedia,
  deleteMessage,
  deleteProject,
  deleteService,
  deleteStage,
  deleteTestimonial,
  getMediaItem,
  getSettings,
  isOrderedTable,
  moveItem,
  reserveMediaId,
  saveSettings,
  setMessageStatus,
  upsertProject,
  uniqueSlug,
  upsertService,
  upsertStage,
  upsertTestimonial,
} from "@/lib/queries";
import type { OrderedTable } from "@/lib/queries";
import type { Message, Project, Service, SiteSettings } from "@/lib/types";

/** Every mutation revalidates the public site and the admin list it came from. */
function refresh(...paths: string[]) {
  revalidatePath("/", "layout");
  for (const p of paths) revalidatePath(p);
}

/* ==========================================================================
   Ordering — shared by every list that has an orderIndex
   ========================================================================== */

const LIST_PATHS: Record<OrderedTable, string> = {
  services: "/admin/capabilities",
  projects: "/admin/work",
  stages: "/admin/stages",
  testimonials: "/admin/testimonials",
};

export async function moveItemAction(formData: FormData) {
  await requireUser();

  const table = str(formData, "table");
  if (!isOrderedTable(table)) return;

  const dir = num(formData, "dir") < 0 ? -1 : 1;
  await moveItem(table, num(formData, "id"), dir);

  refresh(LIST_PATHS[table]);
}

/* ==========================================================================
   Capabilities
   ========================================================================== */

export async function saveServiceAction(formData: FormData) {
  await requireUser();

  const id = num(formData, "id") || undefined;
  await upsertService({
    id,
    slug: await uniqueSlug("services", slugFrom(formData), id),
    title: str(formData, "title"),
    kicker: str(formData, "kicker"),
    summary: str(formData, "summary"),
    body: str(formData, "body"),
    stage: num(formData, "stage"),
    glyph: str(formData, "glyph", "grid"),
    image: str(formData, "image") || null,
    features: json<string[]>(formData, "features", []),
    outcomes: json<Service["outcomes"]>(formData, "outcomes", []),
    orderIndex: num(formData, "orderIndex"),
    published: bool(formData, "published"),
  });

  refresh("/admin/capabilities");
  redirect("/admin/capabilities");
}

export async function deleteServiceAction(formData: FormData) {
  await requireUser();
  await deleteService(num(formData, "id"));
  refresh("/admin/capabilities");
}

/* ==========================================================================
   Work
   ========================================================================== */

export async function saveProjectAction(formData: FormData) {
  await requireUser();

  const id = num(formData, "id") || undefined;
  await upsertProject({
    id,
    slug: await uniqueSlug("projects", slugFrom(formData), id),
    title: str(formData, "title"),
    client: str(formData, "client"),
    industry: str(formData, "industry"),
    year: str(formData, "year"),
    summary: str(formData, "summary"),
    challenge: str(formData, "challenge"),
    approach: str(formData, "approach"),
    outcome: str(formData, "outcome"),
    cover: str(formData, "cover") || null,
    video: str(formData, "video") || null,
    logo: str(formData, "logo") || null,
    accent: /^#[0-9a-f]{6}$/i.test(str(formData, "accent")) ? str(formData, "accent") : null,
    gallery: json<string[]>(formData, "gallery", []),
    tags: json<string[]>(formData, "tags", []),
    metrics: json<Project["metrics"]>(formData, "metrics", []),
    stage: num(formData, "stage", 1),
    featured: bool(formData, "featured"),
    orderIndex: num(formData, "orderIndex"),
    published: bool(formData, "published"),
  });

  refresh("/admin/work");
  redirect("/admin/work");
}

export async function deleteProjectAction(formData: FormData) {
  await requireUser();
  await deleteProject(num(formData, "id"));
  refresh("/admin/work");
}

/* ==========================================================================
   Stages
   ========================================================================== */

export async function saveStageAction(formData: FormData) {
  await requireUser();

  const id = num(formData, "id") || undefined;
  await upsertStage({
    id,
    number: num(formData, "number", 1),
    title: str(formData, "title"),
    subtitle: str(formData, "subtitle"),
    goal: str(formData, "goal"),
    bullets: json<string[]>(formData, "bullets", []),
    humanShare: Math.max(0, Math.min(100, num(formData, "humanShare", 50))),
    orderIndex: num(formData, "orderIndex"),
    published: bool(formData, "published"),
  });

  refresh("/admin/stages");
  redirect("/admin/stages");
}

export async function deleteStageAction(formData: FormData) {
  await requireUser();
  await deleteStage(num(formData, "id"));
  refresh("/admin/stages");
}

/* ==========================================================================
   Testimonials
   ========================================================================== */

export async function saveTestimonialAction(formData: FormData) {
  await requireUser();

  const id = num(formData, "id") || undefined;
  await upsertTestimonial({
    id,
    quote: str(formData, "quote"),
    author: str(formData, "author"),
    role: str(formData, "role"),
    company: str(formData, "company"),
    avatar: str(formData, "avatar") || null,
    orderIndex: num(formData, "orderIndex"),
    published: bool(formData, "published"),
  });

  refresh("/admin/testimonials");
  redirect("/admin/testimonials");
}

export async function deleteTestimonialAction(formData: FormData) {
  await requireUser();
  await deleteTestimonial(num(formData, "id"));
  refresh("/admin/testimonials");
}

/* ==========================================================================
   Settings
   ========================================================================== */

/**
 * Search consoles hand out a whole <meta> tag; accept that or the bare code and
 * keep just the content value.
 */
function verificationCode(raw: string) {
  const m = /content=["']([^"']+)["']/i.exec(raw);
  return (m ? m[1] : raw).trim();
}

export async function saveSettingsAction(formData: FormData) {
  await requireUser();
  const current = await getSettings();

  const next: SiteSettings = {
    ...current,
    brandName: str(formData, "brandName", current.brandName),
    brandSuffix: str(formData, "brandSuffix", current.brandSuffix),
    tagline: str(formData, "tagline"),

    heroKicker: str(formData, "heroKicker"),
    heroHeadline: str(formData, "heroHeadline", DEFAULT_SETTINGS.heroHeadline),
    heroLead: str(formData, "heroLead"),
    heroPrimaryCta: str(formData, "heroPrimaryCta"),
    heroSecondaryCta: str(formData, "heroSecondaryCta"),

    manifestoKicker: str(formData, "manifestoKicker"),
    manifestoTitle: str(formData, "manifestoTitle"),
    manifestoLines: json<string[]>(formData, "manifestoLines", current.manifestoLines),
    manifestoClosing: str(formData, "manifestoClosing"),

    bandImage: str(formData, "bandImage"),
    bandKicker: str(formData, "bandKicker"),
    bandLine: str(formData, "bandLine"),

    ladderKicker: str(formData, "ladderKicker"),
    ladderTitle: str(formData, "ladderTitle"),
    ladderLead: str(formData, "ladderLead"),

    servicesKicker: str(formData, "servicesKicker"),
    servicesTitle: str(formData, "servicesTitle"),
    servicesLead: str(formData, "servicesLead"),

    workKicker: str(formData, "workKicker"),
    workTitle: str(formData, "workTitle"),
    workLead: str(formData, "workLead"),

    metrics: json<SiteSettings["metrics"]>(formData, "metrics", current.metrics),

    contactKicker: str(formData, "contactKicker"),
    contactTitle: str(formData, "contactTitle"),
    contactLead: str(formData, "contactLead"),
    contactName: str(formData, "contactName"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    address: str(formData, "address"),
    socials: json<SiteSettings["socials"]>(formData, "socials", current.socials),
    footerNote: str(formData, "footerNote"),

    seoTitle: str(formData, "seoTitle"),
    seoDescription: str(formData, "seoDescription"),
    founderName: str(formData, "founderName"),
    googleSiteVerification: verificationCode(str(formData, "googleSiteVerification")),
    bingSiteVerification: verificationCode(str(formData, "bingSiteVerification")),
  };

  await saveSettings(next);
  refresh("/admin/settings");
}

export async function resetSettingsAction() {
  await requireUser();
  await saveSettings(DEFAULT_SETTINGS);
  refresh("/admin/settings");
}

/* ==========================================================================
   Inbox
   ========================================================================== */

export async function setMessageStatusAction(formData: FormData) {
  await requireUser();
  const status = str(formData, "status") as Message["status"];
  if (!["new", "read", "archived"].includes(status)) return;
  await setMessageStatus(num(formData, "id"), status);
  refresh("/admin/inbox");
}

export async function deleteMessageAction(formData: FormData) {
  await requireUser();
  await deleteMessage(num(formData, "id"));
  refresh("/admin/inbox");
}

/* ==========================================================================
   Media
   ========================================================================== */

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"]);

/** Shape shared by the actions wired to `useActionState`. */
export type ActionState = { error?: string; ok?: boolean };

export async function uploadMediaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file first." };
  }
  if (!ALLOWED.has(file.type)) {
    return { error: "Images only — JPEG, PNG, WebP, AVIF or SVG." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "That file is over the 8 MB limit." };
  }

  const stamp = Date.now().toString(36);
  const safeBase =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image";

  const buffer = Buffer.from(await file.arrayBuffer());
  let filename: string;
  let data: Buffer = buffer;
  let width: number | null = null;
  let height: number | null = null;
  let size = buffer.byteLength;
  let mime = file.type;

  if (file.type === "image/svg+xml") {
    filename = `${safeBase}-${stamp}.svg`;
  } else {
    // Normalise everything else to a capped-width WebP: one format, predictable
    // weight, and no surprise 12-megapixel hero images.
    filename = `${safeBase}-${stamp}.webp`;
    const out = await sharp(buffer)
      .rotate()
      .resize({ width: 2400, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    data = out.data;
    width = out.info.width;
    height = out.info.height;
    size = out.data.byteLength;
    mime = "image/webp";
  }

  // Files live in Firestore (lib/media-store) and are served from /media/...,
  // so uploads survive serverless restarts and redeploys.
  const id = await reserveMediaId();
  await saveBlob(id, mime, data);
  await createMedia({
    filename,
    url: `/media/${id}/${filename}`,
    mime,
    size,
    width,
    height,
    alt: str(formData, "alt"),
  }, id);

  refresh("/admin/media");
  return { ok: true };
}

export async function deleteMediaAction(formData: FormData) {
  await requireUser();

  const id = num(formData, "id");
  const item = await getMediaItem(id);
  if (!item) return;

  await deleteMedia(id);
  // Uploaded files are stored in Firestore. Library entries pointing at the
  // shipped /public imagery are records only; those files ship with the code.
  if (item.url.startsWith("/media/")) await deleteBlob(id);

  refresh("/admin/media");
}

/* ==========================================================================
   Account
   ========================================================================== */

export async function updateAccountAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const email = str(formData, "email");
  const name = str(formData, "name", user.name);
  if (!email) return { error: "Email is required." };

  await updateAccount(user.id, email, name);
  refresh("/admin/account");
  return { ok: true };
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const next = str(formData, "password");
  const confirm = str(formData, "confirm");

  if (next.length < 10) return { error: "Use at least 10 characters." };
  if (next !== confirm) return { error: "The two passwords do not match." };

  await changePassword(user.id, next);

  // The version bump above invalidates every existing session, this one
  // included. Re-issue the caller's cookie so the person doing the reset is not
  // thrown out of the panel mid-task, while other devices are signed out.
  await setSessionCookie(await signSession(user));

  return { ok: true };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}
