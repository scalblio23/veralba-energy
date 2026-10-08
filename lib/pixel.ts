/** Thin wrapper around the Meta Pixel (`fbq`) so components never touch the global directly. */

type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

/** Standard Meta Pixel events used on this page. */
export type PixelEvent = "Lead";

/**
 * Fire a standard Meta Pixel event. Safe to call when the pixel has not loaded
 * (ad blockers, pixel disabled, server render): it becomes a no-op.
 */
export function trackPixelEvent(event: PixelEvent, params?: Record<string, string | number>): boolean {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return false;
  window.fbq("track", event, params);
  return true;
}
