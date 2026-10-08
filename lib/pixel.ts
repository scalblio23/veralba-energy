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
 * Pass `eventID` to let Meta deduplicate against a server-side copy of the event.
 */
export function trackPixelEvent(
  event: PixelEvent,
  params?: Record<string, string | number>,
  options?: { eventID?: string },
): boolean {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return false;
  if (options?.eventID) window.fbq("track", event, params ?? {}, { eventID: options.eventID });
  else window.fbq("track", event, params);
  return true;
}
