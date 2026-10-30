"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { GlitchLayer, HudLabel } from "@/components/winter/ui";
import type { ArtistEntry, DayNumber, WinterDay } from "@/data/winter";
import { boxVars, emblemBox, mobilePlates, randomBox, toClipPath, toSvgPoints } from "./geometry";
import { useMedia, useReducedMotion, useViewport } from "./hooks";
import { Orb } from "./Lcd";
import { buildWings, isNamed, lcdDate, pad2, type Slot } from "./roster";
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
// Fixed geometry (pure): the RANDOM wedge, the emblem plate, the mobile day plates.
const rnd = randomBox();
const emblem = emblemBox();
const plates = mobilePlates();

export function ArtistSelect({ artists, days, media, pending, headingId, title }: ArtistSelectProps) {
  const wings = useMemo(() => buildWings(artists), [artists]);
  const slots = useMemo(() => [...wings[1].slots, ...wings[2].slots], [wings]);
  const bySlug = useMemo(() => new Map<string, Slot>(slots.map((s) => [s.entry.slug, s])), [slots]);

  const [picked, setPicked] = useState<PerDay<string | null>>({ 1: null, 2: null });
  const [swap, setSwap] = useState<PerDay<number>>({ 1: 0, 2: 0 });
  const [cursor, setCursor] = useState<string>(wings[2].slots[0]?.entry.slug ?? slots[0].entry.slug);
  const [lastSide, setLastSide] = useState<DayNumber>(2);
  const [bioOpen, setBioOpen] = useState<PerDay<boolean>>({ 1: false, 2: false });
  const [rolling, setRolling] = useState(false);
  const [rollHit, setRollHit] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const tiles = useRef(new Map<string, HTMLButtonElement>());
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rollTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const reduced = useReducedMotion();
  const split = useMedia(SPLIT_QUERY);
  const { near, inView } = useViewport(rootRef);

  const ids = { 1: `${headingId}-d1`, 2: `${headingId}-d2` } as const;

  // ---- Picking --------------------------------------------------------------

  // Mirror of `picked` for synchronous reads inside handlers (no side effects in state updaters).
  const pickedRef = useRef<PerDay<string | null>>({ 1: null, 2: null });

  /** Load an act onto its side. `fx` replays the swap FX even when it is already loaded (lock-in). */
  const pick = useCallback(
    (slug: string, { fx = false } = {}) => {
      const slot = bySlug.get(slug);
      if (!slot) return;
      const day = slot.day;
      setLastSide(day);
      const same = pickedRef.current[day] === slug;
      if (same && !fx) return;
      if (!same) {
        pickedRef.current = { ...pickedRef.current, [day]: slug };
        setPicked(pickedRef.current);
        setBioOpen((b) => (b[day] ? { ...b, [day]: false } : b));
      }
      setSwap((s) => ({ ...s, [day]: s[day] + 1 }));
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
      if (rolling) return;
      setCursor(slug);
      clearTimeout(hoverTimer.current);
      hoverTimer.current = setTimeout(() => pick(slug), HOVER_INTENT);
    },
    [pick, rolling],
  );

  const onFocusTile = useCallback(
    (slug: string) => {
      if (rolling) return;
      setCursor(slug);
      pick(slug);
    },
    [pick, rolling],
  );

  const onPress = useCallback(
    (slug: string) => {
      if (rolling) return;
      clearTimeout(hoverTimer.current);
      setCursor(slug);
      pick(slug, { fx: true });
      const slot = bySlug.get(slug);
      if (slot) say(slot);
    },
    [pick, rolling, bySlug, say],
  );

  const focusSlug = (slug: string) => tiles.current.get(slug)?.focus({ preventScroll: true });

  // Pager: step through one day's slots from its panel.
  const onStep = useCallback(
    (day: DayNumber, dir: -1 | 1) => {
      const list = wings[day].slots;
      const at = list.findIndex((s) => s.entry.slug === pickedRef.current[day]);
      const next = list[(at + dir + list.length) % list.length] ?? list[0];
      setCursor(next.entry.slug);
      pick(next.entry.slug);
      say(next);
    },
    [wings, pick, say],
  );

  const onToggleBio = useCallback((day: DayNumber) => setBioOpen((b) => ({ ...b, [day]: !b[day] })), []);

  // ---- RANDOM ---------------------------------------------------------------

  const roll = () => {
    if (rolling) return;
    const pool = slots.filter((s) => isNamed(s.entry) && s.entry.slug !== picked[s.day]);
    if (!pool.length) return;
    const landing = pool[Math.floor(Math.random() * pool.length)];
    const fieldHasFocus = fieldRef.current?.contains(document.activeElement) ?? false;
    const land = () => {
      setRolling(false);
      setRollHit(null);
      setCursor(landing.entry.slug);
      pick(landing.entry.slug, { fx: true });
      say(landing);
      if (fieldHasFocus) requestAnimationFrame(() => focusSlug(landing.entry.slug));
    };
    if (reduced) return land();
    setRolling(true);
    // Fighting-game roulette: the cursor flickers across the roster, decelerates, lands.
    const named = slots.filter((s) => isNamed(s.entry));
    let t = 0;
    let last = "";
    // ~1.2s: 12 hops, fast then slowing (34ms → ~180ms gaps).
    rollTimers.current = Array.from({ length: 12 }, (_, i) => {
      t += 34 + i * i * 1.3;
      let slug = named[Math.floor(Math.random() * named.length)].entry.slug;
      if (slug === last) slug = named[(named.findIndex((s) => s.entry.slug === slug) + 3) % named.length].entry.slug;
      if (i === 11) slug = landing.entry.slug;
      last = slug;
      return setTimeout(() => {
        setCursor(slug);
        setRollHit(slug);
      }, t);
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

  // ---- Keyboard: arrows move across both halves by geometry ------------------

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const dirs: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const order = [...tiles.current.keys()];
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
    if (rolling) return;
    focusSlug(next);
  };

  const nearest = (from: string, [dx, dy]: [number, number]) => {
    const el = tiles.current.get(from);
    if (!el) return undefined;
    const c = (r: DOMRect) => [r.left + r.width / 2, r.top + r.height / 2];
    const [ox, oy] = c(el.getBoundingClientRect());
    let best: string | undefined;
    let bestScore = Infinity;
    tiles.current.forEach((node, slug) => {
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

  // ---- P1 cursor tag: follows the cursor tile (transform only) ----------------

  const placeTag = useCallback(() => {
    const tag = tagRef.current;
    const node = tiles.current.get(cursor);
    const slotEl = node?.parentElement;
    if (!tag || !slotEl) return;
    const slot = bySlug.get(cursor);
    // Centre of the tile's top edge (the shard leans, so it's off-centre).
    const top = (slot?.box ?? rnd).poly.filter(([, y]) => y === 0).map(([x]) => x);
    const cx = top.length ? (Math.min(...top) + Math.max(...top)) / 200 : 0.5;
    // Split: above top-row tiles, below bottom-row tiles (never over a neighbour's name). Stacked: inside the tile.
    const pos = !split ? "inside" : (slot?.box ?? rnd).y > 0 ? "below" : "above";
    const y = slotEl.offsetTop + (pos === "below" ? slotEl.offsetHeight : 0);
    tag.style.transform = `translate3d(${slotEl.offsetLeft + slotEl.offsetWidth * cx}px, ${y}px, 0)`;
    tag.dataset.pos = pos;
  }, [cursor, bySlug, split]);

  useLayoutEffect(placeTag, [placeTag]);
  useEffect(() => {
    const el = fieldRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => placeTag());
    ro.observe(el);
    return () => ro.disconnect();
  }, [placeTag]);

  // Lineup rows link here with data-artist: load that act.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest<HTMLElement>("a[data-artist]");
      const slug = a?.dataset.artist;
      if (slug && bySlug.has(slug)) {
        setCursor(slug);
        pick(slug, { fx: true });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [bySlug, pick]);

  // ---- Render ---------------------------------------------------------------

  const entryOf = (day: DayNumber) => (picked[day] ? (bySlug.get(picked[day]!)?.entry ?? null) : null);
  const indexOf = (day: DayNumber) => (picked[day] ? (bySlug.get(picked[day]!)?.index ?? 0) : 0);
  const tileRef = (slug: string) => (el: HTMLButtonElement | null) => {
    if (el) tiles.current.set(slug, el);
    else tiles.current.delete(slug);
  };
  const totalNamed = wings[1].named + wings[2].named;
  const totalLocked = wings[1].locked + wings[2].locked;

  return (
    <div
      ref={rootRef}
      className="asel"
      data-near={near || undefined}
      data-rolling={rolling || undefined}
      data-side={lastSide}
      style={{ "--asel-tile-img": near ? `url("${media.tileStill}")` : "none" } as CSSProperties}
    >
      {DAYS.map((day) => {
        const entry = entryOf(day);
        const named = entry && isNamed(entry) ? entry : null;
        return (
          <Splash
            key={day}
            day={day}
            entry={entry}
            order={indexOf(day)}
            swapId={swap[day]}
            frameDir={media.frameDir}
            near={near}
            canPlay={near && inView && !reduced && (split || day === lastSide)}
            reduced={reduced}
            shown={day === lastSide}
            hud={{
              status: !entry ? "STANDBY" : named ? (named.clip ? "FOOTAGE: ONLINE" : "FOOTAGE INCOMING") : "SIGNAL ENCRYPTED",
              name: named ? named.displayName : entry ? "████████" : `DAY ${pad2(day)}`,
              lcd: `DAY ${pad2(day)} / ${lcdDate(days[day - 1].isoDate)} / ${!entry ? "AWAITING INPUT" : named ? "CONFIRMED" : "ENCRYPTED"}`,
            }}
          />
        );
      })}
      <StageFrame label=":: ARTIST SELECT ::" />

      <div className="asel-stage">
        <div className="asel-core">
          <div className="asel-spine" aria-hidden="true">
            <span className="asel-spine__rail" />
            <span className="asel-spine__node">
              <Orb lit={!!picked[1]} size="lg" />
              <span className="asel-spine__label">D1 :: D2</span>
              <Orb lit={!!picked[2]} size="lg" />
            </span>
            <span className="asel-spine__rail asel-spine__rail--short" />
          </div>
          <div className="asel-core__emblem" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media.emblem.src} width={media.emblem.width} height={media.emblem.height} alt="" loading="lazy" decoding="async" />
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

        <div ref={fieldRef} className="asel-field" role="group" aria-label="Artists, Day 1 left and Day 2 right" aria-describedby={`${headingId}-hint`} onKeyDown={onKeyDown}>
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

          {DAYS.map((day) => (
            <div key={`plate${day}`} className="asel-plate asel-plate--day" data-day={day} style={boxVars({ ...plates[day], x: 0, y: 0 }) as CSSProperties} aria-hidden="true">
              <div className="asel-plate__body" style={{ clipPath: toClipPath(plates[day].poly) }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={media.dayLabels[day].src} width={media.dayLabels[day].width} height={media.dayLabels[day].height} alt="" loading="lazy" decoding="async" />
                <span className="asel-plate__arrow">{day === 1 ? "▲" : "▼"}</span>
              </div>
              <svg className="asel-plate__edge" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
                <polygon points={toSvgPoints(plates[day].poly)} />
              </svg>
            </div>
          ))}

          {slots.map((slot) => (
            <Tile
              key={slot.entry.slug}
              slot={slot}
              pressed={picked[slot.day] === slot.entry.slug}
              tabbable={cursor === slot.entry.slug}
              rollHit={rollHit === slot.entry.slug}
              panelId={ids[slot.day]}
              lockedLabel={pending.locked}
              tileRef={tileRef(slot.entry.slug)}
              onHover={onHover}
              onFocusTile={onFocusTile}
              onPress={onPress}
            />
          ))}

          <RandomTile
            box={rnd}
            tabbable={cursor === "random"}
            rolling={rolling}
            tileRef={tileRef("random")}
            onHover={() => !rolling && setCursor("random")}
            onFocusTile={() => !rolling && setCursor("random")}
            onPress={roll}
          />

          <span ref={tagRef} className="asel-cursor" aria-hidden="true">
            <span className="asel-cursor__tag">P1</span>
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

      <p id={`${headingId}-hint`} className="w-sr-only">
        Use the arrow keys to move between artists. Each artist&rsquo;s bio appears in the Day 1 or Day 2 panel after this grid. The question mark tile picks an artist at random.
      </p>
      <p className="w-sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
