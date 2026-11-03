// ============================================================
// ÄGAPĒ WINTER FESTIVAL (Feb 19–20, 2027): single source of truth
// for the winter page.
//
// Facts come from the official v3 flyer
// (~/Downloads/AgapeFestWinter_Flyers_v3_OnlyNumbersFixed). Anything not on
// the flyer and not confirmed by the client carries `needsConfirm: true` plus a
// `confirmNote` that starts with the literal marker TODO_CONFIRM
// (grep TODO_CONFIRM). Never replace those with guessed times, prices or
// policies. The client checklist is
// context/winter-redesign/content-questions.md.
//
// Shared brand data (merch, socials, Laylo, contact, lockers link) is
// re-exported from festival.ts, so there is one copy of it.
// ============================================================

import { BASE_PATH, COPY, FESTIVAL, LOCKER_URL, SOCIALS, type SocialLink } from "./festival";

// The September Shopify shop data was removed (Nov 3): it's sold out and the winter line isn't designed
// yet, so nothing on this site may link or point to the store.
export { SOCIALS, LOCKER_URL };
export type { SocialLink };

// ---- Feature flag ----
// Static export inlines NEXT_PUBLIC_* at build time. The Cloudflare Pages
// preview sets NEXT_PUBLIC_SHOW_ARTIST_SELECT=1; the GitHub Pages production
// build doesn't, so the artist select stays hidden there.
export const SHOW_ARTIST_SELECT = process.env.NEXT_PUBLIC_SHOW_ARTIST_SELECT === "1";

// ---- Confirmation marker ----
/** Every confirm note starts with this literal, so `grep TODO_CONFIRM` finds them all. */
export type ConfirmNote = `TODO_CONFIRM: ${string}`;

/** Mixin for content that is safe to show but still needs the client's sign-off. */
export interface Confirmable {
  needsConfirm: boolean;
  confirmNote?: ConfirmNote;
}

// ============================================================
// EVENT
// ============================================================

export type DayNumber = 1 | 2;

export interface WinterDay {
  day: DayNumber;
  /** Board label, e.g. "DAY 1". */
  label: string;
  /** ISO calendar date (America/New_York). */
  isoDate: string;
  /** Short display string, e.g. "FRI FEB 19". */
  date: string;
  /** Long display string, e.g. "Friday, February 19, 2027". */
  dateLong: string;
  weekday: string;
}

// Weekdays checked: 2027-02-19 is a Friday and 2027-02-20 is a Saturday.
export const WINTER_DAYS: readonly [WinterDay, WinterDay] = [
  {
    day: 1,
    label: "DAY 1",
    isoDate: "2027-02-19",
    date: "FRI FEB 19",
    dateLong: "Friday, February 19, 2027",
    weekday: "Friday",
  },
  {
    day: 2,
    label: "DAY 2",
    isoDate: "2027-02-20",
    date: "SAT FEB 20",
    dateLong: "Saturday, February 20, 2027",
    weekday: "Saturday",
  },
];

export const WINTER = {
  /** Title as printed on the flyer. */
  name: "ÄGAPĒ WINTER FESTIVAL",
  brand: "ÄGAPĒ FESTIVAL",
  /** Edition label used by the current landing page and the <title>. */
  edition: "Winter Edition",
  year: "2027",
  dates: {
    startIso: "2027-02-19",
    endIso: "2027-02-20",
    /** Flyer wording. */
    display: "February 19–20, 2027",
    short: "Feb 19–20",
    shortWithYear: "Feb 19–20, 2027",
    days: WINTER_DAYS,
  },
  venue: {
    name: "Industry City",
    neighborhood: "Sunset Park",
    city: "Brooklyn",
    region: "NY",
    location: "Brooklyn, NYC",
    full: "Industry City, Brooklyn, NYC",
    // Industry City's main address, also used in September. The flyer only
    // says "INDUSTRY CITY", so the building and entrance for winter aren't known yet.
    address: FESTIVAL.venue.address,
    addressFull: FESTIVAL.venue.addressFull,
    postalCode: "11232",
    /** Entrance/gate for winter. Unknown: September used the Courtyard 7/8 gates. */
    entrance: null as string | null,
    needsConfirm: true,
    confirmNote:
      "TODO_CONFIRM: winter building + entrance at Industry City (Sept used Courtyard 7/8 gates on 2nd Ave between 33rd & 34th St)" satisfies ConfirmNote,
  },
  /** One stage per day (flyer). Stage name/host unknown. */
  stagesPerDay: 1,
  /** Doors/close times are not announced. Keep null until confirmed; don't show placeholder times. */
  hours: null as string | null,
  tickets: {
    /** DICE is the only ticket channel. No tiers or prices are published yet. */
    provider: "DICE",
    url: "https://dice.fm/partner/tickets/event/6dyng3-gap-winter-festival-19th-feb-industry-city-new-york-city-tickets",
    cta: "Get tickets",
    needsConfirm: true,
    confirmNote:
      "TODO_CONFIRM: ticket types/prices (weekend vs single day?) and whether this one DICE link covers both days; its slug only says '19th-feb'" satisfies ConfirmNote,
  },
  countdown: {
    // TODO confirm doors time. Placeholder: midnight New York at the start of Feb 19.
    targetIso: "2027-02-19T00:00:00-05:00",
    ariaLabel: "Countdown to February 19, 2027, midnight New York time",
    needsConfirm: true,
    confirmNote: "TODO_CONFIRM: Day 1 doors time; countdown currently targets midnight" satisfies ConfirmNote,
  },
  contactEmail: FESTIVAL.contactEmail,
  websiteUrl: FESTIVAL.websiteUrl,
  laylo: FESTIVAL.laylo,
  socials: SOCIALS,
  newsletter: COPY.newsletter,
} as const;

// ============================================================
// LINEUP (flyer order, one stage per day, no set times announced)
// ============================================================

