"use client";

import React from "react";
import styles from "./MarqueeStrip.module.css";

// Delicate Hand-drawn Luxury Botanical Flower Icon (Matches user reference exactly)
const FlowerIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={styles.itemIcon}
    aria-hidden="true"
  >
    <path
      d="M12 7.5C12 5 14 3 16 4C18 5 17 8 13.5 9.5M12 7.5C12 5 10 3 8 4C6 5 7 8 10.5 9.5M12 7.5V13.5M13.5 9.5C15.5 10.5 18 12 17 14C16 16 13 14.5 12 13.5M10.5 9.5C8.5 10.5 6 12 7 14C8 16 11 14.5 12 13.5M12 13.5V20.5M12 16.5C10 17.5 8 20 10 21C12 21 12 18.5 12 16.5Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const marqueeWords = [
  "WOOD",
  "CALM",
  "LUXURY",
  "MOMENT",
  "ORGANIC",
  "HAUTE PARFUMERIE",
  "RARE ESSENCES",
  "PARISIAN CRAFT",
  "NATURAL EXTRACTS",
];

export const MarqueeStrip: React.FC = () => {
  return (
    <div className={styles.marqueeWrapper} aria-label="Brand Philosophy Ticker">
      <div className={styles.marqueeTrack}>
        {/* Group 1 */}
        <div className={styles.marqueeGroup}>
          {marqueeWords.map((word, idx) => (
            <span key={`grp1-${idx}`} className={styles.marqueeItem}>
              <FlowerIcon />
              <span>{word}</span>
            </span>
          ))}
        </div>

        {/* Group 2 (Duplicate for Seamless Infinite Loop) */}
        <div className={styles.marqueeGroup} aria-hidden="true">
          {marqueeWords.map((word, idx) => (
            <span key={`grp2-${idx}`} className={styles.marqueeItem}>
              <FlowerIcon />
              <span>{word}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
