import { chromium } from "playwright";
const out = process.argv[2], url = process.argv[3] || "http://localhost:3000/";
const b = await chromium.launch({ executablePath: "C:/Users/MSI/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe" });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await p.goto(url, { waitUntil: "load", timeout: 90000 });
await p.waitForTimeout(4000);
// reveal everything
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); });
await p.evaluate(() => document.querySelectorAll("[data-reveal], .split").forEach(e => e.classList.add("is-in"))); await p.waitForTimeout(2500);
const h = await p.evaluate(() => document.documentElement.scrollHeight);
console.log("height", h);
const n = Math.ceil(h / 1600);
for (let i = 0; i < n; i++) {
  await p.screenshot({ path: `${out}-${i}.png`, fullPage: true, clip: { x: 0, y: i * 1600, width: 390, height: Math.min(1600, h - i * 1600) } });
}
await b.close();
