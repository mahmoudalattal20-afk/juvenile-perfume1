"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCMS } from "@/context/CMSContext";
import { useSpatialReveal } from "@/hooks/useSpatialReveal";
import { CMSHighlightCard } from "@/lib/cmsTypes";
import styles from "./HighlightSection.module.css";

const defaultHighlightCards: CMSHighlightCard[] = [
  {
    id: "for-her",
    image: "/highlights/her.jpg",
    titleAr: "عطور نسائية ساحرة ومخملية",
    titleEn: "FOR HER",
    subtitleEn: "Made to leave an impression.",
    subtitleAr: "",
    link: "/category/women",
  },
  {
    id: "for-him",
    image: "/highlights/him.png",
    titleAr: "عطور رجالية مهيبة وفخمة",
    titleEn: "FOR HIM",
    subtitleEn: "Made to make a statement.",
    subtitleAr: "",
    link: "/category/men",
  },
  {
    id: "unisex",
    image: "/highlights/unisex.jpg",
    titleAr: "عطور للجنسين راقية ومتميزة",
    titleEn: "UNISEX",
    subtitleEn: "Universal harmony & allure.",
    subtitleAr: "",
    link: "/category/unisex",
  },
];

export const HighlightSection: React.FC = () => {
  const { locale, direction: dir } = useLanguage();
  const { cmsData } = useCMS();
  const isAr = locale === "ar";
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;
  const { ref: sectionRef, isRevealed } = useSpatialReveal<HTMLElement>({
    threshold: 0.08,
    rootMargin: "0px 0px -6% 0px",
  });

  const cards =
    cmsData.highlights && cmsData.highlights.length > 0
      ? cmsData.highlights
      : defaultHighlightCards;

  const getCardTargetLink = (card: CMSHighlightCard) => {
    const lowerId = (card.id || "").toLowerCase();
    const lowerLink = (card.link || "").toLowerCase();

    if (lowerId === "for-her" || lowerId === "women" || lowerLink.includes("women") || lowerLink.includes("her")) {
      return "/category/women";
    }
    if (lowerId === "for-him" || lowerId === "men" || lowerLink.includes("men") || lowerLink.includes("him")) {
      return "/category/men";
    }
    if (lowerId === "unisex" || lowerLink.includes("unisex")) {
      return "/category/unisex";
    }
    return card.link || "/";
  };

  return (
    <section className={styles.section} id="offers" ref={sectionRef}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={`${styles.header} ${isRevealed ? styles.headerVisible : ""}`}>
          <h2
            className={styles.title}
            style={isAr ? { fontFamily: "var(--font-readex), 'Readex Pro', sans-serif" } : undefined}
          >
            {isAr ? "اختر حضورك" : "Choose Your Presence"}
          </h2>
        </div>

        {/* 3-Column Highlight Grid */}
        <div className={styles.highlightGrid}>
          {cards.map((card, idx) => {
            const title = isAr
              ? card.titleAr || card.labelAr || ""
              : card.titleEn || card.labelEn || "";
            const subtitle = isAr ? card.subtitleAr : card.subtitleEn;
            const targetLink = getCardTargetLink(card);

            return (
              <Link
                key={card.id}
                href={targetLink}
                className={`${styles.card} ${isRevealed ? styles.cardVisible : ""}`}
                style={{
                  transitionDelay: `${idx * 110}ms`,
                }}
              >
                {/* Image Container */}
                <div className={styles.imageWrapper}>
                  <Image
                    src={card.image}
                    alt={title || "Highlight Banner"}
                    fill
                    sizes="(max-width: 860px) 50vw, 550px"
                    className={styles.cardImage}
                  />
                  <div className={styles.vignetteOverlay} />
                </div>

                {/* Bottom Label & Arrow Button */}
                <div className={styles.bottomBar}>
                  <div className={styles.textCol}>
                    <span className={styles.cardTitle}>{title}</span>
                    {subtitle && (
                      <span className={styles.cardSubtitle}>{subtitle}</span>
                    )}
                  </div>
                  <div className={styles.arrowCircle}>
                    <ArrowIcon className={styles.arrowIcon} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
