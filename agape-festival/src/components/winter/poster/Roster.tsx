"use client";

import { useEffect, useRef, useState } from "react";
import { playWithRescue } from "@/components/winter/page/GestureRescue";
import { ArrowUpRight, Pause, Play } from "./icons";

export interface RosterArtist {
  slug: string;
  name: string;
  day: 1 | 2;
  locked: boolean;
  bio: string | null;
  photo: string | null;
  clip: string | null;
  clipPoster: string | null;
  focus: string;
  socials: { platform: string; url: string; handle?: string }[];
}

export interface RosterDay {
  day: 1 | 2;
  label: string;
}

/** The splash clip: plays muted while the stage is on screen, fades in once actually playing, with a pause control. */
function Clip({ src, poster, focus }: { src: string; poster: string | null; focus: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const vid = ref.current;
    if (!vid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) vid.pause();
      else if (!userPaused.current) playWithRescue(vid);
    });
    io.observe(vid);
    return () => io.disconnect();
  }, [src]);

  return (
    <>
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="pp-roster__media" src={poster} alt="" loading="lazy" decoding="async" style={{ objectPosition: focus }} />
      )}
      <video
        ref={ref}
        className="pp-roster__media pp-roster__video"
        data-playing={playing || undefined}
        src={src}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
        style={{ objectPosition: focus }}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className="pp-roster__toggle"
        aria-label={playing ? "Pause clip" : "Play clip"}
        onClick={() => {
          const vid = ref.current;
          if (!vid) return;
          if (playing) {
            userPaused.current = true;
            vid.pause();
          } else {
            userPaused.current = false;
            vid.play().catch(() => {});
          }
        }}
      >
        {playing ? <Pause /> : <Play />}
      </button>
    </>
  );
}

/**
 * The roster: a plain index of every act by day, and a stage that shows the
 * selected act's splash clip (or photo) and bio. Names in the lineup below
 * also select here (they link to #artists with data-artist).
 */
export function Roster({ artists, days, initial }: { artists: RosterArtist[]; days: RosterDay[]; initial: string }) {
  const [slug, setSlug] = useState(initial);
  const stageRef = useRef<HTMLDivElement>(null);
  const current = artists.find((a) => a.slug === slug) ?? artists[0];
  const day = days.find((d) => d.day === current.day);

  // Lineup names (a[data-artist]) pick here; the link's own #artists jump does the scrolling.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>("a[data-artist]");
      const next = a?.dataset.artist;
      if (next && artists.some((x) => x.slug === next && !x.locked)) setSlug(next);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [artists]);

  const pick = (next: string) => {
    setSlug(next);
    // Stacked layout: bring the stage back into view when it has scrolled away above.
    const stage = stageRef.current;
    if (stage && stage.getBoundingClientRect().top < 0 && !window.matchMedia("(min-width: 960px)").matches) {
      stage.scrollIntoView({ block: "start" });
    }
  };

  return (
    <div className="pp-roster">
      <div ref={stageRef} className="pp-roster__stage" id="roster-stage">
        <div className="pp-roster__frame">
          {current.clip ? (
            <Clip key={current.slug} src={current.clip} poster={current.clipPoster ?? current.photo} focus={current.focus} />
          ) : current.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={current.slug} className="pp-roster__media" src={current.photo} alt={current.name} loading="lazy" decoding="async" style={{ objectPosition: current.focus }} />
          ) : (
            <span className="pp-roster__empty">Photo coming soon</span>
          )}
        </div>
        <div className="pp-roster__info" aria-live="polite">
          <p className="pp-roster__day">{day?.label}</p>
          <h3 className="pp-roster__name">{current.name}</h3>
          <p className="pp-roster__bio" data-pending={!current.bio || undefined}>
            {current.bio ?? "Bio coming soon."}
          </p>
          {current.socials.length > 0 && (
            <ul className="pp-roster__links">
              {current.socials.map((s) => (
                <li key={s.url}>
                  <a className="pp-link" href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.platform} {s.handle} <ArrowUpRight />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="pp-roster__index">
        {days.map((d) => (
          <div key={d.day} className="pp-roster__group">
            <h3 className="pp-roster__group-head">{d.label}</h3>
            <ul className="pp-roster__list">
              {artists
                .filter((a) => a.day === d.day)
                .map((a) =>
                  a.locked ? (
                    <li key={a.slug}>
                      <span className="pp-roster__row" data-locked="">
                        To be revealed
                      </span>
                    </li>
                  ) : (
                    <li key={a.slug}>
                      <button
                        type="button"
                        className="pp-roster__row"
                        aria-pressed={a.slug === slug}
                        aria-controls="roster-stage"
                        onClick={() => pick(a.slug)}
                      >
                        <span>{a.name}</span>
                        {(a.clip || a.photo) && <span className="pp-roster__has">{a.clip ? "Video" : "Photo"}</span>}
                      </button>
                    </li>
                  ),
                )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
