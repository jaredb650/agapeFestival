// The SYSTEM BOOT runtime. Serialised with Function#toString into an inline
// <script> that runs while the HTML is still parsing (before React, before any
// bundle), so it must stay SELF-CONTAINED: no imports, no outer variables, no
// helpers. Types only. The overlay lives in a dangerouslySetInnerHTML host,
// which hydration leaves alone, so the script may mutate and remove it freely.
//
// What it does:
//  - Flags the overlay (data-js; data-fast on a repeat visit this session)
//    before first paint.
//  - Holds the page's own CSS intros: inserts a tiny sheet (c.holdCss) that
//    parks the hero + nav animations before they are even parsed, and removes
//    it at the handover. Nothing touches React-owned elements.
//  - Tracks real readiness: document fonts, the hero poster and festival logo
//    decoded, window load, the scroll-scrub engine (or its poster) requested.
//  - Drives the pixel LCD counter, gauge, umlaut dots and log statuses from a
//    smoothed, monotonic progress value: never faster than `min`, never past
//    `max`, never backwards. A 20 Hz timer, only while booting (no rAF: a
//    pending rAF forces a main-thread frame every vsync); DOM writes only when
//    a value changes, the gauge glides between them with a CSS transition.
//  - Exits with the stow + hatch doors (CSS), releases the page intro (event +
//    window.__wboot) as the doors part, then removes the overlay and every
//    listener/observer/timer it started.
import type { BootState } from "./boot";

export interface BootConfig {
  /** Minimum time on screen before exiting, ms. */
  min: number;
  /** Hard cap: exit even if assets are slow, ms. */
  max: number;
  /** sessionStorage key for repeat visits. */
  key: string;
  /** Window event fired at handover. */
  ev: string;
  /** Sheet that parks the page's CSS intros until the handover. */
  holdCss: string;
  /** Task weights: fonts, poster, logo, page load, scrub engine. Sum 1. */
  w: number[];
  /** When each log line has finished typing (CSS), ms after first paint. */
  lines: number[];
  /** Exit timings, ms: [stow before the doors part, full exit length, quick exit length]. */
  exit: [number, number, number];
}