export type ArtistSlug =
  | "diossa"
  | "fenimore"
  | "uberkikz"
  | "ben-klock"
  | "len-faki"
  | "flash-gea"
  | "cara-elizabeth"
  | "mika-heggemann"
  | "davyboi"
  | "azzel-447"
  | "johannes-schuster"
  | "kuko"
  | "onlynumbers"
  | "vendex";

export type TbaId = "tba-1" | "tba-2";

export type LineupAct =
  | { kind: "artist"; slug: ArtistSlug; displayName: string }
  | {
      kind: "tba";
      id: TbaId;
      /**
       * Flyer redaction blob this slot belongs to: one unannounced act per blob, "a" (the wide one, line 2)
       * and "b" (line 3). The client confirmed Nov 3 that Day 1 has 2 unrevealed acts, not 3 (the wide
       * blob had been modelled as two slots).
       */
      blob: "a" | "b";
    };

export interface LineupDay extends WinterDay {
  /** Acts in flyer reading order. */
  acts: LineupAct[];
  /** The same acts split into the flyer's lines, so the board can echo the poster's line breaks. */
  lines: LineupAct[][];
}

const a = (slug: ArtistSlug, displayName: string): LineupAct => ({ kind: "artist", slug, displayName });
const tba = (id: TbaId, blob: "a" | "b"): LineupAct => ({ kind: "tba", id, blob });

// Flyer day 1:  DIOSSA • FENIMORE • ÜBERKIKZ / [████████] • BEN KLOCK / LEN FAKI • [████]
// Flyer day 2:  FLASH GEA • CARA ELIZABETH / MIKA HEGGEMANN • DAVYBOI /
//               AZZEL 447 • JOHANNES SCHUSTER / KUKO • ONLYNUMBERS • VENDEX
const DAY1_LINES: LineupAct[][] = [
  [a("diossa", "DIOSSA"), a("fenimore", "FENIMORE"), a("uberkikz", "ÜBERKIKZ")],
  [tba("tba-1", "a"), a("ben-klock", "BEN KLOCK")],
  [a("len-faki", "LEN FAKI"), tba("tba-2", "b")],
];

const DAY2_LINES: LineupAct[][] = [
  [a("flash-gea", "FLASH GEA"), a("cara-elizabeth", "CARA ELIZABETH")],
  [a("mika-heggemann", "MIKA HEGGEMANN"), a("davyboi", "DAVYBOI")],
  [a("azzel-447", "AZZEL 447"), a("johannes-schuster", "JOHANNES SCHUSTER")],
  [a("kuko", "KUKO"), a("onlynumbers", "ONLYNUMBERS"), a("vendex", "VENDEX")],
];

export const LINEUP: readonly [LineupDay, LineupDay] = [
  { ...WINTER_DAYS[0], acts: DAY1_LINES.flat(), lines: DAY1_LINES },
  { ...WINTER_DAYS[1], acts: DAY2_LINES.flat(), lines: DAY2_LINES },
];

// ============================================================
// ARTISTS (artist profiler). Filled from the press kits: Diossa, Len Faki and Azzel 447 have no kit bio; Vendex's
// and Azzel 447's kits have no video.
// ============================================================

export interface ArtistSocial {
  platform: "Instagram" | "TikTok" | "SoundCloud" | "Spotify" | "Resident Advisor" | "Website";
  url: string;
  handle?: string;
}

export interface NamedArtist {
  kind: "artist";
  slug: ArtistSlug;
  /** Name for alt text / JSON-LD / aria. Casing is a best guess from the all-caps flyer. */
  name: string;
  /** Exactly as printed on the flyer. */
  displayName: string;
  day: DayNumber;
  /** null → UI shows the "INTEL PENDING" placeholder. Never invent bios. */
  bio: string | null;
  /** ~600px-wide WebP for grid tiles. */
  headshot: string | null;
  /** ~1200px-wide WebP for the P1 panel. */
  headshotLarge: string | null;
  /** Short muted performance clip (H.264 MP4, no audio). The artist-select splash plays it on hover/tap. */
  clip: string | null;
  /** First frame of `clip` as WebP, shown until the clip is actually playing. */
  clipPoster: string | null;
  /**
   * Optional CSS object-position for the artist-select splash crop of the clip/headshot
   * (default "50% 30%"). Set it when the subject sits off-centre in a 9:16 clip.
   */
  splashFocus?: string;
  /**
   * Where the face sits in the headshot, as a CSS position ("48% 32%"). The roster's square tile and the
   * bio photo crop around it (object-position), and the tile zooms in on it. Default "50% 28%".
   */
  focus?: string;
  /** How far the roster's square tile zooms in on `focus` (1 = the whole photo). Default 1. */
  zoom?: number;
  socials?: ArtistSocial[];
}

export interface LockedArtist {
  kind: "tba";
  slug: TbaId;
  name: "To be revealed";
  displayName: "???";
  day: 1;
  locked: true;
}

export type ArtistEntry = NamedArtist | LockedArtist;

const WINTER_ARTIST_DIR = `${BASE_PATH}/assets/winter/artists`;

// Adapted from the September press-kit bio in festival.ts ("Flashgea"):
// September/2026-specific wording removed and nothing added.
// Tomorrowland release, US tour venues and the 240 KMH support slot are kept as stated there.
const FLASH_GEA_BIO =
  "Flash Gea (pronounced jē) is a DJ and techno producer born and raised in the Bronx. " +
  "He can be found spinning at raves all around America, and on TikTok and Instagram as @flash.gea, " +
  "where his videos and music have received 100+ million views and have been co-signed by the likes of " +
  "Sara Landry, 240 KMH, Mija and MCR-T. As a producer he is known for a bouncy techno sound that combines " +
  "elements of techno, acid and Latin percussion with his staple “sassy” vocals. " +
  "His breakout year in 2025 brought two songs past a million streams, a collaboration with renowned " +
  "techno artist JSTJR and his first international raves (ADE, F2F). He has since released on Tomorrowland, " +
  "headed out on his first domestic US tour with stops at the Hollywood Palladium in Los Angeles, the Ramova " +
  "Theater in Chicago and the Ave Live in Philadelphia, and provided direct support for the 240 KMH group at " +
  "their NYC Face 2 Face show with ÄGAPĒ.";

