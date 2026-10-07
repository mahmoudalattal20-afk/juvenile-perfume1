"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Locale, Direction, translations, Translations } from "@/i18n/translations";

interface LanguageContextType {
  locale: Locale;
  direction: Direction;
  t: Translations;
  setLocale: (locale: Locale) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "juvenile_language";

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  initialLocale = "ar",
}) => {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Sync cookie and localStorage on initial mount if needed
  useEffect(() => {
    try {
      const cookieMatch = document.cookie.match(/(?:^|; )juvenile_language=([^;]*)/);
      const cookieVal = cookieMatch ? (decodeURIComponent(cookieMatch[1]) as Locale) : null;
      const localVal = localStorage.getItem(STORAGE_KEY) as Locale | null;

      const activeLang = cookieVal || localVal;
      if (activeLang && (activeLang === "ar" || activeLang === "en")) {
        // If cookie was missing, make sure it's set for all subsequent server requests
        if (!cookieVal) {
          document.cookie = `${STORAGE_KEY}=${activeLang}; path=/; max-age=31536000; SameSite=Lax`;
        }
        if (activeLang !== locale) {
          setLocaleState(activeLang);
        }
      }
    } catch {
      // Ignore storage errors
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const direction: Direction = locale === "ar" ? "rtl" : "ltr";

  // Update DOM html lang and dir
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = direction;
    }
  }, [locale, direction]);

  const setLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;

    const applyLanguageChange = () => {
      setLocaleState(newLocale);
      try {
        // 1. Persistent cookie with 1 year expiration (sent on HTTP request to server)
        document.cookie = `${STORAGE_KEY}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
        // 2. LocalStorage redundancy
        localStorage.setItem(STORAGE_KEY, newLocale);
        // 3. Immediate DOM attributes update
        if (typeof document !== "undefined") {
          document.documentElement.lang = newLocale;
          document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
        }
      } catch {
        // Ignore storage errors
      }
    };

    // 2026 Haute Luxury View Transition for silky, eye-friendly language switching
    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      typeof (document as unknown as { startViewTransition: (cb: () => void) => { finished: Promise<void> } }).startViewTransition === "function"
    ) {
      document.documentElement.classList.add("lang-transitioning");
      try {
        const transition = (document as unknown as { startViewTransition: (cb: () => void) => { finished: Promise<void> } }).startViewTransition(() => {
          applyLanguageChange();
        });
        transition.finished.finally(() => {
          document.documentElement.classList.remove("lang-transitioning");
        });
      } catch {
        applyLanguageChange();
        document.documentElement.classList.remove("lang-transitioning");
      }
    } else {
      // Graceful fallback: micro-veil prevents jarring directional snap
      if (typeof document !== "undefined") {
        document.documentElement.classList.add("lang-transitioning");
        setTimeout(() => {
          applyLanguageChange();
          setTimeout(() => {
            document.documentElement.classList.remove("lang-transitioning");
          }, 180);
        }, 50);
      } else {
        applyLanguageChange();
      }
    }
  };

  const toggleLanguage = () => {
    const next = locale === "ar" ? "en" : "ar";
    setLocale(next);
  };

  const value: LanguageContextType = {
    locale,
    direction,
    t: translations[locale],
    setLocale,
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
