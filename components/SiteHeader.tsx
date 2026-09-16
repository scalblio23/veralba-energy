import Image from "next/image";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Image
          className={styles.logo}
          src="/assets/solar-selector-logo.png"
          alt="Solar Selector"
          width={1000}
          height={291}
          priority
          sizes="155px"
        />
        <Image
          className={styles.badge}
          src="/assets/secure-ssl-badge.png"
          alt="Secure SSL encryption"
          width={550}
          height={182}
          priority
          sizes="152px"
        />
      </div>
    </header>
  );
}
