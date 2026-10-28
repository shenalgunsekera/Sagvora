import type { SiteSettings } from "./types";

/**
 * Every field here is editable from /admin/settings. These values are the
 * fallback used before the first save, and the shape the settings form renders.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: "SAGVORA",
  brandSuffix: "INNOVATIONS",
  tagline: "Business Transformation Company",

  heroKicker: "Business Transformation Company",
  heroHeadline: "SAGVORA",
  heroLead:
    "We automate first. Then we introduce AI. Then AI employees. Then whole AI departments. We prepare businesses for the future while solving today's problems.",
  heroPrimaryCta: "Start a transformation",
  heroSecondaryCta: "See the ladder",

  manifestoKicker: "Position",
  manifestoTitle: "What we actually are",
  manifestoLines: [
    "We are a Business Transformation Company.",
    "We automate first.",
    "Then introduce AI.",
    "Then deploy AI employees.",
    "Then AI departments.",
    "We continuously improve.",
    "Our biggest competitor is yesterday's version of ourselves.",
    "We prepare businesses for the future while solving today's problems.",
  ],
  manifestoClosing:
    "Most firms sell you a model. We rebuild the way the work moves. Then we let intelligence run it.",

  bandImage: "/imagery/band-control-room.webp",
  bandKicker: "Where we start",
  bandLine:
    "Every engagement begins in the room where the work actually happens, not in a slide deck.",

  ladderKicker: "The Method",
  ladderTitle: "Five stages. One direction.",
  ladderLead:
    "Transformation fails when it starts with the technology. Ours starts with the workflow and climbs, each stage earning the right to the next.",

  servicesKicker: "Capabilities",
  servicesTitle: "What we build",
  servicesLead:
    "Every engagement is assembled from these. Nothing is sold before the workflow that needs it is understood.",

  clientsKicker: "Trusted by",
  clientsTitle: "Companies we have built for",
  clients: [
    { name: "Ceilao Insurance Brokers", logo: "/clients/ceilao.webp", url: "" },
    { name: "Ceilao × PMF Bancassurance", logo: "/clients/ceilao-pmf.webp", url: "" },
    { name: "Araksha Insurance Brokers", logo: "/clients/araksha.webp", url: "" },
    { name: "Power Mate Investment", logo: "/clients/power-mate.webp", url: "" },
    { name: "Sterling Automobiles", logo: "/clients/sterling.webp", url: "" },
    { name: "Galactic Arcade", logo: "/clients/galactic-arcade.webp", url: "" },
    { name: "Kids & Teens", logo: "/clients/kids-and-teens.webp", url: "" },
    { name: "The Ascend", logo: "/clients/the-ascend.webp", url: "" },
    { name: "With Purpose Academy", logo: "/clients/with-purpose.webp", url: "" },
    { name: "My Banker", logo: "/clients/my-banker.webp", url: "" },
    { name: "Adaptis", logo: "/clients/adaptis.webp", url: "" },
  ],
  workKicker: "Selected Work",
  workTitle: "Proof, not promises",
  workLead:
    "A sample of transformations: the workflow before, the system after, and the numbers in between.",

  metrics: [
    { label: "Manual hours removed / month", value: 2400, suffix: "+", prefix: "" },
    { label: "Average turnaround reduction", value: 68, suffix: "%", prefix: "" },
    { label: "AI agents in production", value: 47, suffix: "", prefix: "" },
    { label: "Client retention", value: 100, suffix: "%", prefix: "" },
  ],

  contactKicker: "Contact",
  contactTitle: "Start with one workflow",
  contactLead:
    "Tell us the process that costs you the most time. We will map it, cost it, and show you what stage one looks like, before you commit to anything.",
  contactName: "Shenal Gunasekera",
  email: "shgunasekera@sagvora.lk",
  phone: "+94 74 336 4614",
  address: "Colombo, Sri Lanka",
  socials: [
    { label: "WhatsApp", url: "https://wa.me/94743364614" },
  ],
  footerNote: "Building the businesses that outlast their own playbooks.",

  seoTitle: "Sagvora Innovations | AI & Business Transformation, Sri Lanka",
  seoDescription:
    "Sagvora Innovations is a Colombo, Sri Lanka business transformation company. We automate your workflows, then add AI assistants, AI employees and AI departments.",
  founderName: "Shenal Gunasekera",
  googleSiteVerification: "",
  bingSiteVerification: "",
  analyticsId: "",
};

/** Merge stored settings over defaults so new fields never break an old save. */
export function mergeSettings(stored: Partial<SiteSettings> | null | undefined): SiteSettings {
  if (!stored) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...stored };
}
