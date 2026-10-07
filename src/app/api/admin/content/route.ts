import { NextResponse } from "next/server";
import { getCMSData, saveCMSData } from "@/lib/cmsStore";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = getCMSData();
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to load content" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Zero-Trust: Enforce server-side administrator authorization
    if (!isAdmin(req)) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بتعديل محتوى المتجر (Unauthorized)" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const updated = saveCMSData(body);
    return NextResponse.json({
      success: true,
      message: "تم حفظ ونشر التعديلات بنجاح",
      data: updated,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to save content" },
      { status: 500 }
    );
  }
}
