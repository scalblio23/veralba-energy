import { formatMobile, getActiveAnswers, type Answers } from "@/lib/survey";
import styles from "./Survey.module.css";

const SUMMARY: { label: string; value: (answers: Answers) => string | undefined }[] = [
  { label: "Postcode", value: (a) => a.postcode },
  { label: "Home ownership", value: (a) => a.homeowner },
  { label: "Existing solar", value: (a) => a.existingSolar },
  { label: "Existing system age", value: (a) => a.systemAge },
  { label: "Reason for enquiry", value: (a) => a.reason },
  { label: "Quarterly bill", value: (a) => a.bill },
  { label: "Home age", value: (a) => a.homeAge },
  { label: "Roof type", value: (a) => a.roofType },
  { label: "Roof shading", value: (a) => a.shading },
  {
    label: "Address",
    value: (a) => [a.street, a.suburb, a.addressPostcode].filter(Boolean).join(", ") || undefined,
  },
  { label: "Name", value: (a) => [a.firstName, a.lastName].filter(Boolean).join(" ") || undefined },
  { label: "Email", value: (a) => a.email },
  { label: "Mobile", value: (a) => (a.mobile ? formatMobile(a.mobile) : undefined) },
];

interface SuccessMessageProps {
  answers: Answers;
  onRestart: () => void;
}

export function SuccessMessage({ answers, onRestart }: SuccessMessageProps) {
  const active = getActiveAnswers(answers);
  const firstName = active.firstName?.trim();
  const rows = SUMMARY.map((row) => ({ label: row.label, value: row.value(active)?.trim() })).filter(
    (row): row is { label: string; value: string } => Boolean(row.value),
  );

  return (
    <div className={`${styles.message} ${styles.success}`}>
      <svg className={styles.successIcon} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <circle cx="32" cy="32" r="30" fill="#1ae2c2" />
        <path d="M19 33.5 28 42l17-19" fill="none" stroke="#000033" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className={styles.demoBadge}>Demo complete · Nothing was submitted</p>
      <h2 className={styles.questionTitle} tabIndex={-1} data-step-heading>
        Thanks{firstName ? `, ${firstName}` : ""}! <strong>Your eligibility request is ready.</strong>
      </h2>
      <p className={styles.questionDescription}>
        In the live service, an SAA Accredited solar expert would now review your answers and contact you about
        Government solar incentives and No Net Cost Solar options for your home.
      </p>

      <div className={styles.summary}>
        <h3 className={styles.summaryHeading}>Your answers</h3>
        <dl className={styles.summaryList}>
          {rows.map((row) => (
            <div key={row.label} className={styles.summaryRow}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className={styles.privacyNote}>
        Your details stayed in this browser tab. They have not been sent to Solar Selector, installers or any other
        service, and they are cleared when you refresh or leave the page.
      </p>

      <button type="button" className={styles.nextButton} onClick={onRestart}>
        Start again
      </button>
    </div>
  );
}
