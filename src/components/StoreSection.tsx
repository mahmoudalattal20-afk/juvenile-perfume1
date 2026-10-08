"use client";

import React from "react";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./StoreSection.module.css";

export const StoreSection: React.FC = () => {
  const { locale, direction } = useLanguage();
  const isAr = locale === "ar";

  const googleMapsUrl = "https://maps.google.com/?q=Citystars+Mall+Cairo+Egypt";

  const getWhatsAppLink = () => {
    const phone = "201123233355";
    const text = isAr
      ? "السلام عليكم، أنا في سيتي ستارز وحابب اعرف إزاي أوصل لفرع جوفينيل."
      : "Hello JUVENILE, I am at Citystars and would like directions to your store.";
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section
      id="stores"
      className={styles.section}
      dir={direction}
      aria-label={isAr ? "فرعنا في سيتي ستارز" : "Our Citystars Flagship"}
    >
      <div className={styles.container}>
        <div className={styles.storeCard}>
          {/* Image Side */}
          <div className={styles.imageSide}>
            <Image
              src="/our-branch.webp"
              alt={isAr ? "فرع جيفونيل - سيتي ستارز مول" : "JUVENILE Fragrance - Citystars Mall Flagship"}
              fill
              sizes="(max-width: 960px) 100vw, 680px"
              className={styles.storeImage}
              unoptimized={true}
              decoding="async"
            />
          </div>

          {/* Content Side */}
          <div className={styles.contentSide}>
            {/* Title */}
            <h2 className={styles.title}>
              {isAr
                ? "اكتشف جيفونيل في فرع سيتي ستارز"
                : "Discover JUVENILE at Citystars"}
            </h2>

            {/* Description */}
            <p className={styles.description}>
              {isAr
                ? "جرّب عطور جيفونيل عن قرب، اكتشف النوتات اللي تناسبك، وخلي فريقنا يساعدك تختار العطر اللي يعبّر عن حضورك."
                : "Experience JUVENILE fragrances up close, explore the notes that suit you, and let our team help you find the scent that matches your presence."}
            </p>

            {/* Quick Info List */}
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <MapPin size={18} className={styles.infoIcon} />
                <span className={styles.infoItemText}>
                  {isAr
                    ? "سيتي ستارز — المرحلة الثانية، الدور الأول (أمام Skechers)"
                    : "Citystars — Phase 2, First Floor (Opposite Skechers)"}
                </span>
              </div>

              <div className={styles.infoItem}>
                <Clock size={18} className={styles.infoIcon} />
                <span className={styles.infoItemText}>
                  {isAr
                    ? "يوميًا من 10:00 صباحًا حتى 11:30 مساءً"
                    : "Daily from 10:00 AM to 11:30 PM"}
                </span>
              </div>

              <a
                href="tel:+201123233355"
                className={styles.infoItem}
                title={isAr ? "اتصل بنا هاتفياً" : "Call us"}
              >
                <Phone size={18} className={styles.infoIcon} />
                <span className={styles.infoItemText} dir="ltr">
                  +20 112 323 3355
                </span>
              </a>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionRow}>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mapBtn}
              >
                <span className={styles.btnIconWrap}>
                  <Navigation size={16} />
                </span>
                <span className={styles.btnLabel}>
                  {isAr ? "افتح الموقع على الخريطة" : "View on Map"}
                </span>
              </a>

              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
              >
                <span className={styles.btnIconWrap}>
                  <MessageCircle size={16} />
                </span>
                <span className={styles.btnLabel}>
                  {isAr ? "كلمنا على واتساب" : "Chat with Us on WhatsApp"}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
