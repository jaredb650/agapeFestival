"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { GLITCH_EVENT } from "@/components/winter/ui";
import { LIVE_MARGIN, onSecond } from "@/components/winter/page/hudFx";
import { withGsap } from "@/components/winter/page/loadGsap";

const GLYPHS = "#%&*+/<>=?@[]_|01:";
const pad = (n: number, w = 2) => String(n).padStart(w, "0");

/**
 * Behaviour for the server-rendered terminal (children stay server markup):
 *
 * - Boot: `data-state="armed"` hides the parts, then `"on"` when ~30% of the
 *   terminal is on screen plays the CSS choreography once (CRT line, frame
 *   flicker, glitch-in, pass print) and decodes every `[data-tk-decode]`
 *   (textContent writes in one rAF loop, no React renders).
 * - `data-live` while on screen: CSS loops (foil, float, blink) pause without it; once
 *   `data-settled` (intro over) they are removed off screen instead, freeing their layers.
 * - Countdown: textContent into `[data-u]` once a second, only while live.
 * - Desktop mouse: the pass tilts toward the pointer and the foil + glare slide
 *   (GSAP quickTo on transforms). Phones get the CSS idle sway instead.
 * - Tap/click on the pass: a glitch burst on the logo and a foil flash.
 *
 * Reduced motion: never armed (static, fully visible), no tilt, no seconds.
 */
