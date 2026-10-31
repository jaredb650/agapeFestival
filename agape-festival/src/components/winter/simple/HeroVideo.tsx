"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { afterLoadIdle } from "@/components/winter/page/idle";
import { playWithRescue } from "@/components/winter/page/GestureRescue";
import { pickHeroVideo } from "@/components/winter/load/videoSource";
import type { HeroVideo as HeroVideoConfig } from "@/components/winter/page/media";

// The video and its pause button sit in different layers of the hero, so they share this tiny store.
type State = "off" | "playing" | "paused";
let state: State = "off";
let userPaused = false;
let el: HTMLVideoElement | null = null;
const subs = new Set<() => void>();
const set = (s: State) => {
  if (s === state) return;
  state = s;
  subs.forEach((f) => f());
};
const subscribe = (cb: () => void) => {
  subs.add(cb);
  return () => void subs.delete(cb);
};

/**
 * Poster-first hero footage. The poster <img> is the LCP; the clip is picked and
 * loaded only once the page is idle, fades in once it actually plays, and pauses
 * whenever the hero is off screen. Reduced motion or Save-Data: poster only.
 */
export function HeroVideo({ video }: { video: HeroVideoConfig }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (reduced.matches || conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? "")) return;
    const portrait = window.matchMedia("(max-aspect-ratio: 3/4)").matches;
    return afterLoadIdle(() => void pickHeroVideo(video, portrait).then(setSrc), 200);
  }, [video]);

  useEffect(() => {
    const vid = ref.current;
    const hero = document.getElementById("hero");
    if (!src || !vid || !hero) return;
    el = vid;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) vid.pause();
      else if (!userPaused) playWithRescue(vid);
    });
    io.observe(hero);
    return () => {
      io.disconnect();
      if (el === vid) el = null;
      set("off");
    };
  }, [src]);

  if (!src) return null;
  return (
    <video
      ref={ref}
      className="s-hero__video"
      data-playing={playing || undefined}
      src={src}
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => {
        setPlaying(true);
        set("playing");
      }}
      onPause={() => {
        setPlaying(false);
        set("paused");
      }}
      onError={() => {
        setPlaying(false);
        set("off");
      }}
    />
  );
}

/** Pause/play for the hero footage (WCAG 2.2.2). Shown only once the clip exists. */
export function VideoToggle() {
  const s = useSyncExternalStore(subscribe, () => state, () => "off" as State);
  if (s === "off") return null;
  const playing = s === "playing";
  return (
    <button
      type="button"
      className="s-hero__toggle"
      aria-label={playing ? "Pause background video" : "Play background video"}
      onClick={() => {
        if (!el) return;
        if (playing) {
          userPaused = true;
          el.pause();
        } else {
          userPaused = false;
          el.play().catch(() => {});
        }
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        {playing ? (
          <>
            <rect x="4" y="3" width="2" height="10" />
            <rect x="10" y="3" width="2" height="10" />
          </>
        ) : (
          <path d="M5 3l8 5-8 5z" />
        )}
      </svg>
    </button>
  );
}
