"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./CartDrawer.module.css";

export interface CartItem {
  id: string;
  name: string;
  type: string;
  price: number;
  formattedPrice: string;
  image: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const router = useRouter();
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
      // Double rAF guarantees the initial transform (100% or offscreen) is painted by browser
      // before transitioning to translate3d(0, 0, 0), completely eliminating any snap/flicker!
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

  // Lock body scroll on desktop (on mobile touch devices, the full-screen backdrop isolates touch events with zero layout reflow)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth > 640) {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
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
  const currentDragY = React.useRef<number>(0);

  // Touch Swipe Down to Dismiss for Mobile Bottom Sheet (Attached to Header & Drag Handle only)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    currentDragY.current = 0;
    if (drawerRef.current) {
      drawerRef.current.style.transition = "none";
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = e.touches[0].clientY - touchStartY.current;

    // Only allow downward drag
    if (diff > 0) {
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
    currentDragY.current = 0;

    if (finalDiff > 75) {
      // Dismiss sheet smoothly to 100%
      if (drawerRef.current) {
        drawerRef.current.style.transition = "transform 0.30s cubic-bezier(0.32, 0.72, 0, 1)";
        drawerRef.current.style.transform = "translate3d(0, 100%, 0)";
      }
      onClose();
      // Clean up inline styles strictly AFTER the exit slide finishes
      setTimeout(() => {
        if (drawerRef.current) {
          drawerRef.current.style.transition = "";
          drawerRef.current.style.transform = "";
        }
      }, 320);
    } else if (finalDiff > 0) {
      // Snap back smoothly with velvet fluid deceleration
      if (drawerRef.current) {
        drawerRef.current.style.transition = "transform 0.36s cubic-bezier(0.22, 1, 0.36, 1)";
        drawerRef.current.style.transform = "translate3d(0, 0, 0)";
      }
      setTimeout(() => {
        if (drawerRef.current) {
          drawerRef.current.style.transition = "";
          drawerRef.current.style.transform = "";
        }
      }, 380);
    } else {
      if (drawerRef.current) {
        drawerRef.current.style.transition = "";
        drawerRef.current.style.transform = "";
      }
    }
  };

  const { locale, direction } = useLanguage();
  const isAr = locale === "ar";
  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight;

  if (!mounted || !shouldRender) return null;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const formattedTotal = isAr
    ? `${total.toLocaleString("ar-EG")} ج.م`
    : `LE ${total.toLocaleString("en-US")}.00`;

  return createPortal(
    <div
      className={`${styles.backdrop} ${animateOpen ? styles.backdropOpen : ""}`}
      onClick={onClose}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      aria-hidden={!isOpen}
    >
      <aside
        ref={drawerRef}
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isAr ? "سلة التسوق" : "Shopping Cart"}
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

        {/* Header */}
        <div
          className={styles.header}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.headerTitle}>
            <h3>
              {isAr ? "حقيبة التسوق" : "SHOPPING BAG"}
              <span className={styles.itemCount}> ({items.reduce((s, i) => s + i.quantity, 0)})</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className={styles.closeBtn}
            aria-label="Close cart"
          >
            <X size={19} strokeWidth={1.5} />
          </button>
        </div>

        {/* Items List (Pure native frictionless momentum scrolling) */}
        <div
          ref={itemsListRef}
          className={styles.itemsList}
        >
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconCircle}>
                <ShoppingBag size={32} strokeWidth={1.2} />
              </div>
              <p className={styles.emptyTitle}>{isAr ? "حقيبتك فارغة حالياً" : "Your shopping bag is empty"}</p>
              <p className={styles.emptySubtitle}>
                {isAr
                  ? "استكشف إبداعاتنا العطرية الفاخرة واختر ما يعبّر عن تميزك"
                  : "Explore our haute parfumerie collections"}
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImageWrapper}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={76}
                    height={76}
                    className={styles.itemImage}
                  />
                </div>

                <div className={styles.itemDetails}>
                  <div className={styles.itemHeaderRow}>
                    <h4 className={styles.itemName}>{item.name}</h4>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className={styles.removeBtn}
                      aria-label="Remove item"
                    >
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                  <span className={styles.itemType}>{item.type}</span>
                  <span className={styles.itemPrice}>{item.formattedPrice}</span>

                  <div className={styles.quantityRow}>
                    <div className={styles.counter}>
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className={styles.countBtn}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className={styles.countNum}>{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className={styles.countBtn}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Side-by-Side Price & Blue Checkout Bar */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalCol}>
              <span className={styles.totalLabel}>{isAr ? "المجموع" : "Subtotal"}</span>
              <span className={styles.totalValue}>{formattedTotal}</span>
            </div>
            <button
              className={styles.checkoutBtn}
              onClick={() => {
                onClose();
                router.push("/checkout");
              }}
            >
              <span>{isAr ? "متابعة الطلب والدفع" : "Proceed to Checkout"}</span>
              <ArrowIcon size={14} strokeWidth={2.2} />
            </button>
          </div>
        )}
      </aside>
    </div>,
    document.body
  );
};
