"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, User, Heart, Menu, X, Globe, ChevronDown, Search, Sparkles, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { PRODUCTS_CATALOG } from "@/data/products";
import { SmilingBotIcon } from "./FragranceConcierge";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import styles from "./Header.module.css";

import { MobileMenu } from "./MobileMenu";
import { CartDrawer } from "./CartDrawer";
import { WishlistDrawer } from "./WishlistDrawer";
import { AuthModal } from "./AuthModal";
import { PerfumesMegaMenu } from "./PerfumesMegaMenu";

interface HeaderProps {
  cartCount?: number;
}

const EGYPTIAN_SEARCH_PLACEHOLDERS = [
  "عايز عطر فيه فانيليا وسويت...",
  "عطر فخم وثابت جداً للمناسبات...",
  "عايز حاجة هادية تنفع للدوام...",
  "عطر شتوي دافي وفواح قوي...",
  "عطور نسائية جذابة بثبات عالي...",
  "عطر رجالي رسمي وهيبة...",
  "بخور وعود معطر للبيت...",
];

const EN_SEARCH_PLACEHOLDERS = [
  "Looking for warm vanilla & sweet notes...",
  "Luxury long-lasting scent for special occasions...",
  "Fresh & subtle daily scent for office...",
  "Rich woody & spicy winter perfumes...",
  "Signature French extrait de parfum...",
];

