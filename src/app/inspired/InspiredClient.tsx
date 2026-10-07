"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShoppingBag, Check, X, Info, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useFlyAnimation } from "@/context/FlyAnimationContext";
import { InspiredPerfume } from "@/lib/cmsTypes";
import styles from "./Inspired.module.css";

interface InspiredClientProps {
  initialProducts: Record<string, InspiredPerfume>;
}

export const InspiredClient: React.FC<InspiredClientProps> = ({ initialProducts }) => {
  const { locale, direction } = useLanguage();
  const { addToCart } = useCart();
  const { triggerFlyAnimation } = useFlyAnimation();
  const [mounted, setMounted] = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState<InspiredPerfume | null>(null);
  const [modalSize, setModalSize] = useState<"50ml" | "100ml">("100ml");
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [cardSizes, setCardSizes] = useState<Record<string, "50ml" | "100ml">>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGender, setActiveGender] = useState<"all" | "men" | "women" | "unisex">("all");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const g = params.get("gender");
        if (g === "men" || g === "women" || g === "unisex") {
          setActiveGender(g);
        }
        const q = params.get("q");
        if (q) {
          setSearchQuery(q);
        }
        const selectId = params.get("select");
        if (selectId && initialProducts && initialProducts[selectId]) {
          setSelectedPerfume(initialProducts[selectId]);
        }
      } catch {
        // ignore url parsing error
      }
    }
  }, [initialProducts]);

  useEffect(() => {
    if (selectedPerfume) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPerfume]);

  const isAr = locale === "ar";

  const allItems = useMemo(() => {
    return Object.values(initialProducts || {});
  }, [initialProducts]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Gender filter
      if (activeGender !== "all" && item.gender && item.gender !== activeGender) {
        return false;
      }
      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = item.name.toLowerCase().includes(q);
      const arNameMatch = item.arabicName.toLowerCase().includes(q);
      const inspiredArMatch = (item.inspiredByAr || "").toLowerCase().includes(q);
      const inspiredEnMatch = (item.inspiredByEn || "").toLowerCase().includes(q);
      const descMatch = (item.descriptionAr || "").toLowerCase().includes(q);
      return nameMatch || arNameMatch || inspiredArMatch || inspiredEnMatch || descMatch;
    });
  }, [allItems, activeGender, searchQuery]);

  const genderCounts = useMemo(() => {
    return {
      all: allItems.length,
      men: allItems.filter((i) => i.gender === "men").length,
      women: allItems.filter((i) => i.gender === "women").length,
      unisex: allItems.filter((i) => i.gender === "unisex").length,
    };
  }, [allItems]);

  const handleSizeToggle = (perfumeId: string, size: "50ml" | "100ml", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCardSizes((prev) => ({ ...prev, [perfumeId]: size }));
  };

  const handleAddToCart = (perfume: InspiredPerfume, size: "50ml" | "100ml", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const price = size === "50ml" ? (perfume.price50ml || 650) : (perfume.price100ml || perfume.price || 950);
    const formattedPrice = size === "50ml"
      ? (isAr ? `${price} ج.م` : `${price} LE`)
      : (isAr ? `${price} ج.م` : `${price} LE`);
    const image = size === "50ml"
      ? (perfume.image50ml || "/products/50-ml.webp")
      : (perfume.image100ml || perfume.image || "/products/100ml.webp");
    const sizeLabel = size === "50ml" ? (isAr ? "50 مل" : "50ml") : (isAr ? "100 مل" : "100ml");
    const prodTitle = isAr ? perfume.arabicName : perfume.name;

    // Trigger luxury flight animation directly from button
    const btnEl = (e?.currentTarget as HTMLElement) || null;

    triggerFlyAnimation({
      startElement: btnEl,
      image,
      type: "cart",
      title: prodTitle,
      subtitle: `${isAr ? "الحجم:" : "Size:"} ${sizeLabel} • ${formattedPrice}`,
    });

    addToCart(
      {
        id: `${perfume.id}-${size}`,
        name: `${prodTitle} (${sizeLabel})`,
        type: isAr ? `عطر مستوحى من ${perfume.inspiredByAr}` : `Inspired by ${perfume.inspiredByEn}`,
        price: price,
        formattedPrice: formattedPrice,
        image: image,
      },
      false
    );

    const actionKey = `${perfume.id}-${size}`;
    setAddedIds((prev) => ({ ...prev, [actionKey]: true, [perfume.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [actionKey]: false, [perfume.id]: false }));
    }, 2000);
  };

  const openQuickView = (perfume: InspiredPerfume) => {
    const currentCardSize = cardSizes[perfume.id] || "100ml";
    setModalSize(currentCardSize);
    setSelectedPerfume(perfume);
  };

  return (
    <div className={styles.pageWrapper} dir={direction}>
      {/* =========================================================
          1. HERO LUXURY STAGE
          ========================================================= */}
      <section className={styles.heroSection}>
        <div className={styles.heroGlow} />

        <h1 className={styles.heroTitle}>
          {isAr ? "روائع العطور العالمية بأيدي جوفينيل" : "JUVENILE INSPIRED COLLECTION"}
        </h1>

        <p className={styles.heroSubtitle}>
          {isAr
            ? "نقدم لكم بدائل نيش فائقة الدقة لأيقونات العطور العالمية، مصاغة بنقاء زيوت غراس الفرنسية بتركيز Extrait de Parfum وثبات يتجاوز 24 ساعة."
            : "Masterfully formulated interpretations of world-renowned icons, elevated with pure Grasse essences at Extrait de Parfum concentration."}
        </p>
      </section>

      {/* =========================================================
          2. SEARCH & CONTROLS BAR
          ========================================================= */}
      <div className={styles.filterControls}>
        <div className={styles.searchCard}>
          <div className={styles.searchIconWrapper}>
            <Search size={18} />
          </div>
          <input
            type="text"
            className={styles.searchInputField}
            placeholder={isAr ? "ابحث بالاسم أو العطر المستوحى منه (مثال: ديور، سوفاج، انفكتوس، توباكو)..." : "Search by perfume name or brand inspiration (e.g. Dior, Sauvage, Invictus)..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={{ background: "none", border: "none", color: "#a8a29e", cursor: "pointer", display: "flex" }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className={styles.filterPillsRow}>
          <button
            type="button"
            className={`${styles.filterPill} ${activeGender === "all" ? styles.filterPillActive : ""}`}
            onClick={() => setActiveGender("all")}
          >
            <span>{isAr ? "جميع العطور" : "All Fragrances"}</span>
            <span className={styles.filterPillCount}>{genderCounts.all}</span>
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${activeGender === "men" ? styles.filterPillActive : ""}`}
            onClick={() => setActiveGender("men")}
          >
            <span>{isAr ? "رجالي" : "Men"}</span>
            <span className={styles.filterPillCount}>{genderCounts.men}</span>
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${activeGender === "women" ? styles.filterPillActive : ""}`}
            onClick={() => setActiveGender("women")}
          >
            <span>{isAr ? "نسائي" : "Women"}</span>
            <span className={styles.filterPillCount}>{genderCounts.women}</span>
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${activeGender === "unisex" ? styles.filterPillActive : ""}`}
            onClick={() => setActiveGender("unisex")}
          >
            <span>{isAr ? "للجنسين" : "Unisex"}</span>
            <span className={styles.filterPillCount}>{genderCounts.unisex}</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          3. BOTTLES CATALOG
          ========================================================= */}
      <main className={styles.catalogContainer}>
        {filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <Info size={36} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>
              {isAr ? "لا توجد نتائج تطابق بحثك" : "No matching fragrances found"}
            </h3>
            <p style={{ fontSize: 13, color: "#78716c", margin: 0 }}>
              {isAr ? "جرب البحث باسم عطر آخر أو استعرض التصنيفات بالأعلى." : "Try searching with a different term or browse categories above."}
            </p>
          </div>
        ) : (
          <div className={styles.bottlesGrid}>
            {filteredItems.map((perfume, idx) => {
              const currentSize = cardSizes[perfume.id] || "100ml";
              const currentPrice = currentSize === "50ml" ? (perfume.price50ml || 650) : (perfume.price100ml || perfume.price || 950);
              const currentImg = currentSize === "50ml"
                ? (perfume.image50ml || "/products/50-ml.webp")
                : (perfume.image100ml || perfume.image || "/products/100ml.webp");
              const isAdded = Boolean(addedIds[`${perfume.id}-${currentSize}`] || addedIds[perfume.id]);

              return (
                <div
                  key={perfume.id}
                  className={styles.bottleCard}
                  onClick={() => openQuickView(perfume)}
                >
                  {/* Studio Visual Stage */}
                  <div className={styles.cardStage}>
                    <div className={styles.bottleFloatWrap}>
                      <Image
                        src={currentImg}
                        alt={isAr ? perfume.arabicName : perfume.name}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 260px"
                        className={styles.bottleImg}
                        priority={idx < 6}
                        unoptimized
                      />
                    </div>
                  </div>

                  {/* Information Details */}
                  <div className={styles.cardContent}>
                    <div>
                      <h3 className={styles.cardPerfumeName}>
                        {isAr ? perfume.arabicName : perfume.name}
                      </h3>
                      <div className={styles.cardPerfumeSub}>
                        {isAr ? perfume.name : perfume.arabicName}
                      </div>
                    </div>

                    <p className={styles.cardDescription}>
                      {isAr
                        ? perfume.descriptionAr || "عطر فاخر بثبات عالي وفوحان آسر مصاغ بزيوت فرنسية نقية."
                        : perfume.descriptionEn || "Luxury bespoke fragrance with lasting sillage crafted with pure French oils."}
                    </p>

                    {/* Size Selector Switch */}
                    <div className={styles.sizeSelectorRow} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className={`${styles.sizeBtn} ${currentSize === "50ml" ? styles.sizeBtnActive : ""}`}
                        onClick={(e) => handleSizeToggle(perfume.id, "50ml", e)}
                      >
                        <span>{isAr ? "50 مل" : "50ml"}</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.sizeBtn} ${currentSize === "100ml" ? styles.sizeBtnActive : ""}`}
                        onClick={(e) => handleSizeToggle(perfume.id, "100ml", e)}
                      >
                        <span>{isAr ? "100 مل" : "100ml"}</span>
                      </button>
                    </div>

                    {/* Card Footer with Price & Quick Buy */}
                    <div className={styles.cardFooter}>
                      <div className={styles.priceCol}>
                        <span className={styles.currentPrice}>
                          {currentPrice.toLocaleString("en-US")} {isAr ? "ج.م" : "LE"}
                        </span>
                      </div>

                      <button
                        type="button"
                        className={`${styles.addToCartBtn} ${isAdded ? styles.addToCartBtnSuccess : ""}`}
                        onClick={(e) => handleAddToCart(perfume, currentSize, e)}
                        aria-label={isAr ? "إضافة للسلة" : "Add to Cart"}
                      >
                        {isAdded ? (
                          <>
                            <Check size={14} />
                            <span>{isAr ? "تم" : "Added"}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={14} />
                            <span>{isAr ? "طلب" : "Order"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* =========================================================
          4. QUICK VIEW DETAIL MODAL (PORTAL TO BODY)
          ========================================================= */}
      {mounted && selectedPerfume && createPortal(
        <div className={styles.modalBackdrop} onClick={() => setSelectedPerfume(null)} dir={direction}>
          <div className={styles.modalWindow} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => setSelectedPerfume(null)}
              aria-label="Close"
            >
              <X size={17} />
            </button>

            {/* Modal Stage Image */}
            <div className={styles.modalStage}>
              <div style={{ position: "relative", width: "100%", height: "260px" }}>
                <Image
                  src={modalSize === "50ml" ? (selectedPerfume.image50ml || "/products/50-ml.webp") : (selectedPerfume.image100ml || selectedPerfume.image || "/products/100ml.webp")}
                  alt={isAr ? selectedPerfume.arabicName : selectedPerfume.name}
                  fill
                  sizes="260px"
                  style={{ objectFit: "contain" }}
                  unoptimized
                />
              </div>
            </div>

            {/* Modal Content */}
            <div className={styles.modalDetails}>
              <div className={styles.modalTitle}>
                {isAr ? selectedPerfume.arabicName : selectedPerfume.name}
              </div>
              <div style={{ fontSize: 13, color: "#78716c", marginBottom: 14 }}>
                {isAr ? selectedPerfume.name : selectedPerfume.arabicName} • {modalSize === "50ml" ? (isAr ? "50 مل" : "50ml") : (isAr ? "100 مل" : "100ml")} •{" "}
                {isAr
                  ? selectedPerfume.concentrationAr || "خلاصة عطر نقي مركز"
                  : selectedPerfume.concentrationEn || "Extrait de Parfum"}
              </div>

              <p style={{ fontSize: 13.5, color: "#44403c", lineHeight: 1.6, marginBottom: 16 }}>
                {isAr
                  ? selectedPerfume.descriptionAr || "عطر فاخر مصاغ بدقة واحترافية فائقة بزيوت فرنسية نقية."
                  : selectedPerfume.descriptionEn || "Luxury formulation designed with exceptional care using pure French oils."}
              </p>

              {/* Modal Size Selector */}
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1c1917", display: "block", marginBottom: 8 }}>
                  {isAr ? "اختر حجم الزجاجة:" : "Select Bottle Size:"}
                </span>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className={`${styles.sizeBtn} ${modalSize === "50ml" ? styles.sizeBtnActive : ""}`}
                    style={{ padding: "8px 16px", fontSize: 13, display: "inline-flex", gap: 6, alignItems: "center" }}
                    onClick={() => setModalSize("50ml")}
                  >
                    <span>{isAr ? "50 مل" : "50ml"}</span>
                    <span style={{ fontWeight: 700, opacity: 0.9 }}>
                      ({(selectedPerfume.price50ml || 650).toLocaleString("en-US")} {isAr ? "ج.م" : "LE"})
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.sizeBtn} ${modalSize === "100ml" ? styles.sizeBtnActive : ""}`}
                    style={{ padding: "8px 16px", fontSize: 13, display: "inline-flex", gap: 6, alignItems: "center" }}
                    onClick={() => setModalSize("100ml")}
                  >
                    <span>{isAr ? "100 مل" : "100ml"}</span>
                    <span style={{ fontWeight: 700, opacity: 0.9 }}>
                      ({(selectedPerfume.price100ml || selectedPerfume.price || 950).toLocaleString("en-US")} {isAr ? "ج.م" : "LE"})
                    </span>
                  </button>
                </div>
              </div>

              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#0750cd" }}>
                    {(modalSize === "50ml"
                      ? (selectedPerfume.price50ml || 650)
                      : (selectedPerfume.price100ml || selectedPerfume.price || 950)
                    ).toLocaleString("en-US")}{" "}
                    {isAr ? "ج.م" : "LE"}
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.addToCartBtn}
                  style={{ padding: "12px 24px", fontSize: 14 }}
                  onClick={() => {
                    handleAddToCart(selectedPerfume, modalSize);
                    setSelectedPerfume(null);
                  }}
                >
                  <ShoppingBag size={16} />
                  <span>{isAr ? "إضافة إلى السلة" : "Add to Cart"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

