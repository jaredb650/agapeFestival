"use client";

import { useRef, type CSSProperties } from "react";
import { useBoot } from "@/components/winter/map/useBoot";
import { Button } from "@/components/winter/ui";
import { LOCKERS } from "@/data/winter";
import "@/styles/sections/lockers.css";

// Decorative locker bank: 2 rows of doors. Purely visual (no counts or availability are implied).
const DOORS = Array.from({ length: 12 }, (_, i) => i);

/** "STORAGE UNIT / LOCKER TERMINAL": a compact chrome strip. Rendered only when LOCKERS.enabled (page.tsx). */
export function Lockers() {
  const ref = useRef<HTMLElement>(null);
  // The intro is over by ~1.1 s (doors + rise); detach it after that.
  useBoot(ref, 0.5, 1400);

  return (
    <section ref={ref} id="lockers" className="wlk" aria-labelledby="lockers-title">
      <div className="wlk-unit">
        <span className="wlk-unit__rail" aria-hidden="true" />
        <div className="wlk-bank" aria-hidden="true">
          {DOORS.map((i) => (
            <span key={i} className="wlk-door" style={{ "--i": i } as CSSProperties}>
              <span className="wlk-door__face">
                <i className="wlk-door__led" />
                <i className="wlk-door__handle" />
              </span>
            </span>
          ))}
        </div>

        <div className="wlk-id">
          <span className="wlk-id__kicker" aria-hidden="true">
            <span className="wlk-id__tag">SU-01</span> Storage unit :: Locker terminal
          </span>
          <h2 id="lockers-title" className="wlk-title">
            <span className="w-sr-only">Lockers</span>
            <span aria-hidden="true" data-decode="200">
              Lockers
            </span>
          </h2>
        </div>

        <p className="wlk-lcd">
          <span className="wlk-lcd__k" aria-hidden="true">
            Status
          </span>
          <span className="wlk-lcd__v" data-decode="520" data-decode-from="--------">
            {LOCKERS.note}
          </span>
        </p>

        <Button variant="secondary" href={LOCKERS.url} external className="wlk-cta">
          {LOCKERS.cta.replace(/\s*→$/, "")}
        </Button>
      </div>
    </section>
  );
}
