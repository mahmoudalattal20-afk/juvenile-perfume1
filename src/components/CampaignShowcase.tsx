"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ShoppingBag, Check, Heart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useFlyAnimation } from "@/context/FlyAnimationContext";
import styles from "./CampaignShowcase.module.css";

type CategoryKey = "women" | "men" | "unisex";

interface CategoryProduct {
  id: string;
  name: { ar: string; en: string };
  type: { ar: string; en: string };
  notes: { ar: string; en: string };
  price: { ar: string; en: string };
  image: string;
}

const categoryProducts: Record<CategoryKey, CategoryProduct[]> = {
  women: [
    {
      id: "rose-velvet",
      name: { ar: "روز فلفيت", en: "ROSE VELVET" },
      type: { ar: "أو دو بارفان • 75 مل", en: "Eau de Parfum • 75ml" },
      notes: { ar: "ورد جوري • فانيلا مدخنة • باتشولي", en: "Damask Rose • Vanilla • Patchouli" },
      price: { ar: "١,٥٥٠ ج.م", en: "1,550 LE" },
      image: "/products/rose-velvet.jpg",
    },
    {
      id: "fleur-nuit",
      name: { ar: "فلور دي نوي", en: "FLEUR DE NUIT" },
      type: { ar: "خلاصة عطر نقي • 100 مل", en: "Extrait de Parfum • 100ml" },
      notes: { ar: "ياسمين ليلي • خشب الصندل • عنبر", en: "Night Jasmine • Sandalwood • Amber" },
      price: { ar: "١,٨٥٠ ج.م", en: "1,850 LE" },
      image: "/products/hommage.jpg",
    },
    {
      id: "velvet-musk",
      name: { ar: "فيلفيت مسك", en: "VELVET MUSK" },
      type: { ar: "أو دو بارفان • 50 مل", en: "Eau de Parfum • 50ml" },
      notes: { ar: "مسك مخملي • زنبق الوادي • أخشاب", en: "Velvet Musk • White Lily • Woods" },
      price: { ar: "١,٦٠٠ ج.م", en: "1,600 LE" },
      image: "/products/caden.jpg",
    },
  ],
  men: [
    {
      id: "noir-absolu",
      name: { ar: "نوار أبسولو", en: "NOIR ABSOLU" },
      type: { ar: "أو دو بارفان • 100 مل", en: "Eau de Parfum • 100ml" },
      notes: { ar: "جلد إيطالي • بخور سيامي • نجيل الهند", en: "Tuscan Leather • Incense • Vetiver" },
      price: { ar: "١,٩٠٠ ج.م", en: "1,900 LE" },
      image: "/products/noir-absolu.jpg",
    },
    {
      id: "oud-royal",
      name: { ar: "عود رويال نيش", en: "OUD ROYAL" },
      type: { ar: "دهن عود بيور • 12 مل", en: "Pure Attar Oil • 12ml" },
      notes: { ar: "دهن عود كلمنتان • خشب الأرز • هيل", en: "Kalimantan Oud • Cedarwood • Cardamom" },
      price: { ar: "١,٩٥٠ ج.م", en: "1,950 LE" },
      image: "/products/oud.jpg",
    },
    {
      id: "leather-intense",
      name: { ar: "ليذر إنتنس", en: "LEATHER INTENSE" },
      type: { ar: "خلاصة عطر مركز • 100 مل", en: "Intense Extrait • 100ml" },
      notes: { ar: "تونكا مدخنة • زعفران أسود • تبغ", en: "Smoky Tonka • Saffron • Tobacco" },
      price: { ar: "١,٧٥٠ ج.م", en: "1,750 LE" },
      image: "/products/caden.jpg",
    },
  ],
  unisex: [
    {
      id: "aura-gold",
      name: { ar: "أورا جولد", en: "AURA GOLD" },
      type: { ar: "أو دو بارفان • 100 مل", en: "Eau de Parfum • 100ml" },
      notes: { ar: "عنبر ذهبي • زعفران ملكي • مسك أبيض", en: "Golden Amber • Saffron • White Musk" },
      price: { ar: "١,٨٠٠ ج.م", en: "1,800 LE" },
      image: "/products/aura-gold.jpg",
    },
    {
      id: "amber-saffron",
      name: { ar: "عنبر زعفران", en: "AMBER SAFFRON" },
      type: { ar: "خلاصة عطر نقي • 100 مل", en: "Extrait de Parfum • 100ml" },
      notes: { ar: "عنبر خام • خشب الغاياك • قرفة", en: "Raw Amber • Guaiac Wood • Cinnamon" },
      price: { ar: "١,٨٨٠ ج.م", en: "1,880 LE" },
      image: "/products/hommage.jpg",
    },
    {
      id: "misk-tahara",
      name: { ar: "مسك الطهارة نيش", en: "MISK TAHARA" },
      type: { ar: "مسك طبيعي نقي • 30 مل", en: "Pure Natural Musk • 30ml" },
      notes: { ar: "مسك الطهارة الطبيعي • أزهار بيضاء", en: "Musk Tahara • White Flowers • Powder" },
      price: { ar: "١,٥٠٠ ج.م", en: "1,500 LE" },
      image: "/products/oud.jpg",
    },
  ],
};

