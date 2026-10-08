"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./SitePreloader.module.css";

const AR_PHRASES = [
  "حضورك يبدأ من عطرك",
  "كل عطر له شخصية",
  "اختار اللي يليق بك",
];

const EN_PHRASES = [
  "Your presence begins with your scent",
  "Every fragrance has a character",
  "Choose what defines you",
];

export const SitePreloader: React.FC = () => {
  const { locale } = useLanguage();
  const [mounted, setMounted] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phraseState, setPhraseState] = useState<"active" | "exiting">("active");
  const isDismissedRef = useRef(false);

  const dismiss = useCallback(() => {
    if (isDismissedRef.current) return;
    isDismissedRef.current = true;
    setIsExiting(true);
    setTimeout(() => {
      setMounted(false);
    }, 700);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Phrase 1: Displays from 0ms, starts exiting at 550ms
    const t1 = setTimeout(() => {
      setPhraseState("exiting");
    }, 550);

    // Phrase 2: Enters at 800ms, starts exiting at 1350ms
    const t2 = setTimeout(() => {
      setPhraseIndex(1);
      setPhraseState("active");
    }, 800);

    const t3 = setTimeout(() => {
      setPhraseState("exiting");
    }, 1350);

    // Phrase 3: Enters at 1600ms, stays until 2300ms
    const t4 = setTimeout(() => {
      setPhraseIndex(2);
      setPhraseState("active");
    }, 1600);

    // Smooth Preloader Exit after third phrase finishes (2.35s total)
    const tExit = setTimeout(() => {
      dismiss();
    }, 2350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tExit);
    };
  }, [dismiss]);

  if (!mounted) return null;

  const isAr = locale === "ar";
  const phrases = isAr ? AR_PHRASES : EN_PHRASES;

  return (
    <div
      className={`${styles.preloaderOverlay} ${
        isExiting ? styles.preloaderHidden : ""
      }`}
      onClick={dismiss}
      aria-hidden={isExiting}
      role="status"
      aria-label="Loading JUVENILE Fragrance"
      title={isAr ? "اضغط للتخطي" : "Click to skip"}
    >
      <div className={`${styles.stage} ${isExiting ? styles.stageExit : ""}`}>
        <div className={styles.loaderAnchor}>
          {/* Logo with Soft Breathing Glow */}
          <div className={styles.logoPulseWrap}>
            <Image
              src="/logo.webp"
              alt="JUVENILE Haute Parfumerie"
              width={220}
              height={65}
              priority
              unoptimized
              className={styles.brandLogoImg}
            />
          </div>

          {/* Sequential Luxury Brand Phrases */}
          <div className={styles.phraseStage}>
            <div
              key={phraseIndex}
              className={`${styles.phraseText} ${
                phraseState === "active" ? styles.phraseActive : styles.phraseExiting
              }`}
            >
              {phrases[phraseIndex]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
