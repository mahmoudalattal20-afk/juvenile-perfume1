import { NextResponse } from "next/server";
import { getWhatsAppStatus, sendWhatsAppMessage, logoutWhatsApp } from "@/lib/whatsapp";
import { isAdmin } from "@/lib/auth";
import { spawn } from "child_process";
import path from "path";

export const dynamic = "force-dynamic";

// Function to auto-start whatsapp service if offline (Admin triggered)
let isStartingService = false;
function ensureWhatsAppServiceRunning() {
  if (isStartingService) return;
  isStartingService = true;

  try {
    const servicePath = path.join(process.cwd(), "server", "whatsapp-service.js");
    const child = spawn("node", [servicePath], {
      detached: true,
      stdio: "ignore",
      cwd: process.cwd(),
      shell: true,
    });
    child.unref();
  } catch (err) {
    console.error("[API WhatsApp] Failed to spawn whatsapp-service:", err);
  } finally {
    setTimeout(() => {
      isStartingService = false;
    }, 5000);
  }
}

/**
 * WhatsApp Status - Admin Only
 * Protects QR code and store phone number from public discovery
 */
export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "غير مصرح لك بعرض حالة الواتساب (Unauthorized)" },
      { status: 401 }
    );
  }

  let status = await getWhatsAppStatus();

  // If service is offline, attempt to wake it up
  if (!status.success && status.error?.includes("offline")) {
    ensureWhatsAppServiceRunning();
  }

  return NextResponse.json(status);
}

/**
 * WhatsApp Actions (send test, logout, wake) - Admin Only
 * Completely closes the spam relay and unauthorized disconnect vector
 */
export async function POST(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بتنفيذ عمليات الواتساب (Unauthorized)" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, phone, message } = body;

    if (action === "logout") {
      const result = await logoutWhatsApp();
      return NextResponse.json(result);
    }

    if (action === "send") {
      if (!phone || !message) {
        return NextResponse.json({ success: false, error: "phone and message are required" }, { status: 400 });
      }
      const result = await sendWhatsAppMessage(phone, message);
      return NextResponse.json(result);
    }

    if (action === "wake") {
      ensureWhatsAppServiceRunning();
      return NextResponse.json({ success: true, message: "Wakeup triggered" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Internal error" }, { status: 500 });
  }
}
