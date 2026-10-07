import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  buildOrderCreatedMessage,
  buildOrderStatusUpdatedMessage,
  sendWhatsAppMessage,
} from "@/lib/whatsapp";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ORDERS_FILE_PATH = path.join(process.cwd(), "src", "data", "orders.json");

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  type?: string;
}

interface OrderPayload {
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    secondaryPhone?: string;
    email?: string;
    notes?: string;
  };
  delivery: {
    governorate: string;
    city: string;
    address: string;
    apartment?: string;
  };
  shipping: {
    method: string;
    cost: number;
  };
  payment: {
    method: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
}

async function getStoredOrders(): Promise<any[]> {
  try {
    const data = await fs.readFile(ORDERS_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveOrders(orders: any[]): Promise<void> {
  const dir = path.dirname(ORDERS_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), "utf-8");
}

function sanitizeString(str: any, maxLen: number = 200): string {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, maxLen).replace(/[<>]/g, "");
}

import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * Public Endpoint: Customer Places Order
 * Hardened with Input Validation & Defense-in-depth
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`orders_create:${ip}`, 8, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `تم إرسال عدة طلبات متتالية. يرجى الانتظار ${rateCheck.resetSeconds} ثانية قبل المحاولة مجدداً.`,
        },
        { status: 429 }
      );
    }

    const payload: OrderPayload = await req.json();

    // 1. Strict required fields check
    if (
      !payload?.customer?.firstName ||
      !payload?.customer?.phone ||
      !payload?.delivery?.governorate ||
      !payload?.delivery?.address ||
      !Array.isArray(payload?.items) ||
      payload.items.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "بيانات الطلب غير مكتملة، يرجى ملء الحقول المطلوبة." },
        { status: 400 }
      );
    }

    // 2. Phone validation (10 to 15 digits)
    const cleanPhone = String(payload.customer.phone).replace(/\D/g, "");
    if (cleanPhone.length < 9 || cleanPhone.length > 15) {
      return NextResponse.json(
        { success: false, error: "رقم الهاتف غير صحيح، يرجى كتابة رقم موبايل صحيح." },
        { status: 400 }
      );
    }

    // 3. Items validation & bounding
    if (payload.items.length > 50) {
      return NextResponse.json(
        { success: false, error: "عدد المنتجات يتجاوز الحد المسموح به للطلب الواحد." },
        { status: 400 }
      );
    }

    const sanitizedItems: OrderItem[] = payload.items.map((item) => ({
      id: sanitizeString(item.id, 50),
      name: sanitizeString(item.name, 100),
      price: Math.max(0, Number(item.price) || 0),
      quantity: Math.min(Math.max(1, Math.floor(Number(item.quantity) || 1)), 20),
      image: item.image ? sanitizeString(item.image, 300) : undefined,
      type: item.type ? sanitizeString(item.type, 50) : undefined,
    }));

    // 4. Sanitize customer & delivery
    const sanitizedOrder = {
      orderId: `JUV-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      status: "pending_confirmation",
      customer: {
        firstName: sanitizeString(payload.customer.firstName, 60),
        lastName: sanitizeString(payload.customer.lastName, 60),
        phone: cleanPhone,
        secondaryPhone: payload.customer.secondaryPhone
          ? String(payload.customer.secondaryPhone).replace(/\D/g, "").slice(0, 15)
          : undefined,
        email: payload.customer.email ? sanitizeString(payload.customer.email, 100) : undefined,
        notes: payload.customer.notes ? sanitizeString(payload.customer.notes, 500) : undefined,
      },
      delivery: {
        governorate: sanitizeString(payload.delivery.governorate, 60),
        city: sanitizeString(payload.delivery.city, 60),
        address: sanitizeString(payload.delivery.address, 250),
        apartment: payload.delivery.apartment ? sanitizeString(payload.delivery.apartment, 60) : undefined,
      },
      shipping: {
        method: sanitizeString(payload.shipping?.method || "standard", 50),
        cost: Math.max(0, Number(payload.shipping?.cost) || 0),
      },
      payment: {
        method: sanitizeString(payload.payment?.method || "cod", 50),
      },
      items: sanitizedItems,
      subtotal: Math.max(0, Number(payload.subtotal) || 0),
      discount: Math.max(0, Number(payload.discount) || 0),
      total: Math.max(0, Number(payload.total) || 0),
      couponCode: payload.couponCode ? sanitizeString(payload.couponCode, 30) : undefined,
    };

    const existingOrders = await getStoredOrders();
    existingOrders.unshift(sanitizedOrder);
    await saveOrders(existingOrders);

    // Auto-send WhatsApp notification asynchronously
    try {
      const phone = sanitizedOrder.customer.phone;
      if (phone) {
        const msg = buildOrderCreatedMessage(sanitizedOrder);
        sendWhatsAppMessage(phone, msg).catch((err) =>
          console.warn("[Orders API] Auto WhatsApp notification skipped:", err?.message)
        );
      }
    } catch (e) {
      console.warn("[Orders API] Auto WhatsApp error:", e);
    }

    return NextResponse.json({
      success: true,
      orderId: sanitizedOrder.orderId,
      order: sanitizedOrder,
    });
  } catch (error) {
    console.error("[Orders API] Failed to place order:", error);
    return NextResponse.json(
      { success: false, error: "فشل إرسال الطلب، يرجى المحاولة مجدداً." },
      { status: 500 }
    );
  }
}

/**
 * Protected: Admin Only - Fetch All Customer Orders
 * Zero-Leakage: Anonymous & unauthorized visitors are rejected
 */
export async function GET(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بعرض الطلبات (Unauthorized)" },
        { status: 401 }
      );
    }

    const orders = await getStoredOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("[Orders API] Failed to read orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

/**
 * Protected: Admin Only - Update Order Status / Notes
 */
export async function PATCH(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بتعديل الطلبات (Unauthorized)" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId, status, notes } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing orderId" },
        { status: 400 }
      );
    }

    const orders = await getStoredOrders();
    const orderIndex = orders.findIndex((o) => o.orderId === orderId);

    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const previousStatus = orders[orderIndex].status;

    if (status) {
      orders[orderIndex].status = sanitizeString(status, 40);
    }
    if (notes !== undefined) {
      orders[orderIndex].adminNotes = sanitizeString(notes, 500);
    }
    orders[orderIndex].updatedAt = new Date().toISOString();

    await saveOrders(orders);

    // Auto-send status update via WhatsApp if status changed
    if (status && status !== previousStatus) {
      try {
        const updatedOrder = orders[orderIndex];
        const phone = updatedOrder.customer?.phone;
        if (phone) {
          const statusMsg = buildOrderStatusUpdatedMessage(updatedOrder, status);
          if (statusMsg) {
            sendWhatsAppMessage(phone, statusMsg).catch((err) =>
              console.warn("[Orders API] Auto WhatsApp status update skipped:", err?.message)
            );
          }
        }
      } catch (e) {
        console.warn("[Orders API] Auto WhatsApp status error:", e);
      }
    }

    return NextResponse.json({
      success: true,
      order: orders[orderIndex],
    });
  } catch (error) {
    console.error("[Orders API] Failed to update order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}

/**
 * Protected: Admin Only - Delete Order
 */
export async function DELETE(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بحذف الطلبات (Unauthorized)" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing orderId" },
        { status: 400 }
      );
    }

    let orders = await getStoredOrders();
    const prevCount = orders.length;
    orders = orders.filter((o) => o.orderId !== orderId);

    if (orders.length === prevCount) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    await saveOrders(orders);

    return NextResponse.json({
      success: true,
      message: `Order ${orderId} deleted successfully`,
    });
  } catch (error) {
    console.error("[Orders API] Failed to delete order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
