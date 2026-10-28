/**
 * Retina full-page captures of client websites for the project reels.
 *
 *   node sites.mjs [slug ...]      # default: every project below
 *
 * For each page it writes  ../public/<slug>/<page>.jpg  (1440 css px wide, 2x)
 * and records the page-coordinate box of every heading, button and link with
 * short text into  ../public/<slug>/rects.json  so the reels can aim the
 * cursor and highlights at real elements instead of guessed pixels.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const CHROME = "C:/Users/MSI/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe";
const OUT = path.resolve("../public");

// Max page height kept (css px). Long pages are cut; reels never pan further.
const MAX_H = 5200;

const PROJECTS = {
  ceilao: {
    base: "https://ceilao-website-ochre.vercel.app",
    pages: { home: "/", login: "/login", learn: "/learn", life: "/life-insurance" },
  },
  araksha: {
    base: "https://araksha-website.vercel.app",
    pages: { home: "/", insurance: "/insurance", partners: "/partners", login: "/login" },
  },
  pmf: {
    base: "http://localhost:3200",
    pages: { home: "/", login: "/login", learn: "/learn", general: "/general-insurance" },
  },
  ascend: {
    base: "https://the-ascend.vercel.app",
    pages: { home: "/", services: "/services", program: "/program", about: "/about" },
  },
  powermate: {
    base: 'https://power-mate-investments.vercel.app',
    pages: { home: '/en', products: '/en/products', branches: '/en/branches', about: '/en/about', contact: '/en/contact' },
  },
  bot: {
    base: "https://aptbot-panel.vercel.app",
    pages: { login: "/login" },
  },
  apt: {
    base: "https://aptfunnel.vercel.app",
    pages: { home: "/", text: "/text" },
    // The booking flow, driven up to (never past) the final confirm button.
    flows: {
      home: [
        { name: "day", click: "button:has-text('29')" },
        { name: "slot", click: "button:has-text('3:15')" },
        { name: "details", click: "button:has-text('Next →'):visible" },
        // Demo entries typed for the shot; the form is never submitted.
        { name: "filled", fill: [["[name=name]", "Alex Morgan"], ["[name=clubgg]", "AlexM_GG"], ["[name=email]", "alex@example.com"], ["[name=handle]", "@alexm"], ["[name=note]", "New to ClubGG, want to get set up this week."]] },
      ],
    },
  },
};

const only = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

/** Walk the page so lazy images load and scroll reveals fire, then settle. */
async function settle(page) {
  await page.evaluate(() => document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager")));
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 200) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 260));
    }
    scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.evaluate(async () => {
    await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
  });
  await page.waitForTimeout(3500);
}

/** Boxes (page coords) of headings and short-text controls. */
function collectRects(page) {
  return page.evaluate(() => {
    const out = [];
    const pick = "h1,h2,h3,h4,a,button,input,label,[role=button]";
    for (const el of document.querySelectorAll(pick)) {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      const text = (el.innerText || el.getAttribute("placeholder") || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
      if (!text || text.length > 90) continue;
      out.push({ tag: el.tagName.toLowerCase(), text, x: Math.round(r.x + scrollX), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) });
    }
    // Short text leaves (stats, labels, card titles in divs/spans).
    for (const el of document.querySelectorAll("p,span,div,li,strong,dt,dd")) {
      if (el.children.length) continue;
      const text = (el.innerText || "").replace(/s+/g, " ").trim();
      if (!text || text.length > 40) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      out.push({ tag: el.tagName.toLowerCase(), text, x: Math.round(r.x + scrollX), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) });
    }
    return out;
  });
}

async function shoot(page, file) {
  const h = Math.min(await page.evaluate(() => document.documentElement.scrollHeight), MAX_H);
  await page.screenshot({ path: file, type: "jpeg", quality: 88, fullPage: h > 900, clip: h > 900 ? { x: 0, y: 0, width: 1440, height: h } : undefined });
  return h;
}

for (const [slug, cfg] of Object.entries(PROJECTS)) {
  if (only.length && !only.includes(slug)) continue;
  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  const rects = {};
  for (const [name, route] of Object.entries(cfg.pages)) {
    const page = await ctx.newPage();
    try {
      await page.goto(cfg.base + route, { waitUntil: "domcontentloaded", timeout: 90000 });
      await page.waitForTimeout(2500);
      await settle(page);
      const h = await shoot(page, path.join(dir, `${name}.jpg`));
      rects[name] = { w: 1440, h, items: await collectRects(page) };
      console.log(`${slug}/${name}  ${h}px  ${rects[name].items.length} rects`);

      for (const step of cfg.flows?.[name] ?? []) {
        if (step.click) await page.click(step.click, { timeout: 10000 });
        for (const [sel, val] of step.fill ?? []) await page.locator(sel).fill(val).catch(() => {});
        await page.waitForTimeout(1200);
        const sh = await shoot(page, path.join(dir, `${name}-${step.name}.jpg`));
        rects[`${name}-${step.name}`] = { w: 1440, h: sh, items: await collectRects(page) };
        console.log(`${slug}/${name}-${step.name}  ${sh}px`);
      }
    } catch (e) {
      console.warn(`! ${slug}/${name}: ${e.message.split("\n")[0]}`);
    }
    await page.close();
  }
  fs.writeFileSync(path.join(dir, "rects.json"), JSON.stringify(rects));
}
await browser.close();
