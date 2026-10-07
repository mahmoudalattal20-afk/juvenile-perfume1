import React from "react";
import type { Metadata } from "next";
import { PromoStrip } from "@/components/PromoStrip";
import { Header } from "@/components/Header";
import { MuskPageClient } from "./MuskPageClient";
import { BrandGuarantees } from "@/components/BrandGuarantees";
import { Footer } from "@/components/Footer";
import { BottomNavigation } from "@/components/BottomNavigation";

export const metadata: Metadata = {
  title: "مجموعة المسك الفاخر | جوفينيل — JUVENILE MUSK COLLECTION",
  description: "تشكيلة المسك النقي الفاخر من دار جوفينيل — لمسات مخملية ونقاء استثنائي يدوم طويلاً.",
  openGraph: {
    title: "JUVENILE MUSK COLLECTION — مجموعة المسك الفاخر",
    description: "Exclusive Haute Musk Collection by JUVENILE.",
    images: ["/highlights/unisex.jpg"],
  },
};

export default function MuskPage() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <PromoStrip />
      <Header />
      <MuskPageClient />
      <BrandGuarantees />
      <Footer />
      <BottomNavigation />
    </main>
  );
}
