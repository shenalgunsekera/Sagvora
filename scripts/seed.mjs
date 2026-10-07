/**
 * Seeds the content store with Sagvora's five-stage model plus sample
 * capabilities, case studies and testimonials.
 *
 * Safe to re-run: it only inserts rows that are missing (matched on slug /
 * stage number), so your edits in /admin are never overwritten.
 *
 *   npm run seed
 */
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnv(path.join(root, ".env.local"));

const dataDir = path.join(root, "data");
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(path.join(root, "public", "uploads"), { recursive: true });

const db = new Database(path.join(dataDir, "sagvora.db"));
db.pragma("journal_mode = WAL");
db.exec(fs.readFileSync(path.join(root, "src", "lib", "schema.sql"), "utf8"));

// Columns added after first release (mirrors ensureColumn in src/lib/db.ts).
const projectCols = db.prepare("PRAGMA table_info(projects)").all().map((c) => c.name);
for (const col of ["video", "logo", "accent"]) {
  if (!projectCols.includes(col)) db.exec(`ALTER TABLE projects ADD COLUMN ${col} TEXT`);
}

/* ---------------------------------------------------------------- admin user */

const email = process.env.ADMIN_EMAIL || "admin@sagvora.com";
const password = process.env.ADMIN_PASSWORD || "sagvora2026";
const existingUser = db.prepare("SELECT id FROM users LIMIT 1").get();

if (!existingUser) {
  db.prepare("INSERT INTO users (email, name, passwordHash) VALUES (?, ?, ?)").run(
    email,
    "Administrator",
    bcrypt.hashSync(password, 12),
  );
  console.log(`  admin user created  →  ${email} / ${password}`);
} else {
  console.log("  admin user already exists — left untouched");
}

/* ---------------------------------------------------------------- stages */

const stages = [
  {
    number: 1,
    title: "Automate",
    subtitle: "Remove the manual work before adding anything clever.",
    goal: "Build trust.",
    humanShare: 85,
    bullets: [
      "Study the customer's business.",
      "Redesign the workflow.",
      "Remove manual work.",
      "Deliver measurable savings and faster turnaround.",
    ],
  },
  {
    number: 2,
    title: "AI Assist",
    subtitle: "Intelligence enters the workflow — as a colleague, not a replacement.",
    goal: "Build confidence.",
    humanShare: 68,
    bullets: [
      "Introduce AI into the automated workflow.",
      "AI prepares quotations, analyzes data, drafts reports, and supports employees.",
      "Humans remain in control.",
    ],
  },
  {
    number: 3,
    title: "AI Execute",
    subtitle: "Defined tasks move from supervised to owned.",
    goal: "Reduce operational cost and improve consistency.",
    humanShare: 38,
    bullets: [
      "AI takes responsibility for defined tasks.",
      "Human involvement becomes approval and exception handling.",
    ],
  },
  {
    number: 4,
    title: "AI Workforce",
    subtitle: "Agents stop being tools and start being a department.",
    goal: "Transform how the business operates.",
    humanShare: 15,
    bullets: [
      "AI employees work together as a department.",
      "The business operates with minimal human intervention for routine work.",
    ],
  },
  {
    number: 5,
    title: "Continuous Evolution",
    subtitle: "The system that improves itself is the only durable advantage.",
    goal: "Ensure the customer remains competitive.",
    humanShare: 10,
    bullets: [
      "As new technology emerges, we continuously improve the customer's AI workforce and business processes.",
      "Our biggest competitor is yesterday's version of ourselves.",
    ],
  },
];

const hasStage = db.prepare("SELECT id FROM stages WHERE number = ?");
const insertStage = db.prepare(
  `INSERT INTO stages (number, title, subtitle, goal, bullets, humanShare, orderIndex, published)
   VALUES (@number, @title, @subtitle, @goal, @bullets, @humanShare, @orderIndex, 1)`,
);
let stagesAdded = 0;
for (const [i, s] of stages.entries()) {
  if (hasStage.get(s.number)) continue;
  insertStage.run({ ...s, bullets: JSON.stringify(s.bullets), orderIndex: i });
  stagesAdded++;
}

/* ---------------------------------------------------------------- services */

