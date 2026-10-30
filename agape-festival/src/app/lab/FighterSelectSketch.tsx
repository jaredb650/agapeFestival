"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Frame, GlassWindow, HudLabel, Redaction } from "@/components/winter/ui";
import { ARTISTS, ARTIST_PENDING, type ArtistEntry } from "@/data/winter";

// Deterministic shuffle so the grid isn't ordered by day (and SSR matches).
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

const keyOf = (a: ArtistEntry) => a.slug;

export function FighterSelectSketch({ poster, flashGeaHeadshot }: { poster: string; flashGeaHeadshot: string }) {
  const roster = useMemo(() => shuffled(ARTISTS, 11), []);
  const [selected, setSelected] = useState<string>("flash-gea");
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const current = roster.find((a) => keyOf(a) === selected) ?? roster[0];
  const headshot = (a: ArtistEntry) => (a.kind === "artist" && a.slug === "flash-gea" ? flashGeaHeadshot : null);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = roster.findIndex((a) => keyOf(a) === selected);
    const cols = Number(getComputedStyle(e.currentTarget).getPropertyValue("--cols")) || 6;
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    const next = Math.min(roster.length - 1, Math.max(0, idx + step));
    setSelected(keyOf(roster[next]));
    tiles.current[next]?.focus();
  };

  const locked = current.kind === "tba";
  const img = headshot(current);
  const named = roster.filter((a) => a.kind === "artist").length;

  return (
    <GlassWindow
      skin="chrome"
      active
      flush
      title="Artist select"
      meta={`${named}/${roster.length}`}
      status={
        <>
          <span>P1 · {locked ? "LOCKED" : current.displayName}</span>
          <span>← → ↑ ↓ select</span>
        </>
      }
      className="fs"
    >
      {/* ---- P1 panel ---- */}
      <div className="fs-p1">
        <Frame accent className="fs-p1__media">
          {img ? (
            <img src={img} alt="" className="fs-p1__img" />
          ) : (
            <div className="fs-p1__nosignal" style={{ backgroundImage: `url(${poster})` }}>
              <HudLabel size="nano" tone="frost">{locked ? "Encrypted" : "Preview · no clip yet"}</HudLabel>
            </div>
          )}
          <span className="fs-p1__tag">P1</span>
        </Frame>
        <div className="fs-p1__info" aria-live="polite">
          <div className="fs-p1__badges">
            <span className="fs-badge">DAY {current.day}</span>
            {!locked && current.kind === "artist" && current.bio && <span className="fs-badge fs-badge--quiet">Intel on file</span>}
          </div>
          <h3 className="w-h1 fs-p1__name">
            {locked ? <Redaction length={5.5} seed={current.slug.length * 7} /> : current.displayName}
          </h3>
          {locked ? (
            <HudLabel font="pixel" tone="frost">{ARTIST_PENDING.locked}</HudLabel>
          ) : current.kind === "artist" && current.bio ? (
            <p className="w-body fs-p1__bio">{current.bio}</p>
          ) : (
            <HudLabel font="pixel" tone="frost">{ARTIST_PENDING.bio}</HudLabel>
          )}
        </div>
      </div>

      {/* ---- Roster grid ---- */}
      <div className="fs-grid" role="listbox" aria-label="Artists" onKeyDown={onKey}>
        {roster.map((a, i) => {
          const isSel = keyOf(a) === selected;
          const src = headshot(a);
          return (
            <button
              key={keyOf(a)}
              ref={(el) => {
                tiles.current[i] = el;
              }}
              type="button"
              role="option"
              aria-selected={isSel}
              tabIndex={isSel ? 0 : -1}
              className={`fs-tile${isSel ? " w-selected" : ""}${a.kind === "tba" ? " fs-tile--locked" : ""}`}
              onPointerEnter={(e) => e.pointerType === "mouse" && setSelected(keyOf(a))}
              onClick={() => setSelected(keyOf(a))}
              aria-label={a.kind === "tba" ? "Locked: to be revealed" : a.name}
            >
              {a.kind === "tba" ? (
                <span className="fs-tile__locked" aria-hidden="true">?</span>
              ) : src ? (
                <img src={src} alt="" className="fs-tile__img" loading="lazy" />
              ) : (
                <span className="fs-tile__placeholder" style={{ backgroundImage: `url(${poster})`, backgroundPosition: `${20 + ((i * 37) % 60)}% ${10 + ((i * 53) % 70)}%` }}>
                  <svg className="fs-tile__silhouette" viewBox="0 0 40 50" aria-hidden="true">
                    <circle cx="20" cy="17" r="8" />
                    <path d="M4 50c0-11 7-18 16-18s16 7 16 18z" />
                  </svg>
                </span>
              )}
              <span className="fs-tile__name">
                {a.kind === "tba" ? <Redaction length={3.4} seed={i * 5 + 3} label="Locked" /> : a.displayName}
              </span>
              {isSel && <span className="fs-tile__p1">P1</span>}
            </button>
          );
        })}
      </div>
    </GlassWindow>
  );
}