// Winter press-kit bios (Nov 2026, Liminal / Diagonal / Polyamor booker kits). Each is the kit's own text, cut to
// about Flash Gea's length by dropping whole sentences (dated or tour lines first). Nothing is added; the wording
// is the kit's apart from the small fixes noted.

// "Ben Klock - Bio.pdf" (Liminal, Oct 2026): the marathon-sets, Dawning/Subzero, remix and Klockworks-roster
// sentences dropped for length, and "In 2023 the project returns after a pandemic induced break" (dated).
// Fixes: "however" dropped (its contrast sentence is gone), "the BBC Radio 1’s" → "BBC Radio 1’s",
// "Sao Paolo" → "São Paulo".
const BEN_KLOCK_BIO =
  "Being one of the most in-demand Techno DJs of our times, Ben Klock needs little introduction. " +
  "His name has been closely associated with Berlin’s legendary club Berghain since 2005. His monthly residency " +
  "has formed the backdrop to his international success, providing an invaluable platform for his ability to " +
  "create a room rather than just play to it. It was these inherent abilities that led him to compile the fabric 66 " +
  "compilation in 2012, before winning BBC Radio 1’s Essential Mix of the Year award in 2015. His releases on " +
  "Ostgut Ton have become landmarks in the imprint’s history. For many, it is his album One (2009) that best " +
  "captures Klock’s talents as a producer. Additionally, Klock curates with great passion his own label " +
  "Klockworks, founded in 2006. In 2017 Ben started his own event series PHOTON which is a unique concept show " +
  "that blends light, architecture and music. Since then he toured PHOTON at special venues in major cities around " +
  "the world such as Printworks (London), Gashouder (Amsterdam), Arca (São Paulo), to name a few.";

// "FENIM0RE - Bio.pdf" (Liminal, Oct 2026), complete. The kit styles the name FENIM0RE (with a zero);
// the flyer's spelling is kept here until that's confirmed.
const FENIMORE_BIO =
  "Fenimore creates his signature sound by fusing bouncy bass lines with infectious, high-energy grooves. " +
  "Known for his seamless transitions and dynamic style, he crafts immersive sets that encourage both physical " +
  "movement and emotional connection. Part of a new wave of artists pushing techno forward through groove, tempo " +
  "and high-energy performance, he has played Berlin institutions such as RSO and Tresor, and is closely connected " +
  "to the BCCO family, with appearances at GRÜV x BCCO and Glitch Festival. As a producer, his music has been " +
  "released on Agora Records, Vibrant Collective and Inherit Records.";

// "ÜBERKIKZ - Bio.pdf" (Liminal, Oct 2026), complete; the kit's all-caps ÜBERKIKZ written Überkikz.
const UBERKIKZ_BIO =
  "Überkikz combines driving kicks, tooly synths, and tribal and folkloric elements into a hypnotic journey. " +
  "With each kick, she tells stories that resonate deeply, encouraging a confrontation with one’s origins. Free " +
  "from thought, almost instinctively, her sets are a call to surrender to the moment and experience all these raw " +
  "emotions in their purest form. At the heart of her sets lies the belief that we all share a common origin — " +
  "beyond nationality, culture, gender, or sexuality. Music is the universal bond that unites us, and this is the " +
  "essence Überkikz aims to express through her art: the power of rhythms to bring us together as a community and " +
  "remind us of the unity of all humanity.";

// "Cara Elizabeth - Bio.pdf" (Liminal, Oct 2026), complete.
const CARA_ELIZABETH_BIO =
  "Cara Elizabeth is a Berlin-based Hard Trance producer and DJ, celebrated for her unique ability to blend " +
  "driving rhythms with melodic depth. Her performances are characterized by striking vocal elements that enhance " +
  "the dynamic and engaging nature of her sound. With a commitment to connecting with her audience, she delivers " +
  "each set with a perfect balance of energy and precision, ensuring an unforgettable experience for all who " +
  "attend. As Cara continues to push boundaries of her genre, she remains a prominent figure in the electronic " +
  "music scene, captivating listeners with her innovative approach and passion for the art of DJing.";

// "Mika Heggemann - Bio.pdf" (Liminal, Oct 2026): the dated lines dropped ("2025 marks a defining chapter",
// "This year…" Boiler Room/festival season, "Looking ahead to 2026…"), plus the studio-assistant, BDME and
// sold-out All Night Long sentences for length.
const MIKA_HEGGEMANN_BIO =
  "Mika Heggemann is pioneering Nu Trance — a new wave of club music blending the euphoria of trance with the raw " +
  "edge of techno and the bounce of hard house. Based in Berlin, Mika’s sound channels high-octane energy and " +
  "emotional intensity, taking cues from breakbeat and rap culture the way Nu Metal once redefined rock. Beyond his " +
  "work as a producer and DJ, Mika co-founded Polyamor Berlin — a collective that captures the rebellious, " +
  "exhilarating spirit of the next generation of club culture. Following standout releases on Polyamor Records, " +
  "Kontor Records, Teletech, and Warner Music — including collaborations like Discotheque with Davyboi and Acid " +
  "Base Reactions with DJ Cringey and KYANU — Mika has solidified his position as a driving force in the Nu Trance " +
  "movement. His single Heartbeat Destiny became a festival anthem. With over 100 shows across Europe, Colombia, " +
  "Australia, and the United States, and performances at Mondo Disko (Madrid), Fuse (Brussels), Gotec " +
  "(Karlsruhe), RSO (Berlin), Bootshaus (Cologne), and Input (Barcelona), Mika continues to redefine what " +
  "high-energy club culture feels like.";

