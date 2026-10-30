import type { NextConfig } from "next";

// Cloudflare Pages branch previews get the artist select automatically.
// GitHub Pages (the live site) never sets CF_PAGES, so it stays off there.
const isCfBranchPreview =
  process.env.CF_PAGES === "1" && process.env.CF_PAGES_BRANCH !== "main";

const nextConfig: NextConfig = {
  output: "export",
  env: {
    NEXT_PUBLIC_SHOW_ARTIST_SELECT:
      process.env.NEXT_PUBLIC_SHOW_ARTIST_SELECT ?? (isCfBranchPreview ? "1" : "0"),
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  experimental: {
    // Inline the (small) CSS into each page instead of three render-blocking
    // requests; worth ~0.5–0.8 s of simulated mobile LCP.
    inlineCss: true,
  },
};

export default nextConfig;
