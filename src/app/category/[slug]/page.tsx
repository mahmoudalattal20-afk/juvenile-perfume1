import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PromoStrip } from "@/components/PromoStrip";
import { Header } from "@/components/Header";
import { CategoryPageClient, CATEGORIES_DATA } from "@/components/CategoryPageClient";
import { MuskPageClient } from "@/app/musk/MuskPageClient";
import { BrandGuarantees } from "@/components/BrandGuarantees";
import { Footer } from "@/components/Footer";
import { BottomNavigation } from "@/components/BottomNavigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [
    { slug: "women" },
    { slug: "men" },
    { slug: "unisex" },
    { slug: "bukhoor" },
    { slug: "bodysplash" },
    { slug: "musk" },
  ];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === "musk") {
    return {
      title: "مجموعة المسك الفاخر | جوفينيل — JUVENILE MUSK COLLECTION",
      description: "تشكيلة المسك النقي الفاخر من دار جوفينيل — لمسات مخملية ونقاء استثنائي يدوم طويلاً.",
      openGraph: {
        title: "JUVENILE MUSK COLLECTION — مجموعة المسك الفاخر",
        description: "Exclusive Haute Musk Collection by JUVENILE.",
        images: ["/highlights/unisex.jpg"],
      },
    };
  }

  const category = CATEGORIES_DATA[slug];

  if (!category) {
    return {
      title: "العطور الفاخرة | جوفينيل — JUVENILE",
    };
  }

  return {
    title: `${category.titleAr} | جوفينيل للعطور الفاخرة — JUVENILE`,
    description: category.subtitleAr,
    openGraph: {
      title: `${category.titleEn} — JUVENILE HAUTE PARFUMERIE`,
      description: category.subtitleEn,
      images: [category.image],
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  const validSlugs = ["women", "men", "unisex", "bukhoor", "bodysplash", "musk"];
  if (!validSlugs.includes(slug)) {
    notFound();
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <PromoStrip />
      <Header />
      {slug === "musk" ? <MuskPageClient /> : <CategoryPageClient slug={slug as "women" | "men" | "unisex" | "bukhoor" | "bodysplash"} />}
      <BrandGuarantees />
      <Footer />
      <BottomNavigation />
    </main>
  );
}