// "Biography_Davyboi.pdf" (Polyamor Agency, Dropbox PK_Davyboi): "His latest podcast on Radio Rudina & Hör
// Berlin…" dropped (dated), and the "music is more than sound" paragraph for length. Fixes: a comma after
// "Polish roots", "148 – 155" → "148–155".
const DAVYBOI_BIO =
  "Davyboi, DJ and producer with Polish roots, is rapidly becoming one of the most exciting new names in Europe’s " +
  "rising hard-dance and trance scene. Born on the dancefloor, he blends adrenaline-charged grooves with " +
  "heart-stirring melodies, never staying in one lane and never letting the energy drop. Driven by an instinct for " +
  "movement, his signature style fuses trance, eurodance, and hardhouse between 148–155 BPM. Energetic, emotional, " +
  "and built to lift the crowd higher with every drop. What began as a passion project in Munich’s underground has " +
  "evolved into a distinct sound marked by fast transitions, bold track selection, and a deep understanding of " +
  "what makes a crowd move. In the studio, he continues to push boundaries, including collaborations like " +
  "“Discotheque” with Mika Heggemann, which highlighted his ability to translate his live energy into " +
  "unforgettable productions. Expect hands in the air, contagious smiles, and a dancefloor that never stands still.";

// "KUKO - Bio.pdf" (Liminal, Oct 2026), complete except "Over the past year," (dated). The kit's all-caps KUKO is
// written Kuko (as ÜBERKIKZ → Überkikz above); "rising star - KUKO" → "rising star: Kuko".
const KUKO_BIO =
  "Emerging from the vibrant city of Cologne, Kuko is rapidly carving out his place as a formidable force in the " +
  "techno scene with his distinctive melancholic-industrial sound. He has electrified audiences at prestigious " +
  "events like Unreal, Adrenaline, and Teletech, leaving an indelible mark with every performance. His residencies " +
  "at Adrenaline and Unreal highlight his significant impact within the community. Kuko’s ability to transport " +
  "listeners into a realm of haunting melodies and driving rhythms, coupled with his infectious energy on stage, " +
  "creates an unforgettable experience. Don’t miss your chance to witness the evolution of this rising star: Kuko " +
  "is an artist destined to shape the future of techno!";

// "Onlynumbers - Bio.pdf" (Liminal, Oct 2026): the "penchant for…" sentence and the closing forward-looking
// paragraph dropped for length.
const ONLYNUMBERS_BIO =
  "Meet Onlynumbers, a rising force in the electrifying realm of techno music. Combining elements of euphoria, " +
  "percussion, and hard techno, Onlynumbers has carved out a distinct sonic niche that reverberates throughout the " +
  "hard techno scene. Born from the creative depths of France and now living in Czechia, Onlynumbers burst onto " +
  "the scene with a meteoric rise. Since then, he has graced the stages of Europe’s premier venues, delivering " +
  "unforgettable sets that leave crowds craving more. His influence extends far beyond the confines of the stage, " +
  "as his productions have become staples in the sets of the biggest DJs in the scene. Tracks like “Miss the " +
  "Rave,” “Euphoric Night,” and his explosive EP “My Heart is Raging” on Taapion Records have solidified his status " +
  "as a trailblazer in the genre. Collaborating with fellow luminary Basswell, they released a series of legendary " +
  "tracks including “Lunar,” “Fusion,” and “This is War,” further cementing their places at the forefront of the " +
  "techno movement.";

// "Vendex - Bio.pdf" (Liminal, Oct 2026), complete.
const VENDEX_BIO =
  "Vendex found his way, the path of Techno, with a philosophy that envelops him in a cloak of darkness. " +
  "Influenced by the literature of Dante Alighieri in his work the Divine Comedy, as well as everything related to " +
  "history, Vendex comes with the intention of creating a path to an inner journey wrapped in dark melodies, blunt " +
  "and sharp bass that defy the natural, reaching supernatural sounds that touch or even reach what would be the " +
  "sound of the underworld. Generating sounds that guide the Dantesque idea of a trip to the underworld with the " +
  "aim of reaching paradise. All this through a forceful and enveloping sound, thus creating a path to the nine " +
  "levels of hell, purgatory and finally reaching paradise. Influenced today in his sessions by artists such as " +
  "Dax J, Parallx, I Hate Models, Scalameriya, Ancient Methods, Tommy Four Seven or Setaoc Mass and many more.";

// "Johannes Schuster - Bio.pdf" (Liminal), complete. Fixes: "Agape" → "ÄGAPĒ", "DJ Sets" → "DJ sets", and
// "NineTimesNineSoma" → "NineTimesNine, Soma" (two labels run together in the PDF).
const JOHANNES_SCHUSTER_BIO =
  "Johannes Schuster’s story is about passion, evolution, and relentless ambition. A tale that begins with a " +
  "15-year-old and his first piece of vinyl, up to being a resident of the iconic German techno event brand " +
  "‘Unreal’ and the New York City-based ÄGAPĒ, gaining a global reputation through his incendiary DJ sets and " +
  "playing regularly on the worldwide techno circuit. His sonic arsenal? Johannes Schuster’s signature sound " +
  "blends bouncy, rave-inspired rhythms with emotive pads, razor-sharp acid lines, and classic old-school grooves. " +
  "His dynamic DJ sets have earned him widespread recognition, captivating audiences across continents. Much " +
  "attention has also been given to his fantastic productions on his own label 7E6D and other prominent labels, " +
  "such as NineTimesNine, Soma, Green Fetish, Voxnox, and many more.";

/**
 * An act filled from its press kit (Nov 2026): `headshot-600/1200.webp` and, when the kit has usable
 * performance video, `clip.mp4` + `clip-poster.webp`, all in its artists/<slug>/ folder. See media-notes.md.
 */
