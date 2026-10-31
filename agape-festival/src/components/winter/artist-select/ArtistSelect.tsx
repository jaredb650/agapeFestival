"use client";

import { startTransition, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type Ref } from "react";
import { GlitchLayer, HudLabel } from "@/components/winter/ui";
import type { ArtistEntry, DayNumber, WinterDay } from "@/data/winter";
import { BioSheet } from "./BioSheet";
import { boxVars, emblemBox, randomBox, tagAnchor, toClipPath, toSvgPoints } from "./geometry";
import { useMedia, useReducedMotion, useViewport } from "./hooks";
import { Orb } from "./Lcd";
import { buildRoster, isNamed, lcdDate, pad2, type Slot } from "./roster";
import { SidePanel } from "./SidePanel";
import { Splash } from "./Splash";
import { StageFrame } from "./StageFrame";
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
  /** ÄGAPĒ festival emblem (flyer layer). */
  emblem: Img;
  /** Hand-scrawl DAY 1 / DAY 2 (flyer layers). */
  dayLabels: Record<DayNumber, Img>;
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

type PerDay<T> = Record<DayNumber, T>;
const DAYS: DayNumber[] = [1, 2];
const SPLIT_QUERY = "(min-width: 960px)";
const HOVER_INTENT = 70;
// Fixed geometry (pure): the RANDOM wedge, the emblem plate.
const rnd = randomBox();
const rndTag = tagAnchor(rnd);
const emblem = emblemBox();

/** The cursor tag's transform for an anchor (tile units → px via --tw, so it tracks resizes for free). */
const tagTransform = (a: { x: number; y: number }) => `translate3d(calc(var(--tw) * ${a.x}), calc(var(--tw) * ${a.y}), 0)`;

/**
 * Artist profiler: the split character select (Day 1 blue on the left, Day 2
 * red on the right) on desktop, a one-screen PDA on phones (splash, day
 * switcher, square-key pyramid, bio sheet).
 *
 * Performance contract: hovering never renders React. The cursor tag is moved
 * by writing one transform (no transition, no layout reads), hover styling is
 * CSS :hover, and the roulette flicker is attribute writes. React only renders
 * when an act is actually loaded (after a 70ms intent), inside a transition so
 * pointer input always wins.
 */
