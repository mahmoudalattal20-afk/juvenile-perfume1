import React from "react";
import type { Metadata } from "next";
import { PromoStrip } from "@/components/PromoStrip";
import { Header } from "@/components/Header";
import { BrandGuarantees } from "@/components/BrandGuarantees";
import { Footer } from "@/components/Footer";
import { ContactClient } from "./ContactClient";

export const metadata: Metadata = {
  title: "تواصل معنا وبوتيك سيتي ستارز | دار جوفينيل للعطور الفاخرة — JUVENILE Flagship Boutique",
  description:
    "تواصل مع دار جوفينيل للعطور الفاخرة. زوروا فرعنا الرئيسي في مول سيتي ستارز - المرحلة الثانية - الدور الأول - أمام Skechers. حجز جلسات استشارة عطرية خاصة وخدمة عملاء VIP.",
  keywords: [
    "جوفينيل سيتي ستارز",
    "عطور جوفينيل",
    "بوتيك جوفينيل",
    "سيتي ستارز مول الدور الأول",
    "Juvenile Citystars Mall",
    "Juvenile perfume Cairo",
    "Juvenile contact",
    "عطور نيش القاهرة",
  ],
  openGraph: {
    title: "تواصل مع دار جوفينيل — بوتيك سيتي ستارز مول | JUVENILE Haute Parfumerie",
    description:
      "تواصل مع دار جوفينيل للعطور الفاخرة. زوروا فرعنا الرئيسي في مول سيتي ستارز، المرحلة الثانية، الدور الأول أمام Skechers.",
    url: "https://juvenile-perfume.com/contact",
    siteName: "JUVENILE Haute Parfumerie",
    locale: "ar_EG",
    type: "website",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "JUVENILE Haute Parfumerie — Flagship Boutique",
    image: "https://juvenile-perfume.com/logo.webp",
    telephone: "+201123233355",
    email: "juvenilefragrance@gmail.com",
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
    priceRange: "$$",
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
        <ContactClient />
        <BrandGuarantees />
        <Footer />
      </main>
    </>
  );
}
