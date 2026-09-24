"use client";

import { useCallback, useEffect, useReducer, useRef, type FormEvent } from "react";
import {
  FIRST_STEP,
  STEPS,
  getNextStep,
  getPreviousStep,
  getProgress,
  getStepKeys,
  hasErrors,
  validateStep,
  type AnswerKey,
  type Answers,
  type FieldErrors,
  type StepId,
} from "@/lib/survey";
import { submitLead } from "@/lib/lead";
import { trackPixelEvent } from "@/lib/pixel";
import { ChoiceQuestion } from "./ChoiceQuestion";
import { FieldQuestion } from "./FieldQuestion";
import { RenterMessage } from "./RenterMessage";
import { SuccessMessage } from "./SuccessMessage";
import { VerifyStep } from "./VerifyStep";
import styles from "./Survey.module.css";

/** Delay between choosing a card and moving on, so the selection is visible. */
export const AUTO_ADVANCE_DELAY_MS = 350;

interface SurveyState {
  step: StepId;
  answers: Answers;
  errors: FieldErrors;
}

type SurveyAction =
  | { type: "answer"; key: AnswerKey; value: string }
  | { type: "advance"; from: StepId }
  | { type: "back" }
  | { type: "errors"; errors: FieldErrors }
  | { type: "restart" };

const initialState: SurveyState = { step: FIRST_STEP, answers: {}, errors: {} };

function reducer(state: SurveyState, action: SurveyAction): SurveyState {
  switch (action.type) {
    case "answer": {
      const errors = { ...state.errors };
      delete errors[action.key];
      return { ...state, answers: { ...state.answers, [action.key]: action.value }, errors };
    }
    case "advance": {
      // Ignore stale auto-advance requests (e.g. the user already navigated away).
      if (action.from !== state.step) return state;
      if (hasErrors(validateStep(state.step, state.answers))) return state;

      const next = getNextStep(state.step, state.answers);
      if (!next) return state;

      const answers = { ...state.answers };
      // Pre-fill the address postcode with the postcode checked in step one.
      if (next === "address" && !answers.addressPostcode && answers.postcode) {
        answers.addressPostcode = answers.postcode;
      }
      return { step: next, answers, errors: {} };
    }
    case "back": {
      const previous = getPreviousStep(state.step, state.answers);
      return previous ? { ...state, step: previous, errors: {} } : state;
    }
    case "errors":
      return { ...state, errors: action.errors };
    case "restart":
      return initialState;
  }
}

function fieldId(key: AnswerKey) {
  return `survey-${key}`;
}

