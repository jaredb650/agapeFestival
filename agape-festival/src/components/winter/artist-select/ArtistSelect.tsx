"use client";

import { startTransition, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent, type Ref } from "react";
import { GlitchLayer } from "@/components/winter/ui";
import type { ArtistEntry, DayNumber, WinterDay } from "@/data/winter";
import { BioWindow } from "./BioWindow";
import { boxVars, emblemBox, randomBox, toClipPath, toSvgPoints } from "./geometry";
import { useMedia, useReducedMotion, useViewport } from "./hooks";
import { Profile } from "./Profile";
import { buildRoster, isNamed, shortDate, type Slot } from "./roster";
import { Splash } from "./Splash";
import { RandomTile, Tile } from "./Tile";
import "@/styles/artist-select.css";

interface Img {
  src: string;
  width: number;
  height: number;
}

export interface ArtistSelectMedia {
  /** Background scrub frames dir (f-000.webp …), trailing slash. */
  frameDir: string;
  /** One tower still, cropped differently behind each typographic tile. */
  tileStill: string;
  /** ÄGAPĒ festival emblem (the plate at the top of the grid's centre channel). */
  emblem: Img;
}

export interface ArtistSelectProps {
  artists: readonly ArtistEntry[];
  days: readonly [WinterDay, WinterDay];
  media: ArtistSelectMedia;
  pending: { bio: string; locked: string };
  /** id of the section heading rendered here (the section's aria-labelledby). */
  headingId: string;
  title: string;
}

const WIDE_QUERY = "(min-width: 960px)";
/** Hover must rest this long on a tile before its splash loads (sweeping across the grid stays cheap). */
const HOVER_INTENT = 70;
/** After the pointer leaves the grid, the preview hands back to the locked act. */
const LEAVE_GRACE = 140;
// Fixed geometry (pure): the RANDOM wedge, the emblem plate.
const rnd = randomBox();
const emblem = emblemBox();

/**
 * The roster: ONE artist at a time. Their splash (footage or photo, the name,
 * the day, the bio) covers the whole area above the tile grid; the grid below
 * picks who. Day 1 tiles are white, Day 2 red. Hover / focus previews an act,
 * click / tap / Enter locks it in, and leaving the grid hands the splash back
 * to the locked act. Clicking anywhere on the banner (or its PROFILE chip)
 * opens the profile window: on desktop it unfolds upward from the bottom of
 * the banner to the title; on phones it opens over the roster. Phones show
 * one day of keys at a time (two rows) under the same splash.
 *
 * Performance contract: hovering never renders React by itself. Hover styling
 * is CSS :hover; a preview renders only after a 70ms rest, inside a
 * transition so pointer input always wins; the Random roulette is attribute
 * writes; the name decode writes textContent.
 */
