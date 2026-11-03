"use client";

import { useEffect, useRef, useState } from "react";
import { pickVideoSource } from "../load/videoSource";
import { BG_GLITCH_EVENT } from "./events";
import { playWithRescue } from "./GestureRescue";
import { afterLoadIdle } from "./idle";
import type { BgMedia } from "./media";

/**
 * The page-wide background (grid redesign): the tower footage as a plain muted LOOP with a gentle
 * scroll parallax. No scrub, no canvas, no frame packs.
 *
 * Layers, bottom up: an inline ~0.5 KB still (never plain black), the poster (after load), the looping
 * <video> (fades in only once it actually plays, so a blocked autoplay shows the poster), the flyer's
 * own still, the vignette and the scrim. The whole layer keeps the old saturate(0.3) grade.
 *
 * - Video: AV1 / HEVC / H.264 picked by load/videoSource (hardware decode only), 1080x1920 on
 *   landscape screens, 720x1280 on portrait. Loaded after the page is idle (or on the first scroll).
 *   Plays only while it can be seen: not while the hero still covers it, not while the flyer's still
 *   covers it, never in a hidden tab.
 * - Parallax: one translateY on the media box, written from a rAF-throttled scroll handler. The box is
 *   taller than the screen; scrolling the whole page drifts it through that slack.
 * - The flyer layover looks as it did over the scrub: as the flyer locks, its own background still
 *   (the frame the v3 poster is built on) fades in over the loop on the same crop the scrub showed, and
 *   it fades back to the loop as the flyer leaves. A hard cut in the loop glitches a few flyer layers
 *   while the flyer is on screen (BG_GLITCH_EVENT), as a cut in the scrub did.
 * - The grid sections get a flat dark scrim (--g-scrim) that fades in as the flyer leaves; the vignette
 *   fades out with it.
 * - Reduced motion or Save-Data: the poster only (no video, no parallax, no still), centred.
 *
 * Writes only transform/opacity per frame; React state changes only on load/play transitions.
 */

declare global {
  interface Window {
    /** Debug/QA hook (the preloader also takes its presence as "background requested"). */
    __winterBg?: { src: string | null; playing: boolean; motion: boolean };
  }
}

