import { GETTING_HERE } from "@/data/winter";
import { ArrowUpRight } from "./icons";
import { SectionHead } from "./SectionHead";
import { VenueMap } from "./VenueMap";

const g = GETTING_HERE;
const card = (id: "subway" | "drive" | "rideshare") => g.cards.find((c) => c.id === id);
const subway = card("subway");
const drive = card("drive");
const ride = card("rideshare");
const APPLE_MAPS = `https://maps.apple.com/?daddr=${encodeURIComponent(g.address.full)}`;
/** The flyer-era copy is in caps; read it in sentence case without changing the words. */
const sentence = (s: string) => (s === s.toUpperCase() ? s.charAt(0) + s.slice(1).toLowerCase() : s);

const ROUTES = [
  subway && { k: "Subway", title: subway.title, body: subway.body.replace(/the map link above/i, "the directions link above"), lines: subway.lines ?? [] },
  drive && { k: "Drive", title: drive.title.replace(/\bEXIT\b/, "exit"), body: drive.body, lines: [] },
  ride && { k: "Rideshare", title: sentence(ride.title), body: ride.body, lines: [] },
  { k: "Bus and Citi Bike", title: `Buses ${g.secondary.buses.join(", ")}`, body: `Citi Bike: ${g.secondary.citiBike}.`, lines: [] },
].filter(Boolean) as { k: string; title: string; body: string; lines: { line: string }[] }[];

/** Address, two directions links and a calm printed map; the routes sit underneath as four information blocks. */
export function GettingHere({ index }: { index: string }) {
  const intro = g.intro.split(/(?<=\.)\s+/).slice(0, 2).join(" ");
  return (
    <section id="getting-here" className="pp-sec" aria-labelledby="gh-title" data-reveal>
      <SectionHead index={index} id="gh-title" title="Getting here" />
      <div className="pp-grid pp-gh">
        <div className="pp-gh__info">
          <p className="pp-lead">{intro}</p>
          <address className="pp-gh__addr">
            {g.address.line1}
            <br />
            {g.address.line2}
          </address>
          <p className="pp-note">{g.entrance ? `Entrance: ${g.entrance}` : "Entrance details will be shared before the event."}</p>
          <p className="pp-gh__links">
            <a className="pp-link" href={g.mapsDirectionsUrl} target="_blank" rel="noopener noreferrer">
              Directions in Google Maps <ArrowUpRight />
            </a>
            <a className="pp-link" href={APPLE_MAPS} target="_blank" rel="noopener noreferrer">
              Apple Maps <ArrowUpRight />
            </a>
          </p>
        </div>
        <VenueMap title={g.mapTitle} />
      </div>
      <dl className="pp-routes">
        {ROUTES.map((r) => (
          <div key={r.k} className="pp-routes__item">
            <dt>{r.k}</dt>
            <dd>
              <span className="pp-routes__title">
                {r.title}
                {r.lines.length > 0 && (
                  <span className="pp-routes__lines">
                    {r.lines.map((l) => (
                      <span key={l.line} className="pp-routes__bullet" role="img" aria-label={`${l.line} train`}>
                        {l.line}
                      </span>
                    ))}
                  </span>
                )}
              </span>
              <span className="pp-routes__body">{r.body}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
