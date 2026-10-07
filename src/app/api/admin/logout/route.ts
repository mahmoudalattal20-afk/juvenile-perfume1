import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "تم تسجيل الخروج بنجاح",
  });

  clearAuthCookies(response);

  return response;
}
