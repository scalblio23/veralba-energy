/**
 * Survey definition, branching and validation.
 *
 * Everything in this module is pure so the flow can be unit tested without
 * rendering. The UI keeps only the current step id and the answers; the
 * visited path, progress and "Previous" target are all derived from those.
 */

export const DEMO_OTP = "123456";

export type ChoiceStepId =
  | "homeowner"
  | "existingSolar"
  | "systemAge"
  | "reason"
  | "bill"
  | "homeAge"
  | "roofType"
  | "shading";

export type FieldStepId = "postcode" | "address" | "name" | "contact";

export type StepId = FieldStepId | ChoiceStepId | "renter" | "verify" | "success";

export type AnswerKey =
  | ChoiceStepId
  | "postcode"
  | "street"
  | "suburb"
  | "addressPostcode"
  | "firstName"
  | "lastName"
  | "email"
  | "mobile"
  | "otp";

export type Answers = Partial<Record<AnswerKey, string>>;

export type FieldErrors = Partial<Record<AnswerKey, string>>;

export interface StepTitle {
  lead?: string;
  emphasis: string;
  trail?: string;
}

export interface ChoiceOption {
  value: string;
  label: string;
  icon: string;
  iconWidth: number;
  iconHeight: number;
}

export interface ChoiceStep {
  kind: "choice";
  id: ChoiceStepId;
  title: StepTitle;
  description?: string;
  options: ChoiceOption[];
}

export interface TextField {
  key: AnswerKey;
  label: string;
  placeholder: string;
  type: "text" | "email" | "tel";
  inputMode?: "numeric" | "email" | "tel" | "text";
  autoComplete: string;
  maxLength?: number;
  /** Visually hide the label when the step title already describes the field. */
  hideLabel?: boolean;
  /** Keep only digits while typing. */
  digitsOnly?: boolean;
  width?: "full" | "half";
  hint?: string;
}

export interface FieldStep {
  kind: "fields";
  id: FieldStepId;
  title: StepTitle;
  description?: string;
  fields: TextField[];
}

export interface MessageStep {
  kind: "message";
  id: "renter" | "verify" | "success";
}

export type Step = ChoiceStep | FieldStep | MessageStep;

const option = (value: string, icon: string, iconWidth: number, iconHeight: number, label = value): ChoiceOption => ({
  value,
  label,
  icon: `/assets/${icon}`,
  iconWidth,
  iconHeight,
});