interface Props {
  onAddToCart?: () => void;
}

export const CampaignShowcase: React.FC<Props> = ({ onAddToCart }) => {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const { addToCart, addToWishlist, removeFromWishlist } = useCart();
  const { triggerFlyAnimation } = useFlyAnimation();

  const [activeCategory, setActiveCategory] = useState<CategoryKey>("women");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleAdd = useCallback(
    (product: CategoryProduct, e?: React.MouseEvent) => {
      if (addedIds.has(product.id)) return;

      const btnEl = e?.currentTarget as HTMLElement | undefined;

      const pTitle = product.name[isAr ? "ar" : "en"];
      const pPrice = product.price[isAr ? "ar" : "en"];

      triggerFlyAnimation({
        startElement: btnEl,
        image: product.image,
        type: "cart",
        title: pTitle,
        subtitle: pPrice,
      });

      setAddedIds((prev) => new Set(prev).add(product.id));
      addToCart(
        {
          id: product.id,
          name: pTitle,
          type: product.type[isAr ? "ar" : "en"],
          price: parseInt(product.price.en.replace(/[^0-9]/g, "")) || 8950,
          formattedPrice: pPrice,
          image: product.image,
        },
        false
      );
      onAddToCart?.();

      setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
      }, 1500);
    },
    [addedIds, onAddToCart, addToCart, isAr, triggerFlyAnimation]
  );

  const toggleWishlist = (product: CategoryProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    const btnEl = e.currentTarget as HTMLElement;
    const cardEl = btnEl.closest(`.${styles.productCard}`) as HTMLElement | null;
    const imgEl = (cardEl?.querySelector(`.${styles.productImg}`) as HTMLElement) || btnEl;

    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
        removeFromWishlist(product.id);
      } else {
        next.add(product.id);
        triggerFlyAnimation({
          startElement: imgEl,
          image: product.image,
          type: "wishlist",
          title: product.name[isAr ? "ar" : "en"],
        });
        addToWishlist({
          id: product.id,
          name: product.name[isAr ? "ar" : "en"],
          price: product.price[isAr ? "ar" : "en"],
          image: product.image,
        });
      }
      return next;
    });
  };

  const currentProducts = categoryProducts[activeCategory];

  return (
    <section className={styles.section} ref={sectionRef} id="collections">
      <div className={styles.container}>
        {/* Editorial Section Header */}
        <div className={`${styles.header} ${isVisible ? styles.headerVisible : ""}`}>
          <span className={styles.subTitle}>
            {isAr ? "عطور صُممت لتدوم وتلفت الأنظار" : "CURATED FOR EVERY EXPRESSION"}
          </span>
          <h2 className={styles.mainTitle}>
            {isAr ? "The Collections" : "The Collections"}
          </h2>
          <div className={styles.dividerLine} />

          {/* Clean Category Tabs: نسائي • رجالي • Unisex */}
          <div className={styles.filterBar}>
            <button
              className={`${styles.filterBtn} ${activeCategory === "women" ? styles.filterBtnActive : ""}`}
              onClick={() => setActiveCategory("women")}
            >
              {isAr ? "نسائي" : "Femme"}
            </button>
            <button
              className={`${styles.filterBtn} ${activeCategory === "men" ? styles.filterBtnActive : ""}`}
              onClick={() => setActiveCategory("men")}
            >
              {isAr ? "رجالي" : "Homme"}
            </button>
            <button
              className={`${styles.filterBtn} ${activeCategory === "unisex" ? styles.filterBtnActive : ""}`}
              onClick={() => setActiveCategory("unisex")}
            >
              Unisex
            </button>
          </div>
        </div>

        {/* 3-Column Luxury Signature Cards */}
        <div key={activeCategory} className={styles.stageWrapper}>
          <div className={styles.productGrid}>
            {currentProducts.map((product, idx) => {
              const isAdded = addedIds.has(product.id);
              const isWishlisted = wishlistIds.has(product.id);

              return (
                <div
                  key={product.id}
                  className={styles.productCard}
                  style={{ animationDelay: `${idx * 100}ms` }}
                  onClick={() => handleAdd(product)}
                >
                  {/* Inner Studio Well */}
                  <div className={styles.studioWell}>
                    {/* Category Ambient Halo on Hover */}
                    <div
                      className={`${styles.ambientHalo} ${
                        activeCategory === "women"
                          ? styles.haloFemme
                          : activeCategory === "men"
                          ? styles.haloHomme
                          : styles.haloUnisex
                      }`}
                    />

                    {/* Subtle Corner Badge */}
                    <span className={styles.subtleBadge}>
                      {activeCategory === "women"
                        ? "FEMME"
                        : activeCategory === "men"
                        ? "HOMME"
                        : "UNISEX"}
                    </span>

                    {/* Glassmorphic Wishlist Button */}
                    <button
                      className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistBtnActive : ""}`}
                      onClick={(e) => toggleWishlist(product, e)}
                      aria-label="Wishlist"
                    >
                      <Heart
                        size={17}
                        strokeWidth={1.8}
                        fill={isWishlisted ? "#cf142b" : "none"}
                      />
                    </button>

                    {/* Bottle Container with Multiply Blending */}
                    <div className={styles.bottleContainer}>
                      <Image
                        src={product.image}
                        alt={product.name[isAr ? "ar" : "en"]}
                        width={300}
                        height={340}
                        className={styles.productImage}
                        draggable={false}
                      />
                    </div>
                  </div>

                  {/* Card Info & Action Button */}
                  <div className={styles.cardInfo}>
                    <span className={styles.productNotes}>
                      {product.notes[isAr ? "ar" : "en"]}
                    </span>
                    <h4 className={styles.productName}>
                      {product.name[isAr ? "ar" : "en"]}
                    </h4>
                    <span className={styles.productPrice}>
                      {product.price[isAr ? "ar" : "en"]}
                    </span>

                    {/* Modern Action Button */}
                    <button
                      className={`${styles.actionBtn} ${isAdded ? styles.actionBtnSuccess : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd(product, e);
                      }}
                    >
                      {isAdded ? (
                        <>
                          <Check className={styles.btnIcon} />
                          <span>{isAr ? "تمت الإضافة للحقيبة" : "Added to Bag"}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className={styles.btnIcon} />
                          <span>{isAr ? "أضف للحقيبة" : "Add to Bag"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
