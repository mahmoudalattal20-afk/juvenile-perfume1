"use client";

import React from "react";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  Compass,
  Sparkles,
  Gift,
  ShoppingBag,
  ExternalLink,
  PhoneCall,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./Stores.module.css";

export const StoresClient: React.FC = () => {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const googleMapsUrl = "https://maps.google.com/?q=Citystars+Mall+Cairo+Egypt";

  const getWhatsAppLink = (customText?: string) => {
    const basePhone = "201123233355";
    const defaultText = isAr
      ? `السلام عليكم، أنا في سيتي ستارز وحابب اعرف إزاي أوصل لفرع جوفينيل.`
      : `Hello JUVENILE, I am at Citystars and would like to know how to reach your branch.`;
    const textToSend = encodeURIComponent(customText || defaultText);
    return `https://wa.me/${basePhone}?text=${textToSend}`;
  };

  return (
    <div className={styles.pageWrapper} dir={isAr ? "rtl" : "ltr"}>
      <div className={styles.container}>
        {/* =================================================================
            1. GRAND DESTINATION HERO CARD (IMAGE + DETAILS)
            ================================================================= */}
        <section className={styles.heroDestinationCard}>
          {/* Content Side */}
          <div className={styles.heroContentSide}>
            <div className={styles.heroPill}>
              <span className={styles.heroStatusDot} />
              <span>{isAr ? "فرع سيتي ستارز الرئيسي • مفتوح دلوقتي" : "Citystars Branch • Open Now"}</span>
            </div>

            <h1 className={styles.heroTitle}>
              {isAr ? "اكتشف جيفونيل في فرع سيتي ستارز" : "Discover JUVENILE at Citystars"}
            </h1>

            <p className={styles.heroDesc}>
              {isAr
                ? "جرّب عطور جيفونيل عن قرب، اكتشف النوتات اللي تناسبك، وخلي فريقنا يساعدك تختار العطر اللي يعبّر عن حضورك."
                : "Experience JUVENILE fragrances up close, explore the notes that suit you, and let our team help you find the scent that matches your presence."}
            </p>

            {/* Quick Details Box */}
            <div className={styles.heroQuickDetails}>
              <div className={styles.quickDetailItem}>
                <MapPin size={18} className={styles.quickDetailIcon} />
                <span>
                  {isAr
                    ? "سيتي ستارز — المرحلة الثانية، الدور الأول (أمام Skechers)"
                    : "Citystars — Phase 2, First Floor (Opposite Skechers)"}
                </span>
              </div>

              <div className={styles.quickDetailItem}>
                <Clock size={18} className={styles.quickDetailIcon} />
                <span>
                  {isAr
                    ? "يوميًا من 10:00 صباحًا حتى 11:30 مساءً"
                    : "Daily from 10:00 AM to 11:30 PM"}
                </span>
              </div>

              <a
                href="tel:+201123233355"
                className={styles.quickDetailItem}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Phone size={18} className={styles.quickDetailIcon} />
                <span dir="ltr">+20 112 323 3355</span>
              </a>
            </div>

            {/* Actions */}
            <div className={styles.heroActions}>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnPrimaryCall}
              >
                <Navigation size={16} />
                <span>{isAr ? "افتح الموقع على الخريطة" : "View on Map"}</span>
              </a>

              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnWhatsAppGreen}
              >
                <MessageCircle size={16} />
                <span>{isAr ? "كلمنا على واتساب" : "Chat with Us on WhatsApp"}</span>
              </a>
            </div>
          </div>

          {/* Image Side */}
          <div className={styles.heroImageSide}>
            <Image
              src="/our-branch.webp"
              alt="JUVENILE Fragrance - Citystars Mall"
              width={800}
              height={800}
              priority
              className={styles.heroImage}
            />
          </div>
        </section>

        {/* =================================================================
            2. WAYFINDING GUIDE (إزاي توصلنا جوة المول بكل سهولة)
            ================================================================= */}
        <section className={styles.wayfindingSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {isAr ? "إزاي توصل للفرع جوة سيتي ستارز؟" : "How to Find Us Inside Citystars"}
            </h2>
            <p className={styles.sectionSubtitle}>
              {isAr
                ? "3 خطوات بسيطة هتوصّلك عندنا في ثواني:"
                : "3 easy steps to reach us:"}
            </p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>
                {isAr ? "ادخل من المرحلة التانية" : "Enter Phase 2"}
              </h3>
              <p className={styles.stepDesc}>
                {isAr
                  ? "ادخل من بوابات المرحلة التانية (Phase 2) عشان تكون أقرب ما يمكن لمكاننا."
                  : "Enter through Phase 2 gates for the fastest path."}
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>
                {isAr ? "اطلع الدور الأول" : "Head to 1st Floor"}
              </h3>
              <p className={styles.stepDesc}>
                {isAr
                  ? "استخدم السلم الكهربائي أو الأسانسير واطلع للدور الأول (1st Floor)."
                  : "Take the escalator or elevator up to the 1st Floor."}
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>
                {isAr ? "قدام محل Skechers" : "In Front of Skechers"}
              </h3>
              <p className={styles.stepDesc}>
                {isAr
                  ? "هتلاقي فرع جوفينيل مباشرة في وش محل Skechers.. منور ومستنيكم."
                  : "You will find our boutique directly facing the Skechers store."}
              </p>
            </div>
          </div>

          {/* Lost in the mall banner */}
          <div className={styles.lostBanner}>
            <div className={styles.lostBannerText}>
              <span className={styles.lostBannerTitle}>
                {isAr ? "تايه جوة المول ومش لاقي المكان؟" : "Lost inside the mall?"}
              </span>
              <span className={styles.lostBannerDesc}>
                {isAr
                  ? "ابعتلنا واتساب دلوقتي وهنبعتلك لوكيشن دقيق أو نوصفلك أسرع طريق من مكانك."
                  : "Message us on WhatsApp and we will guide you to our exact spot."}
              </span>
            </div>

            <a
              href={getWhatsAppLink(
                isAr
                  ? "السلام عليكم، أنا جوة سيتي ستارز دلوقتي ومش عارف أوصل للفرع، ممكن تدلوني؟"
                  : "Hello, I am inside Citystars and need directions to your branch."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.lostWhatsAppBtn}
            >
              <MessageCircle size={16} />
              <span>{isAr ? "ابعتلي الطريق على واتساب" : "Get Directions on WhatsApp"}</span>
            </a>
          </div>
        </section>

        {/* =================================================================
            3. IN-STORE PERKS
            ================================================================= */}
        <section className={styles.perksGrid}>
          <div className={styles.perkCard}>
            <div className={styles.perkIconBox}>
              <Sparkles size={22} />
            </div>
            <h3 className={styles.perkTitle}>
              {isAr ? "جرب كل العطور على رواقة" : "Sample Everything"}
            </h3>
            <p className={styles.perkDesc}>
              {isAr
                ? "رش وجرب كل التوليفات براحتك وشوف الثبات والفوحان على بشرتك قبل ما تشتري."
                : "Test all our fragrances and discover their long-lasting performance."}
            </p>
          </div>

          <div className={styles.perkCard}>
            <div className={styles.perkIconBox}>
              <Gift size={22} />
            </div>
            <h3 className={styles.perkTitle}>
              {isAr ? "تغليف هدايا شيك ومجاني" : "Luxury Gift Wrapping"}
            </h3>
            <p className={styles.perkDesc}>
              {isAr
                ? "هديتك بتطلع بأفخم علبة وكارت إهداء مخصوص من غير أي مصاريف إضافية."
                : "Complimentary gift packaging with personalized cards for any occasion."}
            </p>
          </div>

          <div className={styles.perkCard}>
            <div className={styles.perkIconBox}>
              <ShoppingBag size={22} />
            </div>
            <h3 className={styles.perkTitle}>
              {isAr ? "استلام فوري لأوردرات الموقع" : "Instant Click & Collect"}
            </h3>
            <p className={styles.perkDesc}>
              {isAr
                ? "اطلب العطر أونلاين من الموقع واستلمه من الفرع في ثواني وأنت ماشي في المول."
                : "Order online and pick it up instantly from our Citystars branch."}
            </p>
          </div>
        </section>

        {/* =================================================================
            4. MAP CARD
            ================================================================= */}
        <section className={styles.mapCard}>
          <div className={styles.mapHeaderRow}>
            <h3 className={styles.mapTitle}>
              {isAr ? "موقع سيتي ستارز على الخريطة" : "Citystars Mall on Google Maps"}
            </h3>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapDirectionsLink}
            >
              <ExternalLink size={14} />
              <span>{isAr ? "افتح الخريطة في الموبايل" : "Open in Google Maps"}</span>
            </a>
          </div>

          <div className={styles.mapFrameBox}>
            <iframe
              title="Citystars Mall Cairo Map"
              className={styles.mapIframe}
              src="https://maps.google.com/maps?q=Citystars+Mall+Heliopolis+Cairo&t=&z=15&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </section>
      </div>
    </div>
  );
};
