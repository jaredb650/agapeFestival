"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { playWithRescue } from "@/components/winter/page/GestureRescue";
import { ArrowIcon } from "./icons";

export interface RosterAct {
  slug: string;
  name: string;
  locked: boolean;
  bio: string | null;
  photo: string | null;
  photoLarge: string | null;
  clip: string | null;
  clipPoster: string | null;
  /** Tower-footage still shown until the act's own media arrives. */
  still: string | null;
  socials: { label: string; url: string; platform: string }[];
}

export interface RosterDay {
  day: 1 | 2;
  label: string;
  date: string;
  acts: RosterAct[];
}

/** Crops of the one tower still behind the tiles of acts without a photo (one image, many frames). */
const CROPS = ["22% 18%", "58% 30%", "40% 62%", "70% 12%", "30% 44%", "64% 74%", "48% 8%", "20% 82%", "76% 50%"];

const firstWithMedia = (d: RosterDay) => d.acts.find((a) => a.clip || a.photo) ?? d.acts[0];

export function RosterView({ days, still }: { days: RosterDay[]; still: string }) {
  // Open on the act with real footage, so the section shows what it does straight away.
  const start = days.find((d) => d.acts.some((a) => a.clip)) ?? days[0];
  const [day, setDay] = useState<1 | 2>(start.day);
  const [slug, setSlug] = useState(firstWithMedia(start).slug);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  // Phones clamp a long bio to six lines; the open state belongs to one act.
  const [bioOpenFor, setBioOpenFor] = useState<string | null>(null);

  const current = days.find((d) => d.day === day) ?? days[0];
  const act = current.acts.find((a) => a.slug === slug) ?? current.acts[0];

  const pickDay = useCallback(
    (d: 1 | 2) => {
      const next = days.find((x) => x.day === d);
      if (!next) return;
      setDay(d);
      setSlug(firstWithMedia(next).slug);
    },
    [days],
  );

  // A name in the lineup opens that act here (the link itself scrolls to the section).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[data-pick]");
      const pick = link?.getAttribute("data-pick");
      if (!pick) return;
      const owner = days.find((d) => d.acts.some((a) => a.slug === pick));
      if (!owner) return;
      setDay(owner.day);
      setSlug(pick);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [days]);

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const j = (i + (e.key === "ArrowRight" ? 1 : -1) + days.length) % days.length;
    pickDay(days[j].day);
    tabs.current[j]?.focus();
  };

  return (
    <div className="s-roster__body" data-reveal="">
      <div className="s-tabs" role="tablist" aria-label="Day">
        {days.map((d, i) => (
          <button
            key={d.day}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`roster-tab-${d.day}`}
            aria-selected={d.day === day}
            aria-controls="roster-panel"
            tabIndex={d.day === day ? 0 : -1}
            className="s-tab"
            onClick={() => pickDay(d.day)}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            {d.label}
            <span className="s-mono">{d.date}</span>
          </button>
        ))}
      </div>

      <div className="s-roster__panel" id="roster-panel" role="tabpanel" aria-labelledby={`roster-tab-${day}`}>
        <ul className="s-strip" aria-label={`${current.label} artists`}>
          {current.acts.map((a, i) => (
            <li key={a.slug}>
              <button
                type="button"
                className="s-tile"
                data-locked={a.locked || undefined}
                aria-pressed={a.slug === act.slug}
                onClick={() => setSlug(a.slug)}
              >
                {!a.locked && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.photo ?? still}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    style={a.photo ? undefined : { objectPosition: CROPS[i % CROPS.length] }}
                    data-still={a.photo ? undefined : ""}
                  />
                )}
                <span className="s-tile__name">{a.name}</span>
              </button>
            </li>
          ))}
        </ul>

        <article className="s-feature" aria-label={act.name}>
          <div className="s-feature__media" data-locked={act.locked || undefined}>
            {act.clip ? (
              <FeatureClip key={act.slug} src={act.clip} poster={act.clipPoster ?? act.photoLarge ?? ""} />
            ) : act.photoLarge || act.still ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={act.slug}
                src={act.photoLarge ?? act.still ?? ""}
                alt={act.photoLarge ? act.name : ""}
                decoding="async"
                data-still={act.photoLarge ? undefined : ""}
              />
            ) : null}
          </div>
          <div className="s-feature__text">
            <p className="s-feature__meta">
              {current.label}
              <span className="s-mono">{current.date}</span>
            </p>
            <h3 className="s-feature__name">{act.name}</h3>
            <p
              className="s-feature__bio"
              id="roster-bio"
              data-long={(act.bio?.length ?? 0) > 320 || undefined}
              data-open={bioOpenFor === act.slug || undefined}
            >
              {act.locked ? "This act will be announced soon." : (act.bio ?? "Bio and footage coming soon.")}
            </p>
            {(act.bio?.length ?? 0) > 320 && (
              <button
                type="button"
                className="s-more"
                aria-controls="roster-bio"
                aria-expanded={bioOpenFor === act.slug}
                onClick={() => setBioOpenFor(bioOpenFor === act.slug ? null : act.slug)}
              >
                {bioOpenFor === act.slug ? "Show less" : "Read full bio"}
              </button>
            )}
            {act.socials.length > 0 && (
              <ul className="s-feature__links">
                {act.socials.map((s) => (
                  <li key={s.url}>
                    <a className="s-link" href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.platform} {s.label !== s.platform ? s.label : ""}
                      <ArrowIcon />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

/** The act's muted clip: plays only while on screen, fades in once it actually plays. Reduced motion: poster. */
function FeatureClip({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const vid = ref.current;
    if (!vid) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) playWithRescue(vid);
      else vid.pause();
    });
    io.observe(vid);
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt="" decoding="async" />
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        data-playing={playing || undefined}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </>
  );
}
