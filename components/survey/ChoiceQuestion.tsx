import Image from "next/image";
import { useRef, type KeyboardEvent, type SyntheticEvent } from "react";
import type { ChoiceStep } from "@/lib/survey";
import { StepHeading } from "./StepHeading";
import styles from "./Survey.module.css";

/** Arrow-key selection within a radio group should not auto-advance. */
const ARROW_KEY_GRACE_MS = 400;

interface ChoiceQuestionProps {
  step: ChoiceStep;
  value: string | undefined;
  error: string | undefined;
  /** `autoAdvance` is false when the choice came from arrow-key navigation. */
  onChoose: (value: string, autoAdvance: boolean) => void;
  onConfirm: () => void;
}

export function ChoiceQuestion({ step, value, error, onChoose, onConfirm }: ChoiceQuestionProps) {
  const lastArrowKeyAt = useRef(Number.NEGATIVE_INFINITY);
  const headingId = `survey-${step.id}-title`;
  const descriptionId = `survey-${step.id}-description`;
  const errorId = `survey-${step.id}-error`;

  const describedBy = [step.description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(" ");

  const select = (event: SyntheticEvent, optionValue: string) => {
    const fromArrowKey = event.timeStamp - lastArrowKeyAt.current < ARROW_KEY_GRACE_MS;
    onChoose(optionValue, !fromArrowKey);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, optionValue: string) => {
    if (event.key.startsWith("Arrow")) {
      lastArrowKeyAt.current = event.timeStamp;
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (value === optionValue) onConfirm();
      else onChoose(optionValue, true);
    }
  };

  return (
    <>
      <StepHeading id={headingId} title={step.title} description={step.description} descriptionId={descriptionId} />
      <div
        role="radiogroup"
        aria-labelledby={headingId}
        aria-describedby={describedBy || undefined}
        aria-required="true"
        aria-invalid={error ? true : undefined}
        className={styles.options}
        data-count={step.options.length}
      >
        {step.options.map((option, index) => {
          const id = `survey-${step.id}-${index}`;
          return (
            <div key={option.value} className={styles.option}>
              <input
                id={id}
                className={styles.optionInput}
                type="radio"
                name={step.id}
                value={option.value}
                checked={value === option.value}
                onChange={(event) => select(event, option.value)}
                onClick={(event) => select(event, option.value)}
                onKeyDown={(event) => handleKeyDown(event, option.value)}
              />
              <label htmlFor={id} className={styles.optionCard}>
                <Image
                  className={styles.optionIcon}
                  src={option.icon}
                  alt=""
                  width={option.iconWidth}
                  height={option.iconHeight}
                  sizes="(max-width: 749px) 50px, 100px"
                />
                <span className={styles.optionLabel}>{option.label}</span>
              </label>
            </div>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </>
  );
}
