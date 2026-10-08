"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Instagram,
  Facebook,
  MessageCircle,
  Mail,
  Phone,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./Footer.module.css";

export const Footer: React.FC = () => {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  return (
    <footer className={styles.footer} aria-label={isAr ? "تذييل الموقع" : "Site Footer"}>
      <div className={styles.container}>
        {/* =========================================
            MAIN FOOTER NAVIGATION COLUMNS
            ========================================= */}
        <div className={styles.mainFooter}>
          <div className={styles.footerGrid}>
            {/* Column 1: Brand Wordmark & About */}
            <div className={styles.brandCol}>
              <Link href="/" className={styles.logoLink} aria-label="JUVENILE Fragrance">
                <Image
                  src="/logo.webp"
                  alt="JUVENILE Fragrance"
                  width={170}
                  height={48}
                  className={styles.brandLogo}
                />
              </Link>
              <p className={styles.brandBio}>
                {isAr
                  ? "دار عطور نيش فاخرة تمزج الحرفية الفرنسية العريقة بالخلاصات الشرقية النادرة، لنبتكر لك تحفاً عطرية تأسر الحواس وتمنحك حضوراً خالداً."
                  : "A luxury haute-parfumerie maison blending Parisian craftsmanship with rare oriental essences to create timeless olfactory masterworks."}
              </p>

              {/* Contact Information */}
              <div className={styles.contactDetails}>
                <a
                  href="mailto:juvenilefragrance@gmail.com"
                  className={styles.contactItem}
                  aria-label="Email"
                >
                  <Mail size={16} className={styles.contactIcon} />
                  <span dir="ltr">juvenilefragrance@gmail.com</span>
                </a>
                <a
                  href="tel:01123233355"
                  className={styles.contactItem}
                  aria-label="Phone"
                >
                  <Phone size={16} className={styles.contactIcon} />
                  <span dir="ltr" className={styles.phoneNum}>011 2323 3355</span>
                </a>
              </div>

              {/* Social Media Links */}
              <div className={styles.socialGroup}>
                <a
                  href="https://www.instagram.com/juvenile_fragrance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label="Instagram"
                >
                  <Instagram size={17} />
                </a>
                <a
                  href="https://www.facebook.com/people/JuvenileFragrance/61586404154597/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label="Facebook"
                >
                  <Facebook size={17} />
                </a>
                <a
                  href="https://www.tiktok.com/@hussienahmed007?_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label="TikTok"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.02 2.68.01 5.37-.02 8.05-.08 1.83-.69 3.63-1.83 5.05-1.5 1.89-3.83 3.02-6.24 3.01-2.02-.02-3.99-.87-5.41-2.31-1.67-1.67-2.48-4.08-2.26-6.44.22-2.35 1.51-4.48 3.48-5.69 1.48-.91 3.23-1.32 4.96-1.18v4.06c-.84-.15-1.74-.08-2.52.27-.85.39-1.52 1.11-1.83 2-.36.99-.27 2.12.24 3.03.51.89 1.43 1.51 2.45 1.67 1.12.18 2.3-.11 3.12-.89.79-.76 1.19-1.86 1.18-2.95V.02h-3.23z" />
                  </svg>
                </a>
                <a
                  href="https://wa.me/201123233355"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={17} />
                </a>
              </div>
            </div>

            {/* Column 2: Collections */}
            <div className={styles.navCol}>
              <h3 className={styles.colHeading}>
                {isAr ? "التشكيلات العطرية" : "Collections"}
              </h3>
              <ul className={styles.linksList}>
                <li>
                  <Link href="/#bestsellers" className={styles.footerLink}>
                    {isAr ? "الأكثر مبيعاً" : "Best Sellers"}
                  </Link>
                </li>
                <li>
                  <Link href="/#offers" className={styles.footerLink}>
                    {isAr ? "عطور نسائية راقية" : "For Her Selection"}
                  </Link>
                </li>
                <li>
                  <Link href="/#offers" className={styles.footerLink}>
                    {isAr ? "عطور رجالية فاخرة" : "For Him Selection"}
                  </Link>
                </li>
                <li>
                  <Link href="/#bestsellers" className={styles.footerLink}>
                    {isAr ? "مجموعات الهدايا" : "Luxury Gift Sets"}
                  </Link>
                </li>
                <li>
                  <Link href="/#bestsellers" className={styles.footerLink}>
                    {isAr ? "خلاصات نقية وخاصة" : "Rare Private Blends"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: About Maison */}
            <div className={styles.navCol}>
              <h3 className={styles.colHeading}>
                {isAr ? "عن جوفينيل" : "About Maison"}
              </h3>
              <ul className={styles.linksList}>
                <li>
                  <Link href="/story" className={styles.footerLink}>
                    {isAr ? "قصة الدار والتراث" : "Maison Heritage"}
                  </Link>
                </li>
                <li>
                  <Link href="/story" className={styles.footerLink}>
                    {isAr ? "أسرار النيش الفرنسي" : "Parisian Craft"}
                  </Link>
                </li>
                <li>
                  <Link href="/stores" className={styles.footerLink}>
                    {isAr ? "فرع سيتي ستارز" : "Citystars Boutique"}
                  </Link>
                </li>
                <li>
                  <Link href="/stores" className={styles.footerLink}>
                    {isAr ? "فروعنا" : "Our Boutiques"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Client Services */}
            <div className={styles.navCol}>
              <h3 className={styles.colHeading}>
                {isAr ? "خدمة العملاء" : "Client Care"}
              </h3>
              <ul className={styles.linksList}>
                <li>
                  <Link href="/contact" className={styles.footerLink}>
                    {isAr ? "تواصل مع الكونسيرج" : "Contact Concierge"}
                  </Link>
                </li>
                <li>
                  <a href="#shipping" className={styles.footerLink}>
                    {isAr ? "الشحن والتوصيل" : "Shipping & Delivery"}
                  </a>
                </li>
                <li>
                  <a href="#returns" className={styles.footerLink}>
                    {isAr ? "الاستبدال والاسترجاع" : "Returns & Exchanges"}
                  </a>
                </li>
                <li>
                  <Link href="/contact" className={styles.footerLink}>
                    {isAr ? "الأسئلة المتكررة" : "Client FAQs"}
                  </Link>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* =========================================
            BOTTOM BAR (COPYRIGHT)
            ========================================= */}
        <div className={styles.bottomBar}>
          <div className={styles.copyrightBlock}>
            <p className={styles.copyrightText}>
              {isAr
                ? `© ${new Date().getFullYear()} دار جوفينيل للعطور الفاخرة (JUVENILE). جميع الحقوق محفوظة.`
                : `© ${new Date().getFullYear()} JUVENILE Haute Parfumerie. All rights reserved.`}
            </p>
            <div className={styles.legalLinks}>
              <a href="#privacy" className={styles.legalLink}>
                {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
              </a>
              <span className={styles.legalDot}>•</span>
              <a href="#terms" className={styles.legalLink}>
                {isAr ? "الشروط والأحكام" : "Terms of Service"}
              </a>
              <span className={styles.legalDot}>•</span>
              <a href="#license" className={styles.legalLink}>
                {isAr ? "سجل تجاري معتمد" : "Commercial License"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
