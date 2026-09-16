import { describe, expect, it } from "vitest";
import {
  DEMO_OTP,
  formatMobile,
  getActiveAnswers,
  getNextStep,
  getPath,
  getPreviousStep,
  getProgress,
  isValidAustralianMobile,
  normaliseMobile,
  validateField,
  validateStep,
  type Answers,
} from "@/lib/survey";

const noSolarPath = [
  "postcode",
  "homeowner",
  "existingSolar",
  "bill",
  "homeAge",
  "roofType",
  "shading",
  "address",
  "name",
  "contact",
  "verify",
  "success",
];

describe("survey branching", () => {
  it("routes renters to the terminal ineligible screen", () => {
    expect(getNextStep("homeowner", { homeowner: "Rent" })).toBe("renter");
    expect(getPath({ homeowner: "Rent" })).toEqual(["postcode", "homeowner", "renter"]);
    expect(getNextStep("renter", { homeowner: "Rent" })).toBeNull();
  });

  it("routes owners to the existing solar question", () => {
    expect(getNextStep("homeowner", { homeowner: "Own" })).toBe("existingSolar");
  });

  it.each(["No", "Solar Hot Water"])("skips the existing system questions for %s", (existingSolar) => {
    expect(getPath({ homeowner: "Own", existingSolar })).toEqual(noSolarPath);
  });

  it("asks system age and reason when the home already has solar", () => {
    expect(getPath({ homeowner: "Own", existingSolar: "Yes" })).toEqual([
      "postcode",
      "homeowner",
      "existingSolar",
      "systemAge",
      "reason",
      ...noSolarPath.slice(3),
    ]);
  });

  it("derives Previous from the active path", () => {
    expect(getPreviousStep("postcode", {})).toBeNull();
    expect(getPreviousStep("renter", { homeowner: "Rent" })).toBe("homeowner");
    expect(getPreviousStep("bill", { homeowner: "Own", existingSolar: "Yes" })).toBe("reason");
    expect(getPreviousStep("bill", { homeowner: "Own", existingSolar: "No" })).toBe("existingSolar");
    expect(getPreviousStep("success", { homeowner: "Own" })).toBe("verify");
  });

  it("drops answers from abandoned branches", () => {
    const answers: Answers = {
      postcode: "2000",
      homeowner: "Own",
      existingSolar: "No",
      systemAge: "More than 5 years",
      reason: "Adding A Battery",
      bill: "$600 - $900",
    };
    expect(getActiveAnswers(answers)).toEqual({
      postcode: "2000",
      homeowner: "Own",
      existingSolar: "No",
      bill: "$600 - $900",
    });
  });
});

describe("progress", () => {
  it("starts at zero and counts questions on the default path", () => {
    expect(getProgress("postcode", {})).toEqual({ current: 1, total: 11, percent: 0 });
  });

  it("grows the total when the existing solar branch is chosen", () => {
    const answers: Answers = { homeowner: "Own", existingSolar: "Yes" };
    expect(getProgress("systemAge", answers)).toEqual({ current: 4, total: 13, percent: 23 });
    expect(getProgress("verify", answers)).toEqual({ current: 13, total: 13, percent: 92 });
  });

  it("is monotonic along every path and completes on terminal screens", () => {
    for (const answers of [
      { homeowner: "Own", existingSolar: "No" },
      { homeowner: "Own", existingSolar: "Yes" },
      { homeowner: "Rent" },
    ] satisfies Answers[]) {
      const percents = getPath(answers).map((step) => getProgress(step, answers).percent);
      expect(percents).toEqual([...percents].sort((a, b) => a - b));
      expect(percents.at(-1)).toBe(100);
    }
  });
});

describe("validation", () => {
  it("requires a four digit postcode", () => {
    expect(validateField("postcode", "")).toMatch(/enter your postcode/i);
    expect(validateField("postcode", "200")).toMatch(/4-digit/);
    expect(validateField("postcode", "20001")).toMatch(/4-digit/);
    expect(validateField("postcode", "abcd")).toMatch(/4-digit/);
    expect(validateField("postcode", "0800")).toBeUndefined();
  });

  it("requires a selection for choice steps", () => {
    expect(validateStep("homeowner", {})).toEqual({ homeowner: "Please select an option to continue." });
    expect(validateStep("homeowner", { homeowner: "Own" })).toEqual({});
  });

  it("validates every field in grouped steps", () => {
    expect(Object.keys(validateStep("address", {}))).toEqual(["street", "suburb", "addressPostcode"]);
    expect(validateStep("address", { street: "1 George St", suburb: "Sydney", addressPostcode: "2000" })).toEqual({});
    expect(Object.keys(validateStep("name", { firstName: "  " }))).toEqual(["firstName", "lastName"]);
    expect(validateStep("name", { firstName: "Zoë", lastName: "O'Neil-Smith" })).toEqual({});
    expect(validateField("firstName", "J0hn")).toMatch(/valid first name/);
  });

  it("validates email addresses", () => {
    expect(validateField("email", "")).toMatch(/enter your email/i);
    for (const bad of ["name", "name@", "name@domain", "name @domain.com", "name@domain.c"]) {
      expect(validateField("email", bad)).toMatch(/valid email/);
    }
    expect(validateField("email", "first.last+solar@example.com.au")).toBeUndefined();
  });

  it("accepts Australian mobile numbers starting with 04", () => {
    expect(isValidAustralianMobile("0412345678")).toBe(true);
    expect(isValidAustralianMobile("0412 345 678")).toBe(true);
    expect(isValidAustralianMobile("+61 412 345 678")).toBe(true);
    expect(isValidAustralianMobile("0212345678")).toBe(false);
    expect(isValidAustralianMobile("041234567")).toBe(false);
    expect(validateField("mobile", "0312345678")).toMatch(/starting with 04/);
    expect(normaliseMobile("+61 412-345-678")).toBe("0412345678");
    expect(formatMobile("0412345678")).toBe("0412 345 678");
  });

  it("only accepts the documented demo code", () => {
    expect(DEMO_OTP).toBe("123456");
    expect(validateField("otp", "")).toMatch(/6-digit/);
    expect(validateField("otp", "123")).toMatch(/must be 6 digits/);
    expect(validateField("otp", "654321")).toMatch(/incorrect/);
    expect(validateField("otp", DEMO_OTP)).toBeUndefined();
  });
});
