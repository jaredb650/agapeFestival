import { FLYER } from "@/components/winter/page/media";
import { ARTIST_BY_SLUG, type ArtistSlug } from "@/data/winter";
import { ACTS, DAYS } from "./data";
import { RosterView, type RosterDay } from "./RosterView";
import { Section } from "./Section";

/** The roster (gated by SHOW_ARTIST_SELECT in page.tsx): every named act, numbered as in the lineup. */
export function Roster() {
  const days: RosterDay[] = DAYS.map((d) => {
    const acts = ACTS.filter((a) => a.day === d.day);
    return {
      short: d.short,
      tba: acts.filter((a) => !a.slug).length,
      artists: acts
        .filter((a) => a.slug)
        .map((act) => {
          const x = ARTIST_BY_SLUG[act.slug as ArtistSlug];
          return {
            slug: x.slug,
            no: act.no,
            name: x.name,
            day: d.long,
            bio: x.bio,
            photo: x.headshotLarge ?? x.headshot,
            clip: x.clip,
            poster: x.clipPoster,
            focus: x.splashFocus ?? "50% 30%",
            socials: (x.socials ?? []).map((s) => ({ label: `${s.platform} ${s.handle ?? ""}`.trim(), url: s.url })),
          };
        }),
    };
  });
  // Open on the first act with footage (Flash Gea for now), else the first act.
  const all = days.flatMap((d) => d.artists);
  const initial = (all.find((a) => a.clip) ?? all.find((a) => a.photo) ?? all[0]).slug;

  return (
    <Section id="artists">
      <RosterView days={days} initial={initial} mark={FLYER.mark} />
    </Section>
  );
}
