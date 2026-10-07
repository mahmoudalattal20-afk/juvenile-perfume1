import React from "react";
import type { Metadata } from "next";
import { PromoStrip } from "@/components/PromoStrip";
import { Header } from "@/components/Header";
import { BrandGuarantees } from "@/components/BrandGuarantees";
import { Footer } from "@/components/Footer";
import { StoresClient } from "./StoresClient";

export const metadata: Metadata = {
  title: "فروع دار جوفينيل للعطور | فرع سيتي ستارز مول — JUVENILE Flagship Boutiques",
  description:
    "تعرف على فروع دار جوفينيل للعطور الفاخرة. زوروا فرعنا الرئيسي في مول سيتي ستارز - المرحلة الثانية - الدور الأول - أمام Skechers، القاهرة.",
  keywords: [
    "فروع جوفينيل",
    "بوتيك جوفينيل",
    "جوفينيل سيتي ستارز",
    "فرع جوفينيل الدور الاول",
    "عطور سيتي ستارز",
    "Juvenile stores",
    "Juvenile Citystars Mall",
    "Juvenile boutique Cairo",
  ],
  openGraph: {
    title: "فروع دار جوفينيل — بوتيك سيتي ستارز مول | JUVENILE Boutiques",
    description:
      "زوروا فرع دار جوفينيل الرئيسي في مول سيتي ستارز، المرحلة الثانية، الدور الأول أمام Skechers.",
    url: "https://juvenile-perfume.com/stores",
    siteName: "JUVENILE Haute Parfumerie",
    images: [
      {
        url: "/our-branch.webp",
        width: 1024,
        height: 1024,
        alt: "JUVENILE Flagship Boutique - Citystars Mall",
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
  alternates: {
    canonical: "/stores",
  },
};

export default function StoresPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "JUVENILE Haute Parfumerie — Citystars Flagship Boutique",
    image: "https://juvenile-perfume.com/our-branch.webp",
    telephone: "+201123233355",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Citystars Mall, Phase 2, 1st Floor, in front of Skechers",
      addressLocality: "Nasr City",
      addressRegion: "Cairo",
      postalCode: "11737",
      addressCountry: "EG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "30.0631623",
      longitude: "31.3499167",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "10:00",
        closes: "23:30",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
        <PromoStrip />
        <Header />
        <StoresClient />
        <BrandGuarantees />
        <Footer />
      </main>
    </>
  );
}
