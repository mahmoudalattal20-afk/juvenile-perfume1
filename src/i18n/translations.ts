export type Locale = "ar" | "en";
export type Direction = "rtl" | "ltr";

export interface Translations {
  header: {
    nav: {
      collections: string;
      inspired?: string;
      ourStory: string;
      stores: string;
      contactUs: string;
      all: string;
      bestsellers: string;
      offers: string;
    };
    login: string;
    cart: string;
    wishlist: string;
    menu: string;
    langBtn: string;
  };
  mobileMenu: {
    title: string;
    close: string;
    nav: {
      collections: string;
      inspired?: string;
      ourStory: string;
      stores: string;
      contactUs: string;
      all: string;
      bestsellers: string;
      offers: string;
      badge20?: string;
    };
    footerNote: string;
    switchLang: string;
  };
  hero: {
    slide1: {
      tag: string;
      title: string;
      desc: string;
      cta: string;
    };
    slide2: {
      tag: string;
      title: string;
      desc: string;
      cta: string;
    };
    slide3: {
      tag: string;
      title: string;
      desc: string;
      cta: string;
    };
  };
  promoStrip: {
    items: Array<{
      badge: string;
      text: string;
    }>;
  };
  ourSelections: {
    tag?: string;
    title: string;
    subtitle: string;
    newBadge: string;
    addToCart: string;
    addedToCart: string;
    prev: string;
    next: string;
    swipeHint: string;
    products: Array<{
      id: string;
      name: string;
      category: string;
      notes?: string;
      rating?: number;
      reviewsCount?: number;
      price: number;
      formattedPrice: string;
      originalPrice?: number;
      formattedOriginalPrice?: string;
      price50ml?: number;
      formattedPrice50ml?: string;
      image: string;
      isNew?: boolean;
    }>;
  };
  bottomNav: {
    home: string;
    cart: string;
    wishlist: string;
    profile: string;
  };
}

