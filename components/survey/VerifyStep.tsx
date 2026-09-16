import { site } from "@/lib/site";
import { DEMO_OTP, formatMobile } from "@/lib/survey";
import styles from "./Survey.module.css";

interface VerifyStepProps {
  mobile: string;
  code: string;
  error: string | undefined;
  inputId: string;
  onChange: (value: string) => void;
}

export function VerifyStep({ mobile, code, error, inputId, onChange }: VerifyStepProps) {
  const noteId = `${inputId}-note`;
  const errorId = `${inputId}-error`;

  return (
    <div className={styles.message}>
      <p className={styles.demoBadge}>Demo mode · No text message is sent</p>
      <h2 className={styles.questionTitle} tabIndex={-1} data-step-heading>
        In the live service, a text message with your code is sent to:
        <strong className={styles.phoneNumber}>{formatMobile(mobile)}</strong>
        Please enter your code to verify this number.
      </h2>
      <p id={noteId} className={styles.questionDescription}>
        This demo runs entirely in your browser. Enter the demo code <strong>{DEMO_OTP}</strong> to continue.
      </p>

      <div className={styles.codeSection}>
        <label htmlFor={inputId} className="visually-hidden">
          6-digit verification code
        </label>
        <input
          id={inputId}
          className={`${styles.textInput} ${styles.codeInput}`}
          type="text"
          name="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="******"
          required
          aria-required="true"
          aria-invalid={error ? true : undefined}
          aria-describedby={[noteId, error ? errorId : null].filter(Boolean).join(" ")}
          value={code}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
        />
        {error && (
          <p id={errorId} className={styles.error}>
            {error}
          </p>
        )}
      </div>

      <button type="submit" className={`${styles.qualifyButton} ${code.length === 6 ? "" : styles.inactive}`}>
        See If I Qualify
      </button>

      <p className={styles.consent}>
        By clicking the above I understand and accept {site.name}&apos;s{" "}
        <a href={site.privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href={site.termsUrl} target="_blank" rel="noopener noreferrer">
          Terms of Use
        </a>
        . You provide consent for {site.name} or one of our partners to contact you to discuss your options for
        solar and/or battery storage. We may receive a fee from our partners when you choose to use our service.
      </p>
    </div>
  );
}
