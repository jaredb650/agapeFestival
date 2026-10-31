// The preloader runtime. Serialised with Function#toString into an inline
// <script> that runs while the HTML is still parsing (before React, before any
// bundle), so it must stay SELF-CONTAINED: no imports, no outer variables, no
// helpers. Types only. The overlay lives in a dangerouslySetInnerHTML host,
// which hydration leaves alone, so the script may mutate and remove it freely.
//
// What it does:
//  - Flags the overlay (data-js; data-fast on a back/forward return)
//    before first paint, and parks the hero + nav CSS intros (c.hold) until the
//    handover. Nothing touches React-owned elements.
//  - Finds the hero logo <img> ([data-boot-logo] img, else the #hero img whose
//    src says "logo"), copies it into the slit (same URL + srcset: the same
//    request) and lays the hairline across its centre line.
//  - Tracks real readiness: fonts, hero poster and logo copy decoded, window
//    load, the scroll background requested. The hairline's width shows it: never
//    full before `min`, forced full by `max`, never backwards. A 20 Hz timer
//    only while booting (no rAF loop); a write only when the value moves.
//  - Exits: the slit opens onto the logo copy and the hairline falls into the
//    hero divider ([data-boot-divider], else #hero .winter-divider); the page
//    intro is released (event + window.__wboot) as the black lifts, and the
//    logo's own entrance is skipped to its end (the slit was its entrance). The
//    copy and hairline stay until the hero's logo and divider have finished any
//    entrance (capped), dissolve into them, and the overlay is removed with
//    every listener and timer it started.
import type { BootState } from "./boot";

export interface BootConfig {
  /** Minimum time on screen before exiting, ms. */
  min: number;
  /** Hard cap: exit even if assets are slow, ms. */
  max: number;
  /** Window event fired at handover. */
  ev: string;
  /** Sheet that parks the page's CSS intros until the handover. */
  hold: string;
  /** Readiness weights: fonts, hero poster, hero logo, window load, scroll background. Sum 1. */
  w: number[];
  /** Exit timings, ms: [handover into the full exit, full exit motion, quick exit, longest wait for the hero's own logo/divider entrance]. */
  x: number[];
}

