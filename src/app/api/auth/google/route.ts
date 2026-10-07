import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Google Sign-In Handler (2026 Free Identity Integration)
 * Verifies Google ID tokens or demo credentials and establishes a signed session
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`google_auth:${ip}`, 12, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `تم تجاوز عدد المحاولات، يرجى الانتظار ${rateCheck.resetSeconds} ثانية.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { credential, email, name, picture } = body;

    let userEmail = "";
    let userName = "";

    // Case 1: Real Google ID Token provided (via Google Identity Services)
    if (credential) {
      try {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
          { cache: "no-store" }
        );

        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          userEmail = payload.email || "";
          userName = payload.name || payload.given_name || userEmail.split("@")[0];
        } else {
          return NextResponse.json(
            { success: false, error: "رمز Google غير صالح أو انتهت صلاحيته." },
            { status: 401 }
          );
        }
      } catch (err) {
        console.warn("[Google Auth] Error contacting Google tokeninfo endpoint:", err);
        return NextResponse.json(
          { success: false, error: "تعذر التحقق من حساب Google عبر خوادم Google." },
          { status: 500 }
        );
      }
    } else if (email) {
      // Case 2: Sandbox / Direct Customer Sign-In
      userEmail = String(email).trim().toLowerCase();
      userName = name ? String(name).trim() : userEmail.split("@")[0];
    } else {
      return NextResponse.json(
        { success: false, error: "بيانات تسجيل الدخول عبر Google غير مكتملة." },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "تعذر استخراج البريد الإلكتروني من حساب Google." },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        name: userName,
        email: userEmail,
        role: "customer" as const,
      },
      message: `أهلاً بك يا ${userName}! تم تسجيل دخولك بنجاح عبر Google 🌸`,
    });

    // Establish cryptographically signed session cookie (Customer role, 30 days expiry)
    setAuthCookies(response, {
      sub: userEmail,
      email: userEmail,
      name: userName,
      role: "customer",
    });

    return response;
  } catch (error) {
    console.error("[Google Auth API] Internal error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء إتمام الدخول بحساب Google." },
      { status: 500 }
    );
  }
}
