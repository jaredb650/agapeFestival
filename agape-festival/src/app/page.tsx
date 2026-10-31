import dynamic from "next/dynamic";
import { preload } from "react-dom";
import { frostFontVariables } from "@/components/winter/frost/fonts";
import { Faq } from "@/components/winter/frost/Faq";
import { Flyer } from "@/components/winter/frost/Flyer";
import { Footer } from "@/components/winter/frost/Footer";
import { GettingHere } from "@/components/winter/frost/GettingHere";
import { Hero } from "@/components/winter/frost/Hero";
import { Lineup } from "@/components/winter/frost/Lineup";
import { Lockers } from "@/components/winter/frost/Lockers";
import { Merch } from "@/components/winter/frost/Merch";
import { Nav } from "@/components/winter/frost/Nav";
import { Reveal } from "@/components/winter/frost/Reveal";
import { Tickets } from "@/components/winter/frost/Tickets";
import { sentence } from "@/components/winter/frost/text";
import { GestureRescue } from "@/components/winter/page/GestureRescue";
import { FLYER, HERO, HERO_PORTRAIT_QUERY, OG_IMAGE } from "@/components/winter/page/media";
import { ARTISTS, LOCKERS, NAV_LINKS, SHOW_ARTIST_SELECT, TICKETS, WINTER, WINTER_DAYS } from "@/data/winter";
import "@/styles/frost-flyer.css";
import "@/styles/frost.css";

const SITE = "https://agape-festival.com";

// The roster ships only in builds with the flag (the env literal is inlined at build time).
const Roster =
  process.env.NEXT_PUBLIC_SHOW_ARTIST_SELECT === "1"
    ? dynamic(() => import("@/components/winter/frost/Roster").then((m) => m.Roster))
    : null;

// Event structured data. Dates only: doors times aren't announced yet.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  name: "ÄGAPĒ Winter Festival",
  description: `Two-day techno festival at ${WINTER.venue.full}, ${WINTER.dates.display}. One stage per day.`,
  startDate: WINTER.dates.startIso,
  endDate: WINTER.dates.endIso,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: WINTER.venue.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: WINTER.venue.address,
      addressLocality: WINTER.venue.city,
      addressRegion: WINTER.venue.region,
      postalCode: WINTER.venue.postalCode,
      addressCountry: "US",
    },
  },
  image: [`${SITE}${OG_IMAGE.src}`],
  url: `${SITE}/`,
  organizer: { "@type": "Organization", name: "ÄGAPĒ", url: WINTER.websiteUrl },
  performer: ARTISTS.filter((a) => a.kind === "artist").map((a) => ({ "@type": "MusicGroup", name: a.name })),
  offers: { "@type": "Offer", url: TICKETS.url, availability: "https://schema.org/InStock" },
};

// The nav lists the sections, not "Top" (the mark goes there).
const navLinks = NAV_LINKS.filter((l) => l.href !== "#hero").map((l) => ({ href: l.href, label: sentence(l.label) }));

export default function Home() {
  // Only the hero still is preloaded (it is the LCP); everything else loads lazily or after idle.
  if (HERO.mobile.src === HERO.desktop.src) {
    preload(HERO.desktop.src, { as: "image", fetchPriority: "high" });
  } else {
    preload(HERO.mobile.src, { as: "image", fetchPriority: "high", media: HERO_PORTRAIT_QUERY });
    preload(HERO.desktop.src, { as: "image", fetchPriority: "high", media: `not all and ${HERO_PORTRAIT_QUERY}` });
  }

  return (
    <div className={`fr ${frostFontVariables}`}>
      <a className="fr-skip" href="#main">
        Skip to content
      </a>
      <GestureRescue />
      <Nav
        links={navLinks}
        ticketsUrl={WINTER.tickets.url}
        mark={FLYER.mark}
        socials={WINTER.socials.map(({ url, handle }) => ({ url, handle }))}
        dateLine={`${WINTER.dates.display} · ${WINTER.venue.name}, ${WINTER.venue.city}`}
      />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Flyer />
        {SHOW_ARTIST_SELECT && Roster && (
          <section id="artists" className="fr-section" aria-labelledby="artists-title" data-reveal="">
            <Roster artists={ARTISTS} days={WINTER_DAYS} startSlug="flash-gea" />
          </section>
        )}
        <Lineup linkToRoster={SHOW_ARTIST_SELECT} />
        <Tickets />
        <Merch />
        <Faq />
        {LOCKERS.enabled && <Lockers />}
        <GettingHere />
      </main>
      <Footer />
      <Reveal />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
