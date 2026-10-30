import { LINEUP, WINTER } from "@/data/winter";
import { BG_TIMES, FLYER } from "./media";
import { FlyerStage } from "./FlyerStage";

/** Spoken equivalent of a day's flyer line-up: names, with unannounced slots counted. */
function dayText(day: (typeof LINEUP)[number]) {
  return day.acts.map((act, i) => (
    <li key={i}>{act.kind === "artist" ? act.displayName : "To be revealed"}</li>
  ));
}

/**
 * "The flyer moment": a tall section whose sticky stage reassembles the flyer
 * over the scrubbed tower. Two invisible markers set the scroll points where
 * the flyer locks (background shows the flyer's own still) and where the stage
 * releases; ScrollBackground reads their `data-bg-at`.
 */
export function FlyerSection() {
  return (
    <section id="flyer" className="wflyer" aria-labelledby="flyer-title" data-bg-at={BG_TIMES.heroGone}>
      <span className="wflyer__marker wflyer__marker--lock" data-flyer-lock data-bg-at={BG_TIMES.flyer} aria-hidden="true" />
      <span className="wflyer__marker wflyer__marker--release" data-flyer-release data-bg-at={BG_TIMES.flyerRelease} aria-hidden="true" />
      <div className="w-sr-only">
        <h2 id="flyer-title">The flyer</h2>
        <p>
          {WINTER.name}. {WINTER.dates.display}, {WINTER.venue.name}.
        </p>
        {LINEUP.map((day) => (
          <div key={day.day}>
            <h3>
              {day.label}, {day.dateLong}
            </h3>
            <ul>{dayText(day)}</ul>
          </div>
        ))}
      </div>
      <FlyerStage layers={FLYER.layers} scrim={FLYER.scrim} space={FLYER.space} />
    </section>
  );
}
