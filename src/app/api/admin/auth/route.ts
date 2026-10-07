import { NextResponse } from "next/server";
import {
  verifyAdminPasskey,
  verifyAccountCredentials,
  setAuthCookies,
  isAdmin,
  getAuthenticatedUser,
} from "@/lib/auth";

import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`admin_auth:${ip}`, 7, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `تم تجاوز عدد محاولات الدخول المسموح بها. يرجى الانتظار ${rateCheck.resetSeconds} ثانية قبل المحاولة مجدداً.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password, passkey } = body;

    let verifiedUser: { name: string; email: string; role: "admin" | "customer" } | null = null;

    if (email && password) {
      const account = verifyAccountCredentials(String(email), String(password));
      if (account && account.role === "admin") {
        verifiedUser = account;
      }
    } else if (passkey && verifyAdminPasskey(String(passkey))) {
      verifiedUser = {
        name: "مدير المتجر",
        email: "admin@juvenile.com",
        role: "admin",
      };
    }

    if (!verifiedUser) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
    });

    // Set cryptographically signed session cookies
    setAuthCookies(response, {
      sub: verifiedUser.email,
      email: verifiedUser.email,
      name: verifiedUser.name,
      role: "admin",
    });

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "حدث خطأ أثناء المصادقة";
    console.error("Admin auth error:", err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const isAuthed = isAdmin(req);
    const user = isAuthed ? getAuthenticatedUser(req) : null;

    return NextResponse.json({
      isAuthenticated: isAuthed,
      user: user
        ? {
            name: user.name,
            email: user.email,
            role: user.role,
          }
        : null,
    });
  } catch {
    return NextResponse.json({ isAuthenticated: false });
  }
}
