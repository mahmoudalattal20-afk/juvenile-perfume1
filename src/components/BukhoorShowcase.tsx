"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Check,
  Heart,
  ArrowUpRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartActions, useWishlist } from "@/context/CartContext";
import styles from "./BukhoorShowcase.module.css";

function toTitleCase(str: string): string {
  if (!str) return "";
  return str.replace(/\b([A-Za-z])([A-Za-z0-9]*)\b/g, (_, first, rest) => {
    return first.toUpperCase() + rest.toLowerCase();
  });
}

interface BukhoorItem {
  id: string;
  nameEn: string;
  nameAr: string;
  subEn: string;
  subAr: string;
  priceEn: string;
  priceAr: string;
  priceRaw: number;
  image: string;
  isSoldOut?: boolean;
}

const BUKHOOR_COLLECTION: BukhoorItem[] = [
  {
    id: "agarwood-rose",
    nameEn: "ROSE · SCENTED AGARWOOD",
    nameAr: "بخور العود المعطر بالورد",
    subEn: "Scented Agarwood",
    subAr: "عود مروكي معطر",
    priceEn: "LE 5,860.40",
    priceAr: "5,860.40 ج.م",
    priceRaw: 5860.4,
    image: "/products/agarwood-rose.png",
    isSoldOut: false,
  },
  {
    id: "agarwood-luban",
    nameEn: "LUBAN · SCENTED AGARWOOD",
    nameAr: "بخور العود المعطر باللبان",
    subEn: "Scented Agarwood",
    subAr: "لبان حوجري ملكي وعود",
    priceEn: "LE 5,860.40",
    priceAr: "5,860.40 ج.م",
    priceRaw: 5860.4,
    image: "/products/agarwood-luban.png",
    isSoldOut: false,
  },
  {
    id: "agarwood-anbar",
    nameEn: "ANBAR · SCENTED AGARWOOD",
    nameAr: "بخور العود المعطر بالعنبر",
    subEn: "Scented Agarwood",
    subAr: "عنبر ملكي وعود معتق",
    priceEn: "LE 5,860.40",
    priceAr: "5,860.40 ج.م",
    priceRaw: 5860.4,
    image: "/products/agarwood-anbar.png",
    isSoldOut: true,
  },
];