export function ArtistSelect({ artists, days, media, pending, headingId, title }: ArtistSelectProps) {
  const { wings, pyramid } = useMemo(() => buildRoster(artists), [artists]);
  const slots = useMemo(() => [...wings[1].slots, ...wings[2].slots], [wings]);
  const bySlug = useMemo(() => new Map<string, Slot>(slots.map((s) => [s.entry.slug, s])), [slots]);
  // Open on the act with footage (Flash Gea leads Day 2), so the splash is never empty.
  const firstSlug: string = wings[2].slots[0]?.entry.slug ?? slots[0].entry.slug;

  /** The act the splash returns to. */
  const [locked, setLocked] = useState<string>(firstSlug);
  /** Hover / focus preview over the locked act. */
  const [preview, setPreview] = useState<string | null>(null);
  /** Roving-tabindex owner. Follows focus/press/keyboard, never hover. */
  const [cursor, setCursor] = useState<string>(firstSlug);
  /** Phones: the day whose keys are on the pad. */
  const [side, setSide] = useState<DayNumber>(() => bySlug.get(firstSlug)?.day ?? 1);
  /** The profile window (desktop: rises from the banner; phones: over the roster). */
  const [bioOpen, setBioOpen] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [announce, setAnnounce] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  // Tile buttons by slug (a plain Map in state, not a ref: the ref callbacks below write it outside render).
  const [tiles] = useState(() => new Map<string, HTMLButtonElement>());
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rollTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rollingRef = useRef(false);
  const rollEl = useRef<HTMLElement | null>(null);
  const bioOpenRef = useRef(false);
  const winFrameRef = useRef<HTMLDivElement>(null);
  /** Where focus goes back to when the window closes (the banner or the chip). */
  const returnFocus = useRef<HTMLElement | null>(null);
  // Mirrors for synchronous reads inside handlers: the locked act, and the last act locked on each day (phone day switch).
  const lockedRef = useRef<string>(firstSlug);
  const memory = useRef<Record<DayNumber, string>>({ 1: wings[1].slots[0].entry.slug, 2: firstSlug });

  const reduced = useReducedMotion();
  const wide = useMedia(WIDE_QUERY);
  const { near, inView } = useViewport(rootRef);
  const profileId = `${headingId}-profile`;
  const windowId = `${headingId}-window`;

  const clearTimers = () => {
    clearTimeout(hoverTimer.current);
    clearTimeout(leaveTimer.current);
  };

  // ---- Lock + preview --------------------------------------------------------

  const lock = useCallback(
    (slug: string) => {
      const slot = bySlug.get(slug);
      if (!slot) return;
      clearTimeout(hoverTimer.current);
      clearTimeout(leaveTimer.current);
      lockedRef.current = slug;
      memory.current[slot.day] = slug;
      // Interruptible: a new hover/tap pre-empts this render instead of queueing behind it.
      startTransition(() => {
        setLocked(slug);
        setPreview(null);
        setCursor(slug);
        setSide(slot.day);
      });
      setAnnounce(`${isNamed(slot.entry) ? slot.entry.name : "Unannounced act"}, Day ${slot.day}.`);
    },
    [bySlug],
  );

  const showPreview = useCallback((slug: string | null) => {
    const next = slug === lockedRef.current ? null : slug;
    startTransition(() => setPreview(next));
  }, []);

  const onHover = useCallback(
    (slug: string) => {
      // While the profile window is open it shows the locked act: no previews under it.
      if (rollingRef.current || bioOpenRef.current) return;
      clearTimeout(leaveTimer.current);
      clearTimeout(hoverTimer.current);
      hoverTimer.current = setTimeout(() => showPreview(slug), HOVER_INTENT);
    },
    [showPreview],
  );

  const onFocusTile = useCallback(
    (slug: string) => {
      if (rollingRef.current) return;
      clearTimeout(leaveTimer.current);
      clearTimeout(hoverTimer.current);
      setCursor(slug);
      if (!bioOpenRef.current) showPreview(slug);
    },
    [showPreview],
  );

  const onPress = useCallback((slug: string) => !rollingRef.current && lock(slug), [lock]);

  const onFieldLeave = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || rollingRef.current) return;
    clearTimers();
    leaveTimer.current = setTimeout(() => showPreview(null), LEAVE_GRACE);
  };

  const onFieldBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (fieldRef.current?.contains(e.relatedTarget as Node | null)) return;
    if (fieldRef.current?.matches(":hover")) return;
    clearTimers();
    showPreview(null);
  };

  const focusSlug = (slug: string) => tiles.get(slug)?.focus({ preventScroll: true });

  // ---- Profile window: the banner, the PROFILE chip, or Enter on either opens it ----

  const shownSlug = preview ?? locked;

  const closeBio = useCallback(() => {
    if (!bioOpenRef.current) return;
    bioOpenRef.current = false;
    setBioOpen(false);
    const back = returnFocus.current;
    returnFocus.current = null;
    // Only hand focus back if it was inside the window (a click on a tile keeps its own focus).
    requestAnimationFrame(() => {
      const active = document.activeElement;
      if (back?.isConnected && (!active || active === document.body || winFrameRef.current?.contains(active))) back.focus({ preventScroll: true });
    });
  }, []);

  const openBio = useCallback(
    (from: HTMLElement | null) => {
      clearTimeout(hoverTimer.current);
      clearTimeout(leaveTimer.current);
      // The window profiles what is on screen: a live preview gets locked in first.
      if (preview) lock(preview);
      returnFocus.current = from;
      bioOpenRef.current = true;
      setBioOpen(true);
    },
    [preview, lock],
  );

  const toggleBio = useCallback(
    (e: { currentTarget: HTMLElement }) => (bioOpenRef.current ? closeBio() : openBio(e.currentTarget)),
    [closeBio, openBio],
  );

  // Pager in the window's status strip: step through the locked act's day.
  const onStep = useCallback(
    (dir: -1 | 1) => {
      const slot = bySlug.get(lockedRef.current);
      if (!slot) return;
      const list = wings[slot.day].slots;
      const at = list.findIndex((s) => s.entry.slug === slot.entry.slug);
      lock(list[(at + dir + list.length) % list.length].entry.slug);
    },
    [bySlug, wings, lock],
  );

  // Open window: Esc closes it, and so does a press anywhere outside it (the banner / chip toggle it themselves).
  useEffect(() => {
    if (!bioOpen) return;
    const onDown = (e: globalThis.PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || winFrameRef.current?.contains(t) || t.closest("[data-bio-trigger]")) return;
      closeBio();
    };
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && closeBio();
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [bioOpen, closeBio]);

  // ---- Phones: day switcher ------------------------------------------------------

  const showDay = (day: DayNumber) => {
    if (rollingRef.current) return;
    closeBio();
    lock(memory.current[day]);
  };

  // ---- RANDOM: the roulette is attribute writes; React renders once at the start and once on landing ----

  const flick = (slug: string | null) => {
    rollEl.current?.removeAttribute("data-roll");
    rollEl.current = null;
    if (!slug) return;
    const el = tiles.get(slug)?.parentElement ?? null;
    el?.setAttribute("data-roll", "");
    rollEl.current = el;
  };

  const roll = () => {
    if (rollingRef.current) return;
    // Desktop rolls the whole roster; the phone rolls the visible day.
    const inPlay = slots.filter((s) => isNamed(s.entry) && (wide || s.day === side));
    const pool = inPlay.filter((s) => s.entry.slug !== lockedRef.current);
    if (!pool.length) return;
    const landing = pool[Math.floor(Math.random() * pool.length)];
    const fieldHasFocus = fieldRef.current?.contains(document.activeElement) ?? false;
    const land = () => {
      rollingRef.current = false;
      setRolling(false);
      flick(null);
      lock(landing.entry.slug);
      if (fieldHasFocus) requestAnimationFrame(() => focusSlug(landing.entry.slug));
    };
    closeBio();
    clearTimers();
    if (reduced) return land();
    rollingRef.current = true;
    setRolling(true);
    // Fighting-game roulette: the highlight flickers across the roster, decelerates, lands (~1.2s, 12 hops).
    let t = 0;
    let last = "";
    rollTimers.current = Array.from({ length: 12 }, (_, i) => {
      t += 34 + i * i * 1.3;
      let slug = inPlay[Math.floor(Math.random() * inPlay.length)].entry.slug;
      if (slug === last) slug = inPlay[(inPlay.findIndex((s) => s.entry.slug === slug) + 3) % inPlay.length].entry.slug;
      if (i === 11) slug = landing.entry.slug;
      last = slug;
      return setTimeout(() => flick(slug), t);
    });
    rollTimers.current.push(setTimeout(land, t + 180));
  };

  useEffect(
    () => () => {
      clearTimeout(hoverTimer.current);
      clearTimeout(leaveTimer.current);
      rollTimers.current.forEach(clearTimeout);
    },
    [],
  );

  // ---- Keyboard: arrows move across the visible tiles by geometry ------------

  const nearest = (from: string, [dx, dy]: [number, number]) => {
    const el = tiles.get(from);
    if (!el) return undefined;
    const c = (r: DOMRect) => [r.left + r.width / 2, r.top + r.height / 2];
    const [ox, oy] = c(el.getBoundingClientRect());
    let best: string | undefined;
    let bestScore = Infinity;
    tiles.forEach((node, slug) => {
      if (slug === from) return;
      const r = node.getBoundingClientRect();
      if (!r.width) return;
      const [x, y] = c(r);
      const along = dx ? (x - ox) * dx : (y - oy) * dy;
      const across = dx ? Math.abs(y - oy) : Math.abs(x - ox);
      if (along <= 4) return;
      // Horizontal moves stay in the row; vertical moves take the closest tile below/above.
      const score = dx ? along + across * 6 : along + across * 1.4;
      if (score < bestScore) {
        bestScore = score;
        best = slug;
      }
    });
    return best;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const dirs: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const order = [...tiles.entries()].filter(([, el]) => el.getClientRects().length).map(([slug]) => slug);
    const active = (document.activeElement as HTMLElement | null)?.dataset.slug ?? cursor;
    let next: string | undefined;
    if (e.key === "?") {
      e.preventDefault();
      return roll();
    }
    if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    else if (dirs[e.key]) next = nearest(active, dirs[e.key]);
    if (!next) return;
    e.preventDefault();
    if (rollingRef.current) return;
    focusSlug(next);
  };

  // Lineup rows link here with data-artist: lock that act in.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest<HTMLElement>("a[data-artist]");
      const slug = a?.dataset.artist;
      if (slug && bySlug.has(slug)) lock(slug);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [bySlug, lock]);

  // ---- Stable per-tile refs (a fresh callback per render would defeat Tile's memo) ----

  const tileRefs = useMemo(() => {
    const m = new Map<string, Ref<HTMLButtonElement>>();
    for (const key of [...slots.map((s) => s.entry.slug), "random"]) {
      m.set(key, (el: HTMLButtonElement | null) => {
        if (el) tiles.set(key, el);
        else tiles.delete(key);
      });
    }
    return m;
  }, [slots, tiles]);

  const onFocusRandom = useCallback(() => {
    if (rollingRef.current) return;
    setCursor("random");
  }, []);

  // ---- Render ---------------------------------------------------------------

  const shown = bySlug.get(shownSlug) ?? bySlug.get(firstSlug)!;
  const lockedSlot = bySlug.get(locked) ?? shown;
  const bannerName = isNamed(shown.entry) ? `${shown.entry.name}'s` : "this act's";
  // Phones show one day: the tab stop must be a visible tile.
  const sideStop = bySlug.get(locked)?.day === side ? locked : wings[side].slots[0].entry.slug;
  const tabSlug = wide ? cursor : cursor !== "random" && bySlug.get(cursor)?.day === side ? cursor : sideStop;

  return (
    <div
      ref={rootRef}
      className="asel"
      data-near={near || undefined}
      data-rolling={rolling || undefined}
      data-side={side}
      data-bio={bioOpen || undefined}
      style={{ "--asel-tile-img": near ? `url("${media.tileStill}")` : "none", "--cols": pyramid.cols, "--rows": pyramid.rows } as CSSProperties}
    >
      <div className="asel-screen">
        <Splash entry={shown.entry} order={shown.index} frameDir={media.frameDir} near={near} canPlay={near && inView && !reduced && !(bioOpen && !wide)} reduced={reduced} />
      </div>
      <span className="asel-ticks" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>

      <header className="asel-head">
        <h2 id={headingId} className="asel-title">
          {title}
        </h2>
        <span className="asel-divider" aria-hidden="true" />
      </header>

      {/* Phones: which day's keys are on the pad, plus RANDOM (the old roster's interlocking slabs). */}
      <div className="asel-switch" role="group" aria-label="Day">
        {([1, "rnd", 2] as const).map((d) =>
          d === "rnd" ? (
            <button key={d} type="button" className="asel-switch__rnd" onClick={roll} aria-busy={rolling || undefined} aria-label={`Random Day ${side} artist`}>
              <b aria-hidden="true">?</b> Random
            </button>
          ) : (
            <button key={d} type="button" className="asel-switch__day" data-day={d} aria-pressed={side === d} onClick={() => showDay(d)}>
              <span className="asel-switch__label">{days[d - 1].label}</span>
              <span className="asel-switch__date" aria-hidden="true">
                {days[d - 1].weekday.slice(0, 3)} {shortDate(days[d - 1].isoDate)}
              </span>
            </button>
          ),
        )}
      </div>

      <div
        ref={fieldRef}
        className="asel-field"
        role="group"
        aria-label={wide ? "Artists: Day 1 on the left, Day 2 on the right" : `Day ${side} artists`}
        aria-describedby={`${headingId}-hint`}
        data-cta-hide=""
        onKeyDown={onKeyDown}
        onPointerLeave={onFieldLeave}
        onBlur={onFieldBlur}
      >
        <div className="asel-plate" style={boxVars(emblem) as CSSProperties} aria-hidden="true">
          <div className="asel-plate__body" style={{ clipPath: toClipPath(emblem.poly) }}>
            <GlitchLayer intensity="subtle" interactive className="asel-plate__logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={media.emblem.src} width={media.emblem.width} height={media.emblem.height} alt="" loading="lazy" decoding="async" />
            </GlitchLayer>
          </div>
          <svg className="asel-plate__edge" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
            <polygon points={toSvgPoints(emblem.poly)} />
          </svg>
        </div>

        {slots.map((slot) => (
          <Tile
            key={slot.entry.slug}
            slot={slot}
            pressed={locked === slot.entry.slug}
            tabbable={tabSlug === slot.entry.slug}
            panelId={profileId}
            lockedLabel={pending.locked}
            tileRef={tileRefs.get(slot.entry.slug)!}
            onHover={onHover}
            onFocusTile={onFocusTile}
            onPress={onPress}
          />
        ))}

        <RandomTile box={rnd} tabbable={tabSlug === "random"} rolling={rolling} tileRef={tileRefs.get("random")!} onFocusTile={onFocusRandom} onPress={roll} />
      </div>

      {/* The whole banner opens the profile window (pointer cursor + a hover cue on the PROFILE chip). */}
      <button
        type="button"
        className="asel-banner"
        data-bio-trigger=""
        aria-label={bioOpen ? "Close the profile" : `Open ${bannerName} profile`}
        aria-haspopup="dialog"
        aria-expanded={bioOpen}
        aria-controls={windowId}
        onClick={toggleBio}
      />

      <Profile
        id={profileId}
        entry={shown.entry}
        day={shown.day}
        index={shown.index}
        reduced={reduced}
        wide={wide}
        open={bioOpen}
        windowId={windowId}
        lockedLabel={pending.locked}
        onToggle={toggleBio}
      />

      <BioWindow
        id={windowId}
        open={bioOpen}
        entry={lockedSlot.entry}
        day={lockedSlot.day}
        index={lockedSlot.index}
        wing={wings[lockedSlot.day]}
        wide={wide}
        reduced={reduced}
        lockedLabel={pending.locked}
        frameRef={winFrameRef}
        onClose={closeBio}
        onStep={onStep}
      />

      <p id={`${headingId}-hint`} className="w-sr-only">
        Use the arrow keys to move between artists and Enter to lock one in; the profile after this grid follows it, and its Profile button opens the full bio. The question mark tile picks an artist at random.
      </p>
      <p className="w-sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
