"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useCMS } from "@/context/CMSContext";
import styles from "./PromoStrip.module.css";

const StarSeparator = () => (
  <span className={styles.starIcon} aria-hidden="true">
    ✦
  </span>
);

export const PromoStrip: React.FC = () => {
  const { locale, direction } = useLanguage();
  const { cmsData } = useCMS();

  if (!cmsData.promoStrip.isEnabled) {
    return null;
  }

  const isAr = locale === "ar";
  const promoItems = cmsData.promoStrip.items.map((it) => ({
    text: isAr ? it.ar : it.en,
  }));

  const trackClass = direction === "ltr" ? styles.stripTrackLtr : styles.stripTrack;

  return (
    <section className={styles.stripWrapper} aria-label="Promo ticker">
      <div className={trackClass}>
        {/* Loop Group 1 */}
        <div className={styles.stripGroup}>
          {promoItems.map((item, idx) => (
            <div key={`item1-${idx}`} className={styles.itemWrapper}>
              <span className={styles.text}>{item.text}</span>
              <StarSeparator />
            </div>
          ))}
        </div>

        {/* Loop Group 2 (Exact Duplicate for Continuous Infinite Loop) */}
        <div className={styles.stripGroup} aria-hidden="true">
          {promoItems.map((item, idx) => (
            <div key={`item2-${idx}`} className={styles.itemWrapper}>
              <span className={styles.text}>{item.text}</span>
              <StarSeparator />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