const fromKit = (
  slug: ArtistSlug,
  name: string,
  displayName: string,
  day: DayNumber,
  bio: string | null,
  media: { clip: boolean; focus: string; zoom: number },
): NamedArtist => ({
  kind: "artist",
  slug,
  name,
  displayName,
  day,
  bio,
  headshot: `${WINTER_ARTIST_DIR}/${slug}/headshot-600.webp`,
  headshotLarge: `${WINTER_ARTIST_DIR}/${slug}/headshot-1200.webp`,
  clip: media.clip ? `${WINTER_ARTIST_DIR}/${slug}/clip.mp4` : null,
  clipPoster: media.clip ? `${WINTER_ARTIST_DIR}/${slug}/clip-poster.webp` : null,
  focus: media.focus,
  zoom: media.zoom,
});

const NAMED_ARTISTS: NamedArtist[] = [
  // Day 1
  {
    kind: "artist",
    slug: "diossa",
    name: "Diossa",
    displayName: "DIOSSA",
    day: 1,
    // Her press kit has photos only: no bio, clip or socials yet, so the bio shows the pending state.
    bio: null,
    headshot: `${WINTER_ARTIST_DIR}/diossa/headshot-600.webp`,
    headshotLarge: `${WINTER_ARTIST_DIR}/diossa/headshot-1200.webp`,
    clip: null,
    clipPoster: null,
    // Press-kit portrait (_DSC3806, Sept 2025), squared from head to jacket: the tile closes in on her face and hand.
    focus: "52% 36%",
    zoom: 1.5,
  },
  // FENIM0RE-370.tif (blue backdrop, eyes to camera); clip from SECTION 2026 (9:16, cut to 4:5).
  fromKit("fenimore", "Fenimore", "FENIMORE", 1, FENIMORE_BIO, { clip: true, focus: "45% 40%", zoom: 1.15 }),
  // IMG_0397 (shearling coat, industrial site); clip from HIVE 2026 (kiki_4K_20).
  fromKit("uberkikz", "Überkikz", "ÜBERKIKZ", 1, UBERKIKZ_BIO, { clip: true, focus: "50% 38%", zoom: 1.3 }),
  // Joachim Gern portrait (Gern_2); clip from Boiler Room "Glitch 3", after its logo and name cards.
  fromKit("ben-klock", "Ben Klock", "BEN KLOCK", 1, BEN_KLOCK_BIO, { clip: true, focus: "49% 33%", zoom: 1.3 }),
  // His kit (Diagonal "presskit" folder) has photos, videos and logos but no bio. "Len Faki 6" (orange light,
  // direct gaze); clip from De Marktkantine Amsterdam (profile, then from behind over the crowd).
  fromKit("len-faki", "Len Faki", "LEN FAKI", 1, null, { clip: true, focus: "48% 37%", zoom: 1.15 }),
  // Day 2
  {
    kind: "artist",
    slug: "flash-gea",
    name: "Flash Gea",
    displayName: "FLASH GEA",
    day: 2,
    bio: FLASH_GEA_BIO,
    headshot: `${WINTER_ARTIST_DIR}/flash-gea/headshot-600.webp`,
    headshotLarge: `${WINTER_ARTIST_DIR}/flash-gea/headshot-1200.webp`,
    // Him at ÄGAPĒ (F2F, Sept 2026, from his press kit's CF1_nyx3.mov): three of his shots, 576x720.
    clip: `${WINTER_ARTIST_DIR}/flash-gea/clip-agape.mp4`,
    clipPoster: `${WINTER_ARTIST_DIR}/flash-gea/clip-agape-poster.webp`,
    // The press shot is wide (a whole graffiti wall): the tile closes in on his face and folded arms.
    focus: "48% 32%",
    zoom: 1.5,
    socials: [{ platform: "Instagram", url: "https://www.instagram.com/flash.gea/", handle: "@flash.gea" }],
  },
  // 2_Cara Elizabeth (orange tiles; 5_ is only 972 px wide); clip from Schrotty Cologne (Nov 2025).
  fromKit("cara-elizabeth", "Cara Elizabeth", "CARA ELIZABETH", 2, CARA_ELIZABETH_BIO, {
    clip: true,
    focus: "47% 36%",
    zoom: 1.35,
  }),
  // Mika_June_25-4 (orange tee; the only shoot without sunglasses); clip from Schrotty Cologne (8.mp4).
  fromKit("mika-heggemann", "Mika Heggemann", "MIKA HEGGEMANN", 2, MIKA_HEGGEMANN_BIO, {
    clip: true,
    focus: "52% 33%",
    zoom: 1.4,
  }),
  // IMG_6648 (tie and blazer, direct gaze); clip from Unreal @ Junkyard Dortmund (010.mov).
  fromKit("davyboi", "Davyboi", "DAVYBOI", 2, DAVYBOI_BIO, { clip: true, focus: "56% 36%", zoom: 1.35 }),
  // The kit (Liminal) is four press pics (Marvin Ruppert, June 2026) and a rider: no bio, no video, so the bio
  // shows the pending state. 260605-azzel447-207 (colour, fist to temple, eyes to camera); the "sw" files are
  // the same shots in black and white, and 212 has both hands over the face.
  fromKit("azzel-447", "Azzel 447", "AZZEL 447", 2, null, { clip: false, focus: "49% 33%", zoom: 1.35 }),
  // IMG_6154 (Feb 2026 shoot: black bomber on red, studio light); clip from his kit's square multicam set
  // footage (copy_B01F76FE.mov, face-on at the mixer with the crowd behind).
  fromKit("johannes-schuster", "Johannes Schuster", "JOHANNES SCHUSTER", 2, JOHANNES_SCHUSTER_BIO, {
    clip: true,
    focus: "40% 36%",
    zoom: 1.35,
  }),
  // "KUKO - PRESSPICS" from the kit's "Updated EPK - Use this!" folder (the older folder says "ONLY USE FULL PIC",
  // so none of those were cropped); clip from the same EPK's 06_kuko_@weshtech.mp4.
  fromKit("kuko", "Kuko", "KUKO", 2, KUKO_BIO, { clip: true, focus: "50% 33%", zoom: 1.4 }),
  // Onlynumbers 1 (red bomber, front-on); clip from his kit's arena footage (copy_550B1038.MOV).
  fromKit("onlynumbers", "Onlynumbers", "ONLYNUMBERS", 2, ONLYNUMBERS_BIO, { clip: true, focus: "50% 34%", zoom: 1.35 }),
  // He performs in a gold mask: 123A1907 (PRESS KIT 2023, mask face-on against red). His kit has no video.
  fromKit("vendex", "Vendex", "VENDEX", 2, VENDEX_BIO, { clip: false, focus: "52% 33%", zoom: 1.3 }),
];

