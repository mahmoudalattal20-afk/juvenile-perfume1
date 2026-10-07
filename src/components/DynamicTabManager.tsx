"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

export const DynamicTabManager: React.FC = () => {
  const { locale } = useLanguage();
  const { cartCount } = useCart();
  const isAr = locale === "ar";

  const originalTitleRef = useRef<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const welcomeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Keep track of the original page title
    if (!originalTitleRef.current || !document.hidden) {
      originalTitleRef.current = document.title;
    }

    const handleVisibilityChange = () => {
      // Clear any pending timers
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (welcomeTimeoutRef.current) {
        clearTimeout(welcomeTimeoutRef.current);
        welcomeTimeoutRef.current = null;
      }

      if (document.hidden) {
        // User switched to another tab
        if (!originalTitleRef.current) {
          originalTitleRef.current = document.title;
        }

        // 1. Luxury Royal Phrasing (👑 Crown)
        let inactiveTitles: string[];

        if (cartCount > 0) {
          inactiveTitles = isAr
            ? [
                `👑 (${cartCount}) محفوظ في حقيبتك...`,
                `👑 (${cartCount}) عطرك بانتظارك في السلة`,
              ]
            : [
                `👑 (${cartCount}) Saved in your bag...`,
                `👑 (${cartCount}) Your scent awaits in cart`,
              ];
        } else {
          inactiveTitles = isAr
            ? [
                "👑 عطرك بانتظارك...",
                "👑 لا زلنا بانتظارك",
              ]
            : [
                "👑 Your scent awaits...",
                "👑 Still here for you",
              ];
        }

        let index = 0;
        document.title = inactiveTitles[0];

        intervalRef.current = setInterval(() => {
          index = (index + 1) % inactiveTitles.length;
          document.title = inactiveTitles[index];
        }, 2500);
      } else {
        // User returned to our tab -> Show brief royal welcome then restore original title
        const welcomeMessage = isAr
          ? "👑 أهلاً بعودتك!"
          : "👑 Welcome back!";

        document.title = welcomeMessage;

        welcomeTimeoutRef.current = setTimeout(() => {
          if (originalTitleRef.current) {
            document.title = originalTitleRef.current;
          }
        }, 1500);
      }
    };

    const handlePageHide = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current);
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted && originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current);
    };
  }, [isAr, cartCount]);

  return null;
};
