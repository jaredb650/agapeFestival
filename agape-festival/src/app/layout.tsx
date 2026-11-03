import type { Metadata, Viewport } from "next";
import { MetaPixel } from "@/components/winter/analytics/MetaPixel";
import "./globals.css";

// viewportFit "cover" lets env(safe-area-inset-*) report the iPhone notch/home-bar insets (the floating CTA uses them).
export const viewport: Viewport = {
  themeColor: "#000000", width: "device-width", initialScale: 1, colorScheme: "dark", viewportFit: "cover",
};

// Fonts live with the winter kit (components/winter/fonts.ts) and are applied by the pages that use them.
const title = "ÄGAPĒ Winter Festival | Feb 19–20, 2027 · Industry City, Brooklyn";
const description =
  "ÄGAPĒ Winter Festival: two days of techno at Industry City, Brooklyn, February 19–20, 2027. Ben Klock, Len Faki, Flash Gea and more. Tickets on DICE.";
const ogImage = { url: "/assets/winter/og/og-1200x630.jpg", width: 1200, height: 630, alt: "ÄGAPĒ Winter Festival, February 19–20, 2027, Industry City" };

export const metadata: Metadata = {
  metadataBase: new URL("https://agape-festival.com"),
  title, description,
  icons: { icon: "/assets/logos/agape_favicon.png" },
  alternates: { canonical: "/" },
  openGraph: {
    title, description, siteName: "ÄGAPĒ Festival", url: "https://agape-festival.com",
    images: [ogImage], type: "website",
  },
  twitter: { card: "summary_large_image", title, description, images: [ogImage.url] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <MetaPixel />
      </body>
    </html>
  );
}
