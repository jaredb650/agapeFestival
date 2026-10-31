"use client";

import { useEffect } from "react";
import { BEZEL_NARROW, BEZEL_WIDE, LINEUP_PICK_EVENT, bezelPath, bezelPins } from "./board";

// Wide glyphs only, so a scrambling name keeps roughly its width (no re-wrap mid-decode).
const GLYPHS = "#%&@+=<>?0ÄÜXØ/";
const WIDE = "(min-width: 760px)";

// Entrance timing, mirrored in lineup.css (--wlu-t0 / --wlu-step / --wlu-day-lag).
const T0 = 520;
const STEP = 70;
const DAY_LAG = 35;
const NAME_LAG = 150;

interface Job {
  el: HTMLElement;
  text: string;
  start: number;
  dur: number;
}

/**
 * Behaviour for the static lineup board. Renders nothing: it finds the section
 * by id and, with no React state at all,
 *  - draws the bezel at the measured panel size (no stretched chamfers),
 *  - arms the entrance and fires it once the board is ~30% on screen,
 *  - decodes the names in one shared rAF loop (textContent writes only),
 *  - lights the ticker index for the hovered row, replays its decode,
 *  - runs an occasional idle glitch on a random name while on screen,
 *  - announces profiler picks with a window event.
 * Reduced motion: never arms, so the board is static and complete.
 */
export function LineupMotion({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const panel = root.querySelector<HTMLElement>(".wlu__panel");
    const svg = root.querySelector<SVGSVGElement>(".wlu__bezel");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia(WIDE);
    const texts = [...root.querySelectorAll<HTMLElement>("[data-decode]")];
    const ticks = new Map<string, HTMLElement>();
    root.querySelectorAll<HTMLElement>(".wlu-tick").forEach((t) => ticks.set(t.dataset.n ?? "", t));

    // ---- Bezel -------------------------------------------------------------
    let lastW = 0;
    let lastH = 0;
    const draw = () => {
      if (!panel || !svg) return;
      const w = Math.round(panel.offsetWidth);
      const h = Math.round(panel.offsetHeight);
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      const spec = wide.matches ? BEZEL_WIDE : BEZEL_NARROW;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
      const [fill, outer, inner, pins] = svg.querySelectorAll("path");
      const d = bezelPath(w, h, 0, spec);
      fill?.setAttribute("d", d);
      outer?.setAttribute("d", d);
      inner?.setAttribute("d", bezelPath(w, h, wide.matches ? 6 : 4, spec));
      pins?.setAttribute("d", bezelPins(w, spec));
      root.style.setProperty("--wlu-nw", `${spec.nw}px`);
      root.style.setProperty("--wlu-nd", `${spec.nd}px`);
    };
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(draw) : null;
    if (panel) ro?.observe(panel);
    draw();
    const onWide = () => {
      lastW = 0;
      draw();
    };
    wide.addEventListener("change", onWide);

    // ---- Decode loop ---------------------------------------------------------
    const jobs = new Map<HTMLElement, Job>();
    let raf = 0;
    const tick = (now: number) => {
      jobs.forEach((job) => {
        const t = (now - job.start) / job.dur;
        if (t >= 1) {
          job.el.textContent = job.text;
          jobs.delete(job.el);
          return;
        }
        const settled = t <= 0 ? 0 : Math.floor(t * job.text.length);
        let out = "";
        for (let i = 0; i < job.text.length; i++) {
          const ch = job.text[i];
          out += i < settled || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        job.el.textContent = out;
      });
      raf = jobs.size ? requestAnimationFrame(tick) : 0;
    };
    const decode = (el: HTMLElement, delay: number, dur: number) => {
      const text = el.dataset.decode ?? el.textContent ?? "";
      jobs.set(el, { el, text, start: performance.now() + delay, dur });
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };

    // ---- Entrance ----------------------------------------------------------
    let played = false;
    let inView = false;
    const play = () => {
      if (played) return;
      played = true;
      root.setAttribute("data-on", "");
      texts.forEach((el) => {
        const row = el.closest<HTMLElement>(".wlu-row");
        const k = Number(row?.style.getPropertyValue("--k") || 0);
        const day = row?.dataset.day === "2" ? 1 : 0;
        decode(el, T0 + k * STEP + day * DAY_LAG + NAME_LAG, 620);
      });
      later(() => root.setAttribute("data-settled", ""), T0 + 9 * STEP + 1400);
      idle();
    };

    // Occasional glitch on one random name while the board is on screen.
    const idle = () => {
      later(() => {
        if (inView && document.visibilityState === "visible" && texts.length) {
          const el = texts[(Math.random() * texts.length) | 0];
          const row = el.closest<HTMLElement>(".wlu-row");
          if (row && !row.matches(":hover")) {
            row.setAttribute("data-glitch", "");
            decode(el, 0, 360);
            later(() => row.removeAttribute("data-glitch"), 420);
          }
        }
        idle();
      }, 3800 + Math.random() * 3600);
    };

    let io: IntersectionObserver | null = null;
    if (!reduced) {
      root.setAttribute("data-armed", "");
      io = new IntersectionObserver(
        ([e]) => {
          inView = e.isIntersecting;
          root.toggleAttribute("data-inview", inView);
          if (e.intersectionRatio >= 0.3 || (e.isIntersecting && e.intersectionRect.height >= window.innerHeight * 0.45)) play();
        },
        { threshold: [0, 0.15, 0.3, 0.5] },
      );
      io.observe(root);
    }

    // ---- Hover: ticker index + decode replay (mouse only) ---------------------
    let hot: HTMLElement | null = null;
    const setHot = (row: HTMLElement | null) => {
      if (row === hot) return;
      if (hot) ticks.get(hot.dataset.n ?? "")?.removeAttribute("data-hot");
      hot = row;
      if (!row) return;
      ticks.get(row.dataset.n ?? "")?.setAttribute("data-hot", "");
      const text = row.querySelector<HTMLElement>("[data-decode]");
      if (text && !reduced) decode(text, 0, 300);
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      setHot((e.target as HTMLElement).closest<HTMLElement>(".wlu-row"));
    };
    const onLeave = () => setHot(null);
    const onFocus = (e: FocusEvent) => {
      const row = (e.target as HTMLElement).closest<HTMLElement>(".wlu-row");
      if (row) setHot(row);
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-artist]");
      if (a?.dataset.artist) window.dispatchEvent(new CustomEvent(LINEUP_PICK_EVENT, { detail: { slug: a.dataset.artist } }));
    };
    root.addEventListener("pointerover", onOver);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusin", onFocus);
    root.addEventListener("focusout", onLeave);
    root.addEventListener("click", onClick);

    return () => {
      ro?.disconnect();
      io?.disconnect();
      wide.removeEventListener("change", onWide);
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      jobs.forEach((job) => (job.el.textContent = job.text));
      jobs.clear();
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("focusin", onFocus);
      root.removeEventListener("focusout", onLeave);
      root.removeEventListener("click", onClick);
      ["data-armed", "data-on", "data-settled", "data-inview"].forEach((a) => root.removeAttribute(a));
    };
  }, [rootId]);

  return null;
}