export function Survey() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { step, answers, errors } = state;

  const sectionRef = useRef<HTMLElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingFocus = useRef<string | null>(null);
  const previousStep = useRef<StepId>(step);
  const leadSubmitted = useRef(false);

  const definition = STEPS[step];
  const progress = getProgress(step, answers);
  const canGoBack = step !== "success" && getPreviousStep(step, answers) !== null;
  const isStepValid = !hasErrors(validateStep(step, answers));

  const cancelAdvance = useCallback(() => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }, []);

  useEffect(() => cancelAdvance, [cancelAdvance]);

  // Move focus to the new question and keep it in view whenever the step changes.
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;

    const heading = stepRef.current?.querySelector<HTMLElement>("[data-step-heading]");
    heading?.focus({ preventScroll: true });

    const section = sectionRef.current;
    if (section && typeof section.scrollIntoView === "function") {
      const top = section.getBoundingClientRect().top;
      if (top < 0) {
        const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        section.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
      }
    }
  }, [step]);

  // Report a completed survey to the Meta Pixel as a standard Lead event.
  useEffect(() => {
    if (step === "success") trackPixelEvent("Lead");
  }, [step]);

  // Send the completed survey to the client lead list once per completion.
  useEffect(() => {
    if (step !== "success" || leadSubmitted.current) return;
    leadSubmitted.current = true;
    void submitLead(answers);
  }, [step, answers]);

  // Focus the first invalid control after validation errors render.
  useEffect(() => {
    if (!pendingFocus.current) return;
    document.getElementById(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  }, [errors]);

  const setAnswer = useCallback((key: AnswerKey, value: string) => {
    dispatch({ type: "answer", key, value });
  }, []);

  const goNext = useCallback(() => {
    cancelAdvance();
    const stepErrors = validateStep(step, answers);
    if (hasErrors(stepErrors)) {
      const firstInvalid = getStepKeys(step).find((key) => stepErrors[key]);
      if (firstInvalid) {
        const current = STEPS[step];
        if (current.kind === "choice") {
          const selectedIndex = current.options.findIndex((option) => option.value === answers[current.id]);
          pendingFocus.current = `survey-${current.id}-${Math.max(0, selectedIndex)}`;
        } else {
          pendingFocus.current = fieldId(firstInvalid);
        }
      }
      dispatch({ type: "errors", errors: stepErrors });
      return;
    }
    dispatch({ type: "advance", from: step });
  }, [answers, cancelAdvance, step]);

  const goBack = useCallback(() => {
    cancelAdvance();
    dispatch({ type: "back" });
  }, [cancelAdvance]);

  const choose = useCallback(
    (key: AnswerKey, value: string, autoAdvance: boolean) => {
      dispatch({ type: "answer", key, value });
      if (!autoAdvance || advanceTimer.current) return;
      const from = step;
      advanceTimer.current = setTimeout(() => {
        advanceTimer.current = null;
        dispatch({ type: "advance", from });
      }, AUTO_ADVANCE_DELAY_MS);
    },
    [step],
  );

  const restart = useCallback(() => {
    cancelAdvance();
    leadSubmitted.current = false;
    dispatch({ type: "restart" });
  }, [cancelAdvance]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    goNext();
  };

  const showNextButton = definition.kind === "choice" || definition.kind === "fields";

  return (
    <section ref={sectionRef} id="eligibility-check" className={styles.section} aria-labelledby="page-heading">
      <div className={`container ${styles.hero}`}>
        <h1 id="page-heading" className={styles.headline}>
          Check Your Eligibility For Government Solar Incentives &amp; <span className={styles.noWrap}>No-Net-Cost</span> Solar
        </h1>
      </div>

      <div className={styles.container}>
        <div
          className={styles.progress}
          role="progressbar"
          aria-label="Eligibility check progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percent}
          aria-valuetext={
            step === "success" || step === "renter"
              ? "Complete"
              : `Question ${progress.current} of ${progress.total}, ${progress.percent}% complete`
          }
        >
          <div className={styles.progressBar} style={{ width: `${progress.percent}%` }} />
        </div>

        <form className={styles.form} noValidate onSubmit={handleSubmit} aria-label="Solar eligibility check">
          <div key={step} ref={stepRef} className={styles.step} data-step={step}>
            {definition.kind === "choice" && (
              <ChoiceQuestion
                step={definition}
                value={answers[definition.id]}
                error={errors[definition.id]}
                onChoose={(value, autoAdvance) => choose(definition.id, value, autoAdvance)}
                onConfirm={goNext}
              />
            )}

            {definition.kind === "fields" && (
              <FieldQuestion
                step={definition}
                answers={answers}
                errors={errors}
                fieldId={fieldId}
                onChange={setAnswer}
              />
            )}

            {step === "renter" && <RenterMessage />}

            {step === "verify" && (
              <VerifyStep
                mobile={answers.mobile ?? ""}
                code={answers.otp ?? ""}
                error={errors.otp}
                inputId={fieldId("otp")}
                onChange={(value) => setAnswer("otp", value)}
              />
            )}

            {step === "success" && <SuccessMessage answers={answers} onRestart={restart} />}
          </div>

          {(showNextButton || canGoBack) && (
            <div className={styles.actions}>
              {showNextButton && (
                <button
                  type="submit"
                  className={`${styles.nextButton} ${isStepValid ? "" : styles.inactive}`}
                >
                  Next
                </button>
              )}
              {canGoBack && (
                <button type="button" className={styles.previousButton} onClick={goBack}>
                  Previous
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