const services = [
  {
    slug: "workflow-forensics",
    title: "Workflow Forensics",
    kicker: "Stage 01 · Automate",
    stage: 1,
    glyph: "scan",
    summary:
      "We sit inside your operation and map every hand-off, wait state and re-key until the real cost of the process is on one page.",
    body:
      "Nothing gets automated before it is understood. We shadow the people doing the work, instrument the systems they use, and reconstruct the process as it actually runs — not as the SOP claims it runs.\n\nThe output is a costed workflow map: every step, its cycle time, its failure rate, and the annual hours it consumes. That map becomes the contract for everything that follows. If a step cannot be measured, it does not get a budget.",
    features: [
      "On-site and in-system process shadowing",
      "Cycle-time and touch-point instrumentation",
      "Costed workflow map with annual hour burn",
      "Automation candidates ranked by payback period",
    ],
    outcomes: [
      { label: "Typical engagement", value: "2–3 weeks" },
      { label: "Deliverable", value: "Costed process map" },
    ],
  },
  {
    slug: "process-automation",
    title: "Process Automation",
    kicker: "Stage 01 · Automate",
    stage: 1,
    glyph: "flow",
    summary:
      "The manual steps come out. Approvals, routing, data entry and reporting run themselves — with an audit trail you can defend.",
    body:
      "We rebuild the workflow rather than paper over it. Forms replace inboxes, rules replace chasing, and every state change is logged.\n\nThis is deliberately unglamorous work, and it is where the trust is earned. Clients see hours come back before they are asked to believe anything about AI.",
    features: [
      "Approval, routing and escalation logic",
      "Data capture that removes re-keying",
      "Scheduled and event-driven jobs",
      "Full audit trail on every state change",
    ],
    outcomes: [
      { label: "Manual steps removed", value: "40–80%" },
      { label: "Payback", value: "< 2 quarters" },
    ],
  },
  {
    slug: "systems-integration",
    title: "Systems & Data Integration",
    kicker: "Stage 01 · Automate",
    stage: 1,
    glyph: "nodes",
    summary:
      "ERP, CRM, spreadsheets, WhatsApp and the one Access database nobody admits to — connected into a single source of truth.",
    body:
      "Most automation stalls because the data lives in five places that disagree. We build the integration layer first: one canonical record, synced both ways, with conflict rules you actually chose.\n\nThis layer is also what makes later stages possible — an AI workforce is only as good as the data surface it can reach.",
    features: [
      "Two-way sync across line-of-business systems",
      "Canonical data model and conflict rules",
      "Legacy and spreadsheet ingestion",
      "Event bus for downstream agents",
    ],
    outcomes: [
      { label: "Systems unified", value: "3–12" },
      { label: "Reconciliation work", value: "Eliminated" },
    ],
  },
  {
    slug: "ai-copilots",
    title: "AI Copilots for Teams",
    kicker: "Stage 02 · AI Assist",
    stage: 2,
    glyph: "assist",
    summary:
      "Intelligence layered onto the automated workflow — drafting, analysing and preparing, while your people stay in control.",
    body:
      "The copilot works inside the process, not beside it. It reads the same records your team reads, drafts the quotation or the report, and hands it over with its reasoning attached.\n\nEvery output is reviewable and every action is reversible. Confidence is built by letting people watch the system be right, repeatedly, before anything is delegated to it.",
    features: [
      "Grounded on your own documents and records",
      "Draft-and-review, never fire-and-forget",
      "Inline citations back to source records",
      "Adoption tracking per team and per task",
    ],
    outcomes: [
      { label: "Drafting time", value: "−70%" },
      { label: "Human control", value: "Retained" },
    ],
  },
  {
    slug: "document-quotation-intelligence",
    title: "Document & Quotation Intelligence",
    kicker: "Stage 02 · AI Assist",
    stage: 2,
    glyph: "doc",
    summary:
      "Tenders, specs, invoices and RFQs read, understood and turned into a priced response in minutes.",
    body:
      "Quotation is where most operations quietly lose margin: slow turnaround, inconsistent pricing, and estimators reading the same 80-page spec for the fourth time.\n\nWe build the reader. It extracts scope, matches it against your rate card and past jobs, flags the clauses that changed, and produces a first-pass quotation your estimator corrects instead of writes.",
    features: [
      "Scope extraction from unstructured tenders",
      "Rate-card and historical-job matching",
      "Risk and clause-change flagging",
      "First-pass quotation with margin bands",
    ],
    outcomes: [
      { label: "Quote turnaround", value: "Days → hours" },
      { label: "Pricing consistency", value: "Standardised" },
    ],
  },
  {
    slug: "autonomous-agents",
    title: "Autonomous Task Agents",
    kicker: "Stage 03 · AI Execute",
    stage: 3,
    glyph: "agent",
    summary:
      "Bounded tasks handed over completely. The agent owns the outcome; your team owns approvals and exceptions.",
    body:
      "Execution only follows a period of assisted operation where the task was measurably done well. We define the boundary, the escalation triggers, and the rollback path — then the agent runs.\n\nWhat changes is not headcount but attention: people stop producing routine output and start handling the cases that genuinely need judgement.",
    features: [
      "Explicit task boundaries and stop conditions",
      "Escalation and exception routing to humans",
      "Rollback and replay on every action",
      "Per-agent accuracy and cost telemetry",
    ],
    outcomes: [
      { label: "Routine tasks owned", value: "End-to-end" },
      { label: "Human role", value: "Approve & except" },
    ],
  },
  {
    slug: "ai-departments",
    title: "AI Departments",
    kicker: "Stage 04 · AI Workforce",
    stage: 4,
    glyph: "dept",
    summary:
      "Multiple agents working as a team — with roles, hand-offs, a supervisor and a performance review.",
    body:
      "A department is not a bigger agent. It is a set of specialised roles that pass work between them, a supervisor that resolves conflict, and a shared memory of how the business actually operates.\n\nWe stand these up the way you would stand up a human department: define the roles, write the operating procedure, set the service levels, then review performance on a cadence.",
    features: [
      "Role-specialised agents with hand-off contracts",
      "Supervisor agent for conflict and prioritisation",
      "Shared institutional memory",
      "Service levels and weekly performance review",
    ],
    outcomes: [
      { label: "Routine intervention", value: "Minimal" },
      { label: "Operating model", value: "Transformed" },
    ],
  },
  {
    slug: "evolution-retainer",
    title: "Evolution Retainer",
    kicker: "Stage 05 · Continuous Evolution",
    stage: 5,
    glyph: "loop",
    summary:
      "The capability keeps moving. New models, new tooling, new process gains — folded in before they become a competitor's advantage.",
    body:
      "Capability decays. A workforce designed around this year's models is next year's legacy system, and the gap compounds quietly.\n\nThe retainer keeps your stack current: we re-benchmark models, retire what has been superseded, widen the scope of what agents own, and report on where the next margin is hiding.",
    features: [
      "Quarterly model and tooling re-benchmark",
      "Continuous process-gain discovery",
      "Scope expansion for existing agents",
      "Board-level capability reporting",
    ],
    outcomes: [
      { label: "Cadence", value: "Quarterly" },
      { label: "Objective", value: "Stay ahead" },
    ],
  },
];

