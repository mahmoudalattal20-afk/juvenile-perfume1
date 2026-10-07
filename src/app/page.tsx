"use client";

import React from "react";
import dynamic from "next/dynamic";
import { PromoStrip } from "@/components/PromoStrip";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { OurSelections } from "@/components/OurSelections";

import { BukhoorShowcase } from "@/components/BukhoorShowcase";
import { VideoShowcase } from "@/components/VideoShowcase";
import { HighlightSection } from "@/components/HighlightSection";
import { InspiredShowcase } from "@/components/InspiredShowcase";
import { StoreSection } from "@/components/StoreSection";
import { CommunityShowcase } from "@/components/CommunityShowcase";
import { BrandGuarantees } from "@/components/BrandGuarantees";
import { Footer } from "@/components/Footer";

// قم بتغيير القيمة إلى true متى أردت إعادة إظهار سكشن "مجتمع جوفينيل / أنتم جوهر التجربة"
const SHOW_COMMUNITY_SHOWCASE = false;

// قم بتغيير القيمة إلى false متى أردت إخفاء قسم "الضمانات والميثاق" بالكامل
const SHOW_BRAND_GUARANTEES = true;

export default function Home() {
  React.useEffect(() => {
    // Check if the current page load is a reload/refresh
    let isReload = false;
    try {
      const navEntries = performance.getEntriesByType("navigation");
      if (navEntries.length > 0) {
        isReload = (navEntries[0] as PerformanceNavigationTiming).type === "reload";
      } else if (typeof performance.navigation !== "undefined") {
        // Fallback for older browsers
        isReload = performance.navigation.type === 1;
      }
    } catch (e) {
      // Ignore
    }

    const scrollToHash = (hashVal: string, isInitial = false) => {
      if (!hashVal) return;
      const cleanId = hashVal.replace(/^#/, "").split(/[?&]/)[0];
      if (!cleanId) return;

      // Never auto-scroll on page reload to avoid fighting the user's scroll position
      if (isInitial && isReload) {
        return;
      }

      // If user is already scrolled somewhere down the page and this is initial mount,
      // don't yank their viewport unless they explicitly changed the hash.
      if (isInitial && typeof window !== "undefined" && window.scrollY > 150) {
        return;
      }

      setTimeout(() => {
        try {
          const target = document.getElementById(cleanId);
          if (target) {
            target.scrollIntoView({ behavior: "smooth" });
          }
        } catch (err) {
          console.warn("Failed to scroll to target:", err);
        }
      }, 150);
    };

    const handleHashChange = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        scrollToHash(window.location.hash, false);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <PromoStrip />
      <Header />
      <Hero />
      <OurSelections />
      <VideoShowcase />
      <HighlightSection />
      <InspiredShowcase />
      <BukhoorShowcase />
      <StoreSection />
      {/* سكشن مجتمع جوفينيل (مخفي حالياً) */}
      {SHOW_COMMUNITY_SHOWCASE && <CommunityShowcase />}
      {SHOW_BRAND_GUARANTEES && <BrandGuarantees />}
      <Footer />
    </main>
  );
}
