// The kits' CSS first, so section stylesheets (imported by their components below) can build on it. The
// grid kit stays until phase 2 has moved every section to the classic kit (classic.css, loaded last).
import "@/styles/winter.css";
import "@/styles/grid.css";
import "@/styles/winter-page.css";
import "@/styles/classic.css";
import { preload } from "react-dom";
import { RevealObserver } from "@/components/winter/classic";
import { winterFontVariables } from "@/components/winter/fonts";
import { Gap } from "@/components/winter/grid";
import { ArtistSelectSection } from "@/components/winter/page/ArtistSelectSection";
import { FlyerSection } from "@/components/winter/page/FlyerSection";
import { Footer } from "@/components/winter/page/Footer";
import { GestureRescue } from "@/components/winter/page/GestureRescue";
import { Hero } from "@/components/winter/page/Hero";
import { Faq } from "@/components/winter/page/Faq";
import { GettingHere } from "@/components/winter/page/GettingHere";
import { Lockers } from "@/components/winter/page/Lockers";
import { Lineup } from "@/components/winter/page/Lineup";
import { LoopBackground } from "@/components/winter/page/LoopBackground";
import { Merch } from "@/components/winter/page/Merch";
import { Nav } from "@/components/winter/page/Nav";
import { Tickets } from "@/components/winter/page/Tickets";
import { Preloader } from "@/components/winter/preloader/Preloader";
import { BG, FLYER, HERO, HERO_PORTRAIT_QUERY, OG_IMAGE } from "@/components/winter/page/media";
import { ARTISTS, LOCKERS, NAV_LINKS, SHOW_ARTIST_SELECT, TICKETS, WINTER } from "@/data/winter";

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
    <div className={`winter wpage ${winterFontVariables}`}>
      <a className="wskip" href="#main">
        Skip to content
      </a>
      <Preloader />
      <GestureRescue />
      <LoopBackground media={BG} />
      <Nav
        links={NAV_LINKS}
        ticketsUrl={WINTER.tickets.url}
        ticketsLabel={WINTER.tickets.cta}
        mark={FLYER.mark}
        socials={WINTER.socials.map(({ url, handle }) => ({ url, handle }))}
      />
      <main id="main" tabIndex={-1}>
        {/* Frozen: the hero and the flyer layover, under their own scanlines (winter-page.css .wposter). */}
        <div className="wposter">
          <Hero />
          <FlyerSection />
          <div className="wposter__scan" aria-hidden="true" />
        </div>
        {/* Classic sections (components/winter/classic): each draws its own hairline and padding. */}
        {SHOW_ARTIST_SELECT && <ArtistSelectSection />}
        <Lineup linkToSelect={SHOW_ARTIST_SELECT} />
        {/* Grid sections, until phase 2 moves them to the classic kit: a gap band separates them. */}
        <Gap />
        <Tickets />
        <Gap />
        <Merch />
        <Gap />
        <Faq />
        <Gap />
        {LOCKERS.enabled && <Lockers />}
        {LOCKERS.enabled && <Gap />}
        <GettingHere />
        <Gap />
      </main>
      <Footer links={NAV_LINKS} />
      <RevealObserver />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
