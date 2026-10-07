/**
 * Shared content shapes. Every record that reaches a React component has already
 * been through `lib/db` hydration, so JSON columns arrive as real arrays/objects.
 */

export type Stage = {
  id: number;
  number: number;
  title: string;
  subtitle: string;
  goal: string;
  bullets: string[];
  humanShare: number; // 0-100, drives the human/AI balance visual
  orderIndex: number;
  published: number;
};

export type Service = {
  id: number;
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  body: string;
  stage: number; // which ladder stage this belongs to (1-5, 0 = cross-cutting)
  glyph: string; // key into the SVG glyph set
  image: string | null;
  features: string[];
  outcomes: { label: string; value: string }[];
  orderIndex: number;
  published: number;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: number;
  slug: string;
  title: string;
  client: string;
  industry: string;
  year: string;
  summary: string;
  challenge: string;
  approach: string;
  outcome: string;
  cover: string | null;
  /** Path to an MP4 showreel; projects with one play it in a lightbox. */
  video: string | null;
  /** Client wordmark (light, on transparent) shown in place of the name. */
  logo: string | null;
  /** Brand colour for this case study, e.g. #38A3E0. Falls back to signal gold. */
  accent: string | null;
  gallery: string[];
  tags: string[];
  metrics: { label: string; value: string; suffix?: string }[];
  stage: number;
  featured: number;
  orderIndex: number;
  published: number;
  createdAt: string;
  updatedAt: string;
};

export type Testimonial = {
  id: number;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string | null;
  orderIndex: number;
  published: number;
};

export type Message = {
  id: number;
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
};

export type MediaItem = {
  id: number;
  filename: string;
  url: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  createdAt: string;
};

export type SiteSettings = {
  brandName: string;
  brandSuffix: string;
  tagline: string;
  heroKicker: string;
  heroHeadline: string;
  heroLead: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  manifestoKicker: string;
  manifestoTitle: string;
  manifestoLines: string[];
  manifestoClosing: string;
  bandImage: string;
  bandKicker: string;
  bandLine: string;

  ladderKicker: string;
  ladderTitle: string;
  ladderLead: string;
  servicesKicker: string;
  servicesTitle: string;
  servicesLead: string;
  workKicker: string;
  workTitle: string;
  workLead: string;
  metrics: { label: string; value: number; suffix: string; prefix: string }[];
  contactKicker: string;
  contactTitle: string;
  contactLead: string;
  /** Person to contact, shown beside the details in Contact and the footer. */
  contactName: string;
  email: string;
  phone: string;
  address: string;
  socials: { label: string; url: string }[];
  footerNote: string;
  seoTitle: string;
  seoDescription: string;
};

export type AdminUser = {
  id: number;
  email: string;
  name: string;
};
