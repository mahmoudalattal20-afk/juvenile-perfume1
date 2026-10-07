"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCMS } from "@/context/CMSContext";
import { CMSHeroSlide } from "@/lib/cmsTypes";
import styles from "./Hero.module.css";

const defaultCoverSlides: CMSHeroSlide[] = [
  {
    id: 0,
    imageSrc: "/uploads/cover-0_1790773207834.webp",
    link: "#bestsellers",
    titleAr: "جوفينيل للعطور الفاخرة",
    titleEn: "JUVENILE HAUTE PARFUMERIE",
    subtitleAr: "أصالة باريسية تنبض بروح الشباب العصري",
    subtitleEn: "Parisian restraint with youthful tension",
    mobileImageSrc: "/uploads/hero1_1790512378228.webp",
  },
  {
    id: 1,
    imageSrc: "/uploads/cover-2_1790773217393.webp",
    link: "#bestsellers",
    titleAr: "بانر جديد",
    titleEn: "New Banner",
    mobileImageSrc: "/uploads/hero_2_1790772965668.webp",
  },
];


export const Hero: React.FC = () => {
  const { direction: dir } = useLanguage();
  const { cmsData } = useCMS();
  const coverSlides = cmsData.heroSlides && cmsData.heroSlides.length > 0 ? cmsData.heroSlides : defaultCoverSlides;
  const heroConfig = cmsData.heroConfig || {};

  const desktopRatio = heroConfig.desktopAspectRatio || "2560 / 1100";
  const desktopMaxH = heroConfig.desktopHeight && heroConfig.desktopHeight !== "none" ? heroConfig.desktopHeight : "none";
  const desktopMaxW = heroConfig.desktopMaxWidth || "100%";
  const mobileRatio = heroConfig.mobileAspectRatio || "16 / 9";
  const mobileMaxH = heroConfig.mobileHeight && heroConfig.mobileHeight !== "none" ? heroConfig.mobileHeight : "none";

  const heroStyleVars = {
    "--hero-desktop-ratio": desktopRatio,
    "--hero-desktop-max-h": desktopMaxH,
    "--hero-desktop-max-w": desktopMaxW,
    "--hero-mobile-ratio": mobileRatio,
    "--hero-mobile-max-h": mobileMaxH,
  } as React.CSSProperties;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [sweepKey, setSweepKey] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const [hasInteracted, setHasInteracted] = useState(false);

  const goToSlide = useCallback(
    (nextIdx: number, dirVal: "next" | "prev") => {
      if (nextIdx === currentSlide || isAnimating) return;
      setHasInteracted(true);
      setIsAnimating(true);
      setDirection(dirVal);
      setPrevSlide(currentSlide);
      setCurrentSlide(nextIdx);
      setSweepKey((k) => k + 1);

      setTimeout(() => {
        setIsAnimating(false);
        setPrevSlide(null);
      }, 850);
    },
    [currentSlide, isAnimating]
  );

  const handleNext = useCallback(() => {
    const nextIdx = (currentSlide + 1) % coverSlides.length;
    goToSlide(nextIdx, "next");
  }, [currentSlide, goToSlide]);

  const handlePrev = useCallback(() => {
    const prevIdx = (currentSlide - 1 + coverSlides.length) % coverSlides.length;
    goToSlide(prevIdx, "prev");
  }, [currentSlide, goToSlide]);

  // Automatic slide rotation every 6.8 seconds (paused when user hovers or tab is hidden)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      handleNext();
    }, 6800);
    return () => clearInterval(interval);
  }, [handleNext, isHovered]);

  // Touch Swipe Handlers for Mobile (RTL-aware)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped left
        dir === "rtl" ? handlePrev() : handleNext();
      } else {
        // Swiped right
        dir === "rtl" ? handleNext() : handlePrev();
      }
    }
    touchStartX.current = null;
  };

  return (
    <section className={styles.heroContainer} aria-label="Juvenile Hero Showcase" style={heroStyleVars}>
      {/* ========================================================
          HERO CAROUSEL WITH CINEMATIC DIRECTION-AWARE TRANSITIONS
          ======================================================== */}
      <div
        className={`${styles.carouselCard} ${hasInteracted ? styles.carouselAnimated : ""}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Soft Lens Light Sweep Effect on Slide Change */}
        <div key={sweepKey} className={`${styles.lightSweep} ${styles.sweepActive}`} />

        {/* Slides */}
        {coverSlides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          const isLeaving = idx === prevSlide;

          let slideClass = styles.slideItem;
          if (isActive) {
            slideClass += ` ${styles.slideActive}`;
          } else if (isLeaving) {
            slideClass +=
              direction === "next"
                ? ` ${styles.slideLeavingToLeft}`
                : ` ${styles.slideLeavingToRight}`;
          } else {
            slideClass +=
              direction === "next"
                ? ` ${styles.slideEnteringFromRight}`
                : ` ${styles.slideEnteringFromLeft}`;
          }

          return (
            <Link
              key={slide.id}
              href={slide.link}
              className={slideClass}
              tabIndex={isActive ? 0 : -1}
              aria-label={`Banner ${idx + 1}`}
            >
              <div className={styles.bannerPictureWrap}>
                <picture className={styles.bannerPicture}>
                  {slide.mobileImageSrc && (
                    <source
                      media="(max-width: 768px)"
                      srcSet={slide.mobileImageSrc}
                      type="image/webp"
                    />
                  )}
                  {slide.mobileImageSrc && (
                    <source
                      media="(min-width: 769px)"
                      srcSet={slide.imageSrc}
                      type="image/webp"
                    />
                  )}
                  <img
                    src={slide.imageSrc}
                    alt={slide.titleAr || "Juvenile Perfume Banner"}
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={idx === 0 ? "high" : "auto"}
                    className={styles.bannerImage}
                  />
                </picture>
              </div>
            </Link>
          );
        })}

        {/* Floating Capsule Pagination (Exact Match to User Reference) */}
        <div
          className={styles.floatingCapsulePagination}
          aria-label="Carousel pagination"
          onClick={(e) => e.stopPropagation()}
        >
          {coverSlides.map((slide, idx) =>
            idx === currentSlide ? (
              <button
                key={slide.id}
                className={styles.capsulePillActive}
                onClick={(e) => {
                  e.preventDefault();
                  goToSlide(idx, idx > currentSlide ? "next" : "prev");
                }}
                aria-label={`العطر الحالي ${idx + 1}`}
              />
            ) : (
              <button
                key={slide.id}
                className={styles.capsuleDot}
                onClick={(e) => {
                  e.preventDefault();
                  goToSlide(idx, idx > currentSlide ? "next" : "prev");
                }}
                aria-label={`الانتقال إلى العطر ${idx + 1}`}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
};
