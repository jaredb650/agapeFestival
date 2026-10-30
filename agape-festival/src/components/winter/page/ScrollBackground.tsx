"use client";

import { useEffect, useRef, useState } from "react";
import { BG_GLITCH_EVENT } from "./events";
import { afterLoadIdle } from "./idle";
import { withGsap } from "./loadGsap";
import type { BgMedia } from "./media";

/**
 * The designer's PLAIN tower animation as a fixed, scroll-scrubbed background.
 * It is on screen from the moment the hero leaves to the footer, always:
 *
 * - Layers, bottom up: an inline ~0.5 KB still (never black, costs nothing),
 *   the poster (after load), then the live video/canvas. A failed or stalled
 *   live layer just leaves the poster showing.
 * - The scrub only ever shows the playable `segments` (the footage opens and
 *   ends on black and has two dark stretches). Scroll maps to "virtual time"
 *   over the segments; a gap is crossed as a cut, which fires a glitch burst.
 * - Desktop (fine pointer, no touch): bg/desktop.mp4 (keyframe every 4 frames).
 *   One seek in flight, at most one per frame, issued from the frame loop (never
 *   inside a media event). Frame-exact while seeks keep up; snapped to keyframes
 *   (one decode each, ≈2× the seek rate) when the picture falls behind.
 * - Touch / small screens: the WebP frame sequence on a canvas (immune to iOS
 *   Low Power Mode). Frames are fetched as blobs and decoded off the main
 *   thread (createImageBitmap) in a small window around the playhead, so a
 *   draw is a blit, never a synchronous decode. The canvas is never cleared:
 *   if the wanted frame isn't ready, the nearest ready one (or the last one)
 *   stays up.
 * - Reduced motion or Save-Data: the poster only. Nothing loads, nothing moves.
 *
 * Scroll → time: elements with `data-bg-at="<seconds>"` are anchors (their top
 * reaching the viewport top shows that time). Page top and bottom are
 * `startTime` and `endTime`.
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
/** Frames fetched before the first scroll (hero exit + sparse coverage). */
const IDLE_BUDGET = 14;
/** Decoded frames kept either side of the playhead (720×1280 ≈ 3.7 MB each). */
const KEEP = 7;
/** Frames decoded ahead in the scroll direction / behind it. */
const AHEAD = 5;
const BEHIND = 2;
const MAX_DECODES = 2;

declare global {
  interface Window {
    /** Debug/QA hook: current scrub state. */
    __winterBg?: {
      mode: Mode;
      time: number;
      target: number;
      frame: number;
      loaded: number;
      decoded: number;
      seeks: number;
      live: boolean;
    };
  }
}

