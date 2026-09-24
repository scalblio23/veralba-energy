/**
 * Lead submission. A completed survey is posted to our own `/api/lead` route,
 * which forwards it to the Make webhook that writes the "77 - Veralba Solar"
 * tab of the client lead list.
 */

import { formatMobile, getActiveAnswers, type AnswerKey, type Answers } from "@/lib/survey";

export const LEAD_ENDPOINT = "/api/lead";
export const LEAD_SOURCE = "veralba-solar-landing-page";

/** Survey answers sent with every lead, in the order they appear in the sheet. */
export const LEAD_ANSWER_KEYS = [
  "postcode",
  "homeowner",
  "existingSolar",
  "systemAge",
  "reason",
  "bill",
  "homeAge",
  "roofType",
  "shading",
  "street",
  "suburb",
  "addressPostcode",
  "firstName",
  "lastName",
  "email",
  "mobile",
] as const satisfies readonly AnswerKey[];

export const LEAD_META_KEYS = ["submissionId", "submittedAt", "pageUrl", "source"] as const;

export type LeadKey = (typeof LEAD_ANSWER_KEYS)[number] | (typeof LEAD_META_KEYS)[number];

export type LeadPayload = Record<LeadKey, string>;

interface LeadMeta {
  submissionId: string;
  submittedAt: string;
  pageUrl: string;
}

/**
 * Build the webhook payload from the survey answers. Only answers on the
 * active path are included (abandoned branches are sent as empty strings) and
 * nothing outside the known lead fields is sent.
 */
export function buildLeadPayload(answers: Answers, meta: LeadMeta): LeadPayload {
  const active = getActiveAnswers(answers);
  const payload = { ...meta, source: LEAD_SOURCE } as LeadPayload;
  for (const key of LEAD_ANSWER_KEYS) {
    payload[key] = (active[key] ?? "").trim();
  }
  payload.email = payload.email.toLowerCase();
  payload.mobile = formatMobile(payload.mobile);
  return payload;
}

const LEAD_KEYS: readonly LeadKey[] = [...LEAD_ANSWER_KEYS, ...LEAD_META_KEYS];
const REQUIRED_KEYS: readonly LeadKey[] = ["submissionId", "firstName", "email", "mobile"];
const MAX_LENGTH = 300;
const MAX_URL_LENGTH = 2000;

/** Keep only known string fields, trimmed and length-capped. Returns null if a required field is missing. */
export function sanitiseLead(body: unknown): LeadPayload | null {
  if (!body || typeof body !== "object") return null;
  const input = body as Record<string, unknown>;

  const lead = {} as LeadPayload;
  for (const key of LEAD_KEYS) {
    const value = input[key];
    const limit = key === "pageUrl" ? MAX_URL_LENGTH : MAX_LENGTH;
    lead[key] = typeof value === "string" ? value.trim().slice(0, limit) : "";
  }
  return REQUIRED_KEYS.every((key) => lead[key]) ? lead : null;
}

function createSubmissionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Send a completed survey. Never throws: a failed submission must not break
 * the success screen, so it resolves to `false` instead.
 */
export async function submitLead(answers: Answers): Promise<boolean> {
  const payload = buildLeadPayload(answers, {
    submissionId: createSubmissionId(),
    submittedAt: new Date().toISOString(),
    pageUrl: typeof window === "undefined" ? "" : window.location.href,
  });

  try {
    const response = await fetch(LEAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    return response.ok;
  } catch {
    return false;
  }
}
