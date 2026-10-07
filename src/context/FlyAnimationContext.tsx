"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import Image from "next/image";
import { Check, ShoppingBag, Heart, X, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartActions } from "@/context/CartContext";
import styles from "./FlyAnimationContext.module.css";

export interface FlyOptions {
  startElement?: HTMLElement | null;
  startRect?: { top: number; left: number; width: number; height: number };
  image: string;
  type?: "cart" | "wishlist";
  title?: string;
  subtitle?: string;
}

interface ToastData {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  type: "cart" | "wishlist";
}

interface ImpactData {
  id: string;
  x: number;
  y: number;
  type: "cart" | "wishlist";
}

interface FlyAnimationContextType {
  triggerFlyAnimation: (options: FlyOptions) => void;
}

const FlyAnimationContext = createContext<FlyAnimationContextType | undefined>(
  undefined
);

export const FlyAnimationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { locale, direction } = useLanguage();
  const { setIsCartOpen, setIsWishlistOpen } = useCartActions();
  const [toast, setToast] = useState<ToastData | null>(null);
  const [ripples, setRipples] = useState<ImpactData[]>([]);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAr = locale === "ar";
  const isRtl = direction === "rtl";

  const triggerFlyAnimation = useCallback(
    (options: FlyOptions) => {
      if (typeof window === "undefined") return;

      const {
        startElement,
        startRect: customStartRect,
        image,
        type = "cart",
        title,
        subtitle,
      } = options;

      // 1. Calculate Start Rect for Perfume Bottle (56px x 72px)
      let sWidth = 56;
      let sHeight = 72;
      let sX = window.innerWidth / 2 - sWidth / 2;
      let sY = window.innerHeight / 2 - sHeight / 2;

      if (startElement) {
        const r = startElement.getBoundingClientRect();
        sX = r.left + r.width / 2 - sWidth / 2;
        sY = r.top + r.height / 2 - sHeight / 2;
      } else if (customStartRect) {
        sX = customStartRect.left + customStartRect.width / 2 - sWidth / 2;
        sY = customStartRect.top + customStartRect.height / 2 - sHeight / 2;
      }

      // 2. Find Target Element & Coordinates (On mobile <= 768px, target Bottom Navigation)
      const isMobile = window.innerWidth <= 768;

      let targetElement: HTMLElement | null = null;
      if (isMobile) {
        if (type === "cart") {
          targetElement =
            document.getElementById("bottom-nav-cart-btn") ||
            document.getElementById("header-cart-btn");
        } else {
          targetElement =
            document.getElementById("bottom-nav-wishlist-btn") ||
            document.getElementById("header-wishlist-btn");
        }
      } else {
        if (type === "cart") {
          targetElement =
            document.getElementById("header-cart-btn") ||
            document.getElementById("bottom-nav-cart-btn");
        } else {
          targetElement =
            document.getElementById("header-wishlist-btn") ||
            document.getElementById("bottom-nav-wishlist-btn");
        }
      }

      let tX = isRtl ? 36 : window.innerWidth - 68;
      let tY = isMobile ? window.innerHeight - 56 : 32;

      if (targetElement) {
        const tr = targetElement.getBoundingClientRect();
        if (tr.width > 0 && tr.height > 0) {
          tX = tr.left + tr.width / 2 - sWidth / 2;
          tY = tr.top + tr.height / 2 - sHeight / 2;
        }
      }

      // 3. Create DOM Ghost Node for the pure Perfume Bottle
      const ghost = document.createElement("div");
      ghost.className = styles.flyingGhost;
      ghost.style.width = `${sWidth}px`;
      ghost.style.height = `${sHeight}px`;
      ghost.style.left = `0px`;
      ghost.style.top = `0px`;

      const img = document.createElement("img");
      img.src = image || "/products/100ml.webp";
      img.alt = title || "Perfume";
      img.className = styles.flyingGhostImg;
      ghost.appendChild(img);

      if (type === "wishlist") {
        const heart = document.createElement("div");
        heart.className = styles.flyingGhostHeart;
        heart.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
        ghost.appendChild(heart);
      }

      document.body.appendChild(ghost);

      // Trajectory Math: Direction-aware physics (Downward for mobile bottom nav, Upward for desktop header)
      const deltaX = tX - sX;
      const deltaY = tY - sY;

      let keyframes: Keyframe[] = [];

      if (deltaY > 0) {
        // Flying DOWNWARDS to Bottom Navigation (Mobile)
        keyframes = [
          {
            transform: `translate3d(${sX}px, ${sY}px, 0) scale(0.35) rotate(0deg)`,
            opacity: 0.85,
            offset: 0,
          },
          {
            // Subtle upward pop before descending
            transform: `translate3d(${sX + deltaX * 0.08}px, ${sY - 28}px, 0) scale(1.15) rotate(${
              type === "cart" ? -10 : 10
            }deg)`,
            opacity: 1,
            offset: 0.16,
          },
          {
            // Smooth flowing downward arc
            transform: `translate3d(${sX + deltaX * 0.72}px, ${sY + deltaY * 0.62}px, 0) scale(0.55) rotate(${
              type === "cart" ? 10 : -10
            }deg)`,
            opacity: 0.96,
            offset: 0.72,
          },
          {
            // Enters cleanly into the bottom nav icon
            transform: `translate3d(${tX}px, ${tY}px, 0) scale(0.08) rotate(0deg)`,
            opacity: 0,
            offset: 1,
          },
        ];
      } else {
        // Flying UPWARDS to Header (Desktop)
        const peakY = Math.min(sY - 60, tY - 25);
        keyframes = [
          {
            transform: `translate3d(${sX}px, ${sY}px, 0) scale(0.35) rotate(0deg)`,
            opacity: 0.85,
            offset: 0,
          },
          {
            transform: `translate3d(${sX + deltaX * 0.08}px, ${sY - 50}px, 0) scale(1.15) rotate(${
              type === "cart" ? -12 : 12
            }deg)`,
            opacity: 1,
            offset: 0.18,
          },
          {
            transform: `translate3d(${sX + deltaX * 0.72}px, ${
              peakY + (tY - peakY) * 0.65
            }px, 0) scale(0.55) rotate(${type === "cart" ? 10 : -10}deg)`,
            opacity: 0.96,
            offset: 0.72,
          },
          {
            transform: `translate3d(${tX}px, ${tY}px, 0) scale(0.1) rotate(0deg)`,
            opacity: 0,
            offset: 1,
          },
        ];
      }

      const anim = ghost.animate(keyframes, {
        duration: 980,
        easing: "cubic-bezier(0.25, 0.85, 0.3, 1)",
        fill: "forwards",
      });

      anim.onfinish = () => {
        ghost.remove();

        if (targetElement) {
          targetElement.classList.add("header-icon-impact");
          setTimeout(() => {
            targetElement?.classList.remove("header-icon-impact");
          }, 600);
        }

        // Custom window event in case components listen
        window.dispatchEvent(
          new CustomEvent("juvenile:fly-impact", {
            detail: { type, title, image },
          })
        );

        // 5. Show Luxury Floating Toast (Desktop only)
        if (title) {
          const impactId = `${Date.now()}-${Math.random()}`;
          if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
          setToast({
            id: impactId,
            image: image || "/products/100ml.webp",
            title,
            subtitle:
              subtitle ||
              (type === "cart"
                ? isAr
                  ? "تمت الإضافة إلى السلة"
                  : "Added to Cart"
                : isAr
                ? "تمت الإضافة إلى المفضلة"
                : "Added to Wishlist"),
            type,
          });

          toastTimeoutRef.current = setTimeout(() => {
            setToast(null);
          }, 3200);
        }
      };
    },
    [isRtl, isAr]
  );

  const handleToastAction = useCallback(() => {
    if (!toast) return;
    if (toast.type === "cart") {
      setIsWishlistOpen(false);
      setIsCartOpen(true);
    } else {
      setIsCartOpen(false);
      setIsWishlistOpen(true);
    }
    setToast(null);
  }, [toast, setIsCartOpen, setIsWishlistOpen]);

  return (
    <FlyAnimationContext.Provider value={{ triggerFlyAnimation }}>
      {children}

      {/* Floating Luxury Toast Notification */}
      <div
        className={`${styles.toastWrapper} ${
          toast ? styles.toastWrapperVisible : ""
        }`}
      >
        {toast && (
          <div className={styles.toastPill} role="status" aria-live="polite">
            <div className={styles.toastThumb}>
              <Image
                src={toast.image}
                alt={toast.title}
                width={36}
                height={36}
                className={styles.toastThumbImg}
              />
            </div>
            <div className={styles.toastContent}>
              <span className={styles.toastTitle}>{toast.title}</span>
              <span className={styles.toastSubtitle}>
                <Check size={13} className={styles.toastCheckIcon} />
                {toast.subtitle}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToastAction}
              className={styles.toastActionBtn}
            >
              <span>
                {toast.type === "cart"
                  ? isAr
                    ? "عرض السلة"
                    : "View Cart"
                  : isAr
                  ? "عرض المفضلة"
                  : "View Wishlist"}
              </span>
              <ArrowUpRight size={13} />
            </button>
            <button
              type="button"
              onClick={() => setToast(null)}
              className={styles.toastCloseBtn}
              aria-label="إغلاق"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </FlyAnimationContext.Provider>
  );
};

export const useFlyAnimation = () => {
  const context = useContext(FlyAnimationContext);
  if (!context) {
    // Graceful fallback if called outside provider
    return {
      triggerFlyAnimation: () => {},
    };
  }
  return context;
};