const hasService = db.prepare("SELECT id FROM services WHERE slug = ?");
const insertService = db.prepare(
  `INSERT INTO services (slug, title, kicker, summary, body, stage, glyph, features, outcomes, orderIndex, published)
   VALUES (@slug, @title, @kicker, @summary, @body, @stage, @glyph, @features, @outcomes, @orderIndex, 1)`,
);
let servicesAdded = 0;
for (const [i, s] of services.entries()) {
  if (hasService.get(s.slug)) continue;
  insertService.run({
    ...s,
    features: JSON.stringify(s.features),
    outcomes: JSON.stringify(s.outcomes),
    orderIndex: i,
  });
  servicesAdded++;
}

/* ---------------------------------------------------------------- projects
 * InsureSAAS is the live case study, with its showreel in /public/work.
 * The sector samples below it ship unpublished — switch them on from
 * /admin/work if you want them back.
 */

const projects = [
  {
    slug: "insuresaas",
    title: "An insurance brokerage, run from one portal",
    client: "InsureSAAS",
    industry: "Insurance brokerage",
    year: "2026",
    stage: 1,
    featured: 1,
    published: 1,
    cover: "/work/insuresaas/poster.webp",
    video: "/work/insuresaas/reel-16x9.mp4",
    logo: "/work/insuresaas/logo.png",
    accent: "#38A3E0",
    summary:
      "Quotations, underwriting, claims, renewals and commissions for an insurance broker, in one web portal instead of inboxes and spreadsheets.",
    challenge:
      "Broking work was spread across email and spreadsheets. Quote requests went out to insurers one message at a time and came back in different formats, claim progress lived in people's heads, and renewals were caught when someone remembered them.",
    approach:
      "We built InsureSAAS as one portal with a module per job. Insurers get a secure link to submit their quote, responses land side by side, and the customer receives a single comparison to choose from. Underwriting holds every client and policy, with CSV and Excel import and export. Claims move through a 23-step tracker from intimation to payout, renewals surface by days remaining, and access is controlled per role and per approved device.",
    outcome:
      "Eighteen insurance lines, from motor to group medical, run through the same portal. Quote comparisons are generated from the insurers' own responses rather than assembled by hand, and every claim shows where it stands from filing to settlement.",
    tags: ["Quotations", "Claims", "Renewals", "Underwriting"],
    metrics: [
      { label: "Insurance lines in one portal", value: "18" },
      { label: "Steps in the claim tracker", value: "23" },
      { label: "Modules, one sign-in", value: "10" },
    ],
  },
  {
    published: 0,
    slug: "steel-fabrication-quotation-engine",
    title: "Quotation turnaround cut from six days to four hours",
    client: "Regional steel fabricator",
    industry: "Industrial manufacturing",
    year: "2025",
    stage: 2,
    featured: 1,
    summary:
      "An estimating team of four was the bottleneck on every tender. We automated the intake, then taught the system to read the drawings.",
    challenge:
      "Every incoming tender arrived as a PDF pack of drawings and specifications. Estimators re-keyed quantities into a spreadsheet, cross-checked a rate card that lived in three versions, and produced a quotation an average of six working days later. Roughly a third of tenders were abandoned for lack of capacity.",
    approach:
      "Stage one removed the manual intake: documents were parsed, logged and routed automatically, and the rate card was consolidated into a single governed source. Stage two introduced a copilot that extracted scope from the drawing pack, matched it to historical jobs, and produced a priced first draft with its assumptions listed. Estimators moved from writing quotations to correcting them.",
    outcome:
      "Turnaround fell to under four hours for standard packs. Tender coverage rose because capacity was no longer the constraint, and pricing variance between estimators effectively disappeared.",
    tags: ["Automate", "AI Assist", "Document intelligence"],
    metrics: [
      { label: "Quote turnaround", value: "6 days → 4 hrs" },
      { label: "Tenders answered", value: "+140%" },
      { label: "Pricing variance", value: "−92%" },
    ],
  },
  {
    published: 0,
    slug: "logistics-exception-desk",
    title: "An exception desk that runs itself overnight",
    client: "Freight forwarding group",
    industry: "Logistics",
    year: "2025",
    stage: 3,
    featured: 1,
    summary:
      "Three coordinators spent their mornings reconstructing what went wrong overnight. Now they arrive to a resolved queue and a short list of judgement calls.",
    challenge:
      "Shipment exceptions — delays, customs holds, documentation mismatches — surfaced across email, a carrier portal and two operational systems. Nothing was reconciled until a human did it, which meant every morning began with two hours of archaeology before any customer could be updated.",
    approach:
      "We integrated the carrier feeds and operational systems into a single event stream, then automated detection and classification of exceptions. Once classification accuracy held above target for a full quarter under supervision, resolution of the four highest-volume exception types was handed to autonomous agents, with anything ambiguous escalated to the coordinators.",
    outcome:
      "Routine exceptions are now resolved and communicated before the team logs in. Coordinators handle the genuinely unusual cases, and customer notification moved from reactive to same-event.",
    tags: ["Integration", "AI Execute", "Agents"],
    metrics: [
      { label: "Exceptions auto-resolved", value: "81%" },
      { label: "Morning triage", value: "2 hrs → 0" },
      { label: "Customer notification", value: "Same-event" },
    ],
  },
  {
    published: 0,
    slug: "clinic-group-back-office",
    title: "A back office department staffed by agents",
    client: "Multi-site clinic group",
    industry: "Healthcare services",
    year: "2026",
    stage: 4,
    featured: 0,
    summary:
      "Claims, scheduling and records administration restructured as an AI department with a human supervisor and published service levels.",
    challenge:
      "Growth from four sites to eleven multiplied administrative load faster than the group could hire for it. Claims were submitted late, scheduling conflicts surfaced only on the day, and record requests routinely missed their statutory window.",
    approach:
      "Automation and integration came first across all eleven sites. Assisted operation ran for two quarters while accuracy was measured per task. We then stood up four role-specialised agents — intake, claims, scheduling and records — coordinated by a supervisor agent, with a named human operations lead owning the service levels and reviewing performance weekly.",
    outcome:
      "Routine administration runs with minimal intervention. The operations lead reviews exceptions and performance rather than processing work, and the group added sites without adding back-office headcount.",
    tags: ["AI Workforce", "Departments", "Compliance"],
    metrics: [
      { label: "Sites supported", value: "11" },
      { label: "Back-office hires avoided", value: "6" },
      { label: "Statutory window met", value: "100%" },
    ],
  },
  {
    published: 0,
    slug: "distributor-continuous-evolution",
    title: "Two years in, still compounding",
    client: "FMCG distributor",
    industry: "Distribution",
    year: "2026",
    stage: 5,
    featured: 0,
    summary:
      "A retainer engagement where the measurable gain in year two was larger than the gain in year one.",
    challenge:
      "The initial automation programme delivered well and then plateaued, as they usually do. The operating model was frozen around the tooling available at the time it was built, while the market it served kept moving.",
    approach:
      "We moved the relationship to a quarterly evolution cycle: re-benchmark the models behind every agent, retire what has been superseded, hunt for new process gains in the telemetry, and widen agent scope where accuracy justifies it. Each quarter closes with a capability report to the board.",
    outcome:
      "Year-two gains exceeded year one. More usefully, the client now expects the operating model to change every quarter — which is the actual point of the retainer.",
    tags: ["Continuous Evolution", "Retainer"],
    metrics: [
      { label: "Year-two gain vs year one", value: "+118%" },
      { label: "Agents re-platformed", value: "9" },
      { label: "Review cadence", value: "Quarterly" },
    ],
  },
];

