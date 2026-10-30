"use client";

import { useEffect, useRef, useState } from "react";
import { BG_GLITCH_EVENT } from "./events";
import { afterLoadIdle } from "./idle";
import { withGsap } from "./loadGsap";
import type { BgMedia } from "./media";

/**
 * The designer's PLAIN tower animation as a fixed, scroll-scrubbed background.
 *
 * - Desktop (fine pointer, no touch): bg/desktop.mp4 (keyframe every 4 frames)
 *   with currentTime driven by scroll, smoothed on the GSAP ticker, one seek in
 *   flight at a time.
 * - Touch / small screens: the 151-frame WebP sequence drawn to a canvas
 *   (immune to iOS Low Power Mode), lazy-loaded in priority order.
 * - Reduced motion or Save-Data: the poster only. Nothing loads, nothing moves.
 *
 * Scroll → time: elements with `data-bg-at="<seconds>"` are anchors (their top
 * reaching the viewport top shows that time). Page top and bottom are `startTime`
 * and `endTime`; time is linear in scroll between anchors.
 *
 * Writes only transform/opacity (and a canvas draw) per frame.
 */

type Mode = "poster" | "video" | "frames";

interface Props {
  media: BgMedia;
  startTime: number;
  endTime: number;
}

const CONCURRENCY = 4;
/** Frames requested before the first scroll (hero exit + sparse coverage). */
const IDLE_BUDGET = 14;

declare global {
  interface Window {
    /** Debug/QA hook: current scrub state. */
    __winterBg?: { mode: Mode; time: number; target: number; frame: number; loaded: number; seeks: number };
  }
}

function frameOrder(count: number, first: number): number[] {
  const out: number[] = [];
  const seen = new Set<number>();
  const push = (i: number) => {
    if (i >= 0 && i < count && !seen.has(i)) {
      seen.add(i);
      out.push(i);
    }
  };
  push(first);
  for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < count; i += step) push(i);
  push(count - 1);
  return out;
}

