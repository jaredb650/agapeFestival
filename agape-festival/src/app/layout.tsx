import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://agape-festival.com"),
  title: "ÄGAPĒ Festival 2026 | Brooklyn Techno — Sept 5-6",
  description:
    "ÄGAPĒ Festival returns Sept 5-6, 2026 at Industry City, Brooklyn. 19 artists across multiple stages featuring Kobosil, David Löhlein, Cloudy, and more. Get tickets now.",
  icons: {
    icon: "/assets/logos/agape_favicon.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ÄGAPĒ Festival 2026 | Brooklyn Techno — Sept 5-6",
    description:
      "Two-day techno festival at Industry City, Brooklyn — Sept 5-6, 2026. 19 artists across multiple stages featuring Kobosil, David Löhlein, Cloudy, and more.",
    siteName: "ÄGAPĒ Festival",
    url: "https://agape-festival.com",
    images: [{ url: "/assets/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ÄGAPĒ Festival 2026 | Brooklyn Techno — Sept 5-6",
    description:
      "Two-day techno festival at Industry City, Brooklyn — Sept 5-6, 2026. 19 artists across multiple stages featuring Kobosil, David Löhlein, Cloudy, and more.",
    images: ["/assets/og-image.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  name: "ÄGAPĒ Festival 2026",
  description:
    "Two-day techno festival at Industry City, Brooklyn featuring 19 artists across multiple indoor and outdoor stages. From raw warehouse sessions to full-scale raves.",
  startDate: "2026-09-05T12:00:00-04:00",
  endDate: "2026-09-07T06:00:00-04:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: "Industry City",
    address: {
      "@type": "PostalAddress",
      streetAddress: "571 2nd Avenue",
      addressLocality: "Brooklyn",
      addressRegion: "NY",
      postalCode: "11232",
      addressCountry: "US",
    },
  },
  image: "https://agape-festival.com/assets/og-image.jpg",
  organizer: {
    "@type": "Organization",
    name: "ÄGAPĒ",
    url: "https://agapemusic.us/",
  },
  performer: [
    { "@type": "MusicGroup", name: "Ollie Lishman" },
    { "@type": "MusicGroup", name: "FUMI" },
    { "@type": "MusicGroup", name: "Mischluft" },
    { "@type": "MusicGroup", name: "Bad Boombox" },
    { "@type": "MusicGroup", name: "Cloudy" },
    { "@type": "MusicGroup", name: "Serafina" },
    { "@type": "MusicGroup", name: "Adrian Mills" },
    { "@type": "MusicGroup", name: "TBA" },
    { "@type": "MusicGroup", name: "Emilija" },
    { "@type": "MusicGroup", name: "Fenrick" },
    { "@type": "MusicGroup", name: "Supergloss" },
    { "@type": "MusicGroup", name: "Aiden" },
    { "@type": "Person", name: "Kobosil" },
    { "@type": "Person", name: "David Löhlein" },
    { "@type": "MusicGroup", name: "Future.666" },
    { "@type": "Person", name: "Clara Cuvé" },
    { "@type": "Person", name: "Somewhen" },
    { "@type": "MusicGroup", name: "Ueberrest" },
    { "@type": "Person", name: "O.B.I." },
    { "@type": "Person", name: "TRIPTYKH" },
  ],
  offers: {
    "@type": "Offer",
    url: "https://posh.vip/e/gap-festival-1",
    availability: "https://schema.org/InStock",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload hero LCP assets so they start downloading before JS hydrates.
            flyer-animated.mp4 is the hero video; aFestWhite is the main logo. */}
        <link
          rel="preload"
          as="video"
          href="/assets/videos/flyer-animated.mp4"
          type="video/mp4"
        />
        <link
          rel="preload"
          as="image"
          href="/assets/logos/aFestWhite.png"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/assets/videos/posters/flyer-animated.webp"
          type="image/webp"
        />
      </head>
      <body className="antialiased bg-black text-white">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
