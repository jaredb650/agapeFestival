// Meta Pixel (client: Meta ads only, Nov 3). The pixel ID is public by design; it is safe in the page.
// The Conversions API token is a SECRET: it never goes in this repo (it's public) or in any client code.
export const META_PIXEL_ID = "521142640131769";

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[][]; loaded?: boolean; version?: string; push?: unknown };

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

/** Only the real site counts (previews would pollute the ad data); `?pixel=1` turns it on anywhere for testing. */
export function pixelEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.replace(/^www\./, "");
  return host === "agape-festival.com" || new URLSearchParams(window.location.search).get("pixel") === "1";
}

/** A standard event (https://developers.facebook.com/docs/meta-pixel/reference). No-op when the pixel is off. */
export function track(event: string, params?: Record<string, unknown>) {
  window.fbq?.("track", event, params);
}

/** A custom event (shows under Custom Conversions in Events Manager). */
export function trackCustom(event: string, params?: Record<string, unknown>) {
  window.fbq?.("trackCustom", event, params);
}
