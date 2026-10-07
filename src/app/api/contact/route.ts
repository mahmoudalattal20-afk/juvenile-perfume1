import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import fs from "fs";
import path from "path";

interface ContactPayload {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  subject?: string;
  serviceType?: string;
  preferredContact?: string;
  message: string;
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`${ip}:contact-form`, 8, 60000); // 8 requests per minute max

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: "لقد تجاوزت الحد المسموح به من الطلبات مؤقتاً. يرجى المحاولة بعد قليل.",
          resetSeconds: rateCheck.resetSeconds,
        },
        { status: 429 }
      );
    }

    const body = (await req.json()) as ContactPayload;
    const { firstName, lastName, email, phone, subject, serviceType, preferredContact, message } = body;

    // Strict Validations
    if (!firstName || !firstName.trim()) {
      return NextResponse.json(
        { success: false, error: "يرجى كتابة الاسم" },
        { status: 400 }
      );
    }

    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال بريد إلكتروني صحيح" },
        { status: 400 }
      );
    }

    if (!message || message.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "يرجى كتابة تفاصيل استفسارك (5 أحرف على الأقل)" },
        { status: 400 }
      );
    }

    // Reference ID generator: JUV-2026-XXXX
    const refNumber = `JUV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const inquiryRecord = {
      id: refNumber,
      createdAt: new Date().toISOString(),
      clientIp: ip,
      firstName: firstName.trim(),
      lastName: (lastName || "").trim(),
      fullName: `${firstName.trim()} ${(lastName || "").trim()}`.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || "").trim(),
      subject: (subject || "استفسار عام").trim(),
      serviceType: (serviceType || "general").trim(),
      preferredContact: (preferredContact || "whatsapp").trim(),
      message: message.trim(),
      status: "new",
    };

    // Safely persist to data directory
    try {
      const dataDir = path.join(process.cwd(), "src", "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const filePath = path.join(dataDir, "contactInquiries.json");
      let existingInquiries: any[] = [];
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, "utf-8");
          existingInquiries = JSON.parse(content);
        } catch {
          existingInquiries = [];
        }
      }
      existingInquiries.unshift(inquiryRecord);
      // Keep last 500 inquiries
      if (existingInquiries.length > 500) {
        existingInquiries = existingInquiries.slice(0, 500);
      }
      fs.writeFileSync(filePath, JSON.stringify(existingInquiries, null, 2), "utf-8");
    } catch (saveErr) {
      console.warn("Notice: Failed to save inquiry to file, proceeding:", saveErr);
    }

    return NextResponse.json({
      success: true,
      referenceId: refNumber,
      message: "تم استلام رسالتك بنجاح. سيتواصل معك مستشار العطور في أقرب وقت.",
    });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى." },
      { status: 500 }
    );
  }
}
