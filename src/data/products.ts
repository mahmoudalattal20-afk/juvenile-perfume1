export type ProductClassificationType = "men" | "women" | "unisex" | "bukhoor" | "bodysplash" | "musk";

export function getProductClassification(
  prod: Partial<ProductDetailData> & {
    id?: string;
    name?: string;
    arabicName?: string;
    category?: { ar?: string; en?: string } | string;
    specs?: { gender?: { ar?: string; en?: string } };
    classification?: ProductClassificationType;
  }
): ProductClassificationType {
  if (prod.classification && prod.classification !== ("inspired" as any)) return prod.classification;

  const id = (prod.id || "").toLowerCase();
  if (["crest-absolu", "night-paris", "alfarid"].includes(id)) {
    return "men";
  }
  if (["kohly", "pink-kiss"].includes(id)) {
    return "women";
  }
  if (["white-oud", "harim-alsultan", "misk-elroman", "misk-tahara", "dalaa-elbanat"].includes(id)) {
    return "musk";
  }
  if (["half-million", "escalade", "fly-828", "night-london", "liquid-gold", "special-night"].includes(id)) {
    return "unisex";
  }

  const catStr = typeof prod.category === "object" ? `${prod.category?.ar || ""} ${prod.category?.en || ""}` : String(prod.category || "");
  const text = (
    (prod.name || "") + " " +
    (prod.arabicName || "") + " " +
    catStr + " " +
    (prod.specs?.gender?.ar || "") + " " +
    (prod.specs?.gender?.en || "")
  ).toLowerCase();

  if (text.includes("بخور") || text.includes("bukhoor") || text.includes("agarwood") || text.includes("عود معطر") || text.includes("لبان")) {
    return "bukhoor";
  }
  if (text.includes("سبلاش") || text.includes("splash") || text.includes("body mist") || text.includes("معطر جسم")) {
    return "bodysplash";
  }
  if (text.includes("مسك") || text.includes("musk") || text.includes("طهارة") || text.includes("مخلط مسك")) {
    return "musk";
  }
  if (text.includes("نسائي") || text.includes("women") || text.includes("حريمي") || text.includes("كحلي") || text.includes("بينك")) {
    return "women";
  }
  if (text.includes("رجالي") || text.includes("men") || text.includes("masculine") || text.includes("كرست") || text.includes("باريس") || text.includes("الفريد")) {
    return "men";
  }
  return "unisex";
}

export interface ProductDetailData {
  id: string;
  name: string;
  arabicName: string;
  category: { ar: string; en: string };
  classification?: ProductClassificationType;
  isInspired?: boolean;
  inspiredBy?: { ar: string; en: string };
  relatedProductIds?: string[];
  concentration: { ar: string; en: string };
  tagline: { ar: string; en: string };
  description: { ar: string; en: string };
  price: number;
  formattedPrice: { ar: string; en: string };
  originalPrice?: number;
  formattedOriginalPrice?: { ar: string; en: string };
  price50ml: number;
  formattedPrice50ml: { ar: string; en: string };
  originalPrice50ml?: number;
  formattedOriginalPrice50ml?: { ar: string; en: string };
  image: string;
  gallery: string[];
  rating: number;
  reviewsCount: number;
  isNew?: boolean;
  pyramid: {
    topNotes: { ar: string; en: string };
    heartNotes: { ar: string; en: string };
    baseNotes: { ar: string; en: string };
  };
  specs: {
    longevity: { ar: string; en: string };
    sillage: { ar: string; en: string };
    gender: { ar: string; en: string };
    season: { ar: string; en: string };
    origin: { ar: string; en: string };
  };
}

