"use client";

import { useEffect, useRef, useState } from "react";
import { afterLoadIdle } from "@/components/winter/page/idle";
import { playWithRescue } from "@/components/winter/page/GestureRescue";
import { pickHeroVideo } from "@/components/winter/load/videoSource";
import type { HeroMedia } from "@/components/winter/page/media";
import { Icon } from "./Icon";

/**
 * The hero footage, as on the old landing: the still paints first (it is the
 * LCP image and is preloaded), the video loads after the page is idle and
 * fades in only once it is actually playing (iOS Low Power Mode safe). It
 * pauses whenever the hero is off screen. One quiet pause/play control.
 */
export function HeroBackdrop({ hero, portraitQuery }: { hero: HeroMedia; portraitQuery: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);
  const video = hero.video;

  useEffect(() => {
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (reduced.matches || conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? "")) return;
    const portrait = window.matchMedia(portraitQuery).matches;
    return afterLoadIdle(() => void pickHeroVideo(video, portrait).then(setSrc), 200);
  }, [video, portraitQuery]);

  useEffect(() => {
    const vid = ref.current;
    const section = vid?.closest("section");
    if (!src || !vid || !section) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) vid.pause();
      else if (!userPaused.current) playWithRescue(vid);
    });
    io.observe(section);
    return () => io.disconnect();
  }, [src]);

  const toggle = () => {
    const vid = ref.current;
    if (!vid) return;
    if (vid.paused) {
      userPaused.current = false;
      vid.play().catch(() => {});
    } else {
      userPaused.current = true;
      vid.pause();
    }
  };

  return (
    <>
      <div className="fr-hero__media" aria-hidden="true">
        <picture>
          {hero.mobile.src !== hero.desktop.src && (
            <source media={portraitQuery} srcSet={hero.mobile.src} width={hero.mobile.width} height={hero.mobile.height} />
          )}
          <img className="fr-hero__still" src={hero.desktop.src} width={hero.desktop.width} height={hero.desktop.height} alt="" fetchPriority="high" />
        </picture>
        {src && (
          <video
            ref={ref}
            className="fr-hero__video"
            data-playing={playing || undefined}
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
        <div className="fr-hero__scrim" />
      </div>
      {src && (
        <button type="button" className="fr-hero__toggle" onClick={toggle} aria-label={playing ? "Pause background video" : "Play background video"}>
          <Icon name={playing ? "pause" : "play"} size={16} />
        </button>
      )}
    </>
  );
}
