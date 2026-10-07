"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Globe, Headset, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./BrandGuarantees.module.css";

interface GuaranteeItem {
  id: string;
  number: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  tag: { ar: string; en: string };
  title: { ar: string; en: string };
  desc: { ar: string; en: string };
  detail: { ar: string; en: string };
}

const guarantees: GuaranteeItem[] = [
  {
    id: "delivery",
    number: "01",
    icon: Globe,
    tag: {
      ar: "شحن فائق العناية",
      en: "GLOBAL DISPATCH",
    },
    title: {
      ar: "توصيل عالمي وسريع",
      en: "Worldwide & Express Delivery",
    },
    desc: {
      ar: "استلم عطرك في أي مكان بالعالم مع شحن سريع وتغليف آمن ومحمي يحافظ على نقاء وثبات الخلاصات العطرية.",
      en: "Receive your fragrance anywhere in the world with expedited shipping and protective packaging.",
    },
    detail: {
      ar: "تتبع مباشر للطلب • شحن البريد المصري",
      en: "Real-time Tracking • Egypt Post Express",
    },
  },
  {
    id: "concierge",
    number: "02",
    icon: Headset,
    tag: {
      ar: "كونسيرج العطور",
      en: "MAISON CONCIERGE",
    },
    title: {
      ar: "خدمة عملاء واستشارات خاصة",
      en: "Dedicated Fragrance Concierge",
    },
    desc: {
      ar: "مستشارون متخصصون في عالم العطور متواجدون لمساعدتكم في انتقاء عطرك الاستثنائي والإجابة على استفساراتكم.",
      en: "Expert olfactory consultants available to assist your personal selections and answer inquiries.",
    },
    detail: {
      ar: "استشارة عطرية مخصصة • استجابة فورية",
      en: "Bespoke Guidance • Instant Response",
    },
  },
  {
    id: "payment",
    number: "03",
    icon: ShieldCheck,
    tag: {
      ar: "أمان بنكي معتمد",
      en: "CERTIFIED CHECKOUT",
    },
    title: {
      ar: "دفع آمن ومحمي بالكامل",
      en: "100% Encrypted & Safe Payment",
    },
    desc: {
      ar: "تتم معالجة معلومات الدفع بأحدث بروتوكولات التشفير البنكي المعتمدة لضمان سرية وسلامة بياناتك 100%.",
      en: "All transactions are processed through bank-grade encryption protocols for absolute privacy and peace of mind.",
    },
    detail: {
      ar: "تشفير SSL 256-Bit • خيارات دفع متعددة",
      en: "256-Bit SSL • Multiple Gateways",
    },
  },
];

// خيارات التحكم في إظهار أو إخفاء عناصر القسم
const SHOW_HEADER_EYEBROW = false; // "ميثاق دار جوفينيل • التزامنا تجاهكم"
const SHOW_PILLAR_TAGS = false;    // "01 شحن فائق العناية / 02 كونسيرج العطور / 03 أمان بنكي معتمد"
const SHOW_BOTTOM_BADGES = false;  // "تتبع مباشر... / استشارة عطرية... / تشفير SSL..."

export const BrandGuarantees: React.FC = () => {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isInView, setIsInView] = useState(false);

  // Observe if BrandGuarantees section is actually visible in the viewport
  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  // Smooth scroll specifically the horizontal track to card by index (without vertical window jumping)
  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    const card = cardRefs.current[index];
    if (track && card) {
      const trackRect = track.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const scrollOffset =
        cardRect.left - trackRect.left - (track.clientWidth - card.clientWidth) / 2;

      track.scrollBy({
        left: scrollOffset,
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  }, []);

  const scrollRaf = useRef<number | null>(null);

  // Detect active card on manual swipe/scroll (throttled via requestAnimationFrame)
  const handleScroll = useCallback(() => {
    if (scrollRaf.current) return;
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = null;
      const track = trackRef.current;
      if (!track) return;

      const containerRect = track.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      let closestIdx = 0;
      let minDistance = Infinity;

      cardRefs.current.forEach((card, idx) => {
        if (!card) return;
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(containerCenter - cardCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = idx;
        }
      });

      setActiveIndex((prev) => (prev === closestIdx ? prev : closestIdx));
    });
  }, []);

  // Auto-flip slider for mobile screens ONLY when in viewport, tab is visible, and not paused
  useEffect(() => {
    if (isPaused || !isInView) return;

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (typeof window !== "undefined" && window.innerWidth > 820) return;

      setActiveIndex((prev) => {
        const next = (prev + 1) % guarantees.length;
        const track = trackRef.current;
        const card = cardRefs.current[next];
        if (track && card) {
          const trackRect = track.getBoundingClientRect();
          const cardRect = card.getBoundingClientRect();
          const scrollOffset =
            cardRect.left - trackRect.left - (track.clientWidth - card.clientWidth) / 2;

          track.scrollBy({
            left: scrollOffset,
            behavior: "smooth",
          });
        }
        return next;
      });
    }, 4500);

    return () => {
      clearInterval(interval);
      if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
    };
  }, [isPaused, isInView]);

  // Pause on user touch, resume after a gentle delay
  const handleTouchStart = () => {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4500);
  };

  return (
    <section
      className={styles.section}
      aria-label={isAr ? "ميثاق وخدمات جوفينيل الفاخرة" : "JUVENILE Luxury Services"}
    >
      <div className={styles.container}>
        {/* Subtle Calm Editorial Eyebrow */}
        {SHOW_HEADER_EYEBROW && (
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>
              <span className={styles.eyebrowDot} />
              {isAr ? "ميثاق دار جوفينيل • التزامنا تجاهكم" : "MAISON JUVENILE COMMITMENTS"}
            </span>
          </div>
        )}

        {/* 3 Architectural Pillars (Grid on Desktop, Smooth Auto-flipping Carousel on Mobile) */}
        <div
          ref={trackRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className={styles.grid}
        >
          {guarantees.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeIndex === idx;

            return (
              <div
                key={item.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                className={`${styles.pillar} ${
                  isActive ? styles.pillarActive : ""
                }`}
              >
                {/* Top Number & Tag Line */}
                {SHOW_PILLAR_TAGS && (
                  <div className={styles.pillarMeta}>
                    <span className={styles.pillarNumber}>{item.number}</span>
                    <span className={styles.pillarTag}>{item.tag[isAr ? "ar" : "en"]}</span>
                  </div>
                )}

                {/* Refined Icon Emblem */}
                <div className={styles.iconEmblem}>
                  <Icon size={18} strokeWidth={1.3} className={styles.icon} />
                </div>

                {/* Pillar Title & Editorial Description */}
                <h3 className={styles.pillarTitle}>
                  {item.title[isAr ? "ar" : "en"]}
                </h3>

                <p className={styles.pillarDesc}>
                  {item.desc[isAr ? "ar" : "en"]}
                </p>

                {/* Micro Assurance Badge */}
                {SHOW_BOTTOM_BADGES && (
                  <div className={styles.pillarBadge}>
                    <span className={styles.badgeText}>
                      {item.detail[isAr ? "ar" : "en"]}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Luxury Mobile Pagination Indicators (Dots/Capsules) */}
        <div className={styles.mobilePagination} aria-hidden="true">
          {guarantees.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              className={`${styles.pageDot} ${
                activeIndex === idx ? styles.pageDotActive : ""
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
