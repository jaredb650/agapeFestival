import { sentenceCase } from "@/components/winter/nav/sections";
import { ArrowUpRight, Button } from "@/components/winter/ui";
import { LOCKERS } from "@/data/winter";
import "@/styles/sections/lockers.css";

/**
 * Lockers (rendered only when LOCKERS.enabled, page.tsx): a slim band at the foot of the FAQ, as on the
 * September site. One panel: the name, one line, the booking link. Sizes, prices and availability aren't
 * in the data, so the band names none. Server-rendered, no client JS.
 */
export function Lockers() {
  return (
    <section id="lockers" className="k-sec lk" aria-labelledby="lockers-title">
      <div className="k-wrap">
        <div className="k-panel lk-panel">
          <div className="lk-text">
            <h2 id="lockers-title" className="k-h2">
              Lockers
            </h2>
            <p className="lk-line">Book ahead on Elockers.</p>
          </div>
          <Button variant="secondary" href={LOCKERS.url} external icon={<ArrowUpRight className="w-btn__icon" />} className="lk-btn">
            {sentenceCase(LOCKERS.cta.replace(/\s*→\s*$/, ""))}
            <span className="w-sr-only"> (opens in a new tab)</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
