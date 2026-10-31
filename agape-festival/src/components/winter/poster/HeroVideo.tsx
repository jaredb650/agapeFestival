"use client";

import { useEffect, useRef, useState } from "react";
import { pickHeroVideo } from "@/components/winter/load/videoSource";
import { afterLoadIdle } from "@/components/winter/page/idle";
import { playWithRescue } from "@/components/winter/page/GestureRescue";
import type { HeroVideo as HeroVideoConfig } from "@/components/winter/page/media";
import { Pause, Play } from "./icons";

/**
 * The Kobosil clip over the poster still (the still is the LCP and stays under
 * it). The source is chosen after load, the video fades in only once it is
 * actually playing (iOS Low Power Mode safe), and it pauses while the hero is
 * off screen. The pause control covers WCAG 2.2.2 (motion longer than 5 s).
 */
export function HeroVideo({ video }: { video: HeroVideoConfig }) {
  const ref = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
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
    const hero = vid?.closest("section");
    if (!src || !vid || !hero) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) vid.pause();
        else if (!userPaused.current) playWithRescue(vid);
      },
      { rootMargin: "-40% 0px 0px 0px" },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [src]);

  if (!src) return null;
  return (
    <>
      <video
        ref={ref}
        className="pp-hero__video"
        data-playing={playing || undefined}
        src={src}
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setPlaying(false)}
      />
      <button
        type="button"
        className="pp-hero__toggle"
        aria-label={playing ? "Pause background video" : "Play background video"}
        onClick={() => {
          const vid = ref.current;
          if (!vid) return;
          if (playing) {
            userPaused.current = true;
            vid.pause();
          } else {
            userPaused.current = false;
            vid.play().catch(() => {});
          }
        }}
      >
        {playing ? <Pause /> : <Play />}
      </button>
    </>
  );
}