export function TerminalShell({ children, className, targetIso }: { children: ReactNode; className?: string; targetIso: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];

    // ---- Countdown -------------------------------------------------------
    const target = Date.parse(targetIso);
    const units = {
      d: root.querySelectorAll<HTMLElement>('[data-u="d"]'),
      h: root.querySelectorAll<HTMLElement>('[data-u="h"]'),
      m: root.querySelectorAll<HTMLElement>('[data-u="m"]'),
      s: root.querySelectorAll<HTMLElement>('[data-u="s"]'),
    };
    const last: Record<string, string> = {};
    const write = (k: keyof typeof units, v: string) => {
      if (last[k] === v) return;
      last[k] = v;
      units[k].forEach((el) => (el.textContent = v));
    };
    const tick = () => {
      const left = Math.max(0, target - Date.now());
      const s = Math.floor(left / 1000);
      write("d", pad(Math.floor(s / 86400), 3));
      write("h", pad(Math.floor(s / 3600) % 24));
      write("m", pad(Math.floor(s / 60) % 60));
      write("s", pad(s % 60));
    };
    tick();

    // Seconds tick on the shared 1 Hz ticker; reduced motion hides seconds, so a slow timer will do.
    let timer = 0;
    let stopTick: (() => void) | null = null;
    let live = false;
    const stop = () => {
      clearInterval(timer);
      stopTick?.();
      stopTick = null;
    };
    const setLive = (on: boolean) => {
      if (on === live) return;
      live = on;
      root.toggleAttribute("data-live", on);
      stop();
      if (on) {
        tick();
        if (reduced) timer = window.setInterval(tick, 30000);
        else stopTick = onSecond(tick);
      }
    };
    cleanups.push(stop);

    // ---- Boot ------------------------------------------------------------
    let raf = 0;
    let settleTimer = 0;
    const decodes: { el: HTMLElement; text: string }[] = [];
    const boot = () => {
      root.dataset.state = "on";
      // Intro done (last piece ~2.8 s): from here CSS drops off-screen loops instead of pausing them.
      settleTimer = window.setTimeout(() => root.setAttribute("data-settled", ""), 3200);
      const els = Array.from(root.querySelectorAll<HTMLElement>("[data-tk-decode]"));
      const start = performance.now();
      const jobs = els.map((el) => {
        const text = el.textContent ?? "";
        decodes.push({ el, text });
        return { el, text, at: Number(el.dataset.tkDecode || 0) * 1000, ms: Math.max(320, Math.min(700, text.length * 40)) };
      });
      jobs.forEach(({ el, text }) => (el.textContent = text.replace(/\S/g, " ")));
      const frame = (now: number) => {
        let pending = false;
        for (const j of jobs) {
          const t = (now - start - j.at) / j.ms;
          if (t >= 1) {
            if (j.el.textContent !== j.text) j.el.textContent = j.text;
            continue;
          }
          pending = true;
          if (t < 0) continue;
          const settled = Math.floor(t * j.text.length);
          let out = "";
          for (let i = 0; i < j.text.length; i++) {
            const ch = j.text[i];
            out += i < settled || ch === " " ? ch : i < settled + 6 ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : " ";
          }
          j.el.textContent = out;
        }
        if (pending) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };
    cleanups.push(() => {
      cancelAnimationFrame(raf);
      clearTimeout(settleTimer);
      decodes.forEach(({ el, text }) => (el.textContent = text));
    });

    if (!reduced) root.dataset.state = "armed";
    const io = new IntersectionObserver(
      (entries) => {
        // Several entries can queue up between callbacks: only the latest is current.
        const e = entries[entries.length - 1];
        setLive(e.isIntersecting);
        if (root.dataset.state === "armed" && e.intersectionRatio >= 0.28) boot();
      },
      { threshold: [0, 0.28, 0.5], rootMargin: LIVE_MARGIN },
    );
    io.observe(root);
    cleanups.push(() => io.disconnect());

    // ---- Tap: glitch burst + foil flash ------------------------------------
    const pass = root.querySelector<HTMLElement>("[data-tk-pass]");
    let flashTimer = 0;
    const onTap = () => {
      if (reduced || !pass) return;
      pass.querySelector(".w-glitch")?.dispatchEvent(new Event(GLITCH_EVENT));
      pass.removeAttribute("data-flash");
      void pass.offsetWidth; // restart the one-shot sweep
      pass.setAttribute("data-flash", "");
      clearTimeout(flashTimer);
      flashTimer = window.setTimeout(() => pass.removeAttribute("data-flash"), 900);
    };
    pass?.addEventListener("click", onTap);
    cleanups.push(() => {
      pass?.removeEventListener("click", onTap);
      clearTimeout(flashTimer);
    });

    // ---- Pointer tilt (desktop mouse only) ---------------------------------
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const anchor = root.querySelector<HTMLElement>("[data-tk-anchor]");
    if (fine && !reduced && pass && anchor) {
      cleanups.push(
        withGsap(({ gsap }) => {
          const glare = pass.querySelector<HTMLElement>("[data-tk-glare]");
          const holo = pass.querySelector<HTMLElement>("[data-tk-holo]");
          gsap.set(pass, { transformPerspective: 1100 });
          const o = { duration: 0.9, ease: "power3" };
          const rx = gsap.quickTo(pass, "rotationX", o);
          const ry = gsap.quickTo(pass, "rotationY", o);
          const gx = glare ? gsap.quickTo(glare, "xPercent", o) : null;
          const gy = glare ? gsap.quickTo(glare, "yPercent", o) : null;
          const hx = holo ? gsap.quickTo(holo, "xPercent", { duration: 1.2, ease: "power3" }) : null;
          let rect: DOMRect | null = null;
          const clamp = (v: number) => Math.max(-1, Math.min(1, v));
          const onMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse" || !live) return;
            rect ??= anchor.getBoundingClientRect();
            const nx = clamp((e.clientX - (rect.left + rect.width / 2)) / (rect.width * 1.5));
            const ny = clamp((e.clientY - (rect.top + rect.height / 2)) / (rect.height * 0.9));
            ry(nx * 18);
            rx(-ny * 12);
            gx?.(nx * 34);
            gy?.(ny * 30);
            hx?.(-nx * 18);
          };
          const reset = () => {
            rect = null;
            ry(0);
            rx(0);
            gx?.(0);
            gy?.(0);
            hx?.(0);
          };
          const invalidate = () => (rect = null);
          root.addEventListener("pointermove", onMove, { passive: true });
          root.addEventListener("pointerleave", reset);
          window.addEventListener("scroll", invalidate, { passive: true });
          window.addEventListener("resize", invalidate);
          return () => {
            root.removeEventListener("pointermove", onMove);
            root.removeEventListener("pointerleave", reset);
            window.removeEventListener("scroll", invalidate);
            window.removeEventListener("resize", invalidate);
            const targets = [pass, glare, holo].filter(Boolean) as HTMLElement[];
            gsap.killTweensOf(targets);
            gsap.set(targets, { clearProps: "transform" });
          };
        }),
      );
    }

    return () => {
      cleanups.forEach((fn) => fn());
      delete root.dataset.state;
      root.removeAttribute("data-settled");
      root.removeAttribute("data-live");
    };
  }, [targetIso]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
