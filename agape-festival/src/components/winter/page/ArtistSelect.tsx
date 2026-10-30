"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Frame, GlassWindow, HudLabel, Redaction, cx } from "@/components/winter/ui";
import type { ArtistEntry, NamedArtist } from "@/data/winter";
import { playWithRescue } from "./GestureRescue";
import type { Still } from "./media";

interface Props {
  artists: ArtistEntry[];
  dayDates: Record<1 | 2, string>;
  noSignal: Still;
  pending: { bio: string; locked: string };
}

// Deterministic shuffle: the grid isn't ordered by day, and SSR matches the client.
function shuffled<T>(list: readonly T[], seed: number): T[] {
  const out = [...list];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Two-letter tile monogram: initials for two-word names, first two letters otherwise. */
function monogram(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}

const DEFAULT = "flash-gea";

export function ArtistSelect({ artists, dayDates, noSignal, pending }: Props) {
  const roster = useMemo(() => shuffled(artists, 11), [artists]);
  const [selected, setSelectedRaw] = useState<string>(DEFAULT);
  const [bioOpen, setBioOpen] = useState(false);
  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [announce, setAnnounce] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rouletteRef = useRef<number[]>([]);

  // Switching artist resets the bio toggle and the clip's playing state.
  const setSelected = (slug: string) => {
    setSelectedRaw(slug);
    setBioOpen(false);
    setPlaying(false);
  };

  const current = roster.find((a) => a.slug === selected) ?? roster[0];
  const named = roster.filter((a): a is NamedArtist => a.kind === "artist");
  const locked = current.kind === "tba";
  const clip = current.kind === "artist" ? current.clip : null;

  // Load footage only near the viewport; pause it when far away.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "300px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);


  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (near && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) playWithRescue(v);
    else v.pause();
  }, [near, clip]);

  // Lineup rows link here with data-artist: preselect that artist.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>("a[data-artist]");
      if (a?.dataset.artist) setSelected(a.dataset.artist);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => () => rouletteRef.current.forEach(clearTimeout), []);

  const select = (slug: string, focus = false) => {
    setSelected(slug);
    if (focus) tiles.current[roster.findIndex((a) => a.slug === slug)]?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = roster.findIndex((a) => a.slug === selected);
    const cols = Number(getComputedStyle(gridRef.current!).getPropertyValue("--cols")) || 6;
    let next: number | undefined;
    if (e.key === "ArrowRight") next = (idx + 1) % roster.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + roster.length) % roster.length;
    else if (e.key === "ArrowDown") next = Math.min(roster.length - 1, idx + cols);
    else if (e.key === "ArrowUp") next = Math.max(0, idx - cols);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = roster.length - 1;
    if (next === undefined) return;
    e.preventDefault();
    select(roster[next].slug, true);
  };

  const random = () => {
    rouletteRef.current.forEach(clearTimeout);
    const pool = named.filter((a) => a.slug !== selected);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const finish = () => {
      setSelected(pick.slug);
      setAnnounce(`Selected ${pick.name}`);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return finish();
    // Fighting-game roulette: flicker across the roster, slowing down, then land.
    let t = 0;
    rouletteRef.current = Array.from({ length: 9 }, (_, i) => {
      t += 45 + i * i * 4;
      const slug = roster[Math.floor(Math.random() * roster.length)].slug;
      return window.setTimeout(() => setSelected(slug), t);
    });
    rouletteRef.current.push(window.setTimeout(finish, t + 160));
  };

  const dayLine = `Day ${current.day} · ${dayDates[current.day]}`;

  return (
    <div ref={rootRef}>
      <GlassWindow
        skin="chrome"
        active
        flush
        as="div"
        title="Artist select"
        aria-label="Artist select"
        meta={`${named.length} + ${roster.length - named.length} locked`}
        className="was"
        status={
          <>
            <span>P1 · {locked ? pending.locked : current.displayName}</span>
            <span className="was__keys">← → ↑ ↓ select</span>
          </>
        }
      >
        {/* ---------------- P1 panel ---------------- */}
        <div className="was-p1">
          <Frame accent className="was-p1__media">
            {current.kind === "artist" && clip ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.clipPoster ?? current.headshotLarge ?? ""} alt={`${current.name} performing`} className="was-p1__poster" />
                {near && (
                  <video
                    key={clip}
                    ref={videoRef}
                    className="was-p1__video"
                    data-playing={playing || undefined}
                    src={clip}
                    poster={current.clipPoster ?? undefined}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="metadata"
                    disablePictureInPicture
                    aria-hidden="true"
                    tabIndex={-1}
                    onPlaying={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onError={() => setPlaying(false)}
                  />
                )}
              </>
            ) : (
              <div className={cx("was-p1__nosignal", locked && "is-locked")}>
                {!locked && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={noSignal.src} width={noSignal.width} height={noSignal.height} alt="" loading="lazy" decoding="async" />
                )}
                <span className="was-p1__type" aria-hidden="true">
                  {locked ? "?" : current.displayName}
                </span>
                <HudLabel size="micro" tone="frost" className="was-p1__signal">
                  {locked ? "Encrypted" : "No signal · footage pending"}
                </HudLabel>
              </div>
            )}
            <span className="was-tag" aria-hidden="true">P1</span>
          </Frame>

          <div className="was-p1__info">
            <div className="was-p1__badges">
              <span className="was-badge">{dayLine}</span>
            </div>
            <h3 className="w-h1 was-p1__name">
              {locked ? <Redaction length={5.5} seed={current.slug.length * 7 + 1} label={pending.locked} /> : current.displayName}
            </h3>
            {locked ? (
              <HudLabel font="pixel" tone="frost">{pending.locked}</HudLabel>
            ) : current.kind === "artist" && current.bio ? (
              <>
                <p id="was-bio" className="w-body was-p1__bio" data-open={bioOpen || undefined}>
                  {current.bio}
                </p>
                <div className="was-p1__actions">
                  <button type="button" className="w-btn w-btn--link was-more" aria-expanded={bioOpen} aria-controls="was-bio" onClick={() => setBioOpen((o) => !o)}>
                    <span className="w-btn__label">{bioOpen ? "Less intel" : "Full bio"}</span>
                  </button>
                  {current.socials?.map((s) => (
                    <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="w-btn w-btn--link">
                      <span className="w-btn__label">{s.handle ?? s.platform}</span>
                      <svg className="w-btn__arrow" viewBox="0 0 22 10" fill="none" aria-hidden="true">
                        <path d="M0 5h20M16 1l4 4-4 4" stroke="currentColor" strokeWidth="1.25" />
                      </svg>
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <div className="was-p1__pending">
                <HudLabel font="pixel" tone="frost">{pending.bio}</HudLabel>
                <p className="w-small">Photo, footage and bio are on the way.</p>
              </div>
            )}
          </div>
        </div>

        {/* ---------------- Roster ---------------- */}
        <div ref={gridRef} className="was-grid">
          <div className="was-grid__group" role="radiogroup" aria-label="Artists" onKeyDown={onKey}>
            {roster.map((a, i) => {
              const isSel = a.slug === selected;
              const label = a.kind === "tba" ? `Locked slot ${a.slug.slice(-1)}, day ${a.day}: ${pending.locked.toLowerCase()}` : `${a.name}, day ${a.day}`;
              return (
                <button
                  key={a.slug}
                  ref={(el) => {
                    tiles.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={isSel}
                  aria-label={label}
                  tabIndex={isSel ? 0 : -1}
                  className={cx("was-tile", isSel && "w-selected", a.kind === "tba" && "was-tile--locked")}
                  data-day={a.day}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setSelected(a.slug)}
                  onClick={() => setSelected(a.slug)}
                >
                  {a.kind === "tba" ? (
                    <span className="was-tile__locked" aria-hidden="true">?</span>
                  ) : a.headshot ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.headshot} alt="" className="was-tile__img" loading="lazy" decoding="async" width={600} height={600} />
                  ) : (
                    <span className="was-tile__mono" aria-hidden="true">{monogram(a.displayName)}</span>
                  )}
                  <span className="was-tile__day" aria-hidden="true">D{a.day}</span>
                  <span className="was-tile__name" aria-hidden="true">
                    {a.kind === "tba" ? <Redaction length={3.2} seed={i * 5 + 3} label="" /> : a.displayName}
                  </span>
                  {isSel && <span className="was-tag was-tag--tile" aria-hidden="true">P1</span>}
                </button>
              );
            })}
          </div>
          <button type="button" className="was-tile was-tile--random" onClick={random} aria-label="Random select">
            <svg viewBox="0 0 24 24" className="was-tile__dice" aria-hidden="true">
              <path d="M3 7h3.5c2.2 0 3.6 1 4.8 3l1.4 2.4c1.2 2 2.6 3 4.8 3H21M3 17h3.5c1.6 0 2.8-.6 3.8-1.7M13.7 8.7C14.7 7.6 15.9 7 17.5 7H21M18.5 4.5 21 7l-2.5 2.5M18.5 13 21 15.5 18.5 18" fill="none" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            <span className="was-tile__name" aria-hidden="true">Random</span>
          </button>
        </div>
      </GlassWindow>
      <p className="w-sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
