"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type SyntheticEvent } from "react";
import { flushSync } from "react-dom";
import { StageHeading } from "@/components/winter/classic";
import { observeInView } from "@/components/winter/perf";
import { ArrowRight } from "@/components/winter/ui";
import type { ArtistEntry, WinterDay } from "@/data/winter";
import { BioDialog } from "./BioDialog";
import { useReducedMotion } from "./hooks";
import { buildRoster, photoSet, tileWords, type Act, type RosterDay } from "./acts";
import "@/styles/sections/roster.css";

export interface RosterProps {
  artists: readonly ArtistEntry[];
  days: readonly [WinterDay, WinterDay];
  /** Prefix for element ids. */
  id: string;
  /** The bio panel's venue line, "Industry City, Brooklyn". */
  venue: string;
}

/**
 * Where each photo-less card looks into the thread texture (the September site's wireframe, as a still):
 * a different crop per card, so the set reads as one material rather than one tile repeated.
 */
const THREAD_CROPS = ["18% 24%", "78% 18%", "42% 62%", "70% 38%", "8% 78%", "58% 30%", "30% 8%", "56% 72%", "50% 48%", "4% 40%", "86% 46%", "24% 96%", "64% 4%", "38% 34%"];

/**
 * The roster: the September site's artist cards. Per day a stage heading between hairlines, then a grid
 * of square tiles (two across on phones, three from 768px, all the same size): the photo, graded to black
 * and white, over a dark name plate in Orbitron. Acts without a photo yet show a crop of the thread texture. Day 1's unannounced
 * acts share one "to be revealed" card. Pressing a card (or a name in the lineup) pops its bio out of it.
 *
 * Performance: the bio dialog mounts only once the roster is near the viewport; photos are lazy; an act's
 * clip loads on the first hover (fine pointers only) and plays only while hovered. Touch has no hover: there
 * the clip plays in the bio, over the photo, once the card is tapped (on every pointer, for one behaviour).
 */
export function Roster({ artists, days, id, venue }: RosterProps) {
  const roster = useMemo(() => buildRoster(artists, days), [artists, days]);
  const [slug, setSlug] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [near, setNear] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const dialogId = `${id}-bio`;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    return observeInView(el, (v) => v && setNear(true), { rootMargin: "800px 0px" });
  }, []);

  // Committed synchronously, inside the tap: the bio's clip then calls play() within the gesture, which
  // iOS needs to start video in Low Power Mode.
  const openAct = useCallback((next: string, from: HTMLElement) => {
    anchorRef.current = from;
    flushSync(() => {
      setSlug(next);
      setNear(true);
      setOpen(true);
    });
  }, []);
  const close = useCallback(() => setOpen(false), []);

  // Names in the lineup link here (a[data-artist]): open that act's bio right where it was pressed.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as HTMLElement | null)?.closest<HTMLElement>("a[data-artist]");
      const next = link?.dataset.artist;
      if (!link || !next || !roster.bySlug.has(next)) return;
      e.preventDefault();
      openAct(next, link);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [roster, openAct]);

  const step = useCallback(
    (dir: -1 | 1) => {
      // Synchronous for the same reason as openAct (the next act's clip starts inside the press).
      flushSync(() =>
        setSlug((cur) => {
          const list = roster.order;
          const at = list.findIndex((a) => a.artist.slug === cur);
          return list[(at + dir + list.length) % list.length].artist.slug;
        }),
      );
    },
    [roster],
  );

  const act = slug ? roster.bySlug.get(slug) : undefined;

  return (
    <div ref={rootRef} className="rs">
      {roster.days.map((d, i) => (
        <DayBlock key={d.day} day={d} cropFrom={i === 0 ? 0 : roster.days[0].acts.length} dialogId={dialogId} onOpen={openAct} />
      ))}
      {near && act && (
        <BioDialog
          id={dialogId}
          act={act}
          day={roster.days[act.day - 1]}
          open={open}
          anchorRef={anchorRef}
          venue={venue}
          reduced={reduced}
          onClose={close}
          onStep={step}
        />
      )}
    </div>
  );
}

interface DayBlockProps {
  day: RosterDay;
  /** Index of this day's first act in THREAD_CROPS. */
  cropFrom: number;
  dialogId: string;
  onOpen: (slug: string, from: HTMLElement) => void;
}

/** One day: the stage heading, then its cards, every one the same square tile. */
function DayBlock({ day, cropFrom, dialogId, onOpen }: DayBlockProps) {
  const headingId = `artists-day-${day.day}`;
  return (
    <div className="rs-day">
      <StageHeading label={day.label} id={headingId} red>
        {day.date}
      </StageHeading>
      <ul className="rs-grid" aria-labelledby={headingId} data-reveal="">
        {day.acts.map((a, i) => (
          <li key={a.artist.slug} className="rs-cell">
            <Card act={a} crop={THREAD_CROPS[(cropFrom + i) % THREAD_CROPS.length]} dialogId={dialogId} onOpen={onOpen} />
          </li>
        ))}
        {day.more && (
          <li className="rs-cell">
            <Mystery />
          </li>
        )}
      </ul>
    </div>
  );
}

