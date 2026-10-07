"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingBag, Heart, User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import styles from "./BottomNavigation.module.css";

interface BottomNavigationProps {
  cartCount?: number;
}

type TabType = "home" | "cart" | "wishlist" | "profile";

export const BottomNavigation: React.FC<BottomNavigationProps> = React.memo(() => {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const {
    cartCount,
    isCartOpen,
    setIsCartOpen,
    wishlistItems,
    isWishlistOpen,
    setIsWishlistOpen,
    isAuthOpen,
    setIsAuthOpen,
  } = useCart();
  const [activeTab, setActiveTab] = useState<TabType>("home");

  const [cartImpact, setCartImpact] = useState(false);
  const [wishlistImpact, setWishlistImpact] = useState(false);

  // Listen for fly-to-target impact animations
  useEffect(() => {
    const handleFlyImpact = (e: Event) => {
      const customEvent = e as CustomEvent<{ type?: "cart" | "wishlist" }>;
      const type = customEvent.detail?.type || "cart";
      if (type === "cart") {
        setCartImpact(true);
        setTimeout(() => setCartImpact(false), 700);
      } else {
        setWishlistImpact(true);
        setTimeout(() => setWishlistImpact(false), 700);
      }
    };

    window.addEventListener("juvenile:fly-impact", handleFlyImpact);
    return () => window.removeEventListener("juvenile:fly-impact", handleFlyImpact);
  }, []);

  // Keep bottom navigation tab indicator in sync with whichever drawer/modal is open
  useEffect(() => {
    if (isCartOpen) {
      setActiveTab("cart");
    } else if (isWishlistOpen) {
      setActiveTab("wishlist");
    } else if (isAuthOpen) {
      setActiveTab("profile");
    } else {
      setActiveTab("home");
    }
  }, [isCartOpen, isWishlistOpen, isAuthOpen]);

  const handleTabClick = (tabId: TabType) => {
    if (tabId === "home") {
      setIsCartOpen(false);
      setIsWishlistOpen(false);
      setIsAuthOpen(false);
      setActiveTab("home");
      if (pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        router.push("/");
      }
    } else if (tabId === "cart") {
      setIsWishlistOpen(false);
      setIsAuthOpen(false);
      setIsCartOpen(true);
      setActiveTab("cart");
    } else if (tabId === "wishlist") {
      setIsCartOpen(false);
      setIsAuthOpen(false);
      setIsWishlistOpen(true);
      setActiveTab("wishlist");
    } else if (tabId === "profile") {
      setIsCartOpen(false);
      setIsWishlistOpen(false);
      setIsAuthOpen(true);
      setActiveTab("profile");
    }
  };

  const tabs = [
    {
      id: "home" as TabType,
      label: t.bottomNav.home,
      icon: Home,
    },
    {
      id: "cart" as TabType,
      label: t.bottomNav.cart,
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: "wishlist" as TabType,
      label: t.bottomNav.wishlist,
      icon: Heart,
    },
    {
      id: "profile" as TabType,
      label: t.bottomNav.profile,
      icon: User,
    },
  ];

  const isAnyDrawerOpen = isCartOpen || isWishlistOpen || isAuthOpen;
  const isBottomNavHidden = isAnyDrawerOpen;

  const currentPath = (pathname || "") + (typeof window !== "undefined" ? window.location.pathname : "");
  if (
    !pathname ||
    pathname === "/admin" ||
    pathname.startsWith("/admin") ||
    pathname.includes("admin") ||
    pathname === "/atelier-gate" ||
    pathname.startsWith("/atelier-gate") ||
    pathname.includes("atelier-gate") ||
    pathname === "/checkout" ||
    pathname.startsWith("/checkout") ||
    pathname.includes("checkout") ||
    currentPath.includes("admin") ||
    currentPath.includes("atelier-gate") ||
    currentPath.includes("checkout")
  ) {
    return null;
  }

  return (
    <nav
      className={`${styles.bottomNavContainer} ${isBottomNavHidden ? styles.bottomNavHidden : ""}`}
      aria-label={t.bottomNav.home}
      aria-hidden={isBottomNavHidden}
    >
      <div className={styles.glassPill}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              id={
                tab.id === "cart"
                  ? "bottom-nav-cart-btn"
                  : tab.id === "wishlist"
                  ? "bottom-nav-wishlist-btn"
                  : undefined
              }
              onClick={() => handleTabClick(tab.id)}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""} ${
                tab.id === "cart" && cartImpact ? styles.itemImpactCart : ""
              } ${
                tab.id === "wishlist" && wishlistImpact ? styles.itemImpactWishlist : ""
              }`}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Icon Circle Container */}
              <div className={styles.iconWrapper}>
                <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />

                {/* Cart Badge with Count & Impact Animation */}
                {tab.id === "cart" && cartCount > 0 && (
                  <span
                    className={`${styles.bottomNavBadge} ${
                      cartImpact ? styles.bottomNavBadgePulse : ""
                    }`}
                  >
                    {cartCount}
                  </span>
                )}

                {/* Wishlist Dot Badge with Impact Animation */}
                {tab.id === "wishlist" && wishlistItems && wishlistItems.length > 0 && (
                  <span
                    className={`${styles.bottomNavDotBadge} ${
                      wishlistImpact ? styles.bottomNavBadgePulse : ""
                    }`}
                  />
                )}
              </div>

              {/* Animated Label Pill (Visible when active) */}
              {isActive && <span className={styles.navLabel}>{tab.label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNavigation.displayName = "BottomNavigation";
