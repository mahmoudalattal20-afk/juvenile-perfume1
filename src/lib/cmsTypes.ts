import { PRODUCTS_CATALOG, ProductDetailData } from "@/data/products";

export interface CMSHeroConfig {
  desktopAspectRatio?: string;
  desktopHeight?: string;
  desktopMaxWidth?: string;
  mobileAspectRatio?: string;
  mobileHeight?: string;
}

export interface CMSHeroSlide {
  id: number;
  imageSrc: string;
  mobileImageSrc?: string;
  link: string;
  titleAr?: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
}

export interface CMSHighlightCard {
  id: string;
  image: string;
  labelAr?: string;
  labelEn?: string;
  titleAr?: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
  link: string;
}

export interface CMSCommunityItem {
  id: string;
  image: string;
  handle: string;
  link: string;
}

export interface CMSPromoItem {
  id: string;
  ar: string;
  en: string;
}

export interface InspiredPerfume {
  id: string;
  name: string;
  arabicName: string;
  inspiredByAr: string;
  inspiredByEn: string;
  price: number;
  originalPrice?: number;
  formattedPrice: { ar: string; en: string };
  formattedOriginalPrice?: { ar: string; en: string };
  price50ml?: number;
  price100ml?: number;
  formattedPrice50ml?: { ar: string; en: string };
  formattedPrice100ml?: { ar: string; en: string };
  volume: string;
  concentrationAr?: string;
  concentrationEn?: string;
  image: string;
  image50ml?: string;
  image100ml?: string;
  gender?: "men" | "women" | "unisex";
  descriptionAr?: string;
  descriptionEn?: string;
  inStock: boolean;
  createdAt?: string;
}

export interface CMSCoupon {
  id: string;
  code: string;
  descriptionAr?: string;
  type: "percent" | "fixed";
  value: number;
  minOrderAmount?: number;
  isActive: boolean;
  usageCount?: number;
  createdAt?: string;
  expiresAt?: string; // YYYY-MM-DD or ISO string
}

export interface CMSMuskPageConfig {
  titleAr?: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
  bannerImage?: string;
  badgeAr?: string;
  badgeEn?: string;
}

export interface CMSEditorialVideo {
  id: string;
  src: string;
  poster?: string;
  labelAr?: string;
  labelEn?: string;
  titleAr?: string;
  titleEn?: string;
}

export interface CMSEditorialSection {
  eyebrowAr?: string;
  eyebrowEn?: string;
  titleAr?: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
}

export interface CMSBukhoorItem {
  id: string;
  nameEn: string;
  nameAr: string;
  subEn: string;
  subAr: string;
  priceEn: string;
  priceAr: string;
  priceRaw: number;
  image: string;
  isSoldOut?: boolean;
}

export interface CMSBukhoorSection {
  isEnabled?: boolean;
  bannerImage?: string;
  bannerHeadlineAr?: string;
  bannerHeadlineEn?: string;
  bannerSubtitleAr?: string;
  bannerSubtitleEn?: string;
  titleAr?: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
  items?: CMSBukhoorItem[];
}

export interface SiteCMSData {
  heroConfig?: CMSHeroConfig;
  heroSlides: CMSHeroSlide[];
  promoStrip: {
    isEnabled: boolean;
    items: CMSPromoItem[];
  };
  highlights: CMSHighlightCard[];
  community: CMSCommunityItem[];
  brandStory: {
    titleAr: string;
    titleEn: string;
    subtitleAr: string;
    subtitleEn: string;
    quoteAr: string;
    quoteEn: string;
  };
  editorialSection?: CMSEditorialSection;
  editorialVideos?: CMSEditorialVideo[];
  bukhoorSection?: CMSBukhoorSection;
  products: Record<string, ProductDetailData>;
  inspiredProducts?: Record<string, InspiredPerfume>;
  coupons?: Record<string, CMSCoupon>;
  muskPage?: CMSMuskPageConfig;
  featuredProductIds?: string[];
  featuredInspiredProductIds?: string[];
  deletedProducts?: string[];
  deletedInspiredProducts?: string[];
  lastUpdated: string;
}

export const DEFAULT_FEATURED_PRODUCT_IDS: string[] = [
  "crest-absolu",
  "night-paris",
  "alfarid",
  "kohly",
  "pink-kiss",
  "half-million",
  "escalade",
  "liquid-gold",
  "fly-828",
];

export const DEFAULT_FEATURED_INSPIRED_PRODUCT_IDS: string[] = [
  "dior-homme-intense",
  "acqua-di-gio-profumo",
  "invictus-victory-elixir",
  "stronger-with-you-intense",
  "mancera-roses-vanille",
  "le-male-elixir",
];

