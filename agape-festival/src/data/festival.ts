// ============================================================
// ÄGAPĒ FESTIVAL 2026 — Single source of truth for all content
// ============================================================

// Base path — empty for custom domain root deployment
export const BASE_PATH = "";

export interface Artist {
  name: string;
  day: 1 | 2;
  stage: "outdoor" | "indoor";
  stageHost: string;
  bio: string;
  isPlaceholderBio: boolean;
  imageUrl: string | null;
  videoUrl?: string;
  note?: string; // e.g. "B2B", "F2F"
}

export interface StageInfo {
  day: 1 | 2;
  dayLabel: string;
  stage: "outdoor" | "indoor";
  host: string;
  artists: Artist[];
}

export interface BrandPartner {
  name: string;
  logoUrl: string | null;
  logoUrlAlt?: string | null;
  website?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  handle: string;
}

// ---- FESTIVAL INFO ----

export const FESTIVAL = {
  name: "ÄGAPĒ FESTIVAL",
  year: "2026",
  tagline: "September 5 + 6, 2026",
  dates: {
    day1: "Saturday, September 5, 2026",
    day2: "Sunday, September 6, 2026",
  },
  venue: {
    name: "Industry City",
    location: "Brooklyn, NYC",
    full: "Industry City, Brooklyn, NYC",
  },
  ticketUrl: "https://posh.vip/e/gap-festival-1",
  contactEmail: "bookings@agapemusic.us",
  websiteUrl: "https://agapemusic.us/",
} as const;

// ---- BRAND COPY ----

export const COPY = {
  about:
    "ÄGAPĒ started in a warehouse somewhere in Brooklyn. No grand strategy — just nights that felt memorable, music that pushed boundaries, and a room where people could lose themselves. The early shows were simple and focused. Over time, more people found their way in. The gatherings became regular. Familiar faces turned into a tangible community. Nothing happened overnight. It just built, slowly and with fierce intention.",
  aboutExtended:
    "Now we're bringing that same spirit into something new. ÄGAPĒ Festival is beyond mere scale — it's about dwelling in an environment shaped by the people who built us up. A full weekend together in a communal plane, the kind we've been building toward for half a decade. ÄGAPĒ welcomes you to the movement.",
  merchComingSoon: "Merch dropping soon. Stay tuned.",
  origin: "Brooklyn, New York",
} as const;

// ---- SOCIAL LINKS ----

export const SOCIALS: SocialLink[] = [
  {
    platform: "Instagram",
    url: "https://www.instagram.com/agape.festival/",
    handle: "@agape.festival",
  },
  {
    platform: "Instagram",
    url: "https://www.instagram.com/agape__music/",
    handle: "@agape__music",
  },
];

// ---- BRAND PARTNERS ----

export const PARTNERS: BrandPartner[] = [
  {
    name: "ÄGAPĒ",
    logoUrl: `${BASE_PATH}/assets/logos/agape_logo_white.png`,
    website: "https://agapemusic.us/",
  },
  {
    name: "44 Label Group",
    logoUrl: `${BASE_PATH}/assets/logos/44-logo-white.png`,
  },
  {
    name: "240 km/h",
    logoUrl: `${BASE_PATH}/assets/logos/240-logo-white.png`,
  },
  {
    name: "Face 2 Face",
    logoUrl: `${BASE_PATH}/assets/logos/f2f-logo-white.png`,
    logoUrlAlt: `${BASE_PATH}/assets/logos/f2f-logo-black.png`,
  },
  {
    name: "HotMeal",
    logoUrl: `${BASE_PATH}/assets/logos/hotmeal-logo-white.png`,
  },
  {
    name: "Industry City",
    logoUrl: `${BASE_PATH}/assets/logos/ic-logo-block-white.png`,
    logoUrlAlt: `${BASE_PATH}/assets/logos/ic-logo-line.png`,
  },
];

// ---- ARTISTS ----