export function wBoot(c: BootConfig): void {
  const d = document;
  const w = window;
  const found = d.getElementById("wboot");
  if (!found) return;
  const root: HTMLElement = found;
  const now = () => performance.now();
  const state: BootState = { done: false, at: 0, logo: false };
  w.__wboot = state;

  // Every load plays the full boot, reloads included (Jared: a hard refresh should replay it). Only a
  // back/forward return gets the quick fade.
  let seen = false;
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    seen = nav?.type === "back_forward";
  } catch {
    /* no Navigation Timing: treat as a first visit */
  }
  const reduced = !!w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fast = seen || d.visibilityState === "hidden";
  root.setAttribute("data-js", "");
  if (fast) root.setAttribute("data-fast", "");

  let hold: HTMLStyleElement | null = null;
  if (!fast && !reduced && root.parentNode) {
    hold = d.createElement("style");
    hold.textContent = c.hold;
    root.parentNode.insertBefore(hold, root);
  }

  const line = root.querySelector(".wb-ln") as HTMLElement;
  const bar = line.firstElementChild as HTMLElement;
  const slit = root.querySelector(".wb-sl") as HTMLElement;
  const ok = [false, false, false, false, false];
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => {
    timers.push(w.setTimeout(fn, ms));
  };
  let t0 = now();
  let tick = 0;
  let n = 0;
  let shown = 0;
  let exiting = false;
  let copied = false;
  let logo: HTMLImageElement | null = null;
  let divider: Element | null = null;
  // The hairline's first placement [left, centre y]; later fits glide from it by transform.
  let base: number[] | null = null;

  const mark = (i: number) => {
    ok[i] = true;
  };
  const decode = (img: HTMLImageElement | null, i: number, cb?: () => void) => {
    const fin = () => mark(i);
    if (img && img.decode)
      img.decode().then(() => {
        if (cb) cb();
        fin();
      }, fin);
    else fin();
  };
  const px = (v: number) => v + "px";
  /** On-screen box of an element, or null (missing, empty or scrolled away). */
  const box = (e: Element | null) => {
    const r = e && e.getBoundingClientRect();
    return r && r.width && r.bottom > 0 && r.top < innerHeight ? r : null;
  };
  /** Lay the edge-to-edge hairline across the hero logo's centre line (centred on it), `drop` px lower. */
  const fit = (drop: number) => {
    const r = box(logo);
    if (!r) return;
    const y = r.top + r.height / 2;
    if (!base) {
      base = [0, y];
      line.style.top = px(y);
    }
    line.style.transform = `translate(${px(r.left + r.width / 2 - innerWidth / 2)},${px(y - base[1] + drop)})`;
  };

  // The hero logo, copied into the slit: same src, srcset and sizes, so the same request and image.
  const find = () => {
    if (logo) return;
    logo = d.querySelector<HTMLImageElement>("[data-boot-logo] img,#hero img[src*=logo]");
    if (!logo) return;
    const k = logo.cloneNode() as HTMLImageElement;
    ["id", "class", "style", "loading"].forEach((a) => k.removeAttribute(a));
    k.alt = "";
    slit.insertBefore(k, slit.firstChild);
    decode(k, 2, () => {
      copied = true;
    });
    fit(0);
  };
  const wire = () => {
    find();
    if (!logo) mark(2);
    decode(d.querySelector<HTMLImageElement>("#hero img:not([src*=logo])"), 1);
    divider = d.querySelector("[data-boot-divider],#hero .winter-divider");
    const f = d.fonts;
    // Webfonts can move the hero block: refit once they are in.
    if (f && f.ready)
      f.ready.then(() => {
        mark(0);
        if (!exiting) fit(0);
      }, () => mark(0));
    else mark(0);
  };
  const onLoad = () => mark(3);
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", wire, { once: true });
  else wire();
  if (d.readyState === "complete") mark(3);
  else w.addEventListener("load", onLoad, { once: true });

  // ---- input: any key, wheel, click or touch skips to the quick fade ---------
  const evs = ["keydown", "wheel", "pointerdown", "touchstart"];
  const skip = () => {
    if (now() - t0 > 120) exit(true);
  };
  evs.forEach((e) => w.addEventListener(e, skip, { passive: true, capture: true }));

  // ---- scroll lock: loading at the hero, the page holds still until the hero's intro has played --------
  // Scrolling mid-intro drags the half-built lockup up through the hero's scroll exit. Inputs are cancelled
  // rather than setting overflow: hidden, which would drop the scrollbar and shift the layout.
  let unlock = () => {};
  if (!reduced && (w.scrollY || 0) < 8 && !location.hash) {
    const keys = [" ", "PageUp", "PageDown", "End", "Home", "ArrowUp", "ArrowDown", "Spacebar"];
    const lockOpts = { passive: false, capture: true } as AddEventListenerOptions;
    const stop = (e: Event) => {
      if (e.type !== "keydown" || keys.indexOf((e as KeyboardEvent).key) >= 0) e.preventDefault();
    };
    // Any scroll that still happens is the browser restoring a reload's position: not at the hero, so let go.
    const moved = () => {
      if (w.scrollY > 8) unlock();
    };
    const types = ["wheel", "touchmove", "keydown"];
    types.forEach((t) => w.addEventListener(t, stop, lockOpts));
    w.addEventListener("scroll", moved, { passive: true });
    unlock = () => {
      unlock = () => {};
      types.forEach((t) => w.removeEventListener(t, stop, lockOpts));
      w.removeEventListener("scroll", moved);
    };
    w.setTimeout(() => unlock(), c.max + 6000); // hard cap, whatever happens
  }

  // ---- handover ---------------------------------------------------------------
  /** The finite (entrance) animations on `e` and its ancestors; with `own`, only on its text-free wrappers. */
  const entrance = (e: Element | null, own?: boolean) => {
    const all: Animation[] = [];
    for (; e && e !== d.body && !(own && (e.textContent || "").trim()); e = e.parentElement)
      if (e.getAnimations)
        e.getAnimations().forEach((a) => {
          const end = a.effect ? a.effect.getComputedTiming().endTime : 0;
          if (a.timeline === d.timeline && isFinite(Number(end))) all.push(a);
        });
    return all;
  };
  const release = () => {
    if (state.done) return;
    state.done = true;
    state.at = now();
    if (hold) hold.remove();
    hold = null;
    // The slit already brought the logo in: its own entrance (unparked just now) skips to its end under the copy.
    if (state.logo)
      entrance(logo, true).forEach((a) => {
        try {
          a.finish();
        } catch {
          /* not finishable: the copy waits for it instead */
        }
      });
    try {
      w.dispatchEvent(new Event(c.ev));
    } catch {
      /* very old engines: the page's fallback timer starts the intro */
    }
    // Unlock once every entrance in the hero (logo, typing, divider, countdown, button, frame) has finished.
    // Untracked timers on purpose: the overlay (and its timers) is gone long before.
    const hero = d.getElementById("hero");
    w.setTimeout(() => {
      const intro = hero && hero.getAnimations ? hero.getAnimations({ subtree: true }).filter((a) => isFinite(Number(a.effect ? a.effect.getComputedTiming().endTime : 0))) : [];
      Promise.all(intro.map((a) => a.finished.catch(() => 0))).then(() => unlock(), () => unlock());
    }, 50);
    w.setTimeout(() => unlock(), 4500);
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
  /** Resolves when the entrance animations on `e` and its ancestors have finished. */
  const settled = (e: Element | null) => Promise.all(entrance(e).map((a) => a.finished.catch(() => 0)));

  function exit(quick: boolean) {
    if (exiting) return;
    exiting = true;
    clearTimeout(tick);
    const [gap, motion, short, wait] = c.x;
    const mode = reduced ? "fade" : quick || fast ? "quick" : "full";
    if (mode === "full") {
      const r = box(logo);
      const dv = box(divider);
      const width = line.offsetWidth;
      if (r) {
        const cy = r.top + r.height / 2;
        const drop = (dv ? dv.top : r.bottom + r.height * 0.55) - cy;
        fit(drop);
        if (copied) {
          slit.style.cssText = `left:${px(r.left + 1)};top:${px(r.top + 1)};width:${px(r.width - 2)};height:${px(r.height - 2)}`;
          root.style.setProperty("--o", px(Math.max(drop, r.height / 2)));
          root.setAttribute("data-slit", "");
          state.logo = true;
        }
      }
      // The hairline narrows to the divider's 30px.
      bar.style.transform = `scaleX(${30 / width})`;
    }
    root.setAttribute("data-exit", mode);
    if (mode !== "full") {
      release();
      later(remove, short);
      return;
    }
    later(release, gap);
    later(() => {
      let out = false;
      const end = () => {
        if (out) return;
        out = true;
        root.setAttribute("data-out", "");
        later(remove, 220);
      };
      Promise.all([settled(logo), settled(divider)]).then(end, end);
      later(end, wait);
    }, motion);
  }

  // ---- the loop (only while booting) -------------------------------------------
  const frame = () => {
    tick = 0;
    const t = now() - t0;
    find();
    // The scroll background (or its poster) has been requested; by window load it has, or never will be.
    if (!ok[4] && (ok[3] || ((n++ & 3) === 0 && ("__winterBg" in w || d.querySelector(".wbg__poster"))))) mark(4);
    let done = 0;
    let pend = 0;
    for (let i = 0; i < ok.length; i++) {
      if (ok[i]) done += c.w[i];
      else pend += c.w[i];
    }
    // Pending work earns slow partial credit so the line never stalls; it can't fill until all is real.
    let goal = Math.min(1, t / c.min, pend > 1e-6 ? done + pend * 0.7 * (1 - Math.exp(-t / 1100)) : 1);
    if (t >= c.max - 300) goal = 1;
    if (goal - shown > 0.004 || (goal >= 1 && shown < 1)) {
      shown = goal;
      bar.style.transform = `scaleX(${goal.toFixed(3)})`;
    }
    if (goal >= 1) {
      // The fill's last stretch (CSS .25s), then the handover.
      later(() => exit(false), 220);
      return;
    }
    tick = w.setTimeout(frame, 50);
  };

  later(() => exit(false), c.max + 200); // safety net: rAF never runs in a background tab
  if (fast) exit(true);
  else
    requestAnimationFrame((ts) => {
      // The clock starts at the first frame (when the overlay first paints).
      if (exiting) return;
      t0 = ts;
      frame();
    });
}
