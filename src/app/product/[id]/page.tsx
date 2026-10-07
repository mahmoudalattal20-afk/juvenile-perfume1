import React from "react";
import type { Metadata } from "next";
import { PromoStrip } from "@/components/PromoStrip";
import { Header } from "@/components/Header";
import { ProductDetail } from "@/components/ProductDetail";
import { BrandGuarantees } from "@/components/BrandGuarantees";
import { Footer } from "@/components/Footer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { getProductById, getAllProductIds } from "@/data/products";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const ids = getAllProductIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);

  return {
    title: `${product.name} | جوفينيل للعطور الفاخرة — JUVENILE`,
    description: product.description.ar,
    openGraph: {
      title: `${product.name} — JUVENILE HAUTE PARFUMERIE`,
      description: product.tagline.ar,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <PromoStrip />
      <Header />
      <ProductDetail productId={id} />
      <BrandGuarantees />
      <Footer />
      <BottomNavigation />
    </main>
  );
}