export const PRODUCTS_CATALOG: Record<string, ProductDetailData> = {
  // =========================================================================
  // 1. MEN'S FRAGRANCES (عطور رجالية)
  // =========================================================================
  "crest-absolu": {
    id: "crest-absolu",
    name: "CREST ABSOLU",
    arabicName: "كرست ابسولو",
    classification: "men",
    category: {
      ar: "خلاصة عطر نقي للرجال",
      en: "Regal Masculine Extrait",
    },
    concentration: {
      ar: "خلاصة عطر نقي مركز 35% • Pure Extrait",
      en: "Pure Extrait de Parfum 35%",
    },
    tagline: {
      ar: "قوة أروماتيكية خشبية وحمضية مفعمة بالهيبة والجاذبية الذكورية الطاغية",
      en: "A dynamic powerhouse of dark citrus, fiery spices, and smoky woods",
    },
    description: {
      ar: "عطر CREST ABSOLU صُمم للرجل الواثق الذي يترك بصمة لا تُنسى. يفتتح العطر بنفحات متفجرة من الجريب فروت والبرغموت والفلفل الوردي والكشمش الأسود مع لمسات الأناناس وجوزة الطيب، ثم يتألق قلبه بنغمات دافئة من الزنجبيل والقرفة والأترج والهيل والورد، ليستقر على قاعدة دخانية عميقة من الباتشولي، نجيل الهند، طحلب البلوط (السنديان)، الأمبروكسان، خشب الصندل، التونكا والمسك الفاخر.",
      en: "CREST ABSOLU is the definitive statement of modern masculine refinement. Bursting with radiant grapefruit, bergamot, pink peppercorn, and smoked pineapple, flowing into an invigorating spicy heart of ginger, cinnamon, and cardamon, and resting on an opulent bed of patchouli, oakmoss, Ambroxan, and creamy sandalwood.",
    },
    price: 2500,
    formattedPrice: { ar: "2,500 ج.م", en: "2,500 LE" },
    originalPrice: 3500,
    formattedOriginalPrice: { ar: "3,500 ج.م", en: "3,500 LE" },
    price50ml: 1750,
    formattedPrice50ml: { ar: "1,750 ج.م", en: "1,750 LE" },
    originalPrice50ml: 2450,
    formattedOriginalPrice50ml: { ar: "2,450 ج.م", en: "2,450 LE" },
    image: "/products/crest-absolu.webp",
    gallery: ["/products/crest-absolu.webp"],
    rating: 4.9,
    reviewsCount: 184,
    isNew: true,
    pyramid: {
      topNotes: {
        ar: "الجريب فروت · البرغموت · الفلفل الوردي · الكشمش الأسود · الأناناس · جوزة الطيب · القرنفل",
        en: "Grapefruit · Bergamot · Pink Pepper · Blackcurrant · Pineapple · Nutmeg · Clove",
      },
      heartNotes: {
        ar: "الزنجبيل المنعش · القرفة السيلانية · الأترج · الهيل الهندي · الورد الفاخر",
        en: "Zesty Ginger · Ceylon Cinnamon · Citron · Cardamom · Fine Rose",
      },
      baseNotes: {
        ar: "الباتشولي · نجيل الهند · طحلب البلوط (السنديان) · الأمبروكسان · خشب الصندل · المسك · حبوب التونكا · إيفرنيل",
        en: "Patchouli · Vetiver · Oakmoss · Ambroxan · Sandalwood · Musk · Tonka Bean · Evernyl",
      },
    },
    specs: {
      longevity: { ar: "24+ ساعة ثبات هائل", en: "24+ Hours Longevity" },
      sillage: { ar: "فوحان ملكي ذكوري قوي جداً", en: "Intense & Magnetic Projection" },
      gender: { ar: "رجالي فخم / Men", en: "Men" },
      season: { ar: "كافة الفصول والمناسبات الرسمية والمسائية", en: "All Seasons & Formal Evenings" },
      origin: { ar: "غراس — باريس، فرنسا", en: "Grasse — Paris, France" },
    },
  },

  "night-paris": {
    id: "night-paris",
    name: "NIGHT PARIS",
    arabicName: "نايت باريس",
    classification: "men",
    category: {
      ar: "أو دو بارفان نيش للرجال",
      en: "Niche Eau de Parfum for Men",
    },
    concentration: {
      ar: "أو دو بارفان نيش مركز • Eau de Parfum Intense",
      en: "Eau de Parfum Intense • High Concentration",
    },
    tagline: {
      ar: "أناقة باريسية مسائية ساحرة تجمع بين حيوية التفاح واللافندر ودفء الفانيليا والأخشاب",
      en: "Seductive Parisian elegance uniting crisp apple, aromatic lavender, and warm guaiac woods",
    },
    description: {
      ar: "عطر NIGHT PARIS مستوحى من سحر ليالي باريس الراقية وأضوائها المتلألئة. يفتتح العطر بمزيج منعش من التفاح واللافندر الفرنسي والبرغموت والماندرين، ثم ينساب إلى قلب أروماتي ناعم من إبرة الراعي والبنفسج والياسمين، ويستقر على قاعدة مخملية دافئة من فانيليا بوربون، الهيل، خشب الصندل، الفلفل، أخشاب الغاياك، والباتشولي العتيق.",
      en: "NIGHT PARIS captures the nocturnal allure of Parisian grand boulevards. Opening with crisp apple, French lavender, and luminous bergamot, unfolding into a sophisticated heart of geranium, violet, and jasmine, and anchored by a rich, sensual foundation of bourbon vanilla, cardamom, guaiac wood, and aged patchouli.",
    },
    price: 2500,
    formattedPrice: { ar: "2,500 ج.م", en: "2,500 LE" },
    originalPrice: 3500,
    formattedOriginalPrice: { ar: "3,500 ج.م", en: "3,500 LE" },
    price50ml: 1750,
    formattedPrice50ml: { ar: "1,750 ج.م", en: "1,750 LE" },
    originalPrice50ml: 2450,
    formattedOriginalPrice50ml: { ar: "2,450 ج.م", en: "2,450 LE" },
    image: "/products/night-paris.webp",
    gallery: ["/products/night-paris.webp"],
    rating: 4.9,
    reviewsCount: 165,
    isNew: true,
    pyramid: {
      topNotes: {
        ar: "التفاح المقرمش · الخزامى (اللافندر) · البرغموت · الماندرين (اليوسفي)",
        en: "Crisp Apple · French Lavender · Bergamot · Mandarin Orange",
      },
      heartNotes: {
        ar: "إبرة الراعي · زهر البنفسج · الياسمين الملكي",
        en: "Geranium · Violet Blossom · Royal Jasmine",
      },
      baseNotes: {
        ar: "فانيليا بوربون · الهيل الأخضر · خشب الصندل · الفلفل · أخشاب الغاياك · الباتشولي",
        en: "Bourbon Vanilla · Green Cardamom · Sandalwood · Pepper · Guaiac Wood · Patchouli",
      },
    },
    specs: {
      longevity: { ar: "20+ ساعة ثبات ممتاز", en: "20+ Hours Long Lasting" },
      sillage: { ar: "جاذبية مسائية فواحة وأنيقة", en: "Seductive & Elegant Projection" },
      gender: { ar: "رجالي / Men", en: "Men" },
      season: { ar: "المساء، الخريف، والشتاء والمناسبات الخاصة", en: "Evening, Autumn/Winter & Gala Events" },
      origin: { ar: "باريس، فرنسا", en: "Paris, France" },
    },
  },

  "alfarid": {
    id: "alfarid",
    name: "AL FARID",
    arabicName: "الفريد",
    classification: "men",
    category: {
      ar: "خلاصة عطر نقي ملكي",
      en: "Royal Pure Extrait de Parfum",
    },
    concentration: {
      ar: "خلاصة عطر نقي 35% • Pure Royal Extrait",
      en: "Pure Royal Extrait de Parfum 35%",
    },
    tagline: {
      ar: "تحفة شرقية فاخرة من العود النادر والآمبرغريس والفلفل الوردي للشخصيات القيادية",
      en: "A majestic oriental masterpiece of rare oud, grey ambergris, and pink pepper",
    },
    description: {
      ar: "عطر AL FARID صُنع ليكون فريداً في اسمه وحضوره. يستهل العطر بنبضات حارة ومشرقة من الفلفل الوردي والبرغموت الإيطالي وإبرة الراعي، تليها طبقة قلب غنية من الآمبرغريس النقي والباتشولي والبنفسج، بينما ترتكز القاعدة على هيبة العود الملكي المعتق والمسك الأشهب ولمسات الفانيليا المخملية.",
      en: "AL FARID stands in a class of its own. It greets the senses with vibrant pink peppercorn, Italian bergamot, and geranium, leading into a magnificent core of grey ambergris, patchouli, and violet leaves, before resting on a commanding base of vintage royal oud, rare musk, and Madagascar vanilla.",
    },
    price: 3000,
    formattedPrice: { ar: "3,000 ج.م", en: "3,000 LE" },
    originalPrice: 4500,
    formattedOriginalPrice: { ar: "4,500 ج.م", en: "4,500 LE" },
    price50ml: 2100,
    formattedPrice50ml: { ar: "2,100 ج.م", en: "2,100 LE" },
    originalPrice50ml: 3150,
    formattedOriginalPrice50ml: { ar: "3,150 ج.م", en: "3,150 LE" },
    image: "/products/alfarid.webp",
    gallery: ["/products/alfarid.webp"],
    rating: 5.0,
    reviewsCount: 192,
    isNew: true,
    pyramid: {
      topNotes: {
        ar: "الفلفل الوردي · البرغموت · إبرة الراعي",
        en: "Pink Peppercorn · Bergamot · Geranium",
      },
      heartNotes: {
        ar: "الآمبرغريس الملكي · الباتشولي · البنفسج",
        en: "Royal Ambergris · Patchouli · Violet",
      },
      baseNotes: {
        ar: "المسك الأشهب · خشب العود الفاخر · الفانيليا",
        en: "Grey Musk · Precious Oud · Bourbon Vanilla",
      },
    },
    specs: {
      longevity: { ar: "30+ ساعة ثبات أسطوري", en: "30+ Hours Legendary Longevity" },
      sillage: { ar: "هيبة ملكية وحضور طاغٍ", en: "Regal & Commanding Presence" },
      gender: { ar: "رجالي فخم / Men", en: "Men" },
      season: { ar: "المناسبات الكبرى، المجالس الفاخرة، والأمسيات الخاصة", en: "Grand Celebrations & Luxury Galas" },
      origin: { ar: "غراس — باريس، فرنسا", en: "Grasse — Paris, France" },
    },
  },

  // =========================================================================
  // 2. WOMEN'S FRAGRANCES (عطور نسائية)
  // =========================================================================
  "kohly": {
    id: "kohly",
    name: "KOHLY",
    arabicName: "كحلي",
    classification: "women",
    category: {
      ar: "أو دو بارفان نيش نسائي",
      en: "Niche Haute Gourmand Floral",
    },
    concentration: {
      ar: "أو دو بارفان نيش مركز • Eau de Parfum Intense",
      en: "Eau de Parfum Intense • High Sillage",
    },
    tagline: {
      ar: "سحر أنثوي مدلل بنفحات المارشميللو والفراولة والكريمة المخفوقة وزهر النكتارين",
      en: "An intoxicating gourmand temptation of marshmallow, wild strawberry, and whipped vanilla cream",
    },
    description: {
      ar: "عطر KOHLY هو إكسير الدلال والأنوثة الطاغية. يفتتح العطر بنسمات زهرية ومنعشة من الفريزيا والليمون الإيطالي وزهر النكتارين والتفاح، ثم يذوب في قلب غورماند شهي لا يقاوم من المارشميللو الهوائي، الفراولة، حليب جوز الهند، وزهر البرتقال، ليستقر على قاعدة كريمية ناعمة من الكريمة المخفوقة، السكر البودري، الفانيليا، المسك الأبيض، توت العليق، والأمبروكسان.",
      en: "KOHLY is the embodiment of irresistible charm and sensual sweetness. It opens with delicate white freesia, Italian lemon, and nectarine blossom, unfurling into an addictive heart of fluffy marshmallow, sun-ripened strawberry, coconut, and orange blossom, cushioned on a dreamy base of whipped cream, crystalline sugar, vanilla, and white musk.",
    },
    price: 2500,
    formattedPrice: { ar: "2,500 ج.م", en: "2,500 LE" },
    originalPrice: 3500,
    formattedOriginalPrice: { ar: "3,500 ج.م", en: "3,500 LE" },
    price50ml: 1750,
    formattedPrice50ml: { ar: "1,750 ج.م", en: "1,750 LE" },
    originalPrice50ml: 2450,
    formattedOriginalPrice50ml: { ar: "2,450 ج.م", en: "2,450 LE" },
    image: "/products/kohly.webp",
    gallery: ["/products/kohly.webp"],
    rating: 4.9,
    reviewsCount: 174,
    isNew: true,
    pyramid: {
      topNotes: {
        ar: "الفريزيا البيضاء · الليمون الإيطالي · زهر النكتارين · التفاح",
        en: "White Freesia · Italian Lemon · Nectarine Blossom · Crisp Apple",
      },
      heartNotes: {
        ar: "المارشميللو · الفراولة · جوز الهند · زهر البرتقال",
        en: "Fluffy Marshmallow · Wild Strawberry · Coconut · Orange Blossom",
      },
      baseNotes: {
        ar: "الكريمة المخفوقة · السكر · الفانيليا المخملية · المسك الأبيض · توت العليق · الأمبروكسان",
        en: "Whipped Cream · Sugar · Velvet Vanilla · White Musk · Raspberry · Ambroxan",
      },
    },
    specs: {
      longevity: { ar: "20+ ساعة ثبات مخملي", en: "20+ Hours Velvet Persistence" },
      sillage: { ar: "أنثوي ساحر يأسر القلوب", en: "Enchanting & Irresistible Trail" },
      gender: { ar: "نسائي ساحر / Women", en: "Women" },
      season: { ar: "كافة الفصول واللحظات الخاصة والرومانسية", en: "All Seasons & Intimate Moments" },
      origin: { ar: "غراس — باريس، فرنسا", en: "Grasse — Paris, France" },
    },
  },

  "pink-kiss": {
    id: "pink-kiss",
    name: "PINK KISS",
    arabicName: "بينك كيس",
    classification: "women",
    category: {
      ar: "أو دو بارفان نيش نسائي",
      en: "Haute Fruity Floral for Women",
    },
    concentration: {
      ar: "أو دو بارفان نيش • Eau de Parfum",
      en: "Eau de Parfum • Pure Radiance",
    },
    tagline: {
      ar: "نفحات مبهجة ومشرقة تمزج حلوى الفراولة الفوارة والكشمش الأسود والغاردينيا",
      en: "A joyful sparkling bouquet of bubbly strawberry candy, blackcurrant, and gardenia petals",
    },
    description: {
      ar: "عطر PINK KISS يفيض بالحيوية والبهجة والرومانسية العصرية. يبدأ العطر بلمسات منعشة وندية من الكشمش الأسود والماندرين الأخضر، ثم يتألق قلبه بحلوى الفراولة الفوارة وبتلات الغاردينيا المخملية، ويختتم بقاعدة دافئة وناعمة كالحرير من الفانيليا والمسك النقي والعنبر وخشب الصندل.",
      en: "PINK KISS is an effervescent burst of joy and youthful romance. Opening with crisp green mandarin and dewy blackcurrant, revealing a playful heart of sparkling strawberry candy and white gardenia petals, settling into a silky smooth base of bourbon vanilla, radiant amber, and sandalwood.",
    },
    price: 1800,
    formattedPrice: { ar: "1,800 ج.م", en: "1,800 LE" },
    originalPrice: 2500,
    formattedOriginalPrice: { ar: "2,500 ج.م", en: "2,500 LE" },
    price50ml: 1250,
    formattedPrice50ml: { ar: "1,250 ج.م", en: "1,250 LE" },
    originalPrice50ml: 1750,
    formattedOriginalPrice50ml: { ar: "1,750 ج.م", en: "1,750 LE" },
    image: "/products/pink-kiss.webp",
    gallery: ["/products/pink-kiss.webp"],
    rating: 4.8,
    reviewsCount: 139,
    isNew: true,
    pyramid: {
      topNotes: {
        ar: "الكشمش الأسود النضر · الماندرين الأخضر",
        en: "Dewy Blackcurrant · Crisp Green Mandarin",
      },
      heartNotes: {
        ar: "حلوى الفراولة الفوارة · الغاردينيا المخملية",
        en: "Sparkling Strawberry Accord · Velvet Gardenia",
      },
      baseNotes: {
        ar: "فانيليا بوربون · المسك الحريري · العنبر · خشب الصندل",
        en: "Bourbon Vanilla · Silk Musk · Amber · Sandalwood",
      },
    },
    specs: {
      longevity: { ar: "18+ ساعة ثبات عالي", en: "18+ Hours" },
      sillage: { ar: "زهري فاكهي مبهج وفواح", en: "Sparkling & Alluring Trail" },
      gender: { ar: "نسائي ناعم / Women", en: "Women" },
      season: { ar: "الربيع، الصيف والاستخدام اليومي الراقي", en: "Spring/Summer & Daily Luxury" },
      origin: { ar: "غراس — باريس، فرنسا", en: "Grasse — Paris, France" },
    },
  },

  // =========================================================================
  // 3. UNISEX FRAGRANCES (عطور للجنسين)
  // =========================================================================
  "half-million": {
    id: "half-million",
    name: "HALF MILLION",
    arabicName: "هاف ميليون",
    classification: "unisex",
    category: {
      ar: "مجموعة بريميوم الحصرية",
      en: "Exclusive Premium Collection",
    },
    concentration: {
      ar: "خلاصة عطر نقي • Extrait de Parfum",
      en: "Extrait de Parfum • Pure Extract",
    },
    tagline: {
      ar: "حضور ملكي استثنائي يجمع بين الزعفران والياسمين والآمبرغريس وأخشاب الأرز",
      en: "A commanding royal aura marrying saffron, ambergris, and sweet crystalline resins",
    },
    description: {
      ar: "عطر HALF MILLION صُمم ليكون بصمة استثنائية لأصحاب الذوق الرفيع. يفتتح العطر بنفحات فاخرة من الزعفران الملكي والياسمين النقي، ثم يغوص في قلب مخملي من خشب العنبر والآمبرغريس وجزيء هديون، ليستقر على قاعدة ساحرة من أصماغ التنوب، خشب الأرز، السكر المكرمل، والأمبروكسان. عطر الفخامة والحضور المهيب الذي يلائم كلا الجنسين.",
      en: "HALF MILLION is masterfully formulated for discerning perfume connoisseurs. Opening with crystalline saffron and radiant jasmine, transitioning into dark amberwood and opulent ambergris, resting upon a majestic base of fir resin, cedarwood, spun sugar, and Ambroxan.",
    },
    price: 2500,
    formattedPrice: { ar: "2,500 ج.م", en: "2,500 LE" },
    originalPrice: 3500,
    formattedOriginalPrice: { ar: "3,500 ج.م", en: "3,500 LE" },
    price50ml: 1750,
    formattedPrice50ml: { ar: "1,750 ج.م", en: "1,750 LE" },
    originalPrice50ml: 2450,
    formattedOriginalPrice50ml: { ar: "2,450 ج.م", en: "2,450 LE" },
    image: "/products/half-million.webp",
    gallery: ["/products/half-million.webp"],
    rating: 4.9,
    reviewsCount: 196,
    isNew: true,
    pyramid: {
      topNotes: {
        ar: "الزعفران الملكي · الياسمين النقي",
        en: "Royal Saffron · Pure Jasmine",
      },
      heartNotes: {
        ar: "خشب العنبر · الآمبرغريس · جزيء هديون (Hedione)",
        en: "Amberwood · Ambergris · Hedione",
      },
      baseNotes: {
        ar: "أصماغ التنوب · خشب الأرز · السكر · الأمبروكسان",
        en: "Fir Resin · Cedarwood · Sugar · Ambroxan",
      },
    },
    specs: {
      longevity: { ar: "24+ ساعة ثبات استثنائي", en: "24+ Hours Exceptional Longevity" },
      sillage: { ar: "فوحان ملكي دافئ يملأ المكان", en: "Warm & Enveloping Royal Sillage" },
      gender: { ar: "للجنسين / Unisex", en: "Unisex Haute Parfumerie" },
      season: { ar: "كافة الفصول والمناسبات الكبرى والأمسيات", en: "All Seasons & Gala Events" },
      origin: { ar: "غراس — باريس، فرنسا", en: "Grasse — Paris, France" },
    },
  },

  "escalade": {
    id: "escalade",
    name: "ESCALADE",
    arabicName: "اسكاليد",
    classification: "unisex",
    category: {
      ar: "أو دو بارفان نيش للجنسين",
      en: "Niche Floral Chypre Unisex",
    },
    concentration: {
      ar: "خلاصة عطر نقي مركز • Pure Extrait",
      en: "Pure Extrait de Parfum",
    },
    tagline: {
      ar: "توليفة راقية تجمع بين حلاوة الأناناس والياقوتية وسحر السوسن البودري والمسك",
      en: "An elegant alchemy of tropical pineapple, hyacinth, powdery iris, and warm patchouli",
    },
    description: {
      ar: "عطر ESCALADE يعكس التميز والتألق الراقي. يفتتح العطر بنفحات فاكهية وزهرية مدهشة من الأناناس وزهرة الياقوتية، ثم يتبعه قلب بودري أنيق من الفلفل الوردي والياسمين والسوسن الفلورنسي، ويستقر على قاعدة عميقة وغنية من المسك الأبيض، العنبر، نجيل الهند، الباتشولي، والفانيليا.",
      en: "ESCALADE is an expression of pure contemporary refinement. It opens with vibrant notes of pineapple and fresh hyacinth, melting into a sophisticated heart of pink pepper, jasmine, and powdery iris, grounded in a velvety finish of musk, amber, vetiver, patchouli, and vanilla.",
    },
    price: 1800,
    formattedPrice: { ar: "1,800 ج.م", en: "1,800 LE" },
    originalPrice: 2500,
    formattedOriginalPrice: { ar: "2,500 ج.م", en: "2,500 LE" },
    price50ml: 1250,
    formattedPrice50ml: { ar: "1,250 ج.م", en: "1,250 LE" },
    originalPrice50ml: 1750,
    formattedOriginalPrice50ml: { ar: "1,750 ج.م", en: "1,750 LE" },
    image: "/products/escalade.webp",
    gallery: ["/products/escalade.webp"],
    rating: 4.8,
    reviewsCount: 152,
    isNew: true,
    pyramid: {
      topNotes: {
        ar: "الأناناس · الياقوتية (Hyacinth)",
        en: "Pineapple · Fresh Hyacinth",
      },
      heartNotes: {
        ar: "الفلفل الوردي · الياسمين · السوسن البودري",
        en: "Pink Pepper · Jasmine · Powdery Iris",
      },
      baseNotes: {
        ar: "المسك · العنبر · نجيل الهند · الباتشولي · الفانيليا",
        en: "Musk · Amber · Vetiver · Patchouli · Vanilla",
      },
    },
    specs: {
      longevity: { ar: "22+ ساعة ثبات ممتاز", en: "22+ Hours" },
      sillage: { ar: "توليفة راقية تخطف الأنظار", en: "Refined & Noticeable Sillage" },
      gender: { ar: "للجنسين / Unisex", en: "Unisex" },
      season: { ar: "طوال العام ولكافة المناسبات", en: "Year-Round Signature" },
      origin: { ar: "غراس — باريس، فرنسا", en: "Grasse — Paris, France" },
    },
  },

  "liquid-gold": {
    id: "liquid-gold",
    name: "LIQUID GOLD",
    arabicName: "ليكويد جولد",
    classification: "unisex",
    category: {
      ar: "مجموعة بريميوم الذهبية",
      en: "Gold Premium Collection",
    },
    concentration: {
      ar: "خلاصة عطر نقي 35% • Pure Extrait",
      en: "Pure Extrait de Parfum 35%",
    },
    tagline: {
      ar: "إكسير الذهب الخالص بنفحات الفانيليا والزنجبيل والورد التركي وأخشاب الصندل",
      en: "Pure liquid gold elixir infused with rich vanilla, ginger, Turkish rose, and benzoin",
    },
    description: {
      ar: "عطر LIQUID GOLD هو تجسيد للفخامة والثراء العطري. يفتتح العطر بنفحات متلألئة من الزنجبيل الحار، البرغموت، الفلفل الوردي، والنوتات الخضراء، ثم يتكشف قلبه عن تناغم دافئ من الهيل، الكشمش الأسود، والورد التركي، ليستقر على قاعدة ملكية آسرة من الفانيليا الغنية، صمغ البنزوين (الجاوي)، خشب الصندل، خشب الأرز، الباتشولي، الآمبرغريس والمسك.",
      en: "LIQUID GOLD represents supreme olfactory luxury. Opening with shimmering ginger, bergamot, pink pepper, and green accents, revealing an opulent heart of cardamom, blackcurrant, and Turkish rose, settling upon an intoxicating foundation of Madagascar vanilla, benzoin, sandalwood, cedarwood, patchouli, and ambergris.",
    },
    price: 3500,
    formattedPrice: { ar: "3,500 ج.م", en: "3,500 LE" },
    originalPrice: 4500,
    formattedOriginalPrice: { ar: "4,500 ج.م", en: "4,500 LE" },
    price50ml: 2450,
    formattedPrice50ml: { ar: "2,450 ج.م", en: "2,450 LE" },
    originalPrice50ml: 3150,
    formattedOriginalPrice50ml: { ar: "3,150 ج.م", en: "3,150 LE" },
    image: "/products/liquid-gold.webp",
    gallery: ["/products/liquid-gold.webp"],
    rating: 5.0,
    reviewsCount: 188,
    isNew: true,
    pyramid: {
      topNotes: {
        ar: "الزنجبيل · البرغموت · الفلفل الوردي · النوتات الخضراء",
        en: "Ginger · Bergamot · Pink Pepper · Green Accords",
      },
      heartNotes: {
        ar: "الهيل · الكشمش الأسود · الورد التركي",
        en: "Cardamom · Blackcurrant · Turkish Rose",
      },
      baseNotes: {
        ar: "الفانيليا · البنزوين (الجاوي) · خشب الصندل · خشب الأرز · الباتشولي · الآمبرغريس · المسك",
        en: "Vanilla · Benzoin · Sandalwood · Cedarwood · Patchouli · Ambergris · Musk",
      },
    },
    specs: {
      longevity: { ar: "26+ ساعة ثبات استثنائي", en: "26+ Hours Ultra Longevity" },
      sillage: { ar: "فوحان ملكي دافئ وفخم جداً", en: "Warm & Opulent Royal Sillage" },
      gender: { ar: "للجنسين / Unisex", en: "Unisex Masterpiece" },
      season: { ar: "كافة الفصول والمناسبات الكبرى والأمسيات", en: "All Seasons, Evening & Grand Occasions" },
      origin: { ar: "غراس — باريس، فرنسا", en: "Grasse — Paris, France" },
    },
  },

  "fly-828": {
    id: "fly-828",
    name: "FLY 828",
    arabicName: "فلاي 828",
    classification: "unisex",
    category: {
      ar: "عطر جزيئي نيش فاخر",
      en: "Haute Molecular Perfume",
    },
    concentration: {
      ar: "خلاصة عطر جزيئي نقي • Molecular Extrait",
      en: "Molecular Extrait de Parfum",
    },
    tagline: {
      ar: "ثورة عطرية جزيئية نقية من الأمبروكسان وأيزو إي سوبر والسوسن والياسمين",
      en: "A pure minimalist molecular revolution of Ambroxan, Iso E Super, iris, and jasmine",
    },
    description: {
      ar: "عطر FLY 828 هو تجسيد للنقاء والابتكار المعاصر. يعتمد العطر على تركيبة جزيئية متطورة تندمج بسلاسة مع كيمياء البشرة الطبيعية، بمزيج متناغم من الأمبروكسان وأيزو إي سوبر (Iso E Super) ولمسات ناعمة من السوسن الفلورنسي والياسمين البري، ليمنحك هالة خاصة ومميزة لا تضاهى.",
      en: "FLY 828 is the pinnacle of modern olfactory minimalism. Harnessing advanced molecular perfumery, it blends pure Ambroxan and Iso E Super with luminous iris and jasmine petals, creating a magnetic, skin-adaptive sillage that is uniquely yours.",
    },
    price: 2500,
    formattedPrice: { ar: "2,500 ج.م", en: "2,500 LE" },
    originalPrice: 3500,
    formattedOriginalPrice: { ar: "3,500 ج.م", en: "3,500 LE" },
    price50ml: 1750,
    formattedPrice50ml: { ar: "1,750 ج.م", en: "1,750 LE" },
    originalPrice50ml: 2450,
    formattedOriginalPrice50ml: { ar: "2,450 ج.م", en: "2,450 LE" },
    image: "/products/fly-828.webp",
    gallery: ["/products/fly-828.webp"],
    rating: 4.9,
    reviewsCount: 147,
    isNew: true,
    pyramid: {
      topNotes: {
        ar: "الأمبروكسان · أيزو إي سوبر (Iso E Super)",
        en: "Ambroxan · Iso E Super",
      },
      heartNotes: {
        ar: "السوسن الفلورنسي · الياسمين البري",
        en: "Florentine Iris · Wild Jasmine",
      },
      baseNotes: {
        ar: "المسك الجزيئي · العنبر الكريستالي",
        en: "Molecular Musk · Crystal Amber",
      },
    },
    specs: {
      longevity: { ar: "24+ ساعة ثبات جزيئي متواصل", en: "24+ Hours Molecular Staying Power" },
      sillage: { ar: "هالة مغناطيسية تتفاعل مع البشرة", en: "Skin-Adaptive Magnetic Aura" },
      gender: { ar: "للجنسين / Unisex", en: "Unisex Minimalist" },
      season: { ar: "طوال العام ولكافة الأوقات والمناسبات", en: "Year-Round Signature" },
      origin: { ar: "باريس، فرنسا", en: "Paris, France" },
    },
  },

  "night-london": {
    id: "night-london",
    name: "NIGHT LONDON",
    arabicName: "نايت لندن",
    classification: "unisex",
    category: {
      ar: "خلاصة عطر شرقي ملكي",
      en: "Regal Oriental Extrait de Parfum",
    },
    concentration: {
      ar: "خلاصة عطر نقي 35% • Pure Extrait",
      en: "Pure Extrait de Parfum 35%",
    },
    tagline: {
      ar: "أرستقراطية لندن وفخامة الشرق في تناغم ساحر بين العود وخشب الورد واللافندر والقرفة",
      en: "British aristocracy meets royal oriental prestige in an accord of oud, rosewood, and cinnamon",
    },
    description: {
      ar: "عطر NIGHT LONDON يجسد الفخامة الملكية والهيبة المطلقة. يفتتح العطر بنفحات استثنائية من خشب الورد الباليساندر، الخزامى الفرنسية، التفاح الأخضر، والقرفة السيلانية، ثم يتفتح قلبه عن باقة فاخرة من الورد وخشب الأرز وزنابق الوادي، ليستقر على قاعدة مهيبة من العود المعتق، خشب الصندل، العنبر، الفانيليا، والمسك النقي.",
      en: "NIGHT LONDON is the ultimate expression of grand luxury. Opening with palisander rosewood, lavender, green apple, and cinnamon, blooming into a refined heart of rose, cedar, and lily of the valley, crowned by an opulent base of aged oud, sandalwood, royal amber, and vanilla.",
    },
    price: 2500,
    formattedPrice: { ar: "2,500 ج.م", en: "2,500 LE" },
    originalPrice: 3500,
    formattedOriginalPrice: { ar: "3,500 ج.م", en: "3,500 LE" },
    price50ml: 1750,
    formattedPrice50ml: { ar: "1,750 ج.م", en: "1,750 LE" },
    originalPrice50ml: 2450,
    formattedOriginalPrice50ml: { ar: "2,450 ج.م", en: "2,450 LE" },
    image: "/products/night-london.webp",
    gallery: ["/products/night-london.webp"],
    rating: 5.0,
    reviewsCount: 178,
    isNew: true,
    pyramid: {
      topNotes: {
        ar: "خشب الورد الباليساندر · الخزامى · التفاح · القرفة",
        en: "Palisander Rosewood · Lavender · Apple · Cinnamon",
      },
      heartNotes: {
        ar: "الورد · خشب الأرز · زنابق الوادي",
        en: "Rose · Cedarwood · Lily of the Valley",
      },
      baseNotes: {
        ar: "العود المعتق · خشب الصندل · العنبر · الفانيليا · المسك",
        en: "Aged Oud · Sandalwood · Amber · Vanilla · Musk",
      },
    },
    specs: {
      longevity: { ar: "30+ ساعة ثبات جبار", en: "30+ Hours" },
      sillage: { ar: "فوحان ملكي أرستقراطي مهيب", en: "Majestic Aristocratic Trail" },
      gender: { ar: "للجنسين / Unisex", en: "Unisex Royal Scent" },
      season: { ar: "المساء، الشتاء والمناسبات الفخمة", en: "Evening, Winter & Landmark Celebrations" },
      origin: { ar: "لندن & غراس — فرنسا", en: "London & Grasse, France" },
    },
  },

  "special-night": {
    id: "special-night",
    name: "SPECIAL NIGHT",
    arabicName: "سبيشال نايت",
    classification: "unisex",
    category: {
      ar: "أو دو بارفان نيش بحري وأكواتيك",
      en: "Niche Aquatic & Woody Eau de Parfum",
    },
    concentration: {
      ar: "أو دو بارفان نيش مركز • Eau de Parfum Intense",
      en: "Eau de Parfum Intense • High Sillage",
    },
    tagline: {
      ar: "أمواج الانتعاش البحري الغامض بنفحات البرغموت والطحالب البحرية والأمبروكسان",
      en: "Mysterious ocean waves infused with Italian bergamot, marine algae, and deep Ambroxan",
    },
    description: {
      ar: "عطر SPECIAL NIGHT صُمم لعشاق التميز والروائح البحرية العميقة والغامضة. يفتتح العطر بنسمات حمضية براقة من البرغموت والليمون المنعش، ثم يعانق قلباً مائياً عميقاً من الطحالب البحرية والنوتات الأكواتيكية الآسرة، ويستقر على قاعدة خشبية وعنبرية هائلة من المسك والأمبروكسان المكثف وخشب الأرز.",
      en: "SPECIAL NIGHT is created for lovers of deep oceanic intensity and enduring mystery. It bursts open with Italian bergamot and lemon, unveiling a mesmerizing maritime heart of sea algae and aquatic depth, anchored by an immense base of grey musk, Ambroxan, and dry cedarwood.",
    },
    price: 3500,
    formattedPrice: { ar: "3,500 ج.م", en: "3,500 LE" },
    originalPrice: 4500,
    formattedOriginalPrice: { ar: "4,500 ج.م", en: "4,500 LE" },
    price50ml: 2450,
    formattedPrice50ml: { ar: "2,450 ج.م", en: "2,450 LE" },
    originalPrice50ml: 3150,
    formattedOriginalPrice50ml: { ar: "3,150 ج.م", en: "3,150 LE" },
    image: "/products/special-night.webp",
    gallery: ["/products/special-night.webp"],
    rating: 4.9,
    reviewsCount: 162,
    isNew: true,
    pyramid: {
      topNotes: {
        ar: "البرغموت الإيطالي · الليمون المنعش",
        en: "Italian Bergamot · Fresh Lemon",
      },
      heartNotes: {
        ar: "الطحالب البحرية · نوتات أكواتيك",
        en: "Deep Sea Algae · Aquatic Accords",
      },
      baseNotes: {
        ar: "المسك · الأمبروكسان · خشب الأرز",
        en: "Musk · Ambroxan · Cedarwood",
      },
    },
    specs: {
      longevity: { ar: "28+ ساعة ثبات أسطوري", en: "28+ Hours Legendary Persistence" },
      sillage: { ar: "فوحان بحري هائل يعم المكان", en: "Immense Ocean Wave Sillage" },
      gender: { ar: "للجنسين / Unisex", en: "Unisex" },
      season: { ar: "كافة الفصول والمساء والأمسيات الخاصة", en: "All Seasons & Special Occasions" },
      origin: { ar: "غراس — باريس، فرنسا", en: "Grasse — Paris, France" },
    },
  },

  // =========================================================================
  // 4. ROYAL MUSK & ATTAR COLLECTION (مجموعة المسك والدهن الفاخر)
  // =========================================================================
  "white-oud": {
    id: "white-oud",
    name: "WHITE OUD ATTAR",
    arabicName: "دهن العود الأبيض",
    classification: "musk",
    category: {
      ar: "دهن عود نيش بيور فاخر",
      en: "Pure Royal White Oud Attar",
    },
    concentration: {
      ar: "دهن عود صافي مركز 100% • Pure Royal Attar",
      en: "100% Pure Royal Attar Extract",
    },
    tagline: {
      ar: "نقاء العود الأبيض الملكي مع لمسات عنبرية ومسكية مخملية تأسر الحواس",
      en: "Silken royal white oud imbued with crystalline amber and pure musk",
    },
    description: {
      ar: "دهن العود الأبيض الفاخر هو التجسيد الأسمى للنقاء والفخامة الهادئة. توليفة نقية تمزج بين أندر خلاصات خشب العود الأبيض البخوري ولمسات الورد الأبيض والمسك البودري النقي، ليمنحك هالة وقورة وأناقة شرقية لا تُضاهى تدوم طويلاً.",
      en: "WHITE OUD ATTAR represents sheer purity and calm oriental majesty. Distilled from pristine white agarwood harmonized with white rose, crystalline amber, and velvety powdery musk.",
    },
    price: 600,
    formattedPrice: { ar: "600 ج.م", en: "600 LE" },
    originalPrice: 850,
    formattedOriginalPrice: { ar: "850 ج.م", en: "850 LE" },
    price50ml: 600,
    formattedPrice50ml: { ar: "600 ج.م", en: "600 LE" },
    image: "/products/white-oud.webp",
    gallery: ["/products/white-oud.webp"],
    rating: 5.0,
    reviewsCount: 142,
    isNew: true,
    pyramid: {
      topNotes: {
        ar: "ورد أبيض نقي · قطرات ليمون نضرة",
        en: "Pure White Rose · Fresh Citrus Drops",
      },
      heartNotes: {
        ar: "خشب العود الأبيض النادر · لمسات بخورية ناعمة",
        en: "Precious White Agarwood · Subtle Incense",
      },
      baseNotes: {
        ar: "مسك الحرير · عنبر كريستالي · خشب الصندل",
        en: "Silk Musk · Crystalline Amber · Sandalwood",
      },
    },
    specs: {
      longevity: { ar: "48+ ساعة ثبات عطري", en: "48+ Hours Attar Longevity" },
      sillage: { ar: "فوحان ملكي ناعم ومهيب", en: "Silken & Regal Sillage" },
      gender: { ar: "للجنسين / Unisex", en: "Unisex Royal Attar" },
      season: { ar: "كافة الفصول والمجالس الفاخرة والاستخدام اليومي", en: "All Seasons & Luxury Moments" },
      origin: { ar: "كمبوديا & غراس — فرنسا", en: "Cambodia & Grasse Extracts" },
    },
  },

  "harim-alsultan": {
    id: "harim-alsultan",
    name: "HARIM AL SULTAN MUSK",
    arabicName: "مسك حريم السلطان",
    classification: "musk",
    category: {
      ar: "مجموعة المسك الفاخر",
      en: "Exclusive Royal Musk Collection",
    },
    concentration: {
      ar: "زيت مسك نقي مركز • Pure Perfume Oil",
      en: "Pure Concentrated Musk Oil",
    },
    tagline: {
      ar: "سحر القصور العثمانية بمزيج المسك والورد الطائفي والفانيليا والباتشولي",
      en: "Ottoman palace luxury uniting velvet musk, Taif rose, and bourbon vanilla",
    },
    description: {
      ar: "مسك حريم السلطان مستوحى من فخامة القصور الملكية وأسرار الأنوثة الشرقية الخالدة. يفتتح بنفحات ساحرة من الورد والبرغموت، يليه قلب عنبري غني بالياسمين والتفاح، بينما تستقر القاعدة على مسك حريري دافئ وفانيليا وخشب الصندل.",
      en: "HARIM AL SULTAN MUSK is inspired by the timeless opulence of royal Ottoman palaces. Unveiling notes of Taif rose and bergamot, leading to a rich floral amber core, settled upon a cushion of silk musk and warm vanilla.",
    },
    price: 500,
    formattedPrice: { ar: "500 ج.م", en: "500 LE" },
    originalPrice: 750,
    formattedOriginalPrice: { ar: "750 ج.م", en: "750 LE" },
    price50ml: 500,
    formattedPrice50ml: { ar: "500 ج.م", en: "500 LE" },
    image: "/products/harim-alsultan.webp",
    gallery: ["/products/harim-alsultan.webp"],
    rating: 4.9,
    reviewsCount: 168,
    isNew: true,
    pyramid: {
      topNotes: {
        ar: "الورد الطائفي · البرغموت · اليوسفي",
        en: "Taif Rose · Bergamot · Mandarin",
      },
      heartNotes: {
        ar: "الياسمين الملكي · التفاح · العنبر",
        en: "Royal Jasmine · Apple · Amber",
      },
      baseNotes: {
        ar: "المسك الحريري · الفانيليا · خشب الصندل · الباتشولي",
        en: "Silk Musk · Vanilla · Sandalwood · Patchouli",
      },
    },
    specs: {
      longevity: { ar: "24+ ساعة ثبات فاخر", en: "24+ Hours" },
      sillage: { ar: "فوحان آسر وجذاب", en: "Enchanting Allure" },
      gender: { ar: "للجنسين (يميل للأنوثة)", en: "Unisex / Feminine Luxury" },
      season: { ar: "كافة الفصول والمناسبات الخاصة", en: "All Seasons" },
      origin: { ar: "توليفة نيش خاصة", en: "Private Atelier Reserve" },
    },
  },

  "misk-elroman": {
    id: "misk-elroman",
    name: "POMEGRANATE MUSK",
    arabicName: "مسك الرمان",
    classification: "musk",
    category: {
      ar: "مجموعة المسك الفاخر",
      en: "Exclusive Royal Musk Collection",
    },
    concentration: {
      ar: "زيت مسك نقي فاكهي • Pure Fruit Musk Oil",
      en: "Pure Fruity Musk Oil",
    },
    tagline: {
      ar: "انتعاش الرمان الأحمر اللذيذ يعانق نعومة المسك الأبيض النقي",
      en: "Luscious ruby pomegranate married with velvety pure white musk",
    },
    description: {
      ar: "مسك الرمان هو توليفة الانتعاش والبهجة الساحرة. يجمع بين قطرات الرمان الطازجة والتوت البري مع نقاء المسك الأبيض المخملي ولمسات الفانيليا والزهور البيضاء، ليعطيك إحساساً دائماً بالنظافة والجاذبية طوال اليوم.",
      en: "POMEGRANATE MUSK is a joyful symphony of crisp freshness. Blending ruby pomegranate seeds and tart wild berries with velvet white musk, blossoms, and vanilla for all-day luminous radiance.",
    },
    price: 500,
    formattedPrice: { ar: "500 ج.م", en: "500 LE" },
    originalPrice: 700,
    formattedOriginalPrice: { ar: "700 ج.م", en: "700 LE" },
    price50ml: 500,
    formattedPrice50ml: { ar: "500 ج.م", en: "500 LE" },
    image: "/products/misk-elroman.webp",
    gallery: ["/products/misk-elroman.webp"],
    rating: 4.9,
    reviewsCount: 185,
    isNew: true,
    pyramid: {
      topNotes: {
        ar: "الرمان الأحمر النضر · التوت البري · التفاح الأخضر",
        en: "Ruby Pomegranate · Wild Berries · Green Apple",
      },
      heartNotes: {
        ar: "الورد الجوري · زهر البرتقال · الماغنوليا",
        en: "Damask Rose · Orange Blossom · Magnolia",
      },
      baseNotes: {
        ar: "المسك الأبيض النقي · الفانيليا المخملية · العنبر الكريستالي",
        en: "Pure White Musk · Velvet Vanilla · Crystal Amber",
      },
    },
    specs: {
      longevity: { ar: "24+ ساعة ثبات منعش", en: "24+ Hours Refreshing Longevity" },
      sillage: { ar: "منعش، نقي ومحبوب للجميع", en: "Crisp & Delightful Projection" },
      gender: { ar: "للجنسين / Unisex", en: "Unisex" },
      season: { ar: "الصيف وكافة الفصول والاستخدام اليومي بعد الاستحمام", en: "All Seasons & Daily Freshness" },
      origin: { ar: "غراس — باريس، فرنسا", en: "Grasse — Paris, France" },
    },
  },

  "misk-tahara": {
    id: "misk-tahara",
    name: "MISK AL TAHARA",
    arabicName: "مسك الطهارة",
    classification: "musk",
    category: {
      ar: "مجموعة المسك الفاخر",
      en: "Exclusive Royal Musk Collection",
    },
    concentration: {
      ar: "مسك طهارة أبيض طبيعي نقي 100% • Pure Tahara Musk",
      en: "100% Pure Natural Tahara Musk",
    },
    tagline: {
      ar: "أيقونة النظافة والنقاء المخملي بعبق الزهور البيضاء والبودرة الفاخرة",
      en: "The iconic essence of pure cleanliness, white blossoms, and powdery velvet musk",
    },
    description: {
      ar: "مسك الطهارة الأصلي هو رمز النقاء والنظافة الفائقة. بقوامه المخملي الكثيف ولونه الأبيض اللؤلؤي، يمنحك رائحة بودرية منعشة تمزج أرقى خلاصات المسك الطبيعي مع البنفسج الأبيض واللوتس. ثبات أسطوري ورائحة تدوم لأيام.",
      en: "MISK AL TAHARA is the quintessence of pure hygiene and celestial comfort. Featuring a rich, creamy white texture that radiates powdery white musk, lotus, and delicate white iris.",
    },
    price: 500,
    formattedPrice: { ar: "500 ج.م", en: "500 LE" },
    originalPrice: 750,
    formattedOriginalPrice: { ar: "750 ج.م", en: "750 LE" },
    price50ml: 500,
    formattedPrice50ml: { ar: "500 ج.م", en: "500 LE" },
    image: "/products/misk-tahara.webp",
    gallery: ["/products/misk-tahara.webp"],
    rating: 5.0,
    reviewsCount: 220,
    isNew: true,
    pyramid: {
      topNotes: {
        ar: "أزهار اللوتس البيضاء · زنبق الوادي · قطرات الندى",
        en: "White Lotus · Lily of the Valley · Dewy Accords",
      },
      heartNotes: {
        ar: "السوسن البودري · الياسمين الأبيض · البنفسج",
        en: "Powdery Iris · White Jasmine · Violet",
      },
      baseNotes: {
        ar: "مسك الطهارة الأبيض النقي · خشب الصندل الهادئ",
        en: "Pure White Tahara Musk · Gentle Sandalwood",
      },
    },
    specs: {
      longevity: { ar: "48+ ساعة ثبات أسطوري على البشرة والملابس", en: "48+ Hours Legendary Persistence" },
      sillage: { ar: "هالة بودرية نقية وناعمة", en: "Pure & Intimate Powdery Halo" },
      gender: { ar: "للجنسين / Unisex", en: "Unisex Pure Hygiene" },
      season: { ar: "كافة الفصول والطقوس اليومية والاستحمام", en: "All Seasons & Daily Rituals" },
      origin: { ar: "مستخلصات طبيعية فاخرة", en: "Natural Haute Extracts" },
    },
  },

  "dalaa-elbanat": {
    id: "dalaa-elbanat",
    name: "DALAA EL BANAT MUSK",
    arabicName: "مسك دلع البنات",
    classification: "musk",
    category: {
      ar: "مجموعة المسك الفاخر",
      en: "Exclusive Royal Musk Collection",
    },
    concentration: {
      ar: "زيت مسك سويتي أنثوي • Sweet Feminine Musk Oil",
      en: "Sweet Feminine Musk Oil",
    },
    tagline: {
      ar: "توليفة الدلال والرقة المفعمة بعبير الفواكه الاستوائية والكراميل وغزل البنات",
      en: "Delightful sweetness of cotton candy, tropical fruits, and delicate white musk",
    },
    description: {
      ar: "مسك دلع البنات صُمم ليضفي لمسة من الأنوثة الشقية والجاذبية العصرية. يجمع بين نفحات السكر وغزل البنات وحلوى الفواكه مع قاعدة مسكية ناعمة من الفانيليا والعنبر الأبيض، ليمنحك رائحة سويتية تدوم وتجذب الانتباه بلطف.",
      en: "DALAA EL BANAT MUSK is a playful, charming gourmand creation. Combining whimsical notes of spun cotton candy, tropical fruits, and sweet berries with a comforting base of silky vanilla and white musk.",
    },
    price: 500,
    formattedPrice: { ar: "500 ج.م", en: "500 LE" },
    originalPrice: 700,
    formattedOriginalPrice: { ar: "700 ج.م", en: "700 LE" },
    price50ml: 500,
    formattedPrice50ml: { ar: "500 ج.م", en: "500 LE" },
    image: "/products/dalaa-elbanat.webp",
    gallery: ["/products/dalaa-elbanat.webp"],
    rating: 4.9,
    reviewsCount: 156,
    isNew: true,
    pyramid: {
      topNotes: {
        ar: "غزل البنات · الفراولة · البطيخ المنعش",
        en: "Cotton Candy · Wild Strawberry · Sweet Melon",
      },
      heartNotes: {
        ar: "الكراميل الناعم · زهر الكرز · الغاردينيا",
        en: "Soft Caramel · Cherry Blossom · Gardenia",
      },
      baseNotes: {
        ar: "المسك الحريري · فانيليا مدغشقر · العنبر الأبيض",
        en: "Silk Musk · Madagascar Vanilla · White Amber",
      },
    },
    specs: {
      longevity: { ar: "24+ ساعة ثبات جذاب", en: "24+ Hours" },
      sillage: { ar: "سويتي مغري ومبهج", en: "Sweet & Irresistible Trail" },
      gender: { ar: "نسائي ساحر / Women", en: "Women" },
      season: { ar: "كافة الفصول واللحظات اليومية والخاصة", en: "All Seasons & Daily Radiance" },
      origin: { ar: "غراس — باريس، فرنسا", en: "Grasse — Paris, France" },
    },
  },
};

export function getProductById(id: string): ProductDetailData {
  if (PRODUCTS_CATALOG[id]) {
    return PRODUCTS_CATALOG[id];
  }
  const first = PRODUCTS_CATALOG["half-million"];
  return {
    ...first,
    id,
    name: id.toUpperCase().replace(/-/g, " "),
    arabicName: id.toUpperCase().replace(/-/g, " "),
  };
}

export function getAllProductIds(): string[] {
  return Object.keys(PRODUCTS_CATALOG);
}
