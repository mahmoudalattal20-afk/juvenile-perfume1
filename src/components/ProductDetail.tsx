"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Heart,
  ShoppingBag,
  Check,
  CheckCircle2,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  Truck,
  Sparkles,
  Minus,
  Plus,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useCMS } from "@/context/CMSContext";
import { getProductById, PRODUCTS_CATALOG } from "@/data/products";
import styles from "./ProductDetail.module.css";

interface ProductDetailProps {
  productId: string;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
  const { locale, direction } = useLanguage();
  const { cmsData } = useCMS();
  const isAr = locale === "ar";
  const {
    addToCart,
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    setIsCartOpen,
  } = useCart();

  const defaultProduct = getProductById(productId);
  const isDeleted = Boolean(
    cmsData.deletedProducts && cmsData.deletedProducts.includes(productId)
  );
  const product = cmsData.products?.[productId] || defaultProduct;

  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const isWishlisted = wishlistItems.some((w) => w.id === product.id);

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.formattedPrice[locale],
        image: product.image,
      });
    }
  };

  const currentPrice = product.price;
  const currentFormattedPrice = product.formattedPrice[locale];

  // Calculate comparative regular price (custom admin set or fallback 25% higher) & savings
  const originalPriceNumber = product.originalPrice || Math.round((currentPrice * 1.25) / 50) * 50;
  const savingsNumber = originalPriceNumber - currentPrice;
  const originalFormattedPrice = product.formattedOriginalPrice?.[locale] || (isAr
    ? `${originalPriceNumber.toLocaleString("en-US")} ج.م`
    : `${originalPriceNumber.toLocaleString("en-US")} LE`);
  const savingsFormatted = `SAVE ${savingsNumber.toLocaleString("en-US")} EGP`;

  // Delivery date range (between current date + 1 day and + 3 days)
  const getDeliveryDateRange = () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() + 1);
    const end = new Date(now);
    end.setDate(now.getDate() + 3);

    const formatEn = (d: Date) => {
      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
      const dayNum = d.getDate();
      const month = d.toLocaleDateString("en-US", { month: "long" });
      const nth =
        dayNum % 10 === 1 && dayNum !== 11
          ? "st"
          : dayNum % 10 === 2 && dayNum !== 12
          ? "nd"
          : dayNum % 10 === 3 && dayNum !== 13
          ? "rd"
          : "th";
      return `${dayName}, ${dayNum}${nth} ${month}`;
    };

    return {
      start: formatEn(start),
      end: formatEn(end),
    };
  };

  const deliveryDates = getDeliveryDateRange();

  const handleAddToCart = () => {
    setAddedSuccess(true);
    addToCart({
      id: product.id,
      name: product.name,
      type: product.category[locale],
      price: currentPrice,
      formattedPrice: currentFormattedPrice,
      image: product.image,
    });
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setIsCartOpen(true);
  };

  if (isDeleted) {
    return (
      <div className={styles.mainWrapper} style={{ textAlign: "center", padding: "100px 24px" }} dir={direction}>
        <div style={{ maxWidth: 520, margin: "0 auto", background: "#f8f9fa", borderRadius: 24, padding: "48px 32px", border: "1px solid #e9ecef" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fee2e2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 24 }}>
            ✕
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: "#111827" }}>
            {isAr ? "هذا العطر لم يعد متاحاً حالياً" : "This fragrance is currently unavailable"}
          </h2>
          <p style={{ color: "#64748b", marginBottom: 28, fontSize: 14.5, lineHeight: 1.6 }}>
            {isAr
              ? "تم إزالة هذا العطر من قائمة المتجر. يسعدنا استكشاف باقي إصدارات جوفينيل النيش الفاخرة."
              : "This edition has been removed from our catalog. You are invited to explore our other luxury fragrances."}
          </p>
          <Link
            href="/#bestsellers"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: "#0750cd",
              color: "#ffffff",
              borderRadius: 30,
              fontWeight: 700,
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            {isAr ? "تصفح العطور المتوفرة" : "Explore Available Scents"}
          </Link>
        </div>
      </div>
    );
  }

  // Other products for "You May Also Like"
  const allAvailableProducts = cmsData.products
    ? Object.values(cmsData.products)
    : Object.values(PRODUCTS_CATALOG);
  const relatedProducts = allAvailableProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        !(cmsData.deletedProducts && cmsData.deletedProducts.includes(p.id))
    )
    .sort((a, b) => {
      const aIsLinked = (product.relatedProductIds || []).includes(a.id);
      const bIsLinked = (product.relatedProductIds || []).includes(b.id);
      if (aIsLinked && !bIsLinked) return -1;
      if (!aIsLinked && bIsLinked) return 1;
      return 0;
    })
    .slice(0, 4);

  return (
    <div className={styles.mainWrapper}>
      <div className={styles.container}>
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>
            {isAr ? "الرئيسية" : "Home"}
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link href="/#bestsellers" className={styles.breadcrumbLink}>
            {isAr ? "الأيقونات الاستثنائية" : "Iconic Fragrances"}
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </nav>

        {/* Product Core Grid */}
        <div className={styles.productGrid}>
          {/* Gallery Column */}
          <div className={styles.galleryCol}>
            <div className={styles.mainImageStage}>
              <div className={styles.stageBadges}>
                {product.isNew && (
                  <span className={styles.newBadge}>
                    {isAr ? "إصدار حصري 2026" : "EXCLUSIVE 2026"}
                  </span>
                )}
              </div>

              <button
                type="button"
                className={`${styles.wishlistStageBtn} ${
                  isWishlisted ? styles.wishlistStageBtnActive : ""
                }`}
                onClick={toggleWishlist}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  size={20}
                  strokeWidth={2}
                  fill={isWishlisted ? "#cf142b" : "none"}
                />
              </button>

              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                className={styles.bottleImage}
                unoptimized={true}
                decoding="async"
              />
            </div>
          </div>

          {/* Info Column */}
          <div className={styles.infoCol}>
            {/* 1. Rating row at very top */}
            <div className={styles.topRatingRow}>
              <div className={styles.starsGroup}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className={styles.topStarIcon} fill="#eab308" />
                ))}
              </div>
              <span className={styles.topReviewsText}>
                {product.reviewsCount} {isAr ? "مراجعات" : "reviews"}
              </span>
            </div>

            {/* 2. Product Title */}
            <div className={styles.titleWrapper}>
              <h1 className={styles.productTitle}>
                {isAr && product.arabicName ? product.arabicName : product.name}
              </h1>
              {isAr && product.arabicName && (
                <span className={styles.titleSubEn}>{product.name}</span>
              )}
            </div>

            {/* 3. Pricing Row */}
            <div className={styles.pricingContainer}>
              <div className={styles.priceRow}>
                <span className={styles.currentPrice}>{currentFormattedPrice}</span>
                <span className={styles.oldPrice}>{originalFormattedPrice}</span>
              </div>
            </div>

            {/* 4. Description / Story & Inspiration */}
            <p className={styles.descriptionParagraph}>
              {product.description[locale]}
            </p>

            {/* 5. Olfactory Notes Section (الهرم العطري والمكونات) */}
            <div className={styles.editorialSection}>
              <h3 className={styles.sectionHeading}>
                {isAr ? "الهرم العطري والمكونات" : "OLFACTORY NOTES"}
              </h3>
              <div className={styles.notesTable}>
                <div className={styles.notesRow}>
                  <span className={styles.noteLevel}>
                    {isAr ? "القمة العطرية" : "TOP NOTES"}
                  </span>
                  <span className={styles.noteDesc}>
                    {product.pyramid.topNotes[locale]}
                  </span>
                </div>
                <div className={styles.notesRow}>
                  <span className={styles.noteLevel}>
                    {isAr ? "القلب العطري" : "HEART NOTES"}
                  </span>
                  <span className={styles.noteDesc}>
                    {product.pyramid.heartNotes[locale]}
                  </span>
                </div>
                <div className={styles.notesRow}>
                  <span className={styles.noteLevel}>
                    {isAr ? "القاعدة العطرية" : "BASE NOTES"}
                  </span>
                  <span className={styles.noteDesc}>
                    {product.pyramid.baseNotes[locale]}
                  </span>
                </div>
              </div>
            </div>

            {/* 6. 3-Column Key Features Box */}
            <div className={styles.featuresBox}>
              <div className={styles.featureItem}>
                <CheckCircle2 size={19} className={styles.featureIcon} />
                <div className={styles.featureText}>
                  <strong>{isAr ? "ثبات يدوم طوال اليوم" : "All-Day Longevity"}</strong>
                  <span>{isAr ? "رائحة تدوم لساعات طويلة." : "Scent lasts for extensive hours."}</span>
                </div>
              </div>
              <div className={styles.featureItem}>
                <CheckCircle2 size={19} className={styles.featureIcon} />
                <div className={styles.featureText}>
                  <strong>{isAr ? "تميز متفرد" : "Distinct Sillage"}</strong>
                  <span>{isAr ? "عطر فريد لا يُنسى." : "A truly unforgettable signature."}</span>
                </div>
              </div>
              <div className={styles.featureItem}>
                <CheckCircle2 size={19} className={styles.featureIcon} />
                <div className={styles.featureText}>
                  <strong>{isAr ? "آمن على البشرة" : "Skin Safe"}</strong>
                  <span>{isAr ? "خالٍ من المواد الضارة ولطيف على الجلد." : "Clean, pure ingredients gentle on skin."}</span>
                </div>
              </div>
            </div>

            {/* 7. Actions Row: Stepper + Add to Cart */}
            <div className={styles.actionsRow}>
              <button
                type="button"
                className={`${styles.addToBagBtn} ${
                  addedSuccess ? styles.addToBagBtnSuccess : ""
                }`}
                onClick={handleAddToCart}
              >
                {addedSuccess ? (
                  <>
                    <Check size={18} strokeWidth={2.5} />
                    <span>{isAr ? "تمت الإضافة للسلة!" : "Added to Cart!"}</span>
                  </>
                ) : (
                  <span>{isAr ? "اضافه الى السله" : "Add to Cart"}</span>
                )}
              </button>

              <div className={styles.stepper}>
                <button
                  type="button"
                  className={styles.stepBtn}
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
                <span className={styles.stepCount}>{quantity}</span>
                <button
                  type="button"
                  className={styles.stepBtn}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
              </div>
            </div>

            {/* 8. Brand Guarantees Row */}
            <div className={styles.brandGuaranteesRow}>
              <div className={styles.brandGuaranteeItem}>
                <Truck size={19} className={styles.brandIcon} />
                <span>{isAr ? "توصيل خلال 3 ايام" : "Delivery in 3 days"}</span>
              </div>
              <div className={styles.brandGuaranteeItem}>
                <CreditCard size={18} className={styles.brandIcon} />
                <span>{isAr ? "الدفع عند الاستلام" : "Cash on Delivery"}</span>
              </div>
              <div className={styles.brandGuaranteeItem}>
                <RotateCcw size={18} className={styles.brandIcon} />
                <span>{isAr ? "سهوله في الإرجاع" : "Easy Returns"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Perfumes Showcase */}
        <section className={styles.relatedSection}>
          <div className={styles.relatedHeading}>
            <span className={styles.relatedTag}>
              {isAr ? "مختارات فاخرة تليق بذوقك" : "CURATED RECOMMENDATIONS"}
            </span>
            <h2 className={styles.relatedTitle}>
              {isAr ? "روائع عطرية أخرى قد تنال إعجابك" : "Discover More Masterpieces"}
            </h2>
          </div>

          <div className={styles.relatedGrid}>
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                href={`/product/${rel.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "20px",
                    border: "1px solid rgba(15, 23, 42, 0.08)",
                    padding: "12px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "1 / 1.05",
                      borderRadius: "16px",
                      overflow: "hidden",
                      marginBottom: "10px",
                    }}
                  >
                    <Image
                      src={rel.image}
                      alt={rel.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      style={{ objectFit: "cover" }}
                      unoptimized={true}
                      decoding="async"
                    />
                  </div>
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      margin: "4px 0",
                      color: "#0a0f1d",
                    }}
                  >
                    {rel.name}
                  </h3>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0750cd",
                    }}
                  >
                    {rel.formattedPrice[locale]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
