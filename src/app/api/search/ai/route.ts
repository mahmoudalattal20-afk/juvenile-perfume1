import { NextResponse } from "next/server";
import { getCMSData } from "@/lib/cmsStore";
import { PRODUCTS_CATALOG, ProductDetailData } from "@/data/products";
import { generateWithGemini } from "@/lib/geminiClient";

export const dynamic = "force-dynamic";

function normalizeText(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();
}

function cleanFormatting(text: string): string {
  return (text || "")
    .replace(/\*{1,4}/g, "")
    .replace(/#{1,6}\s?/g, "")
    .replace(/`{1,3}/g, "")
    .trim();
}

const STOP_WORDS = new Set([
  "عندكم", "عايز", "عاوز", "محتاج", "ابحث", "عن", "عطر", "عطور", "برفان",
  "بارفان", "ريحة", "رائحة", "في", "من", "هل", "لو", "سمحت", "ممكن", "عاوزه", "عايزه"
]);

import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query: string = (body.query || "").trim();
    const locale: "ar" | "en" = body.locale === "en" ? "en" : "ar";

    if (!query) {
      return NextResponse.json({
        success: true,
        aiInsight: "",
        products: [],
        suggestedQueries: [],
      });
    }

    // 0. Defense Against AI Exhaustion & DoS (Rate Limit: 25 searches/min per IP)
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`ai_search:${ip}`, 25, 60000);
    const allowAiCall = rateCheck.success;

    // 0.1 Bound query length (Max 120 chars) to prevent buffer / prompt injection abuse
    const boundedQuery = query.slice(0, 120);

    const cms = getCMSData();
    const rawProducts =
      cms?.products && Object.keys(cms.products).length > 0
        ? Object.values(cms.products)
        : Object.values(PRODUCTS_CATALOG);
    const liveProducts = rawProducts as ProductDetailData[];

    if (!liveProducts.length) {
      return NextResponse.json({
        success: true,
        aiInsight: "",
        products: [],
        suggestedQueries: [],
      });
    }

    const queryNorm = normalizeText(query);
    const queryTokens = queryNorm
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

    // 1. High-Precision Local Semantic Scoring (Resilient Offline Fallback)
    const scoredProducts = liveProducts
      .map((p) => {
        let score = 0;
        const nameAr = normalizeText(p.arabicName);
        const nameEn = normalizeText(p.name);
        const categoryAr = normalizeText(p.category?.ar || "");
        const descAr = normalizeText(p.description?.ar || "");
        const topNotes = normalizeText(p.pyramid?.topNotes?.ar || "");
        const heartNotes = normalizeText(p.pyramid?.heartNotes?.ar || "");
        const baseNotes = normalizeText(p.pyramid?.baseNotes?.ar || "");
        const allNotes = `${topNotes} ${heartNotes} ${baseNotes}`;
        const gender = normalizeText(p.specs?.gender?.ar || "");
        const sillage = normalizeText(p.specs?.sillage?.ar || "");
        const season = normalizeText(p.specs?.season?.ar || "");

        // Direct name match
        if (nameAr.includes(queryNorm) || nameEn.includes(queryNorm)) score += 120;
        if (queryNorm.includes(nameAr) || (nameEn.length > 3 && queryNorm.includes(nameEn))) score += 90;

        // Gender intent & strict exclusion
        const wantsWomen = queryNorm.includes("نسائ") || queryNorm.includes("حريمي") || queryNorm.includes("بنات") || queryNorm.includes("عروس");
        const wantsMen = queryNorm.includes("رجال") || queryNorm.includes("شباب") || queryNorm.includes("عريس");

        if (wantsWomen) {
          if (p.classification === "women" || gender.includes("نسائ") || gender.includes("women")) score += 70;
          else if (p.classification === "unisex") score += 10;
          else if (p.classification === "men" || gender.includes("رجال")) score -= 150;
        }

        if (wantsMen) {
          if (p.classification === "men" || gender.includes("رجال") || gender.includes("men")) score += 70;
          else if (p.classification === "unisex") score += 10;
          else if (p.classification === "women" || gender.includes("نسائ")) score -= 150;
        }

        // Sillage / Projection Negation & Softness Intent
        const wantsSubtle =
          queryNorm.includes("مش فواح") ||
          queryNorm.includes("غير فواح") ||
          queryNorm.includes("مش قوي") ||
          queryNorm.includes("هادي") ||
          queryNorm.includes("ناعم") ||
          queryNorm.includes("خفيف") ||
          queryNorm.includes("سكين سنت") ||
          queryNorm.includes("بسيط");

        const wantsLoud =
          (queryNorm.includes("فواح") && !queryNorm.includes("مش فواح") && !queryNorm.includes("غير فواح")) ||
          queryNorm.includes("قوي") ||
          queryNorm.includes("ثابت وفواح") ||
          queryNorm.includes("طاغي");

        if (wantsSubtle) {
          if (sillage.includes("رقيق") || sillage.includes("هادئ") || sillage.includes("جذاب") || allNotes.includes("مسك ابيض")) {
            score += 80;
          }
          if (sillage.includes("قوي") || sillage.includes("طاغ") || sillage.includes("يملا المكان") || allNotes.includes("جلود")) {
            score -= 100;
          }
        } else if (wantsLoud) {
          if (sillage.includes("قوي") || sillage.includes("طاغ") || sillage.includes("يملا المكان")) {
            score += 50;
          }
        }

        // Notes and olfactory matches
        const olfactoryTerms = [
          "عود", "عنبر", "مسك", "فانيليا", "ورد", "ياسمين", "توباكو", "جلد",
          "حمضيات", "برغموت", "هيل", "صندل", "خشب", "باتشولي", "زعفران", "قهوة"
        ];
        for (const term of olfactoryTerms) {
          if (queryNorm.includes(term) && allNotes.includes(term)) {
            score += 45;
          }
        }

        // Season & occasion intent
        if (queryNorm.includes("شتو") || queryNorm.includes("دافئ") || queryNorm.includes("برد")) {
          if (allNotes.includes("عنبر") || allNotes.includes("عود") || season.includes("شتاء")) score += 35;
        }
        if (queryNorm.includes("صيف") || queryNorm.includes("منعش") || queryNorm.includes("حر")) {
          if (allNotes.includes("برغموت") || allNotes.includes("حمضيات") || season.includes("صيف")) score += 35;
        }

        // Best-seller & Top-demand intent based purely on admin description & reviews
        const wantsBestSeller =
          queryNorm.includes("مبيع") ||
          queryNorm.includes("اكثر عطر") ||
          queryNorm.includes("اكتر عطر") ||
          queryNorm.includes("طلب") ||
          queryNorm.includes("مبيعات") ||
          queryNorm.includes("مشهور") ||
          queryNorm.includes("توب") ||
          queryNorm.includes("احسن عطر");

        const adminFullText = `${descAr} ${normalizeText(p.tagline?.ar || "")} ${allNotes}`;
        if (wantsBestSeller) {
          if (adminFullText.includes("مبيع") || adminFullText.includes("طلب") || adminFullText.includes("ايقون") || (p.reviewsCount && p.reviewsCount > 100)) {
            score += 50;
          }
        }

        if (categoryAr.includes(queryNorm)) score += 35;
        if (descAr.includes(queryNorm)) score += 20;

        return { product: p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    let matchedProducts = scoredProducts.slice(0, 6).map((x) => x.product);

    // Fallback search only across non-stop words if zero scored matches
    if (!matchedProducts.length && queryTokens.length > 0) {
      matchedProducts = liveProducts.filter((p) => {
        const text = normalizeText(`${p.name} ${p.arabicName} ${p.category?.ar || ""} ${p.specs?.gender?.ar || ""}`);
        return queryTokens.some((w) => text.includes(w));
      }).slice(0, 6);
    }

    // 2. Intelligent AI Sommelier with Google Gemini (Relying 100% on Admin Descriptions & Specs)
    let aiInsight = "";
    const isConversational =
      query.length >= 4 ||
      queryTokens.length >= 1 ||
      /عندكم|عايز|أفضل|انسب|يناسب|هدية|مناسبة|فخم|شتوي|صيفي|رسمي|دوام|عروس|ثابت|فواح|هادي|مش|بديل|مبيع|مبيعات|اكتر|اكثر|طلب/i.test(query);

    if (isConversational && allowAiCall) {
      try {
        const productsCatalogPrompt = liveProducts.map((p) => ({
          id: p.id,
          name: p.name,
          arabicName: p.arabicName,
          classification: p.classification,
          gender: p.specs?.gender?.ar || "",
          sillage: p.specs?.sillage?.ar || "",
          longevity: p.specs?.longevity?.ar || "",
          season: p.specs?.season?.ar || "",
          origin: p.specs?.origin?.ar || "",
          topNotes: p.pyramid?.topNotes?.ar || "",
          heartNotes: p.pyramid?.heartNotes?.ar || "",
          baseNotes: p.pyramid?.baseNotes?.ar || "",
          tagline: p.tagline?.ar || "",
          description: p.description?.ar || "",
          rating: p.rating,
          reviewsCount: p.reviewsCount,
          price: p.price,
        }));

        const systemPrompt = `
أنت مستشار وخبير العطور لدار جُوفينيل للعطور الفاخرة (JUVENILE Haute Parfumerie).
يقوم العميل بالبحث أو الاستفسار: "${boundedQuery}".

مهمتك الذكية:
1. اقرأ الكتالوج المرفق بدقة؛ اعتمد 100% على ما كُتب في وصف ومواصفات ونوتات كل عطر بواسطة الإدارة.
2. اختر أفضل 1 إلى 3 عطور تناسب طلب العميل تماماً وضع معرفاتها في recommendedProductIds.
3. صغ توصية عطرية موجزة وأنيقة جداً (في جملة أو جملتين فقط) تشرح سبب الترشيح من واقع نوتات ووصف العطر:
   - تحدث بلغة عربية فصيحة سلسة وواثقة ومباشرة كخبير عطور حقيقي.
   - ممنوع منعاً باتاً الكليشيهات المترجمة آلياً مثل ("فهما الخياران الأمثل"، "حيث يجمعان في مقدمتهما"، "يعد خياراً رائعاً").
   - ممنوع استخدام النجوم (* أو **) أو الرموز التعبيرية المبالغ فيها.

كتالوج عطور جُوفينيل الحالي:
${JSON.stringify(productsCatalogPrompt, null, 2)}

أرجع JSON فقط:
{
  "reply": "نص التوصية العطرية الموجزة والأنيقة بلغة عربية فصيحة وطبيعية",
  "recommendedProductIds": ["id1"]
}
`;

        const geminiRes = await generateWithGemini(systemPrompt, boundedQuery);
        if (geminiRes) {
          const replyText = geminiRes.reply || geminiRes.rawJson?.aiInsight || "";
          if (replyText) {
            aiInsight = cleanFormatting(replyText);
          }

          const recIds: string[] =
            geminiRes.recommendedProductIds?.length > 0
              ? geminiRes.recommendedProductIds
              : Array.isArray(geminiRes.rawJson?.matchedIds)
              ? geminiRes.rawJson.matchedIds
              : [];

          if (recIds.length > 0) {
            const aiPicked = recIds
              .map((id) => liveProducts.find((p) => p.id === id))
              .filter(Boolean) as ProductDetailData[];

            if (aiPicked.length > 0) {
              matchedProducts = aiPicked;
            }
          }
        }
      } catch (err) {
        console.warn("[AI Search Route] Gemini error, using refined semantic matching:", err);
      }
    }

    // Dynamic fallback insight from the matched product's admin description (zero hardcoded strings)
    if (!aiInsight && matchedProducts.length > 0) {
      const topP = matchedProducts[0];
      const snippet = topP.tagline?.ar || (typeof topP.description === "object" ? topP.description.ar : topP.description)?.slice(0, 110) || "";
      aiInsight = `نرشح لك عطر ${topP.arabicName}؛ ${snippet}`;
    }

    return NextResponse.json({
      success: true,
      aiInsight,
      products: matchedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        arabicName: p.arabicName,
        price: p.price,
        formattedPrice: typeof p.price === "number" ? `${p.price.toLocaleString("ar-EG")} ج.م` : p.price,
        image: p.image || p.gallery?.[0] || "/hero/hero-1.jpg",
        category: typeof p.category === "object" ? p.category.ar : p.category,
        notes: [
          p.pyramid?.topNotes?.ar?.split("،")[0] || p.pyramid?.topNotes?.ar?.split(",")[0],
          p.pyramid?.baseNotes?.ar?.split("،")[0] || p.pyramid?.baseNotes?.ar?.split(",")[0],
        ]
          .filter(Boolean)
          .join(" • "),
      })),
      suggestedQueries: [
        "عطور هادئة برائحة المسك والزهور",
        "عطور الشتاء الأكثر فوحاناً",
        "عطور رسمية للمناسبات",
      ],
    });
  } catch (error) {
    console.error("AI Search route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal search error" },
      { status: 500 }
    );
  }
}
