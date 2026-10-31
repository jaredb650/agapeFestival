"use client";

import { Fragment, startTransition, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import { ArrowRight, Cell, Fill, Row } from "@/components/winter/grid";
import { playWithRescue } from "@/components/winter/page/GestureRescue";
import { observeInView } from "@/components/winter/perf";
import type { ArtistEntry, WinterDay } from "@/data/winter";
import { BioDialog } from "./BioDialog";
import { useReducedMotion } from "./hooks";
import { buildRoster, featureMedia, photoSet, tileWords, type Act, type RosterDay } from "./acts";
import type { Point } from "./unfold";
import "@/styles/sections/roster.css";

export interface RosterProps {
  artists: readonly ArtistEntry[];
  days: readonly [WinterDay, WinterDay];
  /** Prefix for element ids. */
  id: string;
  /** The bio panel's venue line, "Industry City, Brooklyn". */
  venue: string;
}

/** A hover has to rest this long on a tile before it changes the feature (sweeping across stays cheap). */
const HOVER_INTENT = 80;
/** A pointer entering a tile this soon after the page scrolled was carried there by the scroll: ignored. */
const SCROLL_QUIET = 150;

/**
 * The roster, below the section header: one featured artist across the full width (name, day, and their
 * footage or photo where it exists), then one row of tiles per day. Hovering, focusing or pressing a tile
 * features that artist; pressing anywhere on the feature opens their bio, which unfolds out of the
 * feature into a large panel (BioDialog). Arrow keys move between tiles (one tab stop for the grid).
 *
 * Performance: hover never renders by itself (an 80ms intent timer, then one transition render); the
 * footage loads only near the viewport and plays only while it is on screen and the bio is closed.
 */
export function Roster({ artists, days, id, venue }: RosterProps) {
  const roster = useMemo(() => buildRoster(artists, days), [artists, days]);
  const [selected, setSelected] = useState(roster.first);
  const [open, setOpen] = useState(false);
  const selectedRef = useRef(roster.first);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tiles = useRef(new Map<string, HTMLButtonElement>());
  const hitRef = useRef<HTMLButtonElement>(null);
  const originRef = useRef<Point | null>(null);
  const reduced = useReducedMotion();
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  const act = roster.bySlug.get(selected) ?? roster.order[0];
  const day = roster.days[act.day - 1];
  const dialogId = `${id}-bio`;

  const select = useCallback(
    (slug: string) => {
      if (slug === selectedRef.current || !roster.bySlug.has(slug)) return;
      selectedRef.current = slug;
      // A newer hover or key press pre-empts this render instead of queueing behind it.
      startTransition(() => setSelected(slug));
    },
    [roster],
  );

  // The footage mounts once the feature is near the viewport and plays only while it is on screen.
  useEffect(() => {
    const el = hitRef.current;
    if (!el) return;
    const offNear = observeInView(el, (v) => v && setNear(true), { rootMargin: "800px 0px" });
    const offView = observeInView(el, setOnScreen);
    return () => {
      offNear();
      offView();
    };
  }, []);

  // Lineup rows link here with data-artist: feature that act.
  useEffect(() => {
    const onClick = (e: globalThis.MouseEvent) => {
      const slug = (e.target as HTMLElement | null)?.closest<HTMLElement>("a[data-artist]")?.dataset.artist;
      if (slug) select(slug);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [select]);

  // A page scroll carries tiles under a resting pointer (a lineup link scrolls the roster into view right
  // under it): only a pointer that moves over a tile features it, never the page moving under the pointer.
  const scrolledAt = useRef(0);
  /** The tile whose hover intent is running. */
  const armed = useRef<string | null>(null);
  const disarm = () => {
    clearTimeout(hoverTimer.current);
    armed.current = null;
  };
  useEffect(() => {
    const onScroll = () => {
      scrolledAt.current = performance.now();
      clearTimeout(hoverTimer.current);
      armed.current = null;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(hoverTimer.current);
    };
  }, []);

  const onTileEnter = (slug: string) => {
    disarm();
    if (performance.now() - scrolledAt.current < SCROLL_QUIET) return;
    armed.current = slug;
    hoverTimer.current = setTimeout(() => {
      armed.current = null;
      select(slug);
    }, HOVER_INTENT);
  };
  /** A real move inside a tile the scroll carried in arms it as an entry would have. */
  const onTileMove = (slug: string) => {
    if (armed.current !== slug && slug !== selectedRef.current) onTileEnter(slug);
  };
  const onTileLeave = disarm;

  /** Arrow keys: the nearest tile in that direction, by geometry (works for both layouts). */
  const onGridKey = (e: KeyboardEvent<HTMLElement>) => {
    const dirs: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const order = roster.order.map((a) => a.artist.slug);
    const from = (document.activeElement as HTMLElement | null)?.dataset.slug ?? selectedRef.current;
    let next: string | undefined;
    if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    else if (dirs[e.key]) next = nearest(tiles.current, from, dirs[e.key]);
    if (!next) return;
    e.preventDefault();
    tiles.current.get(next)?.focus();
  };

  const openBio = (e: MouseEvent<HTMLButtonElement>) => {
    disarm();
    // detail 0: Enter / Space. The panel then rises without the sideways leg.
    originRef.current = e.detail > 0 ? { x: e.clientX, y: e.clientY } : null;
    setOpen(true);
  };
  const closeBio = useCallback(() => setOpen(false), []);
  const step = useCallback(
    (dir: -1 | 1) => {
      const list = roster.order;
      const at = list.findIndex((a) => a.artist.slug === selectedRef.current);
      select(list[(at + dir + list.length) % list.length].artist.slug);
    },
    [roster, select],
  );

  const tileRef = (slug: string) => (el: HTMLButtonElement | null) => {
    if (el) tiles.current.set(slug, el);
    else tiles.current.delete(slug);
  };

  return (
    <>
      <Row className="rs-feature">
        {/* The whole row is the button; the cells below draw it. First in the DOM so hover can style its siblings. */}
        <button
          ref={hitRef}
          type="button"
          className="rs-feature__hit"
          data-roster-open=""
          aria-haspopup="dialog"
          aria-controls={dialogId}
          aria-label={`${act.artist.name}, ${day.label}. ${act.artist.bio ? "Read bio" : "Bio to be announced"}`}
          onClick={openBio}
        />
        <Cell span={8} y="end" className="rs-feature__text" aria-hidden="true">
          <p className="w-display rs-feature__name">{act.artist.name}</p>
          <p className="w-small">
            {day.label} · {day.date}
          </p>
          <span className="rs-feature__cue">
            {act.artist.bio ? "Read bio" : "Bio to be announced"}
            {act.artist.bio ? <ArrowRight /> : null}
          </span>
        </Cell>
        <Cell span={4} pad="none" className="rs-feature__media" aria-hidden="true">
          <FeatureMedia key={act.artist.slug} act={act} near={near} play={near && onScreen && !open && !reduced} reduced={reduced} />
        </Cell>
        {/* Mounted once the roster is near the viewport (it can't be opened before): the closed dialog's
            markup stays out of the initial HTML, and its photo is not preloaded with the hero. */}
        {near && (
          <BioDialog id={dialogId} act={act} day={day} open={open} originRef={originRef} anchorRef={hitRef} venue={venue} reduced={reduced} onClose={closeBio} onStep={step} />
        )}
      </Row>

      {roster.days.map((d) => (
        <DayRow key={d.day} day={d} selected={selected} tileRef={tileRef} onEnter={onTileEnter} onMove={onTileMove} onLeave={onTileLeave} onSelect={select} onKey={onGridKey} />
      ))}
    </>
  );
}

interface DayRowProps {
  day: RosterDay;
  selected: string;
  tileRef: (slug: string) => (el: HTMLButtonElement | null) => void;
  onEnter: (slug: string) => void;
  onMove: (slug: string) => void;
  onLeave: () => void;
  onSelect: (slug: string) => void;
  onKey: (e: KeyboardEvent<HTMLElement>) => void;
}

/**
 * One day: its label cell, then a tile per act, then (Day 1) the cell for the acts still to come.
 * From 768px: the label spans two lines of five 2-column tiles. Phones: the label takes three of the
 * four columns of the first line, so nine acts tile three full lines.
 */
function DayRow({ day, selected, tileRef, onEnter, onMove, onLeave, onSelect, onKey }: DayRowProps) {
  const n = day.acts.length;
  // From 768px: two columns of label, then lines of ten columns.
  const used = n * 2 + (day.more ? 10 : 0);
  const lines = Math.max(2, Math.ceil(used / 10));
  const restMd = lines * 10 - used;
  // Phones: a three-column label, one column per tile, four for the "more" cell.
  const usedSm = 3 + n + (day.more ? 4 : 0);
  const restSm = (4 - (usedSm % 4)) % 4;
  const fills = restMd > 10 ? [restMd - 10, 10] : restMd ? [restMd] : [];

  return (
    <Row as="ul" className="rs-day" aria-label={`${day.label}, ${day.date}`} onKeyDown={onKey}>
      <Cell as="li" span={2} rows={2} spanSm={3} className="rs-day__label" aria-hidden="true">
        <p className="w-title">{day.label}</p>
        <p className="w-small">{day.date}</p>
      </Cell>
      {day.acts.map((a) => (
        <Tile key={a.artist.slug} act={a} shown={a.artist.slug === selected} tileRef={tileRef(a.artist.slug)} onEnter={onEnter} onMove={onMove} onLeave={onLeave} onSelect={onSelect} />
      ))}
      {day.more && (
        <Cell as="li" span={10} spanSm={4} className="rs-more">
          <p className="w-small">More acts to be announced</p>
        </Cell>
      )}
      {fills.map((f, i) => (
        <Fill key={i} as="li" md={f} />
      ))}
      <Fill as="li" sm={restSm} />
    </Row>
  );
}

interface TileProps {
  act: Act;
  shown: boolean;
  tileRef: (el: HTMLButtonElement | null) => void;
  onEnter: (slug: string) => void;
  onMove: (slug: string) => void;
  onLeave: () => void;
  onSelect: (slug: string) => void;
}

function Tile({ act, shown, tileRef, onEnter, onMove, onLeave, onSelect }: TileProps) {
  const { artist } = act;
  const photo = photoSet(artist);
  return (
    <Cell as="li" span={2} spanSm={1} pad="none" className="rs-tile-cell">
      <button
        ref={tileRef}
        type="button"
        className="rs-tile"
        data-slug={artist.slug}
        data-roster-tile=""
        tabIndex={shown ? 0 : -1}
        aria-pressed={shown}
        onPointerEnter={(e) => e.pointerType === "mouse" && onEnter(artist.slug)}
        onPointerMove={(e) => e.pointerType === "mouse" && (e.movementX || e.movementY) && onMove(artist.slug)}
        onPointerLeave={onLeave}
        onFocus={() => onSelect(artist.slug)}
        onClick={() => onSelect(artist.slug)}
      >
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="rs-tile__photo"
            src={photo.src}
            srcSet={photo.srcSet}
            sizes="(min-width: 1280px) 15vw, (min-width: 768px) 17vw, 23vw"
            alt=""
            width={600}
            height={600}
            loading="lazy"
            decoding="async"
          />
        )}
        <span className="rs-tile__name">
          {tileWords(artist.name).map((w, i) => (
            <Fragment key={i}>
              {i > 0 && " "}
              <span className="rs-tile__word">{w}</span>
            </Fragment>
          ))}
        </span>
      </button>
    </Cell>
  );
}

/**
 * The feature's footage (muted loop over its poster) or photo; nothing for acts without media yet. Nothing
 * at all until the feature is near the viewport: a lazy image this far below the hero still loads with the
 * page where the browser's lazy margin is large (unknown connection: 2500px), competing with the hero.
 */
function FeatureMedia({ act, near, play, reduced }: { act: Act; near: boolean; play: boolean; reduced: boolean }) {
  const media = featureMedia(act.artist);
  const photo = photoSet(act.artist);
  if (!media) return null;
  return (
    <div className="rs-media" style={{ "--focus": media.focus } as CSSProperties}>
      {media.kind === "video" ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {near && media.poster && <img className="rs-media__img" src={media.poster} alt="" decoding="async" />}
          {near && !reduced && <Clip src={media.src} play={play} />}
        </>
      ) : near ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="rs-media__img" src={photo?.src ?? media.src} srcSet={photo?.srcSet} sizes="(min-width: 768px) 34vw, 100vw" alt="" decoding="async" />
      ) : null}
    </div>
  );
}