const placeholderBio = (name: string) =>
  `${name} is a force in the global hard techno scene, known for relentless energy and commanding performances. [Placeholder — awaiting EPK]`;

export const ARTISTS: Artist[] = [
  // DAY 1 — OUTDOOR (Hot Meal)
  {
    name: "Ollie Lishman",
    day: 1,
    stage: "outdoor",
    stageHost: "Hot Meal",
    bio: "Ollie Lishman is a distinguished DJ and Producer hailing from Naarm/Melbourne Australia, whose meteoric rise in the electronic music scene is propelled by his dynamic fusion of trance, techno, and iconic grooves, captivating dance floors worldwide. Drawing inspiration from the pulsating beats of 90s techno, hard house, and trance, Ollie's productions have garnered widespread acclaim, earning him international recognition from esteemed figures such as Trym, Narciss, Marlon Hoffstadt, DJ Heartstring, among others. His tracks have become fixtures in the global arena, featured in renowned Boiler Rooms and festivals. Ollie's artistic journey is characterized by sonic innovation, seamlessly bridging the realms of hard house, techno intensity, and trance euphoria. His oeuvre stands as a testament to his meticulous craftsmanship and unwavering dedication to the electronic music landscape.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/ollie-lishman/press-kit/Hot%20Meal%20Records1126.jpg`,
    videoUrl: `${BASE_PATH}/assets/artists/ollie-lishman/press-kit/Video%203_MONDO.mp4`,
  },
  {
    name: "FUMI",
    day: 1,
    stage: "outdoor",
    stageHost: "Hot Meal",
    bio: "American-born, Berlin-based artist fumi is rapidly emerging as one of the most exciting new voices in the techno scene. Under the guise of her grandmother's name, fumi's eclectic selection and musical background bellows a playful rendition of old and new school techno, and comes together through quick, high energy mixing. As a member of 240 KM/H, fumi is not only influenced by the techno scene, but draws ideas from many other genres and bubbles, including jazz, hip hop, and RnB. With a dedication to the craft of track selection and mixing, the artist treats her setup as an instrument, composing a new sound through layering. Characterized by fast mixing and multi-deck construction, fumi's sound is one of its own.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/fumi/press-kit/retouch_fumi_07.jpg`,
    videoUrl: `${BASE_PATH}/assets/artists/fumi/press-kit/Video%2012.12.25%2C%2017%2017%2052.mp4`,
  },
  {
    name: "Mischluft",
    day: 1,
    stage: "outdoor",
    stageHost: "Hot Meal",
    bio: "Known for his deep passion for catchy and sexy vocal lines, Mischluft is a Leipzig-based DJ/Producer who has burst onto the scene with hit after hit release. He is ready to seduce any crowd with his deep knowledge of groovy, ravey, and raunchy tracks. A true master behind the decks, Mischluft's sets will romance even the most hardened techno hearts. Taking influence from the underground as well as his dad's secret Shania Twain albums \u2014 he bridged the gap between vocal-focused trance and bouncy techno grooves.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/mischluft/press-kit/Mischluft_59.jpg`,
    videoUrl: `${BASE_PATH}/assets/artists/mischluft/press-kit/mischluft-video.mp4`,
  },
  {
    name: "Bad Boombox",
    day: 1,
    stage: "outdoor",
    stageHost: "Hot Meal",
    bio: "Bad Boombox recently emerged with an irreverence and colorful vitality rarely seen in techno. Bad Boombox is a Bulgarian-American DJ who has been a recent formidable force in the techno scene. Known for his incredibly original DJ dance moves on stage, he is a juggernaut in the industry. After gaining dozens of followers on TikTok, Bad Boombox ventured into starting his own record label, fashion brand, and totally legal massage clinic. Expect Bad Boombox at a venue near you.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/bad-boombox/press-kit/_DSC8435.jpeg`,
    videoUrl: `${BASE_PATH}/assets/artists/bad-boombox/press-kit/016%20mezer.mp4`,
  },

  // DAY 1 — INDOOR (Face 2 Face)
  {
    name: "Cloudy",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: "Cloudy is quickly becoming one of the brightest rising stars in the techno scene, captivating audiences worldwide with her electrifying fusion of techno styles. Her sound is a unique mix \u2014 bouncy, groovy, yet hard-hitting and unapologetically schranzy. With each set, she brings a fresh energy that's impossible to ignore. Having already taken stages across Europe, the U.S., South America & Australia by storm, she's made waves at renowned events like Unreal, Teletech, and Blackworks, cementing her status as a force to be reckoned with. When Cloudy steps up to the decks, expect nothing short of magic \u2014 she'll set the dancefloor ablaze, blending sunshine vibes with thunderous beats that leave no one standing still.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/cloudy/press-kit/PressShotNEW.jpeg`,
    videoUrl: `${BASE_PATH}/assets/artists/cloudy/press-kit/CLOUDY2_Teletech_melbourne.mp4`,
    note: "F2F",
  },
  {
    name: "Serafina",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: "Serafina discovered her love for music early on and quickly realized its power to move people. In 2023, she began DJing in Hamburg, captivating crowds with her unique blend of Techno and her warm, open energy. She started with a heavy, Industrial sound, known for its thumping basslines, and later embraced the faster, melodic rhythms of 240 sound. Playing both styles with passion, Serafina thrives on the contrast, constantly finding new inspiration. For her, every set is about connecting with the crowd and creating unforgettable experiences.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/serafina/press-kit/f59238bc-5a52-43c2-8488-6d4049a019e1.JPG`,
    videoUrl: `${BASE_PATH}/assets/artists/serafina/press-kit/530eead9-4d30-402f-8e31-4fb0a712faf8.MP4.mp4`,
    note: "F2F",
  },
  {
    name: "Adrian Mills",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: "Born in the vibrant landscapes of Spain and later diving into the electrifying techno scene of Southern Germany, Adri\u00e1n Mills has emerged as a groundbreaking Producer/DJ. With a unique sound that marries the driving rhythms of makina, the ethereal basslines of trance, and the passionate energy of Latin influences, he's redefining the electronic music landscape. Adri\u00e1n first made his mark in the underground illegal rave scene, quickly capturing the attention of local clubs with his dynamic sets. As a resident DJ for Cologne's most sought-after collective, Adrenaline Team, and at Gotec Club in Karlsruhe, he polished his skills and earned national recognition. Driven by a desire to innovate, he launched his deeply personal project, 240 KM/H, aiming to reshape the music scene with fresh production techniques and exhilarating performances. A true pioneer, he introduced the electrifying electronic FACE 2 FACE, pushing the limits of live music and creating unforgettable experiences. With every performance, Adri\u00e1n Mills isn't just playing music \u2014 he's igniting a movement.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/adrian-mills/press-kit/Adri%C3%A1n_Mills-191.jpg`,
    videoUrl: `${BASE_PATH}/assets/artists/adrian-mills/press-kit/Video%2013.11.25%2C%2016%2011%2050.mp4`,
    note: "F2F",
  },
  {
    name: "Hector Oaks",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: "H\u00e9ctor Oaks is a multifaceted DJ known for his characteristic vinyl-only gigs and fiery unpredictability. His hypnotic ghetto-tech, acid scorchers, technopunk and gritty post-industrial tracks have ignited dancefloors from Bassiani to Miami \u2014 his \"Fuego\" detonates like a hand-grenade into the core of dancefloors awakening the spirit of raves. Born in the Spanish rave culture during the 90's and influenced by his vinyl treasures unearthed in record stores all over the world, his performances melt at the speed of light, and with assurance and nerve, a mixture of Wave, Body Music, Proto-Techno, Bacalao and Berlin's Techno.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/hector-oaks/press-kit/PRESS%20H%C3%89CTOR%208.jpg`,
    videoUrl: `${BASE_PATH}/assets/artists/hector-oaks/press-kit/H%C3%89CTOR%20OAKS%205.mp4`,
    note: "F2F",
  },
  {
    name: "Odymel",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: "Odymel is a DJ and producer based in Brussels. His mix of House, Techno, Trance, and Eurodance has made his project explode since he started in the early summer of 2023. His real passion is for melodies and rhythms that can grab and take the crowd into a wild rave experience. Understanding how to get the crowd going, Odymel's tracks aim to create an exciting atmosphere that makes people want to dance until morning. With his eclectic sets, he skillfully navigates through various genres, often surprising audiences and taking them somewhere they didn't expect.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/odymel/press-kit/Highres_Odymel_ByMayliSterkendries--7.jpg`,
    videoUrl: `${BASE_PATH}/assets/artists/odymel/press-kit/ODYMEL%20X%20BOILER%20ROOM%20(LYON)%20(Favourite%20game).mp4`,
    note: "F2F",
  },
  {
    name: "Emilija",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: "Step into EMILIJA's electrifying universe \u2014 the Lithuanian-born powerhouse is steadily making her mark across borders, blazing through with her dynamic blend of raw hard house deep cuts to sultry techno and eurodance bangers, all laced with acid basslines and playful, tongue-in-cheek vocals. An unpredictable, boundary-breaking fusion of styles with tasteful curveballs to satisfy your nighttime cravings, best served hot: high-octane and hard-hitting yet still undeniably, skilfully sizzling. Nothing but pure fire as EMILIJA takes the reins \u2014 a wild ride you won't forget.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/emilija/press-kit/EMILIJA_6.jpeg`,
    videoUrl: `${BASE_PATH}/assets/artists/emilija/press-kit/FULL%20CIRCLE_EMILIJA_by%20%40nvlsteen_5.MP4.mp4`,
    note: "F2F",
  },
  {
    name: "Fenrick",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: "Child of the 90s, Fenrick embodies an artistic synthesis influenced by a sonic diversity ranging from the UK garage scene to 90s trance, traversing through bouncy techno and hardhouse. Immersed from a young age in the vibrancy of the electro scene, Fenrick absorbed a multitude of musical influences that now resonate in his productions and performances. At just 25, he\u2019s making his mark on the techno scene, performing in Europe on major stages and around the world, most recently with his tours in Canada and Australia. Passionate producer, his tracks such as \"Push\", \"Feel The Bass\" or \"Mayday\" have been played by the big names in places like Awakenings, Verknipt and BlackWorks. Am\u00e9lie Lens, Shl\u00f8mo, 999999999, Trym, Kobosil, Regal or Sara Landry already support his talented work. Consistently delivering quality productions, Fenrick brings a diverse sonic contribution by releasing EPs and compilations for labels such as Taapion, NineTimesNine and recently on Vermillion Trax. Promising DJ, Fenrick has just started to write his story and has not finished to surprise you.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/fenrick/press-kit/FENRICK-PRESSKIT.RAPHAEL.CHENE-18%20(1).jpg`,
    videoUrl: `${BASE_PATH}/assets/artists/fenrick/press-kit/Fenrip%20back.mp4`,
    note: "F2F",
  },
  {
    name: "Supergloss",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: "Supergloss has quickly conquered the modern electronic music scene with her sincere and melodic sound. Inspired by the acid and trance of the 90s and 00s, Supergloss not only borrows key elements of the rave sound but also reinterprets them, giving them a fresh look and a modern sensibility. Her music combines sensuality and drama expressed in pads and leads with the fighting character of the 303 acid synth, which completely reflects her persona \u2014 strong, but gentle.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/supergloss/press-kit/Supergloss10%20(1).jpg`,
    videoUrl: `${BASE_PATH}/assets/artists/supergloss/press-kit/emil.hadji_raw_13.04.25_supergloss_1.mp4`,
    note: "F2F",
  },

  // DAY 2 — OUTDOOR (44)
  {
    name: "Aiden",
    day: 2,
    stage: "outdoor",
    stageHost: "44 Label Group",
    bio: "From New York to Berlin via Milan, British-American Aiden is part of a new generation of artists blurring the lines between past, present, and future. Her fierce productions blend sounds of industrial, hardcore, and schranz \u2014 the result of her exposure to the frenetic world of US dance music culture combined with the rich musical legacy of her UK roots, already earning her a seat at the table of Kobosil's mighty 44 Label Group.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/aiden/press-kit/aiden-headshot.jpeg`,
    videoUrl: `${BASE_PATH}/assets/artists/aiden/press-kit/aiden-video.mp4`,
    note: "B2B",
  },
  {
    name: "Kobosil",
    day: 2,
    stage: "outdoor",
    stageHost: "44 Label Group",
    bio: "Kobosil is a Berlin-based DJ, producer, and founder of 44 Label Group, known for blending underground energy with raw emotional depth. Born and raised in Berlin\u2019s working-class Neuk\u00f6lln district, he grew up surrounded by the city\u2019s post-reunification techno movement, which shaped his sound and artistic identity. Kobosil made his debut in 2013 with releases on Ostgut Ton, the label associated with Berghain, where he later became a resident DJ. His music combines heavy, industrial techno with melodic and emotional undertones, creating a powerful contrast that mirrors Berlin\u2019s dark yet vibrant spirit.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/kobosil/press-kit/kobosil-headshot.png`,
    videoUrl: `${BASE_PATH}/assets/artists/kobosil/press-kit/kobosil-clip.mp4`,
    note: "B2B",
  },
  {
    name: "David L\u00f6hlein",
    day: 2,
    stage: "outdoor",
    stageHost: "44 Label Group",
    bio: "David L\u00f6hlein is rewriting the rules of electronic music with his sensual dance sound - a heavy fusion of house, techno, trance and latin. Hailed for standout performances at Boiler Room: Copenhagen 2025 and H\u00d6R On Tour Stuttgart, L\u00f6hlein balances intimacy and intensity in every set. Through Snake Selection, his self-curated live stream platform, he stages unforgettable performances in striking locations like Chinatown, New York, and even a boxing ring, transforming DJ sets into art installations. His label Vision Ekstase extends this vision, merging music, visual art, and fashion into a holistic aesthetic. With past collaborations on labels like Diynamic, Boys Noize Records, and Mama Told Ya, L\u00f6hlein now looks toward 2025 with Amante \u2014 his new imprint that promises to blur the lines between sound, style, and rebellion, and set the stage for his boldest chapter yet.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/david-lohlein/press-kit/DavidL%C3%B6hlein_AMANTEERA2025%40prswrkvisuals3%20(1).jpg`,
    videoUrl: `${BASE_PATH}/assets/artists/david-lohlein/press-kit/david-lohlein-video.mp4`,
  },
  {
    name: "Future.666",
    day: 2,
    stage: "outdoor",
    stageHost: "44 Label Group",
    bio: "future.666 stands for high energy and hot vibes Techno parties, accompanied by fast-paced rhythms, flowy grooves, and long-lasting dance sessions. The Berlin based DJ pushes for the most cutting edge techno through his deep connections to the underground producer scene, as well as fostering talent with his gang and label BCCO.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/future666/press-kit/future666-headshot.jpg`,
    videoUrl: `${BASE_PATH}/assets/artists/future666/press-kit/future666-video.mp4`,
  },

  // DAY 2 — INDOOR (44)
  {
    name: "Clara Cuve",
    day: 2,
    stage: "indoor",
    stageHost: "44 Label Group",
    bio: "Clara Cuv\u00e9 does not relinquish pace nor energy. Her roots go back to classical piano in which she was trained since the age of four. Clara's deep love of music naturally lead her to begin accumulating a record collection throughout the years, which she deploys during her energetic sets ranging from fast and groovy Techno to Breakbeat, Jungle and Hardcore, always focusing on groove and dynamics. After becoming part of the Munich label Stock5 and their monthly event series at Rote Sonne, she made her way to Berlin where she became a resident at the infamous event series Mess that takes place at OHM and started touring all over the world. Since then she has been DJing at clubs and festivals across the globe with regular appearances at Awakenings, Melt!, Blackworks, EXHALE, Pollerwiesen and Teletech to name a few.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/clara-cuve/press-kit/claracuve-headshot.png`,
    videoUrl: `${BASE_PATH}/assets/artists/clara-cuve/press-kit/Clara_Closing_01.mp4`,
  },
  {
    name: "Kobosil",
    day: 2,
    stage: "indoor",
    stageHost: "44 Label Group",
    bio: "Kobosil is a Berlin-based DJ, producer, and founder of 44 Label Group, known for blending underground energy with raw emotional depth. Born and raised in Berlin\u2019s working-class Neuk\u00f6lln district, he grew up surrounded by the city\u2019s post-reunification techno movement, which shaped his sound and artistic identity. Kobosil made his debut in 2013 with releases on Ostgut Ton, the label associated with Berghain, where he later became a resident DJ. His music combines heavy, industrial techno with melodic and emotional undertones, creating a powerful contrast that mirrors Berlin\u2019s dark yet vibrant spirit.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/kobosil/press-kit/kobosil-headshot.png`,
    videoUrl: `${BASE_PATH}/assets/artists/kobosil/press-kit/kobosil-clip.mp4`,
  },
  {
    name: "Somewhen",
    day: 2,
    stage: "indoor",
    stageHost: "44 Label Group",
    bio: "Somewhen stands for Futurism and nostalgia \u2014 two traditional techno themes purposely coming together within the very name of the producer, DJ and 44 Label Group A&R. With his versatile sets and as a producer, he has shown that breaking from your own routine can be both: journey and destination at once.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/somewhen/press-kit/somewhen-headshot.JPG`,
    videoUrl: `${BASE_PATH}/assets/artists/somewhen/press-kit/somewhen-video.mp4`,
  },
  {
    name: "Ueberrest",
    day: 2,
    stage: "indoor",
    stageHost: "44 Label Group",
    bio: "UEBERREST is a rising force in European industrial hard techno, blending deep atmospheric elements with high-pressure techno energy. His music blends religious impact with tireless rhythm, thus pushing a dark but structured form of hard techno that feels and sounds grand and powerful. Unlike many artists who are purely based on distorted aggression, UEBERREST is supported by a strong conceptual identity, thus managing to weave texture, rhythm and tension together in a long-form progression. Before gaining wider acceptance in the hard techno scene, he made his name in underground places all over Germany and Central Europe. His productions are characterized by emotional depth and raw intensity, with slow-burning breaks and powerful drops that precisely land on heavy sound systems. As a performer, UEBERREST emanates a strong presence from the booth, interweaving intricate narration with very powerful energy. With increasing backing from the European warehouse circuit and smaller labels that are promoting darker techno, UEBERREST is asserting his position as one of the most original artists of the up-and-coming hard techno producer\u2019s generation.",
    isPlaceholderBio: false,
    imageUrl: `${BASE_PATH}/assets/artists/ueberrest/press-kit/ueberrest-headshot.png`,
    videoUrl: `${BASE_PATH}/assets/artists/ueberrest/press-kit/ueberrest-video.mp4`,
  },
];