/** The old scrub's pan at the flyer's lock and release, as a share of the media box's slack (landscape). */
const STILL_PAN_LOCK = 0.268;
const STILL_PAN_DRIFT = 0.029;
/** Parallax on landscape screens: the band of the tall footage shown at the top and bottom of the page. */
const PAN_FROM = 0.22;
const PAN_SPAN = 0.35;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export function LoopBackground({ media }: { media: BgMedia }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stillRef = useRef<HTMLImageElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);

  // The poster and the flyer still sit under the opaque hero at load: they wait for load or the first scroll.
  const [armed, setArmed] = useState(false);
  // The flyer's still only exists for the flyer section: without #flyer it is never rendered (or fetched).
  const [hasFlyer, setHasFlyer] = useState(false);
  const [motion, setMotion] = useState(true);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const arm = () => {
      setHasFlyer(!!document.getElementById("flyer"));
      setArmed(true);
    };
    const events = ["scroll", "wheel", "touchstart", "keydown"] as const;
    if (window.scrollY > 0) arm();
    events.forEach((e) => window.addEventListener(e, arm, { once: true, passive: true }));
    const cancel = afterLoadIdle(arm, 600);
    return () => {
      events.forEach((e) => window.removeEventListener(e, arm));
      cancel();
    };
  }, []);

  // Motion allowed? (reduced motion or Save-Data → the poster only). Follows a live preference change.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const pick = () => setMotion(!reduced.matches && !conn?.saveData);
    pick();
    reduced.addEventListener("change", pick);
    return () => reduced.removeEventListener("change", pick);
  }, []);

  // Choose the file once the page is idle (or on the first scroll): never competes with the hero.
  useEffect(() => {
    if (!motion) return;
    let off = false;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      window.removeEventListener("scroll", start);
      const portrait = window.matchMedia("(max-aspect-ratio: 3/4)").matches;
      void pickVideoSource(portrait ? media.portrait : media.landscape).then((s) => !off && setSrc(s));
    };
    window.addEventListener("scroll", start, { passive: true, once: true });
    const cancel = afterLoadIdle(start, 1200);
    return () => {
      off = true;
      window.removeEventListener("scroll", start);
      cancel();
    };
  }, [motion, media]);

  useEffect(() => {
    window.__winterBg = { src, playing, motion };
  }, [src, playing, motion]);

  // ---- Scroll: parallax, the flyer still, the scrim, play/pause -------------------------------------
  useEffect(() => {
    const root = rootRef.current;
    const box = boxRef.current;
    if (!root || !box) return;

    let vh = 0;
    let maxScroll = 1;
    let boxRoom = 0; // media box slack below the screen
    let stillRoom = 0; // flyer-still box slack (landscape only)
    let flyerTop = 0;
    let lock = 0;
    let release = 0;
    let flyerEnd = 0;
    let haveFlyer = false;

    const measure = () => {
      const sy = window.scrollY;
      vh = window.innerHeight;
      maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
      boxRoom = Math.max(0, box.offsetHeight - root.offsetHeight);
      stillRoom = stillRef.current ? Math.max(0, stillRef.current.offsetHeight - root.offsetHeight) : 0;
      const flyer = document.getElementById("flyer");
      const lockEl = flyer?.querySelector<HTMLElement>("[data-flyer-lock]");
      const relEl = flyer?.querySelector<HTMLElement>("[data-flyer-release]");
      haveFlyer = !!(flyer && lockEl && relEl);
      if (flyer && lockEl && relEl) {
        flyerTop = flyer.getBoundingClientRect().top + sy;
        lock = lockEl.getBoundingClientRect().top + sy;
        release = relEl.getBoundingClientRect().top + sy;
        flyerEnd = flyerTop + flyer.offsetHeight;
      }
    };

    const last = { pan: NaN, still: NaN, stillPan: NaN, scrim: NaN };
    let raf = 0;
    let wantPlay = false;
    let stillShown = 0;

    const syncPlayback = () => {
      const v = videoRef.current;
      if (!v || !v.getAttribute("src")) return;
      const should = wantPlay && !document.hidden;
      if (should && v.paused) playWithRescue(v);
      else if (!should && !v.paused) v.pause();
    };

    const update = () => {
      raf = 0;
      const y = window.scrollY;

      // Parallax: the whole page drifts the footage through its slack (landscape: the middle band of
      // the tall portrait clip; portrait: the extra 30% height).
      const p = clamp01(y / maxScroll);
      const pan = motion ? -boxRoom * (boxRoom > vh ? PAN_FROM + PAN_SPAN * p : p) : 0;
      if (!(Math.abs(pan - last.pan) < 0.5)) {
        box.style.transform = motion ? `translate3d(0, ${pan.toFixed(1)}px, 0)` : "";
        last.pan = pan;
      }

      // The flyer's still: in over the last 30% of the assembly, held, out over the first 35% of the exit.
      let still = 0;
      if (motion && haveFlyer) {
        const inFrom = lock - 0.3 * (lock - flyerTop);
        const outTo = release + 0.35 * (flyerEnd - release);
        still = y <= lock ? clamp01((y - inFrom) / Math.max(1, lock - inFrom)) : y <= release ? 1 : 1 - clamp01((y - release) / Math.max(1, outTo - release));
      }
      stillShown = still;
      const el = stillRef.current;
      if (el) {
        if (!(Math.abs(still - last.still) < 0.004)) {
          el.style.opacity = still.toFixed(3);
          last.still = still;
        }
        if (still > 0 && stillRoom > 0) {
          const k = STILL_PAN_LOCK + STILL_PAN_DRIFT * ((y - lock) / Math.max(1, release - lock));
          const sp = -stillRoom * k;
          if (!(Math.abs(sp - last.stillPan) < 0.5)) {
            el.style.transform = `translate3d(0, ${sp.toFixed(1)}px, 0)`;
            last.stillPan = sp;
          }
        }
      }

      // Scrim: 0 over the hero and flyer, up to --g-scrim as the first grid section rises into view.
      const gridTop = haveFlyer ? flyerEnd : vh;
      const scrim = clamp01((y - (gridTop - vh)) / Math.max(1, 0.65 * vh));
      if (!(Math.abs(scrim - last.scrim) < 0.004)) {
        if (scrimRef.current) scrimRef.current.style.opacity = scrim.toFixed(3);
        if (vignetteRef.current) vignetteRef.current.style.opacity = (1 - scrim).toFixed(3);
        last.scrim = scrim;
      }

      // Play only while the loop can be seen: the hero has started to leave, the still doesn't cover it.
      const next = y > vh * 0.05 && stillShown < 1;
      if (next !== wantPlay) {
        wantPlay = next;
        syncPlayback();
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const remeasure = () => {
      measure();
      last.pan = last.still = last.stillPan = last.scrim = NaN;
      onScroll();
    };
    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", remeasure, { passive: true });
    document.addEventListener("visibilitychange", syncPlayback);
    // Layout settles after fonts, lazy media and late sections.
    let roTimer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(roTimer);
      roTimer = window.setTimeout(remeasure, 150);
    });
    const main = document.getElementById("main");
    if (main) ro.observe(main);
    // The video's own events re-check playback once it has a source.
    const v = videoRef.current;
    v?.addEventListener("loadeddata", syncPlayback);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(roTimer);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      document.removeEventListener("visibilitychange", syncPlayback);
      v?.removeEventListener("loadeddata", syncPlayback);
      box.style.transform = "";
    };
  }, [motion, armed, src]);

  // ---- Cuts in the loop glitch the flyer layers (only while the flyer is on screen) -------------------
  useEffect(() => {
    const v = videoRef.current;
    const flyer = document.getElementById("flyer");
    if (!v || !src || !flyer || !media.cuts.length) return;
    type RVFC = (cb: (now: number, meta: { mediaTime: number }) => void) => number;
    const rvfc = (v as HTMLVideoElement & { requestVideoFrameCallback?: RVFC }).requestVideoFrameCallback?.bind(v);
    const cancelRvfc = (v as HTMLVideoElement & { cancelVideoFrameCallback?: (h: number) => void }).cancelVideoFrameCallback?.bind(v);
    let near = false;
    let handle = 0;
    let prev = -1;
    let lastBurst = 0;
    const still = () => Number(stillRef.current?.style.opacity || 0);
    const check = (t: number) => {
      if (prev >= 0 && t !== prev) {
        const crossed = t > prev ? media.cuts.some((c) => c > prev && c <= t) : media.cuts.some((c) => c > prev || c <= t);
        const now = performance.now();
        if (crossed && still() < 0.5 && now - lastBurst > 600) {
          lastBurst = now;
          window.dispatchEvent(new CustomEvent(BG_GLITCH_EVENT));
        }
      }
      prev = t;
    };
    const onFrame = (_n: number, meta: { mediaTime: number }) => {
      check(meta.mediaTime);
      if (near && rvfc) handle = rvfc(onFrame);
    };
    const onTime = () => check(v.currentTime);
    const io = new IntersectionObserver(([e]) => {
      near = e.isIntersecting;
      prev = -1;
      if (rvfc) {
        if (near) handle = rvfc(onFrame);
        else if (handle && cancelRvfc) cancelRvfc(handle);
      } else if (near) v.addEventListener("timeupdate", onTime);
      else v.removeEventListener("timeupdate", onTime);
    });
    io.observe(flyer);
    return () => {
      io.disconnect();
      near = false;
      if (handle && cancelRvfc) cancelRvfc(handle);
      v.removeEventListener("timeupdate", onTime);
    };
  }, [src, media.cuts]);

  return (
    <div
      ref={rootRef}
      className="wbg"
      data-motion={motion ? undefined : "off"}
      data-live={(playing && motion) || undefined}
      aria-hidden="true"
      style={{ backgroundImage: `url("${media.placeholder}")` }}
    >
      <div ref={boxRef} className="wbg__media">
        {armed && (
          <picture>
            <source media="(max-aspect-ratio: 3/4)" srcSet={media.posterMobile.src} width={media.posterMobile.width} height={media.posterMobile.height} />
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
        {src && motion && (
          <video
            ref={videoRef}
            className="wbg__video"
            src={src}
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            tabIndex={-1}
            onPlaying={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setPlaying(false)}
          />
        )}
      </div>
      {armed && motion && hasFlyer && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={stillRef}
          className="wbg__still"
          src={media.flyerStill.src}
          width={media.flyerStill.width}
          height={media.flyerStill.height}
          alt=""
          decoding="async"
        />
      )}
      <div ref={scrimRef} className="wbg__scrim" />
      <div ref={vignetteRef} className="wbg__vignette" />
    </div>
  );
}
