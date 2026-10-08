/**
 * Lead payload sent from the completed survey to `/api/lead`, which forwards
 * it to the Make webhook. Shared by the client and the API route so both
 * agree on the shape.
 */

import {
  getActiveAnswers,
  getPath,
  hasErrors,
  normaliseMobile,
  validateStep,
  type Answers,
} from "@/lib/survey";

/** Marketing attribution captured from the landing page URL. */
export const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
] as const;

export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];
export type Attribution = Partial<Record<AttributionKey, string>>;

/** Body the browser posts to `/api/lead`. */
export interface LeadRequest {
  answers: Answers;
  /** Shared with the Meta Pixel Lead event so the two can be deduplicated. */
  eventId: string;
  pageUrl?: string;
  attribution?: Attribution;
}

/** Flat record posted to the Make webhook. */
export interface LeadPayload {
  event_id: string;
  submitted_at: string;
  postcode: string;
  homeowner: string;
  existing_solar: string;
  system_age: string;
  reason: string;
  quarterly_bill: string;
  home_age: string;
  roof_type: string;
  roof_shading: string;
  street: string;
  suburb: string;
  address_postcode: string;
  first_name: string;
  last_name: string;
  email: string;
  /** Normalised to `04XXXXXXXX`. */
  mobile: string;
  page_url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  fbclid: string;
}

export function readAttribution(search: string): Attribution {
  const params = new URLSearchParams(search);
  const attribution: Attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key);
    if (value) attribution[key] = value;
  }
  return attribution;
}

/**
 * Check that the answers describe a completed homeowner survey. Returns an
 * error message, or `undefined` when the lead can be sent.
 */
export function validateLeadAnswers(answers: Answers): string | undefined {
  const path = getPath(answers);
  if (path.includes("renter")) return "Only homeowners can be submitted.";
  for (const step of path) {
    if (step === "verify" || step === "success") continue;
    if (hasErrors(validateStep(step, answers))) return `The "${step}" step is incomplete or invalid.`;
  }
  return undefined;
}

const clean = (value: unknown, maxLength = 300) => (typeof value === "string" ? value.trim().slice(0, maxLength) : "");

export function buildLeadPayload(request: LeadRequest, submittedAt: Date): LeadPayload {
  const a = getActiveAnswers(request.answers);
  const attribution = request.attribution ?? {};
  return {
    event_id: clean(request.eventId, 100),
    submitted_at: submittedAt.toISOString(),
    postcode: clean(a.postcode),
    homeowner: clean(a.homeowner),
    existing_solar: clean(a.existingSolar),
    system_age: clean(a.systemAge),
    reason: clean(a.reason),
    quarterly_bill: clean(a.bill),
    home_age: clean(a.homeAge),
    roof_type: clean(a.roofType),
    roof_shading: clean(a.shading),
    street: clean(a.street),
    suburb: clean(a.suburb),
    address_postcode: clean(a.addressPostcode),
    first_name: clean(a.firstName),
    last_name: clean(a.lastName),
    email: clean(a.email),
    mobile: normaliseMobile(clean(a.mobile)),
    page_url: clean(request.pageUrl, 2000),
    utm_source: clean(attribution.utm_source),
    utm_medium: clean(attribution.utm_medium),
    utm_campaign: clean(attribution.utm_campaign),
    utm_content: clean(attribution.utm_content),
    utm_term: clean(attribution.utm_term),
    fbclid: clean(attribution.fbclid, 500),
  };
}
