import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
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
