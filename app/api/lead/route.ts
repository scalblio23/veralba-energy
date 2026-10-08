import { buildLeadPayload, validateLeadAnswers, type LeadRequest } from "@/lib/lead";

/**
 * Webhook of the Make scenario "77 - Veralba Solar - Website Leads", which adds
 * each lead to the "77 - Veralba Solar" Google Sheet. Override with `MAKE_WEBHOOK_URL`.
 */
const DEFAULT_WEBHOOK_URL = "https://hook.eu1.make.com/evhj3jrjbnbokqn1cwd4g3gkclbv9660";

const WEBHOOK_TIMEOUT_MS = 10_000;

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Receive a completed survey from the browser, re-validate it, and forward it
 * to the Make webhook. The webhook URL stays on the server.
 */
export async function POST(request: Request) {
  let body: LeadRequest;
  try {
    body = (await request.json()) as LeadRequest;
  } catch {
    return json(400, { ok: false, error: "Invalid JSON body." });
  }

  if (!body || typeof body !== "object" || !body.answers || typeof body.answers !== "object") {
    return json(400, { ok: false, error: "Missing answers." });
  }

  if (typeof body.eventId !== "string" || !body.eventId.trim()) {
    return json(400, { ok: false, error: "Missing eventId." });
  }

  const invalid = validateLeadAnswers(body.answers);
  if (invalid) return json(422, { ok: false, error: invalid });

  const payload = buildLeadPayload(body, new Date());
  const webhookUrl = process.env.MAKE_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error(`Lead webhook responded with ${response.status}`);
      return json(502, { ok: false, error: "Lead could not be delivered." });
    }
  } catch (error) {
    console.error("Lead webhook request failed", error);
    return json(502, { ok: false, error: "Lead could not be delivered." });
  }

  return json(200, { ok: true });
}