export function ScrollBackground({ media, startTime, endTime }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const codeRef = useRef<HTMLSpanElement>(null);
  const [mode, setMode] = useState<Mode>("poster");
  const [live, setLive] = useState(false);
  // The poster sits under the opaque hero at load, so it waits until the page
  // has loaded (or the visitor scrolls). The inline placeholder covers until then.
  const [posterOn, setPosterOn] = useState(false);

  useEffect(() => {
    const on = () => setPosterOn(true);
    const events = ["scroll", "wheel", "touchstart", "keydown"] as const;
    if (window.scrollY > 0) on();
    events.forEach((e) => window.addEventListener(e, on, { once: true, passive: true }));
    const cancelIdle = afterLoadIdle(on, 600);
    return () => {
      events.forEach((e) => window.removeEventListener(e, on));
      cancelIdle();
    };
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
    let disposed = false;
    const cleanupGsap = withGsap(({ gsap, ScrollTrigger }) => {
      const wrap = wrapRef.current!;
      const scrim = scrimRef.current!;
      const thumb = thumbRef.current;
      const code = codeRef.current;
      const { duration, brightRanges, glitchCuts, segments } = media;

      // ---------- virtual time: the playable segments laid end to end ----------
      const vTotal = segments.reduce((a, [s, e]) => a + (e - s), 0);
      /** Source time → virtual time (times inside a gap snap to the next segment). */
      const vOf = (t: number) => {
        let v = 0;
        for (const [s, e] of segments) {
          if (t <= s) return v;
          if (t < e) return v + (t - s);
          v += e - s;
        }
        return vTotal;
      };
      /** Virtual time → source time. */
      const tOf = (v: number) => {
        let rest = Math.min(vTotal, Math.max(0, v));
        for (const [s, e] of segments) {
          if (rest <= e - s) return s + rest;
          rest -= e - s;
        }
        return segments[segments.length - 1][1];
      };
      const segOf = (v: number) => {
        let acc = 0;
        for (let i = 0; i < segments.length; i++) {
          acc += segments[i][1] - segments[i][0];
          if (v < acc) return i;
        }
        return segments.length - 1;
      };

      // ---------- scroll → (virtual) time mapping ----------
      let anchors: [number, number][] = [];
      let dimStart = Infinity;
      let dimEnd = Infinity;
      let dimTo = 0;
      // No text sits over the footage until the hero has gone, so a flash during
      // the hero exit plays at full brightness.
      let boostFrom = 0;
      let boostFull = 0;
      let panMax = 0;
      let maxScroll = 1;
      let trackH = 0;

      const measure = () => {
        const sy = window.scrollY;
        const vh = window.innerHeight;
        maxScroll = Math.max(1, ScrollTrigger.maxScroll(window));
        const pts: [number, number][] = [[0, vOf(startTime)]];
        document.querySelectorAll<HTMLElement>("[data-bg-at]").forEach((el) => {
          const t = Number(el.dataset.bgAt);
          const y = Math.min(maxScroll, Math.max(0, el.getBoundingClientRect().top + sy));
          if (Number.isFinite(t)) pts.push([y, vOf(t)]);
        });
        pts.sort((a, b) => a[0] - b[0]);
        pts.push([maxScroll, vOf(endTime)]);
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

      const vAt = (y: number) => {
        for (let i = 1; i < anchors.length; i++) {
          const [y1, v1] = anchors[i];
          if (y <= y1) {
            const [y0, v0] = anchors[i - 1];
            return v0 + ((v1 - v0) * (y - y0)) / Math.max(1, y1 - y0);
          }
        }
        return vOf(endTime);
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

      // ---------- render state (virtual time) ----------
      let target = vOf(startTime);
      let current = target;
      let dir = 1;
      let lastY = 0;
      let lastScrollAt = 0;
      let lastScrim = -1;
      let lastCode = 0;
      let lastGlitch = 0;
      let awake = false;
      let seeks = 0;
      let isLive = false;
      const goLive = () => {
        if (isLive) return;
        isLive = true;
        debug.live = true;
        setLive(true);
      };
      const debug = { mode, time: tOf(current), target: tOf(target), frame: -1, loaded: 0, decoded: 0, seeks: 0, live: false };
      window.__winterBg = debug;

      const applyScroll = (y: number) => {
        lastY = y;
        lastScrollAt = performance.now();
        const next = vAt(y);
        if (next !== target) dir = next > target ? 1 : -1;
        target = next;
        if (panMax > 0) wrap.style.transform = `translate3d(0, ${(-panMax * (0.12 + 0.6 * (y / maxScroll))).toFixed(1)}px, 0)`;
        wake();
      };

      const crossGlitch = (fromV: number, toV: number) => {
        if (fromV === toV) return;
        const a = tOf(Math.min(fromV, toV));
        const b = tOf(Math.max(fromV, toV));
        const crossed = segOf(fromV) !== segOf(toV) || glitchCuts.some((c) => c > a && c <= b);
        if (!crossed) return;
        const now = performance.now();
        if (now - lastGlitch < 600) return;
        lastGlitch = now;
        window.dispatchEvent(new CustomEvent(BG_GLITCH_EVENT));
      };

      // ---------- video path ----------
      const video = mode === "video" ? videoRef.current : null;
      const fps = media.video.fps;
      const keyStep = media.keyframeStep;
      let videoReady = false;
      const seekTo = (t: number) => {
        if (!video || !videoReady || video.seeking) return;
        // Exact frames while the seeks keep up (slow scrolls stay smooth); once the
        // picture falls more than a GOP behind, land on keyframes (one decode per
        // seek, ~2× the seek rate) until it has caught up.
        const behind = Math.abs(video.currentTime - t) > keyStep * 1.5;
        const want = (behind ? Math.round(t / keyStep) * keyStep : Math.round(t * fps) / fps) + 0.001;
        if (Math.abs(video.currentTime - want) < 0.5 / fps) return;
        video.currentTime = Math.min(duration - 0.05, want);
        seeks++;
      };
      // `seeked` only wakes the loop; the next seek is issued on the next frame,
      // never inside the event, so seeks can't pile up mid-frame.
      const onSeeked = () => {
        goLive();
        wake();
      };
      const onLoaded = () => {
        videoReady = true;
        wake();
      };
      const onVideoFail = () => {
        videoReady = false;
        isLive = false;
        debug.live = false;
        setLive(false); // the poster underneath takes over
      };

      // ---------- frames path ----------
      const canvas = mode === "frames" ? canvasRef.current : null;
      const ctx = canvas?.getContext("2d", { alpha: false }) ?? null;
      const { count, dir: frameDir, step } = media.frames;
      const url = (i: number) => `${frameDir}f-${String(i).padStart(3, "0")}.webp`;
      const frameAt = (t: number) => Math.min(count - 1, Math.max(0, Math.round(t / step)));
      // Only frames inside the playable segments are ever fetched or shown.
      const playable = new Uint8Array(count);
      for (let i = 0; i < count; i++) {
        const t = i * step;
        playable[i] = segments.some(([s, e]) => t >= s - step / 2 && t <= e + step / 2) ? 1 : 0;
      }
      const playList = Array.from({ length: count }, (_, i) => i).filter((i) => playable[i]);
      const useBitmaps = typeof window.createImageBitmap === "function" && typeof fetch === "function";
      const blobs: (Blob | null)[] = new Array(count).fill(null);
      const imgs: (HTMLImageElement | null)[] = new Array(count).fill(null);
      const bitmaps: (ImageBitmap | null)[] = new Array(count).fill(null);
      const fetchState = new Uint8Array(count); // 0 idle, 1 loading, 2 ready, 3 failed
      const decState = new Uint8Array(count); // 0 none, 1 decoding, 2 ready, 3 failed
      let queue: number[] = [];
      let inflight = 0;
      let decoding = 0;
      let budget = IDLE_BUDGET;
      let drawn = -1;
      let loadedCount = 0;
      let decodedCount = 0;

      const ready = (i: number) => (useBitmaps ? decState[i] === 2 : fetchState[i] === 2);
      const source = (i: number): CanvasImageSource | null => (useBitmaps ? bitmaps[i] : imgs[i]);

      const priorityOrder = (first: number) => {
        const out: number[] = [];
        const seen = new Set<number>();
        const push = (i: number) => {
          if (playable[i] && !seen.has(i)) {
            seen.add(i);
            out.push(i);
          }
        };
        push(first);
        for (const stride of [16, 8, 4, 2, 1]) for (let k = 0; k < playList.length; k += stride) push(playList[k]);
        return out;
      };

      /** Frame indices around the playhead, in virtual time (so lookahead skips gaps). */
      const around = (v: number) => {
        const out: number[] = [];
        const add = (i: number) => {
          if (!out.includes(i)) out.push(i);
        };
        add(frameAt(tOf(v)));
        for (let k = 1; k <= AHEAD; k++) add(frameAt(tOf(v + dir * k * step)));
        for (let k = 1; k <= BEHIND; k++) add(frameAt(tOf(v - dir * k * step)));
        return out;
      };

      const evict = () => {
        const c = frameAt(tOf(current));
        for (let i = 0; i < count; i++) {
          const bm = bitmaps[i];
          if (bm && i !== drawn && Math.abs(i - c) > KEEP) {
            bm.close();
            bitmaps[i] = null;
            decState[i] = 0;
            decodedCount--;
          }
        }
      };

      const decodeAround = () => {
        if (!useBitmaps || disposed) return;
        for (const i of around(current)) {
          if (decoding >= MAX_DECODES) return;
          const blob = blobs[i];
          if (!blob || decState[i]) continue;
          decState[i] = 1;
          decoding++;
          createImageBitmap(blob)
            .then((bm) => {
              if (disposed) return bm.close();
              bitmaps[i] = bm;
              decState[i] = 2;
              decodedCount++;
              debug.decoded = decodedCount;
            })
            .catch(() => {
              decState[i] = 3;
            })
            .finally(() => {
              decoding--;
              if (disposed) return;
              evict();
              decodeAround();
              wake();
            });
        }
      };

      const pump = () => {
        while (inflight < CONCURRENCY && budget > 0 && queue.length) {
          const i = queue.shift()!;
          if (fetchState[i]) continue;
          fetchState[i] = 1;
          inflight++;
          budget--;
          const done = () => {
            fetchState[i] = 2;
            loadedCount++;
            debug.loaded = loadedCount;
            decodeAround();
            wake();
          };
          const job = useBitmaps
            ? fetch(url(i))
                .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
                .then((b) => {
                  blobs[i] = b;
                })
            : (() => {
                const img = new Image();
                img.decoding = "async";
                img.src = url(i);
                return img.decode().then(() => {
                  imgs[i] = img;
                });
              })();
          job
            .then(() => !disposed && done())
            .catch(() => {
              fetchState[i] = 3;
            })
            .finally(() => {
              inflight--;
              if (!disposed) pump();
            });
        }
      };
      const want = (list: number[]) => {
        const need = list.filter((n) => playable[n] && !fetchState[n]);
        if (!need.length) return;
        queue = [...need, ...queue.filter((n) => !need.includes(n))];
        budget = Math.max(budget, need.length);
        pump();
      };

      let cw = 0;
      let ch = 0;
      let planned = -1;
      const blit = (i: number) => {
        const img = source(i);
        if (!ctx || !img) return false;
        const iw = (img as ImageBitmap).width || (img as HTMLImageElement).naturalWidth;
        const ih = (img as ImageBitmap).height || (img as HTMLImageElement).naturalHeight;
        if (!iw || !ih) return false;
        const s = Math.max(cw / iw, ch / ih);
        const sw = cw / s;
        const sh = ch / s;
        ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, cw, ch);
        return true;
      };
      const sizeCanvas = () => {
        if (!canvas) return;
        const r = canvas.getBoundingClientRect();
        const scale = Math.min(window.devicePixelRatio || 1, 1.5, (media.frames.width * 1.25) / Math.max(1, r.width));
        const w = Math.max(1, Math.round(r.width * scale));
        const h = Math.max(1, Math.round(r.height * scale));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          cw = w;
          ch = h;
          // Resizing wipes the canvas: put the last frame straight back.
          if (drawn >= 0 && !blit(drawn)) drawn = -1;
        }
        cw = w;
        ch = h;
      };
      const draw = (t: number) => {
        if (!ctx) return;
        const idx = frameAt(t);
        // Re-plan fetch/decode only when the playhead reaches a new frame (or is waiting on one).
        if (idx !== planned || !ready(idx)) {
          planned = idx;
          want(around(current));
          decodeAround();
        }
        let use = -1;
        for (let d = 0; d < count && use < 0; d++) {
          if (idx - d >= 0 && playable[idx - d] && ready(idx - d)) use = idx - d;
          else if (idx + d < count && playable[idx + d] && ready(idx + d)) use = idx + d;
        }
        if (use < 0 || use === drawn) return; // nothing better: the current picture stays up
        if (blit(use)) {
          drawn = use;
          debug.frame = use;
          goLive();
        }
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
        const t = tOf(current);

        // Base dim once the info sections arrive, plus the bright-moment boost.
        const base = lastY <= dimStart ? 0 : lastY >= dimEnd ? dimTo : (dimTo * (lastY - dimStart)) / (dimEnd - dimStart);
        const textK = lastY >= boostFull ? 1 : lastY <= boostFrom ? 0 : (lastY - boostFrom) / Math.max(1, boostFull - boostFrom);
        const op = 1 - (1 - base) * (1 - boostAt(t) * textK);
        if (Math.abs(op - lastScrim) > 0.004) {
          scrim.style.opacity = op.toFixed(3);
          lastScrim = op;
        }
        if (thumb) thumb.style.transform = `translate3d(0, ${((t / duration) * trackH).toFixed(1)}px, 0)`;
        const now = performance.now();
        if (code && now - lastCode > 120) {
          lastCode = now;
          code.textContent = `00:${t.toFixed(2).padStart(5, "0")}`;
        }

        const moving = current !== target || now - lastScrollAt < 160; // keeps the loop awake through scroll momentum
        if (video) seekTo(t);
        else draw(t);

        debug.time = t;
        debug.target = tOf(target);
        debug.seeks = seeks;
        const videoSettled =
          !video || !videoReady || (!video.seeking && Math.abs(video.currentTime - (Math.round(t * fps) / fps + 0.001)) < 0.5 / fps);
        if (current === target && !moving && videoSettled && (!canvas || drawn === frameAt(t))) sleep();
      };
      function wake() {
        if (awake || disposed) return;
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
      current = target = vAt(window.scrollY);
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
          video.addEventListener("error", onVideoFail);
          video.addEventListener("emptied", onVideoFail);
          video.src = media.video.src;
          video.load();
        } else {
          queue = priorityOrder(frameAt(tOf(current)));
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
          video.removeEventListener("error", onVideoFail);
          video.removeEventListener("emptied", onVideoFail);
          video.removeAttribute("src");
          video.load();
        }
        bitmaps.forEach((bm) => bm?.close());
        wrap.style.transform = "";
        scrim.style.opacity = "";
        delete window.__winterBg;
      };
    });
    return () => {
      disposed = true;
      cleanupGsap();
    };
  }, [mode, media, startTime, endTime]);

  return (
    <div
      className="wbg"
      data-mode={mode}
      data-live={live || undefined}
      aria-hidden="true"
      style={{ backgroundImage: `url("${media.placeholder}")` }}
    >
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
              fetchPriority="low"
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
            00:03.70
          </span>
        </div>
      )}
    </div>
  );
}
