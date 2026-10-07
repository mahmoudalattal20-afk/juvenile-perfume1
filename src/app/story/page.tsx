import React from "react";
import type { Metadata } from "next";
import { PromoStrip } from "@/components/PromoStrip";
import { Header } from "@/components/Header";
import { BrandGuarantees } from "@/components/BrandGuarantees";
import { Footer } from "@/components/Footer";
import { StoryClient } from "./StoryClient";

export const metadata: Metadata = {
  title: "قصتنا وتراث الدار | دار جوفينيل للعطور الفاخرة — JUVENILE Our Story",
  description:
    "تعرف على قصة تأسيس دار جوفينيل للعطور الفاخرة، من أرقى معامل ومختبرات باريس إلى فرعنا الرئيسي في مول سيتي ستارز بالقاهرة.",
  keywords: [
    "قصة جوفينيل",
    "عطور جوفينيل باريس",
    "تراث جوفينيل",
    "عطور نيش فرنسية مصر",
    "Juvenile fragrance story",
    "Juvenile Paris Cairo",
  ],
  openGraph: {
    title: "قصة دار جوفينيل — من باريس إلى قلب القاهرة | JUVENILE",
    description:
      "فلسفة النيش الفرنسي العريق ممزوجة بالأصالة العربية في تشكيلات عطرية فاخرة.",
    url: "https://juvenile-perfume.com/story",
    siteName: "JUVENILE Haute Parfumerie",
    images: [
      {
        url: "/our-story.webp",
        width: 1024,
        height: 1024,
        alt: "JUVENILE Parisian Heritage",
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
  alternates: {
    canonical: "/story",
  },
};

export default function StoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "JUVENILE Haute Parfumerie — Our Story",
    description: "The heritage and creation journey of JUVENILE Fragrance from Paris to Cairo.",
    publisher: {
      "@type": "Organization",
      name: "JUVENILE Haute Parfumerie",
      logo: "https://juvenile-perfume.com/logo.webp",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Citystars Mall, Phase 2, 1st Floor, in front of Skechers",
        addressLocality: "Cairo",
        addressCountry: "EG",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PromoStrip />
      <Header />
      <main style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
        <StoryClient />
      </main>
      <BrandGuarantees />
      <Footer />
    </>
  );
}
