import type { Metadata } from "next";
import { BASE_PATH } from "@/data/festival";
import "./globals.css";

export const metadata: Metadata = {
  title: "ÄGAPĒ FESTIVAL 2026",
  description:
    "From raw, intimate warehouse sessions to full-scale, high-energy raves. September 5+6, 2026 — Industry City, Brooklyn.",
  icons: {
    icon: `${BASE_PATH}/assets/logos/agape_favicon.png`,
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