// ---- HELPER: Group artists by stage ----

export function getStages(): StageInfo[] {
  return [
    {
      day: 1,
      dayLabel: "Day 1 — Saturday",
      stage: "outdoor",
      host: "Hot Meal",
      artists: ARTISTS.filter((a) => a.day === 1 && a.stage === "outdoor"),
    },
    {
      day: 1,
      dayLabel: "Day 1 — Saturday",
      stage: "indoor",
      host: "Face 2 Face",
      artists: ARTISTS.filter((a) => a.day === 1 && a.stage === "indoor"),
    },
    {
      day: 2,
      dayLabel: "Day 2 — Sunday",
      stage: "outdoor",
      host: "44 Label Group",
      artists: ARTISTS.filter((a) => a.day === 2 && a.stage === "outdoor"),
    },
    {
      day: 2,
      dayLabel: "Day 2 — Sunday",
      stage: "indoor",
      host: "44 Label Group",
      artists: ARTISTS.filter((a) => a.day === 2 && a.stage === "indoor"),
    },
  ];
}

// ---- STAGE HOST LOGOS (for navbar swap) ----

export const STAGE_LOGOS: Record<string, string> = {
  "Hot Meal": `${BASE_PATH}/assets/logos/hotmeal-logo-white.png`,
  "Face 2 Face": `${BASE_PATH}/assets/logos/f2f-logo-white.png`,
  "44 Label Group": `${BASE_PATH}/assets/logos/44-logo-white.png`,
};

