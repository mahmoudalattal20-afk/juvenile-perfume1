/**
 * ==============================================================================
 *  🌸 JUVENILE WHATSAPP CLIENT HELPER (COMMUNICATES WITH MICROSERVICE) 🌸
 * ==============================================================================
 */

const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || "http://127.0.0.1:3002";
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || "juv_internal_secret_token_secure_2026";

function getServiceHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${INTERNAL_SERVICE_SECRET}`,
  };
}

export interface WhatsAppServiceStatus {
  success: boolean;
  connected: boolean;
  status: "disconnected" | "connecting" | "qr_ready" | "connected";
  qr: string | null;
  userPhone: string | null;
  userName?: string | null;
  lastUpdated?: string;
  error?: string;
}

/**
 * Fetch live connection status from WhatsApp microservice
 */
export async function getWhatsAppStatus(): Promise<WhatsAppServiceStatus> {
  try {
    const res = await fetch(`${WHATSAPP_SERVICE_URL}/status`, {
      headers: getServiceHeaders(),
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        success: false,
        connected: false,
        status: "disconnected",
        qr: null,
        userPhone: null,
        error: `Service returned ${res.status}`,
      };
    }
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      connected: false,
      status: "disconnected",
      qr: null,
      userPhone: null,
      error: err?.message || "WhatsApp microservice is offline",
    };
  }
}

/**
 * Send WhatsApp text message to customer
 */
export async function sendWhatsAppMessage(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${WHATSAPP_SERVICE_URL}/send`, {
      method: "POST",
      headers: getServiceHeaders(),
      body: JSON.stringify({ phone, message }),
      cache: "no-store",
    });
    return await res.json();
  } catch (err: any) {
    console.error("[WhatsApp Client] Send error:", err?.message);
    return { success: false, error: err?.message || "Failed to reach WhatsApp service" };
  }
}

/**
 * Disconnect & logout to scan new QR code
 */
export async function logoutWhatsApp(): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${WHATSAPP_SERVICE_URL}/logout`, {
      method: "POST",
      headers: getServiceHeaders(),
      cache: "no-store",
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Order message templates in Arabic
 */
export function buildOrderCreatedMessage(order: any): string {
  const customerName = order.customer?.firstName || "العميل العزيز";
  const itemsText = (order.items || [])
    .map((item: any) => `• ${item.quantity || 1}x ${item.name} (${(item.price || 0).toLocaleString("ar-EG")} ج.م)`)
    .join("\n");

  return `🌸 *أهلاً بك أستاذ ${customerName} في جوفينيل للعطور* 🌸

تم استلام وتسجيل طلبك بنجاح! رقم طلبك هو: *#${order.orderId}*

📦 *تفاصيل العطور المطلوبة:*
${itemsText}

💰 *إجمالي المبلغ:* ${(order.total || 0).toLocaleString("ar-EG")} ج.م (الدفع عند الاستلام)
📍 *عنوان التوصيل:* ${order.delivery?.governorate || "مصر"} - ${order.delivery?.city || ""} - ${order.delivery?.address || ""}

فريق جوفينيل سيقوم بتأكيد الشحن معك وتجهيز عطرك الفاخر.
شكراً لاختيارك جوفينيل ✨`;
}

export function buildOrderStatusUpdatedMessage(order: any, newStatus: string): string | null {
  const customerName = order.customer?.firstName || "العميل العزيز";
  const orderId = order.orderId;
  const total = (order.total || 0).toLocaleString("ar-EG");

  switch (newStatus) {
    case "processing":
      return `🌸 *تحديث لطلبك #${orderId} من جوفينيل* 🌸

أستاذ ${customerName} العزيز،
تم بدء تجهيز وتعبئة زجاجة عطرك الفاخرة الآن بعناية واهتمام بأدق التفاصيل 🧪✨
سنخبرك فور خروج الشحنة مع مندوب التوصيل.`;

    case "shipped":
      return `🚚 *طلبك في الطريق إليك! (#${orderId})* 🌸

أستاذ ${customerName}،
عطرك الفاخر من جوفينيل تم تسليمه لمندوب الشحن وهو الآن في طريقه إليك:
📍 ${order.delivery?.governorate || ""} - ${order.delivery?.city || ""} - ${order.delivery?.address || ""}

💰 المبلغ المطلوب عند الاستلام: *${total} ج.م*
يرجى الاستعداد للاستلام، ونتمنى لك تجربة عطرية استثنائية! ✨`;

    case "delivered":
      return `🎉 *مبروك استلام طلبك #${orderId}!* 🌸

أستاذ ${customerName} الغالي،
نتمنى أن ينال عطر جوفينيل إعجابك وفخامة ذوقك الرفيع.
نصيحة ذهبية: للحصول على أفضل أداء وثبات (+24 ساعة)، ننصح برش العطر على مناطق النبض والملابس.

يسعدنا دائماً سماع رأيك وتجربتك العطرية معنا! ✨`;

    case "cancelled":
      return `تم إلغاء الطلب #${orderId} في متجر جوفينيل للعطور.
إذا كان هذا الإلغاء عن طريق الخطأ أو رغبت في إعادة الطلب، يسعدنا تواصلك معنا في أي وقت 🌸`;

    default:
      return null;
  }
}
