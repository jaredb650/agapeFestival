import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Orbitron, Outfit } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "700", "900"], display: "swap", variable: "--font-orbitron" });
const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400"], display: "swap", variable: "--font-outfit" });

export const viewport: Viewport = {
  themeColor: "#000000", width: "device-width", initialScale: 1, colorScheme: "dark",
};

const title = "ÄGAPĒ Festival — Winter Edition | Feb 19–20, 2027";
const description = "ÄGAPĒ Festival returns to New York for Winter Edition, February 19–20, 2027. Sign up for announcements and festival updates.";
export const metadata: Metadata = {
  metadataBase: new URL("https://agape-festival.com"),
  title, description,
  icons: { icon: "/assets/logos/agape_favicon.png" },
  alternates: { canonical: "/" },
  openGraph: {
    title, description, siteName: "ÄGAPĒ Festival", url: "https://agape-festival.com",
    images: [{ url: "/assets/logos/aFestWhite.png", width: 586, height: 310 }], type: "website",
  },
  twitter: { card: "summary", title, description, images: ["/assets/logos/aFestWhite.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${orbitron.variable} ${outfit.variable}`}>{children}</body></html>;
}
