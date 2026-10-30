import { Redaction, SectionHeading } from "@/components/winter/ui";
import { LINEUP, TBA_LABEL, type LineupAct } from "@/data/winter";
import { FLYER } from "./media";

// Distinct blob shapes per hidden slot so they don't look stamped.
const BLOBS: Record<string, { length: number; seed: number }> = {
  "tba-1": { length: 6.4, seed: 3 },
  "tba-2": { length: 4.6, seed: 12 },
  "tba-3": { length: 5.2, seed: 21 },
};

function Act({ act, linkToSelect }: { act: LineupAct; linkToSelect: boolean }) {
  if (act.kind === "tba") {
    const blob = BLOBS[act.id] ?? { length: 5, seed: 9 };
    return (
      <li className="wlineup__act wlineup__act--tba">
        <span className="wlineup__name">
          <Redaction length={blob.length} seed={blob.seed} label={TBA_LABEL} />
        </span>
        <span className="wlineup__tag w-hud" aria-hidden="true">To be revealed</span>
      </li>
    );
  }
  return (
    <li className="wlineup__act">
      {linkToSelect ? (
        <a className="wlineup__name wlineup__link" href="#artists" data-artist={act.slug}>
          {act.displayName}
          <svg className="wlineup__arrow" viewBox="0 0 22 10" fill="none" aria-hidden="true">
            <path d="M0 5h20M16 1l4 4-4 4" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </a>
      ) : (
        <span className="wlineup__name">{act.displayName}</span>
      )}
    </li>
  );
}

export function Lineup({ linkToSelect }: { linkToSelect: boolean }) {
  return (
    <section id="lineup" className="w-section wlineup" aria-labelledby="lineup-title" data-bg-dim="0.4">
      <div className="w-container">
        <SectionHeading title="The lineup" id="lineup-title">
          One stage each day. Set times will be announced closer to the festival.
        </SectionHeading>
        <div className="wlineup__days">
          {LINEUP.map((day) => {
            const scrawl = FLYER.dayLabels[day.day];
            return (
              <article key={day.day} className="wlineup__day" aria-labelledby={`lineup-day-${day.day}`}>
                <header className="wlineup__head">
                  <h3 id={`lineup-day-${day.day}`} className="wlineup__label">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={scrawl.src} width={scrawl.width} height={scrawl.height} alt={day.label} loading="lazy" decoding="async" />
                  </h3>
                  <p className="w-hud" data-tone="frost">
                    <time dateTime={day.isoDate}>{day.date}</time>
                  </p>
                </header>
                <ol className="wlineup__acts">
                  {day.acts.map((act) => (
                    <Act key={act.kind === "artist" ? act.slug : act.id} act={act} linkToSelect={linkToSelect} />
                  ))}
                </ol>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
