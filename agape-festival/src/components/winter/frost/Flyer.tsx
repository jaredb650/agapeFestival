import { LINEUP, WINTER } from "@/data/winter";
import { FlyerStage } from "@/components/winter/page/FlyerStage";
import { FLYER } from "@/components/winter/page/media";
import manifest from "../../../../public/assets/winter/manifest.json";

const still = manifest.flyer.backgroundStill;

/**
 * The flyer moment, unchanged: FlyerStage reassembles the v3 poster's layers
 * as you scroll (the two markers set where it locks and releases). Only the
 * surroundings are Frost's: the poster's own photograph sits behind the stage
 * in the flyer's 9:16 box (so at the lock the screen reads as the poster),
 * in black and white with its edges fading into the black page.
 */
export function Flyer() {
  return (
    <section id="flyer" className="wflyer fr-flyer" aria-labelledby="flyer-title">
      <span className="wflyer__marker wflyer__marker--lock" data-flyer-lock aria-hidden="true" />
      <span className="wflyer__marker wflyer__marker--release" data-flyer-release aria-hidden="true" />
      <div className="fr-sr">
        <h2 id="flyer-title">The flyer</h2>
        <p>
          {WINTER.name}. {WINTER.dates.display}, {WINTER.venue.name}.
        </p>
        {LINEUP.map((day) => (
          <div key={day.day}>
            <h3>
              {day.label}, {day.dateLong}
            </h3>
            <ul>
              {day.acts.map((act, i) => (
                <li key={i}>{act.kind === "artist" ? act.displayName : "To be revealed"}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="fr-flyer__track" aria-hidden="true">
        <div className="fr-flyer__backdrop">
          <div className="fr-flyer__box">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={still.src} width={still.width} height={still.height} alt="" loading="lazy" decoding="async" />
          </div>
        </div>
      </div>
      <FlyerStage layers={FLYER.layers} scrim={FLYER.scrim} space={FLYER.space} />
    </section>
  );
}
