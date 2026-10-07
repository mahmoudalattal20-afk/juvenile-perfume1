"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./PerfumesMegaMenu.module.css";

export interface PerfumesMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

interface CollectionDropdownItem {
  id: "men" | "women" | "unisex" | "bukhoor" | "bodysplash" | "musk";
  nameEn: string;
  nameAr: string;
  href: string;
}

const LUXURY_COLLECTION_ITEMS: CollectionDropdownItem[] = [
  { id: "men", nameEn: "Men", nameAr: "رجالي", href: "/category/men" },
  { id: "women", nameEn: "Women", nameAr: "حريمي", href: "/category/women" },
  { id: "unisex", nameEn: "Unisex", nameAr: "للجنسين", href: "/category/unisex" },
  { id: "bukhoor", nameEn: "Bukhoor", nameAr: "بخور", href: "/category/bukhoor" },
  { id: "bodysplash", nameEn: "Body Splash", nameAr: "بادي سبلاش", href: "/category/bodysplash" },
  { id: "musk", nameEn: "Musk", nameAr: "المسك", href: "/musk" },
];

export const PerfumesMegaMenu: React.FC<PerfumesMegaMenuProps> = ({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { locale } = useLanguage();
  const router = useRouter();
  const isAr = locale === "ar";

  const handleItemClick = (item: CollectionDropdownItem) => {
    onClose();
    router.push(item.href);
  };

  return (
    <div
      className={`${styles.dropdownWrapper} ${isOpen ? styles.open : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="menu"
      aria-label={isAr ? "أقسام العطور" : "Fragrance Categories"}
      aria-hidden={!isOpen}
    >
      <div className={styles.dropdownCard}>
        <ul className={styles.itemsList}>
          {LUXURY_COLLECTION_ITEMS.map((item, index) => {
            const displayName = isAr ? item.nameAr : item.nameEn;

            return (
              <li
                key={item.id}
                className={styles.listItem}
                style={{
                  animationDelay: isOpen ? `${index * 45}ms` : "0ms",
                }}
              >
                <Link
                  href={item.href}
                  onClick={() => {
                    onClose();
                  }}
                  className={styles.menuLink}
                  role="menuitem"
                >
                  <span className={styles.dotIndicator} aria-hidden="true" />
                  <span className={styles.linkText}>{displayName}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
