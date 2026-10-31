import { Cell, LinkCell, SectionGrid, SectionHeader } from "@/components/winter/grid";
import { RouteBoard, type Route } from "@/components/winter/map/RouteBoard";
import { RouteMap } from "@/components/winter/map/RouteMap";
import { sentenceCase } from "@/components/winter/nav/sections";
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
  // The subway card points at "the map link above"; here the map links sit below the instructions.
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

/** "Industry City sits in Sunset Park, Brooklyn. Easy by …" → its first sentence. */
const firstSentence = (s: string) => s.split(/(?<=\.)\s/)[0];

/**
 * Getting here: the address, our own street map with the venue in red, the four ways in as tabs (each
 * draws its route on the map) and the directions links. The section is server-rendered; RouteBoard is the
 * only client code (the selected tab and a one-time draw as the map scrolls into view).
 */
export function GettingHere() {
  return (
    <SectionGrid id="getting-here" labelledBy="getting-here-title" className="gh">
      <SectionHeader id="getting-here-title" title={sentenceCase(g.eyebrow)} aside={firstSentence(g.intro)} />
      <RouteBoard
        routes={ROUTES}
        mapLabel={MAP_LABEL}
        map={<RouteMap lines={subway?.lines ?? []} />}
        info={
          <>
            <Cell as="dl" className="gh-address">
              <dt className="gh-key">Address</dt>
              <dd className="gh-address__v">
                <span className="w-title">{g.address.line1}</span>
                <span className="w-body">{g.address.line2}</span>
              </dd>
            </Cell>
            <Cell as="dl" className="gh-entrance">
              <dt className="gh-key">Entrance</dt>
              <dd className="gh-entrance__v" data-tba={g.entrance ? undefined : ""}>
                {g.entrance ?? "To be announced"}
              </dd>
            </Cell>
          </>
        }
        actions={
          <>
            <LinkCell href={g.mapsDirectionsUrl} external fx="wipe" label="Directions" span={6} spanSm={2} h={2} className="gh-dir gh-dir--a">
              Google Maps
            </LinkCell>
            <LinkCell href={APPLE_MAPS} external fx="wipe" label="Directions" span={6} spanSm={2} h={2} className="gh-dir gh-dir--b">
              Apple Maps
            </LinkCell>
          </>
        }
      />
    </SectionGrid>
  );
}
