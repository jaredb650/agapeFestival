import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://agape-festival.com"),
  title: "ÄGAPĒ FESTIVAL 2026",
  description:
    "From raw, intimate warehouse sessions to full-scale, high-energy raves. September 5+6, 2026 — Industry City, Brooklyn.",
  icons: {
    icon: "/assets/logos/agape_favicon.png",
  },
  openGraph: {
    title: "ÄGAPĒ FESTIVAL 2026",
    description:
      "September 5+6, 2026 — Industry City, Brooklyn, NYC",
    siteName: "ÄGAPĒ FESTIVAL",
    url: "https://agape-festival.com",
    images: [{ url: "/assets/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ÄGAPĒ FESTIVAL 2026",
    description:
      "September 5+6, 2026 — Industry City, Brooklyn, NYC",
    images: ["/assets/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white">{children}</body>
    </html>
  );
}
