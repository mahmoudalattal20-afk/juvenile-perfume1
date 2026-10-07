"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./MobileMenu.module.css";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  cartCount?: number;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animateOpen, setAnimateOpen] = useState(false);
  const [perfumesExpanded, setPerfumesExpanded] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let raf1: number;
    let raf2: number;

    if (isOpen) {
      setShouldRender(true);
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setAnimateOpen(true);
        });
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    } else {
      setAnimateOpen(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const { locale, direction, t, toggleLanguage } = useLanguage();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !shouldRender) return null;

  const mainLinks = [
    { label: t.mobileMenu.nav.collections, href: "#collections" },
    { label: t.mobileMenu.nav.inspired || (locale === "ar" ? "عطور مستوحاة" : "INSPIRED"), href: "/inspired" },
    { label: t.mobileMenu.nav.ourStory, href: "/story" },
    { label: t.mobileMenu.nav.stores, href: "/stores" },
    { label: t.mobileMenu.nav.contactUs, href: "/contact" },
  ];

  const handleMobileNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onClose();
    if (href.startsWith("/")) {
      router.push(href);
      return;
    }
    const cleanId = href.replace(/^#/, "").split(/[?&]/)[0];
    if (pathname === "/") {
      setTimeout(() => {
        try {
          const el = cleanId ? document.getElementById(cleanId) : null;
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
            window.history.pushState(null, "", href);
          }
        } catch (err) {
          console.warn("Failed to scroll to mobile nav target:", err);
        }
      }, 120);
    } else {
      router.push("/" + href);
    }
  };

  return createPortal(
    <div
      className={`${styles.overlay} ${animateOpen ? styles.overlayOpen : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={t.mobileMenu.title}
    >
      {/* Full-Screen Pure White Luxury Surface */}
      <div className={styles.menuContainer}>
        {/* Top Bar matching the Header layout */}
        <header className={styles.topBar}>
          <Link
            href="/"
            onClick={onClose}
            className={styles.logoLink}
            aria-label="JUVENILE Fragrance"
          >
            <Image
              src="/logo.png"
              alt="JUVENILE"
              width={140}
              height={38}
              priority
              className={styles.logoImg}
            />
          </Link>

          <div className={styles.topBarActions}>
            {/* Language Switcher Pill */}
            <button
              onClick={toggleLanguage}
              className={styles.langToggleBtn}
              aria-label={locale === "ar" ? "Switch to English" : "التحويل إلى العربية"}
            >
              <Globe size={14} className={styles.langIcon} />
              <span>{t.mobileMenu.switchLang}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={styles.closeBtn}
              aria-label={t.mobileMenu.close}
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Navigation Body */}
        <div className={styles.bodyContent}>
          {/* Main Apple-Style Links */}
          <nav className={styles.navLinks} aria-label={t.mobileMenu.title}>
            {mainLinks.map((link, idx) => {
              const isCollections = link.href === "#collections";

              if (isCollections) {
                return (
                  <div key={link.href} style={{ width: "100%" }}>
                    <button
                      type="button"
                      onClick={() => setPerfumesExpanded(!perfumesExpanded)}
                      className={styles.navLink}
                      style={{ animationDelay: `${0.03 * (idx + 1)}s` }}
                    >
                      <span className={styles.linkLabel}>{link.label}</span>
                      <div className={styles.linkEnd}>
                        <ChevronDown
                          size={18}
                          className={`${styles.chevronIcon} ${perfumesExpanded ? styles.chevronExpanded : ""}`}
                        />
                      </div>
                    </button>

                    {perfumesExpanded && (
                      <div className={styles.submenuList}>
                        {[
                          { id: "men", ar: "رجالي", en: "Men", badgeAr: "فخامة", badgeEn: "For Him", href: "/category/men" },
                          { id: "women", ar: "حريمي", en: "Women", badgeAr: "أنوثة", badgeEn: "For Her", href: "/category/women" },
                          { id: "unisex", ar: "للجنسين", en: "Unisex", badgeAr: "للجنسين", badgeEn: "Universal", href: "/category/unisex" },
                          { id: "bukhoor", ar: "بخور", en: "Bukhoor", badgeAr: "أصالة", badgeEn: "Incense", href: "/category/bukhoor" },
                          { id: "bodysplash", ar: "بادي سبلاش", en: "Body Splash", badgeAr: "انتعاش", badgeEn: "Splash", href: "/category/bodysplash" },
                          { id: "musk", ar: "المسك", en: "Musk", badgeAr: "نقاء", badgeEn: "Pure", href: "/musk" },
                        ].map((subCat, subIdx) => {
                          return (
                            <Link
                              key={subCat.id}
                              href={subCat.href}
                              onClick={() => {
                                onClose();
                              }}
                              className={styles.subLink}
                              style={{
                                animationDelay: `${subIdx * 45}ms`,
                              }}
                            >
                              <span className={styles.subLinkText}>
                                <span className={styles.subDot} aria-hidden="true" />
                                {locale === "ar" ? subCat.ar : subCat.en}
                              </span>
                              <span className={styles.subBadge}>
                                {locale === "ar" ? subCat.badgeAr : subCat.badgeEn}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={"/" + link.href}
                  onClick={(e) => handleMobileNav(e, link.href)}
                  className={styles.navLink}
                  style={{ animationDelay: `${0.03 * (idx + 1)}s` }}
                >
                  <span className={styles.linkLabel}>{link.label}</span>
                  <div className={styles.linkEnd}>
                    {direction === "rtl" ? (
                      <ChevronLeft size={19} className={styles.chevronIcon} />
                    ) : (
                      <ChevronRight size={19} className={styles.chevronIcon} />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>,
    document.body
  );
};

