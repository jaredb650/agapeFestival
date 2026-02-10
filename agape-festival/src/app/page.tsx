import Link from "next/link";

const versions = [
  {
    id: "v1",
    title: "Brutalist Raw",
    subtitle: "01",
    description:
      "Punk zine aesthetic. Hand-drawn ink, torn paper, broken grids, noise grain. The flyer brought to life as a raw, unpolished underground experience.",
    accent: "#cc0000",
    bgTexture: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
  },
  {
    id: "v2",
    title: "Chrome Cathedral",
    subtitle: "02",
    description:
      "Cold industrial steel. 3D wireframe infinity symbol, chrome reflections, metallic surfaces. The 3D flyer renders as a fully immersive WebGL world.",
    accent: "#8b8b8b",
    bgTexture: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)",
  },
  {
    id: "v3",
    title: "Typographic Editorial",
    subtitle: "03",
    description:
      "High-end music magazine. Massive typography, precise grids, registration marks, scrolling tickers. If SSENSE designed a festival page.",
    accent: "#ffffff",
    bgTexture: "none",
  },
  {
    id: "v4",
    title: "Digital Dungeon",
    subtitle: "04",
    description:
      "3AM warehouse energy. Deep red haze, scan lines, glitch effects, CRT distortion. Walking into pitch-black darkness with lasers cutting through fog.",
    accent: "#cc0000",
    bgTexture: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(204,0,0,0.03) 1px, rgba(204,0,0,0.03) 2px)",
  },
];

export default function SelectorPage() {
  return (
    <main
      className="min-h-screen bg-black text-white flex flex-col"
      style={{ fontFamily: "'Courier New', monospace" }}
    >
      {/* Header */}
      <header className="px-6 md:px-12 pt-12 pb-8 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase mb-1">
              Design Exploration
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              ÄGAPĒ FESTIVAL
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase">
              September 5+6
            </p>
            <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase">
              Industry City, BK
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-white/50 max-w-2xl">
          Four distinct visual directions for the festival website. Each version
          implements the same content — hero, about, lineup, tickets, merch,
          partners — with a radically different aesthetic. Click to explore.
        </p>
      </header>

      {/* Version Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0">
        {versions.map((v) => (
          <Link
            key={v.id}
            href={`/${v.id}`}
            className="group relative border border-white/5 p-8 md:p-12 flex flex-col justify-between min-h-[50vh] md:min-h-[45vh] transition-all duration-500 hover:bg-white/[0.02]"
            style={{ backgroundImage: v.bgTexture }}
          >
            {/* Number */}
            <div className="flex items-start justify-between">
              <span
                className="text-[80px] md:text-[120px] font-bold leading-none opacity-5 group-hover:opacity-20 transition-opacity duration-500"
                style={{ color: v.accent }}
              >
                {v.subtitle}
              </span>
              <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase mt-4">
                /{v.id}
              </span>
            </div>

            {/* Content */}
            <div>
              <h2
                className="text-xl md:text-2xl font-bold mb-3 group-hover:translate-x-2 transition-transform duration-300"
                style={{ color: v.accent === "#ffffff" ? "#fff" : v.accent }}
              >
                {v.title}
              </h2>
              <p className="text-xs md:text-sm text-white/40 leading-relaxed max-w-md group-hover:text-white/60 transition-colors duration-300">
                {v.description}
              </p>

              {/* Arrow */}
              <div className="mt-6 flex items-center gap-2 text-white/20 group-hover:text-white/60 transition-all duration-300">
                <span className="text-[10px] tracking-[0.2em] uppercase">
                  View Design
                </span>
                <span className="group-hover:translate-x-2 transition-transform duration-300">
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-6 border-t border-white/5 flex items-center justify-between text-[10px] text-white/20 tracking-[0.2em] uppercase">
        <span>ÄGAPĒ FESTIVAL 2026</span>
        <span>4 Versions • Single Page Scroll</span>
      </footer>
    </main>
  );
}