const LOCKED_ARTISTS: LockedArtist[] = (["tba-1", "tba-2"] as const).map((slug) => ({
  kind: "tba",
  slug,
  name: "To be revealed",
  displayName: "???",
  day: 1,
  locked: true,
}));

/** Flash Gea first, then the other named acts in flyer order, then the 2 locked tiles. The UI may shuffle them (grid isn't ordered by day). */
export const ARTISTS: ArtistEntry[] = [...NAMED_ARTISTS, ...LOCKED_ARTISTS];

export const ARTIST_BY_SLUG: Record<ArtistSlug, NamedArtist> = Object.fromEntries(
  NAMED_ARTISTS.map((artist) => [artist.slug, artist]),
) as Record<ArtistSlug, NamedArtist>;

// ============================================================
// FAQ (rewritten for winter)
// `a` is plain text; "\n\n" separates paragraphs. Optional `link` is appended
// after the answer. needsConfirm items use safe wording. The UI decides
// whether to show them before they're confirmed.
// ============================================================

export interface FaqLink {
  label: string;
  href: string;
  external: boolean;
}

export interface FaqItem extends Confirmable {
  id: string;
  q: string;
  a: string;
  link?: FaqLink;
}

export const FAQ: FaqItem[] = [
  {
    id: "dates",
    q: "When is ÄGAPĒ Winter Festival?",
    a: "Two days: Friday, February 19 and Saturday, February 20, 2027.",
    needsConfirm: false,
  },
  {
    id: "hours",
    q: "What are the festival hours?",
    a: "Door and closing times for each day will be announced soon. Join the newsletter to hear first.",
    needsConfirm: true,
    confirmNote: "TODO_CONFIRM: doors + close time for Day 1 (Fri) and Day 2 (Sat)",
  },
  {
    id: "venue",
    q: "Where is the festival?",
    a: "Industry City in Sunset Park, Brooklyn, NYC: 571 2nd Avenue, Brooklyn, NY 11232. Entrance details will be shared before the event.",
    needsConfirm: true,
    confirmNote:
      "TODO_CONFIRM: building + entrance gate for winter (Sept: Courtyard 7/8 gates, 2nd Ave between 33rd & 34th St)",
  },
  {
    id: "stages",
    q: "How many stages are there?",
    a: "One stage per day. Every act on a day's lineup plays that day's stage.",
    needsConfirm: false,
  },
  {
    id: "set-times",
    q: "When are set times announced?",
    a: "Set times haven't been announced yet. They'll be shared closer to the festival. Join the newsletter to get them first.",
    needsConfirm: false,
  },
  {
    id: "tickets",
    q: "Where can I buy tickets?",
    a: "Tickets are on sale now through DICE. Ticket options and prices are listed on the DICE event page.",
    link: { label: "Get tickets on DICE", href: WINTER.tickets.url, external: true },
    needsConfirm: true,
    confirmNote: "TODO_CONFIRM: ticket types (weekend pass vs single day?) so this answer can list them; DICE the only outlet?",
  },
  {
    id: "refunds",
    q: "Are tickets refundable or transferable?",
    a: "Refund and transfer terms are set out on the DICE event page.",
    link: { label: "View on DICE", href: WINTER.tickets.url, external: true },
    needsConfirm: true,
    confirmNote:
      "TODO_CONFIRM: refund/transfer policy on DICE (Sept on Posh was 'non-refundable but transferable'; DICE handles transfers differently)",
  },
  {
    id: "age",
    q: "Is there an age limit?",
    a: "Yes. ÄGAPĒ Festival is a 21+ event. Valid government-issued ID is required at entry.",
    needsConfirm: true,
    confirmNote: "TODO_CONFIRM: still 21+ for winter (carried over from September)",
  },
  {
    id: "reentry",
    q: "Is there re-entry?",
    a: "Re-entry details for Winter Edition will be confirmed closer to the date.",
    needsConfirm: true,
    confirmNote: "TODO_CONFIRM: re-entry policy for winter (Sept: re-entry permitted, keep wristband on)",
  },
  {
    id: "arrival",
    q: "What time should I arrive?",
    a: "We recommend arriving early to avoid queues. Door times will be announced soon.",
    needsConfirm: true,
    confirmNote: "TODO_CONFIRM: doors time (then this answer can name it)",
  },
  {
    id: "bring",
    q: "What should I bring?",
    a: "Valid government-issued ID (21+ event), your ticket on DICE, and comfortable shoes. It's February in New York, so dress for the cold on the way in and out. No professional cameras or outside drinks.",
    needsConfirm: true,
    confirmNote: "TODO_CONFIRM: prohibited items unchanged from Sept (no pro cameras / outside drinks)? any bag policy? (age line depends on FAQ.age)",
  },
  {
    id: "coat-check",
    q: "Is there a coat check?",
    a: "Coat check details will be shared before the event.",
    needsConfirm: true,
    confirmNote: "TODO_CONFIRM: is there a coat check? price? (winter event; not covered in Sept)",
  },
  {
    id: "lockers",
    q: "Will there be lockers?",
    a: "Locker details for Winter Edition will be confirmed closer to the date.",
    needsConfirm: true,
    confirmNote:
      "TODO_CONFIRM: lockers again for winter? same Elockers booking link (agapefestival.elocke.rs)? then restore the 'reserve in advance' answer + link",
  },
  {
    id: "getting-here",
    q: "How do I get there?",
    a: "Industry City is reachable by subway, car and rideshare. Directions and a map link are in the Getting Here section below.",
    link: { label: "Getting Here", href: "#getting-here", external: false },
    needsConfirm: false,
  },
  {
    id: "contact",
    q: "Who do I contact for press or partnerships?",
    a: `Email ${FESTIVAL.contactEmail} for press, partnership and sponsorship inquiries.`,
    link: { label: FESTIVAL.contactEmail, href: `mailto:${FESTIVAL.contactEmail}`, external: true },
    needsConfirm: false,
  },
];

