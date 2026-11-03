import { BOOT_EVENT } from "./boot";
import { wBoot, type BootConfig } from "./bootScript";
import { BOOT_MARKUP } from "./markup";
import { BOOT_CSS, HOLD_CSS } from "./styles";
import { BootGuard } from "./BootGuard";

const CONFIG: BootConfig = {
  min: 900,
  max: 2500,
  ev: BOOT_EVENT,
  // Parks the hero + nav CSS intros until the handover.
  hold: HOLD_CSS,
  // fonts, hero poster, hero logo, window load, scroll background
  w: [0.16, 0.3, 0.22, 0.14, 0.18],
  // Handover 300 ms into the full exit (as the black starts to lift), its motion 850 ms (styles.ts), the quick
  // fade 330 ms, and at most 1.2 s more for the hero's own logo/divider entrance before the copy dissolves.
  x: [300, 850, 330, 1200],
};

/**
 * The page's preloader, in the classic look: black, one red hairline across the
 * hero logo's centre line that fills with real readiness (fonts, hero poster +
 * logo decoded, load, scroll background), and a small Orbitron caps "Loading"
 * under it, held 0.9–2.5 s. It then opens as a slit onto the logo,
 * falls into the hero's red divider and the black lifts: the logo and divider
 * are already where the hero has them, and the hero's intro starts right then
 * (`w:boot-done`). Markup, critical CSS and runtime are all inline in the
 * initial HTML, so it paints with the first frame (no request) while the page
 * renders and hydrates underneath. A back/forward return and any
 * key/click/scroll get a quick fade; reduced motion a plain fade; without JS it
 * fades itself out after ~4 s. Decorative: aria-hidden, nothing focusable.
 */
export function Preloader() {
  const script = `(${wBoot.toString()})(${JSON.stringify(CONFIG).replace(/</g, "\\u003c")})`;
  const html = `<style>${BOOT_CSS}</style>${BOOT_MARKUP}<script id="wboot-js">${script}</script>`;

  return (
    <>
      {/* Opaque to React: the inline script owns (and finally removes) this subtree, before or after hydration. */}
      <div id="wboot-host" aria-hidden="true" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
      <BootGuard />
    </>
  );
}
