import { NextResponse } from "next/server";
import {
  verifyAccountCredentials,
  setAuthCookies,
  clearAuthCookies,
  getAuthenticatedUser,
} from "@/lib/auth";

import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password, action } = await req.json();

    if (action === "logout") {
      const response = NextResponse.json({
        success: true,
        message: "تم تسجيل الخروج بنجاح",
      });
      clearAuthCookies(response);
      return response;
    }

    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`auth_login:${ip}`, 7, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `تم تجاوز عدد المحاولات، يرجى الانتظار ${rateCheck.resetSeconds} ثانية.`,
        },
        { status: 429 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "من فضلك اكتب البريد الإلكتروني والرقم السري" },
        { status: 400 }
      );
    }

    const account = verifyAccountCredentials(String(email), String(password));

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          error: "البريد الإلكتروني أو الرقم السري غير صحيح، يرجى المحاولة مجدداً",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        name: account.name,
        email: account.email,
        role: account.role,
      },
      message:
        account.role === "admin"
          ? "أهلاً بيك يا مدير! جاري تحويلك للوحة التحكم..."
          : `أهلاً بيك يا ${account.name}! منوّر جوفينيل`,
      redirect: account.role === "admin" ? "/admin" : null,
    });

    // Set cryptographically signed session tokens
    setAuthCookies(response, {
      sub: account.email,
      email: account.email,
      name: account.name,
      role: account.role,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "حصلت مشكلة في السيرفر، جرب تاني" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json({ loggedIn: false });
    }

    return NextResponse.json({
      loggedIn: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json({ loggedIn: false });
  }
}
