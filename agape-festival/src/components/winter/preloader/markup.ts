// Static HTML for the preloader overlay. A string, not JSX: it is injected
// through dangerouslySetInnerHTML, so the inline boot script can mutate and
// finally remove it before (or after) React hydrates, and hydration never
// inspects it.
//
// Nothing here is text or an image, so the overlay is never an LCP candidate:
//   wb-bg  the black ground (fades on exit)
//   wb-k   four faint corner ticks, where the hero frame's sit
//   wb-sl  the slit: two black shutters (the top one edged in red) over a copy
//          of the hero logo the script inserts
//   wb-ln  the red hairline, edge to edge: the progress, then the slit's lower
//          edge, then the hero's 30px divider
//   wb-ld  under the hairline: "Loading" (CSS-generated text, so not an LCP
//          candidate) with dots appearing one at a time, and the small Ä mark
//          glowing red (inline SVG, no request)
const MARK =
  `<svg viewBox="0 0 1476 2090" fill="#e52424"><path fill-rule="evenodd" d="M0 388H972L1473 849L1150 1154L1472 1463V2090H0ZM460 817V1661H1144V1152L781 817Z"/>` +
  `<circle cx="140" cy="133" r="133"/><circle cx="535" cy="133" r="133"/></svg>`;

export const BOOT_MARKUP =
  `<div id="wboot" class="wb">` +
  `<i class="wb-bg"></i>` +
  `<i class="wb-k"><i></i><i></i><i></i><i></i></i>` +
  `<i class="wb-sl"><b></b><b></b></i>` +
  `<i class="wb-ln"><i></i><i class="wb-ld"><i class="wb-tx"><b></b><b></b><b></b></i><i class="wb-mk">${MARK}</i></i></i>` +
  `</div>`;
