import { WINTER, WINTER_DAYS } from "@/data/winter";
import { VENUE } from "@/components/winter/map/geo";
import { BOOT_EVENT, BOOT_SEEN_KEY } from "./boot";
import { wBoot, type BootConfig } from "./bootScript";
import { bootMarkup } from "./markup";
import { BOOT_CSS, HOLD_CSS } from "./styles";
import { BootGuard } from "./BootGuard";

/** "2027-02-19" → ["02", "19", "27"] */
const ymd = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return [m, d, y.slice(2)];
};

const CONFIG: BootConfig = {
  min: 900,
  max: 2500,
  key: BOOT_SEEN_KEY,
  ev: BOOT_EVENT,
  // Parks the hero + nav CSS intros until the handover.
  holdCss: HOLD_CSS,
  // fonts, hero poster, festival logo, window load, scroll-scrub engine
  w: [0.16, 0.3, 0.22, 0.14, 0.18],
  // Log line i has faded up (and may take its status) by 120 + i*90 + 250 ms (styles.ts .wb-log li).
  lines: [370, 460, 550, 640, 730],
  // Stow before the doors part, full exit, quick exit (styles.ts exit keyframes + a frame of slack).
  exit: [160, 780, 330],
};

/**
 * SYSTEM BOOT: the page's themed preloader. A fixed mech-HUD boot screen
 * whose markup, critical CSS and runtime are all inline in the initial HTML,
 * so it paints with the first frame (no JS, no request) while the page renders
 * and hydrates underneath at full speed. It counts real readiness (fonts, hero
 * poster + logo decoded, load, scrub engine), holds 0.9–2.5 s, then stows its
 * content and parts like hatch doors onto the hero, whose intro starts right
 * then (`w:boot-done`). Repeat visits this session get a quick shutter; reduced
 * motion gets a plain fade; without JS it fades itself out after ~4 s.
 * Decorative: aria-hidden, no focusable content; any key/click/scroll skips it.
 */
export function Preloader() {
  const [d1, d2] = WINTER_DAYS;
  const [m1, day1, yy] = ymd(d1.isoDate);
  const [m2, day2] = ymd(d2.isoDate);
  const span = m1 === m2 ? `${m1}.${day1}–${day2}.${yy}` : `${m1}.${day1}–${m2}.${day2}.${yy}`;
  const weekday = (date: string) => date.split(" ")[0];

  const lat = `${Math.abs(VENUE.lat).toFixed(4)}°${VENUE.lat >= 0 ? "N" : "S"}`;
  const lon = `${Math.abs(VENUE.lon).toFixed(4)}°${VENUE.lon >= 0 ? "E" : "W"}`;
  const markup = bootMarkup({
    log: [
      ["Init visual core", "OK"],
      ["Decode feed.01", "OK"],
      ["Mount ÄGAPĒ mark", "OK"],
      [`Sync ${span}`, "OK"],
      [`Locating ${WINTER.venue.name}`, "LOCKED"],
    ],
    data: [
      ["LAT", lat],
      ["LON", lon],
      ["SITE", `${WINTER.venue.name}, ${WINTER.venue.city}`],
      ["D1", `${weekday(d1.date)} ${m1}.${day1}.${yy}`],
      ["D2", `${weekday(d2.date)} ${m2}.${day2}.${yy}`],
    ],
    build: `WNTR.${yy}`,
    coords: `${lat}  ${lon}`,
  });
  const script = `(${wBoot.toString()})(${JSON.stringify(CONFIG).replace(/</g, "\\u003c")})`;
  const html = `<style>${BOOT_CSS}</style>${markup}<script id="wboot-js">${script}</script>`;

  return (
    <>
      {/* Opaque to React: the inline script owns (and finally removes) this subtree, before or after hydration. */}
      <div id="wboot-host" aria-hidden="true" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
      <BootGuard />
    </>
  );
}