// ---- PHOTOS ----

export const PHOTOS = [
  `${BASE_PATH}/assets/photos/web/1D3A9267.jpg`,
  `${BASE_PATH}/assets/photos/web/1D3A9488.jpeg`,
  `${BASE_PATH}/assets/photos/web/1D3A9620-2.jpeg`,
  `${BASE_PATH}/assets/photos/web/3BF199AD.jpg`,
  `${BASE_PATH}/assets/photos/web/AGAPE_D7.jpeg`,
  `${BASE_PATH}/assets/photos/web/AGAPE_F5.jpeg`,
  `${BASE_PATH}/assets/photos/web/DSC05585.jpeg`,
  `${BASE_PATH}/assets/photos/web/DSC05632.jpeg`,
  `${BASE_PATH}/assets/photos/AGAPE_D38.jpg`,
  `${BASE_PATH}/assets/photos/AGAPE_D14.jpg`,
  `${BASE_PATH}/assets/photos/AGAPE_F14.jpg`,
];

// ---- VIDEOS ----

export const VIDEOS = {
  davidLohlein: {
    mp4: `${BASE_PATH}/assets/videos/david_lohlein_4x5.mp4`,
    webm: `${BASE_PATH}/assets/videos/david_lohlein_4x5.webm`,
  },
  flyerAnimated: {
    mp4: `${BASE_PATH}/assets/videos/flyer-animated.mp4`,
    webm: `${BASE_PATH}/assets/videos/flyer-animated.webm`,
  },
  skullCorridor: {
    mp4: `${BASE_PATH}/assets/videos/skull-corridor.mp4`,
  },
  redStrobes: {
    mp4: `${BASE_PATH}/assets/videos/red-strobes.mp4`,
  },
};

// ---- LOGOS ----

export const LOGOS = {
  festivalBlack: `${BASE_PATH}/assets/logos/AGAPE_FESTIVAL.PNG`,
  festivalWhite: `${BASE_PATH}/assets/logos/AGAPE_FESTIVALWHITE.PNG`,
  festivalWhiteTransparent: `${BASE_PATH}/assets/logos/aFestWhite.png`,
  festivalBlackTransparent: `${BASE_PATH}/assets/logos/aFestBlack.png`,
  agapeWhite: `${BASE_PATH}/assets/logos/agape_logo_white.png`,
  agapeWhiteSm: `${BASE_PATH}/assets/logos/agape_logo_white_sm.png`,
  agapeIcon: `${BASE_PATH}/assets/logos/agape_icon.png`,
  agapeTxt: `${BASE_PATH}/assets/logos/agape_txtLogo.png`,
};
