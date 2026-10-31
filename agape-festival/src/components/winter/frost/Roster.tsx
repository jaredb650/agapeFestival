"use client";

import { useEffect, useRef, useState } from "react";
import type { ArtistEntry, DayNumber, NamedArtist, WinterDay } from "@/data/winter";
import { Icon } from "./Icon";
import { SectionHead } from "./SectionHead";
import { properName } from "./text";

const isNamed = (a: ArtistEntry): a is NamedArtist => a.kind === "artist";
const hasMedia = (a: NamedArtist) => Boolean(a.clipPoster ?? a.headshotLarge ?? a.headshot);

/** A day's tab label: "Friday 19". */
const tabLabel = (d: WinterDay) => `${d.weekday} ${Number(d.isoDate.slice(8))}`;

/**
 * The roster, plainly: pick a day, pick a name, and the profile beside the
 * list shows that artist's footage (or photo) with a caption and the bio.
 * Acts without media yet get a plain frame and say so. Lineup names link
 * here (`a[data-artist]`) and select the artist.
 */
export function Roster({ artists, days, startSlug }: { artists: ArtistEntry[]; days: readonly WinterDay[]; startSlug: string }) {
  const named = artists.filter(isNamed);
  const start = named.find((a) => a.slug === startSlug) ?? named[0];
  const [slug, setSlug] = useState(start.slug);
  const [day, setDay] = useState<DayNumber>(start.day);
  const profileRef = useRef<HTMLDivElement>(null);

  const artist = named.find((a) => a.slug === slug) ?? start;
  const list = named.filter((a) => a.day === day);
  const locked = artists.filter((a) => !isNamed(a) && a.day === day).length;
  const dayInfo = days.find((d) => d.day === artist.day)!;

  const pick = (next: NamedArtist, reveal: boolean) => {
    setSlug(next.slug);
    setDay(next.day);
    // On phones the profile sits under the list: bring it into view if it is below the fold.
    const el = profileRef.current;
    if (reveal && el && el.getBoundingClientRect().top > window.innerHeight * 0.6) {
      el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  };

  // Lineup names (`a[data-artist]`) open the matching profile.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>("a[data-artist]");
      const hit = a && named.find((n) => n.slug === a.dataset.artist);
      if (hit) {
        setSlug(hit.slug);
        setDay(hit.day);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
    // `named` is derived from a static prop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fr-wrap fr-roster">
      <div className="fr-roster__index">
        <SectionHead id="artists-title" title="The roster">
          <p>Choose a name to see their footage and bio. More profiles are added as artists send them.</p>
        </SectionHead>
        <div className="fr-tabs" role="group" aria-label="Festival day">
          {days.map((d) => {
            const first = named.find((a) => a.day === d.day)!;
            return (
              <button
                key={d.day}
                type="button"
                className="fr-tab"
                aria-pressed={day === d.day}
                onClick={() => {
                  setDay(d.day);
                  if (artist.day !== d.day) setSlug(first.slug);
                }}
              >
                {tabLabel(d)}
              </button>
            );
          })}
        </div>
        <ul className="fr-roster__names" aria-label={`${days.find((d) => d.day === day)!.weekday} artists`}>
          {list.map((a) => (
            <li key={a.slug}>
              <button type="button" className="fr-roster__name" aria-pressed={a.slug === slug} onClick={() => pick(a, true)}>
                {properName(a.displayName)}
              </button>
            </li>
          ))}
          {locked > 0 && <li className="fr-roster__more">More to be revealed</li>}
        </ul>
      </div>

      <div ref={profileRef} className="fr-profile" data-media={hasMedia(artist) || undefined}>
        <span className="fr-sr" aria-live="polite">
          Showing {artist.name}
        </span>
        <ProfileMedia key={artist.slug} artist={artist} />
        <div className="fr-profile__text">
          <h3 className="fr-profile__name">{artist.name}</h3>
          <p className="fr-profile__meta">
            Day {artist.day} · {dayInfo.dateLong.replace(/, \d{4}$/, "")}
          </p>
          {artist.bio ? (
            <p className="fr-profile__bio">{artist.bio}</p>
          ) : (
            <p className="fr-profile__bio fr-profile__bio--pending">Bio and footage to come.</p>
          )}
          {artist.socials?.map((s) => (
            <a key={s.url} className="fr-link fr-profile__social" href={s.url} target="_blank" rel="noopener noreferrer">
              {s.platform} {s.handle}
              <Icon name="arrow-up-right" size={14} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/** The splash clip (muted, plays only while on screen), else the photo, else a plain frame. */
function ProfileMedia({ artist }: { artist: NamedArtist }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const vid = ref.current;
    if (!vid) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) vid.play().catch(() => {});
      else vid.pause();
    });
    io.observe(vid);
    return () => io.disconnect();
  }, []);

  const still = artist.clipPoster ?? artist.headshotLarge ?? artist.headshot;
  if (!still) return null;
  const pos = artist.splashFocus ? { objectPosition: artist.splashFocus } : undefined;
  return (
    <div className="fr-profile__media">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={still} alt={artist.clip ? `${artist.name} performing` : artist.name} style={pos} loading="lazy" decoding="async" />
      {artist.clip && (
        <video
          ref={ref}
          style={pos}
          src={artist.clip}
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
      )}
    </div>
  );
}
