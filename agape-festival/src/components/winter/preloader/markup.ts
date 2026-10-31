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
//   wb-ln  the red hairline: the progress, then the slit's lower edge, then the
//          hero's 30px divider
export const BOOT_MARKUP =
  `<div id="wboot" class="wb">` +
  `<i class="wb-bg"></i>` +
  `<i class="wb-k"><i></i><i></i><i></i><i></i></i>` +
  `<i class="wb-sl"><b></b><b></b></i>` +
  `<i class="wb-ln"><i></i></i>` +
  `</div>`;
