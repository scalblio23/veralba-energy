import Image from "next/image";
import { site } from "@/lib/site";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Image
              className={styles.logo}
              src="/assets/solar-selector-logo.png"
              alt="Solar Selector"
              width={1000}
              height={291}
              sizes="220px"
            />
          </div>
          <p className={styles.about}>
            Solar Selector helps you find a great solar installer by matching homeowners with vetted,
            industry-recognised solar experts.
          </p>
          <div className={styles.contact}>
            <h2 className={styles.contactHeading}>Get In Touch With Us</h2>
            <p className={styles.light}>
              Email:{" "}
              <a className={styles.email} href={`mailto:${site.contactEmail}`}>
                {site.contactEmail}
              </a>
            </p>
          </div>
        </div>

        <div className={styles.disclaimer}>
          <p>*Based on the installation of a 13.2kW solar system for a Australian home in a CER Zone 1 postcode.</p>
          <p>
            Solar Selector operates as a referral service for solar and battery solutions, partnering with solar
            companies to offer guidance on selecting the right solar products for your needs. The content provided
            on this website serves solely for informational purposes and should not be considered as professional
            advice. By accessing our website, you agree to our{" "}
            <a className={styles.accentLink} href={site.termsUrl} target="_blank" rel="noopener noreferrer">
              Terms Of Use
            </a>{" "}
            and{" "}
            <a className={styles.accentLink} href={site.privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
            . Please note that we may receive a fee from our partners if you decide to use our service.
          </p>
        </div>

        <div className={styles.bottom}>
          <p>© Copyright Solar Selector {site.copyrightYear} · All Rights Reserved</p>
          <p className={styles.legalLinks}>
            <a href={site.privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>{" "}
            ·{" "}
            <a href={site.termsUrl} target="_blank" rel="noopener noreferrer">
              Terms Of Use
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