// ============================================================
// GETTING HERE (from the September site; transit facts sourced
// there from industrycity.com/visit + MTA). The venue address is the
// same; the entrance gate is unconfirmed for winter.
// ============================================================

export interface TransitCard {
  id: "subway" | "drive" | "rideshare";
  label: string;
  title: string;
  body: string;
  /** Subway bullets (MTA colours). */
  lines?: { line: string; color: string; textColor: string }[];
}

export interface GettingHereInfo extends Confirmable {
  eyebrow: string;
  heading: string;
  intro: string;
  address: { line1: string; line2: string; full: string };
  /** null until the winter entrance is confirmed (Sept: Courtyard 7/8 gates). */
  entrance: string | null;
  mapsDirectionsUrl: string;
  /** No-API-key Google Maps embed. Sept inverted it with a CSS filter to fit the dark UI. */
  mapEmbedUrl: string;
  mapTitle: string;
  mapsCta: string;
  cards: TransitCard[];
  secondary: { buses: string[]; citiBike: string };
}

export const GETTING_HERE: GettingHereInfo = {
  eyebrow: "GETTING HERE",
  heading: "FIND YOUR WAY IN",
  intro:
    "Industry City sits in Sunset Park, Brooklyn. Easy by subway, car or rideshare. Pick your route and we'll see you at the door.",
  address: {
    line1: FESTIVAL.venue.address,
    line2: "Brooklyn, NY 11232",
    full: FESTIVAL.venue.addressFull,
  },
  entrance: null,
  mapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=571+2nd+Avenue+Brooklyn+NY+11232",
  mapEmbedUrl: "https://maps.google.com/maps?q=571+2nd+Avenue+Brooklyn+NY+11232&output=embed",
  mapTitle: "Industry City, 571 2nd Avenue, Brooklyn, NY",
  mapsCta: "OPEN IN GOOGLE MAPS →",
  cards: [
    {
      id: "subway",
      label: "SUBWAY",
      title: "36th St Station",
      body: "Closest stop to the venue. Use the map link above for live walking directions.",
      lines: [
        { line: "D", color: "#FF6319", textColor: "#fff" },
        { line: "N", color: "#FCCC0A", textColor: "#000" },
        { line: "R", color: "#FCCC0A", textColor: "#000" },
      ],
    },
    {
      id: "drive",
      label: "DRIVE",
      title: "I-278 W (BQE), EXIT 23",
      body: "Industry City's Lots B + C are entered from 2nd Ave + 37th St. Advance booking recommended.",
    },
    {
      id: "rideshare",
      label: "RIDESHARE",
      title: "DROP-OFF",
      body: `Set your Uber or Lyft destination to ${FESTIVAL.venue.addressFull}.`,
    },
  ],
  secondary: {
    buses: ["B35", "B37", "B70", "SIM"],
    citiBike: "2nd Ave + 32 St (closest), plus 37 / 39 St and 3rd Ave + 36 St",
  },
  needsConfirm: true,
  confirmNote:
    "TODO_CONFIRM: winter entrance/drop-off gate (Sept copy said Courtyard 7/8 gates, 2nd Ave between 33rd & 34th St); add it back to subway + rideshare cards once confirmed",
};

// ============================================================
// LOCKERS band
// ============================================================

export interface LockersInfo extends Confirmable {
  url: string;
  cta: string;
  note: string;
  /** Band is kept for winter (Jared). Flip to false if the client says no lockers. */
  enabled: boolean;
}

export const LOCKERS: LockersInfo = {
  url: LOCKER_URL,
  cta: "RESERVE A LOCKER →",
  // Sept note was "LIMITED ON-SITE LOCKERS BOTH DAYS · BOOK AHEAD"; restore once confirmed.
  note: "BOOK AHEAD",
  enabled: true,
  needsConfirm: true,
  confirmNote:
    "TODO_CONFIRM: lockers at the winter festival, both days? is agapefestival.elocke.rs set up for Feb 19–20?",
};

// ============================================================
// MERCH: locked until the winter line is ready
// ============================================================
// The September line is sold out and the new designs are still being made, so every piece shows
// as a locked shadow of its garment: no product photographs, no prices, and no link to any shop.
// The four pieces keep the September line's shapes (two tees, two hoodies). The silhouettes come
// from the old product cut-outs with every print removed
// (context/winter-redesign/media-scripts/merch_silhouettes.py). When the line drops, give each
// piece its real photographs and a page again.

export type MerchGarment = "tee" | "hoodie";

export interface MerchPiece {
  id: string;
  /** As shown on the plate (mixed case; Orbitron). */
  name: string;
  garment: MerchGarment;
}

const MERCH_DIR = `${BASE_PATH}/assets/winter/merch`;

/** Each garment's shadow, front and back. A base path: the image adds `-640.webp` / `-1280.webp`. */
export const MERCH_SILHOUETTES: Record<MerchGarment, { front: string; back: string }> = {
  tee: { front: `${MERCH_DIR}/tee-front`, back: `${MERCH_DIR}/tee-back` },
  hoodie: { front: `${MERCH_DIR}/hoodie-front`, back: `${MERCH_DIR}/hoodie-back` },
};

