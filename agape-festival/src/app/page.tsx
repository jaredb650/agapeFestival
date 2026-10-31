import { preload } from "react-dom";
import { FlyerSection } from "@/components/winter/page/FlyerSection";
import { GestureRescue } from "@/components/winter/page/GestureRescue";
import { HERO, HERO_PORTRAIT_QUERY, OG_IMAGE } from "@/components/winter/page/media";
import { posterSans } from "@/components/winter/poster/fonts";
import { Faq } from "@/components/winter/poster/Faq";
import { FlyerBackdrop } from "@/components/winter/poster/FlyerBackdrop";
import { Footer } from "@/components/winter/poster/Footer";
import { GettingHere } from "@/components/winter/poster/GettingHere";
import { Hero } from "@/components/winter/poster/Hero";
import { Lineup } from "@/components/winter/poster/Lineup";
import { Lockers } from "@/components/winter/poster/Lockers";
import { Merch } from "@/components/winter/poster/Merch";
import { Nav, type NavLink } from "@/components/winter/poster/Nav";
import { Reveal } from "@/components/winter/poster/Reveal";
import { RosterSection } from "@/components/winter/poster/RosterSection";
import { Tickets } from "@/components/winter/poster/Tickets";
import { ARTISTS, LOCKERS, SHOW_ARTIST_SELECT, TICKETS, WINTER } from "@/data/winter";
import manifest from "../../public/assets/winter/manifest.json";
import "@/styles/poster.css";
import "@/styles/poster-flyer.css";

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

// Content sections in page order; each one's number is its place in this list (the numbered rules and the menu).
const SECTIONS = [
  { key: "roster", label: "Roster", href: "#artists", on: SHOW_ARTIST_SELECT, nav: true },
  { key: "lineup", label: "Lineup", href: "#lineup", on: true, nav: true },
  { key: "tickets", label: "Tickets", href: "#tickets", on: true, nav: true },
  { key: "merch", label: "Merch", href: "#merch", on: true, nav: true },
  { key: "faq", label: "FAQ", href: "#faq", on: true, nav: true },
  { key: "lockers", label: "Lockers", href: "#lockers", on: LOCKERS.enabled, nav: false },
  { key: "getting-here", label: "Getting here", href: "#getting-here", on: true, nav: true },
]
  .filter((s) => s.on)
  .map((s, i) => ({ ...s, index: String(i + 1).padStart(2, "0") }));
const { src, width, height } = manifest.flyer.backgroundStill;
const FLYER_STILL = { src, width, height };
const idx = (key: string) => SECTIONS.find((s) => s.key === key)?.index ?? "";
const MENU: NavLink[] = SECTIONS.map(({ label, href, index }) => ({ label, href, index }));
const NAV = MENU.filter((l) => SECTIONS.find((s) => s.href === l.href)?.nav);

export default function Home() {
  // Only the hero still is preloaded (it is the LCP); everything else loads lazily or after idle.
  preload(HERO.mobile.src, { as: "image", fetchPriority: "high", media: HERO_PORTRAIT_QUERY });
  preload(HERO.desktop.src, { as: "image", fetchPriority: "high", media: `not all and ${HERO_PORTRAIT_QUERY}` });

  return (
    <div className={`pp ${posterSans.variable}`}>
      <a className="pp-skip" href="#main">
        Skip to content
      </a>
      <GestureRescue />
      <Nav
        links={NAV}
        menu={MENU}
        ticketsUrl={WINTER.tickets.url}
        ticketsLabel={WINTER.tickets.cta}
        provider={WINTER.tickets.provider}
        socials={WINTER.socials.map(({ url, handle }) => ({ url, handle }))}
      />
      <main id="main" tabIndex={-1}>
        <Hero />
        <FlyerBackdrop still={FLYER_STILL}>
          <FlyerSection />
        </FlyerBackdrop>
        {SHOW_ARTIST_SELECT && <RosterSection index={idx("roster")} />}
        <Lineup index={idx("lineup")} linkToSelect={SHOW_ARTIST_SELECT} />
        <Tickets index={idx("tickets")} />
        <Merch index={idx("merch")} />
        <Faq index={idx("faq")} />
        {LOCKERS.enabled && <Lockers index={idx("lockers")} />}
        <GettingHere index={idx("getting-here")} />
      </main>
      <Footer links={NAV.map(({ label, href }) => ({ label, href }))} />
      <Reveal />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