export const STEPS: Record<StepId, Step> = {
  postcode: {
    kind: "fields",
    id: "postcode",
    title: { lead: "See If Your", emphasis: "Postcode Qualifies" },
    description: "Please Enter Your Postcode Below.",
    fields: [
      {
        key: "postcode",
        label: "Postcode",
        placeholder: "0000",
        type: "text",
        inputMode: "numeric",
        autoComplete: "postal-code",
        maxLength: 4,
        hideLabel: true,
        digitsOnly: true,
      },
    ],
  },
  homeowner: {
    kind: "choice",
    id: "homeowner",
    title: { lead: "Do you", emphasis: "own your home?" },
    description: "Select your best option.",
    options: [option("Own", "home-owner.png", 200, 250), option("Rent", "home-renter.png", 229, 250)],
  },
  renter: { kind: "message", id: "renter" },
  existingSolar: {
    kind: "choice",
    id: "existingSolar",
    title: { lead: "Do you already", emphasis: "have solar panels?" },
    description: "Select your best option.",
    options: [
      option("Yes", "solar-existing-yes.png", 250, 239),
      option("No", "solar-existing-no.png", 250, 239),
      option("Solar Hot Water", "solar-hot-water.png", 250, 198),
    ],
  },
  systemAge: {
    kind: "choice",
    id: "systemAge",
    title: { lead: "How old is your", emphasis: "existing solar system?" },
    description: "Your best guess is ok.",
    options: [
      option("More than 5 years", "system-age-over-five-years.png", 236, 250),
      option("Less than 5 years", "system-age-under-five-years.png", 236, 250),
    ],
  },
  reason: {
    kind: "choice",
    id: "reason",
    title: { lead: "Why are you", emphasis: "interested in solar?" },
    description: "Tell us why you're enquiring today.",
    options: [
      option("Upgrading System", "reason-upgrade-system.png", 245, 250),
      option("Adding A Battery", "reason-add-battery.png", 250, 182),
      option("Not Interested", "reason-not-interested.png", 250, 239),
    ],
  },
  bill: {
    kind: "choice",
    id: "bill",
    title: { lead: "How high is your", emphasis: "quarterly electricity bill?" },
    description: "Your best guess is ok.",
    options: [
      option("$300 - $600", "bill-300-600.png", 250, 208),
      option("$600 - $900", "bill-600-900.png", 250, 208),
      option("$900 - $1200", "bill-900-1200.png", 250, 242),
      option("$1200 +", "bill-over-1200.png", 230, 250),
    ],
  },
  homeAge: {
    kind: "choice",
    id: "homeAge",
    title: { lead: "What's the", emphasis: "age of your home?" },
    description: "Your best guess is ok.",
    options: [
      option("0 - 10 Years", "home-age-0-10.png", 248, 250),
      option("10 - 20 Years", "home-age-10-20.png", 212, 250),
      option("20 + Years", "home-age-over-20.png", 235, 250),
    ],
  },
  roofType: {
    kind: "choice",
    id: "roofType",
    title: { lead: "What", emphasis: "type of roof", trail: "do you have?" },
    options: [
      option("Tin", "roof-tin.png", 250, 197),
      option("Tile", "roof-tile.png", 217, 250),
      option("Other", "option-unsure.png", 250, 244),
    ],
  },
  shading: {
    kind: "choice",
    id: "shading",
    title: { lead: "Do you have any", emphasis: "roof shading issues?" },
    options: [
      option("No Issues", "shade-none.png", 250, 249),
      option("Minor Shade", "shade-minor.png", 250, 224),
      option("Major Shade", "shade-major.png", 250, 194),
      option("Not Sure", "option-unsure.png", 250, 244),
    ],
  },
  address: {
    kind: "fields",
    id: "address",
    title: { lead: "What's your", emphasis: "home address?" },
    description: "Your address is required to provide accurate results.",
    fields: [
      {
        key: "street",
        label: "Street address",
        placeholder: "Start Typing Your Address",
        type: "text",
        autoComplete: "street-address",
        maxLength: 120,
      },
      {
        key: "suburb",
        label: "Suburb/City",
        placeholder: "My Suburb",
        type: "text",
        autoComplete: "address-level2",
        maxLength: 60,
        width: "half",
      },
      {
        key: "addressPostcode",
        label: "Postcode",
        placeholder: "2001",
        type: "text",
        inputMode: "numeric",
        autoComplete: "postal-code",
        maxLength: 4,
        digitsOnly: true,
        width: "half",
      },
    ],
  },
  name: {
    kind: "fields",
    id: "name",
    title: { lead: "What's your", emphasis: "name?" },
    description: "So our solar experts know who they're speaking with.",
    fields: [
      {
        key: "firstName",
        label: "First name",
        placeholder: "First name",
        type: "text",
        autoComplete: "given-name",
        maxLength: 50,
        width: "half",
      },
      {
        key: "lastName",
        label: "Last name",
        placeholder: "Last name",
        type: "text",
        autoComplete: "family-name",
        maxLength: 50,
        width: "half",
      },
    ],
  },
  contact: {
    kind: "fields",
    id: "contact",
    title: { lead: "How can we", emphasis: "reach you?" },
    description: "You will be required to verify this mobile number.",
    fields: [
      {
        key: "email",
        label: "Best email address",
        placeholder: "email@domain.com",
        type: "email",
        inputMode: "email",
        autoComplete: "email",
        maxLength: 254,
      },
      {
        key: "mobile",
        label: "Mobile phone number",
        placeholder: "04XX XXX XXX",
        type: "tel",
        inputMode: "tel",
        autoComplete: "tel-national",
        maxLength: 14,
        hint: "Australian mobile numbers start with 04.",
      },
    ],
  },
  verify: { kind: "message", id: "verify" },
  success: { kind: "message", id: "success" },
};

export const FIRST_STEP: StepId = "postcode";

/** Steps that end a path. */
export const TERMINAL_STEPS: ReadonlySet<StepId> = new Set<StepId>(["renter", "success"]);

/**
 * Resolve the step that follows `step`.
 *
 * Unanswered branch questions fall back to the most common branch so the
 * projected path (used for progress) is always complete.
 */
export function getNextStep(step: StepId, answers: Answers): StepId | null {
  switch (step) {
    case "postcode":
      return "homeowner";
    case "homeowner":
      return answers.homeowner === "Rent" ? "renter" : "existingSolar";
    case "existingSolar":
      return answers.existingSolar === "Yes" ? "systemAge" : "bill";
    case "systemAge":
      return "reason";
    case "reason":
      return "bill";
    case "bill":
      return "homeAge";
    case "homeAge":
      return "roofType";
    case "roofType":
      return "shading";
    case "shading":
      return "address";
    case "address":
      return "name";
    case "name":
      return "contact";
    case "contact":
      return "verify";
    case "verify":
      return "success";
    case "renter":
    case "success":
      return null;
  }
}

/** The full logical path implied by the current answers. */
export function getPath(answers: Answers): StepId[] {
  const path: StepId[] = [];
  let step: StepId | null = FIRST_STEP;
  while (step) {
    path.push(step);
    step = getNextStep(step, answers);
  }
  return path;
}

