"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { GALLERY } from "@/data/gallery";

function Chevron({ up = false }: { up?: boolean }) {
  return <svg width="24" height="16" viewBox="0 0 24 16" fill="none" aria-hidden="true">
    <path d={up ? "M3 12 12 4 21 12" : "M3 4 12 12 21 4"} stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

const wrap = (index: number) => ((index % GALLERY.length) + GALLERY.length) % GALLERY.length;

export default function FestivalExperience({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [section, setSection] = useState(0);
  const [visited, setVisited] = useState(false);
  const [arrowReady, setArrowReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const position = useRef(0);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const snap = useRef<{ from: number; to: number; start: number } | null>(null);
  const sectionRef = useRef(0);
  const lockUntil = useRef(0);
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const cancelClick = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const downButton = useRef<HTMLButtonElement>(null);

  const go = useCallback((next: number, focus = false) => {
    if (sectionRef.current === next || Date.now() < lockUntil.current) return;
    sectionRef.current = next;
    lockUntil.current = Date.now() + 1100;
    setVisited(true);
    setSection(next);
    if (focus) requestAnimationFrame(() => (next ? backButton : downButton).current?.focus({ preventScroll: true }));
  }, []);

  const snapTo = useCallback((target: number) => {
    setAuto(false);
    snap.current = { from: position.current, to: target, start: performance.now() };
  }, []);

  const advance = useCallback((step: number) => {
    snapTo(Math.round(position.current) + step);
  }, [snapTo]);

  const toggleAuto = () => {
    if (auto) snapTo(Math.round(position.current));
    else { snap.current = null; setAuto(true); }
  };

  useEffect(() => {
    const timer = setTimeout(() => setArrowReady(true), 7000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visited) return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const elapsed = now - previous;
      previous = now;
      if (section && !document.hidden) {
        if (snap.current) {
          const { from, to, start } = snap.current;
          const progress = reduced ? 1 : Math.min(1, (now - start) / 450);
          position.current = from + (to - from) * (1 - Math.pow(1 - progress, 3));
          if (progress === 1) snap.current = null;
        } else if (auto && !reduced) {
          // Advance at a constant speed, independent of display refresh rate.
          position.current += Math.min(elapsed, 100) * 1.5 / 6500;
        }
      }
      const nearest = wrap(Math.round(position.current));
      setIndex(current => current === nearest ? current : nearest);
      cards.current.forEach((card, photoIndex) => {
        if (!card) return;
        // Recycle only outside the viewport so the loop has no visible seam.
        const offset = wrap(photoIndex - position.current + GALLERY.length / 2) - GALLERY.length / 2;
        const hidden = Math.abs(offset) > 3;
        // Hidden cards only need their final position written once.
        if (hidden && card.style.visibility === "hidden") return;
        card.style.transform = `translateX(${offset * 106}%)`;
        card.style.visibility = hidden ? "hidden" : "visible";
      });
      // Nothing moves while the landing card covers the deck — stop looping
      // (the effect restarts when the gallery is opened again).
      if (!section) return;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visited, section, auto, reduced]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let totalX = 0, totalY = 0, last = 0;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      const now = Date.now();
      if (now - last > 180) { totalX = 0; totalY = 0; }
      last = now;
      if (now < lockUntil.current) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      totalX += event.deltaX * unit;
      totalY += event.deltaY * unit;
      if (Math.abs(totalY) > 55 && Math.abs(totalY) > Math.abs(totalX)) {
        go(totalY > 0 ? 1 : 0);
        totalX = 0; totalY = 0;
      } else if (sectionRef.current === 1 && Math.abs(totalX) > 65) {
        advance(totalX > 0 ? 1 : -1);
        lockUntil.current = now + 700;
        totalX = 0; totalY = 0;
      }
    };
    const key = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || (event.target as HTMLElement).closest("input,textarea,select")) return;
      if (["ArrowDown", "PageDown", "ArrowUp", "PageUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        go(["ArrowDown", "PageDown", "End"].includes(event.key) ? 1 : 0, true);
      } else if (sectionRef.current === 1 && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault(); advance(event.key === "ArrowRight" ? 1 : -1);
      }
    };
    element.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);
    return () => { element.removeEventListener("wheel", wheel); window.removeEventListener("keydown", key); };
  }, [go, advance]);

  return <div ref={root} className={`festival-experience ${section ? "show-gallery" : "show-landing"}`}
    onPointerDown={event => {
      cancelClick.current = false;
      if (!event.isPrimary || event.button !== 0 || (event.target as HTMLElement).closest(".glitch-logo, a, button:not(.gallery-card)")) return;
      swipe.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
      cancelClick.current = false;
    }}
    onPointerUp={event => {
      const start = swipe.current;
      swipe.current = null;
      if (!start || start.id !== event.pointerId) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 45) return;
      cancelClick.current = true;
      if (Date.now() < lockUntil.current) return;
      if (Math.abs(dy) > Math.abs(dx) * 1.15) go(dy < 0 ? 1 : 0);
      else if (sectionRef.current === 1 && Math.abs(dx) > Math.abs(dy)) {
        advance(dx < 0 ? 1 : -1); lockUntil.current = Date.now() + 550;
      }
    }}
    onPointerCancel={() => { swipe.current = null; }}
    onClickCapture={event => { if (cancelClick.current) { event.preventDefault(); event.stopPropagation(); cancelClick.current = false; } }}>
    <motion.div className="landing-card" inert={section === 1} aria-hidden={section === 1}
      animate={{ y: section ? "-112%" : "0%", rotate: 0, scale: 1 }}
      transition={{ duration: reduced ? 0 : .95, ease: [.76, 0, .24, 1] }}>
      {children}
      <button ref={downButton} type="button" className={`gallery-invitation ${arrowReady ? "is-visible" : ""}`}
        tabIndex={arrowReady ? 0 : -1} aria-hidden={!arrowReady}
        onClick={() => go(1, true)} aria-label="Explore photos from the previous festival">
        <Chevron />
      </button>
    </motion.div>

    <motion.section className="gallery-screen" data-nosnippet aria-label="September 2026 festival photo gallery" inert={section === 0} aria-hidden={section === 0}
      initial={false} animate={{ scale: 1, y: section || reduced ? "0%" : "9%", opacity: section ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : 1.05, ease: [.22, 1, .36, 1] }}>
      {visited && <>
        <div className="gallery-ambient" aria-hidden="true" style={{ backgroundImage: `url("${GALLERY[index].src}")` }} />
        <button ref={backButton} className="gallery-return" onClick={() => go(0, true)} aria-label="Return to festival landing page"><Chevron up /></button>
        <header className="gallery-header">
          <div><span className="gallery-eyebrow">ÄGAPE FESTIVAL / 2026</span><h2>The first edition</h2></div>

        </header>
        <div className="gallery-stage" aria-roledescription="carousel" aria-label="Festival photographs">
          {GALLERY.map((photo, photoIndex) => {
            const centered = photoIndex === index;
            return <button type="button" key={photo.src}
              ref={element => { cards.current[photoIndex] = element; }}
              className={`gallery-card ${centered ? "is-center" : ""}`}
              style={{ transform: `translateX(${(wrap(photoIndex + GALLERY.length / 2) - GALLERY.length / 2) * 106}%)` }}
              onClick={() => {
                const nearest = Math.round(position.current);
                const offset = wrap(photoIndex - nearest + GALLERY.length / 2) - GALLERY.length / 2;
                snapTo(nearest + offset);
              }}
              tabIndex={centered ? 0 : -1}
              aria-label={centered ? photo.alt : `Show photo ${photoIndex + 1}: ${photo.alt}`}>
              <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 600px) 78vw, 48vw" draggable={false} />
              <span className="gallery-photo-number" aria-hidden="true">{String(photoIndex + 1).padStart(2, "0")}</span>
            </button>;
          })}
        </div>
        <footer className="gallery-controls">
          <div className="gallery-caption"><span>SEPTEMBER 05, 2026</span><span>PHOTOGRAPHY / @EMILYGUZZ</span></div>
          <div className="gallery-navigation">
            <button aria-label="Previous photo" onClick={() => advance(-1)}>←</button>
            <span className="gallery-counter" aria-live={auto ? "off" : "polite"}>{String(index + 1).padStart(2, "0")}<span> / {GALLERY.length}</span></span>
            <button aria-label="Next photo" onClick={() => advance(1)}>→</button>
            <button className="gallery-auto" aria-label={auto && !reduced ? "Pause slideshow" : "Play slideshow"} onClick={toggleAuto} disabled={!!reduced}>{auto && !reduced ? "Ⅱ" : "▷"}</button>
          </div>
        </footer>
        <div className="gallery-progress" aria-hidden="true">{GALLERY.map((photo, i) => <span key={photo.src} className={i === index ? "active" : ""} />)}</div>
      </>}
    </motion.section>
  </div>;
}