const hasProject = db.prepare("SELECT id FROM projects WHERE slug = ?");
const insertProject = db.prepare(
  `INSERT INTO projects (slug, title, client, industry, year, summary, challenge, approach, outcome,
   tags, metrics, stage, featured, orderIndex, published, cover, video, logo, accent)
   VALUES (@slug, @title, @client, @industry, @year, @summary, @challenge, @approach, @outcome,
   @tags, @metrics, @stage, @featured, @orderIndex, @published, @cover, @video, @logo, @accent)`,
);
let projectsAdded = 0;
for (const [i, p] of projects.entries()) {
  if (hasProject.get(p.slug)) continue;
  insertProject.run({
    ...p,
    tags: JSON.stringify(p.tags),
    metrics: JSON.stringify(p.metrics),
    orderIndex: i,
    published: p.published ?? 1,
    cover: p.cover ?? null,
    video: p.video ?? null,
    logo: p.logo ?? null,
    accent: p.accent ?? null,
  });
  projectsAdded++;
}

/* ---------------------------------------------------------------- testimonials
 * Placeholder copy attributed by role only. Replace with real, approved quotes
 * before going live.
 */

const testimonials = [
  {
    quote:
      "They spent three weeks refusing to sell us anything. By the time they proposed AI, they knew our process better than we did — and we had already got the hours back.",
    author: "Operations Director",
    role: "",
    company: "Industrial manufacturing client",
  },
  {
    quote:
      "The difference is that nothing was delegated to a machine until we had watched it be right for a quarter. That is why it stuck.",
    author: "Chief Operating Officer",
    role: "",
    company: "Logistics client",
  },
  {
    quote:
      "We stopped hiring for the back office and started hiring for the front. That was not the pitch, but it was the outcome.",
    author: "Managing Director",
    role: "",
    company: "Healthcare services client",
  },
];

const testimonialCount = db.prepare("SELECT COUNT(*) AS n FROM testimonials").get().n;
let testimonialsAdded = 0;
if (testimonialCount === 0) {
  // Seeded as DRAFTS on purpose: these are illustrative, not real client
  // quotes, so nothing fabricated can reach the live site by accident.
  const insertTestimonial = db.prepare(
    `INSERT INTO testimonials (quote, author, role, company, orderIndex, published)
     VALUES (@quote, @author, @role, @company, @orderIndex, 0)`,
  );
  for (const [i, t] of testimonials.entries()) {
    insertTestimonial.run({ ...t, orderIndex: i });
    testimonialsAdded++;
  }
}

console.log(`  stages       +${stagesAdded}`);
console.log(`  services     +${servicesAdded}`);
console.log(`  projects     +${projectsAdded}`);
console.log(`  testimonials +${testimonialsAdded}`);
console.log("\n  Seed complete. Sign in at /admin/login\n");

db.close();

/* ---------------------------------------------------------------- helpers */

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i.exec(line);
    if (!m) continue;
    const value = m[2].replace(/^["']|["']$/g, "");
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}
