import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { POST } from "@/app/api/lead/route";
import { buildLeadPayload, readAttribution, validateLeadAnswers } from "@/lib/lead";
import type { Answers } from "@/lib/survey";

const completeAnswers: Answers = {
  postcode: "2000",
  homeowner: "Own",
  existingSolar: "Yes",
  systemAge: "More than 5 years",
  reason: "Adding A Battery",
  bill: "$600 - $900",
  homeAge: "10 - 20 Years",
  roofType: "Tile",
  shading: "Minor Shade",
  street: "1 George Street",
  suburb: "Sydney",
  addressPostcode: "2000",
  firstName: "Alex",
  lastName: "Taylor",
  email: "alex@example.com",
  mobile: "+61 412 345 678",
  otp: "123456",
};

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("lead payload", () => {
  it("flattens the active answers and normalises the mobile", () => {
    const payload = buildLeadPayload(
      { answers: completeAnswers, eventId: "evt-1", pageUrl: "https://example.com/?utm_source=fb", attribution: { utm_source: "fb" } },
      new Date("2026-10-08T00:00:00Z"),
    );
    expect(payload).toMatchObject({
      submissionId: "evt-1",
      submittedAt: "2026-10-08T00:00:00.000Z",
      existingSolar: "Yes",
      systemAge: "More than 5 years",
      reason: "Adding A Battery",
      bill: "$600 - $900",
      firstName: "Alex",
      mobile: "0412345678",
      pageUrl: "https://example.com/?utm_source=fb",
      source: "fb",
      utmSource: "fb",
      utmCampaign: "",
    });
    expect(payload).not.toHaveProperty("otp");
  });

  it("drops answers from an abandoned branch", () => {
    const payload = buildLeadPayload({ answers: { ...completeAnswers, existingSolar: "No" }, eventId: "e" }, new Date());
    expect(payload.systemAge).toBe("");
    expect(payload.reason).toBe("");
    expect(payload.source).toBe("website");
  });

  it("rejects renters and incomplete surveys", () => {
    expect(validateLeadAnswers(completeAnswers)).toBeUndefined();
    expect(validateLeadAnswers({ ...completeAnswers, homeowner: "Rent" })).toMatch(/homeowners/);
    expect(validateLeadAnswers({ ...completeAnswers, email: "nope" })).toMatch(/contact/);
  });

  it("reads UTM and fbclid parameters from the URL", () => {
    expect(readAttribution("?utm_source=fb&utm_campaign=solar&fbclid=abc&other=x")).toEqual({
      utm_source: "fb",
      utm_campaign: "solar",
      fbclid: "abc",
    });
  });
});

describe("POST /api/lead", () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("Accepted", { status: 200 }));
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("forwards a valid lead to the Make webhook", async () => {
    const response = await post({ answers: completeAnswers, eventId: "evt-1" });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe("https://hook.eu1.make.com/evhj3jrjbnbokqn1cwd4g3gkclbv9660");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toMatchObject({ submissionId: "evt-1", email: "alex@example.com" });
  });

  it("uses MAKE_WEBHOOK_URL when set", async () => {
    vi.stubEnv("MAKE_WEBHOOK_URL", "https://hook.example.com/test");
    await post({ answers: completeAnswers, eventId: "evt-1" });
    expect(fetchSpy.mock.calls[0]![0]).toBe("https://hook.example.com/test");
  });

  it("rejects malformed and incomplete requests without calling the webhook", async () => {
    expect((await post("not json")).status).toBe(400);
    expect((await post({})).status).toBe(400);
    expect((await post({ answers: completeAnswers })).status).toBe(400);
    expect((await post({ answers: { ...completeAnswers, homeowner: "Rent" }, eventId: "e" })).status).toBe(422);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns 502 when the webhook fails", async () => {
    fetchSpy.mockResolvedValue(new Response("Error", { status: 500 }));
    expect((await post({ answers: completeAnswers, eventId: "e" })).status).toBe(502);

    fetchSpy.mockRejectedValue(new Error("network down"));
    expect((await post({ answers: completeAnswers, eventId: "e" })).status).toBe(502);
  });
});
