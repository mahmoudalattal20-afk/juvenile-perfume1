"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Flame,
  ShieldCheck,
  ShoppingBag,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  Droplets,
  Layers,
  HeartHandshake,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./Story.module.css";

export const StoryClient: React.FC = () => {
  const { locale, direction } = useLanguage();
  const isAr = locale === "ar";
  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight;

  const basePhone = "201123233355";
  const whatsAppText = encodeURIComponent(
    isAr
      ? "السلام عليكم، حابب اعرف تفاصيل أكتر عن عطور جوفينيل وتوليفاتكم."
      : "Hello, I would like to know more about JUVENILE fragrances."
  );
  const whatsAppLink = `https://wa.me/${basePhone}?text=${whatsAppText}`;

  return (
    <div className={styles.pageWrapper} dir={isAr ? "rtl" : "ltr"}>
      <div className={styles.container}>
        {/* =================================================================
            1. GRAND HERO CARD (MATCHING /stores & /contact 2026 UI/UX)
            ================================================================= */}
        <section className={styles.heroDestinationCard}>
          <div className={styles.heroContentSide}>
            <div className={styles.heroPill}>
              <span className={styles.heroFlag}>🇫🇷</span>
              <span>{isAr ? "من باريس إلى قلب القاهرة" : "Parisian Heritage • Cairo Flagship"}</span>
            </div>

            <h1 className={styles.heroTitle}>
              {isAr ? "أصل الحكاية.. عطور فرنسية بقلب وهوية مصرية" : "Our Story: French Craftsmanship, Egyptian Soul"}
            </h1>

            <p className={styles.heroDesc}>
              {isAr
                ? "بدأنا رحلتنا من قلب عواصم العطور في فرنسا، بننقي أجود الزيوت والخلاصات المعتقة، وجمعناها مع حبنا للثبات والفوحان الفخم اللي بنحبه في مصر عشان نعمل عطر يعلم في الذاكرة من أول رشة."
                : "Born in the ateliers of France, blending rare aged oils with an authentic Egyptian character for an unforgettable signature trail."}
            </p>

            {/* Quick Details Box (Matching Stores style) */}
            <div className={styles.quickDetailsBox}>
              <div className={styles.quickDetailItem}>
                <Droplets size={18} className={styles.quickDetailIcon} />
                <span>
                  {isAr
                    ? "زيوت خام نقية مستوردة مباشرة ومصنعة بأعلى مواصفات النيش"
                    : "Pure imported oils crafted according to niche standards"}
                </span>
              </div>

              <div className={styles.quickDetailItem}>
                <Flame size={18} className={styles.quickDetailIcon} />
                <span>
                  {isAr
                    ? "تركيزات Extrait de Parfum و Eau de Parfum لثبات حقيقي طول اليوم"
                    : "Extrait de Parfum & EDP concentrations for long-lasting longevity"}
                </span>
              </div>

              <div className={styles.quickDetailItem}>
                <MapPin size={18} className={styles.quickDetailIcon} />
                <span>
                  {isAr
                    ? "فرعنا الرسمي في مول سيتي ستارز (المرحلة التانية - الدور الأول)"
                    : "Flagship Boutique: Citystars Mall, Phase 2, 1st Floor"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.heroActions}>
              <Link href="/#bestsellers" className={styles.btnPrimary}>
                <span>{isAr ? "اكتشف تشكيلة العطور" : "Explore Collections"}</span>
                <ArrowIcon size={16} />
              </Link>

              <Link href="/stores" className={styles.btnSecondary}>
                <MapPin size={16} />
                <span>{isAr ? "زور فرعنا بسيتي ستارز" : "Visit Boutique"}</span>
              </Link>
            </div>
          </div>

          <div className={styles.heroImageSide}>
            <Image
              src="/our-story.webp"
              alt="JUVENILE Fragrance - From Paris to Cairo"
              width={800}
              height={800}
              priority
              className={styles.heroImage}
            />
          </div>
        </section>

        {/* =================================================================
            2. THE 3 STAGES (MATCHING THE 3-STEP WAYFINDING CARDS IN /stores)
            ================================================================= */}
        <section className={styles.stagesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {isAr ? "إزاي بنصنع عطور جوفينيل؟" : "How JUVENILE Fragrances Are Crafted"}
            </h2>
            <p className={styles.sectionSubtitle}>
              {isAr
                ? "3 خطوات بنمشي عليها في كل زجاجة عطر بتوصل لإيدك:"
                : "3 essential steps behind every bottle:"}
            </p>
          </div>

          <div className={styles.stagesGrid}>
            <div className={styles.stageCard}>
              <div className={styles.stageBadge}>1</div>
              <h3 className={styles.stageTitle}>
                {isAr ? "انتقاء الزيوت من فرنسا" : "Sourcing from France"}
              </h3>
              <p className={styles.stageDesc}>
                {isAr
                  ? "بنتعامل مع معامل تقطير عريقة في فرنسا علشان نضمن أعلى نقاء للزيوت بدون أي إضافات تضيع جمال النوتات."
                  : "Partnering with historic French distillation houses to ensure untainted raw oil purity."}
              </p>
            </div>

            <div className={styles.stageCard}>
              <div className={styles.stageBadge}>2</div>
              <h3 className={styles.stageTitle}>
                {isAr ? "التعتيق والمزج الشرقي" : "Maceration & Blending"}
              </h3>
              <p className={styles.stageDesc}>
                {isAr
                  ? "بنوازن رقة الأزهار والحمضيات الفرنسية بقوة وثبات العود والعنبر والمسك عشان العطر يليق بالهيبة اللي بندور عليها."
                  : "Harmonizing delicate French florals with deep oriental oud and amber for bold sillage."}
              </p>
            </div>

            <div className={styles.stageCard}>
              <div className={styles.stageBadge}>3</div>
              <h3 className={styles.stageTitle}>
                {isAr ? "التجربة والتسليم في مصر" : "Cairo Experience"}
              </h3>
              <p className={styles.stageDesc}>
                {isAr
                  ? "كل زجاجة بتوصلك بتغليف هدايا راقي، وتقدر تشرفنا في سيتي ستارز وترش وتجرب كل التوليفات على رواقة."
                  : "Delivered in luxury gift boxing, or experienced live at our Citystars flagship boutique."}
              </p>
            </div>
          </div>
        </section>

        {/* =================================================================
            3. IN-STORE PERKS / VALUES (MATCHING /stores PERKS)
            ================================================================= */}
        <section className={styles.perksGrid}>
          <div className={styles.perkCard}>
            <div className={styles.perkIconBox}>
              <Sparkles size={22} />
            </div>
            <h3 className={styles.perkTitle}>
              {isAr ? "نقاء وثبات حقيقي" : "Pure & Long Lasting"}
            </h3>
            <p className={styles.perkDesc}>
              {isAr
                ? "عطورنا مش مجرد ريحة بتطير في ساعة، مصممة عشان تفضل معاك طول اليوم."
                : "Formulated with high oil concentration to ensure lasting performance throughout your day."}
            </p>
          </div>

          <div className={styles.perkCard}>
            <div className={styles.perkIconBox}>
              <ShieldCheck size={22} />
            </div>
            <h3 className={styles.perkTitle}>
              {isAr ? "مكونات آمنة ومعتمدة" : "Certified Ingredients"}
            </h3>
            <p className={styles.perkDesc}>
              {isAr
                ? "ملتزمين بأعلى معايير الأمان الدولية لصناعة العطور الصديقة للبشرة."
                : "Fully compliant with international IFRA safety and quality guidelines."}
            </p>
          </div>

          <div className={styles.perkCard}>
            <div className={styles.perkIconBox}>
              <ShoppingBag size={22} />
            </div>
            <h3 className={styles.perkTitle}>
              {isAr ? "تغليف هدية فخم جاهز" : "Luxury Gift Packaging"}
            </h3>
            <p className={styles.perkDesc}>
              {isAr
                ? "العلبة والكيس الأيقوني بيوصلوك بشكل شيك ومثالي للإهداء من غير أي تكلفة زيادة."
                : "Signature box and packaging ready for gifting with no extra charge."}
            </p>
          </div>
        </section>

        {/* =================================================================
            4. EGYPTIAN CALLOUT BANNER (MATCHING /stores LOST BANNER)
            ================================================================= */}
        <div className={styles.bannerCard}>
          <div className={styles.bannerContent}>
            <span className={styles.bannerTitle}>
              {isAr ? "محتاج مساعدة في اختيار العطر الأنسب لذوقك؟" : "Need help picking your scent?"}
            </span>
            <span className={styles.bannerDesc}>
              {isAr
                ? "كلمنا على الواتساب وفريقنا هيساعدك تختار العطر المناسب لشخصيتك أو كهدية شيك."
                : "Chat with our fragrance team on WhatsApp for personalized recommendations."}
            </span>
          </div>

          <a
            href={whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.bannerBtn}
          >
            <MessageCircle size={16} />
            <span>{isAr ? "كلمنا على واتساب" : "Chat on WhatsApp"}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