/**
 * The tile's rendered width (a third of the 1280 column from 768px, half the screen on phones), times
 * the act's zoom: a 1.5x crop asks for the 1200 photo where the whole one would take the 600.
 */
const tileSizes = (zoom: number) =>
  `(min-width: 1376px) ${Math.round(416 * zoom)}px, (min-width: 768px) ${Math.round(32 * zoom)}vw, ${Math.round(50 * zoom)}vw`;

interface CardProps {
  act: Act;
  crop: string;
  dialogId: string;
  onOpen: (slug: string, from: HTMLElement) => void;
}

/**
 * One act. The tile is plain boxes (the square photo over the name plate); the press target is a
 * transparent <button> laid over the whole tile. iOS Safari does not stretch a <button>'s children
 * across it (they shrink to their content), which collapsed the photo to nothing and left only the
 * plate, so no visible layout lives inside the button: it is sized by explicit width and height.
 */
function Card({ act, crop, dialogId, onOpen }: CardProps) {
  const { artist } = act;
  const photo = photoSet(artist);
  const [hovered, setHovered] = useState(false);
  const [clipOn, setClipOn] = useState(false);
  const style = (photo ? { "--focus": artist.focus, "--zoom": artist.zoom } : { "--crop": crop }) as unknown as CSSProperties;
  return (
    <div className="rs-card" data-slug={artist.slug}>
      <div className="rs-card__media" data-photo={photo ? "" : undefined} style={style}>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="rs-card__img"
            src={photo.src}
            srcSet={photo.srcSet}
            sizes={tileSizes(artist.zoom ?? 1)}
            alt=""
            width={600}
            height={600}
            loading="lazy"
            decoding="async"
          />
        )}
        {clipOn && artist.clip && <Clip src={artist.clip} play={hovered} />}
      </div>
      <div className="rs-card__plate" aria-hidden="true">
        <span className="k-name rs-card__name">
          {tileWords(artist.name).map((w, i) => (
            <Fragment key={i}>
              {i > 0 && " "}
              <span className="rs-card__word">{w}</span>
            </Fragment>
          ))}
        </span>
        <ArrowRight className="rs-card__arrow" size={16} />
      </div>
      <button
        type="button"
        className="rs-card__hit"
        aria-haspopup="dialog"
        aria-controls={dialogId}
        onClick={(e) => onOpen(artist.slug, e.currentTarget)}
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          setHovered(true);
          if (artist.clip) setClipOn(true);
        }}
        onPointerLeave={() => setHovered(false)}
      >
        <span className="w-sr-only">
          {artist.name}, Day {act.day}. {artist.bio ? "Read bio" : "Bio to be announced"}
        </span>
      </button>
    </div>
  );
}

/** The acts still to come on a day: one card, the September site's red "to be revealed" treatment. */
function Mystery() {
  return (
    <div className="rs-card rs-card--tba">
      <div className="rs-card__media rs-tba" aria-hidden="true">
        <span className="rs-tba__marks">???</span>
      </div>
      <div className="rs-card__plate">
        <span className="k-label rs-tba__label">To be revealed</span>
      </div>
    </div>
  );
}

/**
 * A muted loop over the photo (fine pointers, while hovered). It stays transparent until it is actually
 * playing, so a clip that is blocked, still loading or failed never covers the photo; if play() is
 * refused the photo simply stays (no retry on a later tap: that tap opens the bio). Unloaded on unmount.
 */
function Clip({ src, play }: { src: string; play: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  // First (effects run in order): the source is (re)attached before play() below. Unmount unloads it;
  // a remount of the same element (React's dev double-run) puts it back.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!v.getAttribute("src")) v.setAttribute("src", src);
    return () => {
      v.pause();
      v.removeAttribute("src");
      v.load();
    };
  }, [src]);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (play) {
      v.currentTime = 0;
      v.play()?.catch(() => {});
    } else v.pause();
  }, [play]);
  const off = (e: SyntheticEvent<HTMLVideoElement>) => e.currentTarget.removeAttribute("data-playing");
  return (
    <video
      ref={ref}
      className="rs-card__clip"
      src={src}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      tabIndex={-1}
      aria-hidden="true"
      onPlaying={(e) => e.currentTarget.setAttribute("data-playing", "")}
      onPause={off}
      onEmptied={off}
      onError={off}
    />
  );
}
