"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Heart, Trash2, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./WishlistDrawer.module.css";

export interface WishlistItem {
  id: string;
  name: string;
  price: string;
  image: string;
}

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: WishlistItem[];
  onRemove: (id: string) => void;
  onAddToCart: (item: WishlistItem) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemove,
  onAddToCart,
}) => {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animateOpen, setAnimateOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let raf1: number;
    let raf2: number;

    if (isOpen) {
      setShouldRender(true);
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setAnimateOpen(true);
        });
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    } else {
      setAnimateOpen(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 420);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard Escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const drawerRef = React.useRef<HTMLElement>(null);
  const itemsListRef = React.useRef<HTMLDivElement>(null);
  const touchStartY = React.useRef<number | null>(null);
  const touchStartScrollTop = React.useRef<number>(0);
  const currentDragY = React.useRef<number>(0);


  // Touch Swipe Down to Dismiss for Mobile Bottom Sheet (Works from Header & Top of List)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartScrollTop.current = itemsListRef.current ? itemsListRef.current.scrollTop : 0;
    currentDragY.current = 0;
    if (drawerRef.current) {
      drawerRef.current.style.transition = "none";
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    const isAtTop = !itemsListRef.current || itemsListRef.current.scrollTop <= 0;

    // Only drag down if pulling down from the top of the scroll list
    if (diff > 0 && isAtTop && touchStartScrollTop.current <= 0) {
      currentDragY.current = diff;
      if (drawerRef.current) {
        drawerRef.current.style.transform = `translate3d(0, ${diff}px, 0)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null) return;
    const finalDiff = currentDragY.current;
    touchStartY.current = null;
    touchStartScrollTop.current = 0;
    currentDragY.current = 0;

    if (finalDiff > 70) {
      if (drawerRef.current) {
        drawerRef.current.style.transition = "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)";
        drawerRef.current.style.transform = "translate3d(0, 100%, 0)";
      }
      onClose();
      setTimeout(() => {
        if (drawerRef.current) {
          drawerRef.current.style.transition = "";
          drawerRef.current.style.transform = "";
        }
      }, 300);
    } else if (finalDiff > 0) {
      if (drawerRef.current) {
        drawerRef.current.style.transition = "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)";
        drawerRef.current.style.transform = "translate3d(0, 0, 0)";
      }
      setTimeout(() => {
        if (drawerRef.current) {
          drawerRef.current.style.transition = "";
          drawerRef.current.style.transform = "";
        }
      }, 300);
    } else {
      if (drawerRef.current) {
        drawerRef.current.style.transition = "";
        drawerRef.current.style.transform = "";
      }
    }
  };

  const { locale } = useLanguage();
  const isAr = locale === "ar";

  if (!mounted || !shouldRender) return null;

  return createPortal(
    <div
      className={`${styles.backdrop} ${animateOpen ? styles.backdropOpen : ""}`}
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <aside
        ref={drawerRef}
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isAr ? "قائمة أمنياتي" : "My Wishlist"}
      >
        {/* iOS Drag Handle Touch Bar */}
        <div
          className={styles.touchArea}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.iosHandleBar} />
        </div>

        <div
          className={styles.header}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.headerTitle}>
            <Heart size={20} className={styles.heartIcon} />
            <h3>{isAr ? "قائمة أمنياتي" : "My Wishlist"}</h3>
            <span className={styles.countBadge}>{items.length}</span>
          </div>
          <button
            onClick={onClose}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className={styles.closeBtn}
            aria-label="Close wishlist"
          >
            <X size={20} />
          </button>
        </div>

        <div
          ref={itemsListRef}
          className={styles.itemsList}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconCircle}>
                <Heart size={36} strokeWidth={1.5} />
              </div>
              <p className={styles.emptyTitle}>
                {isAr ? "قائمة أمنياتك فارغة" : "Your wishlist is empty"}
              </p>
              <p className={styles.emptySubtitle}>
                {isAr
                  ? "احفظ عطورك المفضلة بالنقر على أيقونة القلب في أي عطر"
                  : "Save your favorite scents by clicking the heart icon on any product"}
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className={styles.wishlistItem}>
                <div className={styles.itemImageWrapper}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={72}
                    height={72}
                    className={styles.itemImage}
                  />
                </div>

                <div className={styles.itemDetails}>
                  <h4 className={styles.itemName}>{item.name}</h4>
                  <span className={styles.itemPrice}>{item.price}</span>

                  <div className={styles.actionRow}>
                    <button
                      onClick={() => onAddToCart(item)}
                      className={styles.addBtn}
                    >
                      <ShoppingBag size={14} />
                      <span>{isAr ? "إضافة للسلة" : "Add to Cart"}</span>
                    </button>
                    <button
                      onClick={() => onRemove(item.id)}
                      className={styles.removeBtn}
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>,
    document.body
  );
};
