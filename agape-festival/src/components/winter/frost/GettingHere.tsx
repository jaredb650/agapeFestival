import { GETTING_HERE } from "@/data/winter";
import { Icon } from "./Icon";
import { SectionHead } from "./SectionHead";
import { VenueMap } from "./VenueMap";

const g = GETTING_HERE;
const APPLE_MAPS = `https://maps.apple.com/?daddr=${encodeURIComponent(g.address.full)}`;
const card = (id: "subway" | "drive" | "rideshare") => g.cards.find((c) => c.id === id);
const subway = card("subway");
const drive = card("drive");
const ride = card("rideshare");

/** The data's all-caps card titles, in sentence case. */
const TITLES: Record<string, string> = { "I-278 W (BQE), EXIT 23": "I-278 W (BQE), exit 23", "DROP-OFF": "Drop-off" };
const tidy = (s: string) => TITLES[s] ?? s;

const ROUTES = [
  subway && {
    k: "Subway",
    title: subway.title,
    lines: subway.lines?.map((l) => l.line) ?? [],
    body: subway.body.replace(/Use the map link above/i, "Use the directions link"),
  },
  drive && { k: "Drive", title: tidy(drive.title), lines: [], body: drive.body },
  ride && { k: "Rideshare", title: tidy(ride.title), lines: [], body: ride.body },
  { k: "Bus and Citi Bike", title: `Buses ${g.secondary.buses.join(", ")}`, lines: [], body: `Citi Bike: ${g.secondary.citiBike}.` },
].filter(Boolean) as { k: string; title: string; lines: string[]; body: string }[];

/** A quiet map and an address block, then the routes as a plain list. */
export function GettingHere() {
  return (
    <section id="getting-here" className="fr-section" aria-labelledby="gh-title" data-reveal="">
      <div className="fr-wrap fr-split">
        <div>
          <SectionHead id="gh-title" title="Getting here">
            <p>Industry City sits in Sunset Park, Brooklyn. Easy by subway, car or rideshare.</p>
          </SectionHead>
          <address className="fr-address">
            <span className="fr-address__l1">{g.address.line1}</span>
            <span>{g.address.line2}</span>
            <span className="fr-note">{g.entrance ?? "Entrance details will be shared before the event."}</span>
          </address>
          <p className="fr-directions">
            <a className="fr-link" href={g.mapsDirectionsUrl} target="_blank" rel="noopener noreferrer">
              Directions in Google Maps
              <Icon name="arrow-up-right" size={14} />
            </a>
            <a className="fr-link" href={APPLE_MAPS} target="_blank" rel="noopener noreferrer">
              Apple Maps
              <Icon name="arrow-up-right" size={14} />
            </a>
          </p>
        </div>
        <div className="fr-gh">
          <figure className="fr-gh__map">
            <VenueMap title={`Map of Sunset Park, Brooklyn, with ${g.mapTitle} marked in red`} />
            <figcaption className="fr-caption">Industry City and the 36 St subway station, Sunset Park</figcaption>
          </figure>
          <dl className="fr-routes">
            {ROUTES.map((r) => (
              <div key={r.k} className="fr-route">
                <dt>{r.k}</dt>
                <dd>
                  <span className="fr-route__title">
                    {r.title}
                    {r.lines.length > 0 && (
                      <span className="fr-route__lines" aria-label={`${r.lines.join(", ")} trains`}>
                        {r.lines.map((l) => (
                          <span key={l} className="fr-route__line" aria-hidden="true">
                            {l}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                  <span className="fr-route__body">{r.body}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
