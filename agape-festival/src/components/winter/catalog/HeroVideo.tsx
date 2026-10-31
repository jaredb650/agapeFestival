"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { pickHeroVideo } from "@/components/winter/load/videoSource";
import { afterLoadIdle } from "@/components/winter/page/idle";
import { playWithRescue } from "@/components/winter/page/GestureRescue";
import type { HeroVideo as HeroVideoConfig } from "@/components/winter/page/media";

// The video and its pause button sit in different parts of the hero, so they share this tiny store.
type State = "off" | "playing" | "paused";
let state: State = "off";
let userPaused = false;
let videoEl: HTMLVideoElement | null = null;
const subs = new Set<() => void>();
const setState = (s: State) => {
  if (s === state) return;
  state = s;
  subs.forEach((f) => f());
};
const subscribe = (cb: () => void) => {
  subs.add(cb);
  return () => void subs.delete(cb);
};

/**
 * Poster-first hero video. The still is the LCP; the clip is chosen after load
 * (codec + portrait crop), fades in only once it is actually playing, and is
 * paused whenever the hero is mostly off screen.
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
    videoEl = vid;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) vid.pause();
        else if (!userPaused) playWithRescue(vid);
      },
      { rootMargin: "-50% 0px 0px 0px" },
    );
    io.observe(hero);
    if (!userPaused) playWithRescue(vid);
    return () => {
      io.disconnect();
      if (videoEl === vid) videoEl = null;
      setState("off");
    };
  }, [src]);

  if (!src) return null;
  return (
    <video
      ref={ref}
      className="cat-hero__video"
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
        setState("playing");
      }}
      onPause={() => {
        setPlaying(false);
        setState("paused");
      }}
      onError={() => {
        setPlaying(false);
        setState("off");
      }}
    />
  );
}

/** Pause / play for the hero video (WCAG 2.2.2). Hidden until the video exists. */
export function HeroVideoToggle() {
  const s = useSyncExternalStore(subscribe, () => state, () => "off" as State);
  if (s === "off") return null;
  const isPlaying = s === "playing";
  return (
    <button
      type="button"
      className="cat-hero__toggle"
      aria-label={isPlaying ? "Pause background video" : "Play background video"}
      onClick={() => {
        const vid = videoEl;
        if (!vid) return;
        if (isPlaying) {
          userPaused = true;
          vid.pause();
        } else {
          userPaused = false;
          vid.play().catch(() => {});
        }
      }}
    >
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        {isPlaying ? (
          <>
            <rect x="4" y="2" width="2" height="12" />
            <rect x="10" y="2" width="2" height="12" />
          </>
        ) : (
          <path d="M4 2 14 8 4 14Z" />
        )}
      </svg>
    </button>
  );
}
