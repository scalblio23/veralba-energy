import type { AnswerKey, Answers, FieldErrors, FieldStep } from "@/lib/survey";
import { StepHeading } from "./StepHeading";
import styles from "./Survey.module.css";

interface FieldQuestionProps {
  step: FieldStep;
  answers: Answers;
  errors: FieldErrors;
  fieldId: (key: AnswerKey) => string;
  onChange: (key: AnswerKey, value: string) => void;
}

export function FieldQuestion({ step, answers, errors, fieldId, onChange }: FieldQuestionProps) {
  const headingId = `survey-${step.id}-title`;
  const descriptionId = `survey-${step.id}-description`;
  const isSingleField = step.fields.length === 1;

  return (
    <>
      <StepHeading id={headingId} title={step.title} description={step.description} descriptionId={descriptionId} />
      <div
        role="group"
        aria-labelledby={headingId}
        aria-describedby={step.description ? descriptionId : undefined}
        className={`${styles.fields} ${isSingleField ? styles.singleField : ""}`}
      >
        {step.fields.map((field) => {
          const id = fieldId(field.key);
          const error = errors[field.key];
          const hintId = `${id}-hint`;
          const errorId = `${id}-error`;
          const describedBy = [field.hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

          return (
            <div
              key={field.key}
              className={`${styles.field} ${field.width === "half" ? styles.fieldHalf : styles.fieldFull}`}
            >
              <label htmlFor={id} className={field.hideLabel ? "visually-hidden" : styles.fieldLabel}>
                {field.label}
              </label>
              <input
                id={id}
                className={styles.textInput}
                name={field.key}
                type={field.type}
                inputMode={field.inputMode}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                required
                aria-required="true"
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy || undefined}
                value={answers[field.key] ?? ""}
                onChange={(event) => {
                  const value = field.digitsOnly ? event.target.value.replace(/\D/g, "") : event.target.value;
                  onChange(field.key, value);
                }}
              />
              {field.hint && (
                <p id={hintId} className={styles.fieldHint}>
                  {field.hint}
                </p>
              )}
              {error && (
                <p id={errorId} className={styles.error}>
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
