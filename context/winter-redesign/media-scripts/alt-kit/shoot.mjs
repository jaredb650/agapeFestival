// usage: node shoot.mjs <mode: ref|port> <url> <outdir>
// ref  = element crops of the c9688b5 originals on https://winter-redesign.agapefestival.pages.dev/
// port = the same elements on the /kit/red-hybrid showcase, red + blue palettes, plus full-page sheets
import { createRequire } from "module";
import fs from "fs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.HOME + "/.cache/pw-tools/node_modules/playwright");
const [, , mode, url, outdir] = process.argv;
fs.mkdirSync(outdir, { recursive: true });

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const log = (...a) => console.log(...a);

async function shotEl(page, name, selector, { padX = 0, padY = 0, index = 0, wait = 2200, block = "center" } = {}) {
  const loc = page.locator(selector).nth(index);
  if (!(await loc.count())) return log("MISSING", name, selector);
  await loc.evaluate((el, b) => el.scrollIntoView({ block: b, behavior: "instant" }), block).catch(() => {});
  await page.waitForTimeout(wait);
  const bb = await loc.boundingBox();
  if (!bb) return log("NOBOX", name);
  const vw = page.viewportSize();
  const clip = { x: Math.max(0, bb.x - padX), y: Math.max(0, bb.y - padY) };
  clip.width = Math.min(vw.width - clip.x, bb.width + padX * 2);
  clip.height = Math.min(vw.height - clip.y, bb.height + padY * 2);
  const path = `${outdir}/${name}.png`;
  await page.screenshot({ path, clip });
  log("saved", path);
}

async function newPage(width, height, mobile) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => log("PAGEERROR", e.message));
  page.on("console", (m) => m.type() === "error" && log("CONSOLE", m.text().slice(0, 200)));
  return page;
}