export function getPreviousStep(step: StepId, answers: Answers): StepId | null {
  const path = getPath(answers);
  const index = path.indexOf(step);
  return index > 0 ? (path[index - 1] ?? null) : null;
}

export interface Progress {
  /** 1-based question number on the active path. */
  current: number;
  /** Number of questions on the active path (excludes the success screen). */
  total: number;
  percent: number;
}

/**
 * Progress through the active path. The bar shows how much of the path has
 * been completed before the current step, reaching 100% on terminal screens.
 */
export function getProgress(step: StepId, answers: Answers): Progress {
  const path = getPath(answers);
  const questions: StepId[] = path.filter((id) => id !== "success");
  const total = questions.length;

  if (TERMINAL_STEPS.has(step)) {
    return { current: total, total, percent: 100 };
  }

  const index = Math.max(0, questions.indexOf(step));
  return { current: index + 1, total, percent: Math.round((index / total) * 100) };
}

/** Answer keys that belong to the given step. */
export function getStepKeys(step: StepId): AnswerKey[] {
  const definition = STEPS[step];
  if (definition.kind === "choice") return [definition.id];
  if (definition.kind === "fields") return definition.fields.map((field) => field.key);
  return step === "verify" ? ["otp"] : [];
}

/** Answers limited to steps on the active path, dropping abandoned branches. */
export function getActiveAnswers(answers: Answers): Answers {
  const active: Answers = {};
  for (const step of getPath(answers)) {
    for (const key of getStepKeys(step)) {
      const value = answers[key];
      if (value !== undefined) active[key] = value;
    }
  }
  return active;
}

const POSTCODE_PATTERN = /^\d{4}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[A-Za-z]{2,}$/;
const NAME_PATTERN = /^\p{L}[\p{L}\p{M}' .-]*$/u;
const AU_MOBILE_PATTERN = /^04\d{8}$/;

/** Strip spaces, dashes and brackets and convert +61 4… to 04…. */
export function normaliseMobile(value: string): string {
  const compact = value.replace(/[\s()-]/g, "");
  if (compact.startsWith("+614")) return `0${compact.slice(3)}`;
  if (compact.startsWith("614") && compact.length === 11) return `0${compact.slice(2)}`;
  return compact;
}

export function isValidAustralianMobile(value: string): boolean {
  return AU_MOBILE_PATTERN.test(normaliseMobile(value));
}

/** Format a valid mobile as `0412 345 678`. */
export function formatMobile(value: string): string {
  const digits = normaliseMobile(value);
  if (!AU_MOBILE_PATTERN.test(digits)) return value.trim();
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

export function validateField(key: AnswerKey, rawValue: string | undefined): string | undefined {
  const value = (rawValue ?? "").trim();

  switch (key) {
    case "postcode":
    case "addressPostcode":
      if (!value) return "Please enter your postcode.";
      return POSTCODE_PATTERN.test(value) ? undefined : "Please enter a valid 4-digit Australian postcode.";
    case "street":
      if (!value) return "Please enter your street address.";
      return value.length >= 3 ? undefined : "Please enter your full street address.";
    case "suburb":
      if (!value) return "Please enter your suburb or city.";
      return value.length >= 2 ? undefined : "Please enter a valid suburb or city.";
    case "firstName":
      if (!value) return "Please enter your first name.";
      return NAME_PATTERN.test(value) ? undefined : "Please enter a valid first name.";
    case "lastName":
      if (!value) return "Please enter your last name.";
      return NAME_PATTERN.test(value) ? undefined : "Please enter a valid last name.";
    case "email":
      if (!value) return "Please enter your email address.";
      return EMAIL_PATTERN.test(value) ? undefined : "Please enter a valid email address, e.g. name@example.com.";
    case "mobile":
      if (!value) return "Please enter your mobile number.";
      return isValidAustralianMobile(value)
        ? undefined
        : "Please enter a valid Australian mobile number starting with 04, e.g. 0412 345 678.";
    case "otp":
      if (!value) return "Please enter your 6-digit verification code.";
      if (!/^\d{6}$/.test(value)) return "Your verification code must be 6 digits.";
      return value === DEMO_OTP ? undefined : `That code is incorrect. For this demo, enter ${DEMO_OTP}.`;
    default:
      return value ? undefined : "Please select an option to continue.";
  }
}

/** Validate every answer that belongs to `step`. Returns an empty object when valid. */
export function validateStep(step: StepId, answers: Answers): FieldErrors {
  const errors: FieldErrors = {};
  for (const key of getStepKeys(step)) {
    const message = validateField(key, answers[key]);
    if (message) errors[key] = message;
  }
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
