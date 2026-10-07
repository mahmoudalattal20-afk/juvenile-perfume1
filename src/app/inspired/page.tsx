import React from "react";
import type { Metadata } from "next";
import { PromoStrip } from "@/components/PromoStrip";
import { Header } from "@/components/Header";
import { BrandGuarantees } from "@/components/BrandGuarantees";
import { Footer } from "@/components/Footer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { getCMSData } from "@/lib/cmsStore";
import { InspiredClient } from "./InspiredClient";

export const metadata: Metadata = {
  title: "العطور المستوحاة | جوفينيل — JUVENILE INSPIRED",
  description: "روائع العطور العالمية بأيدي جوفينيل — بدائل نيش استثنائية بتركيز Extrait de Parfum وثبات يدوم لأيام.",
  openGraph: {
    title: "JUVENILE INSPIRED COLLECTION — العطور المستوحاة",
    description: "Exclusive Inspired Haute Parfumerie Editions.",
  },
};

export default function InspiredPage() {
  const cmsData = getCMSData();
  const inspiredProducts = cmsData.inspiredProducts || {};

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#fafaf9" }}>
      <PromoStrip />
      <Header />
      <InspiredClient initialProducts={inspiredProducts} />
      <BrandGuarantees />
      <Footer />
      <BottomNavigation />
    </main>
  );
}
