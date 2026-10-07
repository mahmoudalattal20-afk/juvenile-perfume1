import { NextResponse } from "next/server";
import { isAdmin, setAuthCookies } from "@/lib/auth";
import { getAdminAccount, updateAdminAccount, verifyCurrentPassword } from "@/lib/adminAccount";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }

    const current = getAdminAccount();
    return NextResponse.json({
      success: true,
      account: {
        email: current.email,
        name: current.name || "مدير المتجر",
        updatedAt: current.updatedAt,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بإجراء هذا التعديل" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, currentPassword, newEmail, newPassword } = body;

    // Verify current password as enterprise security barrier
    const cleanCurrentPass = String(currentPassword || "").trim();
    if (!cleanCurrentPass) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال كلمة المرور الحالية لتأكيد هويتك" },
        { status: 400 }
      );
    }

    if (!verifyCurrentPassword(cleanCurrentPass)) {
      return NextResponse.json(
        { success: false, error: "كلمة المرور الحالية غير صحيحة" },
        { status: 401 }
      );
    }

    const currentAccount = getAdminAccount();

    // Action 1: Change Email
    if (action === "change_email") {
      const cleanEmail = String(newEmail || "").trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        return NextResponse.json(
          { success: false, error: "يرجى إدخال بريد إلكتروني صالح" },
          { status: 400 }
        );
      }

      if (cleanEmail === currentAccount.email.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: "البريد الإلكتروني الجديد مطابق للبريد الحالي" },
          { status: 400 }
        );
      }

      const updated = updateAdminAccount(cleanEmail, currentAccount.password);

      const response = NextResponse.json({
        success: true,
        message: "تم تحديث البريد الإلكتروني بنجاح",
        email: updated.email,
      });

      setAuthCookies(response, {
        sub: updated.email,
        email: updated.email,
        name: updated.name || "مدير المتجر",
        role: "admin",
      });

      return response;
    }

    // Action 2: Change Password
    if (action === "change_password") {
      const cleanNewPassword = String(newPassword || "").trim();
      if (!cleanNewPassword || cleanNewPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "كلمة المرور الجديدة يجب أن تتكون من 6 أحرف أو أرقام على الأقل" },
          { status: 400 }
        );
      }

      if (cleanNewPassword === cleanCurrentPass) {
        return NextResponse.json(
          { success: false, error: "كلمة المرور الجديدة يجب ألا تكون مطابقة لكلمة المرور الحالية" },
          { status: 400 }
        );
      }

      const updated = updateAdminAccount(currentAccount.email, cleanNewPassword);

      const response = NextResponse.json({
        success: true,
        message: "تم تحديث كلمة المرور بنجاح",
        email: updated.email,
      });

      setAuthCookies(response, {
        sub: updated.email,
        email: updated.email,
        name: updated.name || "مدير المتجر",
        role: "admin",
      });

      return response;
    }

    // Fallback if neither action specified
    return NextResponse.json(
      { success: false, error: "طلب غير معروف" },
      { status: 400 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "فشل تحديث بيانات الحساب";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
