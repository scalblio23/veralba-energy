import { site } from "@/lib/site";
import styles from "./Survey.module.css";

export function RenterMessage() {
  return (
    <div className={styles.message}>
      <h2 className={styles.questionTitle} tabIndex={-1} data-step-heading>
        I&apos;m sorry, currently {site.name} can only assist <strong>homeowners</strong>.
      </h2>
      <p className={styles.questionDescription}>
        If you&apos;re renting and want to see if you can save hundreds on your electricity bills, we recommend you
        visit the Energy Assistance website:
      </p>
      <p>
        <a className={styles.externalLink} href={site.energyAssistanceUrl} target="_blank" rel="noopener noreferrer">
          Visit Energy Made Easy
          <span className="visually-hidden"> (Australian Government energy assistance website, opens in a new tab)</span>
        </a>
      </p>
    </div>
  );
}
