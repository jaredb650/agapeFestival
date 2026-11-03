/** Touch-primary screens (phones, tablets): their browser toolbars resize the window while scrolling. */
export const TOUCH_QUERY = "(pointer: coarse)";

/**
 * `resize`, minus the ones that cannot change this page's layout. On a touch-primary screen a
 * height-only resize is the browser's toolbar collapsing or expanding mid-scroll (iOS Safari fires
 * one per toolbar move); the page lays out in `lvh`, so nothing depends on it, and a handler that
 * measures would force a layout in the middle of the scroll. Width changes (rotation) and every
 * resize on mouse-driven screens still run `cb`. Returns the unsubscribe function.
 */
export function onLayoutResize(cb: () => void): () => void {
  const touch = window.matchMedia(TOUCH_QUERY);
  let w = window.innerWidth;
  const onResize = () => {
    const nw = window.innerWidth;
    if (touch.matches && nw === w) return;
    w = nw;
    cb();
  };
  window.addEventListener("resize", onResize, { passive: true });
  return () => window.removeEventListener("resize", onResize);
}