export function wBoot(c: BootConfig): void {
  const d = document;
  const w = window;
  const found = d.getElementById("wboot");
  if (!found) return;
  const root: HTMLElement = found;
  const now = () => performance.now();
  // Re-based on the first frame (when the overlay and its CSS timeline first paint).
  let t0 = now();
  let started = false;
  const state: BootState = { done: false, at: 0 };
  w.__wboot = state;

  let seen = false;
  try {
    seen = sessionStorage.getItem(c.key) === "1";
    sessionStorage.setItem(c.key, "1");
  } catch {
    /* storage blocked: treat as a first visit */
  }
  const reduced = !!w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fast = seen || d.visibilityState === "hidden";
  root.setAttribute("data-js", "");
  if (fast) root.setAttribute("data-fast", "");

  // ---- hold the page intros (hero + nav) until the handover -------------------
  let hold: HTMLStyleElement | null = null;
  if (!fast && !reduced && root.parentNode) {
    hold = d.createElement("style");
    hold.textContent = c.holdCss;
    root.parentNode.insertBefore(hold, root);
  }

  const all = (s: string) => Array.prototype.slice.call(root.querySelectorAll(s)) as Element[];
  const digits = all("[data-dg]");
  const lines = all("[data-ln]");
  const orbs = all("[data-orb]");
  const pips = all("[data-pip]");
  const count = root.querySelector("[data-count]");
  const fill = root.querySelector("[data-fill]") as HTMLElement | null;

  const ok = [false, false, false, false, false];
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => {
    timers.push(w.setTimeout(fn, ms));
  };
  let shown = 0;
  let pct = -1;
  let logged = 0;
  let tick = 0;
  let last = t0;
  let frameNo = 0;
  let exiting = false;

  // ---- display (only on change) ------------------------------------------------
  const paint = (p: number) => {
    const n = Math.min(100, Math.floor(p * 100 + 1e-6));
    if (n === pct) return;
    pct = n;
    const s = ("00" + n).slice(-3);
    const lead = n < 10 ? 2 : n < 100 ? 1 : 0;
    for (let i = 0; i < digits.length; i++) {
      digits[i].setAttribute("href", "#wbg" + s.charAt(i));
      if (i < lead) digits[i].setAttribute("data-lead", "");
      else digits[i].removeAttribute("data-lead");
    }
    if (fill) fill.style.transform = "translate3d(" + (n - 100) + "%,0,0)";
    // The umlaut dots light in chrome at 50 % and at 100 %.
    if (n >= 50 && orbs[0]) orbs[0].setAttribute("data-lit", "");
  };

  const logLine = (i: number) => {
    lines[i].setAttribute("data-ok", "");
    if (pips[i]) pips[i].setAttribute("data-on", "");
    if (count) count.textContent = String(i + 1);
  };

  // ---- readiness -------------------------------------------------------------
  const mark = (i: number) => {
    ok[i] = true;
  };
  const decoded = (sel: string, i: number) => {
    const img = d.querySelector(sel) as HTMLImageElement | null;
    if (!img) return mark(i);
    const fin = () => mark(i);
    if (img.decode) img.decode().then(fin, fin);
    else if (img.complete) fin();
    else {
      img.addEventListener("load", fin);
      img.addEventListener("error", fin);
    }
  };
  const wire = () => {
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(() => mark(0), () => mark(0));
    else mark(0);
    decoded(".wh__img", 1);
    decoded(".wh__logo img", 2);
  };
  const onLoad = () => mark(3);
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", wire, { once: true });
  else wire();
  if (d.readyState === "complete") mark(3);
  else w.addEventListener("load", onLoad, { once: true });

  // ---- input: any key, wheel, click or touch skips to the quick exit ----------
  const evs = ["keydown", "wheel", "pointerdown", "touchstart"];
  const skip = () => {
    if (now() - t0 > 120) exit(true);
  };
  evs.forEach((e) => w.addEventListener(e, skip, { passive: true, capture: true }));

  // ---- handover ---------------------------------------------------------------
  const release = () => {
    if (state.done) return;
    state.done = true;
    state.at = now();
    if (hold) hold.remove();
    hold = null;
    try {
      w.dispatchEvent(new Event(c.ev));
    } catch {
      /* very old engines: the page's fallback timer starts the intro */
    }
  };
  const remove = () => {
    release();
    clearTimeout(tick);
    evs.forEach((e) => w.removeEventListener(e, skip, { capture: true }));
    w.removeEventListener("load", onLoad);
    d.removeEventListener("DOMContentLoaded", wire);
    timers.forEach((t) => clearTimeout(t));
    root.remove();
    const js = d.getElementById("wboot-js");
    if (js) js.remove();
  };
  function exit(quick: boolean) {
    if (exiting) return;
    exiting = true;
    clearTimeout(tick);
    shown = 1;
    paint(1);
    for (let i = logged; i < lines.length; i++) logLine(i);
    logged = lines.length;
    for (let i = 0; i < orbs.length; i++) orbs[i].setAttribute("data-lit", "");
    root.setAttribute("data-ready", "");
    const mode = reduced ? "fade" : quick ? "quick" : "full";
    root.setAttribute("data-exit", mode);
    const [gap, full, short] = c.exit;
    later(release, mode === "full" ? gap : 0);
    later(remove, mode === "full" ? full : short);
  }

  // ---- the loop (only while booting) -------------------------------------------
  const frame = () => {
    tick = 0;
    const ts = now();
    const t = ts - t0;
    const dt = Math.min(64, Math.max(0, ts - last));
    last = ts;
    // The scrub engine (or, without it, the background poster) has been requested.
    if (!ok[4] && (frameNo++ & 3) === 0 && (w.__winterBg || d.querySelector(".wbg__poster"))) mark(4);

    let done = 0;
    let pend = 0;
    for (let i = 0; i < ok.length; i++) {
      if (ok[i]) done += c.w[i];
      else pend += c.w[i];
    }
    // Pending work earns slow partial credit so the count never stalls; it can't reach 100 until all is real.
    let goal = done + pend * 0.7 * (1 - Math.exp(-t / 1100));
    if (t >= c.max - 420) goal = 1;
    goal = Math.min(goal, t / c.min);
    if (goal > shown) shown += (goal - shown) * (1 - Math.exp(-dt / 85));
    if (goal >= 1 && shown > 0.994) shown = 1;

    paint(shown);
    // Log statuses land in order, each once its line has typed and its task is real.
    while (logged < lines.length && ok[logged] && t >= c.lines[logged]) logLine(logged++);

    if ((shown >= 1 && logged >= lines.length) || t >= c.max) {
      root.setAttribute("data-ready", "");
      if (orbs[1]) orbs[1].setAttribute("data-lit", "");
      // A beat for the second dot to light, then the handover.
      later(() => exit(false), 150);
      return;
    }
    tick = w.setTimeout(frame, 50);
  };

  later(() => exit(false), c.max + 200); // safety net if rAF never runs (hidden tab)
  if (fast) {
    exit(true);
  } else {
    paint(0);
    // The clock starts at the first frame (when the overlay and its CSS timeline first paint).
    requestAnimationFrame((ts) => {
      if (started || exiting) return;
      started = true;
      t0 = last = ts;
      frame();
    });
  }
}
