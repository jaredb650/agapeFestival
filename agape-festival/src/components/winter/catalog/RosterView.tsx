"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { observeInView } from "@/components/winter/perf/inView";
import { playWithRescue } from "@/components/winter/page/GestureRescue";

export interface RosterArtist {
  slug: string;
  no: string;
  name: string;
  /** "Saturday, February 20" */
  day: string;
  bio: string | null;
  photo: string | null;
  clip: string | null;
  poster: string | null;
  focus: string;
  socials: { label: string; url: string }[];
}

export interface RosterDay {
  short: string;
  artists: RosterArtist[];
  /** Unannounced slots that day. */
  tba: number;
}

interface Props {
  days: RosterDay[];
  initial: string;
  mark: { src: string; width: number; height: number };
}

/** The selected artist's clip: loads when the card nears the viewport, plays only while visible. */
function Clip({ src, poster, focus, label }: { src: string; poster: string | null; focus: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);
  const inView = useRef(false);

  useEffect(() => {
    const vid = ref.current;
    if (!vid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) userPaused.current = true;
    return observeInView(
      vid,
      (visible) => {
        inView.current = visible;
        if (!visible) return vid.pause();
        setArmed(true);
        if (vid.src && !userPaused.current) playWithRescue(vid);
      },
      { rootMargin: "120px 0px" },
    );
  }, [src]);

  // First play once the source is attached.
  useEffect(() => {
    const vid = ref.current;
    if (armed && vid && inView.current && !userPaused.current) playWithRescue(vid);
  }, [armed]);

  return (
    <>
      <video
        ref={ref}
        className="cat-roster__img"
        style={{ "--focus": focus } as CSSProperties}
        src={armed ? src : undefined}
        poster={poster ?? undefined}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        aria-label={label}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className="cat-roster__toggle"
        onClick={() => {
          const vid = ref.current;
          if (!vid) return;
          if (playing) {
            userPaused.current = true;
            vid.pause();
          } else {
            userPaused.current = false;
            if (armed) vid.play().catch(() => {});
            else setArmed(true);
          }
        }}
      >
        {playing ? "Pause clip" : "Play clip"}
      </button>
    </>
  );
}

/**
 * The roster as a label's artist index: each day's names in flyer order (the
 * selected one underlined in red), and one card with the photo or clip, the
 * day and the bio. Artists without media get the plain house sleeve.
 */
export function RosterView({ days, initial, mark }: Props) {
  const [sel, setSel] = useState(initial);
  const card = useRef<HTMLElement>(null);
  const all = days.flatMap((d) => d.artists);
  const a = all.find((x) => x.slug === sel) ?? all[0];

  const pick = (slug: string) => {
    setSel(slug);
    // Phones: bring the card into view if the tap left it below the fold.
    const el = card.current;
    if (el && window.matchMedia("(max-width: 767px)").matches) {
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.6) el.scrollIntoView({ block: "start" });
    }
  };

  return (
    <div className="cat-roster">
      <div className="cat-roster__index">
        {days.map((d) => (
          <div key={d.short} className="cat-roster__day">
            <p className="cat-roster__dlabel">{d.short}</p>
            <ul className="cat-roster__names">
              {d.artists.map((x) => (
                <li key={x.slug}>
                  <button type="button" aria-pressed={x.slug === a.slug} aria-controls="roster-card" onClick={() => pick(x.slug)}>
                    {x.name}
                  </button>
                </li>
              ))}
              {d.tba > 0 && <li className="cat-roster__tba">+{d.tba} to be revealed</li>}
            </ul>
          </div>
        ))}
      </div>

      <article ref={card} id="roster-card" className="cat-roster__card" aria-labelledby="roster-name">
        <div className="cat-roster__media">
          {a.clip ? (
            <Clip key={a.slug} src={a.clip} poster={a.poster ?? a.photo} focus={a.focus} label={`${a.name} performing`} />
          ) : a.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="cat-roster__img" src={a.photo} alt={a.name} loading="lazy" decoding="async" style={{ "--focus": a.focus } as CSSProperties} />
          ) : (
            <span className="cat-roster__sleeve" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mark.src} width={mark.width} height={mark.height} alt="" />
            </span>
          )}
        </div>
        <div className="cat-roster__text">
          <p className="cat-no">{a.no}</p>
          <h3 id="roster-name" className="cat-roster__name">
            {a.name}
          </h3>
          <p className="cat-roster__when">{a.day}</p>
          <p className="cat-roster__bio">{a.bio ?? "Photo and bio to follow."}</p>
          {a.socials.length > 0 && (
            <ul className="cat-roster__links">
              {a.socials.map((s) => (
                <li key={s.url}>
                  <a className="cat-link" href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </div>
  );
}
