"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./CommunityShowcase.module.css";

const communityMoments = [
  {
    id: "moment-1",
    image: "/categories/100.jpg",
    alt: "Juvenile Luxury Fragrance - Peony & Silk Edition",
  },
  {
    id: "moment-2",
    image: "/categories/Gemini_Generated_Image_2638p12638p12638.jpg",
    alt: "Juvenile Luxury Fragrance - Editorial Floral Flacon",
  },
  {
    id: "moment-3",
    image: "/categories/Gemini_Generated_Image_emjr6eemjr6eemjr.jpg",
    alt: "Juvenile Luxury Fragrance - Golden Amber & Botanicals",
  },
  {
    id: "moment-4",
    image: "/categories/Gemini_Generated_Image_sv1mmsv1mmsv1mms.jpg",
    alt: "Juvenile Luxury Fragrance - Desert Sands Eau de Parfum",
  },
  {
    id: "moment-5",
    image: "/categories/moment-5.jpg",
    alt: "Juvenile Luxury Fragrance - L'Essence d'Or Sunlight Edition",
  },
];

export const CommunityShowcase: React.FC = () => {
  const { locale, direction } = useLanguage();
  const isAr = locale === "ar";
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = communityMoments.length;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Gentle auto-rotation every 4.5 seconds when not hovered and tab is visible
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      nextSlide();
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.key === "ArrowLeft") {
        direction === "rtl" ? nextSlide() : prevSlide();
      } else if (e.key === "ArrowRight") {
        direction === "rtl" ? prevSlide() : nextSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, nextSlide, prevSlide]);

  // Touch Swipe Support
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        direction === "rtl" ? nextSlide() : prevSlide();
      } else {
        direction === "rtl" ? prevSlide() : nextSlide();
      }
    }
    touchStartX.current = null;
  };

  return (
    <section
      className={styles.section}
      aria-label={isAr ? "مجتمع جوفينيل" : "Juvenile Community Moments"}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.container}>
        {/* Header with Navigation Arrows */}
        <div className={styles.headerRow}>
          <div className={styles.titleBlock}>
            <span className={styles.eyebrow}>
              {isAr ? "مجتمع جوفينيل • JUVENILE MOMENTS" : "JUVENILE COMMUNITY"}
            </span>
            <h2 className={styles.heading}>
              {isAr ? "أنتم جوهر التجربة" : "Living The Scent"}
            </h2>
            <p className={styles.subheading}>
              {isAr
                ? "مقتطفات عفوية وذكريات خاصة يشاركنا إياها عشاق عطورنا."
                : "Curated portraits and memories shared by our community of fragrance connoisseurs."}
            </p>
          </div>
        </div>

        {/* =========================================
            FANNED-ARC CARD CAROUSEL
            ========================================= */}
        <div
          className={styles.fanStage}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.fanContainer}>
            {communityMoments.map((moment, index) => {
              // Calculate shortest circular distance to activeIndex
              let offset = index - activeIndex;
              if (offset > total / 2) offset -= total;
              if (offset < -total / 2) offset += total;

              // Display only up to 2 items on each side (total 5 cards rendered in view)
              const isVisible = Math.abs(offset) <= 2;
              const isCenter = offset === 0;

              return (
                <div
                  key={moment.id}
                  onClick={() => setActiveIndex(index)}
                  className={`${styles.card} ${isCenter ? styles.cardCenter : ""}`}
                  data-offset={offset}
                  style={{
                    zIndex: 10 - Math.abs(offset),
                    opacity: isVisible ? 1 : 0,
                    pointerEvents: isVisible ? "auto" : "none",
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Photo ${index + 1} of ${total}`}
                >
                  <div className={styles.cardInner}>
                    <Image
                      src={moment.image}
                      alt={moment.alt}
                      fill
                      sizes="(max-width: 768px) 260px, 340px"
                      className={styles.cardImage}
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Minimal Progress Dots */}
        <div className={styles.dotsRow}>
          {communityMoments.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ""}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
