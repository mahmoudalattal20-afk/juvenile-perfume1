"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  X,
  ShoppingBag,
  Check,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Heart,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartActions, useWishlist } from "@/context/CartContext";
import { useFlyAnimation } from "@/context/FlyAnimationContext";
import { useCMS } from "@/context/CMSContext";
import {
  InspiredPerfume,
  DEFAULT_FEATURED_INSPIRED_PRODUCT_IDS,
} from "@/lib/cmsTypes";
import styles from "./InspiredShowcase.module.css";

interface InspiredShowcaseProps {
  onAddToCart?: () => void;
}

export const InspiredShowcase: React.FC<InspiredShowcaseProps> = React.memo(
  ({ onAddToCart }) => {
    const { locale, direction } = useLanguage();
    const { cmsData } = useCMS();
    const { addToCart, addToWishlist, removeFromWishlist } = useCartActions();
    const { wishlistItems } = useWishlist();
    const { triggerFlyAnimation } = useFlyAnimation();

    const isAr = locale === "ar";
    const isRtl = direction === "rtl";

    const [searchQuery, setSearchQuery] = useState("");
    const [activeGender, setActiveGender] = useState<"all" | "men" | "women" | "unisex">("all");
    const [cardSizes, setCardSizes] = useState<Record<string, "50ml" | "100ml">>({});
    const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

    // All inspired items from CMS
    const allInspiredItems = useMemo<InspiredPerfume[]>(() => {
      const prods = cmsData.inspiredProducts;
      if (!prods || typeof prods !== "object") return [];
      return Object.values(prods);
    }, [cmsData.inspiredProducts]);

    // Featured 6 inspired product IDs configured by Admin
    const featuredIds = useMemo<string[]>(() => {
      if (
        Array.isArray(cmsData.featuredInspiredProductIds) &&
        cmsData.featuredInspiredProductIds.length > 0
      ) {
        return cmsData.featuredInspiredProductIds;
      }
      return DEFAULT_FEATURED_INSPIRED_PRODUCT_IDS;
    }, [cmsData.featuredInspiredProductIds]);

    // Featured 6 items list
    const featuredItems = useMemo<InspiredPerfume[]>(() => {
      const map: Record<string, InspiredPerfume> = {};
      for (const p of allInspiredItems) {
        map[p.id] = p;
      }

      const res: InspiredPerfume[] = [];
      for (const id of featuredIds) {
        if (map[id]) {
          res.push(map[id]);
        }
      }

      // If less than 4 found from custom IDs, fill up with top available
      if (res.length < 4) {
        for (const p of allInspiredItems) {
          if (!res.some((item) => item.id === p.id)) {
            res.push(p);
            if (res.length >= 4) break;
          }
        }
      }

      return res;
    }, [allInspiredItems, featuredIds]);

    // Filter by search & gender
    const isSearching = searchQuery.trim().length > 0 || activeGender !== "all";

    const filteredMatches = useMemo<InspiredPerfume[]>(() => {
      if (!isSearching) {
        return featuredItems;
      }

      const q = searchQuery.toLowerCase().trim();
      return allInspiredItems.filter((item) => {
        if (activeGender !== "all" && item.gender && item.gender !== activeGender) {
          return false;
        }
        if (!q) return true;

        const nameMatch = (item.name || "").toLowerCase().includes(q);
        const arNameMatch = (item.arabicName || "").toLowerCase().includes(q);
        const inspiredArMatch = (item.inspiredByAr || "").toLowerCase().includes(q);
        const inspiredEnMatch = (item.inspiredByEn || "").toLowerCase().includes(q);
        const descMatch = (item.descriptionAr || "").toLowerCase().includes(q);

        return nameMatch || arNameMatch || inspiredArMatch || inspiredEnMatch || descMatch;
      });
    }, [isSearching, featuredItems, allInspiredItems, searchQuery, activeGender]);

    // Exactly 4 products displayed on homepage showcase (single row of 4 on desktop)
    const displayProducts = useMemo<InspiredPerfume[]>(() => {
      return filteredMatches.slice(0, 4);
    }, [filteredMatches]);

    const totalMatchesCount = filteredMatches.length;
    const remainingCount = Math.max(0, totalMatchesCount - displayProducts.length);

    // Compute explore URL and labels
    const exploreTarget = useMemo(() => {
      if (searchQuery.trim()) {
        return {
          href: `/inspired?q=${encodeURIComponent(searchQuery.trim())}`,
          labelAr: `استكشاف جميع نتائج البحث (${totalMatchesCount} عطر)`,
          labelEn: `Explore all search results (${totalMatchesCount} scents)`,
        };
      }
      if (activeGender === "women") {
        return {
          href: "/inspired?gender=women",
          labelAr: `استكشاف جميع العطور النسائية (${totalMatchesCount} عطر)`,
          labelEn: `Explore all Women fragrances (${totalMatchesCount} scents)`,
        };
      }
      if (activeGender === "men") {
        return {
          href: "/inspired?gender=men",
          labelAr: `استكشاف جميع العطور الرجالية (${totalMatchesCount} عطر)`,
          labelEn: `Explore all Men fragrances (${totalMatchesCount} scents)`,
        };
      }
      if (activeGender === "unisex") {
        return {
          href: "/inspired?gender=unisex",
          labelAr: `استكشاف جميع عطور الجنسين (${totalMatchesCount} عطر)`,
          labelEn: `Explore all Unisex fragrances (${totalMatchesCount} scents)`,
        };
      }
      return {
        href: "/inspired",
        labelAr: `استكشاف كافة العطور المستوحاة بالكامل (+${allInspiredItems.length || 100} عطر)`,
        labelEn: `Explore all +${allInspiredItems.length || 100} inspired fragrances`,
      };
    }, [searchQuery, activeGender, totalMatchesCount, allInspiredItems.length]);

    // Size toggle
    const handleSizeSelect = useCallback((id: string, size: "50ml" | "100ml", e: React.MouseEvent) => {
      e.stopPropagation();
      setCardSizes((prev) => ({ ...prev, [id]: size }));
    }, []);

    // Add to cart
    const handleAddToCart = useCallback(
      (perfume: InspiredPerfume, e: React.MouseEvent) => {
        e.stopPropagation();
        const selectedSize = cardSizes[perfume.id] || "100ml";

        const price =
          selectedSize === "50ml"
            ? perfume.price50ml || 650
            : perfume.price100ml || perfume.price || 950;

        const formattedPrice =
          selectedSize === "50ml"
            ? isAr
              ? `${price} ج.م`
              : `${price} LE`
            : isAr
            ? `${price} ج.م`
            : `${price} LE`;

        const image =
          selectedSize === "50ml"
            ? perfume.image50ml || "/products/50-ml.webp"
            : perfume.image100ml || perfume.image || "/products/100ml.webp";

        const sizeLabel = selectedSize === "50ml" ? (isAr ? "50 مل" : "50ml") : isAr ? "100 مل" : "100ml";
        const cartItemId = `${perfume.id}-${selectedSize}`;
        const prodTitle = isAr ? perfume.arabicName : perfume.name;

        // Trigger luxury fly-to-cart animation directly emerging from the clicked button
        const buttonEl = e.currentTarget as HTMLElement;

        triggerFlyAnimation({
          startElement: buttonEl,
          image,
          type: "cart",
          title: prodTitle,
          subtitle: `${isAr ? "الحجم:" : "Size:"} ${sizeLabel} • ${formattedPrice}`,
        });

        // Add to cart without auto-opening drawer
        addToCart(
          {
            id: cartItemId,
            name: `${prodTitle} (${sizeLabel})`,
            type: isAr
              ? `عطر مستوحى من ${perfume.inspiredByAr}`
              : `Inspired by ${perfume.inspiredByEn}`,
            price,
            formattedPrice,
            image,
          },
          false
        );

        if (onAddToCart) onAddToCart();

        setAddedIds((prev) => ({ ...prev, [cartItemId]: true }));
        setTimeout(() => {
          setAddedIds((prev) => ({ ...prev, [cartItemId]: false }));
        }, 1800);
      },
      [cardSizes, isAr, addToCart, onAddToCart, triggerFlyAnimation]
    );

    const handleToggleWishlist = useCallback(
      (item: InspiredPerfume, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const isWishlisted = wishlistItems.some((w) => w.id === item.id);
        const prodTitle = isAr ? item.arabicName : item.name;
        const prodImg = item.image100ml || item.image || "/products/100ml.webp";

        if (isWishlisted) {
          removeFromWishlist(item.id);
        } else {
          const heartBtn = e.currentTarget as HTMLElement;
          const cardEl = heartBtn.closest(`.${styles.card}`) as HTMLElement | null;
          const bottleImgEl = cardEl?.querySelector(`.${styles.bottleImg}`) as HTMLElement | null;

          triggerFlyAnimation({
            startElement: bottleImgEl || heartBtn,
            image: prodImg,
            type: "wishlist",
            title: prodTitle,
          });

          addToWishlist({
            id: item.id,
            name: prodTitle,
            price: isAr
              ? `${item.price100ml || item.price || 950} ج.م`
              : `${item.price100ml || item.price || 950} LE`,
            image: prodImg,
          });
        }
      },
      [wishlistItems, removeFromWishlist, addToWishlist, isAr, triggerFlyAnimation]
    );

    const handleClearSearch = useCallback(() => {
      setSearchQuery("");
      setActiveGender("all");
    }, []);

    return (
      <section
        id="inspired-showcase"
        className={styles.section}
        dir={direction}
        aria-label={isAr ? "عطور أيقونية بتوقيع جيفونيل" : "Iconic Fragrances. The JUVENILE Signature."}
      >
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <h2
              className={styles.title}
              style={isAr ? { fontFamily: "var(--font-readex), 'Readex Pro', sans-serif" } : undefined}
            >
              {isAr ? "عطور أيقونية بتوقيع جيفونيل" : "Iconic Fragrances. The JUVENILE Signature."}
            </h2>
            <p
              className={styles.subtitle}
              style={isAr ? { fontFamily: "var(--font-readex), 'Readex Pro', sans-serif" } : undefined}
            >
              {isAr
                ? "اكتشف عطور جيفونيل المستوحاة من أشهر العطور العالمية بثبات يصل إلى 24 ساعة."
                : "Discover JUVENILE fragrances inspired by some of the world’s most iconic scents, with lasting performance for up to 24 hours."}
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className={styles.controlsWrapper}>
            <div className={styles.searchBarWrap}>
              <span className={`${styles.searchIcon} ${isRtl ? styles.searchIconRtl : styles.searchIconLtr}`}>
                <Search size={17} />
              </span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={
                  isAr
                    ? "دور باسم العطر… مثال: سوفاج، ليبر، باكارا روج"
                    : "Search by fragrance name… e.g. Sauvage, Libre, Baccarat Rouge"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {(searchQuery || activeGender !== "all") && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className={`${styles.clearSearchBtn} ${isRtl ? styles.clearSearchBtnRtl : styles.clearSearchBtnLtr}`}
                  title={isAr ? "مسح البحث" : "Clear search"}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className={styles.filterChips}>
              <button
                type="button"
                className={`${styles.chipBtn} ${activeGender === "all" ? styles.chipBtnActive : ""}`}
                onClick={() => setActiveGender("all")}
              >
                <span>{isAr ? "الكل" : "All"}</span>
              </button>
              <button
                type="button"
                className={`${styles.chipBtn} ${activeGender === "men" ? styles.chipBtnActive : ""}`}
                onClick={() => setActiveGender("men")}
              >
                <span>{isAr ? "رجالي" : "Men"}</span>
              </button>
              <button
                type="button"
                className={`${styles.chipBtn} ${activeGender === "women" ? styles.chipBtnActive : ""}`}
                onClick={() => setActiveGender("women")}
              >
                <span>{isAr ? "نسائي" : "Women"}</span>
              </button>
              <button
                type="button"
                className={`${styles.chipBtn} ${activeGender === "unisex" ? styles.chipBtnActive : ""}`}
                onClick={() => setActiveGender("unisex")}
              >
                <span>{isAr ? "للجميع" : "Unisex"}</span>
              </button>
            </div>

            {/* Results Meta */}
            {isSearching && (
              <div className={styles.resultsMetaBar}>
                <span>
                  {isAr ? "المعروض الآن:" : "Showing:"}{" "}
                  <strong className={styles.resultsCountHighlight}>
                    {displayProducts.length} {isAr ? `من أصل ${totalMatchesCount} عطر` : `of ${totalMatchesCount} scents`}
                  </strong>
                </span>
                <Link href={exploreTarget.href} className={styles.viewAllLink}>
                  <span>{isAr ? `استكشاف الكل (${totalMatchesCount})` : `Explore all (${totalMatchesCount})`}</span>
                  {isRtl ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
                </Link>
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className={styles.productsGrid}>
            {displayProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>
                  {isAr ? "لم نجد عطراً مطابقاً للبحث" : "No matching scents found"}
                </h3>
                <p className={styles.emptyText}>
                  {isAr
                    ? "جرّب البحث باسم آخر أو تصفح الكتالوج الكامل للعطور المستوحاة."
                    : "Try a different search query or explore our full inspired catalog."}
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                  <button type="button" onClick={handleClearSearch} className={styles.resetBtn}>
                    {isAr ? "إعادة تعيين" : "Reset"}
                  </button>
                  <Link href="/inspired" className={styles.resetBtn} style={{ background: "#475569" }}>
                    {isAr ? "تصفح كافة العطور (+100)" : "Browse All (+100)"}
                  </Link>
                </div>
              </div>
            ) : (
              displayProducts.map((item, idx) => {
                const currentSize = cardSizes[item.id] || "100ml";
                const price50 = item.price50ml || 650;
                const price100 = item.price100ml || item.price || 950;
                const currentPrice = currentSize === "50ml" ? price50 : price100;
                const currentFormattedPrice = isAr ? `${currentPrice} ج.م` : `${currentPrice} LE`;
                const cartKey = `${item.id}-${currentSize}`;
                const isItemAdded = !!addedIds[cartKey];
                const isWishlisted = wishlistItems.some((w) => w.id === item.id);
                const description = isAr ? item.descriptionAr : item.descriptionEn;

                const currentImage =
                  currentSize === "50ml"
                    ? item.image50ml || "/products/50-ml.webp"
                    : item.image100ml || item.image || "/products/100ml.webp";

                const subtitle = isAr
                  ? item.inspiredByAr
                    ? `مستوحى من: ${item.inspiredByAr}`
                    : item.gender === "women"
                    ? "مجموعة العطور النسائية"
                    : item.gender === "men"
                    ? "مجموعة العطور الرجالية"
                    : "مجموعة العطور الفاخرة"
                  : item.inspiredByEn
                  ? `Inspired by ${item.inspiredByEn}`
                  : "Luxury Inspired Collection";

                return (
                  <div key={`${item.id}-${idx}`} className={styles.card}>
                    {/* Studio Presentation Stage */}
                    <div className={styles.imageContainer}>
                      {/* Floating Wishlist Heart Button */}
                      <button
                        type="button"
                        className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistBtnActive : ""}`}
                        onClick={(e) => handleToggleWishlist(item, e)}
                        aria-label={isWishlisted ? (isAr ? "إزالة من المفضلة" : "Remove from wishlist") : (isAr ? "إضافة للمفضلة" : "Add to wishlist")}
                      >
                        <Heart
                          size={15}
                          strokeWidth={1.8}
                          fill={isWishlisted ? "#cf142b" : "none"}
                          color={isWishlisted ? "#cf142b" : "#475569"}
                        />
                      </button>

                      <Link href={`/inspired?select=${item.id}`} className={styles.imageLink}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          key={`${item.id}-${currentSize}`}
                          src={currentImage}
                          alt={isAr ? item.arabicName : item.name}
                          className={`${styles.bottleImg} ${styles.bottleImgAnimate}`}
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/products/100ml.webp";
                          }}
                        />
                      </Link>
                    </div>

                    {/* Card Content Area - Clean & Minimal (Name, Size, Price, Add to Cart) */}
                    <div className={styles.cardBody}>
                      {/* Product Name */}
                      <Link href={`/inspired?select=${item.id}`} className={styles.titleLink}>
                        <h3 className={styles.productName}>{isAr ? item.arabicName : item.name}</h3>
                      </Link>

                      {/* Size Switcher with smooth tactile feel */}
                      <div className={styles.sizeSwitcher}>
                        <button
                          type="button"
                          onClick={(e) => handleSizeSelect(item.id, "50ml", e)}
                          className={`${styles.sizeBtn} ${currentSize === "50ml" ? styles.sizeBtnActive : ""}`}
                        >
                          <span>{isAr ? "50 مل" : "50ml"}</span>
                          <span>({price50} {isAr ? "ج.م" : "LE"})</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleSizeSelect(item.id, "100ml", e)}
                          className={`${styles.sizeBtn} ${currentSize === "100ml" ? styles.sizeBtnActive : ""}`}
                        >
                          <span>{isAr ? "100 مل" : "100ml"}</span>
                          <span>({price100} {isAr ? "ج.م" : "LE"})</span>
                        </button>
                      </div>

                      {/* Action Row */}
                      <div className={styles.actionRow}>
                        <div className={styles.priceCol}>
                          <span className={styles.priceLabel}>{isAr ? "السعر" : "Price"}</span>
                          <span
                            key={`${item.id}-${currentSize}`}
                            className={`${styles.currentPrice} ${styles.priceAnimate}`}
                          >
                            {currentFormattedPrice}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(item, e)}
                          className={`${styles.addToCartBtn} ${isItemAdded ? styles.addToCartBtnAdded : ""}`}
                          aria-label={isAr ? `إضافة ${item.arabicName} إلى السلة` : `Add ${item.name} to cart`}
                        >
                          <span className={styles.btnInner}>
                            {isItemAdded ? (
                              <span className={styles.btnSuccessWrap}>
                                <Check size={13} strokeWidth={2.4} className={styles.btnIcon} />
                                <span className={styles.btnText}>{isAr ? "تمت الإضافة" : "Added"}</span>
                              </span>
                            ) : (
                              <span className={styles.rollingContainer}>
                                <span className={styles.rollPrimary}>
                                  <ShoppingBag size={13} strokeWidth={2} className={styles.btnIcon} />
                                  <span className={styles.btnText}>{isAr ? "أضف للسلة" : "Add to Cart"}</span>
                                </span>
                                <span className={styles.rollSecondary} aria-hidden="true">
                                  <span className={styles.btnText}>{isAr ? "أضف للسلة" : "Add to Cart"}</span>
                                  <ArrowUpRight size={13} strokeWidth={2.4} className={styles.arrowIcon} />
                                </span>
                              </span>
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Simple Clean Explore All Button */}
          <div className={styles.footerCtaWrap}>
            <Link href={exploreTarget.href} className={styles.footerExploreBtn}>
              <span>{isAr ? exploreTarget.labelAr : exploreTarget.labelEn}</span>
              {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
            </Link>
          </div>
        </div>
      </section>
    );
  }
);

InspiredShowcase.displayName = "InspiredShowcase";
