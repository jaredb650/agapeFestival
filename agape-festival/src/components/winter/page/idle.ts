/**
 * Run `cb` once the page has loaded, a grace period has passed, and the main
 * thread is idle. Used for warm-up downloads (flyer layers, background frames)
 * that must never compete with the hero. Returns a cancel function.
 */
export function afterLoadIdle(cb: () => void, graceMs = 2500): () => void {
  let timer = 0;
  let idleId = 0;
  const ric = typeof window.requestIdleCallback === "function";
  const schedule = () => {
    timer = window.setTimeout(() => {
      idleId = ric ? window.requestIdleCallback(cb, { timeout: 2000 }) : window.setTimeout(cb, 0);
    }, graceMs);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    window.removeEventListener("load", schedule);
    clearTimeout(timer);
    if (ric) window.cancelIdleCallback(idleId);
    else clearTimeout(idleId);
  };
}
