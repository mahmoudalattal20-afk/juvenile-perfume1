import type { Metadata } from "next";
import { cookies } from "next/headers";
import localFont from "next/font/local";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { CMSProvider } from "@/context/CMSContext";
import { FlyAnimationProvider } from "@/context/FlyAnimationContext";
import dynamic from "next/dynamic";
import { DynamicTabManager } from "@/components/DynamicTabManager";
import { PageTransition } from "@/components/PageTransition";
import { Locale, Direction } from "@/i18n/translations";
import "./globals.css";

const FragranceConcierge = dynamic(
  () => import("@/components/FragranceConcierge").then((mod) => mod.FragranceConcierge)
);
const BottomNavigation = dynamic(
  () => import("@/components/BottomNavigation").then((mod) => mod.BottomNavigation)
);

const readexPro = localFont({
  src: [
    { path: "../../public/fonts/readex-pro-400.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/readex-pro-500.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/readex-pro-600.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/readex-pro-700.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-readex",
  display: "swap",
});

const tenorSans = localFont({
  src: [
    { path: "../../public/fonts/tenor-sans-400.ttf", weight: "400", style: "normal" },
  ],
  variable: "--font-tenor-sans",
  display: "swap",
});

const outfit = localFont({
  src: [
    { path: "../../public/fonts/outfit-400.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/outfit-600.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/outfit-700.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://juvenileperfume.com"),
  title: "جوفينيل للعطور | JUVENILE Fragrance — Luxury Perfumes",
  description:
    "عطور فاخرة تم تصميمها بعناية وشغف لتمنحك حضوراً آسراً لا يُنسى. اكتشف تشكيلات JUVENILE الحصرية.",
  openGraph: {
    title: "جوفينيل للعطور | JUVENILE Fragrance",
    description: "أرقى العطور الفاخرة — عطور صُممت لتدوم وتلفت الأنظار.",
    type: "website",
    locale: "ar_SA",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("juvenile_language")?.value as Locale | undefined;
  const initialLocale: Locale = savedLocale === "en" ? "en" : "ar";
  const initialDir: Direction = initialLocale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={initialLocale}
      dir={initialDir}
      className={`notranslate ${readexPro.variable} ${tenorSans.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-FOUC guard */}
        <link rel="icon" href="/logo-tab.png" sizes="any" />
        {/* LCP Preload Discovery for Instant Lighthouse Paint */}
        <link
          rel="preload"
          as="image"
          href="/uploads/cover-0_1790773207834.webp"
          type="image/webp"
          fetchPriority="high"
          media="(min-width: 769px)"
        />
        <link
          rel="preload"
          as="image"
          href="/uploads/hero1_1790512378228.webp"
          type="image/webp"
          fetchPriority="high"
          media="(max-width: 768px)"
        />
        <link
          rel="preload"
          as="font"
          href="/fonts/readex-pro-400.ttf"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|; )juvenile_language=([^;]*)/);var s=m?decodeURIComponent(m[1]):localStorage.getItem('juvenile_language');if(s&&(!m||!m[1])){document.cookie='juvenile_language='+encodeURIComponent(s)+'; path=/; max-age=31536000; SameSite=Lax';}if(s==='en'){document.documentElement.lang='en';document.documentElement.dir='ltr';}else if(s==='ar'){document.documentElement.lang='ar';document.documentElement.dir='rtl';}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <LanguageProvider initialLocale={initialLocale}>
          <CMSProvider>
            <CartProvider>
              <FlyAnimationProvider>
                <DynamicTabManager />
                <PageTransition>{children}</PageTransition>
                <FragranceConcierge />
                <BottomNavigation />
              </FlyAnimationProvider>
            </CartProvider>
          </CMSProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}


