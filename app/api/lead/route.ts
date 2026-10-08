import { sanitiseLead } from "@/lib/lead";

/**
 * Make webhook for "81 - Elecsol Electrical - Website Leads", which appends each
 * lead to the "81 - Elecsol Electrical - Website Leads" tab of the client lead list. Set
 * MAKE_WEBHOOK_URL to point a deployment somewhere else.
 */
const DEFAULT_WEBHOOK_URL = "https://hook.eu1.make.com/tds511csbujm4nrdfxvtntlgxpfidfjr";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const lead = sanitiseLead(body);
  if (!lead) return Response.json({ ok: false, error: "Missing required fields" }, { status: 400 });

  const webhookUrl = process.env.MAKE_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error(`Lead webhook responded with ${response.status}`);
      return Response.json({ ok: false }, { status: 502 });
    }
  } catch (error) {
    console.error("Lead webhook request failed", error);
    return Response.json({ ok: false }, { status: 502 });
  }

  return Response.json({ ok: true });
}
