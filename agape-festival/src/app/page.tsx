"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import GlitchLogo from "@/components/GlitchLogo";

// Midnight in New York. Replace when the actual doors time is announced.
const EVENT_START = Date.parse("2027-02-19T00:00:00-05:00");
// Web encode of 05 KOBOSIL.mp4, trimmed to source 00:12 through the end.
const BACKGROUND_VIDEO = "/assets/videos/winter-kobosil.mp4";
// Source video 00:18.5: drone passing through the crowd.
const BACKGROUND_POSTER = "/assets/videos/posters/winter-crowd.jpg";

function remainingTime(now: number) {
  const seconds = Math.max(0, Math.floor((EVENT_START - now) / 1000));
  return [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24,
    Math.floor(seconds / 60) % 60, seconds % 60];
}

export default function Home() {
  const video = useRef<HTMLVideoElement>(null);
  const content = useRef<HTMLElement>(null);
  const [remaining, setRemaining] = useState<number[] | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const update = () => setRemaining(remainingTime(Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotion = () => {
      if (motion.matches) {
        video.current?.pause();
        setPaused(true);
      }
    };
    handleMotion();
    if (!motion.matches) {
      video.current?.play().then(() => {
        setVideoReady(true);
        setPaused(false);
      }).catch(() => {
        setVideoReady(false);
        setPaused(true);
      });
    }
    motion.addEventListener("change", handleMotion);
    return () => { clearInterval(timer); motion.removeEventListener("change", handleMotion); };
  }, []);


  useEffect(() => {
    const element = content.current;
    const viewport = element?.parentElement;
    if (!element || !viewport) return;
    const fit = () => {
      const available = Math.max(1, viewport.clientHeight - 112);
      element.style.setProperty("--content-scale", String(Math.min(1, available / element.offsetHeight)));
    };
    const observer = new ResizeObserver(fit);
    observer.observe(viewport);
    observer.observe(element);
    fit();
    return () => observer.disconnect();
  }, []);

  const toggleVideo = () => {
    const element = video.current;
    if (!element) return;
    if (element.paused) {
      element.play().then(() => setPaused(false)).catch(() => setPaused(true));
    } else {
      element.pause();
      setPaused(true);
    }
  };

  return (
    <main className="winter-landing">
      <div className="winter-background is-ready" aria-hidden="true">
        <Image className="winter-poster" src={BACKGROUND_POSTER} alt="" fill sizes="100vw" priority />
        <video ref={video} src={BACKGROUND_VIDEO} poster={BACKGROUND_POSTER}
          className={videoReady ? "is-playing" : ""} muted playsInline autoPlay loop preload="auto"
          onError={() => { setVideoReady(false); setPaused(true); }}
          onPlaying={() => { setVideoReady(true); setPaused(false); }}
          onPause={() => setPaused(true)} />
      </div>
      <div className="winter-vignette" aria-hidden="true" />
      <div className="winter-scanlines" aria-hidden="true" />
      <div className="winter-frame" aria-hidden="true"><i /><i /><i /><i /></div>

      <section ref={content} className="winter-content" aria-label="ÄGAPĒ Festival Winter Edition">
        <h1 className="winter-logo">
          <GlitchLogo imageSrc="/assets/logos/aFestWhite.png" />
        </h1>
        <div className="winter-details">
          <h2 className="winter-edition"><span>Winter Edition</span></h2>
          <p className="winter-date"><span>Feb 19–20</span></p>
        </div>
        <div className="winter-reveal">
          <div className="winter-divider" aria-hidden="true" />
          <div className="winter-countdown" data-nosnippet role="timer" aria-label="Countdown to February 19, 2027, midnight New York time">
            {["Days", "Hours", "Minutes", "Seconds"].map((label, index) => (
              <div className="winter-time" key={label}>
                <span className="winter-number">{remaining ? String(remaining[index]).padStart(2, "0") : "––"}</span>
                <span className="winter-unit">{label}</span>
              </div>
            ))}
          </div>
          <a className="winter-notify" href="https://laylo.com/agapenyc/GHSBKw" target="_blank" rel="noopener noreferrer">
            Get notified
          </a>
        </div>
      </section>
      <button className="winter-motion" type="button" onClick={toggleVideo}
        aria-label={paused ? "Play background video" : "Pause background video"}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          {paused ? <path d="M4 2 14 8 4 14Z" /> : <><rect x="4" y="2" width="2" height="12" /><rect x="10" y="2" width="2" height="12" /></>}
        </svg>
      </button>
    </main>
  );
}
