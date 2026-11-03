"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { StageHeading } from "@/components/winter/classic";
import { playWithRescue } from "@/components/winter/page/GestureRescue";
import { observeInView } from "@/components/winter/perf";
import { ArrowRight } from "@/components/winter/ui";
import type { ArtistEntry, WinterDay } from "@/data/winter";
import { BioDialog } from "./BioDialog";
import { useReducedMotion } from "./hooks";
import { buildRoster, photoSet, type Act, type RosterDay } from "./acts";
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
 * of cards (two across on phones, three from 768px): the photo, graded to black and white, over a dark
 * name plate in Orbitron. Acts without a photo yet show a crop of the thread texture. Day 1's unannounced
 * acts share one "to be revealed" card. Pressing a card (or a name in the lineup) pops its bio out of it.
 *
 * Performance: the bio dialog mounts only once the roster is near the viewport; photos are lazy; an act's
 * clip loads on the first hover (fine pointers only) and plays only while hovered.
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

  const openAct = useCallback((next: string, from: HTMLElement) => {
    anchorRef.current = from;
    setSlug(next);
    setNear(true);
    setOpen(true);
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
      setSlug((cur) => {
        const list = roster.order;
        const at = list.findIndex((a) => a.artist.slug === cur);
        return list[(at + dir + list.length) % list.length].artist.slug;
      });
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

/** One day: the stage heading, then its cards. An odd count on phones gives the first card the full width. */
function DayBlock({ day, cropFrom, dialogId, onOpen }: DayBlockProps) {
  const headingId = `artists-day-${day.day}`;
  const count = day.acts.length + (day.more ? 1 : 0);
  const wideFirst = count % 2 === 1;
  return (
    <div className="rs-day">
      <StageHeading label={day.label} id={headingId} red>
        {day.date}
      </StageHeading>
      <ul className="rs-grid" aria-labelledby={headingId} data-reveal="">
        {day.acts.map((a, i) => (
          <li key={a.artist.slug} className="rs-cell" data-wide={(wideFirst && i === 0) || undefined}>
            <Card act={a} crop={THREAD_CROPS[(cropFrom + i) % THREAD_CROPS.length]} dialogId={dialogId} onOpen={onOpen} wide={wideFirst && i === 0} />
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

interface CardProps {
  act: Act;
  crop: string;
  dialogId: string;
  wide: boolean;
  onOpen: (slug: string, from: HTMLElement) => void;
}

function Card({ act, crop, dialogId, wide, onOpen }: CardProps) {
  const { artist } = act;
  const photo = photoSet(artist);
  const [hovered, setHovered] = useState(false);
  const [clipOn, setClipOn] = useState(false);
  const style = photo ? undefined : ({ "--crop": crop } as CSSProperties);
  return (
    <button
      type="button"
      className="rs-card"
      data-slug={artist.slug}
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
      <span className="rs-card__media" data-photo={photo ? "" : undefined} style={style}>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="rs-card__img"
            src={photo.src}
            srcSet={photo.srcSet}
            sizes={wide ? "(min-width: 768px) 400px, 100vw" : "(min-width: 768px) 400px, 50vw"}
            alt=""
            width={600}
            height={600}
            loading="lazy"
            decoding="async"
          />
        )}
        {clipOn && artist.clip && <Clip src={artist.clip} play={hovered} />}
      </span>
      <span className="rs-card__plate">
        <span className="k-name rs-card__name">{artist.name}</span>
        <ArrowRight className="rs-card__arrow" size={16} />
      </span>
      <span className="w-sr-only">
        , Day {act.day}. {artist.bio ? "Read bio" : "Bio to be announced"}
      </span>
    </button>
  );
}

/** The acts still to come on a day: one card, the September site's red "to be revealed" treatment. */
function Mystery() {
  return (
    <div className="rs-card rs-card--tba">
      <span className="rs-card__media rs-tba" aria-hidden="true">
        <span className="rs-tba__marks">???</span>
      </span>
      <span className="rs-card__plate">
        <span className="k-label rs-tba__label">To be revealed</span>
      </span>
    </div>
  );
}

/** A muted loop over the photo: visible only once it is actually playing; unloaded on unmount. */
function Clip({ src, play }: { src: string; play: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (play) {
      v.currentTime = 0;
      playWithRescue(v);
    } else v.pause();
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
      onPause={(e) => e.currentTarget.removeAttribute("data-playing")}
    />
  );
}
