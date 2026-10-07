"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./BrandStats.module.css";

const statsData = {
  left: [
    {
      id: "scents",
      target: 50,
      suffix: "+",
      label: { ar: "عطر فريد ومبتكر", en: "Unique Scents" },
    },
    {
      id: "satisfaction",
      target: 98,
      suffix: "%",
      label: { ar: "نسبة رضا العملاء", en: "Satisfaction Rate" },
    },
  ],
  right: [
    {
      id: "customers",
      target: 25,
      suffix: "k+",
      label: { ar: "عميل مميز حول العالم", en: "Happy Customers" },
    },
    {
      id: "collections",
      target: 12,
      suffix: "",
      label: { ar: "مجموعة عطرية فاخرة", en: "Luxury Collections" },
    },
  ],
};

export const BrandStats: React.FC = () => {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [isVisible, setIsVisible] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({
    scents: 50,
    satisfaction: 98,
    customers: 25,
    collections: 12,
  });

  const sectionRef = useRef<HTMLElement>(null);

  // Smooth number counting animation
  useEffect(() => {
    setIsVisible(true);
    const duration = 1800; // ms
    const startTime = performance.now();
    const allStats = [...statsData.left, ...statsData.right];

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      const newCounts: Record<string, number> = {};
      allStats.forEach((s) => {
        newCounts[s.id] = Math.floor(s.target * ease);
      });

      setCounts(newCounts);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const finalCounts: Record<string, number> = {};
        allStats.forEach((s) => {
          finalCounts[s.id] = s.target;
        });
        setCounts(finalCounts);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  return (
    <section className={styles.section} ref={sectionRef} id="heritage">
      <div className={styles.container}>
        <div className={styles.statsLayout}>
          {/* Left / Start Stats Column */}
          <div className={`${styles.statsColumn} ${styles.columnStart}`}>
            {statsData.left.map((item, idx) => (
              <div
                key={item.id}
                className={styles.statBlock}
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                <div className={styles.statContent}>
                  <h3 className={styles.statNumber}>
                    {counts[item.id]}
                    <span className={styles.statSuffix}>{item.suffix}</span>
                  </h3>
                  <p className={styles.statLabel}>
                    {item.label[isAr ? "ar" : "en"]}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Center Bottle Showcase (Pure Transparent Bottle Floating) */}
          <div className={styles.centerBottleWrapper}>
            <div className={styles.auraGlow} aria-hidden="true" />
            <div className={styles.bottleContainer}>
              <Image
                src="/heritage-bottle-clean.png"
                alt="JUVENILE Haute Parfumerie Flacon"
                width={451}
                height={843}
                className={styles.bottleImage}
                priority
              />
            </div>
            <div className={styles.pedestalShadow} aria-hidden="true" />
          </div>

          {/* Right / End Stats Column */}
          <div className={`${styles.statsColumn} ${styles.columnEnd}`}>
            {statsData.right.map((item, idx) => (
              <div
                key={item.id}
                className={styles.statBlock}
                style={{ transitionDelay: `${(idx + 2) * 150}ms` }}
              >
                <div className={styles.statContent}>
                  <h3 className={styles.statNumber}>
                    {counts[item.id]}
                    <span className={styles.statSuffix}>{item.suffix}</span>
                  </h3>
                  <p className={styles.statLabel}>
                    {item.label[isAr ? "ar" : "en"]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