export const DEFAULT_BUKHOOR_ITEMS: CMSBukhoorItem[] = [
  {
    id: "agarwood-rose",
    nameEn: "ROSE · SCENTED AGARWOOD",
    nameAr: "بخور العود المعطر بالورد",
    subEn: "Scented Agarwood",
    subAr: "عود مروكي معطر",
    priceEn: "LE 5,860.40",
    priceAr: "5,860.40 ج.م",
    priceRaw: 5860.4,
    image: "/products/agarwood-rose.png",
    isSoldOut: false,
  },
  {
    id: "agarwood-luban",
    nameEn: "LUBAN · SCENTED AGARWOOD",
    nameAr: "بخور العود المعطر باللبان",
    subEn: "Scented Agarwood",
    subAr: "لبان حوجري ملكي وعود",
    priceEn: "LE 5,860.40",
    priceAr: "5,860.40 ج.م",
    priceRaw: 5860.4,
    image: "/products/agarwood-luban.png",
    isSoldOut: false,
  },
  {
    id: "agarwood-anbar",
    nameEn: "ANBAR · SCENTED AGARWOOD",
    nameAr: "بخور العود المعطر بالعنبر",
    subEn: "Scented Agarwood",
    subAr: "عنبر ملكي وعود معتق",
    priceEn: "LE 5,860.40",
    priceAr: "5,860.40 ج.م",
    priceRaw: 5860.4,
    image: "/products/agarwood-anbar.png",
    isSoldOut: true,
  },
];

export const DEFAULT_BUKHOOR_SECTION: CMSBukhoorSection = {
  isEnabled: true,
  bannerImage: "/highlights/bukhoor-banner.jpg",
  bannerHeadlineAr: "حضورٌ مهيب. فخامة متناهية. أصالة خالدة.",
  bannerHeadlineEn: "Commanding. Refined. Timeless.",
  bannerSubtitleAr: "تعبيرٌ راقٍ عن نقاء العود الطبيعي المعطر — صُمم ليعيد صياغة المكان، والهيبة، والطقوس الفاخرة.",
  bannerSubtitleEn: "An elevated expression of pure oud — crafted to define space, presence, and ritual.",
  titleAr: "حضورٌ يُعيد صياغة المكان",
  titleEn: "PRESENCE, REDEFINED.",
  subtitleAr: "أرقى تشكيلات العود المعطر الطبيعي لتجربة استثنائية تأسر الحواس.",
  subtitleEn: "An elevated expression of pure oud — crafted to define space, presence, and ritual.",
  items: DEFAULT_BUKHOOR_ITEMS,
};

