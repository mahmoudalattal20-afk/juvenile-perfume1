"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Check, Heart, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartActions, useWishlist } from "@/context/CartContext";
import { useFlyAnimation } from "@/context/FlyAnimationContext";
import { useCMS } from "@/context/CMSContext";
import { getProductClassification, ProductClassificationType } from "@/data/products";
import { DEFAULT_FEATURED_PRODUCT_IDS } from "@/lib/cmsTypes";
import styles from "./OurSelections.module.css";

interface OurSelectionsProps {
  onAddToCart?: () => void;
}

function toTitleCase(str: string): string {
  if (!str) return "";
  return str.replace(/\b([A-Za-z])([A-Za-z0-9]*)\b/g, (_, first, rest) => {
    return first.toUpperCase() + rest.toLowerCase();
  });
}

export type SelectionFilterType = "all" | "inspired" | ProductClassificationType;

interface ProductItem {
  id: string;
  name: string;
  category: string;
  notes?: string;
  rating: number;
  reviewsCount: number;
  price: number;
  formattedPrice: string;
  originalPrice?: number;
  formattedOriginalPrice?: string;
  price50ml?: number;
  formattedPrice50ml?: string;
  image: string;
  isNew?: boolean;
  classification?: ProductClassificationType | "inspired";
}

