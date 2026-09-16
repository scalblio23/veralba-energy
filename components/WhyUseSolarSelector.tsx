"use client";

import Image from "next/image";
import { useState } from "react";
import { Modal } from "./Modal";
import styles from "./WhyUseSolarSelector.module.css";

export function WhyUseSolarSelector() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <section className={styles.section} aria-labelledby="why-heading">
      <div className="container">
        <h2 id="why-heading" className={styles.heading}>
          Why Use Solar Selector?
        </h2>

        <div className={styles.grid}>
          <article className={styles.item}>
            <Image
              className={styles.icon}
              src="/assets/benefit-solar-incentives.png"
              alt=""
              width={250}
              height={225}
              sizes="56px"
            />
            <h3 className={styles.itemHeading}>Access Solar Incentives</h3>
            <p className={styles.copy}>
              In less than 60 seconds you&apos;ll find out if you qualify for Government solar incentives worth up to
              $5,960*.
            </p>
          </article>

          <article className={styles.item}>
            <Image
              className={styles.icon}
              src="/assets/benefit-accredited-experts.png"
              alt=""
              width={245}
              height={250}
              sizes="50px"
            />
            <h3 className={styles.itemHeading}>Accredited Solar Experts</h3>
            <p className={styles.copy}>
              Our free service ensures you&apos;re matched with a leading SAA Accredited Solar installer.
            </p>
          </article>

          <article className={styles.item}>
            <Image
              className={styles.icon}
              src="/assets/benefit-no-net-cost.png"
              alt=""
              width={250}
              height={192}
              sizes="66px"
            />
            <h3 className={styles.itemHeading}>No Net Cost Solar</h3>
            <p className={styles.copy}>
              Those who qualify can get solar panels installed without adding a dollar to their monthly expenses.{" "}
              <button
                type="button"
                className={styles.moreLink}
                aria-haspopup="dialog"
                aria-label="More about No Net Cost Solar"
                onClick={() => setModalOpen(true)}
              >
                More
              </button>
              .
            </p>
          </article>
        </div>
      </div>

      <Modal open={isModalOpen} onClose={() => setModalOpen(false)} title="About No Net Cost Solar">
        <p>
          Those who qualify for No Net Cost Solar can get solar panels installed without adding a dollar to their
          monthly expenses.
        </p>
        <h3>How can this be possible?</h3>
        <p>
          This is made possible by the combination of your solar rebate and the solar savings you will enjoy as a part
          of your new system. For many, the savings are enough to cover the cost of your new system.
        </p>
        <p>
          Many SAA Accredited Installers offer customers green finance and/or payment plans. This makes it possible to
          pay for your solar installation from your savings, so repayments can be comparable with what you save,
          without adding any net cost to your monthly expenses.
        </p>
        <p>
          Your qualification for this program will depend on where you live, the specifics of your home, your energy
          usage, the type of system you have installed, and the specifics of the finance plan you use.
        </p>
      </Modal>
    </section>
  );
}