export function ScrollBackground({ media, startTime, endTime }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const codeRef = useRef<HTMLSpanElement>(null);
  const [mode, setMode] = useState<Mode>("poster");
  const [live, setLive] = useState(false);
  // The poster sits under the opaque hero at load; fetching it then only delays
  // the hero (and makes it the LCP candidate). Load it once the visitor scrolls.
  const [posterOn, setPosterOn] = useState(false);

  useEffect(() => {
    const on = () => setPosterOn(true);
    const events = ["scroll", "wheel", "touchstart", "keydown"] as const;
    if (window.scrollY > 0) on();
    events.forEach((e) => window.addEventListener(e, on, { once: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, on));
  }, []);

  // Pick the path once on mount (and fall back to the poster if motion is reduced later).
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const pick = () => {
      if (reduced.matches || conn?.saveData) return setMode("poster");
      const desktop =
        window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)").matches && navigator.maxTouchPoints === 0;
      setMode(desktop ? "video" : "frames");
    };
    pick();
    reduced.addEventListener("change", pick);
    return () => reduced.removeEventListener("change", pick);
  }, []);

  useEffect(() => {
    if (mode === "poster") {
      setLive(false);
      return;
    }
    return withGsap(({ gsap, ScrollTrigger }) => {
      const wrap = wrapRef.current!;
      const scrim = scrimRef.current!;
      const thumb = thumbRef.current;
      const code = codeRef.current;
      const { duration, brightRanges, glitchCuts } = media;

      // ---------- scroll → time mapping ----------
      let anchors: [number, number][] = [];
      let dimStart = Infinity;
      let dimEnd = Infinity;
      let dimTo = 0;
      // No text sits over the footage until the hero has gone, so the flash cut
      // during the hero exit plays at full brightness.
      let boostFrom = 0;
      let boostFull = 0;
      let panMax = 0;
      let maxScroll = 1;

      const measure = () => {
        const sy = window.scrollY;
        const vh = window.innerHeight;
        maxScroll = Math.max(1, ScrollTrigger.maxScroll(window));
        const pts: [number, number][] = [[0, startTime]];
        document.querySelectorAll<HTMLElement>("[data-bg-at]").forEach((el) => {
          const t = Number(el.dataset.bgAt);
          const y = Math.min(maxScroll, Math.max(0, el.getBoundingClientRect().top + sy));
          if (Number.isFinite(t)) pts.push([y, t]);
        });
        pts.sort((a, b) => a[0] - b[0]);
        pts.push([maxScroll, endTime]);
        anchors = pts.filter((p, i) => i === 0 || (p[0] > pts[i - 1][0] && p[1] >= pts[i - 1][1]));
        boostFull = anchors.length > 2 ? anchors[1][0] : 0;
        boostFrom = Math.max(0, boostFull - vh * 0.3);
        const dimEl = document.querySelector<HTMLElement>("[data-bg-dim]");
        if (dimEl) {
          const top = dimEl.getBoundingClientRect().top + sy;
          dimStart = top - vh;
          dimEnd = top - vh * 0.35;
          dimTo = Number(dimEl.dataset.bgDim) || 0;
        }
        panMax = Math.max(0, wrap.offsetHeight - vh);
        trackH = thumb?.parentElement?.clientHeight ?? 0;
      };

      const timeAt = (y: number) => {
        for (let i = 1; i < anchors.length; i++) {
          const [y1, t1] = anchors[i];
          if (y <= y1) {
            const [y0, t0] = anchors[i - 1];
            return t0 + ((t1 - t0) * (y - y0)) / Math.max(1, y1 - y0);
          }
        }
        return endTime;
      };

      // Text scrim: extra ink while the footage flashes or whites out.
      const boostAt = (t: number) => {
        let b = 0;
        for (const r of brightRanges) {
          const level = Math.min(1, Math.max(0, (r.peakLuma - 62) / 100)) * 0.8;
          const ramp = 0.12;
          let k = 0;
          if (t >= r.start && t <= r.end) k = 1;
          else if (t > r.start - ramp && t < r.start) k = (t - (r.start - ramp)) / ramp;
          else if (t > r.end && t < r.end + ramp) k = 1 - (t - r.end) / ramp;
          b = Math.max(b, level * k);
        }
        return b;
      };

      // ---------- render state ----------
      let target = startTime;
      let current = startTime;
      let lastY = 0;
      let lastScrim = -1;
      let lastCode = 0;
      let lastGlitch = 0;
      let awake = false;
      let seeks = 0;
      let isLive = false;
      let trackH = 0;
      const goLive = () => {
        if (isLive) return;
        isLive = true;
        setLive(true);
      };
      const debug = { mode, time: current, target, frame: -1, loaded: 0, seeks: 0 };
      window.__winterBg = debug;

      const applyScroll = (y: number) => {
        lastY = y;
        target = Math.min(duration, Math.max(0, timeAt(y)));
        if (panMax > 0) wrap.style.transform = `translate3d(0, ${(-panMax * (0.12 + 0.6 * (y / maxScroll))).toFixed(1)}px, 0)`;
        wake();
      };

      const crossGlitch = (from: number, to: number) => {
        if (from === to) return;
        const lo = Math.min(from, to);
        const hi = Math.max(from, to);
        if (!glitchCuts.some((c) => c > lo && c <= hi)) return;
        const now = performance.now();
        if (now - lastGlitch < 600) return;
        lastGlitch = now;
        window.dispatchEvent(new CustomEvent(BG_GLITCH_EVENT));
      };

      // ---------- video path ----------
      const video = mode === "video" ? videoRef.current : null;
      let videoReady = false;
      const seek = () => {
        if (!video || !videoReady || video.seeking) return;
        if (Math.abs(video.currentTime - current) > 0.5 / 30) {
          video.currentTime = current;
          seeks++;
        }
      };
      const onSeeked = () => {
        goLive();
        seek();
      };
      const onLoaded = () => {
        videoReady = true;
        seek();
        if (Math.abs(video!.currentTime - current) <= 0.5 / 30) goLive();
      };

      // ---------- frames path ----------
      const canvas = mode === "frames" ? canvasRef.current : null;
      const ctx = canvas?.getContext("2d", { alpha: false }) ?? null;
      const { count, dir, step } = media.frames;
      const images: (HTMLImageElement | null)[] = new Array(count).fill(null);
      const state = new Uint8Array(count); // 0 idle, 1 loading, 2 ready, 3 failed
      let queue: number[] = [];
      let inflight = 0;
      let budget = IDLE_BUDGET;
      let drawn = -1;
      let loadedCount = 0;
      const url = (i: number) => `${dir}f-${String(i).padStart(3, "0")}.webp`;
      const frameAt = (t: number) => Math.min(count - 1, Math.max(0, Math.round(t / step)));

      const pump = () => {
        while (inflight < CONCURRENCY && budget > 0 && queue.length) {
          const i = queue.shift()!;
          if (state[i]) continue;
          state[i] = 1;
          inflight++;
          budget--;
          const img = new Image();
          img.decoding = "async";
          img.src = url(i);
          img
            .decode()
            .then(() => {
              images[i] = img;
              state[i] = 2;
              loadedCount++;
              debug.loaded = loadedCount;
              if (drawn !== frameAt(current)) wake();
            })
            .catch(() => {
              state[i] = 3;
            })
            .finally(() => {
              inflight--;
              pump();
            });
        }
      };
      const want = (i: number) => {
        const near = [i, i + 1, i - 1, i + 2, i - 2].filter((n) => n >= 0 && n < count && !state[n]);
        if (!near.length) return;
        queue = [...near, ...queue.filter((n) => !near.includes(n))];
        budget = Math.max(budget, near.length);
        pump();
      };

      let cw = 0;
      let ch = 0;
      const sizeCanvas = () => {
        if (!canvas) return;
        const r = canvas.getBoundingClientRect();
        const scale = Math.min(window.devicePixelRatio || 1, 1.5, (media.frames.width * 1.25) / Math.max(1, r.width));
        cw = Math.max(1, Math.round(r.width * scale));
        ch = Math.max(1, Math.round(r.height * scale));
        if (canvas.width !== cw || canvas.height !== ch) {
          canvas.width = cw;
          canvas.height = ch;
          drawn = -1;
        }
      };
      const draw = (t: number) => {
        if (!ctx) return;
        const idx = frameAt(t);
        let use = -1;
        for (let d = 0; d < count; d++) {
          if (idx - d >= 0 && state[idx - d] === 2) {
            use = idx - d;
            break;
          }
          if (idx + d < count && state[idx + d] === 2) {
            use = idx + d;
            break;
          }
        }
        if (state[idx] !== 2) want(idx);
        if (use < 0 || use === drawn) return;
        const img = images[use]!;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const s = Math.max(cw / iw, ch / ih);
        const sw = cw / s;
        const sh = ch / s;
        ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, cw, ch);
        drawn = use;
        debug.frame = use;
        goLive();
      };

      // ---------- the loop ----------
      const tick = (_time: number, deltaMs: number) => {
        const prev = current;
        const diff = target - current;
        if (Math.abs(diff) > 2.5)
          current = target; // anchor jumps (nav links): cut, don't fast-forward
        else current += diff * Math.min(1, (deltaMs / 1000) * 9);
        if (Math.abs(target - current) < 0.003) current = target;
        crossGlitch(prev, current);

        // Base dim once the info sections arrive, plus the bright-moment boost.
        const base = lastY <= dimStart ? 0 : lastY >= dimEnd ? dimTo : (dimTo * (lastY - dimStart)) / (dimEnd - dimStart);
        const textK = lastY >= boostFull ? 1 : lastY <= boostFrom ? 0 : (lastY - boostFrom) / Math.max(1, boostFull - boostFrom);
        const op = 1 - (1 - base) * (1 - boostAt(current) * textK);
        if (Math.abs(op - lastScrim) > 0.004) {
          scrim.style.opacity = op.toFixed(3);
          lastScrim = op;
        }
        if (thumb) thumb.style.transform = `translate3d(0, ${((current / duration) * trackH).toFixed(1)}px, 0)`;
        const now = performance.now();
        if (code && now - lastCode > 120) {
          lastCode = now;
          code.textContent = `00:${current.toFixed(2).padStart(5, "0")}`;
        }

        if (video) seek();
        else draw(current);

        debug.time = current;
        debug.target = target;
        debug.seeks = seeks;
        const settled =
          current === target && (!video || !videoReady || (!video.seeking && Math.abs(video.currentTime - current) <= 0.5 / 30));
        if (settled && (!canvas || drawn === frameAt(current))) sleep();
      };
      function wake() {
        if (awake) return;
        awake = true;
        gsap.ticker.add(tick);
      }
      function sleep() {
        if (!awake) return;
        awake = false;
        gsap.ticker.remove(tick);
      }

      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onRefresh: (self) => {
          measure();
          sizeCanvas();
          applyScroll(self.scroll());
        },
        onUpdate: (self) => applyScroll(self.scroll()),
      });
      measure();
      sizeCanvas();
      current = target = Math.min(duration, Math.max(0, timeAt(window.scrollY)));
      applyScroll(window.scrollY);

      // Layout settles after fonts and lazy media; re-measure anchors then.
      let roTimer = 0;
      let roFirst = true;
      const ro = new ResizeObserver(() => {
        if (roFirst) return void (roFirst = false);
        clearTimeout(roTimer);
        roTimer = window.setTimeout(() => ScrollTrigger.refresh(), 250);
      });
      const main = document.getElementById("main");
      if (main) ro.observe(main);
      const onResize = () => {
        sizeCanvas();
        drawn = -1;
        wake();
      };
      window.addEventListener("resize", onResize);

      // ---------- loading: nothing heavy until the page is idle ----------
      let started = false;
      let full = false;
      const startLoading = () => {
        if (started) return;
        started = true;
        if (video) {
          video.addEventListener("loadeddata", onLoaded);
          video.addEventListener("seeked", onSeeked);
          video.src = media.video.src;
          video.load();
        } else {
          queue = frameOrder(count, frameAt(current));
          pump();
        }
      };
      const goFull = () => {
        if (full) return;
        full = true;
        startLoading();
        if (!video) {
          budget = Infinity;
          pump();
        }
        window.removeEventListener("scroll", goFull);
      };
      window.addEventListener("scroll", goFull, { passive: true });
      const cancelIdle = afterLoadIdle(startLoading);
      if (window.scrollY > 0) goFull();

      return () => {
        st.kill();
        sleep();
        ro.disconnect();
        clearTimeout(roTimer);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", goFull);
        cancelIdle();
        if (video) {
          video.removeEventListener("loadeddata", onLoaded);
          video.removeEventListener("seeked", onSeeked);
          video.removeAttribute("src");
          video.load();
        }
        wrap.style.transform = "";
        scrim.style.opacity = "";
        delete window.__winterBg;
      };
    });
  }, [mode, media, startTime, endTime]);

  return (
    <div ref={rootRef} className="wbg" data-mode={mode} data-live={live || undefined} aria-hidden="true">
      <div ref={wrapRef} className="wbg__media">
        {posterOn && (
          <picture>
            <source
              media="(max-aspect-ratio: 3/4)"
              srcSet={media.posterMobile.src}
              width={media.posterMobile.width}
              height={media.posterMobile.height}
            />
            <img
              className="wbg__poster"
              src={media.posterDesktop.src}
              width={media.posterDesktop.width}
              height={media.posterDesktop.height}
              alt=""
              decoding="async"
            />
          </picture>
        )}
        {mode === "video" && (
          <video ref={videoRef} className="wbg__video" muted playsInline preload="auto" disablePictureInPicture tabIndex={-1} />
        )}
        {mode === "frames" && <canvas ref={canvasRef} className="wbg__canvas" />}
      </div>
      <div ref={scrimRef} className="wbg__scrim" />
      <div className="wbg__vignette" />
      {mode !== "poster" && (
        <div className="wbg__rail">
          <span className="wbg__track">
            {media.glitchCuts.map((c) => (
              <i key={c} style={{ top: `${((c / media.duration) * 100).toFixed(2)}%` }} />
            ))}
            <span ref={thumbRef} className="wbg__thumb" />
          </span>
          <span ref={codeRef} className="wbg__code">
            00:00.90
          </span>
        </div>
      )}
    </div>
  );
}