export const Header: React.FC<HeaderProps> = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPerfumesMegaOpen, setIsPerfumesMegaOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiInsight, setAiInsight] = useState<string>("");
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiProducts, setAiProducts] = useState<any[]>([]);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchOverlayRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { locale, t, toggleLanguage } = useLanguage();
  const {
    cartItems,
    cartCount,
    updateQuantity,
    removeItem,
    isCartOpen,
    setIsCartOpen,
    wishlistItems,
    removeFromWishlist,
    addToCart,
    isWishlistOpen,
    setIsWishlistOpen,
    isAuthOpen,
    setIsAuthOpen,
  } = useCart();

  const { scrollDirection, isPastThreshold } = useScrollDirection({
    threshold: 10,
    minScroll: 60,
  });
  const isAnyModalOpen =
    isCartOpen ||
    isWishlistOpen ||
    isAuthOpen ||
    mobileMenuOpen ||
    isPerfumesMegaOpen ||
    isSearchOpen;

  const isHeaderHidden =
    !isAnyModalOpen && scrollDirection === "down" && isPastThreshold;

  const [cartImpact, setCartImpact] = useState(false);
  const [wishlistImpact, setWishlistImpact] = useState(false);

  // Listen for fly-to-target impact animations (Desktop only — mobile impacts bottom navigation)
  useEffect(() => {
    const handleFlyImpact = (e: Event) => {
      if (typeof window !== "undefined" && window.innerWidth <= 768) {
        return;
      }
      const customEvent = e as CustomEvent<{ type?: "cart" | "wishlist" }>;
      const type = customEvent.detail?.type || "cart";
      if (type === "cart") {
        setCartImpact(true);
        setTimeout(() => setCartImpact(false), 650);
      } else {
        setWishlistImpact(true);
        setTimeout(() => setWishlistImpact(false), 650);
      }
    };

    window.addEventListener("juvenile:fly-impact", handleFlyImpact);
    return () => window.removeEventListener("juvenile:fly-impact", handleFlyImpact);
  }, []);

  // Auto-focus search input when search opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
    }
  }, [isSearchOpen]);

  // Handle outside click & escape key for Search & Mega Menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPerfumesMegaOpen(false);
        setIsSearchOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setIsPerfumesMegaOpen(false);
      }
      if (
        searchOverlayRef.current &&
        !searchOverlayRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest(`.${styles.actionIconBtn}`)
      ) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    if (isPerfumesMegaOpen || isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPerfumesMegaOpen, isSearchOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsPerfumesMegaOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const togglePerfumesMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsPerfumesMegaOpen((prev) => !prev);
  };

  const handlePerfumesEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsPerfumesMegaOpen(true);
  };

  const handlePerfumesLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsPerfumesMegaOpen(false);
    }, 240);
  };

  const handleNavScroll = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    setIsPerfumesMegaOpen(false);
    const cleanId = hash.replace(/^#/, "").split(/[?&]/)[0];
    if (pathname === "/") {
      try {
        const el = cleanId ? document.getElementById(cleanId) : null;
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", hash);
        }
      } catch (err) {
        console.warn("Failed to scroll to nav hash target:", err);
      }
    } else {
      router.push("/" + hash);
    }
  };

  // Debounced AI Search Trigger with Gemini & Local Semantic Fallback
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setAiInsight("");
      setAiProducts([]);
      setIsAiSearching(false);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      return;
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(async () => {
      setIsAiSearching(true);
      try {
        const res = await fetch("/api/search/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q, locale }),
        });
        const data = await res.json();
        if (data.success) {
          setAiInsight(data.aiInsight || "");
          setAiProducts(Array.isArray(data.products) ? data.products : []);
        }
      } catch (err) {
        console.warn("AI search error", err);
      } finally {
        setIsAiSearching(false);
      }
    }, 300);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery, locale]);

  // Egyptian Dialect Typewriter Animated Placeholder Effect
  useEffect(() => {
    if (!isSearchOpen || searchQuery) {
      setAnimatedPlaceholder("");
      return;
    }

    const phrases = locale === "ar" ? EGYPTIAN_SEARCH_PLACEHOLDERS : EN_SEARCH_PLACEHOLDERS;
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timer: NodeJS.Timeout;

    const tick = () => {
      const phrase = phrases[phraseIdx];

      if (!isDeleting) {
        setAnimatedPlaceholder(phrase.slice(0, charIdx + 1));
        charIdx++;

        if (charIdx === phrase.length) {
          isDeleting = true;
          timer = setTimeout(tick, 2300); // Pause on completed phrase
          return;
        }
        timer = setTimeout(tick, 55); // Typing speed
      } else {
        setAnimatedPlaceholder(phrase.slice(0, charIdx - 1));
        charIdx--;

        if (charIdx === 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          timer = setTimeout(tick, 350); // Short pause before next phrase
          return;
        }
        timer = setTimeout(tick, 28); // Deleting speed
      }
    };

    timer = setTimeout(tick, 250);

    return () => clearTimeout(timer);
  }, [isSearchOpen, searchQuery, locale]);

  // Synchronous Local Matching Fallback (0ms latency while typing)
  const allProducts = Object.values(PRODUCTS_CATALOG);
  const localMatchingProducts = searchQuery.trim()
    ? allProducts
        .filter((p) => {
          const q = searchQuery.trim().toLowerCase();
          const catStr =
            typeof p.category === "object"
              ? `${p.category.ar} ${p.category.en}`
              : String(p.category || "");
          const descStr =
            typeof p.description === "object"
              ? `${p.description.ar} ${p.description.en}`
              : String(p.description || "");
          const topNotes = p.pyramid?.topNotes?.ar || "";
          const baseNotes = p.pyramid?.baseNotes?.ar || "";
          return (
            p.name.toLowerCase().includes(q) ||
            p.arabicName.includes(q) ||
            catStr.toLowerCase().includes(q) ||
            descStr.toLowerCase().includes(q) ||
            topNotes.includes(q) ||
            baseNotes.includes(q)
          );
        })
        .slice(0, 6)
        .map((p) => ({
          id: p.id,
          name: p.name,
          arabicName: p.arabicName,
          price: p.price,
          formattedPrice: typeof p.price === "number" ? `${p.price.toLocaleString("ar-EG")} ج.م` : p.price,
          image: p.image || p.gallery?.[0] || "/hero/hero-1.jpg",
          notes: [
            p.pyramid?.topNotes?.ar?.split("،")[0] || p.pyramid?.topNotes?.ar?.split(",")[0],
            p.pyramid?.baseNotes?.ar?.split("،")[0] || p.pyramid?.baseNotes?.ar?.split(",")[0],
          ]
            .filter(Boolean)
            .join(" • "),
        }))
    : [];

  const isQueryConversational =
    searchQuery.trim().split(/\s+/).length >= 2 ||
    /عندكم|عايز|عاوز|مش|فواح|هادي|حريمي|نسائي|رجالي|بنات|هدية/i.test(searchQuery);

  const displayProducts =
    aiProducts.length > 0
      ? aiProducts
      : isAiSearching || isQueryConversational
      ? []
      : localMatchingProducts;

  return (
    <div
      className={`${styles.headerContainer} ${isHeaderHidden ? styles.headerHidden : ""}`}
    >
      <header className={styles.floatingNav}>
        {/* =========================================
            COLUMN 1: BRAND LOGO (RIGHT IN RTL / LEFT IN LTR)
            ========================================= */}
        <Link href="/" className={styles.logoWrapper} aria-label="JUVENILE Fragrance Home">
          <Image
            src="/logo.webp"
            alt="JUVENILE Fragrance"
            width={180}
            height={50}
            priority
            className={styles.logoImage}
          />
        </Link>

        {/* =========================================
            COLUMN 2: CENTERED EDITORIAL NAVIGATION
            ========================================= */}
        <nav className={styles.navLinks} aria-label={t.header.menu}>
          <div
            ref={megaMenuRef}
            className={styles.megaMenuTriggerWrapper}
            onMouseEnter={handlePerfumesEnter}
            onMouseLeave={handlePerfumesLeave}
          >
            <button
              type="button"
              onClick={togglePerfumesMenu}
              className={`${styles.navLink} ${isPerfumesMegaOpen ? styles.navLinkActive : ""}`}
              aria-expanded={isPerfumesMegaOpen}
              aria-haspopup="true"
            >
              <span>{t.header.nav.collections}</span>
              <ChevronDown
                size={12}
                className={`${styles.navChevron} ${isPerfumesMegaOpen ? styles.navChevronOpen : ""}`}
              />
            </button>

            {/* 2026 Luxury Vertical Dropdown Menu */}
            <PerfumesMegaMenu
              isOpen={isPerfumesMegaOpen}
              onClose={() => setIsPerfumesMegaOpen(false)}
              onMouseEnter={handlePerfumesEnter}
              onMouseLeave={handlePerfumesLeave}
            />
          </div>

          <Link
            href="/inspired"
            className={`${styles.navLink} ${pathname === "/inspired" ? styles.navLinkActive : ""}`}
          >
            {t.header.nav.inspired || (locale === "ar" ? "عطور مستوحاة" : "INSPIRED")}
          </Link>
          <Link
            href="/story"
            className={`${styles.navLink} ${pathname === "/story" ? styles.navLinkActive : ""}`}
          >
            {t.header.nav.ourStory}
          </Link>
          <Link
            href="/stores"
            className={`${styles.navLink} ${pathname === "/stores" ? styles.navLinkActive : ""}`}
          >
            {t.header.nav.stores}
          </Link>
          <Link
            href="/contact"
            className={`${styles.navLink} ${pathname === "/contact" ? styles.navLinkActive : ""}`}
          >
            {t.header.nav.contactUs}
          </Link>
        </nav>

        {/* =========================================
            COLUMN 3: QUIET LUXURY ACTION ICONS (2026)
            ========================================= */}
        <div className={styles.actionsGroup}>
          {/* Instant Search Icon Button (Desktop Only) */}
          <button
            className={`${styles.actionIconBtn} ${styles.desktopOnlyAction} ${isSearchOpen ? styles.actionIconBtnActive : ""}`}
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              setIsCartOpen(false);
              setIsWishlistOpen(false);
              setIsAuthOpen(false);
            }}
            aria-label={locale === "ar" ? "البحث عن عطور" : "Search Fragrances"}
            title={locale === "ar" ? "البحث السريع" : "Search Fragrances"}
          >
            <Search size={18} strokeWidth={1.6} />
          </button>

          {/* Wishlist Button (Hidden on Mobile) */}
          <button
            id="header-wishlist-btn"
            className={`${styles.actionIconBtn} ${styles.desktopOnlyAction} ${wishlistImpact ? styles.iconImpactBump : ""}`}
            onClick={() => {
              setIsCartOpen(false);
              setIsAuthOpen(false);
              setIsSearchOpen(false);
              setIsWishlistOpen(true);
            }}
            aria-label={t.header.wishlist}
            title={t.header.wishlist}
          >
            <Heart size={18} strokeWidth={1.6} className={wishlistImpact ? styles.heartIconPop : ""} />
            {wishlistItems.length > 0 && (
              <span className={`${styles.microDotBadge} ${wishlistImpact ? styles.badgePop : ""}`} />
            )}
          </button>

          {/* User Account Button (Hidden on Mobile) */}
          <button
            className={`${styles.actionIconBtn} ${styles.desktopOnlyAction}`}
            onClick={() => {
              setIsCartOpen(false);
              setIsWishlistOpen(false);
              setIsSearchOpen(false);
              setIsAuthOpen(true);
            }}
            aria-label={t.header.login}
            title={t.header.login}
          >
            <User size={18} strokeWidth={1.6} />
          </button>

          {/* Shopping Bag / Cart Button */}
          <button
            id="header-cart-btn"
            className={`${styles.actionIconBtn} ${cartImpact ? styles.iconImpactBump : ""}`}
            onClick={() => {
              setIsWishlistOpen(false);
              setIsAuthOpen(false);
              setIsSearchOpen(false);
              setIsCartOpen(true);
            }}
            aria-label={t.header.cart}
            title={t.header.cart}
          >
            <ShoppingBag size={18} strokeWidth={1.6} />
            {cartCount > 0 && (
              <span className={`${styles.cartCountMicroBadge} ${cartImpact ? styles.badgePop : ""}`}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Elegant Luxury Divider */}
          <span className={styles.actionDivider} aria-hidden="true" />

          {/* Minimal Luxury Language Switcher (ISO Code: EN / AR) */}
          <button
            className={styles.luxuryLangToggle}
            onClick={toggleLanguage}
            aria-label={locale === "ar" ? "Switch to English" : "التحويل إلى العربية"}
            title={locale === "ar" ? "English" : "العربية"}
          >
            <span className={styles.langCode}>{locale === "ar" ? "EN" : "AR"}</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={t.header.menu}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* =========================================
          2026 LUXURY INSTANT SEARCH OVERLAY
          ========================================= */}
      {isSearchOpen && (
        <div className={styles.searchOverlay} ref={searchOverlayRef}>
          <div className={styles.searchInner}>
            <div className={styles.searchBarWrapper}>
              <Search size={22} className={styles.searchIcon} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  searchQuery
                    ? ""
                    : animatedPlaceholder || (locale === "ar" ? "ابحث عن عطر أو نوتة عطرية..." : "Search fragrances...")
                }
                aria-label={locale === "ar" ? "بحث ذكي عن العطور" : "Smart fragrance search"}
                className={styles.searchInput}
              />
              <button
                type="button"
                className={styles.searchCloseBtn}
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                  setAiInsight("");
                  setAiProducts([]);
                }}
                aria-label="إغلاق البحث"
              >
                <X size={16} />
              </button>
            </div>

            {/* AI Searching Shimmer Loader */}
            {isAiSearching && (
              <div className={styles.aiSearchingShimmer}>
                <Loader2 size={13} className="animate-spin" />
                <span>
                  {locale === "ar"
                    ? "✨ جارٍ تحليل النوتات العطرية واختيار الأنسب لك..."
                    : "✨ Analyzing fragrance notes for your signature scent..."}
                </span>
              </div>
            )}

            {/* 2026 Luxury AI Advisor Recommendation Card */}
            {aiInsight && (
              <div className={styles.aiAdvisorCard}>
                <div className={styles.aiAdvisorIconBadge}>
                  <SmilingBotIcon size={22} />
                </div>
                <div className={styles.aiAdvisorContent}>
                  <div className={styles.aiAdvisorHeader}>
                    <span className={styles.aiAdvisorTitle}>
                      <Sparkles size={14} />
                      {locale === "ar" ? "ترشيح مستشار جُوفينيل الخاص:" : "JUVENILE Fragrance Advisor:"}
                    </span>
                    <button
                      type="button"
                      className={styles.aiAdvisorChatBtn}
                      onClick={() => {
                        setIsSearchOpen(false);
                        window.dispatchEvent(
                          new CustomEvent("open-fragrance-concierge", {
                            detail: { query: searchQuery },
                          })
                        );
                      }}
                    >
                      <span>{locale === "ar" ? "تحدث مع المستشار العطري 🌸" : "Chat with Fragrance Advisor"}</span>
                    </button>
                  </div>
                  <p className={styles.aiAdvisorText}>{aiInsight}</p>
                </div>
              </div>
            )}

            {/* Live Matches Grid */}
            {searchQuery.trim().length > 0 && (
              displayProducts.length > 0 ? (
                <div className={styles.searchResultsGrid}>
                  {displayProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.id}`}
                      className={`${styles.searchResultCard} ${aiInsight ? styles.searchResultCardAi : ""}`}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image || (p.images && p.images[0]) || "/hero/hero-1.jpg"}
                        alt={p.arabicName || p.name}
                        className={styles.searchResultImg}
                      />
                      <div className={styles.searchResultInfo}>
                        {aiInsight && (
                          <span className={styles.aiPickBadge}>
                            ✨ {locale === "ar" ? "ترشيح ذكي" : "AI Pick"}
                          </span>
                        )}
                        <span className={styles.searchResultName}>
                          {locale === "ar" ? p.arabicName : p.name}
                        </span>
                        {p.notes && <span className={styles.searchResultNotes}>{p.notes}</span>}
                        <span className={styles.searchResultPrice}>
                          {typeof p.price === "number"
                            ? `${p.price.toLocaleString("ar-EG")} ج.م`
                            : p.formattedPrice || p.price}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                !isAiSearching && (
                  <div className={styles.searchNoResults}>
                    {locale === "ar"
                      ? "لا توجد نتائج مطابقة لبحثك، جرب البحث بنوتة عطرية (عود، عنبر، فانيليا) أو اسأل المستشار الذكي."
                      : "No matching fragrances found. Try searching by note or asking our AI concierge."}
                  </div>
                )
              )
            )}
          </div>
        </div>
      )}

      {/* 2026 Luxury Liquid Glass Mobile Navigation Drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        cartCount={cartCount}
      />

      {/* Interactive Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />

      {/* Interactive Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlistItems}
        onRemove={removeFromWishlist}
        onAddToCart={(item) => {
          addToCart({
            id: item.id,
            name: item.name,
            type: "أو دو بارفان",
            price: 4500,
            formattedPrice: item.price,
            image: item.image,
          });
          removeFromWishlist(item.id);
        }}
      />

      {/* Interactive Login / Account Modal */}
      {isAuthOpen && (
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      )}
    </div>
  );
};