const MERCH_PIECES: MerchPiece[] = [
  { id: "tee-01", name: "Tee 01", garment: "tee" },
  { id: "hoodie-01", name: "Hoodie 01", garment: "hoodie" },
  { id: "tee-02", name: "Tee 02", garment: "tee" },
  { id: "hoodie-02", name: "Hoodie 02", garment: "hoodie" },
];

export const MERCH = {
  eyebrow: "MERCH",
  heading: "THE UNIFORM",
  body: "New designs are in the works. Merch is coming soon.",
  /** The lock's caption, on every piece and the preview. */
  status: "Coming soon",
  items: MERCH_PIECES,
  needsConfirm: true,
  confirmNote:
    "TODO_CONFIRM: the winter merch line: which pieces, their names and the drop date? Until then the section stays locked, with no shop link." satisfies ConfirmNote,
} as const;

// ============================================================
// TICKETS section copy (DICE link only, no tiers until confirmed)
// ============================================================

export const TICKETS = {
  eyebrow: "TICKETS",
  heading: "GET TICKETS",
  body: "Tickets for ÄGAPĒ Winter Festival are on sale now via DICE.",
  cta: "GET TICKETS ON DICE →",
  url: WINTER.tickets.url,
  needsConfirm: WINTER.tickets.needsConfirm,
  confirmNote: WINTER.tickets.confirmNote,
  /**
   * The promo code row (a tap copies the code). PLACEHOLDERS (Nov 3): swap `code` and `expires` for the
   * real ones, one line each. `expires` is shown exactly as written. Set `code` to null to hide the row.
   */
  promo: {
    label: "Promo code",
    code: "AGAPE00" as string | null, // PLACEHOLDER: the real DICE promo code
    expires: "00/00/00", // PLACEHOLDER: the real expiry date (MM/DD/YY)
    needsConfirm: true,
    confirmNote: "TODO_CONFIRM: the real promo code and its expiry date (both are placeholders)" satisfies ConfirmNote,
  },
  /** The quiet pay-later line under Get tickets (client voice note, Nov 3): the Afterpay mark + this note. */
  afterpay: {
    logo: `${BASE_PATH}/assets/winter/afterpay-white.svg`, // official white wordmark, from static.afterpay.com
    note: "Available at checkout · 4 interest-free installments",
  },
} as const;

// ============================================================
// SECTIONS / NAV
// ============================================================

export type SectionId =
  | "hero"
  | "flyer"
  | "lineup"
  | "artists"
  | "tickets"
  | "merch"
  | "faq"
  | "lockers"
  | "getting-here"
  | "footer";

export interface SectionDef {
  id: SectionId;
  /** Nav / micro-label text. */
  label: string;
  href: `#${SectionId}`;
  /** Show in the nav menu. */
  inNav: boolean;
  /** Feature-flagged sections render only when this is true. */
  enabled: boolean;
}

/**
 * Page order: keep it the same as page.tsx renders the sections, so the bar, the menu and the footer list
 * them top to bottom (the roster, when it's on, sits above the lineup). Gallery and partners sections are
 * intentionally dropped for winter.
 */
export const SECTIONS: SectionDef[] = [
  { id: "hero", label: "TOP", href: "#hero", inNav: true, enabled: true },
  { id: "flyer", label: "FLYER", href: "#flyer", inNav: false, enabled: false }, // classic-notext: not mounted
  { id: "artists", label: "THE ROSTER", href: "#artists", inNav: true, enabled: SHOW_ARTIST_SELECT },
  { id: "lineup", label: "LINEUP", href: "#lineup", inNav: true, enabled: true },
  { id: "tickets", label: "TICKETS", href: "#tickets", inNav: true, enabled: true },
  { id: "merch", label: "MERCH", href: "#merch", inNav: true, enabled: true },
  { id: "faq", label: "FAQ", href: "#faq", inNav: true, enabled: true },
  { id: "lockers", label: "LOCKERS", href: "#lockers", inNav: false, enabled: LOCKERS.enabled },
  { id: "getting-here", label: "GETTING HERE", href: "#getting-here", inNav: true, enabled: true },
  { id: "footer", label: "CONTACT", href: "#footer", inNav: false, enabled: true },
];

export const NAV_LINKS = SECTIONS.filter((s) => s.enabled && s.inNav).map(({ label, href }) => ({ label, href }));

// ============================================================
// FOOTER
// ============================================================

export const FOOTER = {
  venueLine: WINTER.venue.full,
  dateLine: WINTER.dates.display,
  contactEmail: FESTIVAL.contactEmail,
  contactBlurb: "For bookings, press, and partnership inquiries.",
  socials: SOCIALS,
  newsletterLabel: "NEWSLETTER",
  credit: { label: "SITE DESIGN BY MEKA", url: "https://www.instagram.com/_x.meka.x_/", icon: "/assets/logos/meka-icon.webp" },
  copyright: `© ${WINTER.year} ÄGAPĒ FESTIVAL. ALL RIGHTS RESERVED.`,
  origin: COPY.origin.toUpperCase(),
} as const;

// ============================================================
// Helpers
// ============================================================

/** Every unresolved TODO_CONFIRM in this file, for a dev-only checklist overlay or a test. */
export function pendingConfirmations(): { where: string; note: string }[] {
  const out: { where: string; note: string }[] = [];
  const push = (where: string, item: { needsConfirm: boolean; confirmNote?: string }) => {
    if (item.needsConfirm && item.confirmNote) out.push({ where, note: item.confirmNote });
  };
  push("WINTER.venue", WINTER.venue);
  push("WINTER.tickets", WINTER.tickets);
  push("TICKETS.promo", TICKETS.promo);
  push("WINTER.countdown", WINTER.countdown);
  FAQ.forEach((item) => push(`FAQ.${item.id}`, item));
  push("GETTING_HERE", GETTING_HERE);
  push("LOCKERS", LOCKERS);
  push("MERCH", MERCH);
  return out;
}