export const translations: Record<Locale, Translations> = {
  ar: {
    header: {
      nav: {
        collections: "العطور",
        inspired: "عطور مستوحاة",
        ourStory: "قصتنا",
        stores: "فروعنا",
        contactUs: "تواصل معنا",
        all: "جميع العطور",
        bestsellers: "الأكثر مبيعاً",
        offers: "العروض الحصرية",
      },
      login: "تسجيل الدخول",
      cart: "السلة",
      wishlist: "المفضلة",
      menu: "القائمة",
      langBtn: "EN",
    },
    mobileMenu: {
      title: "القائمة",
      close: "إغلاق",
      nav: {
        collections: "العطور",
        inspired: "عطور مستوحاة",
        ourStory: "قصتنا",
        stores: "فروعنا",
        contactUs: "تواصل معنا",
        all: "جميع العطور",
        bestsellers: "الأكثر مبيعاً",
        offers: "العروض الحصرية",
      },
      footerNote: "شحن مجاني لكافة المناطق • عطور نيش أصلية 100%",
      switchLang: "EN",
    },
    hero: {
      slide1: {
        tag: "إصدار حصري 2026",
        title: "عطور نيش فاخرة تجسد الفخامة والأصالة",
        desc: "توليفات عطرية نادرة تم ابتكارها بحرفية عالية لتمنحك حضوراً ساحراً يدوم طويلاً",
        cta: "استكشف التشكيلة",
      },
      slide2: {
        tag: "المجموعة الملكية",
        title: "تناغم عطري فريد يعكس حضورك الاستثنائي",
        desc: "مستخلصات طبيعية نقية صُممت لمن يقدرون الرقي والتميز في كل مناسبة",
        cta: "تسوق العطور",
      },
      slide3: {
        tag: "تشكيلة النيش",
        title: "سحر الروائح الشرقية بلمسات باريسية معاصرة",
        desc: "حكاية فخامة تبدأ مع كل رشة لتصنع لك ذكريات لا تُنسى",
        cta: "اكتشف المزيد",
      },
    },
    promoStrip: {
      items: [
        {
          badge: "كود ترحيبي",
          text: "خصم 20% على كافة العطور الفاخرة باستخدام كود JUVENILE",
        },
        {
          badge: "إصدار حصري",
          text: "باقة سيد المجلس: 3 عطور متكاملة بحجم كامل بسعر عطر واحد",
        },
        {
          badge: "هدية مجانية",
          text: "باقة عينات عطرية فاخرة لتجربة الروائح بهدوء مع كل طلب",
        },
        {
          badge: "توصيل سريع",
          text: "شحن مجاني لكافة المناطق مع خيارات دفع آمنة ومرنة",
        },
        {
          badge: "ضمان ذهبي",
          text: "تجربة راقية مضمونة وإمكانية استرجاع واستبدال بكل سهولة",
        },
      ],
    },
    ourSelections: {
      tag: "اختياراتنا المميزة",
      title: "اختياراتنا المميزة",
      subtitle: "مجموعة منتقاة من أكثر عطورنا حضورًا وطلباً.",
      newBadge: "جديد 2026",
      addToCart: "إضافة للسلة",
      addedToCart: "تمت الإضافة للسلة",
      prev: "السابق",
      next: "التالي",
      swipeHint: "اسحب للاستكشاف",
      products: [
        {
          id: "crest-absolu",
          name: "CREST ABSOLU",
          category: "عطر رجالي ملكي",
          notes: "الجريب فروت · الأناناس · الزنجبيل · طحلب السنديان · الأمبروكسان",
          rating: 4.9,
          reviewsCount: 184,
          price: 2500,
          formattedPrice: "2,500 ج.م",
          originalPrice: 3500,
          formattedOriginalPrice: "3,500 ج.م",
          price50ml: 1750,
          formattedPrice50ml: "1,750 ج.م",
          image: "/products/crest-absolu.webp",
          isNew: true,
        },
        {
          id: "night-paris",
          name: "NIGHT PARIS",
          category: "عطر رجالي نيش",
          notes: "التفاح المقرمش · الخزامى · فانيليا بوربون · أخشاب الغاياك",
          rating: 4.9,
          reviewsCount: 165,
          price: 2500,
          formattedPrice: "2,500 ج.م",
          originalPrice: 3500,
          formattedOriginalPrice: "3,500 ج.م",
          price50ml: 1750,
          formattedPrice50ml: "1,750 ج.م",
          image: "/products/night-paris.webp",
          isNew: true,
        },
        {
          id: "alfarid",
          name: "AL FARID",
          category: "خلاصة عطر ملكي رجالي",
          notes: "الفلفل الوردي · الآمبرغريس · الباتشولي · العود المعتق",
          rating: 5.0,
          reviewsCount: 192,
          price: 3000,
          formattedPrice: "3,000 ج.م",
          originalPrice: 4500,
          formattedOriginalPrice: "4,500 ج.م",
          price50ml: 2100,
          formattedPrice50ml: "2,100 ج.م",
          image: "/products/alfarid.webp",
          isNew: true,
        },
        {
          id: "kohly",
          name: "KOHLY",
          category: "عطر نسائي ساحر",
          notes: "المارشميللو · الفراولة · زهر النكتارين · الكريمة المخفوقة",
          rating: 4.9,
          reviewsCount: 174,
          price: 2500,
          formattedPrice: "2,500 ج.م",
          originalPrice: 3500,
          formattedOriginalPrice: "3,500 ج.م",
          price50ml: 1750,
          formattedPrice50ml: "1,750 ج.م",
          image: "/products/kohly.webp",
          isNew: true,
        },
        {
          id: "pink-kiss",
          name: "PINK KISS",
          category: "عطر نسائي ناعم",
          notes: "حلوى الفراولة الفوارة · الكشمش الأسود · الغاردينيا · المسك",
          rating: 4.8,
          reviewsCount: 139,
          price: 1800,
          formattedPrice: "1,800 ج.م",
          originalPrice: 2500,
          formattedOriginalPrice: "2,500 ج.م",
          price50ml: 1250,
          formattedPrice50ml: "1,250 ج.م",
          image: "/products/pink-kiss.webp",
          isNew: true,
        },
        {
          id: "half-million",
          name: "HALF MILLION",
          category: "مجموعة بريميوم للجنسين",
          notes: "الزعفران الملكي · الياسمين · الآمبرغريس · السكر والأمبروكسان",
          rating: 4.9,
          reviewsCount: 196,
          price: 2500,
          formattedPrice: "2,500 ج.م",
          originalPrice: 3500,
          formattedOriginalPrice: "3,500 ج.م",
          price50ml: 1750,
          formattedPrice50ml: "1,750 ج.م",
          image: "/products/half-million.webp",
          isNew: true,
        },
        {
          id: "escalade",
          name: "ESCALADE",
          category: "عطر نيش للجنسين",
          notes: "الأناناس · الياقوتية · السوسن البودري · الباتشولي والمسك",
          rating: 4.8,
          reviewsCount: 152,
          price: 1800,
          formattedPrice: "1,800 ج.م",
          originalPrice: 2500,
          formattedOriginalPrice: "2,500 ج.م",
          price50ml: 1250,
          formattedPrice50ml: "1,250 ج.م",
          image: "/products/escalade.webp",
          isNew: true,
        },
        {
          id: "liquid-gold",
          name: "LIQUID GOLD",
          category: "مجموعة بريميوم الذهبية",
          notes: "الزنجبيل · الورد التركي · الفانيليا الغنية · البنزوين والصندل",
          rating: 5.0,
          reviewsCount: 188,
          price: 3500,
          formattedPrice: "3,500 ج.م",
          originalPrice: 4500,
          formattedOriginalPrice: "4,500 ج.م",
          price50ml: 2450,
          formattedPrice50ml: "2,450 ج.م",
          image: "/products/liquid-gold.webp",
          isNew: true,
        },
        {
          id: "fly-828",
          name: "FLY 828",
          category: "عطر جزيئي نيش للجنسين",
          notes: "الأمبروكسان · أيزو إي سوبر · السوسن الفلورنسي · الياسمين",
          rating: 4.9,
          reviewsCount: 147,
          price: 2500,
          formattedPrice: "2,500 ج.م",
          originalPrice: 3500,
          formattedOriginalPrice: "3,500 ج.م",
          price50ml: 1750,
          formattedPrice50ml: "1,750 ج.م",
          image: "/products/fly-828.webp",
          isNew: true,
        },
        {
          id: "night-london",
          name: "NIGHT LONDON",
          category: "خلاصة عطر ملكي للجنسين",
          notes: "العود المعتق · خشب الورد · اللافندر · القرفة السيلانية",
          rating: 5.0,
          reviewsCount: 178,
          price: 2500,
          formattedPrice: "2,500 ج.م",
          originalPrice: 3500,
          formattedOriginalPrice: "3,500 ج.م",
          price50ml: 1750,
          formattedPrice50ml: "1,750 ج.م",
          image: "/products/night-london.webp",
          isNew: true,
        },
        {
          id: "special-night",
          name: "SPECIAL NIGHT",
          category: "أو دو بارفان نيش للجنسين",
          notes: "البرغموت · الطحالب البحرية · الأمبروكسان · خشب الأرز",
          rating: 4.9,
          reviewsCount: 162,
          price: 3500,
          formattedPrice: "3,500 ج.م",
          originalPrice: 4500,
          formattedOriginalPrice: "4,500 ج.م",
          price50ml: 2450,
          formattedPrice50ml: "2,450 ج.م",
          image: "/products/special-night.webp",
          isNew: true,
        },
        {
          id: "white-oud",
          name: "WHITE OUD ATTAR",
          category: "دهن عود نيش بيور",
          notes: "ورد أبيض · عود أبيض نقي · مسك الحرير · عنبر كريستالي",
          rating: 5.0,
          reviewsCount: 142,
          price: 600,
          formattedPrice: "600 ج.م",
          originalPrice: 850,
          formattedOriginalPrice: "850 ج.م",
          price50ml: 600,
          formattedPrice50ml: "600 ج.م",
          image: "/products/white-oud.webp",
          isNew: true,
        },
        {
          id: "harim-alsultan",
          name: "HARIM AL SULTAN MUSK",
          category: "مسك ملكي فاخر",
          notes: "ورد طائفي · ياسمين ملكي · مسك حريري · فانيليا",
          rating: 4.9,
          reviewsCount: 168,
          price: 500,
          formattedPrice: "500 ج.م",
          originalPrice: 750,
          formattedOriginalPrice: "750 ج.م",
          price50ml: 500,
          formattedPrice50ml: "500 ج.م",
          image: "/products/harim-alsultan.webp",
          isNew: true,
        },
        {
          id: "misk-elroman",
          name: "POMEGRANATE MUSK",
          category: "مسك فاكهي منعش",
          notes: "رمان أحمر طازج · توت بري · مسك أبيض مخملي",
          rating: 4.9,
          reviewsCount: 185,
          price: 500,
          formattedPrice: "500 ج.م",
          originalPrice: 700,
          formattedOriginalPrice: "700 ج.م",
          price50ml: 500,
          formattedPrice50ml: "500 ج.م",
          image: "/products/misk-elroman.webp",
          isNew: true,
        },
        {
          id: "misk-tahara",
          name: "MISK AL TAHARA",
          category: "مسك طهارة أصلي نقي",
          notes: "أزهار لوتس بيضاء · سوسن بودري · مسك طهارة نقي",
          rating: 5.0,
          reviewsCount: 220,
          price: 500,
          formattedPrice: "500 ج.م",
          originalPrice: 750,
          formattedOriginalPrice: "750 ج.م",
          price50ml: 500,
          formattedPrice50ml: "500 ج.م",
          image: "/products/misk-tahara.webp",
          isNew: true,
        },
        {
          id: "dalaa-elbanat",
          name: "DALAA EL BANAT MUSK",
          category: "مسك سويتي أنثوي",
          notes: "غزل البنات · فراولة · كراميل · فانيليا ومسك",
          rating: 4.9,
          reviewsCount: 156,
          price: 500,
          formattedPrice: "500 ج.م",
          originalPrice: 700,
          formattedOriginalPrice: "700 ج.م",
          price50ml: 500,
          formattedPrice50ml: "500 ج.م",
          image: "/products/dalaa-elbanat.webp",
          isNew: true,
        },
      ],
    },
    bottomNav: {
      home: "الرئيسية",
      cart: "السلة",
      wishlist: "المفضلة",
      profile: "حسابي",
    },
  },
  en: {
    header: {
      nav: {
        collections: "COLLECTIONS",
        inspired: "INSPIRED",
        ourStory: "OUR STORY",
        stores: "STORES",
        contactUs: "CONTACT US",
        all: "ALL PERFUMES",
        bestsellers: "BESTSELLERS",
        offers: "OFFERS",
      },
      login: "Sign In",
      cart: "Cart",
      wishlist: "Wishlist",
      menu: "Menu",
      langBtn: "AR",
    },
    mobileMenu: {
      title: "Menu",
      close: "Close",
      nav: {
        collections: "COLLECTIONS",
        inspired: "INSPIRED",
        ourStory: "OUR STORY",
        stores: "STORES",
        contactUs: "CONTACT US",
        all: "ALL PERFUMES",
        bestsellers: "BESTSELLERS",
        offers: "OFFERS",
      },
      footerNote: "Complimentary Express Delivery • 100% Authentic Niche Perfumery",
      switchLang: "AR",
    },
    hero: {
      slide1: {
        tag: "Exclusive 2026 Edition",
        title: "Rare Niche Fragrances of Uncompromising Elegance",
        desc: "Artisanal high-perfumery created with master precision to grant you an enduring, magnetic aura",
        cta: "Explore Collection",
      },
      slide2: {
        tag: "Royal Collection",
        title: "An Exceptional Olfactive Harmony For Your Royal Aura",
        desc: "Pristine raw botanicals and precious resins curated for discerning connoisseurs",
        cta: "Shop Fragrances",
      },
      slide3: {
        tag: "Niche Selection",
        title: "Oriental Enchantment Crafted with Parisian Precision",
        desc: "A luxury tale unveiled with every spray to craft your signature memories",
        cta: "Discover More",
      },
    },
    promoStrip: {
      items: [
        {
          badge: "WELCOME CODE",
          text: "Enjoy 20% off all luxury fragrances with code JUVENILE",
        },
        {
          badge: "EXCLUSIVE BUNDLE",
          text: "Majlis Trio: 3 full-size signature perfumes for the price of one",
        },
        {
          badge: "GIFT WITH ORDER",
          text: "Complimentary luxury discovery sample set with every order",
        },
        {
          badge: "FAST SHIPPING",
          text: "Free insured delivery with flexible and secure payment options",
        },
        {
          badge: "GOLD GUARANTEE",
          text: "100% satisfaction guarantee with effortless exchange & returns",
        },
      ],
    },
    ourSelections: {
      tag: "BEST SELLERS",
      title: "BEST SELLERS",
      subtitle: "The fragrances our customers return to, again and again.",
      newBadge: "NEW 2026",
      addToCart: "Add to Bag",
      addedToCart: "Added to Bag",
      prev: "Previous",
      next: "Next",
      swipeHint: "Swipe to discover",
      products: [
        {
          id: "crest-absolu",
          name: "CREST ABSOLU",
          category: "Regal Masculine Extrait",
          notes: "Grapefruit · Pineapple · Ginger · Oakmoss · Ambroxan",
          rating: 4.9,
          reviewsCount: 184,
          price: 2500,
          formattedPrice: "2,500 LE",
          originalPrice: 3500,
          formattedOriginalPrice: "3,500 LE",
          price50ml: 1750,
          formattedPrice50ml: "1,750 LE",
          image: "/products/crest-absolu.webp",
          isNew: true,
        },
        {
          id: "night-paris",
          name: "NIGHT PARIS",
          category: "Niche Masculine EDP",
          notes: "Crisp Apple · French Lavender · Bourbon Vanilla · Guaiac Wood",
          rating: 4.9,
          reviewsCount: 165,
          price: 2500,
          formattedPrice: "2,500 LE",
          originalPrice: 3500,
          formattedOriginalPrice: "3,500 LE",
          price50ml: 1750,
          formattedPrice50ml: "1,750 LE",
          image: "/products/night-paris.webp",
          isNew: true,
        },
        {
          id: "alfarid",
          name: "AL FARID",
          category: "Royal Pure Extrait",
          notes: "Pink Peppercorn · Royal Ambergris · Patchouli · Aged Oud",
          rating: 5.0,
          reviewsCount: 192,
          price: 3000,
          formattedPrice: "3,000 LE",
          originalPrice: 4500,
          formattedOriginalPrice: "4,500 LE",
          price50ml: 2100,
          formattedPrice50ml: "2,100 LE",
          image: "/products/alfarid.webp",
          isNew: true,
        },
        {
          id: "kohly",
          name: "KOHLY",
          category: "Haute Feminine Floral",
          notes: "Fluffy Marshmallow · Wild Strawberry · Nectarine · Whipped Cream",
          rating: 4.9,
          reviewsCount: 174,
          price: 2500,
          formattedPrice: "2,500 LE",
          originalPrice: 3500,
          formattedOriginalPrice: "3,500 LE",
          price50ml: 1750,
          formattedPrice50ml: "1,750 LE",
          image: "/products/kohly.webp",
          isNew: true,
        },
        {
          id: "pink-kiss",
          name: "PINK KISS",
          category: "Haute Fruity Floral",
          notes: "Sparkling Strawberry · Blackcurrant · Gardenia · Silk Musk",
          rating: 4.8,
          reviewsCount: 139,
          price: 1800,
          formattedPrice: "1,800 LE",
          originalPrice: 2500,
          formattedOriginalPrice: "2,500 LE",
          price50ml: 1250,
          formattedPrice50ml: "1,250 LE",
          image: "/products/pink-kiss.webp",
          isNew: true,
        },
        {
          id: "half-million",
          name: "HALF MILLION",
          category: "Exclusive Premium",
          notes: "Royal Saffron · Jasmine · Ambergris · Spun Sugar · Ambroxan",
          rating: 4.9,
          reviewsCount: 196,
          price: 2500,
          formattedPrice: "2,500 LE",
          originalPrice: 3500,
          formattedOriginalPrice: "3,500 LE",
          price50ml: 1750,
          formattedPrice50ml: "1,750 LE",
          image: "/products/half-million.webp",
          isNew: true,
        },
        {
          id: "escalade",
          name: "ESCALADE",
          category: "Niche Chypre Unisex",
          notes: "Pineapple · Hyacinth · Powdery Iris · Patchouli · Musk",
          rating: 4.8,
          reviewsCount: 152,
          price: 1800,
          formattedPrice: "1,800 LE",
          originalPrice: 2500,
          formattedOriginalPrice: "2,500 LE",
          price50ml: 1250,
          formattedPrice50ml: "1,250 LE",
          image: "/products/escalade.webp",
          isNew: true,
        },
        {
          id: "liquid-gold",
          name: "LIQUID GOLD",
          category: "Gold Premium Collection",
          notes: "Spicy Ginger · Turkish Rose · Rich Vanilla · Benzoin · Sandalwood",
          rating: 5.0,
          reviewsCount: 188,
          price: 3500,
          formattedPrice: "3,500 LE",
          originalPrice: 4500,
          formattedOriginalPrice: "4,500 LE",
          price50ml: 2450,
          formattedPrice50ml: "2,450 LE",
          image: "/products/liquid-gold.webp",
          isNew: true,
        },
        {
          id: "fly-828",
          name: "FLY 828",
          category: "Haute Molecular Unisex",
          notes: "Ambroxan · Iso E Super · Florentine Iris · Wild Jasmine",
          rating: 4.9,
          reviewsCount: 147,
          price: 2500,
          formattedPrice: "2,500 LE",
          originalPrice: 3500,
          formattedOriginalPrice: "3,500 LE",
          price50ml: 1750,
          formattedPrice50ml: "1,750 LE",
          image: "/products/fly-828.webp",
          isNew: true,
        },
        {
          id: "night-london",
          name: "NIGHT LONDON",
          category: "Regal Oriental Extrait",
          notes: "Precious Aged Oud · Palisander Rosewood · Lavender · Ceylon Cinnamon",
          rating: 5.0,
          reviewsCount: 178,
          price: 2500,
          formattedPrice: "2,500 LE",
          originalPrice: 3500,
          formattedOriginalPrice: "3,500 LE",
          price50ml: 1750,
          formattedPrice50ml: "1,750 LE",
          image: "/products/night-london.webp",
          isNew: true,
        },
        {
          id: "special-night",
          name: "SPECIAL NIGHT",
          category: "Aquatic Woody Unisex",
          notes: "Italian Bergamot · Deep Sea Algae · Ambroxan · Cedarwood",
          rating: 4.9,
          reviewsCount: 162,
          price: 3500,
          formattedPrice: "3,500 LE",
          originalPrice: 4500,
          formattedOriginalPrice: "4,500 LE",
          price50ml: 2450,
          formattedPrice50ml: "2,450 LE",
          image: "/products/special-night.webp",
          isNew: true,
        },
        {
          id: "white-oud",
          name: "WHITE OUD ATTAR",
          category: "Pure White Oud Attar",
          notes: "White Rose · Pure White Oud · Silk Musk · Crystal Amber",
          rating: 5.0,
          reviewsCount: 142,
          price: 600,
          formattedPrice: "600 LE",
          originalPrice: 850,
          formattedOriginalPrice: "850 LE",
          price50ml: 600,
          formattedPrice50ml: "600 LE",
          image: "/products/white-oud.webp",
          isNew: true,
        },
        {
          id: "harim-alsultan",
          name: "HARIM AL SULTAN MUSK",
          category: "Royal Musk Oil",
          notes: "Taif Rose · Royal Jasmine · Silk Musk · Vanilla",
          rating: 4.9,
          reviewsCount: 168,
          price: 500,
          formattedPrice: "500 LE",
          originalPrice: 750,
          formattedOriginalPrice: "750 LE",
          price50ml: 500,
          formattedPrice50ml: "500 LE",
          image: "/products/harim-alsultan.webp",
          isNew: true,
        },
        {
          id: "misk-elroman",
          name: "POMEGRANATE MUSK",
          category: "Fruity Fresh Musk",
          notes: "Ruby Pomegranate · Wild Berries · White Musk",
          rating: 4.9,
          reviewsCount: 185,
          price: 500,
          formattedPrice: "500 LE",
          originalPrice: 700,
          formattedOriginalPrice: "700 LE",
          price50ml: 500,
          formattedPrice50ml: "500 LE",
          image: "/products/misk-elroman.webp",
          isNew: true,
        },
        {
          id: "misk-tahara",
          name: "MISK AL TAHARA",
          category: "Pure Tahara Musk",
          notes: "White Lotus · Powdery Iris · Pure White Tahara Musk",
          rating: 5.0,
          reviewsCount: 220,
          price: 500,
          formattedPrice: "500 LE",
          originalPrice: 750,
          formattedOriginalPrice: "750 LE",
          price50ml: 500,
          formattedPrice50ml: "500 LE",
          image: "/products/misk-tahara.webp",
          isNew: true,
        },
        {
          id: "dalaa-elbanat",
          name: "DALAA EL BANAT MUSK",
          category: "Sweet Feminine Musk",
          notes: "Cotton Candy · Strawberry · Caramel · Vanilla & Musk",
          rating: 4.9,
          reviewsCount: 156,
          price: 500,
          formattedPrice: "500 LE",
          originalPrice: 700,
          formattedOriginalPrice: "700 LE",
          price50ml: 500,
          formattedPrice50ml: "500 LE",
          image: "/products/dalaa-elbanat.webp",
          isNew: true,
        },
      ],
    },
    bottomNav: {
      home: "Home",
      cart: "Cart",
      wishlist: "Wishlist",
      profile: "Account",
    },
  },
};
