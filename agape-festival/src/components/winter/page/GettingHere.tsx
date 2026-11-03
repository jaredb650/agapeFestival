import { Section } from "@/components/winter/classic";
import { RouteBoard, type Route } from "@/components/winter/map/RouteBoard";
import { RouteMap } from "@/components/winter/map/RouteMap";
import { sentenceCase } from "@/components/winter/nav/sections";
import { ArrowUpRight, Button } from "@/components/winter/ui";
import { GETTING_HERE } from "@/data/winter";
import "@/styles/sections/getting-here.css";

const g = GETTING_HERE;
const card = (id: string) => g.cards.find((c) => c.id === id);

/** Caps from the data in sentence case, keeping codes: "I-278 W (BQE), EXIT 23" → "I-278 W (BQE), exit 23". */
function sentence(s: string) {
  if (/[a-z]/.test(s)) return s;
  return s
    .split(" ")
    .map((w, i) => (i === 0 ? w.charAt(0) + w.slice(1).toLowerCase() : /\d|\(|^[A-Z],?$/.test(w) ? w : w.toLowerCase()))
    .join(" ");
}

const subway = card("subway");
const drive = card("drive");
const ride = card("rideshare");

const candidates: (Route | undefined)[] = [
  // The subway card points at "the map link above"; here the map links sit below the routes.
  subway && {
    mode: "subway",
    tab: sentence(subway.label),
    title: subway.title,
    body: subway.body.replace(/the map link above/i, "the map links below"),
    lines: subway.lines,
  },
  drive && { mode: "drive", tab: sentence(drive.label), title: sentence(drive.title), body: drive.body },
  ride && { mode: "ride", tab: sentence(ride.label), title: sentence(ride.title), body: ride.body },
  {
    mode: "bike",
    tab: "Bus and bike",
    title: `Buses ${g.secondary.buses.join(", ")}`,
    body: `Citi Bike: ${g.secondary.citiBike}.`,
  },
];
const ROUTES = candidates.filter((r): r is Route => r !== undefined);

const APPLE_MAPS = `https://maps.apple.com/?daddr=${encodeURIComponent(g.address.full)}`;
const MAP_LABEL =
  "Street map of Sunset Park, Brooklyn. Industry City covers the blocks between 2nd and 3rd Avenue from 33rd to 37th Street. " +
  "36th St Station is on 4th Avenue at 36th Street.";

/**
 * Getting here, as the September site had it (a map, the address, then the ways in), in the classic kit:
 * our own street map with the venue in red, in a dark panel with the address under it; beside it (stacked
 * on phones) the four ways in as hairline rows, each drawing its route on the map when picked, then the
 * directions links. Server-rendered; RouteBoard is the only client code (the picked route and a one-time
 * draw as the map scrolls into view).
 */
export function GettingHere() {
  return (
    <Section id="getting-here" title={sentenceCase(g.eyebrow)} intro={g.intro} className="gh">
      <RouteBoard
        routes={ROUTES}
        mapLabel={MAP_LABEL}
        map={<RouteMap lines={subway?.lines ?? []} />}
        place={
          <dl className="gh-place">
            <div className="gh-place__item">
              <dt className="k-label">Address</dt>
              <dd className="gh-place__v">
                <span className="gh-address">{g.address.line1}</span>
                <span className="gh-place__sub">{g.address.line2}</span>
              </dd>
            </div>
            <div className="gh-place__item">
              <dt className="k-label">Entrance</dt>
              <dd className="gh-place__v">
                <span className="gh-place__sub" data-tba={g.entrance ? undefined : ""}>
                  {g.entrance ?? "To be announced"}
                </span>
              </dd>
            </div>
          </dl>
        }
        actions={
          <div className="gh-dirs">
            <p className="k-label">Directions</p>
            <div className="gh-dirs__links">
              <Button
                href={g.mapsDirectionsUrl}
                external
                variant="secondary"
                icon={<ArrowUpRight size={16} />}
                className="gh-dir"
                aria-label="Google Maps directions (opens in a new tab)"
              >
                Google Maps
              </Button>
              <Button
                href={APPLE_MAPS}
                external
                variant="secondary"
                icon={<ArrowUpRight size={16} />}
                className="gh-dir"
                aria-label="Apple Maps directions (opens in a new tab)"
              >
                Apple Maps
              </Button>
            </div>
          </div>
        }
      />
    </Section>
  );
}
