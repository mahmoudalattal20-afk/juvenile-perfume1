"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./ShopByCategory.module.css";

type Category = "women" | "men" | "unisex";

interface Product {
  id: string;
  name: string;
  type: string;
  price: string;
  image: string;
  category: Category;
}

const productsData: Record<string, Product[]> = {
  ar: [
    { id: "rose-velvet", name: "ROSE VELVET", type: "أو دو بارفان • 75 مل", price: "1,550 ج.م", image: "/products/rose-velvet.jpg", category: "women" },
    { id: "fleur-nuit", name: "FLEUR DE NUIT", type: "خلاصة عطر نقي • 100 مل", price: "1,850 ج.م", image: "/products/hommage.jpg", category: "women" },
    { id: "velvet-musk-w", name: "VELVET MUSK", type: "أو دو بارفان • 50 مل", price: "1,600 ج.م", image: "/products/caden.jpg", category: "women" },
    { id: "noir-absolu", name: "NOIR ABSOLU", type: "أو دو بارفان • 100 مل", price: "1,900 ج.م", image: "/products/noir-absolu.jpg", category: "men" },
    { id: "oud-royal", name: "OUD ROYAL", type: "دهن عود بيور نيش • 12 مل", price: "1,950 ج.م", image: "/products/oud.jpg", category: "men" },
    { id: "leather-intense", name: "LEATHER INTENSE", type: "خلاصة عطر مركز • 100 مل", price: "1,750 ج.م", image: "/products/caden.jpg", category: "men" },
    { id: "aura-gold", name: "AURA GOLD", type: "أو دو بارفان • 100 مل", price: "1,800 ج.م", image: "/products/aura-gold.jpg", category: "unisex" },
    { id: "amber-saffron", name: "AMBER SAFFRON", type: "خلاصة عطر نقي • 100 مل", price: "1,880 ج.م", image: "/products/hommage.jpg", category: "unisex" },
    { id: "misk-tahara", name: "MISK TAHARA", type: "مسك طبيعي نقي • 30 مل", price: "1,500 ج.م", image: "/products/oud.jpg", category: "unisex" },
  ],
  en: [
    { id: "rose-velvet", name: "ROSE VELVET", type: "Eau de Parfum • 75ml", price: "1,550 LE", image: "/products/rose-velvet.jpg", category: "women" },
    { id: "fleur-nuit", name: "FLEUR DE NUIT", type: "Extrait de Parfum • 100ml", price: "1,850 LE", image: "/products/hommage.jpg", category: "women" },
    { id: "velvet-musk-w", name: "VELVET MUSK", type: "Eau de Parfum • 50ml", price: "1,600 LE", image: "/products/caden.jpg", category: "women" },
    { id: "noir-absolu", name: "NOIR ABSOLU", type: "Eau de Parfum • 100ml", price: "1,900 LE", image: "/products/noir-absolu.jpg", category: "men" },
    { id: "oud-royal", name: "OUD ROYAL", type: "Pure Attar Oil • 12ml", price: "1,950 LE", image: "/products/oud.jpg", category: "men" },
    { id: "leather-intense", name: "LEATHER INTENSE", type: "Intense Extrait de Parfum • 100ml", price: "1,750 LE", image: "/products/caden.jpg", category: "men" },
    { id: "aura-gold", name: "AURA GOLD", type: "Eau de Parfum • 100ml", price: "1,800 LE", image: "/products/aura-gold.jpg", category: "unisex" },
    { id: "amber-saffron", name: "AMBER SAFFRON", type: "Extrait de Parfum • 100ml", price: "1,880 LE", image: "/products/hommage.jpg", category: "unisex" },
    { id: "misk-tahara", name: "MISK TAHARA", type: "Pure Natural Musk • 30ml", price: "1,500 LE", image: "/products/oud.jpg", category: "unisex" },
  ],
};

const sectionText = {
  ar: {
    title: "SHOP BY CATEGORY",
    subtitle: "تسوق حسب الفئة",
    tabs: { women: "نسائي", men: "رجالي", unisex: "للجنسين" },
    addToCart: "أضف للسلة",
    added: "تمت الإضافة",
    badges: { women: "نسائي", men: "رجالي", unisex: "للجنسين" },
  },
  en: {
    title: "SHOP BY CATEGORY",
    subtitle: "Curated For Every Expression",
    tabs: { women: "Women", men: "Men", unisex: "Unisex" },
    addToCart: "Add to Bag",
    added: "Added",
    badges: { women: "Women", men: "Men", unisex: "Unisex" },
  },
};

interface Props {
  onAddToCart?: () => void;
}

export function ShopByCategory({ onAddToCart }: Props) {
  const { locale } = useLanguage();
  const t = sectionText[locale];
  const products = productsData[locale];

  const [activeCategory, setActiveCategory] = useState<Category>("women");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection observer for entrance
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const filteredProducts = products.filter((p) => p.category === activeCategory);

  const handleAdd = useCallback(
    (id: string) => {
      if (addedIds.has(id)) return;
      setAddedIds((prev) => new Set(prev).add(id));
      onAddToCart?.();
      setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 1500);
    },
    [addedIds, onAddToCart]
  );

  const badgeClass = (cat: Category) => {
    if (cat === "women") return styles.badgeWomen;
    if (cat === "men") return styles.badgeMen;
    return styles.badgeUnisex;
  };

  const categories: Category[] = ["women", "men", "unisex"];

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2
              className={styles.title}
              style={locale === "ar" ? { fontFamily: "var(--font-readex), 'Readex Pro', sans-serif" } : undefined}
            >
              {t.title}
            </h2>
            <p
              className={styles.subtitle}
              style={locale === "ar" ? { fontFamily: "var(--font-readex), 'Readex Pro', sans-serif" } : undefined}
            >
              {t.subtitle}
            </p>
          </div>

          {/* Category Tabs */}
          <div className={styles.tabsWrapper}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.tab} ${activeCategory === cat ? styles.tabActive : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {t.tabs[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className={styles.grid}>
          {filteredProducts.map((product, idx) => {
            const isAdded = addedIds.has(product.id);
            return (
              <div
                key={`${activeCategory}-${product.id}`}
                className={`${styles.card} ${isVisible ? styles.cardVisible : styles.cardHidden}`}
                style={{ transitionDelay: isVisible ? `${Math.min(idx * 30, 120)}ms` : "0ms" }}
              >
                {/* Category Badge */}
                <span className={`${styles.categoryBadge} ${badgeClass(product.category)}`}>
                  {t.badges[product.category]}
                </span>

                {/* Wishlist */}
                <button className={styles.wishlistBtn} aria-label="Wishlist">
                  <Heart size={16} />
                </button>

                {/* Product Image */}
                <Link href={`/product/${product.id}`} className={styles.imageContainer} style={{ display: "block" }}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className={styles.productImage}
                    unoptimized={true}
                    decoding="async"
                    draggable={false}
                  />
                </Link>

                {/* Info */}
                <div className={styles.infoBlock}>
                  <Link href={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <h3 className={styles.productName}>{product.name}</h3>
                  </Link>
                  <span className={styles.productType}>{product.type}</span>
                  <div className={styles.priceRow}>
                    <span className={styles.productPrice}>{product.price}</span>
                    <button
                      className={`${styles.addBtn} ${isAdded ? styles.addBtnSuccess : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd(product.id);
                      }}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} />
                          {t.added}
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} />
                          {t.addToCart}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
