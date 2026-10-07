// Final capture: retina screenshots of the real InsureSAAS UI + bounding boxes
// of the elements the video animates (cards, buttons, rows, cursor targets).
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('../assets/screens');
fs.mkdirSync(OUT, { recursive: true });
const rects = {};

const srv = await serve();
const browser = await chromium.launch({ executablePath: process.env.LOCALAPPDATA + '/ms-playwright/chromium-1223/chrome-win64/chrome.exe' });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })).newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
const B = 'http://localhost:4321';
const box = async (loc) => { const b = await loc.boundingBox(); return b && { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
const shot = async (name) => { await page.mouse.move(-10, -10); await page.waitForTimeout(500); await page.screenshot({ path: path.join(OUT, name + '.png') }); console.log('shot', name); };
// Kill the app's own enter animations so every capture is a settled frame.
const still = () => page.addStyleTag({ content: '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important;caret-color:transparent!important}' });

// 1 — Login
await page.goto(B + '/login'); await still(); await page.waitForTimeout(1200);
rects.login = { card: await box(page.locator('form').locator('xpath=ancestor::div[contains(@class,"MuiBox")][2]').first()) };
await shot('login');

// 2 — Module menu (assembles card by card)
await page.evaluate(() => sessionStorage.setItem('mock_user', '1'));
await page.goto(B + '/menu'); await still(); await page.waitForTimeout(1500);
const titles = ['Quotations', 'Underwriting', 'Claims', 'Accounting', 'Reports', 'Renewals Tracker', 'Commission Structures', 'Marketing', 'Portfolio Review'];
rects.menu = { cards: [] };
for (const t of titles) {
  rects.menu.cards.push(await box(page.getByText(t, { exact: true }).first().locator('xpath=ancestor::div[contains(@class,"MuiBox-root") and string-length(@class)>0][2]')));
}
rects.menu.greeting = await box(page.getByText(/Good (morning|afternoon|evening)/).first());
await shot('menu');

// 3 — Underwriting table (also used for the search-typing feature)
await page.getByText('Underwriting', { exact: true }).first().click(); await still(); await page.waitForTimeout(1800);
rects.uw = {
  sidebar: await box(page.locator('nav, .MuiDrawer-paper').first()),
  search: await box(page.getByPlaceholder(/Search by name/)),
  addClient: await box(page.getByRole('button', { name: 'Add Client' })),
  table: await box(page.locator('table').first()),
  rows: [],
};
const rows = page.locator('table tbody tr');
for (let i = 0; i < 8; i++) rects.uw.rows.push(await box(rows.nth(i)));
await shot('uw');
const q = 'Dialog';
await page.getByPlaceholder(/Search by name/).click();
for (let i = 1; i <= q.length; i++) {
  await page.getByPlaceholder(/Search by name/).fill(q.slice(0, i));
  await page.waitForTimeout(450);
  await shot('uw-search-' + i);
}

// 4 — Quotations → Compare
await page.getByPlaceholder(/Search by name/).fill('');
await page.getByText('Quotations', { exact: true }).first().click(); await still(); await page.waitForTimeout(1500);
await page.getByText(/^Compare \(/).click(); await page.waitForTimeout(900);
rects.quotes = {
  stats: await box(page.getByText('Sent', { exact: true }).first().locator('xpath=..')),
  compareBtn: await box(page.getByRole('button', { name: 'Compare' }).nth(3)),
};
await shot('quotes');
await page.getByRole('button', { name: 'Compare' }).nth(3).click(); await page.waitForTimeout(1500);
rects.quotes.table = await box(page.locator('table').first());
rects.quotes.total = await box(page.getByText('Total Premium (LKR)').first().locator('xpath=ancestor::tr'));
await shot('quotes-compare');

// 5 — Claims → expand a settled claim
await page.getByText('Claims', { exact: true }).first().click(); await still(); await page.waitForTimeout(1500);
rects.claims = {
  stats: await box(page.getByText('Filed', { exact: true }).first().locator('xpath=../..')),
  target: await box(page.getByText('CLM-2026-0084')),
};
await shot('claims');
await page.getByText('CLM-2026-0084').click(); await page.waitForTimeout(1200);
await shot('claims-open');

// 6 — Renewals tracker
await page.getByText('Renewals', { exact: true }).first().click(); await still(); await page.waitForTimeout(1500);
rects.renewals = { table: await box(page.locator('table').first()) };
await shot('renewals');

fs.writeFileSync(path.resolve('../assets/rects.json'), JSON.stringify(rects, null, 2));
fs.copyFileSync('D:/InsureSAAS/InsureSAAS/frontend/src/InsureSAAS Logo.png', path.resolve('../assets/logo.png'));
await browser.close(); srv.close();
console.log(JSON.stringify(rects, null, 1));
