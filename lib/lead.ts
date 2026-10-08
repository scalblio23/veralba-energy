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

/**
 * Flat record posted to the Make webhook. Field names match the webhook
 * structure of the "81 - Elecsol Electrical - Website Leads" scenario, which
 * drops any request without a `submissionId`.
 */
export interface LeadPayload {
  /** Unique per lead; Make uses it to skip duplicate rows. Same as the Pixel eventID. */
  submissionId: string;
  submittedAt: string;
  postcode: string;
  homeowner: string;
  existingSolar: string;
  systemAge: string;
  reason: string;
  bill: string;
  homeAge: string;
  roofType: string;
  shading: string;
  street: string;
  suburb: string;
  addressPostcode: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Normalised to `04XXXXXXXX`. */
  mobile: string;
  pageUrl: string;
  /** `utm_source` when present, otherwise `website`. */
  source: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
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
    submissionId: clean(request.eventId, 100),
    submittedAt: submittedAt.toISOString(),
    postcode: clean(a.postcode),
    homeowner: clean(a.homeowner),
    existingSolar: clean(a.existingSolar),
    systemAge: clean(a.systemAge),
    reason: clean(a.reason),
    bill: clean(a.bill),
    homeAge: clean(a.homeAge),
    roofType: clean(a.roofType),
    shading: clean(a.shading),
    street: clean(a.street),
    suburb: clean(a.suburb),
    addressPostcode: clean(a.addressPostcode),
    firstName: clean(a.firstName),
    lastName: clean(a.lastName),
    email: clean(a.email),
    mobile: normaliseMobile(clean(a.mobile)),
    pageUrl: clean(request.pageUrl, 2000),
    source: clean(attribution.utm_source) || "website",
    utmSource: clean(attribution.utm_source),
    utmMedium: clean(attribution.utm_medium),
    utmCampaign: clean(attribution.utm_campaign),
    utmContent: clean(attribution.utm_content),
    utmTerm: clean(attribution.utm_term),
    fbclid: clean(attribution.fbclid, 500),
  };
}