export const BukhoorShowcase: React.FC = React.memo(() => {
  const router = useRouter();
  const { locale, direction } = useLanguage();
  const isAr = locale === "ar";
  const { addToCart, addToWishlist, removeFromWishlist } = useCartActions();
  const { wishlistItems } = useWishlist();

  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [animatingIds, setAnimatingIds] = useState<Record<string, boolean>>({});
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    isDown: false,
    hasMoved: false,
    startX: 0,
    scrollLeft: 0,
    velocity: 0,
    lastX: 0,
    lastTime: 0,
    animFrame: 0,
  });

  const updateScrollButtons = () => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }
    const currentScroll = Math.abs(scrollLeft);
    setCanScrollPrev(currentScroll > 15);
    setCanScrollNext(currentScroll < maxScroll - 15);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => updateScrollButtons();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, []);

  const handleNav = (dir: "prev" | "next") => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 16
      : 320;
    const scrollAmount = dir === "next" ? cardWidth : -cardWidth;
    const sign = direction === "rtl" ? -1 : 1;
    el.scrollBy({ left: scrollAmount * sign, behavior: "smooth" });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = trackRef.current;
    if (!el) return;
    dragState.current.isDown = true;
    dragState.current.hasMoved = false;
    dragState.current.startX = e.pageX - el.offsetLeft;
    dragState.current.scrollLeft = el.scrollLeft;
    dragState.current.lastX = e.pageX;
    dragState.current.lastTime = performance.now();
    dragState.current.velocity = 0;
    cancelAnimationFrame(dragState.current.animFrame);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.current.isDown) return;
    const el = trackRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = x - dragState.current.startX;
    if (Math.abs(walk) > 4) {
      dragState.current.hasMoved = true;
    }
    const now = performance.now();
    const dt = Math.max(1, now - dragState.current.lastTime);
    const dx = e.pageX - dragState.current.lastX;
    dragState.current.velocity = dx / dt;
    dragState.current.lastX = e.pageX;
    dragState.current.lastTime = now;
    el.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const handleMouseUp = () => {
    if (!dragState.current.isDown) return;
    dragState.current.isDown = false;
    const el = trackRef.current;
    if (!el) return;

    const initialVelocity = dragState.current.velocity * 320;
    if (Math.abs(initialVelocity) > 40) {
      let vel = initialVelocity;
      const momentumStep = () => {
        if (Math.abs(vel) < 0.6) return;
        el.scrollLeft -= vel * 0.045;
        vel *= 0.91;
        dragState.current.animFrame = requestAnimationFrame(momentumStep);
      };
      dragState.current.animFrame = requestAnimationFrame(momentumStep);
    }
  };

  useEffect(() => {
    return () => cancelAnimationFrame(dragState.current.animFrame);
  }, []);

  // Touch tracking for mobile gestures
  const touchState = useRef({
    startX: 0,
    startY: 0,
    hasMoved: false,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!e.touches[0]) return;
    touchState.current.startX = e.touches[0].clientX;
    touchState.current.startY = e.touches[0].clientY;
    touchState.current.hasMoved = false;
    dragState.current.hasMoved = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!e.touches[0]) return;
    const dx = Math.abs(e.touches[0].clientX - touchState.current.startX);
    const dy = Math.abs(e.touches[0].clientY - touchState.current.startY);
    if (dx > 8 || dy > 8) {
      touchState.current.hasMoved = true;
      dragState.current.hasMoved = true;
    }
  };

  const handleTouchEnd = () => {
    if (touchState.current.hasMoved) {
      setTimeout(() => {
        touchState.current.hasMoved = false;
        dragState.current.hasMoved = false;
      }, 120);
    }
  };

  const handleCardClick = (id: string, e: React.MouseEvent) => {
    if (dragState.current.hasMoved || touchState.current.hasMoved) return;
    if ((e.target as HTMLElement).closest("button")) return;
    router.push(`/product/${id}`);
  };

  const toggleWishlist = (item: BukhoorItem, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const isWishlisted = wishlistItems.some((w) => w.id === item.id);
    if (isWishlisted) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist({
        id: item.id,
        name: isAr ? item.nameAr : item.nameEn,
        price: isAr ? item.priceAr : item.priceEn,
        image: item.image,
      });
    }
  };

  const handleAdd = (item: BukhoorItem, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (dragState.current.hasMoved || touchState.current.hasMoved || item.isSoldOut) return;

    setAnimatingIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAnimatingIds((prev) => ({ ...prev, [item.id]: false }));
    }, 550);

    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    addToCart({
      id: item.id,
      name: isAr ? item.nameAr : item.nameEn,
      type: isAr ? item.subAr : item.subEn,
      price: item.priceRaw,
      formattedPrice: isAr ? item.priceAr : item.priceEn,
      image: item.image,
    });

    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1800);
  };

  return (
    <section className={styles.section} id="bukhoor">
      {/* 1. Atmospheric Cinematic Mood Banner */}
      <div className={styles.bannerWrapper}>
        <Image
          src="/highlights/bukhoor-banner.jpg"
          alt={isAr ? "بخور وعود جوفينيل الفاخر" : "JUVENILE Scented Agarwood"}
          fill
          priority
          sizes="100vw"
          className={styles.bannerBg}
        />
        <div className={styles.bannerOverlay} />

        <div className={styles.bannerContent}>
          <h2 className={styles.bannerHeadline}>
            {isAr
              ? "حضورٌ مهيب. فخامة متناهية. أصالة خالدة."
              : "Commanding. Refined. Timeless."}
          </h2>
          <p className={styles.bannerSubtitle}>
            {isAr
              ? "تعبيرٌ راقٍ عن نقاء العود الطبيعي المعطر — صُمم ليعيد صياغة المكان، والهيبة، والطقوس الفاخرة."
              : "An elevated expression of pure oud — crafted to define space, presence, and ritual."}
          </p>
        </div>
      </div>

      {/* 2. Product Showcase Stage — 100% Matching OUR SIGNATURE PICKS */}
      <div className={styles.showcaseBody}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isAr ? "حضورٌ يُعيد صياغة المكان" : "PRESENCE, REDEFINED."}
          </h2>
          <p className={styles.subtitle}>
            {isAr
              ? "أرقى تشكيلات العود المعطر الطبيعي لتجربة استثنائية تأسر الحواس."
              : "An elevated expression of pure oud — crafted to define space, presence, and ritual."}
          </p>
        </div>

        {/* Carousel / Track identical to OurSelections */}
        <div className={styles.carouselWrapper}>
          {/* Floating Navigation Arrow — Prev */}
          <button
            type="button"
            className={`${styles.floatingNavBtn} ${styles.floatingNavPrev} ${
              canScrollPrev ? styles.floatingNavVisible : ""
            }`}
            onClick={() => handleNav("prev")}
            aria-label="Previous"
          >
            {direction === "rtl" ? (
              <ChevronRight size={18} strokeWidth={2.2} />
            ) : (
              <ChevronLeft size={18} strokeWidth={2.2} />
            )}
          </button>

          {/* Scrolling Track */}
          <div
            ref={trackRef}
            className={styles.track}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {BUKHOOR_COLLECTION.map((item) => {
              const isWishlisted = wishlistItems.some((w) => w.id === item.id);
              const isAdded = addedIds[item.id];
              const isAnimating = animatingIds[item.id];

              return (
                <div
                  key={item.id}
                  className={styles.card}
                  onClick={(e) => handleCardClick(item.id, e)}
                >
                  {/* Studio Presentation Stage */}
                  <div className={styles.imageContainer}>
                    {/* Floating Wishlist Button */}
                    <button
                      type="button"
                      className={`${styles.wishlistBtn} ${
                        isWishlisted ? styles.wishlistBtnActive : ""
                      }`}
                      onClick={(e) => toggleWishlist(item, e)}
                      aria-label={
                        isWishlisted
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      <Heart
                        size={15}
                        strokeWidth={1.8}
                        fill={isWishlisted ? "#cf142b" : "none"}
                      />
                    </button>

                    <Link
                      href={`/product/${item.id}`}
                      className={styles.imageLink}
                      onClick={(e) => {
                        if (dragState.current.hasMoved) e.preventDefault();
                      }}
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <div className={styles.bottleFloatWrap}>
                        <Image
                          src={item.image}
                          alt={isAr ? item.nameAr : item.nameEn}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1080px) 33vw, 25vw"
                          className={styles.productImage}
                          draggable={false}
                        />
                      </div>
                    </Link>

                    {item.isSoldOut && (
                      <div className={styles.soldOutBadge}>
                        <span>{isAr ? "نفدت" : "SOLD"}</span>
                        <span>{isAr ? "الكمية" : "OUT"}</span>
                      </div>
                    )}
                  </div>

                  {/* Modern 2026 Card Body */}
                  <div className={styles.infoBlock}>
                    <Link
                      href={`/product/${item.id}`}
                      className={styles.titleLink}
                      onClick={(e) => {
                        if (dragState.current.hasMoved) e.preventDefault();
                      }}
                    >
                      <h3 className={styles.productName}>
                        {isAr ? item.nameAr : toTitleCase(item.nameEn)}
                      </h3>
                    </Link>

                    {/* Price & Interactive CTA Row */}
                    <div className={styles.actionRow}>
                      <div className={styles.priceCol}>
                        <span className={styles.priceLabel}>
                          {direction === "rtl" ? "السعر" : "Price"}
                        </span>
                        <span className={styles.productPrice}>
                          {isAr ? item.priceAr : item.priceEn}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={item.isSoldOut}
                        onClick={(e) => handleAdd(item, e)}
                        className={`${styles.quickAddBtn} ${
                          isAdded ? styles.quickAddBtnSuccess : ""
                        } ${isAnimating ? styles.quickAddBtnAnimating : ""}`}
                        aria-label={`${isAr ? "إضافة للسلة" : "Add to Bag"} - ${
                          isAr ? item.nameAr : item.nameEn
                        }`}
                      >
                        <span className={styles.btnInner}>
                          {item.isSoldOut ? (
                            <span className={styles.btnText}>
                              {isAr ? "نفدت الكمية" : "Sold Out"}
                            </span>
                          ) : isAdded ? (
                            <span className={styles.btnSuccessWrap}>
                              <Check
                                size={13}
                                strokeWidth={2.4}
                                className={styles.btnIcon}
                              />
                              <span className={styles.btnText}>
                                {isAr ? "تمت الإضافة" : "Added to Bag"}
                              </span>
                            </span>
                          ) : (
                            <span className={styles.rollingContainer}>
                              <span className={styles.rollPrimary}>
                                <ShoppingBag
                                  size={13}
                                  strokeWidth={2}
                                  className={styles.btnIcon}
                                />
                                <span className={styles.btnText}>
                                  {isAr ? "إضافة للسلة" : "Add to Bag"}
                                </span>
                              </span>
                              <span
                                className={styles.rollSecondary}
                                aria-hidden="true"
                              >
                                <span className={styles.btnText}>
                                  {isAr ? "إضافة للسلة" : "Add to Bag"}
                                </span>
                                <ArrowUpRight
                                  size={13}
                                  strokeWidth={2.4}
                                  className={styles.arrowIcon}
                                />
                              </span>
                            </span>
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Navigation Arrow — Next */}
          <button
            type="button"
            className={`${styles.floatingNavBtn} ${styles.floatingNavNext} ${
              canScrollNext ? styles.floatingNavVisible : ""
            }`}
            onClick={() => handleNav("next")}
            aria-label="Next"
          >
            {direction === "rtl" ? (
              <ChevronLeft size={18} strokeWidth={2.2} />
            ) : (
              <ChevronRight size={18} strokeWidth={2.2} />
            )}
          </button>
        </div>
      </div>
    </section>
  );
});

BukhoorShowcase.displayName = "BukhoorShowcase";
