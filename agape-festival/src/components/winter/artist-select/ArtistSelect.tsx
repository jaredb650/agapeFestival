"use client";

import { startTransition, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent, type Ref } from "react";
import { GlitchLayer } from "@/components/winter/ui";
import type { ArtistEntry, DayNumber, WinterDay } from "@/data/winter";
import { BioSheet } from "./BioSheet";
import { boxVars, emblemBox, randomBox, toClipPath, toSvgPoints } from "./geometry";
import { useMedia, useReducedMotion, useViewport } from "./hooks";
import { Profile } from "./Profile";
import { buildRoster, isNamed, type Slot } from "./roster";
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
 * to the locked act. Phones show one day of keys at a time under the same
 * splash, with the bio in a sheet.
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
  /** Desktop: the act whose bio is expanded in place. */
  const [bioFor, setBioFor] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
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
  // Mirrors for synchronous reads inside handlers: the locked act, and the last act locked on each day (phone day switch).
  const lockedRef = useRef<string>(firstSlug);
  const memory = useRef<Record<DayNumber, string>>({ 1: wings[1].slots[0].entry.slug, 2: firstSlug });

  const reduced = useReducedMotion();
  const wide = useMedia(WIDE_QUERY);
  const { near, inView } = useViewport(rootRef);
  const profileId = `${headingId}-profile`;

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
      if (rollingRef.current) return;
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
      showPreview(slug);
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

  // ---- Bio: in place on desktop, a sheet on phones ------------------------------

  const shownSlug = preview ?? locked;
  const onToggleBio = useCallback(() => setBioFor((b) => (b === shownSlug ? null : shownSlug)), [shownSlug]);
  const openSheet = useCallback(() => setSheetOpen(true), []);
  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>(".asel-profile [data-bio-toggle]")?.focus({ preventScroll: true }));
  }, []);

  // ---- Phones: day switcher ------------------------------------------------------

  const showDay = (day: DayNumber) => {
    if (rollingRef.current) return;
    setSheetOpen(false);
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
    setSheetOpen(false);
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
  const shownNamed = isNamed(shown.entry) ? shown.entry : null;
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
      data-sheet={(sheetOpen && !wide) || undefined}
      style={{ "--asel-tile-img": near ? `url("${media.tileStill}")` : "none", "--cols": pyramid.cols, "--rows": pyramid.rows } as CSSProperties}
    >
      <div className="asel-screen">
        <Splash entry={shown.entry} order={shown.index} frameDir={media.frameDir} near={near} canPlay={near && inView && !reduced && !(sheetOpen && !wide)} reduced={reduced} />
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

      {/* Phones: which day's keys are on the pad, plus RANDOM. */}
      <div className="asel-switch" role="group" aria-label="Day">
        <button type="button" className="asel-switch__day" data-day={1} aria-pressed={side === 1} onClick={() => showDay(1)}>
          {days[0].label}
        </button>
        <button type="button" className="asel-switch__rnd" onClick={roll} aria-busy={rolling || undefined} aria-label={`Random Day ${side} artist`}>
          <b aria-hidden="true">?</b> Random
        </button>
        <button type="button" className="asel-switch__day" data-day={2} aria-pressed={side === 2} onClick={() => showDay(2)}>
          {days[1].label}
        </button>
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

      <Profile
        id={profileId}
        entry={shown.entry}
        day={shown.day}
        index={shown.index}
        reduced={reduced}
        wide={wide}
        bioOpen={bioFor === shownSlug}
        sheetOpen={sheetOpen}
        lockedLabel={pending.locked}
        onToggleBio={onToggleBio}
        onOpenSheet={openSheet}
      />

      <BioSheet open={sheetOpen && !wide} day={shown.day} artist={shownNamed?.bio ? shownNamed : null} onClose={closeSheet} />

      <p id={`${headingId}-hint`} className="w-sr-only">
        Use the arrow keys to move between artists and Enter to lock one in; the profile after this grid follows it. The question mark tile picks an artist at random.
      </p>
      <p className="w-sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
