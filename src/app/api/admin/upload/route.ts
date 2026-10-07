import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Megabytes limit
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

/**
 * Verify true file format via Magic Bytes (Header signatures)
 * Rejects disguised executables, HTML, and SVG files
 */
function isValidImageMagicBytes(buffer: Buffer): { valid: boolean; ext: string } {
  if (buffer.length < 12) return { valid: false, ext: "" };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, ext: ".jpg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, ext: ".png" };
  }

  // WEBP: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, ext: ".webp" };
  }

  // AVIF: ftypavif (starts around byte 4)
  const headerStr = buffer.slice(4, 12).toString("ascii");
  if (headerStr.includes("ftypavif") || headerStr.includes("ftypmif1")) {
    return { valid: true, ext: ".avif" };
  }

  return { valid: false, ext: "" };
}

export async function POST(req: Request) {
  try {
    // 1. Zero-Trust Authorization: Admin Only
    if (!isAdmin(req)) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك برفع الملفات (Unauthorized)" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "لم يتم اختيار أي ملف للرفع" },
        { status: 400 }
      );
    }

    // 2. Strict File Size Validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "حجم الملف يتجاوز الحد الأقصى المسموح به (5 ميجابايت)" },
        { status: 400 }
      );
    }

    const rawExt = path.extname(file.name || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { success: false, error: "نوع الملف غير مدعوم. يرجى رفع صور بصيغة JPG أو PNG أو WEBP فقط." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Deep Content Inspection: Magic Bytes Verification
    const magicCheck = isValidImageMagicBytes(buffer);
    if (!magicCheck.valid) {
      return NextResponse.json(
        { success: false, error: "محتوى الملف غير صالح أو تم التلاعب به. يرجى اختيار صورة سليمة." },
        { status: 400 }
      );
    }

    // 4. Safe Cryptographic File Storage
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Cryptographic UUID to prevent path traversal or file overwrites
    const safeExt = magicCheck.ext || rawExt || ".jpg";
    const uniqueName = `img_${Date.now()}_${crypto.randomBytes(8).toString("hex")}${safeExt}`;
    const filePath = path.join(uploadsDir, uniqueName);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueName,
    });
  } catch (error) {
    console.error("[Upload API] Error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء حفظ الملف على السيرفر" },
      { status: 500 }
    );
  }
}