/** Muted loop: hidden until it is actually playing (iOS Low Power Mode shows the poster), unloaded on unmount. */
function Clip({ src, play }: { src: string; play: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (play) playWithRescue(v);
    else v.pause();
  }, [play]);
  useEffect(() => {
    const v = ref.current;
    return () => {
      if (!v) return;
      v.pause();
      v.removeAttribute("src");
      v.load();
    };
  }, []);
  return (
    <video
      ref={ref}
      className="rs-media__video"
      src={src}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      tabIndex={-1}
      onPlaying={(e) => e.currentTarget.setAttribute("data-playing", "")}
      onPause={(e) => e.currentTarget.removeAttribute("data-playing")}
    />
  );
}

/** The nearest tile from `from` in direction (dx, dy): rows stay rows, columns take the closest below/above. */
function nearest(tiles: Map<string, HTMLElement>, from: string, [dx, dy]: [number, number]) {
  const el = tiles.get(from);
  if (!el) return undefined;
  const centre = (r: DOMRect) => [r.left + r.width / 2, r.top + r.height / 2];
  const [ox, oy] = centre(el.getBoundingClientRect());
  let best: string | undefined;
  let bestScore = Infinity;
  tiles.forEach((node, slug) => {
    if (slug === from) return;
    const r = node.getBoundingClientRect();
    if (!r.width) return;
    const [x, y] = centre(r);
    const along = dx ? (x - ox) * dx : (y - oy) * dy;
    const across = dx ? Math.abs(y - oy) : Math.abs(x - ox);
    if (along <= 4) return;
    const score = dx ? along + across * 6 : along + across * 1.4;
    if (score < bestScore) {
      bestScore = score;
      best = slug;
    }
  });
  return best;
}