interface ProductCardProps {
  prod: ProductItem;
  idx: number;
  isWishlisted: boolean;
  isAdded: boolean;
  isAnimating: boolean;
  direction: "rtl" | "ltr";
  locale: "ar" | "en";
  t: any;
  onCardClick: (prodId: string, e: React.MouseEvent) => void;
  onToggleWishlist: (prod: ProductItem, e: React.MouseEvent) => void;
  onAddToCart: (prod: ProductItem, e: React.MouseEvent) => void;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({
  prod,
  idx,
  isWishlisted,
  isAdded,
  isAnimating,
  direction,
  locale,
  t,
  onCardClick,
  onToggleWishlist,
  onAddToCart,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isEager = idx < 4;

  return (
    <div
      className={styles.card}
      onClick={(e) => onCardClick(prod.id, e)}
    >
      {/* Studio Presentation Stage */}
      <div className={styles.imageContainer}>
        {/* Luxury Shimmer Placeholder Skeleton */}
        <div
          className={`${styles.imagePlaceholder} ${
            imageLoaded ? styles.imagePlaceholderHidden : ""
          }`}
          aria-hidden="true"
        />

        {/* Floating Wishlist Button */}
        <button
          type="button"
          className={`${styles.wishlistBtn} ${
            isWishlisted ? styles.wishlistBtnActive : ""
          }`}
          onClick={(e) => onToggleWishlist(prod, e)}
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
          href={`/product/${prod.id}`}
          className={styles.imageLink}
          tabIndex={-1}
          aria-hidden="true"
        >
          <div className={styles.bottleFloatWrap}>
            <Image
              src={prod.image}
              alt={prod.name}
              fill
              sizes="(max-width: 768px) 180px, (max-width: 1080px) 210px, 240px"
              loading={isEager ? "eager" : "lazy"}
              priority={isEager}
              unoptimized={true}
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              className={`${styles.productImage} ${
                imageLoaded ? styles.productImageLoaded : ""
              }`}
              draggable={false}
            />
          </div>
        </Link>
      </div>

      {/* Modern Card Body */}
      <div className={styles.infoBlock}>
        {/* Bold Modern Title */}
        <Link
          href={`/product/${prod.id}`}
          className={styles.titleLink}
        >
          <h3 className={styles.productName}>
            {locale === "en" ? toTitleCase(prod.name) : prod.name}
          </h3>
        </Link>

        {/* Price & Modern Interactive CTA Row */}
        <div className={styles.actionRow}>
          <div className={styles.priceCol}>
            <span className={styles.priceLabel}>
              {direction === "rtl" ? "السعر" : "Price"}
            </span>
            <div className={styles.priceWrap}>
              <span className={styles.productPrice}>
                {prod.formattedPrice}
              </span>
              {prod.formattedOriginalPrice && prod.originalPrice && prod.originalPrice > prod.price ? (
                <span className={styles.originalPrice}>
                  {prod.formattedOriginalPrice}
                </span>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => onAddToCart(prod, e)}
            className={`${styles.quickAddBtn} ${
              isAdded ? styles.quickAddBtnSuccess : ""
            } ${isAnimating ? styles.quickAddBtnAnimating : ""}`}
            aria-label={`${t.ourSelections.addToCart} - ${prod.name}`}
          >
            <span className={styles.btnInner}>
              {isAdded ? (
                <span className={styles.btnSuccessWrap}>
                  <Check size={13} strokeWidth={2.4} className={styles.btnIcon} />
                  <span className={styles.btnText}>{t.ourSelections.addedToCart}</span>
                </span>
              ) : (
                <span className={styles.rollingContainer}>
                  <span className={styles.rollPrimary}>
                    <ShoppingBag size={13} strokeWidth={2} className={styles.btnIcon} />
                    <span className={styles.btnText}>{t.ourSelections.addToCart}</span>
                  </span>
                  <span className={styles.rollSecondary} aria-hidden="true">
                    <span className={styles.btnText}>
                      {t.ourSelections.addToCart}
                    </span>
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
});

ProductCard.displayName = "ProductCard";

export const OurSelections: React.FC<OurSelectionsProps> = React.memo(({ onAddToCart }) => {
  const router = useRouter();
  const { t, direction, locale } = useLanguage();
  const { cmsData } = useCMS();
  const { addToCart, addToWishlist, removeFromWishlist } = useCartActions();
  const { wishlistItems } = useWishlist();
  const { triggerFlyAnimation } = useFlyAnimation();
  const sectionRef = useRef<HTMLElement>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [animatingIds, setAnimatingIds] = useState<Record<string, boolean>>({});
  const [selectedClassification, setSelectedClassification] = useState<SelectionFilterType>("all");
  const [isCategoryTransitioning, setIsCategoryTransitioning] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(true);

  // Viewport Auto-Pause: Stops marquee loop when out of viewport to eliminate GPU drop frames
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(entry.isIntersecting);
      },
      { threshold: 0.01, rootMargin: "180px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleCardClick = useCallback((prodId: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    router.push(`/product/${prodId}`);
  }, [router]);

  const toggleWishlist = useCallback((prod: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const isWishlisted = wishlistItems.some((w) => w.id === prod.id);
    if (isWishlisted) {
      removeFromWishlist(prod.id);
    } else {
      const heartBtn = e.currentTarget as HTMLElement;
      const cardEl = heartBtn.closest(`.${styles.card}`) as HTMLElement | null;
      const imgEl = (cardEl?.querySelector(`.${styles.productImage}`) as HTMLElement) || heartBtn;

      triggerFlyAnimation({
        startElement: imgEl,
        image: prod.image,
        type: "wishlist",
        title: prod.name,
      });

      addToWishlist({
        id: prod.id,
        name: prod.name,
        price: prod.formattedPrice,
        image: prod.image,
      });
    }
  }, [wishlistItems, removeFromWishlist, addToWishlist, triggerFlyAnimation]);

  const handleSwitchClassification = useCallback((cat: SelectionFilterType) => {
    setIsCategoryTransitioning(true);
    setSelectedClassification(cat);
    setTimeout(() => {
      setIsCategoryTransitioning(false);
    }, 320);
  }, []);

  // Listen to custom category selection events & URL hash/params
  useEffect(() => {
    const handleCategorySelect = (e: Event) => {
      const customEv = e as CustomEvent<string>;
      if (customEv.detail) {
        const cat = customEv.detail;
        if (["men", "women", "unisex", "inspired", "bukhoor", "bodysplash", "musk", "all"].includes(cat)) {
          handleSwitchClassification(cat as any);
        }
      }
    };

    const handleUrlCheck = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash;
        const search = window.location.search;
        const raw = search || (hash.includes("?") ? hash.substring(hash.indexOf("?")) : "");
        const searchParams = new URLSearchParams(raw);
        const cat = searchParams.get("cat") || searchParams.get("category");
        if (cat && ["men", "women", "unisex", "inspired", "bukhoor", "bodysplash", "musk", "all"].includes(cat)) {
          handleSwitchClassification(cat as any);
        }
      }
    };

    window.addEventListener("selectCategory", handleCategorySelect);
    window.addEventListener("hashchange", handleUrlCheck);
    window.addEventListener("popstate", handleUrlCheck);
    handleUrlCheck();

    return () => {
      window.removeEventListener("selectCategory", handleCategorySelect);
      window.removeEventListener("hashchange", handleUrlCheck);
      window.removeEventListener("popstate", handleUrlCheck);
    };
  }, [handleSwitchClassification]);

  const featuredIds = useMemo(() => {
    if (Array.isArray(cmsData.featuredProductIds) && cmsData.featuredProductIds.length > 0) {
      return cmsData.featuredProductIds;
    }
    return DEFAULT_FEATURED_PRODUCT_IDS;
  }, [cmsData.featuredProductIds]);

  const rawProducts = t.ourSelections.products;
  const products: ProductItem[] = useMemo(() => {
    const rawMap = new Map(rawProducts.map((p) => [p.id, p]));
    const cmsMap = new Map(Object.entries(cmsData.products || {}));
    const inspiredMap = new Map(Object.entries(cmsData.inspiredProducts || {}));
    const deletedSet = new Set([
      ...(cmsData.deletedProducts || []),
      ...(cmsData.deletedInspiredProducts || []),
    ]);

    const result: ProductItem[] = [];

    for (const id of featuredIds) {
      if (deletedSet.has(id)) continue;

      const cmsProd = cmsMap.get(id);
      const rawProd = rawMap.get(id);
      const inspiredProd = inspiredMap.get(id);

      if (cmsProd) {
        const cls = getProductClassification(cmsProd);
        if (selectedClassification !== "all" && cls !== selectedClassification) continue;
        result.push({
          id: cmsProd.id,
          name: locale === "ar" ? (cmsProd.arabicName || cmsProd.name) : cmsProd.name,
          category: typeof cmsProd.category === "object"
            ? (locale === "ar" ? cmsProd.category.ar : cmsProd.category.en)
            : String(cmsProd.category),
          rating: cmsProd.rating || 5,
          reviewsCount: cmsProd.reviewsCount || 100,
          price: cmsProd.price,
          formattedPrice: locale === "ar" ? cmsProd.formattedPrice.ar : cmsProd.formattedPrice.en,
          originalPrice: cmsProd.originalPrice,
          formattedOriginalPrice: cmsProd.formattedOriginalPrice
            ? (locale === "ar" ? cmsProd.formattedOriginalPrice.ar : cmsProd.formattedOriginalPrice.en)
            : undefined,
          image: cmsProd.image,
          isNew: cmsProd.isNew,
          classification: cls,
        });
      } else if (rawProd) {
        const cls = getProductClassification(rawProd as any);
        if (selectedClassification !== "all" && cls !== selectedClassification) continue;
        result.push({
          ...rawProd,
          rating: rawProd.rating ?? 5,
          reviewsCount: rawProd.reviewsCount ?? 40,
          classification: cls,
        });
      } else if (inspiredProd) {
        const cls = (inspiredProd.gender || "unisex") as any;
        if (selectedClassification !== "all" && (selectedClassification as string) !== "inspired" && selectedClassification !== cls) {
          continue;
        }
        result.push({
          id: inspiredProd.id,
          name: locale === "ar" ? inspiredProd.arabicName : inspiredProd.name,
          category: locale === "ar" ? "عطر مستوحى فاخر" : "Luxury Inspired Perfume",
          rating: 4.9,
          reviewsCount: 120,
          price: inspiredProd.price,
          formattedPrice: locale === "ar" ? inspiredProd.formattedPrice.ar : inspiredProd.formattedPrice.en,
          originalPrice: inspiredProd.originalPrice,
          formattedOriginalPrice: inspiredProd.formattedOriginalPrice
            ? (locale === "ar" ? inspiredProd.formattedOriginalPrice.ar : inspiredProd.formattedOriginalPrice.en)
            : undefined,
          image: inspiredProd.image,
          isNew: true,
          classification: cls,
        });
      }
    }

    return result;
  }, [featuredIds, rawProducts, cmsData, selectedClassification, locale]);

  // Lists for Desktop (1 row) and Mobile (2 rows) with infinite loop repetition
  const { desktopDisplayList, mobileRow1DisplayList, mobileRow2DisplayList } = useMemo(() => {
    if (products.length === 0) {
      return {
        desktopDisplayList: [],
        mobileRow1DisplayList: [],
        mobileRow2DisplayList: [],
      };
    }

    const tileToMin = (items: ProductItem[], min = 6): ProductItem[] => {
      if (items.length === 0) return [];
      let res = [...items];
      while (res.length < min) {
        res = res.concat(items);
      }
      return res;
    };

    // Desktop: 1 single continuous row containing all products
    const desktopTiled = tileToMin(products, 8);
    const desktopDisplayList = [...desktopTiled, ...desktopTiled];

    // Mobile: 2 rows split
    let r1Base: ProductItem[] = [];
    let r2Base: ProductItem[] = [];

    if (products.length === 1) {
      r1Base = [products[0]];
      r2Base = [products[0]];
    } else if (products.length === 2) {
      r1Base = [products[0]];
      r2Base = [products[1]];
    } else if (products.length === 3) {
      r1Base = [products[0], products[2]];
      r2Base = [products[1], products[0]];
    } else {
      r1Base = products.filter((_, idx) => idx % 2 === 0);
      r2Base = products.filter((_, idx) => idx % 2 === 1);
    }

    const r1Tiled = tileToMin(r1Base, 6);
    const r2Tiled = tileToMin(r2Base, 6);

    return {
      desktopDisplayList,
      mobileRow1DisplayList: [...r1Tiled, ...r1Tiled],
      mobileRow2DisplayList: [...r2Tiled, ...r2Tiled],
    };
  }, [products]);

  const handleAdd = useCallback(
    (prod: ProductItem, e: React.MouseEvent) => {
      e.stopPropagation();

      setAnimatingIds((prev) => ({ ...prev, [prod.id]: true }));
      setTimeout(() => {
        setAnimatingIds((prev) => ({ ...prev, [prod.id]: false }));
      }, 550);

      const btnEl = e.currentTarget as HTMLElement;

      triggerFlyAnimation({
        startElement: btnEl,
        image: prod.image,
        type: "cart",
        title: prod.name,
        subtitle: prod.formattedPrice,
      });

      setAddedIds((prev) => ({ ...prev, [prod.id]: true }));
      addToCart(
        {
          id: prod.id,
          name: prod.name,
          type: prod.category,
          price: prod.price,
          formattedPrice: prod.formattedPrice,
          image: prod.image,
        },
        false
      );

      if (onAddToCart) onAddToCart();
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [prod.id]: false }));
      }, 1800);
    },
    [addToCart, onAddToCart, triggerFlyAnimation]
  );

  return (
    <>
      <div id="all" style={{ position: "relative", top: "-90px", pointerEvents: "none" }} />
      <section
        id="bestsellers"
        ref={sectionRef}
        className={styles.section}
        aria-label={t.ourSelections.title}
      >
        <div className={styles.container}>
          {/* Section Header */}
          <div className={styles.header}>
            <h2
              className={styles.title}
              style={locale === "ar" ? { fontFamily: "var(--font-readex), 'Readex Pro', sans-serif" } : undefined}
            >
              {t.ourSelections.title}
            </h2>
            <p
              className={styles.subtitle}
              style={locale === "ar" ? { fontFamily: "var(--font-readex), 'Readex Pro', sans-serif" } : undefined}
            >
              {t.ourSelections.subtitle}
            </p>
          </div>

          {/* Classification Filter Tabs */}
          <div className={styles.categoryTabsContainer}>
            {([
              { id: "all", ar: "جميع العطور والإبداعات", en: "All Creations" },
              { id: "men", ar: "عطور رجالية", en: "Men" },
              { id: "women", ar: "عطور نسائية", en: "Women" },
              { id: "unisex", ar: "للجنسين", en: "Unisex" },
              { id: "bukhoor", ar: "بخور فاخر", en: "Bukhoor" },
              { id: "bodysplash", ar: "بادي سبلاش", en: "Body Splash" },
              { id: "musk", ar: "المسك", en: "Musk" },
            ] as const).map((cat) => {
              const isActive = selectedClassification === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSwitchClassification(cat.id)}
                  className={`${styles.categoryTabBtn} ${isActive ? styles.categoryTabBtnActive : ""}`}
                >
                  {locale === "ar" ? cat.ar : cat.en}
                </button>
              );
            })}
          </div>

          {products.length === 0 ? (
            <div className={styles.emptyCategoryMessage}>
              {locale === "ar"
                ? "لا توجد منتجات متوفرة حالياً في هذا القسم"
                : "No products currently available in this category"}
            </div>
          ) : (
            <div
              className={`${styles.marqueeWrapper} ${isCategoryTransitioning ? styles.marqueeTransitioning : ""} ${
                !isSectionVisible ? styles.marqueePaused : ""
              }`}
              aria-label="Continuous Product Showcases"
            >
              {/* =========================================
                  DESKTOP: Exactly 1 Continuous Moving Strip
                  ========================================= */}
              <div className={styles.desktopMarqueeWrapper}>
                <div className={styles.marqueeRow} role="region" aria-label="Desktop product strip">
                  <div className={styles.marqueeTrackDesktop}>
                    {desktopDisplayList.map((prod, idx) => (
                      <ProductCard
                        key={`desktop-${prod.id}-${idx}`}
                        prod={prod}
                        idx={idx}
                        isWishlisted={wishlistItems.some((w) => w.id === prod.id)}
                        isAdded={!!addedIds[prod.id]}
                        isAnimating={!!animatingIds[prod.id]}
                        direction={direction}
                        locale={locale}
                        t={t}
                        onCardClick={handleCardClick}
                        onToggleWishlist={toggleWishlist}
                        onAddToCart={handleAdd}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* =========================================
                  MOBILE: 2 Continuous Moving Strips
                  ========================================= */}
              <div className={styles.mobileMarqueeWrapper}>
                {/* Mobile Row 1 */}
                <div className={styles.marqueeRow} role="region" aria-label="First mobile product row">
                  <div className={styles.marqueeTrackRow1}>
                    {mobileRow1DisplayList.map((prod, idx) => (
                      <ProductCard
                        key={`mob1-${prod.id}-${idx}`}
                        prod={prod}
                        idx={idx}
                        isWishlisted={wishlistItems.some((w) => w.id === prod.id)}
                        isAdded={!!addedIds[prod.id]}
                        isAnimating={!!animatingIds[prod.id]}
                        direction={direction}
                        locale={locale}
                        t={t}
                        onCardClick={handleCardClick}
                        onToggleWishlist={toggleWishlist}
                        onAddToCart={handleAdd}
                      />
                    ))}
                  </div>
                </div>

                {/* Mobile Row 2 */}
                <div className={styles.marqueeRow} role="region" aria-label="Second mobile product row">
                  <div className={styles.marqueeTrackRow2}>
                    {mobileRow2DisplayList.map((prod, idx) => (
                      <ProductCard
                        key={`mob2-${prod.id}-${idx}`}
                        prod={prod}
                        idx={idx}
                        isWishlisted={wishlistItems.some((w) => w.id === prod.id)}
                        isAdded={!!addedIds[prod.id]}
                        isAnimating={!!animatingIds[prod.id]}
                        direction={direction}
                        locale={locale}
                        t={t}
                        onCardClick={handleCardClick}
                        onToggleWishlist={toggleWishlist}
                        onAddToCart={handleAdd}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
});

OurSelections.displayName = "OurSelections";
