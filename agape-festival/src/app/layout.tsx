import type { Metadata } from "next";
import { BASE_PATH } from "@/data/festival";
import "./globals.css";

const ogImage = `${BASE_PATH}/assets/og-image.jpg`;

export const metadata: Metadata = {
  title: "ÄGAPĒ FESTIVAL 2026",
  description:
    "From raw, intimate warehouse sessions to full-scale, high-energy raves. September 5+6, 2026 — Industry City, Brooklyn.",
  icons: {
    icon: `${BASE_PATH}/assets/logos/agape_favicon.png`,
  },
  openGraph: {
    title: "ÄGAPĒ FESTIVAL 2026",
    description:
      "September 5+6, 2026 — Industry City, Brooklyn, NYC",
    siteName: "ÄGAPĒ FESTIVAL",
    images: [{ url: ogImage, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ÄGAPĒ FESTIVAL 2026",
    description:
      "September 5+6, 2026 — Industry City, Brooklyn, NYC",
    images: [ogImage],
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
