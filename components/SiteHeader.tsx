import Image from "next/image";
import { BrandLogo } from "./BrandLogo";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <BrandLogo className={styles.logo} />
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
