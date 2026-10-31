import { preload } from "react-dom";
import { fontVariables } from "@/components/winter/simple/fonts";
import { FlyerSection } from "@/components/winter/page/FlyerSection";
import { GestureRescue } from "@/components/winter/page/GestureRescue";
import { ScrollBackground } from "@/components/winter/page/ScrollBackground";
import { Faq } from "@/components/winter/simple/Faq";
import { Footer } from "@/components/winter/simple/Footer";
import { GettingHere } from "@/components/winter/simple/GettingHere";
import { Hero } from "@/components/winter/simple/Hero";
import { Lineup } from "@/components/winter/simple/Lineup";
import { Lockers } from "@/components/winter/simple/Lockers";
import { Merch } from "@/components/winter/simple/Merch";
import { Nav } from "@/components/winter/simple/Nav";
import { Reveal } from "@/components/winter/simple/Reveal";
import { Roster } from "@/components/winter/simple/Roster";
import { Tickets } from "@/components/winter/simple/Tickets";
import { sentence } from "@/components/winter/simple/labels";
import { BG, BG_TIMES, FLYER, HERO, HERO_PORTRAIT_QUERY, OG_IMAGE } from "@/components/winter/page/media";
import { ARTISTS, LOCKERS, NAV_LINKS, SHOW_ARTIST_SELECT, TICKETS, WINTER } from "@/data/winter";
import "@/styles/simple-base.css";
import "@/styles/simple-flyer.css";
import "@/styles/simple.css";

const SITE = "https://agape-festival.com";

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

export default function Home() {
  // Only the hero still is preloaded (it is the LCP); everything else loads lazily or after idle.
  if (HERO.mobile.src === HERO.desktop.src) {
    preload(HERO.desktop.src, { as: "image", fetchPriority: "high" });
  } else {
    preload(HERO.mobile.src, { as: "image", fetchPriority: "high", media: HERO_PORTRAIT_QUERY });
    preload(HERO.desktop.src, { as: "image", fetchPriority: "high", media: `not all and ${HERO_PORTRAIT_QUERY}` });
  }

  return (
    <div className={`s ${fontVariables}`}>
      <a className="s-skip" href="#main">
        Skip to content
      </a>
      <GestureRescue />
      <ScrollBackground media={BG} startTime={BG_TIMES.top} endTime={BG_TIMES.end} />
      <Nav
        links={NAV_LINKS.filter((l) => l.href !== "#hero").map((l) => ({ label: sentence(l.label), href: l.href }))}
        ticketsUrl={WINTER.tickets.url}
        ticketsLabel={WINTER.tickets.cta}
        mark={FLYER.mark}
        socials={WINTER.socials.map(({ url, handle }) => ({ url, handle }))}
      />
      <main id="main" tabIndex={-1}>
        <Hero />
        <FlyerSection />
        {SHOW_ARTIST_SELECT && <Roster bgAt={BG_TIMES.afterLineup} />}
        <Lineup linkToRoster={SHOW_ARTIST_SELECT} />
        <Tickets bgAt={SHOW_ARTIST_SELECT ? undefined : BG_TIMES.afterLineup} />
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