export const DEFAULT_CMS_DATA: SiteCMSData = {
  featuredProductIds: DEFAULT_FEATURED_PRODUCT_IDS,
  featuredInspiredProductIds: DEFAULT_FEATURED_INSPIRED_PRODUCT_IDS,
  deletedProducts: [],
  deletedInspiredProducts: [],
  bukhoorSection: DEFAULT_BUKHOOR_SECTION,
  muskPage: {
    titleAr: "مجموعة المسك الفاخر",
    titleEn: "EXCLUSIVE MUSK COLLECTION",
    subtitleAr: "نقاء مخملي ونفحات نقية تأسر الحواس بأرقى خلاصات المسك الطبيعي والفرنسي الفاخر",
    subtitleEn: "Pure velvety accords and royal olfactory harmonies crafted with modern Parisian restraint",
    bannerImage: "/highlights/unisex.jpg",
    badgeAr: "مجموعة المسك الملكية",
    badgeEn: "Royal Musk Collection",
  },
  coupons: {
    "JUVENILE10": {
      id: "JUVENILE10",
      code: "JUVENILE10",
      descriptionAr: "خصم ترحيبي 10% لجميع العملاء",
      type: "percent",
      value: 10,
      minOrderAmount: 0,
      isActive: true,
      usageCount: 0,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    "VIP": {
      id: "VIP",
      code: "VIP",
      descriptionAr: "خصم كبار العملاء 15% للطلبات فوق 2000 ج.م",
      type: "percent",
      value: 15,
      minOrderAmount: 2000,
      isActive: true,
      usageCount: 0,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    "WELCOME": {
      id: "WELCOME",
      code: "WELCOME",
      descriptionAr: "قسيمة خصم 100 ج.م للطلبات فوق 1000 ج.م",
      type: "fixed",
      value: 100,
      minOrderAmount: 1000,
      isActive: true,
      usageCount: 0,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  },
  heroConfig: {
    desktopAspectRatio: "2560 / 1100",
    desktopHeight: "none",
    desktopMaxWidth: "100%",
    mobileAspectRatio: "16 / 9",
    mobileHeight: "none",
  },
  heroSlides: [
    {
      id: 0,
      imageSrc: "/uploads/cover-0_1790773207834.webp",
      link: "#bestsellers",
      titleAr: "جوفينيل للعطور الفاخرة",
      titleEn: "JUVENILE HAUTE PARFUMERIE",
      subtitleAr: "أصالة باريسية تنبض بروح الشباب العصري",
      subtitleEn: "Parisian restraint with youthful tension",
      mobileImageSrc: "/uploads/hero1_1790512378228.webp",
    },
    {
      id: 1,
      imageSrc: "/uploads/cover-2_1790773217393.webp",
      link: "#bestsellers",
      titleAr: "بانر جديد",
      titleEn: "New Banner",
      mobileImageSrc: "/uploads/hero_2_1790772965668.webp",
    },
  ],
  promoStrip: {
    isEnabled: true,
    items: [
      {
        id: "p1",
        ar: "توصيل مجاني لكافة مدن المملكة للطلبات فوق 500 ريال",
        en: "Complimentary Express Delivery on Orders Above $150",
      },
      {
        id: "p2",
        ar: "عينات فاخرة مجانية مختارة مع كل طلب",
        en: "Complimentary Discovery Samples Included with Every Order",
      },
      {
        id: "p3",
        ar: "استخدم كود JUVENILE10 للحصول على خصم 10% فوري",
        en: "Use Code JUVENILE10 for 10% Instant Privilege",
      },
      {
        id: "p4",
        ar: "ضمان ذهبي استثنائي للاستبدال والاسترجاع بكل سهولة",
        en: "Golden Atelier Guarantee with Seamless Concierge Returns",
      },
    ],
  },
  highlights: [
    {
      id: "for-her",
      image: "/highlights/her.jpg",
      labelAr: "عطور نسائية ساحرة ومخملية",
      labelEn: "FOR HER — ENCHANTING FEMININITY",
      link: "/category/women",
    },
    {
      id: "for-him",
      image: "/highlights/him.png",
      labelAr: "عطور رجالية مهيبة وفخمة",
      labelEn: "FOR HIM — REGAL PRESENCE",
      link: "/category/men",
    },
    {
      id: "unisex",
      image: "/highlights/unisex.jpg",
      labelAr: "عطور للجنسين راقية ومتميزة",
      labelEn: "UNISEX — HARMONIOUS ELEGANCE",
      link: "/category/unisex",
    },
  ],

  community: [
    {
      id: "c1",
      image: "/community/c1.jpg",
      handle: "@juvenile.fragrance",
      link: "https://instagram.com",
    },
    {
      id: "c2",
      image: "/community/c2.jpg",
      handle: "@juvenile.fragrance",
      link: "https://instagram.com",
    },
    {
      id: "c3",
      image: "/community/c3.jpg",
      handle: "@juvenile.fragrance",
      link: "https://instagram.com",
    },
    {
      id: "c4",
      image: "/community/c4.jpg",
      handle: "@juvenile.fragrance",
      link: "https://instagram.com",
    },
  ],
  brandStory: {
    titleAr: "دار جوفينيل الباريسية",
    titleEn: "THE JUVENILE MAISON",
    subtitleAr: "صناعة العطور الفاخرة بإتقان فرنسي معاصر وتناغم شاعري استثنائي",
    subtitleEn: "Haute perfumery crafted with contemporary French restraint and poetic alchemy",
    quoteAr: "العطر ليس مجرد رائحة، بل هو هالتك الخاصة وحضورك الذي يسبقك ويبقى بعد رحيلك.",
    quoteEn: "Perfume is not merely a scent; it is your unspoken aura that arrives before you and lingers forever.",
  },
  editorialSection: {
    eyebrowAr: "رؤية بصرية • JUVENILE EDITORIAL",
    eyebrowEn: "JUVENILE EDITORIAL",
    titleAr: "قصص تُروى بالعطر",
    titleEn: "BEYOND THE BOTTLE",
    subtitleAr: "اكتشف الحكايات والإلهام وراء كل عطر.",
    subtitleEn: "Discover the stories that shape each fragrance.",
  },
  editorialVideos: [
    {
      id: "v1",
      src: "/videos/showcase-1.mp4",
      labelAr: "المجموعة الملكية",
      labelEn: "ROYAL COLLECTION",
      titleAr: "ROYAL COLLECTION",
      titleEn: "ROYAL COLLECTION",
    },
    {
      id: "v2",
      src: "/videos/showcase-2.mp4",
      labelAr: "إصدار 2026",
      labelEn: "SIGNATURE EDITION",
      titleAr: "SIGNATURE EDITION",
      titleEn: "SIGNATURE EDITION",
    },
  ],
  products: PRODUCTS_CATALOG,
  inspiredProducts: {},
  lastUpdated: new Date().toISOString(),
};