if (mode === "ref") {
  const page = await newPage(1440, 900, false);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(9000);
  await page.screenshot({ path: `${outdir}/hero.png` });
  log("saved hero");
  for (const [n, s] of [["seg", ".wh-lcd"], ["cta", ".wh__cta"], ["chip", ".wh-chip"]]) await shotEl(page, n, s, { padX: 14, padY: 14, wait: 300, block: "nearest" });
  await shotEl(page, "terminal", ".tk-term", { wait: 3500, block: "start" });
  await shotEl(page, "window-chrome", ".tk-win", { wait: 600, padX: 4, padY: 4 });
  // the HUD bar, scrolled (solid)
  await page.screenshot({ path: `${outdir}/hudbar.png`, clip: { x: 0, y: 0, width: 1440, height: 100 } });
  await shotEl(page, "armory", ".wmx-stage", { wait: 3000, padX: 6, padY: 6 });
  await shotEl(page, "chip-slant", ".wmx-kicker__chip", { wait: 300, padX: 8, padY: 8 });
  await shotEl(page, "lcd-merch", ".wmx-lcd", { wait: 300, padX: 6, padY: 6 });
  await shotEl(page, "hudbezel", ".wfq__shell", { wait: 3000, padX: 4, padY: 4 });
  await shotEl(page, "key", ".wfq__key", { wait: 400, padX: 10, padY: 8 });
  await shotEl(page, "lcd-faq", ".wfq__lcd", { wait: 300, padX: 6, padY: 6 });
  await shotEl(page, "orbs", ".wfq__orbs", { wait: 300, padX: 8, padY: 8 });
  await shotEl(page, "housing", ".wlk-unit", { wait: 2500, padX: 6, padY: 6 });
  await shotEl(page, "railbezel", ".wgh-panel", { wait: 3800, padX: 24, padY: 22 });
  await shotEl(page, "sockets", ".wft__slots", { wait: 2500, padX: 10, padY: 10 });
  await shotEl(page, "footer-bezel", ".wft__shell", { wait: 600, padX: 4, padY: 4 });
  // floating CTA rig over the lineup
  await page.evaluate(() => document.querySelector("#lineup")?.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(2500);
  await shotEl(page, "ctarig", ".wcta", { wait: 300, padX: 120, padY: 40, block: "nearest" });
  await page.close();

  const m = await newPage(390, 844, true);
  await m.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await m.waitForTimeout(9000);
  await m.screenshot({ path: `${outdir}/m-hero.png` });
  await m.click(".whud__menu", { timeout: 5000 }).catch((e) => log("click", e.message));
  await m.waitForTimeout(1800);
  await m.screenshot({ path: `${outdir}/m-menu.png` });
  await shotEl(m, "mechwindow", ".whud-menu__win", { wait: 200, padX: 16, padY: 12, block: "nearest" });
  await shotEl(m, "notch", ".whud-menu__notch", { wait: 200, padX: 10, padY: 6, block: "nearest" });
  await shotEl(m, "holokey", ".whud-menu__close", { wait: 200, padX: 8, padY: 6, block: "nearest" });
} else {
  for (const palette of ["red", "blue"]) {
    const page = await newPage(1440, 900, false);
    await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
    if (palette === "blue") await page.getByRole("button", { name: "Original blue" }).click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${outdir}/${palette}-top.png` });
    const p = (n) => `${palette}-${n}`;
    await shotEl(page, p("hudbar"), ".rhk-bar", { wait: 400, block: "start" });
    await shotEl(page, p("hero"), ".rhk-th-host", { wait: 2600 });
    await shotEl(page, p("seg"), ".rhk-th-host .rhk-seg", { wait: 300, padX: 14, padY: 14 });
    await shotEl(page, p("cta"), ".rhk-th-host .rhk-hb", { wait: 300, padX: 14, padY: 14 });
    await shotEl(page, p("chip"), ".rhk-hchip", { wait: 300, padX: 14, padY: 14 });
    await shotEl(page, p("hudbezel"), ".rhk-bz-host", { wait: 1800, padX: 4, padY: 4 });
    await shotEl(page, p("key"), ".rhk-key", { index: 1, wait: 300, padX: 10, padY: 8 });
    await shotEl(page, p("armory"), ".rhk-pb", { wait: 1500, padX: 6, padY: 6 });
    await shotEl(page, p("chip-slant"), ".rhk-pb .rhk-chip", { wait: 300, padX: 8, padY: 8 });
    await shotEl(page, p("window-chrome"), ".rhk-pb .rhk-win", { wait: 300, padX: 4, padY: 4 });
    await shotEl(page, p("railbezel"), ".rhk-rb-host", { wait: 2800, padX: 24, padY: 22 });
    await shotEl(page, p("terminal"), ".rhk-tf", { wait: 1800 });
    await page.mouse.move(2, 2);
    await shotEl(page, p("mechwindow"), ".rhk-mw", { wait: 2200, padX: 24, padY: 14 });
    await shotEl(page, p("windows"), '[data-item="GlassWindow"] .kit-item__stage', { wait: 600 });
    await shotEl(page, p("notch"), ".kit-item__stage .rhk-notch", { wait: 1600, padX: 10, padY: 6 });
    await shotEl(page, p("plates"), '[data-item="ChromePlate"] .kit-row', { wait: 400, padX: 8, padY: 8 });
    await shotEl(page, p("sockets"), '[data-item="ChromeKey + ChromeSocket"] .kit-row', { wait: 400, padX: 10, padY: 10 });
    await shotEl(page, p("housing"), ".kit-housing", { wait: 1600, padX: 6, padY: 6 });
    await shotEl(page, p("orbs"), '[data-item="Orb"] .kit-row', { wait: 400, padX: 8, padY: 8 });
    await shotEl(page, p("lcds"), '[data-item="Lcd + SegmentLcd"] .kit-item__stage', { wait: 600 });
    await shotEl(page, p("buttons"), '[data-item="HoloButton"] .kit-row', { wait: 600, padX: 8, padY: 8 });
    await page.hover('[data-item="HoloButton"] .rhk-hb--primary >> nth=0').catch(() => {});
    await page.waitForTimeout(120);
    await shotEl(page, p("buttons-hover"), '[data-item="HoloButton"] .kit-row', { wait: 80, padX: 8, padY: 8 });
    await page.mouse.move(5, 5);
    await shotEl(page, p("ctarig"), ".kit-item__stage .rhk-rig", { wait: 1600, padX: 120, padY: 40 });
    await shotEl(page, p("keys"), '[data-item="CtaRig + HoloKey + HudChip"] .kit-row >> nth=1', { wait: 400, padX: 8, padY: 8 });
    await shotEl(page, p("frames"), '[data-item="Frame + HudLabel + Grain"] .kit-item__stage', { wait: 600 });
    await shotEl(page, p("dropin"), '[data-item="Drop-in: a classic .k-panel in a HudBezel"] .kit-item__stage', { wait: 1800 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${outdir}/${palette}-sheet.png`, fullPage: true });
    log("saved sheet", palette);
    await page.close();
  }
  const m = await newPage(390, 844, true);
  await m.goto(url, { waitUntil: "networkidle", timeout: 120000 });
  await m.waitForTimeout(2500);
  await m.screenshot({ path: `${outdir}/m-red-sheet.png`, fullPage: true });
  log("saved mobile sheet");
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  log("mobile horizontal overflow px:", overflow);
}
await browser.close();
