import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://agape-festival.com"),
  title: "ÄGAPĒ Festival 2026 | Brooklyn Techno — Sept 5-6",
  description:
    "ÄGAPĒ Festival returns Sept 5-6, 2026 at Industry City, Brooklyn. 20 artists across multiple stages featuring Kobosil, Hector Oaks, David Löhlein, Cloudy, and more. Get tickets now.",
  icons: {
    icon: "/assets/logos/agape_favicon.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ÄGAPĒ Festival 2026 | Brooklyn Techno — Sept 5-6",
    description:
      "Two-day techno festival at Industry City, Brooklyn — Sept 5-6, 2026. 20 artists across multiple stages featuring Kobosil, Hector Oaks, David Löhlein, Cloudy, and more.",
    siteName: "ÄGAPĒ Festival",
    url: "https://agape-festival.com",
    images: [{ url: "/assets/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ÄGAPĒ Festival 2026 | Brooklyn Techno — Sept 5-6",
    description:
      "Two-day techno festival at Industry City, Brooklyn — Sept 5-6, 2026. 20 artists across multiple stages featuring Kobosil, Hector Oaks, David Löhlein, Cloudy, and more.",
    images: ["/assets/og-image.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  name: "ÄGAPĒ Festival 2026",
  description:
    "Two-day techno festival at Industry City, Brooklyn featuring 20 artists across multiple indoor and outdoor stages. From raw warehouse sessions to full-scale raves.",
  startDate: "2026-09-05T12:00:00-04:00",
  endDate: "2026-09-07T06:00:00-04:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: "Industry City",
    address: {
      "@type": "PostalAddress",
      streetAddress: "220 36th Street",
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
    { "@type": "Person", name: "Hector Oaks" },
    { "@type": "MusicGroup", name: "Odymel" },
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
