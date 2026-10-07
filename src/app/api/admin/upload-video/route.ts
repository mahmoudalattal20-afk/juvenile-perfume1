import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// 50 MB limit for short cinematic editorial showcase videos
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const ALLOWED_VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v"]);

export async function POST(req: Request) {
  try {
    // 1. Zero-Trust Authorization: Admin Only
    if (!isAdmin(req)) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك برفع الفيديوهات (Unauthorized)" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "لم يتم اختيار أي ملف فيديو للرفع" },
        { status: 400 }
      );
    }

    // 2. Strict File Size Validation
    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { success: false, error: "حجم الفيديو يتجاوز الحد الأقصى المسموح به (50 ميجابايت)" },
        { status: 400 }
      );
    }

    const rawExt = path.extname(file.name || "").toLowerCase();
    if (!ALLOWED_VIDEO_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { success: false, error: "نوع الملف غير مدعوم. يرجى رفع فيديو بصيغة MP4 أو WEBM أو MOV فقط." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Safe Cryptographic File Storage in public/uploads/videos
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "videos");
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeExt = rawExt || ".mp4";
    const uniqueName = `video_${Date.now()}_${crypto.randomBytes(6).toString("hex")}${safeExt}`;
    const filePath = path.join(uploadsDir, uniqueName);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/videos/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueName,
    });
  } catch (error) {
    console.error("[Upload Video API] Error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء حفظ ملف الفيديو على السيرفر" },
      { status: 500 }
    );
  }
}
