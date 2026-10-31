// Client-side contract between the preloader (an inline script in the initial
// HTML, see bootScript.ts) and the page. Import from client components only.

/** Fired on window when the preloader hands over and the page's own intro should start. */
export const BOOT_EVENT = "w:boot-done";


export interface BootState {
  /** True once the handover has started (the page intro may play). */
  done: boolean;
  /** performance.now() at that moment. */
  at: number;
  /**
   * True when the preloader opened onto the hero logo in place: its slit revealed a copy of the hero's own
   * logo image exactly over it. The logo has had its entrance, so at the handover the preloader skips any
   * finite CSS/WAAPI animation on the logo's own (text-free) wrappers to its end state, and the copy then
   * dissolves into it. A hero that wants a JS-timed logo effect should check this flag and skip it too.
   */
  logo: boolean;
}

declare global {
  interface Window {
    /** Set by the preloader's inline script; absent when there is no preloader (e.g. client-side navigation). */
    __wboot?: BootState;
  }
}

/**
 * Run `cb` when the preloader hands over to the page (immediately if it
 * already has, or if there is none). `at` is the handover's performance.now()
 * timestamp, or null when no preloader ran (keep the old, mount-relative
 * timing then). A fallback timer fires `cb` anyway if the event never comes.
 * Returns a cancel function.
 */
export function onBootDone(cb: (at: number | null) => void, fallbackMs = 4000): () => void {
  const s = window.__wboot;
  if (!s) {
    cb(null);
    return () => {};
  }
  if (s.done) {
    cb(s.at);
    return () => {};
  }
  let off = false;
  const stop = () => {
    off = true;
    window.removeEventListener(BOOT_EVENT, fire);
    clearTimeout(timer);
  };
  const fire = () => {
    if (off) return;
    stop();
    cb(s.done ? s.at : performance.now());
  };
  window.addEventListener(BOOT_EVENT, fire);
  const timer = window.setTimeout(fire, fallbackMs);
  return stop;
}
