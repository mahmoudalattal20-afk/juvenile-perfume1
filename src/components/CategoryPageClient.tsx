"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Heart, ShoppingBag, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useCMS } from "@/context/CMSContext";
import { PRODUCTS_CATALOG, ProductDetailData, getProductClassification } from "@/data/products";
import styles from "./CategoryPageClient.module.css";

export interface CategoryInfo {
  slug: "women" | "men" | "unisex" | "bukhoor" | "bodysplash";
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  image: string;
  badgeAr: string;
  badgeEn: string;
}

export const CATEGORIES_DATA: Record<string, CategoryInfo> = {
  women: {
    slug: "women",
    titleAr: "عطور نسائية ساحرة ومخملية",
    titleEn: "FOR HER — ENCHANTING FEMININITY",
    subtitleAr: "سيمفونية زهرية ومخملية صُممت بعناية لتفيض بالأنوثة، الرقة، والجاذبية الخالدة التي تترك أثراً استثنائياً.",
    subtitleEn: "An enchanting curation of delicate floral and velvety feminine fragrances crafted to leave an unforgettable trail.",
    image: "/highlights/her.jpg",
    badgeAr: "المجموعة النسائية الفاخرة",
    badgeEn: "Haute Feminine Collection",
  },
  men: {
    slug: "men",
    titleAr: "عطور رجالية مهيبة وفخمة",
    titleEn: "FOR HIM — REGAL PRESENCE",
    subtitleAr: "عطور نيش شرقية وفرنسية ذات ثبات طاغٍ وأناقة ملكية تمنحك حضوراً واثقاً لا يُمحى من الذاكرة.",
    subtitleEn: "A commanding selection of regal woods, deep amber, and opulent masculine signatures for confident presence.",
    image: "/highlights/him.png",
    badgeAr: "المجموعة الرجالية الملكية",
    badgeEn: "Regal Masculine Collection",
  },
  unisex: {
    slug: "unisex",
    titleAr: "عطور للجنسين راقية ومتميزة",
    titleEn: "UNISEX — HARMONIOUS ELEGANCE",
    subtitleAr: "إبداعات عطرية عالمية متناغمة تجمع بين دفء العنبر، أصالة الأخشاب، ونقاء الزهور لتلائم أصحاب الذوق الرفيع.",
    subtitleEn: "Universal olfactory masterpieces crafted with exquisite harmony of amber and noble woods for distinguished tastes.",
    image: "/highlights/unisex.jpg",
    badgeAr: "مجموعة العطور المشتركة",
    badgeEn: "Universal Haute Collection",
  },
  bukhoor: {
    slug: "bukhoor",
    titleAr: "بخور وعود معطر فاخر",
    titleEn: "HAUTE BUKHOOR & SCENTED AGARWOOD",
    subtitleAr: "أرقى تشكيلات العود المعطر الطبيعي والبخور الملكي لتجربة استثنائية تأسر الحواس وتعيد صياغة المكان.",
    subtitleEn: "An elevated curation of pure oud and royal scented agarwood crafted to define space, presence, and ritual.",
    image: "/highlights/bukhoor-banner.jpg",
    badgeAr: "مجموعة البخور والعود",
    badgeEn: "Royal Bukhoor Collection",
  },
  bodysplash: {
    slug: "bodysplash",
    titleAr: "معطرات الجسم الفاخرة (Body Splash)",
    titleEn: "HAUTE BODY SPLASH & MISTS",
    subtitleAr: "نفحات عطرية خفيفة ومنعشة تدوم طويلاً صُممت لتمنحك إحساساً بالنقاء والانتعاش طوال اليوم.",
    subtitleEn: "A collection of refreshing, long-lasting luxury body mists designed for everyday refinement.",
    image: "/highlights/unisex.jpg",
    badgeAr: "معطرات الجسم الفاخرة",
    badgeEn: "Luxury Body Splash",
  },
};

interface Props {
  slug: "women" | "men" | "unisex" | "bukhoor" | "bodysplash";
}

