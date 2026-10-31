import { preload } from "react-dom";
import { winterFontVariables } from "@/components/winter/fonts";
import { Grain } from "@/components/winter/ui";
import { ArtistSelectSection } from "@/components/winter/page/ArtistSelectSection";
import { FlyerSection } from "@/components/winter/page/FlyerSection";
import { FloatingCta } from "@/components/winter/page/FloatingCta";
import { Footer } from "@/components/winter/page/Footer";
import { GestureRescue } from "@/components/winter/page/GestureRescue";
import { Hero } from "@/components/winter/page/Hero";
import { Faq } from "@/components/winter/page/Faq";
import { GettingHere } from "@/components/winter/page/GettingHere";
import { Lockers } from "@/components/winter/page/Lockers";
import { Lineup } from "@/components/winter/page/Lineup";
import { Merch } from "@/components/winter/page/Merch";
import { Nav } from "@/components/winter/page/Nav";
import { ScrollBackground } from "@/components/winter/page/ScrollBackground";
import { Tickets } from "@/components/winter/page/Tickets";
import { OffscreenPauser } from "@/components/winter/perf/OffscreenPauser";
import { BG, BG_TIMES, FLYER, HERO, HERO_PORTRAIT_QUERY, OG_IMAGE } from "@/components/winter/page/media";
import { ARTISTS, LOCKERS, NAV_LINKS, SHOW_ARTIST_SELECT, TICKETS, WINTER } from "@/data/winter";
import "@/styles/winter.css";
import "@/styles/winter-page.css";

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
      <GestureRescue />
      <ScrollBackground media={BG} startTime={BG_TIMES.top} endTime={BG_TIMES.end} />
      <Nav
        links={NAV_LINKS}
        ticketsUrl={WINTER.tickets.url}
        ticketsLabel={WINTER.tickets.cta}
        mark={FLYER.mark}
        socials={WINTER.socials.map(({ url, handle }) => ({ url, handle }))}
        dates={WINTER.dates}
      />
      <main id="main" tabIndex={-1}>
        <Hero />
        <FlyerSection />
        {/* Preview: the explorable profiler first, then the plain lineup for anyone who skips it. */}
        {SHOW_ARTIST_SELECT && <ArtistSelectSection bgAt={BG_TIMES.afterLineup} />}
        <Lineup linkToSelect={SHOW_ARTIST_SELECT} />
        <Tickets bgAt={SHOW_ARTIST_SELECT ? undefined : BG_TIMES.afterLineup} />
        <Merch />
        <Faq />
        {LOCKERS.enabled && <Lockers />}
        <GettingHere />
      </main>
      <FloatingCta href={WINTER.tickets.url} label={WINTER.tickets.cta} meta={{ left: WINTER.tickets.provider, right: WINTER.dates.short }} />
      <Footer links={NAV_LINKS} />
      <Grain animated />
      <OffscreenPauser />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
