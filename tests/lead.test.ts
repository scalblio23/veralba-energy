import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/lead/route";
import { buildLeadPayload, sanitiseLead } from "@/lib/lead";
import type { Answers } from "@/lib/survey";

const meta = { submissionId: "abc-123", submittedAt: "2026-09-24T00:00:00.000Z", pageUrl: "https://example.com/" };

const answers: Answers = {
  postcode: "4000",
  homeowner: "Own",
  existingSolar: "No",
  // Abandoned branch answers must not be sent.
  systemAge: "More than 5 years",
  reason: "Adding A Battery",
  bill: "$300 - $600",
  homeAge: "20 + Years",
  roofType: "Tin",
  shading: "No Issues",
  street: " 1 Queen Street ",
  suburb: "Brisbane",
  addressPostcode: "4000",
  firstName: "Sam",
  lastName: "Lee",
  email: "Sam@Example.com",
  mobile: "+61412345678",
  otp: "123456",
};

describe("buildLeadPayload", () => {
  it("sends active-path answers, normalised, without the OTP", () => {
    const payload = buildLeadPayload(answers, meta);
    expect(payload).toMatchObject({
      ...meta,
      source: "veralba-solar-landing-page",
      systemAge: "",
      reason: "",
      street: "1 Queen Street",
      email: "sam@example.com",
      mobile: "0412 345 678",
    });
    expect(payload).not.toHaveProperty("otp");
  });
});

describe("sanitiseLead", () => {
  it("drops unknown keys and non-string values", () => {
    const lead = sanitiseLead({ ...buildLeadPayload(answers, meta), otp: "123456", bill: 5 });
    expect(lead).not.toBeNull();
    expect(lead).not.toHaveProperty("otp");
    expect(lead?.bill).toBe("");
  });

  it("rejects leads missing required fields", () => {
    expect(sanitiseLead(null)).toBeNull();
    expect(sanitiseLead({ ...buildLeadPayload(answers, meta), email: "" })).toBeNull();
  });
});

describe("POST /api/lead", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const request = (body: unknown) =>
    new Request("http://localhost/api/lead", { method: "POST", body: JSON.stringify(body) });

  it("forwards a valid lead to the Make webhook", async () => {
    vi.stubEnv("MAKE_WEBHOOK_URL", "https://hook.example.com/test");
    const fetchMock = vi.fn().mockResolvedValue(new Response("Accepted", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request(buildLeadPayload(answers, meta)));
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://hook.example.com/test");
    expect(JSON.parse(init.body as string)).toMatchObject({ submissionId: "abc-123", email: "sam@example.com" });
  });

  it("returns 400 for an invalid lead without calling the webhook", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request({ firstName: "Sam" }));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 502 when the webhook fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Error", { status: 500 })));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await POST(request(buildLeadPayload(answers, meta)));
    expect(response.status).toBe(502);
  });
});