export function ArtistSelect({ artists, days, media, pending, headingId, title }: ArtistSelectProps) {
  const { wings, pyramid } = useMemo(() => buildRoster(artists), [artists]);
  const slots = useMemo(() => [...wings[1].slots, ...wings[2].slots], [wings]);
  const bySlug = useMemo(() => new Map<string, Slot>(slots.map((s) => [s.entry.slug, s])), [slots]);
  const firstSlug = wings[2].slots[0]?.entry.slug ?? slots[0].entry.slug;

  const [picked, setPicked] = useState<PerDay<string | null>>({ 1: null, 2: null });
  const [swap, setSwap] = useState<PerDay<number>>({ 1: 0, 2: 0 });
  /** Roving-tabindex owner. Follows focus/press/keyboard, never hover. */
  const [cursor, setCursor] = useState<string>(firstSlug);
  /** Desktop: the side touched last. Mobile: the visible day. */
  const [lastSide, setLastSide] = useState<DayNumber>(1);
  const [bioOpen, setBioOpen] = useState<PerDay<boolean>>({ 1: false, 2: false });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [announce, setAnnounce] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const tagLabelRef = useRef<HTMLSpanElement>(null);
  const screenRef = useRef<HTMLButtonElement>(null);
  // Tile buttons by slug (a plain Map in state, not a ref: the ref callbacks below write it outside render).
  const [tiles] = useState(() => new Map<string, HTMLButtonElement>());
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rollTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rollingRef = useRef(false);
  const rollEl = useRef<HTMLElement | null>(null);
  // Mirror of `picked` for synchronous reads inside handlers (no side effects in state updaters).
  const pickedRef = useRef<PerDay<string | null>>({ 1: null, 2: null });

  const reduced = useReducedMotion();
  const split = useMedia(SPLIT_QUERY);
  const { near, inView } = useViewport(rootRef);

  const ids = { 1: `${headingId}-d1`, 2: `${headingId}-d2` } as const;

  // ---- Cursor tag: one transform write, no React, no transition, no layout reads ----

  const moveTag = useCallback(
    (slug: string) => {
      const tag = tagRef.current;
      if (!tag) return;
      const slot = bySlug.get(slug);
      const a = slot ? slot.tag : rndTag;
      tag.style.transform = tagTransform(a);
      if (tag.dataset.pos !== a.pos) tag.dataset.pos = a.pos;
      const day = slot ? String(slot.day) : "r";
      if (tag.dataset.day !== day) {
        tag.dataset.day = day;
        if (tagLabelRef.current) tagLabelRef.current.textContent = slot ? `DAY ${slot.day}` : "RANDOM";
      }
    },
    [bySlug],
  );

  // Initial tag (SSR + first paint). Constant props, so React never overwrites the imperative writes.
  const [tagInit] = useState(() => {
    const s = bySlug.get(firstSlug)!;
    return { style: { transform: tagTransform(s.tag) }, pos: s.tag.pos, day: String(s.day), label: `DAY ${s.day}` };
  });

  // ---- Picking --------------------------------------------------------------

  /** Load an act onto its side. `fx` replays the swap FX even when it is already loaded (lock-in). */
  const pick = useCallback(
    (slug: string, { fx = false } = {}) => {
      const slot = bySlug.get(slug);
      if (!slot) return;
      const day = slot.day;
      const same = pickedRef.current[day] === slug;
      if (!same) pickedRef.current = { ...pickedRef.current, [day]: slug };
      const next = pickedRef.current;
      // Interruptible: a new hover/tap pre-empts this render instead of queueing behind it.
      startTransition(() => {
        setLastSide(day);
        if (same && !fx) return;
        if (!same) {
          setPicked(next);
          setBioOpen((b) => (b[day] ? { ...b, [day]: false } : b));
        }
        setSwap((s) => ({ ...s, [day]: s[day] + 1 }));
      });
    },
    [bySlug],
  );

  const say = useCallback(
    (slot: Slot) => {
      const name = isNamed(slot.entry) ? slot.entry.name : `Locked slot, ${pending.locked.toLowerCase()}`;
      setAnnounce(`${name} loaded on the Day ${slot.day} panel.`);
    },
    [pending.locked],
  );

  const onHover = useCallback(
    (slug: string) => {
      if (rollingRef.current) return;
      moveTag(slug);
      clearTimeout(hoverTimer.current);
      hoverTimer.current = setTimeout(() => pick(slug), HOVER_INTENT);
    },
    [moveTag, pick],
  );

  const onFocusTile = useCallback(
    (slug: string) => {
      if (rollingRef.current) return;
      setCursor(slug);
      moveTag(slug);
      pick(slug);
    },
    [moveTag, pick],
  );

  const onPress = useCallback(
    (slug: string) => {
      if (rollingRef.current) return;
      clearTimeout(hoverTimer.current);
      setCursor(slug);
      moveTag(slug);
      pick(slug, { fx: true });
      const slot = bySlug.get(slug);
      if (slot) say(slot);
    },
    [moveTag, pick, bySlug, say],
  );

  const focusSlug = (slug: string) => tiles.get(slug)?.focus({ preventScroll: true });

  // Pager: step through one day's slots from its panel (or the mobile sheet).
  const onStep = useCallback(
    (day: DayNumber, dir: -1 | 1) => {
      const list = wings[day].slots;
      const at = list.findIndex((s) => s.entry.slug === pickedRef.current[day]);
      const next = list[(at + dir + list.length) % list.length] ?? list[0];
      setCursor(next.entry.slug);
      moveTag(next.entry.slug);
      pick(next.entry.slug);
      say(next);
    },
    [wings, moveTag, pick, say],
  );

  const onToggleBio = useCallback((day: DayNumber) => setBioOpen((b) => ({ ...b, [day]: !b[day] })), []);

  // ---- Mobile: day switcher + bio sheet ----------------------------------------

  const showDay = (day: DayNumber) => {
    if (rollingRef.current) return;
    setLastSide(day);
    setSheetOpen(false);
    setCursor(pickedRef.current[day] ?? wings[day].slots[0].entry.slug);
  };

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    requestAnimationFrame(() => screenRef.current?.focus({ preventScroll: true }));
  }, []);

  // ---- RANDOM: roulette flicker is attribute writes; React renders once at the start and once on landing ----

  const flick = (slug: string | null) => {
    rollEl.current?.removeAttribute("data-roll");
    rollEl.current = null;
    if (!slug) return;
    moveTag(slug);
    const el = tiles.get(slug)?.parentElement ?? null;
    el?.setAttribute("data-roll", "");
    rollEl.current = el;
  };

  const roll = () => {
    if (rollingRef.current) return;
    // Desktop rolls the whole roster; the phone rolls the visible day.
    const inPlay = slots.filter((s) => isNamed(s.entry) && (split || s.day === lastSide));
    const pool = inPlay.filter((s) => s.entry.slug !== pickedRef.current[s.day]);
    if (!pool.length) return;
    const landing = pool[Math.floor(Math.random() * pool.length)];
    const fieldHasFocus = fieldRef.current?.contains(document.activeElement) ?? false;
    const land = () => {
      rollingRef.current = false;
      setRolling(false);
      flick(null);
      setCursor(landing.entry.slug);
      moveTag(landing.entry.slug);
      pick(landing.entry.slug, { fx: true });
      say(landing);
      if (fieldHasFocus) requestAnimationFrame(() => focusSlug(landing.entry.slug));
    };
    setSheetOpen(false);
    if (reduced) return land();
    rollingRef.current = true;
    setRolling(true);
    clearTimeout(hoverTimer.current);
    // Fighting-game roulette: the cursor flickers across the roster, decelerates, lands.
    let t = 0;
    let last = "";
    // ~1.2s: 12 hops, fast then slowing (34ms → ~180ms gaps).
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
      rollTimers.current.forEach(clearTimeout);
    },
    [],
  );

  // ---- Keyboard: arrows move across the visible tiles by geometry ------------

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

  // Lineup rows link here with data-artist: load that act.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest<HTMLElement>("a[data-artist]");
      const slug = a?.dataset.artist;
      if (slug && bySlug.has(slug)) {
        setCursor(slug);
        moveTag(slug);
        pick(slug, { fx: true });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [bySlug, moveTag, pick]);

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

  const onHoverRandom = useCallback(() => !rollingRef.current && moveTag("random"), [moveTag]);
  const onFocusRandom = useCallback(() => {
    if (rollingRef.current) return;
    setCursor("random");
    moveTag("random");
  }, [moveTag]);

  // ---- Render ---------------------------------------------------------------

  const entryOf = (day: DayNumber) => (picked[day] ? (bySlug.get(picked[day]!)?.entry ?? null) : null);
  const indexOf = (day: DayNumber) => (picked[day] ? (bySlug.get(picked[day]!)?.index ?? 0) : 0);
  const totalNamed = wings[1].named + wings[2].named;
  const totalLocked = wings[1].locked + wings[2].locked;
  // Phones show one day: the tab stop must be a visible tile.
  const cursorDay = bySlug.get(cursor)?.day;
  const tabSlug = split || cursorDay === lastSide ? cursor : (picked[lastSide] ?? wings[lastSide].slots[0].entry.slug);
  const shownEntry = entryOf(lastSide);
  const shownNamed = shownEntry && isNamed(shownEntry) ? shownEntry : null;

  return (
    <div
      ref={rootRef}
      className="asel"
      data-near={near || undefined}
      data-rolling={rolling || undefined}
      data-side={lastSide}
      data-sheet={(sheetOpen && !split) || undefined}
      style={{ "--asel-tile-img": near ? `url("${media.tileStill}")` : "none", "--cols": pyramid.cols, "--rows": pyramid.rows } as CSSProperties}
    >
      <div className="asel-screen">
        {DAYS.map((day) => (
          <Splash
            key={day}
            day={day}
            entry={entryOf(day)}
            order={indexOf(day)}
            swapId={swap[day]}
            frameDir={media.frameDir}
            near={near}
            canPlay={near && inView && !reduced && !sheetOpen && (split || day === lastSide)}
            reduced={reduced}
            date={lcdDate(days[day - 1].isoDate)}
            shown={day === lastSide}
            mobile={!split}
          />
        ))}
        {/* Phones: tap the footage for the full profile. */}
        <button
          ref={screenRef}
          type="button"
          className="asel-screen__btn"
          data-day={lastSide}
          hidden={split || !shownEntry}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          aria-label={shownNamed ? `Open ${shownNamed.name}'s profile` : `Open the Day ${lastSide} slot`}
          onClick={() => setSheetOpen(true)}
        >
          <span className="asel-screen__cue" aria-hidden="true">
            Profile <b>▸</b>
          </span>
        </button>
      </div>
      <StageFrame label=":: Select artist ::" />

      <div className="asel-stage">
        <div className="asel-core">
          <div className="asel-spine" aria-hidden="true">
            <span className="asel-spine__rail" />
            <span className="asel-spine__node">
              <span data-day="1">
                <Orb lit={!!picked[1]} size="lg" />
              </span>
              <span className="asel-spine__label">
                <b data-day="1">D1</b> :: <b data-day="2">D2</b>
              </span>
              <span data-day="2">
                <Orb lit={!!picked[2]} size="lg" />
              </span>
            </span>
            <span className="asel-spine__rail asel-spine__rail--short" />
          </div>
          <HudLabel size="nano" tone="mist" className="asel-core__kicker">
            {days[0].date.split(" ").slice(1).join(" ")}–{days[1].date.split(" ").pop()} :: Two days
          </HudLabel>
          <h2 id={headingId} className="asel-title">
            {title}
          </h2>
          <p className="asel-tally">
            {pad2(totalNamed)} CONFIRMED <i>/</i> {pad2(totalLocked)} ENCRYPTED
          </p>
        </div>

        {/* Phones: which day's keys are on the pad, plus RANDOM. */}
        <div className="asel-switch" role="group" aria-label="Day">
          {DAYS.map((day) => (
            <button key={day} type="button" className="asel-switch__day" data-day={day} aria-pressed={lastSide === day} onClick={() => showDay(day)} style={{ order: day === 1 ? 0 : 2 }}>
              <span className="asel-switch__label">Day {day}</span>
              <span className="asel-switch__date" aria-hidden="true">
                {days[day - 1].weekday.slice(0, 3)} {lcdDate(days[day - 1].isoDate).slice(0, 5)}
              </span>
            </button>
          ))}
          <button type="button" className="asel-switch__rnd" onClick={roll} aria-busy={rolling || undefined} aria-label={`Random Day ${lastSide} artist`} style={{ order: 1 }}>
            <b aria-hidden="true">?</b> Random
          </button>
        </div>

        <div ref={fieldRef} className="asel-field" role="group" aria-label={split ? "Artists, Day 1 left and Day 2 right" : `Day ${lastSide} artists`} aria-describedby={`${headingId}-hint`} onKeyDown={onKeyDown}>
          <div className="asel-plate asel-plate--emblem" style={boxVars(emblem) as CSSProperties} aria-hidden="true">
            <div className="asel-plate__body" style={{ clipPath: toClipPath(emblem.poly) }}>
              <GlitchLayer intensity="subtle" idleEvery={9000} interactive className="asel-plate__logo">
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
              pressed={picked[slot.day] === slot.entry.slug}
              tabbable={tabSlug === slot.entry.slug}
              panelId={ids[slot.day]}
              lockedLabel={pending.locked}
              tileRef={tileRefs.get(slot.entry.slug)!}
              onHover={onHover}
              onFocusTile={onFocusTile}
              onPress={onPress}
            />
          ))}

          <RandomTile box={rnd} tabbable={tabSlug === "random"} rolling={rolling} tileRef={tileRefs.get("random")!} onHover={onHoverRandom} onFocusTile={onFocusRandom} onPress={roll} />

          <span ref={tagRef} className="asel-cursor" style={tagInit.style} data-pos={tagInit.pos} data-day={tagInit.day} aria-hidden="true">
            <span className="asel-cursor__tag">
              <span ref={tagLabelRef}>{tagInit.label}</span>
            </span>
          </span>
        </div>

        {DAYS.map((day) => (
          <SidePanel
            key={day}
            id={ids[day]}
            day={day}
            info={days[day - 1]}
            wing={wings[day]}
            entry={entryOf(day)}
            index={indexOf(day)}
            active={lastSide === day && !!picked[day]}
            reduced={reduced}
            bioOpen={bioOpen[day]}
            dayLabel={media.dayLabels[day]}
            pending={pending}
            onStep={onStep}
            onToggleBio={onToggleBio}
          />
        ))}

        <p className="asel-keys" aria-hidden="true">
          <kbd>←</kbd>
          <kbd>→</kbd>
          <kbd>↑</kbd>
          <kbd>↓</kbd> Move <i>::</i> <kbd>Enter</kbd> Lock in <i>::</i> <kbd>?</kbd> Random
        </p>
      </div>

      <BioSheet
        open={sheetOpen && !split}
        day={lastSide}
        info={days[lastSide - 1]}
        wing={wings[lastSide]}
        entry={shownEntry}
        index={indexOf(lastSide)}
        pending={pending}
        onClose={closeSheet}
        onStep={onStep}
      />

      <p id={`${headingId}-hint`} className="w-sr-only">
        Use the arrow keys to move between artists. Each artist&rsquo;s profile appears in the Day 1 or Day 2 panel after this grid. The question mark tile picks an artist at random.
      </p>
      <p className="w-sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
