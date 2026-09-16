import type { StepTitle } from "@/lib/survey";
import styles from "./Survey.module.css";

interface StepHeadingProps {
  id: string;
  title: StepTitle;
  description?: string;
  descriptionId?: string;
}

export function StepHeading({ id, title, description, descriptionId }: StepHeadingProps) {
  return (
    <>
      <h2 id={id} className={styles.questionTitle} tabIndex={-1} data-step-heading>
        {title.lead && <>{title.lead} </>}
        <strong>{title.emphasis}</strong>
        {title.trail && <> {title.trail}</>}
      </h2>
      {description && (
        <p id={descriptionId} className={styles.questionDescription}>
          {description}
        </p>
      )}
    </>
  );
}
