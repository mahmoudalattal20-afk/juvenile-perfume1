"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Heart, ShoppingBag, Check, Sparkles, Compass } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useCMS } from "@/context/CMSContext";
import { PRODUCTS_CATALOG, ProductDetailData, getProductClassification } from "@/data/products";
import styles from "./Musk.module.css";

export const MuskPageClient: React.FC = () => {
  const { locale, direction } = useLanguage();
  const { cmsData } = useCMS();
  const { addToCart, wishlistItems, addToWishlist, removeFromWishlist } = useCart();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const isAr = locale === "ar";
  const ArrowIcon = direction === "rtl" ? ChevronLeft : ChevronRight;

  const muskConfig = cmsData?.muskPage || {
    titleAr: "مجموعة المسك الفاخر",
    titleEn: "EXCLUSIVE MUSK COLLECTION",
    subtitleAr: "نقاء مخملي ونفحات نقية تأسر الحواس بأرقى خلاصات المسك الطبيعي والفرنسي الفاخر",
    subtitleEn: "Pure velvety accords and royal olfactory harmonies crafted with modern Parisian restraint",
    bannerImage: "/highlights/unisex.jpg",
    badgeAr: "مجموعة المسك الملكية",
    badgeEn: "Royal Musk Collection",
  };

  const title = isAr ? (muskConfig.titleAr || "مجموعة المسك الفاخر") : (muskConfig.titleEn || "EXCLUSIVE MUSK COLLECTION");
  const subtitle = isAr
    ? (muskConfig.subtitleAr || "نقاء مخملي ونفحات نقية تأسر الحواس بأرقى خلاصات المسك الطبيعي والفرنسي الفاخر")
    : (muskConfig.subtitleEn || "Pure velvety accords and royal olfactory harmonies crafted with modern Parisian restraint");
  const badge = isAr ? (muskConfig.badgeAr || "مجموعة المسك الملكية") : (muskConfig.badgeEn || "Royal Musk Collection");
  const bannerImage = muskConfig.bannerImage || "/highlights/unisex.jpg";

  // Retrieve products from CMS and catalog
  const catalogList: ProductDetailData[] = Object.values(PRODUCTS_CATALOG);
  const cmsList: ProductDetailData[] = cmsData?.products ? Object.values(cmsData.products) : [];

  // Merge and deduplicate
  const productMap: Record<string, ProductDetailData> = {};
  catalogList.forEach((p) => {
    productMap[p.id] = p;
  });
  cmsList.forEach((p) => {
    productMap[p.id] = { ...productMap[p.id], ...p };
  });

  // Filter products by musk classification
  const filteredProducts = Object.values(productMap).filter((p) => {
    if (cmsData?.deletedProducts?.includes(p.id)) return false;
    const cls = getProductClassification(p);
    return cls === "musk";
  });

  const handleAddToCart = (e: React.MouseEvent, prod: ProductDetailData) => {
    e.preventDefault();
    e.stopPropagation();

    setAddedIds((prev) => ({ ...prev, [prod.id]: true }));
    addToCart({
      id: prod.id,
      name: isAr ? prod.arabicName || prod.name : prod.name,
      type: typeof prod.category === "object" ? (isAr ? prod.category.ar : prod.category.en) : String(prod.category),
      price: prod.price,
      formattedPrice: isAr ? prod.formattedPrice.ar : prod.formattedPrice.en,
      image: prod.image,
    });

    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [prod.id]: false }));
    }, 1800);
  };

  const handleToggleWishlist = (e: React.MouseEvent, prod: ProductDetailData) => {
    e.preventDefault();
    e.stopPropagation();
    const isWishlisted = wishlistItems.some((w) => w.id === prod.id);
    if (isWishlisted) {
      removeFromWishlist(prod.id);
    } else {
      addToWishlist({
        id: prod.id,
        name: isAr ? prod.arabicName || prod.name : prod.name,
        price: isAr ? prod.formattedPrice.ar : prod.formattedPrice.en,
        image: prod.image,
      });
    }
  };

  return (
    <div className={styles.mainWrapper} dir={direction}>
      {/* 1. Cinematic Luxury Gradient Banner */}
      <section className={styles.heroBanner}>
        <div className={styles.bannerContent}>
          {/* Breadcrumbs */}
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/" className={styles.breadcrumbLink}>
              {isAr ? "الرئيسية" : "Home"}
            </Link>
            <ArrowIcon size={14} className={styles.breadcrumbSeparator} />
            <span className={styles.breadcrumbCurrent}>{title}</span>
          </nav>

          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </section>

      {/* 2. Collection Products Section */}
      <section className={styles.collectionSection}>
        <div className={styles.toolbar}>
          <span className={styles.countText}>
            {isAr
              ? `${filteredProducts.length} إبداعات عطرية متوفرة`
              : `${filteredProducts.length} Creations Available`}
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          /* High-end Luxury Empty State (متحطش فيها اي عناصر بس اتاكد انها شغاله) */
          <div className={styles.emptyStateContainer}>
            <div className={styles.emptyIconCircle}>
              <Sparkles size={38} strokeWidth={1.8} />
            </div>

            <h2 className={styles.emptyTitle}>
              {isAr ? "تشكيلة المسك الفاخرة قيد التجهيز" : "The Musk Collection is Curating"}
            </h2>

            <p className={styles.emptyText}>
              {isAr
                ? "نعمل حالياً في مختبرات جوفينيل على تحضير أرقى توليفات المسك النقي والخلطات الملكية لتنضم إلى المتجر قريباً جداً. تابعونا أو تصفح باقي مجموعاتنا المتاحة."
                : "Our atelier is currently formulating the purest bespoke musk compositions. They will be unveiled in our collection very soon."}
            </p>

            <div className={styles.emptyActionsRow}>
              <Link href="/" className={styles.homeActionBtn}>
                <Compass size={16} />
                <span>{isAr ? "العودة للرئيسية" : "Back to Home"}</span>
              </Link>
              <Link href="/#bestsellers" className={styles.exploreActionBtn}>
                <span>{isAr ? "استكشف العطور الأكثر طلباً" : "Explore Bestsellers"}</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Products Grid (renders automatically when admin adds products in the future) */
          <div className={styles.productsGrid}>
            {filteredProducts.map((prod) => {
              const isWishlisted = wishlistItems.some((w) => w.id === prod.id);
              const isAdded = addedIds[prod.id];
              const displayName = isAr ? prod.arabicName || prod.name : prod.name;
              const displayCategory =
                typeof prod.category === "object"
                  ? isAr
                    ? prod.category.ar
                    : prod.category.en
                  : prod.category;
              const displayPrice = isAr ? prod.formattedPrice.ar : prod.formattedPrice.en;
              const displayTagline = isAr ? prod.tagline.ar : prod.tagline.en;

              return (
                <div key={prod.id} className={styles.card}>
                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleWishlist(e, prod)}
                    className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistBtnActive : ""}`}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                  </button>

                  {/* Product Image */}
                  <Link href={`/product/${prod.id}`} className={styles.cardImageWrapper}>
                    <Image
                      src={prod.image}
                      alt={displayName}
                      fill
                      sizes="(max-width: 860px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className={styles.productImg}
                    />
                  </Link>

                  {/* Card Body */}
                  <div className={styles.cardBody}>
                    <span className={styles.categoryTag}>{displayCategory}</span>

                    <Link href={`/product/${prod.id}`} className={styles.productName}>
                      {displayName}
                    </Link>

                    <p className={styles.productTagline}>{displayTagline}</p>

                    <div className={styles.cardFooter}>
                      <div className={styles.priceWrapper}>
                        <div className={styles.priceWrap}>
                          <span className={styles.priceText}>{displayPrice}</span>
                          {prod.formattedOriginalPrice && prod.originalPrice && prod.originalPrice > prod.price ? (
                            <span className={styles.originalPriceText}>
                              {isAr ? prod.formattedOriginalPrice.ar : prod.formattedOriginalPrice.en}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, prod)}
                        className={`${styles.addToCartBtn} ${isAdded ? styles.addToCartBtnAdded : ""}`}
                        disabled={isAdded}
                      >
                        {isAdded ? (
                          <>
                            <Check size={14} />
                            <span>{isAr ? "تم الإضافة" : "Added"}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={14} />
                            <span>{isAr ? "أضف للسلة" : "Add"}</span>
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
      </section>
    </div>
  );
};
