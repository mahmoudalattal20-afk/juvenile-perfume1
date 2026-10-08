import fs from "fs";
import path from "path";
import { SiteCMSData, DEFAULT_CMS_DATA } from "./cmsTypes";
import { ProductDetailData } from "@/data/products";

export * from "./cmsTypes";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "cmsContent.json");

export function getCMSData(): SiteCMSData {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      const deletedList: string[] = Array.isArray(parsed.deletedProducts) ? parsed.deletedProducts : [];
      const deletedSet = new Set<string>(deletedList);

      const deletedInspiredList: string[] = Array.isArray(parsed.deletedInspiredProducts)
        ? parsed.deletedInspiredProducts
        : [];
      const deletedInspiredSet = new Set<string>([...deletedInspiredList, ...deletedList]);

      const baseProducts: Record<string, ProductDetailData> = {
        ...DEFAULT_CMS_DATA.products,
        ...(parsed.products || {}),
      };

      const finalProducts: Record<string, ProductDetailData> = {};
      for (const [id, prod] of Object.entries(baseProducts)) {
        if (!deletedSet.has(id)) {
          finalProducts[id] = prod;
        }
      }

      const rawInspired: Record<string, any> =
        parsed.inspiredProducts !== undefined
          ? parsed.inspiredProducts
          : (DEFAULT_CMS_DATA.inspiredProducts || {});

      const finalInspired: Record<string, any> = {};
      for (const [id, prod] of Object.entries(rawInspired)) {
        if (!deletedInspiredSet.has(id)) {
          finalInspired[id] = prod;
        }
      }

      const coupons =
        parsed.coupons !== undefined
          ? parsed.coupons
          : DEFAULT_CMS_DATA.coupons;

      const featuredProductIds =
        Array.isArray(parsed.featuredProductIds)
          ? parsed.featuredProductIds
          : DEFAULT_CMS_DATA.featuredProductIds;

      const featuredInspiredProductIds =
        Array.isArray(parsed.featuredInspiredProductIds)
          ? parsed.featuredInspiredProductIds
          : DEFAULT_CMS_DATA.featuredInspiredProductIds;

      const bukhoorSection = {
        ...DEFAULT_CMS_DATA.bukhoorSection,
        ...(parsed.bukhoorSection || {}),
      };

      return {
        ...DEFAULT_CMS_DATA,
        ...parsed,
        deletedProducts: Array.from(deletedSet),
        deletedInspiredProducts: Array.from(deletedInspiredSet),
        products: finalProducts,
        inspiredProducts: finalInspired,
        coupons,
        featuredProductIds,
        featuredInspiredProductIds,
        bukhoorSection,
      };
    }
  } catch (err) {
    console.error("Error reading cmsContent.json, falling back to defaults:", err);
  }
  return DEFAULT_CMS_DATA;
}

export function saveCMSData(updated: Partial<SiteCMSData>): SiteCMSData {
  try {
    const current = getCMSData();
    const deletedSet = new Set<string>([
      ...(current.deletedProducts || []),
      ...(updated.deletedProducts || []),
    ]);

    const deletedInspiredSet = new Set<string>([
      ...(current.deletedInspiredProducts || []),
      ...(updated.deletedInspiredProducts || []),
      ...Array.from(deletedSet),
    ]);

    // If updated.products is explicitly provided, any product in current that is missing from updated is considered deleted
    if (updated.products) {
      for (const id of Object.keys(current.products)) {
        if (!updated.products[id]) {
          deletedSet.add(id);
        }
      }
    }

    // If updated.inspiredProducts is explicitly provided, any inspired perfume in current that is missing from updated is considered deleted
    if (updated.inspiredProducts !== undefined) {
      for (const id of Object.keys(current.inspiredProducts || {})) {
        if (!updated.inspiredProducts[id]) {
          deletedInspiredSet.add(id);
        }
      }
    }

    const mergedProducts: Record<string, ProductDetailData> = {};
    const baseProducts = updated.products ? updated.products : current.products;
    for (const [id, prod] of Object.entries(baseProducts)) {
      if (!deletedSet.has(id)) {
        mergedProducts[id] = prod;
      }
    }

    const mergedInspired: Record<string, any> = {};
    const baseInspired =
      updated.inspiredProducts !== undefined
        ? updated.inspiredProducts
        : (current.inspiredProducts || {});
    for (const [id, prod] of Object.entries(baseInspired)) {
      if (!deletedInspiredSet.has(id)) {
        mergedInspired[id] = prod;
      }
    }

    const mergedCoupons =
      updated.coupons !== undefined
        ? updated.coupons
        : (current.coupons || DEFAULT_CMS_DATA.coupons || {});

    const mergedFeatured =
      updated.featuredProductIds !== undefined
        ? updated.featuredProductIds
        : (current.featuredProductIds || DEFAULT_CMS_DATA.featuredProductIds || []);

    const mergedFeaturedInspired =
      updated.featuredInspiredProductIds !== undefined
        ? updated.featuredInspiredProductIds
        : (current.featuredInspiredProductIds || DEFAULT_CMS_DATA.featuredInspiredProductIds || []);

    const merged: SiteCMSData = {
      ...current,
      ...updated,
      featuredProductIds: mergedFeatured,
      featuredInspiredProductIds: mergedFeaturedInspired,
      deletedProducts: Array.from(deletedSet),
      deletedInspiredProducts: Array.from(deletedInspiredSet),
      products: mergedProducts,
      inspiredProducts: mergedInspired,
      coupons: mergedCoupons,
      lastUpdated: new Date().toISOString(),
    };

    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8");
    return merged;
  } catch (err) {
    console.error("Error writing cmsContent.json:", err);
    throw err;
  }
}
