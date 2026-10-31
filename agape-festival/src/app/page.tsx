import { preload } from "react-dom";
import { mono } from "@/components/winter/catalog/fonts";
import { NAV_ITEMS } from "@/components/winter/catalog/data";
import { Footer } from "@/components/winter/catalog/Footer";
import { GettingHere } from "@/components/winter/catalog/GettingHere";
import { Hero } from "@/components/winter/catalog/Hero";
import { Nav } from "@/components/winter/catalog/Nav";
import { Reveal } from "@/components/winter/catalog/Reveal";
import { Roster } from "@/components/winter/catalog/Roster";
import { Faq, Lineup, Lockers, Merch, Tickets } from "@/components/winter/catalog/Sections";
import { FlyerSection } from "@/components/winter/page/FlyerSection";
import { GestureRescue } from "@/components/winter/page/GestureRescue";
import { FLYER, HERO, HERO_PORTRAIT_QUERY, OG_IMAGE } from "@/components/winter/page/media";
import { ARTISTS, LOCKERS, SHOW_ARTIST_SELECT, TICKETS, WINTER } from "@/data/winter";
import "@/components/winter/catalog/flyer.css";
import "@/components/winter/catalog/catalog.css";

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

/**
 * v4-mono ("Catalog"): the old landing page carried into a full page, set like
 * a techno label's sleeve listing. No preloader, no scroll-scrubbed
 * background: flat black under everything.
 */
export default function Home() {
  // Only the hero still is preloaded (it is the LCP); everything else loads lazily.
  if (HERO.mobile.src === HERO.desktop.src) {
    preload(HERO.desktop.src, { as: "image", fetchPriority: "high" });
  } else {
    preload(HERO.mobile.src, { as: "image", fetchPriority: "high", media: HERO_PORTRAIT_QUERY });
    preload(HERO.desktop.src, { as: "image", fetchPriority: "high", media: `not all and ${HERO_PORTRAIT_QUERY}` });
  }

  return (
    <div className={`cat ${mono.variable}`}>
      <a className="cat-skip" href="#main">
        Skip to content
      </a>
      <GestureRescue />
      <Nav
        items={NAV_ITEMS.map(({ href, label, cat }) => ({ href, label, cat }))}
        ticketsUrl={WINTER.tickets.url}
        ticketsLabel={WINTER.tickets.cta}
        mark={FLYER.mark}
        socials={WINTER.socials.map(({ url, handle }) => ({ url, handle }))}
        when={`${WINTER.dates.display} · ${WINTER.venue.full}`}
      />
      <main id="main" tabIndex={-1}>
        <Hero />
        <FlyerSection />
        {SHOW_ARTIST_SELECT && <Roster />}
        <Lineup />
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