export function CategoryPageClient({ slug }: Props) {
  const { locale, direction } = useLanguage();
  const { cmsData } = useCMS();
  const { addToCart, wishlistItems, addToWishlist, removeFromWishlist } = useCart();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const category = CATEGORIES_DATA[slug] || CATEGORIES_DATA["unisex"];
  const isAr = locale === "ar";
  const ArrowIcon = direction === "rtl" ? ChevronLeft : ChevronRight;

  // Retrieve products from CMS and catalog
  const catalogList: ProductDetailData[] = Object.values(PRODUCTS_CATALOG);
  const cmsList: ProductDetailData[] = cmsData?.products ? Object.values(cmsData.products) : [];
  
  // Merge and deduplicate
  const productMap: Record<string, ProductDetailData> = {};
  catalogList.forEach((p) => { productMap[p.id] = p; });
  cmsList.forEach((p) => { productMap[p.id] = { ...productMap[p.id], ...p }; });

  // Filter products strictly by classification
  const filteredProducts = Object.values(productMap).filter((p) => {
    if (cmsData?.deletedProducts?.includes(p.id)) return false;
    const cls = getProductClassification(p);
    return cls === slug;
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

  const isBukhoorCustom = slug === "bukhoor" && cmsData?.bukhoorSection;
  const bannerImage = isBukhoorCustom && cmsData.bukhoorSection?.bannerImage ? cmsData.bukhoorSection.bannerImage : category.image;
  const categoryTitle = isBukhoorCustom && (isAr ? cmsData.bukhoorSection?.titleAr : cmsData.bukhoorSection?.titleEn)
    ? (isAr ? cmsData.bukhoorSection?.titleAr! : cmsData.bukhoorSection?.titleEn!)
    : (isAr ? category.titleAr : category.titleEn);
  const categorySubtitle = isBukhoorCustom && (isAr ? cmsData.bukhoorSection?.subtitleAr : cmsData.bukhoorSection?.subtitleEn)
    ? (isAr ? cmsData.bukhoorSection?.subtitleAr! : cmsData.bukhoorSection?.subtitleEn!)
    : (isAr ? category.subtitleAr : category.subtitleEn);

  return (
    <div className={styles.mainWrapper}>
      {/* 1. Cinematic Luxury Banner */}
      <section className={styles.heroBanner}>
        <div className={styles.bannerBgWrapper}>
          <Image
            src={bannerImage}
            alt={isAr ? category.titleAr : category.titleEn}
            fill
            priority
            sizes="100vw"
            className={styles.bannerBg}
            unoptimized={true}
            decoding="async"
          />
          <div className={styles.bannerOverlay} />
        </div>

        <div className={styles.bannerContent}>
          {/* Breadcrumbs */}
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/" className={styles.breadcrumbLink}>
              {isAr ? "الرئيسية" : "Home"}
            </Link>
            <ArrowIcon size={14} className={styles.breadcrumbSeparator} />
            <span className={styles.breadcrumbCurrent}>
              {isAr ? category.badgeAr : category.badgeEn}
            </span>
          </nav>

          <span className={styles.categoryBadge}>
            {isAr ? category.badgeAr : category.badgeEn}
          </span>

          <h1 className={styles.title}>
            {categoryTitle}
          </h1>

          <p className={styles.subtitle}>
            {categorySubtitle}
          </p>

          {/* Quick Category Switcher */}
          <div className={styles.switcherContainer}>
            {(["women", "men", "unisex"] as const).map((catKey) => {
              const info = CATEGORIES_DATA[catKey];
              const isActive = catKey === slug;
              return (
                <Link
                  key={catKey}
                  href={`/category/${catKey}`}
                  className={`${styles.switcherTab} ${isActive ? styles.switcherTabActive : ""}`}
                >
                  {isAr ? info.badgeAr : info.badgeEn}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Collection Products Grid */}
      <section className={styles.collectionSection}>
        <div className={styles.toolbar}>
          <span className={styles.countText}>
            {isAr
              ? `${filteredProducts.length} إبداعات عطرية متوفرة`
              : `${filteredProducts.length} Creations Available`}
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className={styles.emptyBlock}>
            <p>
              {isAr
                ? "لا توجد عطور متوفرة حالياً في هذا القسم."
                : "No fragrances currently available in this section."}
            </p>
            <Link href="/" className={styles.homeLinkBtn}>
              {isAr ? "العودة للرئيسية" : "Return to Home"}
            </Link>
          </div>
        ) : (
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
                      unoptimized={true}
                      decoding="async"
                    />
                  </Link>

                  {/* Card Body */}
                  <div className={styles.cardBody}>
                    <span className={styles.categoryTag}>{displayCategory}</span>

                    <Link href={`/product/${prod.id}`} className={styles.productName}>
                      {displayName}
                    </Link>

                    <p className={styles.tagline}>{displayTagline}</p>

                    <div className={styles.priceRow}>
                      <div className={styles.priceContainer}>
                        <div className={styles.priceWrap}>
                          <span className={styles.price}>{displayPrice}</span>
                          {prod.formattedOriginalPrice && prod.originalPrice && prod.originalPrice > prod.price ? (
                            <span className={styles.originalPrice}>
                              {isAr ? prod.formattedOriginalPrice.ar : prod.formattedOriginalPrice.en}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, prod)}
                        className={`${styles.addBtn} ${isAdded ? styles.addBtnSuccess : ""}`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={14} />
                            <span>{isAr ? "تمت الإضافة" : "Added"}</span>
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
}
