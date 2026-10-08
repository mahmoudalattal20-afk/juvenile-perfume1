"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Image as ImageIcon,
  Type,
  Layers,
  LayoutDashboard,
  Save,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  RefreshCw,
  X,
  Search,
  Filter,
  Bell,
  Moon,
  Calendar,
  Mail,
  FileText,
  Users,
  Settings,
  HelpCircle,
  ChevronDown,
  ArrowUpRight,
  Droplet,
  CreditCard,
  TrendingUp,
  Award,
  ShoppingBag,
  Upload,
  Tag,
  Monitor,
  Smartphone,
  Phone,
  MessageCircle,
  Truck,
  Package,
  Clock,
  MapPin,
  Check,
  Percent,
  Copy,
  CheckCheck,
  Edit3,
  Lock,
  ShieldCheck,
  EyeOff,
  ArrowLeft,
  Key,
  Video,
  Film,
  PlayCircle,
  Star,
  Flame,
} from "lucide-react";
import { useCMS } from "@/context/CMSContext";
import {
  SiteCMSData,
  CMSHeroSlide,
  InspiredPerfume,
  CMSCoupon,
  CMSEditorialVideo,
  CMSBukhoorItem,
  CMSBukhoorSection,
  DEFAULT_BUKHOOR_ITEMS,
  DEFAULT_BUKHOOR_SECTION,
  DEFAULT_FEATURED_PRODUCT_IDS,
  DEFAULT_FEATURED_INSPIRED_PRODUCT_IDS,
} from "@/lib/cmsTypes";
import { ProductDetailData, ProductClassificationType, getProductClassification } from "@/data/products";
import styles from "./admin.module.css";

export type ProductClassification = "all" | "bestsellers" | "inspired" | ProductClassificationType;

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
  type?: string;
}

export interface CustomerOrder {
  orderId: string;
  createdAt: string;
  updatedAt?: string;
  status: "pending_confirmation" | "processing" | "shipped" | "delivered" | "cancelled";
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
  shipping?: {
    method: string;
    cost: number;
  };
  payment?: {
    method: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  adminNotes?: string;
}

const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; color: string; bg: string; borderColor: string }
> = {
  pending_confirmation: {
    label: "طلب جديد (قيد التأكيد)",
    badgeClass: styles.statusPending,
    color: "#b45309",
    bg: "#fffbeb",
    borderColor: "#fde68a",
  },
  processing: {
    label: "جاري التجهيز والتعبئة",
    badgeClass: styles.statusProcessing,
    color: "#1d4ed8",
    bg: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  shipped: {
    label: "خرج للشحن مع المندوب",
    badgeClass: styles.statusShipped,
    color: "#6d28d9",
    bg: "#f5f3ff",
    borderColor: "#ddd6fe",
  },
  delivered: {
    label: "تم الاستلام بنجاح",
    badgeClass: styles.statusDelivered,
    color: "#047857",
    bg: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  cancelled: {
    label: "طلب ملغي",
    badgeClass: styles.statusCancelled,
    color: "#b91c1c",
    bg: "#fef2f2",
    borderColor: "#fecaca",
  },
};

const CLASSIFICATION_LABELS: Record<string, { ar: string; badgeColor: string; badgeBg: string }> = {
  inspired: { ar: "عطور مستوحاة", badgeColor: "#7c3aed", badgeBg: "#ede9fe" },
  men: { ar: "رجالي", badgeColor: "#0284c7", badgeBg: "#e0f2fe" },
  women: { ar: "حريمي", badgeColor: "#db2777", badgeBg: "#fce7f3" },
  unisex: { ar: "للجنسين", badgeColor: "#0d9488", badgeBg: "#ccfbf1" },
  bukhoor: { ar: "بخور فاخر", badgeColor: "#d97706", badgeBg: "#fef3c7" },
  bodysplash: { ar: "بادي سبلاش", badgeColor: "#059669", badgeBg: "#d1fae5" },
  musk: { ar: "مسك فاخر", badgeColor: "#b45309", badgeBg: "#fef3c7" },
};

type TabView = "overview" | "products" | "coupons" | "visuals" | "copy";

function PerfumeBottleIcon({
  size = 19,
  strokeWidth = 2,
  className = "",
}: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Top Cap */}
      <rect x="9" y="2" width="6" height="3.5" rx="0.8" />
      {/* Neck Collar */}
      <line x1="10" y1="5.5" x2="14" y2="5.5" />
      <path d="M10 5.5v2.5h4v-2.5" />
      {/* Luxury Flacon Body with Elegant Shoulders */}
      <path d="M6 11a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8z" />
      {/* Center Label / Scent Emblem */}
      <circle cx="12" cy="15" r="2.2" />
    </svg>
  );
}

export default function FinexyAdminDashboard() {
  const { cmsData, isLoading, updateCMS, lastSaved } = useCMS();
  const [authStatus, setAuthStatus] = useState<"checking" | "unauthenticated" | "authenticated">("checking");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [authError, setAuthError] = useState("");

  // Admin Single Account Management State
  const [adminAccountEmail, setAdminAccountEmail] = useState("admin@juvenile.com");
  const [showAdminAccountModal, setShowAdminAccountModal] = useState(false);
  const [accountActiveTab, setAccountActiveTab] = useState<"email" | "password">("email");
  const [accountCurrentPass, setAccountCurrentPass] = useState("");
  const [accountNewEmail, setAccountNewEmail] = useState("");
  const [accountNewPass, setAccountNewPass] = useState("");
  const [accountConfirmPass, setAccountConfirmPass] = useState("");
  const [accountShowCurrentPass, setAccountShowCurrentPass] = useState(false);
  const [accountShowNewPass, setAccountShowNewPass] = useState(false);
  const [accountShowConfirmPass, setAccountShowConfirmPass] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountModalError, setAccountModalError] = useState("");
  const [activeTab, setActiveTab] = useState<TabView>("overview");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<ProductClassification>("inspired");
  const [uploadingSlideIdx, setUploadingSlideIdx] = useState<number | null>(null);
  const [uploadingMobileSlideIdx, setUploadingMobileSlideIdx] = useState<number | null>(null);
  const [uploadingHighlightIdx, setUploadingHighlightIdx] = useState<number | null>(null);
  const [isUploadingProductImg, setIsUploadingProductImg] = useState(false);

  // Local draft state
  const [draftData, setDraftData] = useState<SiteCMSData>(cmsData);

  // Coupon Management State
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [couponDraft, setCouponDraft] = useState<CMSCoupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<CMSCoupon | null>(null);
  const [couponSearchQuery, setCouponSearchQuery] = useState("");
  const [couponStatusFilter, setCouponStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);
  const [bestsellerSubFilter, setBestsellerSubFilter] = useState<string>("all");

  // Orders & Sales Live State
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<CustomerOrder | null>(null);
  const [isUpdatingOrderId, setIsUpdatingOrderId] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<CustomerOrder | null>(null);

  // WhatsApp Bot Live State
  const [whatsappInfo, setWhatsappInfo] = useState<{
    connected: boolean;
    status: string;
    qr: string | null;
    userPhone: string | null;
  }>({ connected: false, status: "disconnected", qr: null, userPhone: null });
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [testWhatsAppPhone, setTestWhatsAppPhone] = useState("");
  const [isSendingTestWhatsApp, setIsSendingTestWhatsApp] = useState(false);

  const checkWhatsAppStatus = async () => {
    try {
      const res = await fetch("/api/whatsapp", { cache: "no-store" });
      const json = await res.json();
      if (json && typeof json.connected === "boolean") {
        setWhatsappInfo({
          connected: json.connected,
          status: json.status,
          qr: json.qr || null,
          userPhone: json.userPhone || null,
        });
      }
    } catch (e) {
      console.warn("Failed to check whatsapp status:", e);
    }
  };

  useEffect(() => {
    checkWhatsAppStatus();
    const interval = setInterval(checkWhatsAppStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleWhatsAppLogout = async () => {
    try {
      await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      triggerToast("تم تسجيل الخروج، جاري إنشاء رمز QR جديد...");
      checkWhatsAppStatus();
    } catch {
      triggerToast("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  const handleSendTestWhatsApp = async () => {
    if (!testWhatsAppPhone.trim()) {
      triggerToast("يرجى إدخال رقم الموبايل للتجربة أولاً");
      return;
    }
    setIsSendingTestWhatsApp(true);
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          phone: testWhatsAppPhone.trim(),
          message: "🌸 مرحباً بك! هذه رسالة تجريبية أوتوماتيكية من متجر جوفينيل للعطور ✨\nتم ربط البوت بنجاح وكل شيء يعمل بكفاءة!",
        }),
      });
      const json = await res.json();
      if (json.success) {
        triggerToast("✓ تم إرسال الرسالة التجريبية بنجاح إلى هاتفك!");
      } else {
        triggerToast(json.error || "فشل إرسال الرسالة");
      }
    } catch {
      triggerToast("تعذر الاتصال بخدمة الواتساب");
    } finally {
      setIsSendingTestWhatsApp(false);
    }
  };

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.orders)) {
        setOrders(json.orders);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: CustomerOrder["status"]) => {
    setIsUpdatingOrderId(orderId);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o))
        );
        if (selectedOrderForModal?.orderId === orderId) {
          setSelectedOrderForModal((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        triggerToast(`✓ تم تحديث حالة الطلب (${orderId}) إلى: ${ORDER_STATUS_CONFIG[newStatus]?.label || newStatus}`);
      } else {
        triggerToast("حدث خطأ أثناء تحديث حالة الطلب");
      }
    } catch (err) {
      console.error("Error updating order:", err);
      triggerToast("تعذر الاتصال بالخادم لتحديث الطلب");
    } finally {
      setIsUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders?orderId=${encodeURIComponent(orderId)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
        setOrderToDelete(null);
        if (selectedOrderForModal?.orderId === orderId) {
          setSelectedOrderForModal(null);
        }
        triggerToast(`✓ تم حذف الطلب (${orderId}) بنجاح`);
      } else {
        triggerToast("حدث خطأ أثناء حذف الطلب");
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      triggerToast("تعذر الاتصال بالخادم لحذف الطلب");
    }
  };

  const handleUploadBannerImage = async (slideIndex: number, file: File) => {
    setUploadingSlideIdx(slideIndex);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        updateDraft((prev) => {
          const copy = [...prev.heroSlides];
          copy[slideIndex] = { ...copy[slideIndex], imageSrc: json.url };
          return { ...prev, heroSlides: copy };
        });
        triggerToast("✓ تم رفع وتحديث صورة الديسكتوب بجودتها الأصلية!");
      } else {
        throw new Error(json.error || "Upload failed");
      }
    } catch (err) {
      console.warn("Upload failed, falling back to local preview", err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateDraft((prev) => {
            const copy = [...prev.heroSlides];
            copy[slideIndex] = { ...copy[slideIndex], imageSrc: reader.result as string };
            return { ...prev, heroSlides: copy };
          });
          triggerToast("✓ تم تحديث صورة الديسكتوب بنجاح!");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingSlideIdx(null);
    }
  };

  const handleUploadBannerMobileImage = async (slideIndex: number, file: File) => {
    setUploadingMobileSlideIdx(slideIndex);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        updateDraft((prev) => {
          const copy = [...prev.heroSlides];
          copy[slideIndex] = { ...copy[slideIndex], mobileImageSrc: json.url };
          return { ...prev, heroSlides: copy };
        });
        triggerToast("✓ تم رفع وتحديث صورة الهاتف بجودتها الأصلية!");
      } else {
        throw new Error(json.error || "Upload failed");
      }
    } catch (err) {
      console.warn("Upload failed, falling back to local preview", err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateDraft((prev) => {
            const copy = [...prev.heroSlides];
            copy[slideIndex] = { ...copy[slideIndex], mobileImageSrc: reader.result as string };
            return { ...prev, heroSlides: copy };
          });
          triggerToast("✓ تم تحديث صورة الهاتف بنجاح!");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingMobileSlideIdx(null);
    }
  };

  const handleUploadHighlightImage = async (cardIndex: number, file: File) => {
    setUploadingHighlightIdx(cardIndex);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        updateDraft((prev) => {
          const copy = [...prev.highlights];
          copy[cardIndex] = { ...copy[cardIndex], image: json.url };
          return { ...prev, highlights: copy };
        });
        triggerToast("✓ تم رفع وتحديث صورة القسم بنجاح!");
      } else {
        throw new Error(json.error || "Upload failed");
      }
    } catch (err) {
      console.warn("Upload failed, falling back to local preview", err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateDraft((prev) => {
            const copy = [...prev.highlights];
            copy[cardIndex] = { ...copy[cardIndex], image: reader.result as string };
            return { ...prev, highlights: copy };
          });
          triggerToast("✓ تم تحديث صورة القسم بنجاح!");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingHighlightIdx(null);
    }
  };

  const [isUploadingMuskBanner, setIsUploadingMuskBanner] = useState(false);

  const handleUploadMuskBanner = async (file: File) => {
    setIsUploadingMuskBanner(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        updateDraft((prev) => ({
          ...prev,
          muskPage: {
            ...(prev.muskPage || {}),
            bannerImage: json.url,
          },
        }));
        triggerToast("✓ تم رفع وتحديث غلاف صفحة المسك بنجاح!");
      } else {
        throw new Error(json.error || "Upload failed");
      }
    } catch (err) {
      console.warn("Upload failed, falling back to local preview", err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateDraft((prev) => ({
            ...prev,
            muskPage: {
              ...(prev.muskPage || {}),
              bannerImage: reader.result as string,
            },
          }));
          triggerToast("✓ تم تحديث غلاف صفحة المسك بنجاح!");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingMuskBanner(false);
    }
  };

  const [isUploadingBukhoorBanner, setIsUploadingBukhoorBanner] = useState(false);
  const [uploadingBukhoorItemIdx, setUploadingBukhoorItemIdx] = useState<number | null>(null);

  const handleUploadBukhoorBanner = async (file: File) => {
    setIsUploadingBukhoorBanner(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        updateDraft((prev) => ({
          ...prev,
          bukhoorSection: {
            ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION),
            bannerImage: json.url,
          },
        }));
        triggerToast("✓ تم رفع وتحديث غلاف قسم البخور بنجاح!");
      } else {
        throw new Error(json.error || "Upload failed");
      }
    } catch (err) {
      console.warn("Upload failed, falling back to local preview", err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateDraft((prev) => ({
            ...prev,
            bukhoorSection: {
              ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION),
              bannerImage: reader.result as string,
            },
          }));
          triggerToast("✓ تم تحديث غلاف قسم البخور بنجاح!");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingBukhoorBanner(false);
    }
  };

  const handleUploadBukhoorItemImage = async (itemIndex: number, file: File) => {
    setUploadingBukhoorItemIdx(itemIndex);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        updateDraft((prev) => {
          const currentItems = [
            ...(prev.bukhoorSection?.items || DEFAULT_BUKHOOR_ITEMS),
          ];
          currentItems[itemIndex] = {
            ...currentItems[itemIndex],
            image: json.url,
          };
          return {
            ...prev,
            bukhoorSection: {
              ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION),
              items: currentItems,
            },
          };
        });
        triggerToast("✓ تم رفع وتحديث صورة منتج البخور بنجاح!");
      } else {
        throw new Error(json.error || "Upload failed");
      }
    } catch (err) {
      console.warn("Upload failed, falling back to local preview", err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateDraft((prev) => {
            const currentItems = [
              ...(prev.bukhoorSection?.items || DEFAULT_BUKHOOR_ITEMS),
            ];
            currentItems[itemIndex] = {
              ...currentItems[itemIndex],
              image: reader.result as string,
            };
            return {
              ...prev,
              bukhoorSection: {
                ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION),
                items: currentItems,
              },
            };
          });
          triggerToast("✓ تم تحديث صورة منتج البخور بنجاح!");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingBukhoorItemIdx(null);
    }
  };

  const [uploadingVideoIdx, setUploadingVideoIdx] = useState<number | null>(null);

  const handleUploadEditorialVideo = async (videoIndex: number, file: File) => {
    setUploadingVideoIdx(videoIndex);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload-video", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        updateDraft((prev) => {
          const list = [...(prev.editorialVideos || [])];
          list[videoIndex] = { ...list[videoIndex], src: json.url };
          return { ...prev, editorialVideos: list };
        });
        triggerToast("✓ تم رفع وتحديث الفيديو بنجاح!");
      } else {
        throw new Error(json.error || "Upload failed");
      }
    } catch (err: any) {
      console.warn("Video upload failed", err);
      triggerToast(err?.message || "تعذر رفع الفيديو. تأكد أن الملف MP4 أو WebM وحجمه أقل من 50MB");
    } finally {
      setUploadingVideoIdx(null);
    }
  };

  const handleUploadProductImage = async (file: File) => {
    setIsUploadingProductImg(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        setEditingProductDraft((prev) => (prev ? { ...prev, image: json.url } : null));
        triggerToast("✓ تم رفع وتحديث صورة العطر بنجاح!");
      } else {
        throw new Error(json.error || "Upload failed");
      }
    } catch (err) {
      console.warn("Upload failed, falling back to local preview", err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setEditingProductDraft((prev) => (prev ? { ...prev, image: reader.result as string } : null));
          triggerToast("✓ تم تحديث صورة العطر بنجاح!");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingProductImg(false);
    }
  };

  // Top Header Popups
  const [activeHeaderPopup, setActiveHeaderPopup] = useState<"search" | "notifications" | "profile" | null>(null);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [notificationsList, setNotificationsList] = useState([
    {
      id: "n1",
      title: "أوردر جديد تم تسجيله الآن",
      desc: "عطر HALF MILLION (100 مل) - العميل: أحمد سمير (القاهرة)",
      time: "منذ 10 دقائق",
      unread: true,
    },
    {
      id: "n2",
      title: "تنبيه المخزون المتبقي",
      desc: "متبقي 14 إزازة فقط من عطر HOMMAGE 1744",
      time: "منذ ساعتين",
      unread: true,
    },
    {
      id: "n3",
      title: "تأكيد عملية دفع",
      desc: "استلام 1,250 ج.م عبر إنستاباي - أوردر #1042",
      time: "اليوم 03:15 م",
      unread: true,
    },
  ]);

  // Graph Interactive State
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(5); // default June peak

  const salesMonthlyData = [
    { month: "يناير", en: "Jan", x: 30, y: 118, amount: "42,800", sales: "42,800 ج.م", bottles: "38 زجاجة", growth: "+12%" },
    { month: "فبراير", en: "Feb", x: 98, y: 98, amount: "68,400", sales: "68,400 ج.م", bottles: "58 زجاجة", growth: "+18%" },
    { month: "مارس", en: "Mar", x: 160, y: 108, amount: "59,200", sales: "59,200 ج.م", bottles: "51 زجاجة", growth: "-4%" },
    { month: "أبريل", en: "Apr", x: 222, y: 72, amount: "94,500", sales: "94,500 ج.م", bottles: "80 زجاجة", growth: "+22%" },
    { month: "مايو", en: "May", x: 285, y: 52, amount: "116,000", sales: "116,000 ج.م", bottles: "98 زجاجة", growth: "+26%" },
    { month: "يونيو", en: "Jun", x: 348, y: 18, amount: "148,600", sales: "148,600 ج.م", bottles: "124 زجاجة", growth: "+34% (الذروة 🔥)", peak: true },
    { month: "يوليو", en: "Jul", x: 410, y: 44, amount: "122,800", sales: "122,800 ج.م", bottles: "105 زجاجة", growth: "+14%" },
    { month: "أغسطس", en: "Aug", x: 475, y: 28, amount: "139,400", sales: "139,400 ج.م", bottles: "118 زجاجة", growth: "+28%" },
  ];

  // Product modal
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingProductDraft, setEditingProductDraft] = useState<ProductDetailData | null>(null);

  // Inspired Perfumes Section State & Handlers
  const [editingInspiredId, setEditingInspiredId] = useState<string | null>(null);
  const [editingInspiredDraft, setEditingInspiredDraft] = useState<InspiredPerfume | null>(null);
  const [isCreatingInspired, setIsCreatingInspired] = useState(false);
  const [isUploadingInspiredImg, setIsUploadingInspiredImg] = useState(false);
  const [deleteInspiredConfirmId, setDeleteInspiredConfirmId] = useState<string | null>(null);

  const openCreateInspiredModal = () => {
    const newId = `inspired-${Date.now()}`;
    setEditingInspiredId(newId);
    setIsCreatingInspired(true);
    setEditingInspiredDraft({
      id: newId,
      name: "JUVENILE NO. " + (Object.keys(draftData.inspiredProducts || {}).length + 1),
      arabicName: "جوفينيل مستوحى",
      inspiredByAr: "",
      inspiredByEn: "",
      price: 1250,
      originalPrice: 1650,
      formattedPrice: { ar: "1,250 ج.م", en: "1,250 LE" },
      formattedOriginalPrice: { ar: "1,650 ج.م", en: "1,650 LE" },
      volume: "100 ml",
      concentrationAr: "خلاصة عطر نقي • Extrait de Parfum",
      concentrationEn: "Extrait de Parfum",
      image: "/products/half-million.jpg",
      descriptionAr: "عطر فاخر مستوحى بتركيز Extrait de Parfum وثبات استثنائي يتجاوز 24 ساعة.",
      descriptionEn: "Luxury inspired extrait de parfum formulation with phenomenal sillage and persistence.",
      inStock: true,
    });
  };

  const openEditInspiredModal = (id: string) => {
    const item = draftData.inspiredProducts?.[id];
    if (item) {
      setEditingInspiredId(id);
      setIsCreatingInspired(false);
      setEditingInspiredDraft({ ...item });
    }
  };

  const handleUploadInspiredImage = async (file: File) => {
    setIsUploadingInspiredImg(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success && json.url) {
        setEditingInspiredDraft((prev) => (prev ? { ...prev, image: json.url } : null));
        triggerToast("✓ تم رفع صورة الزجاجة بنجاح!");
      } else {
        throw new Error(json.error || "Upload failed");
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setEditingInspiredDraft((prev) => (prev ? { ...prev, image: reader.result as string } : null));
          triggerToast("✓ تم تحديث صورة الزجاجة بنجاح!");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingInspiredImg(false);
    }
  };

  const saveInspiredModal = async () => {
    if (!editingInspiredDraft || !editingInspiredId) return;
    const priceNum = Number(editingInspiredDraft.price) || 0;
    const oldPriceNum = editingInspiredDraft.originalPrice ? Number(editingInspiredDraft.originalPrice) : undefined;
    const formattedDraft: InspiredPerfume = {
      ...editingInspiredDraft,
      price: priceNum,
      originalPrice: oldPriceNum,
      formattedPrice: {
        ar: `${priceNum.toLocaleString("en-US")} ج.م`,
        en: `${priceNum.toLocaleString("en-US")} LE`,
      },
      formattedOriginalPrice: oldPriceNum ? {
        ar: `${oldPriceNum.toLocaleString("en-US")} ج.م`,
        en: `${oldPriceNum.toLocaleString("en-US")} LE`,
      } : undefined,
    };

    const nextInspired = {
      ...(draftData.inspiredProducts || {}),
      [editingInspiredId]: formattedDraft,
    };
    const updated: SiteCMSData = {
      ...draftData,
      inspiredProducts: nextInspired,
    };
    setDraftData(updated);
    setEditingInspiredId(null);
    setEditingInspiredDraft(null);
    setIsCreatingInspired(false);
    const success = await updateCMS(updated);
    if (success) {
      triggerToast(`✓ تم حفظ ونشر زجاجة العطر المستوحى "${formattedDraft.arabicName}" بنجاح!`);
    } else {
      triggerToast("حصل خطأ أثناء الحفظ، يرجى المحاولة ثانية.");
    }
  };

  const deleteInspiredPerfume = async (id: string) => {
    const nextInspired = { ...(draftData.inspiredProducts || {}) };
    delete nextInspired[id];
    const nextDeleted = Array.from(
      new Set([...(draftData.deletedInspiredProducts || []), ...(draftData.deletedProducts || []), id])
    );
    const updated: SiteCMSData = {
      ...draftData,
      inspiredProducts: nextInspired,
      deletedInspiredProducts: nextDeleted,
      deletedProducts: nextDeleted,
    };
    setDraftData(updated);
    setDeleteInspiredConfirmId(null);
    if (editingInspiredId === id) {
      setEditingInspiredId(null);
      setEditingInspiredDraft(null);
    }
    const success = await updateCMS(updated);
    if (success) {
      triggerToast("✓ تم حذف زجاجة العطر المستوحى بنجاح!");
    } else {
      triggerToast("حصل خطأ أثناء الحذف.");
    }
  };

  // =========================================================
  // COUPON SYSTEM HANDLERS
  // =========================================================
  const openCreateCouponModal = () => {
    const newCoupon: CMSCoupon = {
      id: `coupon-${Date.now()}`,
      code: "",
      descriptionAr: "",
      type: "percent",
      value: 10,
      minOrderAmount: 0,
      isActive: true,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      expiresAt: undefined,
    };
    setCouponDraft(newCoupon);
    setEditingCouponId("new");
  };

  const openEditCouponModal = (couponId: string) => {
    const target = (draftData.coupons || {})[couponId];
    if (target) {
      setCouponDraft({ ...target });
      setEditingCouponId(couponId);
    }
  };

  const handleToggleCouponStatus = async (couponId: string) => {
    const currentCoupons = { ...(draftData.coupons || {}) };
    const target = currentCoupons[couponId];
    if (!target) return;
    const nextStatus = !target.isActive;
    const updatedCoupons = {
      ...currentCoupons,
      [couponId]: {
        ...target,
        isActive: nextStatus,
      },
    };
    const updatedDraft: SiteCMSData = {
      ...draftData,
      coupons: updatedCoupons,
    };
    setDraftData(updatedDraft);
    const success = await updateCMS(updatedDraft);
    if (success) {
      triggerToast(nextStatus ? `✓ تم تفعيل كود الخصم "${target.code}" بنجاح!` : `تم إيقاف كود الخصم "${target.code}"`);
    } else {
      triggerToast("حدث خطأ أثناء تحديث حالة الكوبون");
    }
  };

  const handleSaveCoupon = async () => {
    if (!couponDraft) return;
    const cleanCode = (couponDraft.code || "").trim().toUpperCase().replace(/\s+/g, "");
    if (!cleanCode) {
      alert("يرجى إدخال كود الخصم (مثال: JUVENILE10)");
      return;
    }
    const valNum = Number(couponDraft.value) || 0;
    if (valNum <= 0) {
      alert("يرجى تحديد قيمة خصم أكبر من صفر");
      return;
    }
    if (couponDraft.type === "percent" && valNum > 100) {
      alert("نسبة الخصم لا يمكن أن تتجاوز 100%");
      return;
    }

    const currentCoupons = { ...(draftData.coupons || {}) };
    const targetId = editingCouponId === "new" ? cleanCode : (couponDraft.id || cleanCode);

    if (editingCouponId === "new" && currentCoupons[cleanCode]) {
      alert("كود الخصم هذا مسجل بالفعل مسبقاً! يمكنك تعديله بدلاً من تكراره.");
      return;
    }

    const updatedCoupon: CMSCoupon = {
      ...couponDraft,
      id: targetId,
      code: cleanCode,
      value: valNum,
      minOrderAmount: Math.max(0, Number(couponDraft.minOrderAmount || 0)),
      usageCount: couponDraft.usageCount || 0,
      createdAt: couponDraft.createdAt || new Date().toISOString(),
      expiresAt: couponDraft.expiresAt && couponDraft.expiresAt.trim() ? couponDraft.expiresAt.trim() : undefined,
    };

    const nextCoupons = {
      ...currentCoupons,
      [targetId]: updatedCoupon,
    };

    const updatedDraft: SiteCMSData = {
      ...draftData,
      coupons: nextCoupons,
    };
    setDraftData(updatedDraft);
    setEditingCouponId(null);
    setCouponDraft(null);

    const success = await updateCMS(updatedDraft);
    if (success) {
      triggerToast(`✓ تم حفظ ونشر كود الخصم "${cleanCode}" بنجاح!`);
    } else {
      triggerToast("تم الحفظ في المسودة، اضغط حفظ ونشر التعديلات");
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    const currentCoupons = { ...(draftData.coupons || {}) };
    const codeName = currentCoupons[couponId]?.code || couponId;
    delete currentCoupons[couponId];

    const updatedDraft: SiteCMSData = {
      ...draftData,
      coupons: currentCoupons,
    };
    setDraftData(updatedDraft);
    setCouponToDelete(null);

    const success = await updateCMS(updatedDraft);
    if (success) {
      triggerToast(`✓ تم حذف كود الخصم "${codeName}" بنجاح`);
    } else {
      triggerToast("حدث خطأ أثناء حذف الكوبون");
    }
  };

  const copyCouponToClipboard = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCouponCode(text);
      setTimeout(() => setCopiedCouponCode(null), 2000);
      triggerToast(`✓ تم نسخ كود الخصم "${text}"`);
    }
  };

  useEffect(() => {
    if (cmsData) {
      setDraftData(cmsData);
    }
  }, [cmsData]);

  // Auth check with resilient timeout
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setAuthStatus((prev) => (prev === "checking" ? "unauthenticated" : prev));
      }
    }, 2500);

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth", {
          signal: controller.signal,
          cache: "no-store",
        });
        const json = await res.json();
        if (isMounted) {
          clearTimeout(timeoutId);
          setAuthStatus(json.isAuthenticated ? "authenticated" : "unauthenticated");
          if (json.isAuthenticated && json.user?.email) {
            setAdminAccountEmail(json.user.email);
          }
        }
      } catch {
        if (isMounted) {
          clearTimeout(timeoutId);
          setAuthStatus("unauthenticated");
        }
      }
    };
    checkAuth();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUpdateAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountModalError("");

    const currentPassClean = accountCurrentPass.trim();
    if (!currentPassClean) {
      setAccountModalError("يرجى إدخال كلمة المرور الحالية لتأكيد هويتك");
      return;
    }

    if (accountActiveTab === "email") {
      const emailClean = accountNewEmail.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailClean || !emailRegex.test(emailClean)) {
        setAccountModalError("يرجى إدخال بريد إلكتروني صالح");
        return;
      }
      if (emailClean === adminAccountEmail.toLowerCase()) {
        setAccountModalError("البريد الإلكتروني الجديد مطابق للبريد الحالي");
        return;
      }

      setIsSavingAccount(true);
      try {
        const res = await fetch("/api/admin/account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "change_email",
            currentPassword: currentPassClean,
            newEmail: emailClean,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setAdminAccountEmail(emailClean);
          setShowAdminAccountModal(false);
          setAccountCurrentPass("");
          setAccountNewEmail("");
          triggerToast("✓ تم تغيير البريد الإلكتروني بنجاح");
        } else {
          setAccountModalError(data.error || "فشل تحديث البريد الإلكتروني");
        }
      } catch {
        setAccountModalError("تعذر الاتصال بالخادم لحفظ التعديلات");
      } finally {
        setIsSavingAccount(false);
      }
    } else {
      // Password change
      const newPassClean = accountNewPass.trim();
      const confirmPassClean = accountConfirmPass.trim();

      if (!newPassClean || newPassClean.length < 6) {
        setAccountModalError("كلمة المرور الجديدة يجب أن تكون 6 أحرف أو أرقام على الأقل");
        return;
      }
      if (newPassClean !== confirmPassClean) {
        setAccountModalError("تأكيد كلمة المرور غير متطابق مع كلمة المرور الجديدة");
        return;
      }
      if (newPassClean === currentPassClean) {
        setAccountModalError("كلمة المرور الجديدة يجب ألا تكون مطابقة لكلمة المرور الحالية");
        return;
      }

      setIsSavingAccount(true);
      try {
        const res = await fetch("/api/admin/account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "change_password",
            currentPassword: currentPassClean,
            newPassword: newPassClean,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setShowAdminAccountModal(false);
          setAccountCurrentPass("");
          setAccountNewPass("");
          setAccountConfirmPass("");
          triggerToast("✓ تم تغيير كلمة المرور بنجاح");
        } else {
          setAccountModalError(data.error || "فشل تحديث كلمة المرور");
        }
      } catch {
        setAccountModalError("تعذر الاتصال بالخادم لحفظ التعديلات");
      } finally {
        setIsSavingAccount(false);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const emailTrimmed = adminEmail.trim();
    const passTrimmed = adminPassword.trim();

    if (!emailTrimmed || !passTrimmed) {
      setAuthError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setIsSubmittingLogin(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrimmed, password: passTrimmed }),
      });
      const json = await res.json();
      if (json.success) {
        setAuthStatus("authenticated");
        setAdminAccountEmail(emailTrimmed);
        triggerToast("تم تسجيل الدخول بنجاح");
        return;
      } else {
        setAuthError(json.error || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
        return;
      }
    } catch {
      setAuthError("تعذر الاتصال بالخادم، يرجى التحقق من اتصالك والمحاولة مجدداً");
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setAuthStatus("unauthenticated");
    } catch {
      setAuthStatus("unauthenticated");
    }
  };

  const handleGlobalSave = async () => {
    setIsSavingLocal(true);
    const success = await updateCMS(draftData);
    setIsSavingLocal(false);
    if (success) {
      triggerToast("✓ تم حفظ ونشر جميع التعديلات بنجاح");
    } else {
      triggerToast("حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى");
    }
  };

  const updateDraft = (updater: (prev: SiteCMSData) => SiteCMSData) => {
    setDraftData((prev) => updater(prev));
  };

  const toggleFeaturedProduct = async (productId: string) => {
    const current = draftData.featuredProductIds || DEFAULT_FEATURED_PRODUCT_IDS;
    const isCurrentlyFeatured = current.includes(productId);
    const updated = isCurrentlyFeatured
      ? current.filter((id) => id !== productId)
      : [...current, productId];

    const nextDraft = {
      ...draftData,
      featuredProductIds: updated,
    };
    setDraftData(nextDraft);
    await updateCMS(nextDraft);
    triggerToast(
      isCurrentlyFeatured
        ? "تمت إزالة المنتج من سيكشن اختياراتنا المميزة بنجاح"
        : "✓ تمت إضافة المنتج إلى سيكشن اختياراتنا المميزة وحفظ التعديل فوراً"
    );
  };

  const excludeMuskFromBestsellers = async () => {
    const current = draftData.featuredProductIds || DEFAULT_FEATURED_PRODUCT_IDS;
    const muskIds = new Set([
      "harim-alsultan",
      "misk-elroman",
      "misk-tahara",
      "dalaa-elbanat",
      "white-oud",
      ...Object.entries(draftData.products || {})
        .filter(([_, p]) => getProductClassification(p) === "musk")
        .map(([id]) => id),
    ]);
    const updated = current.filter((id) => !muskIds.has(id));
    const nextDraft = {
      ...draftData,
      featuredProductIds: updated,
    };
    setDraftData(nextDraft);
    await updateCMS(nextDraft);
    triggerToast("✓ تم استبعاد جميع منتجات المسك من سيكشن اختياراتنا المميزة بنجاح وحفظ التعديل!");
  };

  const resetBestsellersToDefault = async () => {
    const nextDraft = {
      ...draftData,
      featuredProductIds: DEFAULT_FEATURED_PRODUCT_IDS,
    };
    setDraftData(nextDraft);
    await updateCMS(nextDraft);
    triggerToast("👑 تمت استعادة العطور الملكية فقط في اختياراتنا المميزة بنجاح!");
  };

  const toggleFeaturedInspiredProduct = async (inspiredId: string) => {
    const current = draftData.featuredInspiredProductIds || DEFAULT_FEATURED_INSPIRED_PRODUCT_IDS;
    const isCurrentlyFeatured = current.includes(inspiredId);
    const updated = isCurrentlyFeatured
      ? current.filter((id) => id !== inspiredId)
      : [...current, inspiredId];

    const nextDraft = {
      ...draftData,
      featuredInspiredProductIds: updated,
    };
    setDraftData(nextDraft);
    await updateCMS(nextDraft);
    triggerToast(
      isCurrentlyFeatured
        ? "تمت إزالة العطر من سيكشن المستوحاة بالصفحة الرئيسية"
        : "✓ تمت إضافة العطر لسيكشن المستوحاة بالصفحة الرئيسية وحفظ التعديل فوراً"
    );
  };

  const resetFeaturedInspiredToDefault = async () => {
    const nextDraft = {
      ...draftData,
      featuredInspiredProductIds: DEFAULT_FEATURED_INSPIRED_PRODUCT_IDS,
    };
    setDraftData(nextDraft);
    await updateCMS(nextDraft);
    triggerToast("👑 تمت استعادة أفضل 6 عطور مستوحاة في الصفحة الرئيسية بنجاح!");
  };

  const openProductModal = (id: string) => {
    const prod = draftData.products[id];
    if (prod) {
      setEditingProductId(id);
      setEditingProductDraft(JSON.parse(JSON.stringify(prod)));
    }
  };

  const openCreateProductModal = () => {
    const newId = `product-${Date.now().toString().slice(-6)}`;
    const initialCls: ProductClassificationType =
      selectedCategoryFilter === "musk" ||
      selectedCategoryFilter === "men" ||
      selectedCategoryFilter === "women" ||
      selectedCategoryFilter === "unisex" ||
      selectedCategoryFilter === "bukhoor" ||
      selectedCategoryFilter === "bodysplash"
        ? selectedCategoryFilter
        : "unisex";

    const newProd: ProductDetailData = {
      id: newId,
      name: initialCls === "musk" ? "NEW MUSK ELIXIR" : "NEW JUVENILE FRAGRANCE",
      arabicName: initialCls === "musk" ? "مسك فاخر جديد" : "عطر جوفينيل جديد",
      category: {
        ar: initialCls === "musk" ? "مجموعة المسك الفاخر" : "مجموعة العطور الفاخرة",
        en: initialCls === "musk" ? "Exclusive Musk Collection" : "Luxury Atelier Collection",
      },
      classification: initialCls,
      relatedProductIds: [],
      concentration: { ar: "خلاصة عطر نقي • Extrait de Parfum", en: "Extrait de Parfum • Pure Extract" },
      tagline: { ar: "توليفة نيش استثنائية تعكس الفخامة الفرنسية المعاصرة", en: "An exceptional niche composition embodying contemporary French luxury" },
      description: { ar: "عطر فاخر مصنوع بعناية فائقة من أنقى الخلاصات الطبيعية بثبات استثنائي يدوم لأيام.", en: "A bespoke luxury fragrance formulated with the purest natural essences and phenomenal longevity." },
      price: 1850,
      formattedPrice: { ar: "1,850 ج.م", en: "1,850 LE" },
      price50ml: 1250,
      formattedPrice50ml: { ar: "1,250 ج.م", en: "1,250 LE" },
      image: "/products/half-million.webp",
      gallery: ["/products/half-million.webp"],
      rating: 4.9,
      reviewsCount: 1,
      pyramid: {
        topNotes: { ar: "برغموت، هيل، زعفران", en: "Bergamot, Cardamom, Saffron" },
        heartNotes: { ar: "أخشاب الأرز، لافندر فرنسي", en: "Cedarwood, French Lavender" },
        baseNotes: { ar: "عنبر أسود، فانيليا مدغشقر، مسك", en: "Black Amber, Madagascar Vanilla, Musk" },
      },
      specs: {
        longevity: { ar: "ثبات هائل +24 ساعة", en: "Massive 24h+" },
        sillage: { ar: "فوحان قوي مميز", en: "Heavy Signature Sillage" },
        gender: { ar: "للجنسين", en: "Unisex" },
        season: { ar: "جميع الفصول", en: "All Seasons" },
        origin: { ar: "صُنع في فرنسا", en: "Crafted in France" },
      },
    };
    setEditingProductId(newId);
    setEditingProductDraft(newProd);
  };

  const saveProductModal = () => {
    if (editingProductId && editingProductDraft) {
      updateDraft((prev) => ({
        ...prev,
        products: {
          ...prev.products,
          [editingProductId]: editingProductDraft,
        },
      }));
      setEditingProductId(null);
      setEditingProductDraft(null);
      triggerToast(`✓ تمام، سعر وتفاصيل عطر ${editingProductDraft.arabicName} اتعدلت بنجاح!`);
    }
  };

  // Product deletion state & confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const promptDeleteProduct = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setDeleteConfirmId(id);
  };

  const confirmDeleteProduct = async () => {
    if (!deleteConfirmId) return;
    const targetId = deleteConfirmId;
    const prod = draftData.products?.[targetId];
    const prodName = prod ? prod.arabicName : targetId;

    setIsDeleting(true);

    const nextProducts = { ...(draftData.products || {}) };
    delete nextProducts[targetId];

    const nextDeletedProducts = Array.from(
      new Set([...(draftData.deletedProducts || []), targetId])
    );

    const updatedDraft: SiteCMSData = {
      ...draftData,
      products: nextProducts,
      deletedProducts: nextDeletedProducts,
    };

    setDraftData(updatedDraft);

    // Save immediately and durably to CMS content
    const success = await updateCMS(updatedDraft);
    setIsDeleting(false);
    setDeleteConfirmId(null);

    if (editingProductId === targetId) {
      setEditingProductId(null);
      setEditingProductDraft(null);
    }

    if (success) {
      triggerToast(`✓ تم حذف عطر "${prodName}" بنجاح من المتجر ولوحة التحكم.`);
    } else {
      triggerToast(`حصل خطأ أثناء حذف العطر، يرجى المحاولة مرة ثانية.`);
    }
  };

  // Checking Auth state
  if (authStatus === "checking" || (authStatus === "authenticated" && isLoading)) {
    return (
      <div className={styles.adminGateWrapper} dir="rtl">
        <div className={styles.adminGateCard} style={{ padding: "50px 36px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div className={styles.adminGateLogoWrapper}>
            <Image
              src="/logo.png"
              alt="JUVENILE Haute Parfumerie"
              width={160}
              height={44}
              priority
              className={styles.adminGateLogo}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748b", fontSize: 13 }}>
            <RefreshCw size={16} className={styles.spinIcon} style={{ color: "#0f172a" }} />
            <span>جاري التحقق من الصلاحيات الإدارية...</span>
          </div>
          <button
            type="button"
            onClick={() => setAuthStatus("unauthenticated")}
            style={{
              background: "none",
              border: "none",
              color: "#0750cd",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
              marginTop: 4,
            }}
          >
            الانتقال المباشر لشاشة تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  // Executive Login Screen (Haute Parfumerie Light Luxury Spec)
  if (authStatus === "unauthenticated") {
    return (
      <div className={styles.adminGateWrapper} dir="rtl">
        <div className={styles.adminGateCard}>
          <div className={styles.adminGateLogoWrapper}>
            <Image
              src="/logo.png"
              alt="JUVENILE Haute Parfumerie"
              width={180}
              height={48}
              priority
              className={styles.adminGateLogo}
            />
          </div>

          <form onSubmit={handleLogin} className={styles.adminGateForm}>
            {/* Admin Email Field */}
            <div className={styles.adminGateInputGroup}>
              <label htmlFor="adminEmail" className={styles.adminGateLabel}>
                <Mail size={13} color="#64748b" />
                <span>البريد الإلكتروني للإدارة</span>
              </label>

              <div className={styles.adminGateInputWrapper}>
                <input
                  id="adminEmail"
                  type="email"
                  className={styles.adminGateInput}
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  autoFocus
                  required
                  disabled={isSubmittingLogin}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Admin Password Field */}
            <div className={styles.adminGateInputGroup}>
              <label htmlFor="adminPassword" className={styles.adminGateLabel}>
                <Lock size={13} color="#64748b" />
                <span>كلمة المرور</span>
              </label>

              <div className={styles.adminGateInputWrapper}>
                <input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  className={styles.adminGateInput}
                  style={{ letterSpacing: showPassword ? "normal" : "0.15em" }}
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  disabled={isSubmittingLogin}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={styles.adminGateEyeBtn}
                  tabIndex={-1}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {authError && (
              <div className={styles.adminGateError}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className={styles.adminGateSubmitBtn}
              disabled={isSubmittingLogin}
            >
              {isSubmittingLogin ? (
                <>
                  <RefreshCw size={16} className={styles.spinIcon} />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filter products by search and category
  const productEntries = Object.entries(draftData.products || {}).filter(([id, p]) => {
    if (selectedCategoryFilter !== "all" && selectedCategoryFilter !== "bestsellers") {
      const cls = getProductClassification(p);
      if (cls !== selectedCategoryFilter) return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.arabicName.includes(q) ||
      p.category.ar.includes(q)
    );
  });

  const isAnyModalOpen = Boolean(
    editingProductId ||
    editingProductDraft ||
    editingInspiredDraft ||
    editingInspiredId ||
    editingCouponId ||
    couponDraft ||
    selectedOrderForModal ||
    showWhatsAppModal ||
    showAdminAccountModal ||
    deleteConfirmId ||
    deleteInspiredConfirmId ||
    orderToDelete ||
    couponToDelete
  );

  return (
    <div className={styles.canvasWrapper} dir="rtl">
      {/* Floating Main Frame */}
      <div className={styles.appFrame}>
        {/* =========================================================
            1. LEFT SLIM ICON RAIL
            ========================================================= */}
        <aside className={styles.iconRail}>
          <div className={styles.railTop}>
            <div className={styles.railNav}>
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`${styles.railIconBtn} ${activeTab === "overview" ? styles.railIconBtnActive : ""}`}
                title="الرئيسية والمبيعات"
              >
                <LayoutDashboard size={19} />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("products")}
                className={`${styles.railIconBtn} ${activeTab === "products" ? styles.railIconBtnActive : ""}`}
                title="العطور والأسعار"
              >
                <PerfumeBottleIcon size={19} strokeWidth={activeTab === "products" ? 2.4 : 1.8} />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("coupons")}
                className={`${styles.railIconBtn} ${activeTab === "coupons" ? styles.railIconBtnActive : ""}`}
                title="أكواد الخصم والكوبونات"
              >
                <Tag size={19} />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("visuals")}
                className={`${styles.railIconBtn} ${activeTab === "visuals" ? styles.railIconBtnActive : ""}`}
                title="الصور والبانرات"
              >
                <ImageIcon size={19} />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("copy")}
                className={`${styles.railIconBtn} ${activeTab === "copy" ? styles.railIconBtnActive : ""}`}
                title="شريط العروض في الأعلى"
              >
                <FileText size={19} />
              </button>
            </div>
          </div>

          <div className={styles.railBottom}>
            <button
              type="button"
              className={styles.railIconBtn}
              onClick={handleLogout}
              title="تسجيل الخروج"
              style={{ color: "#cf142b" }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </aside>

        {/* =========================================================
            2. MAIN STAGE
            ========================================================= */}
        <div className={styles.mainStage}>
          {/* Top Bar with Segmented Pills */}
          <header className={`${styles.topBar} ${isAnyModalOpen ? styles.topBarHidden : ""}`}>
            <Link href="/" target="_blank" className={styles.topBrandPill} title="معاينة المتجر" style={{ textDecoration: "none" }}>
              <Image
                src="/logo.png"
                alt="JUVENILE Haute Parfumerie"
                width={128}
                height={34}
                priority
                style={{ height: 28, width: "auto", objectFit: "contain", display: "block" }}
              />
            </Link>

            {/* Segmented Pill Navigation Tabs */}
            <div className={styles.segmentedPillNav}>
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`${styles.segmentTab} ${activeTab === "overview" ? styles.segmentTabActive : ""}`}
              >
                الرئيسية والمبيعات
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("products")}
                className={`${styles.segmentTab} ${activeTab === "products" ? styles.segmentTabActive : ""}`}
              >
                العطور والأسعار
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("coupons")}
                className={`${styles.segmentTab} ${activeTab === "coupons" ? styles.segmentTabActive : ""}`}
              >
                أكواد الخصم
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("visuals")}
                className={`${styles.segmentTab} ${activeTab === "visuals" ? styles.segmentTabActive : ""}`}
              >
                الصور والبانرات
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("copy")}
                className={`${styles.segmentTab} ${activeTab === "copy" ? styles.segmentTabActive : ""}`}
              >
                شريط العروض في الأعلى
              </button>
            </div>

            {/* Right Quick Controls with Working Interactive Popups */}
            <div className={styles.topRightActions}>
              {activeHeaderPopup !== null && (
                <div
                  className={styles.headerDropdownBackdrop}
                  onClick={() => setActiveHeaderPopup(null)}
                />
              )}

              {/* 1. Search Button & Dropdown */}
              <div className={styles.headerActionItem} style={{ zIndex: activeHeaderPopup === "search" ? 131 : 1 }}>
                <button
                  type="button"
                  className={`${styles.circleIconBtn} ${activeHeaderPopup === "search" ? styles.railIconBtnActive : ""}`}
                  title="البحث السريع"
                  onClick={() => setActiveHeaderPopup(activeHeaderPopup === "search" ? null : "search")}
                >
                  <Search size={16} />
                </button>

                {activeHeaderPopup === "search" && (
                  <div className={styles.headerDropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownTitle}>البحث السريع في المتجر</span>
                      <button
                        type="button"
                        className={styles.dropdownActionBtn}
                        onClick={() => setActiveHeaderPopup(null)}
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <div className={styles.searchBox} style={{ width: "100%" }}>
                      <Search size={15} color="#94a3b8" />
                      <input
                        type="text"
                        placeholder="ابحث عن اسم عطر، سعر، أو قسم..."
                        className={styles.searchInput}
                        autoFocus
                        value={headerSearchQuery}
                        onChange={(e) => setHeaderSearchQuery(e.target.value)}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                      {Object.entries(draftData.products || {})
                        .filter(([_, p]) =>
                          !headerSearchQuery ||
                          p.name.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
                          p.arabicName.includes(headerSearchQuery) ||
                          p.category.ar.includes(headerSearchQuery)
                        )
                        .slice(0, 5)
                        .map(([id, prod]) => (
                          <div
                            key={id}
                            onClick={() => {
                              openProductModal(id);
                              setActiveHeaderPopup(null);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 10px",
                              borderRadius: 10,
                              background: "#f8fafc",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={prod.image}
                                alt={prod.name}
                                style={{ width: 28, height: 32, borderRadius: 6, objectFit: "cover" }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/products/half-million.jpg";
                                }}
                              />
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{prod.arabicName}</div>
                                <div style={{ fontSize: 10, color: "#64748b" }}>{prod.formattedPrice.ar}</div>
                              </div>
                            </div>
                            <span style={{ fontSize: 11, color: "#0750cd", fontWeight: 600 }}>تعديل</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Notifications Bell & Dropdown */}
              <div className={styles.headerActionItem} style={{ zIndex: activeHeaderPopup === "notifications" ? 131 : 1 }}>
                <button
                  type="button"
                  className={styles.circleIconBtn}
                  title="الإشعارات والتنبيهات"
                  onClick={() => setActiveHeaderPopup(activeHeaderPopup === "notifications" ? null : "notifications")}
                >
                  <Bell size={16} />
                  {unreadNotifications > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: 7,
                        insetInlineEnd: 7,
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#cf142b",
                        boxShadow: "0 0 0 2px #ffffff",
                      }}
                    />
                  )}
                </button>

                {activeHeaderPopup === "notifications" && (
                  <div className={styles.headerDropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownTitle}>
                        الإشعارات والتنبيهات {unreadNotifications > 0 && `(${unreadNotifications} جديدة)`}
                      </span>
                      {unreadNotifications > 0 ? (
                        <button
                          type="button"
                          className={styles.dropdownActionBtn}
                          onClick={() => {
                            setUnreadNotifications(0);
                            setNotificationsList((prev) => prev.map((n) => ({ ...n, unread: false })));
                            triggerToast("✓ تم تحديد كل الإشعارات كمقروءة");
                          }}
                        >
                          تحديد الكل كمقروء
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>الكل مقروء ✓</span>
                      )}
                    </div>
                    <div className={styles.notificationList}>
                      {notificationsList.map((item) => (
                        <div
                          key={item.id}
                          className={`${styles.notificationItem} ${item.unread ? styles.notificationUnread : ""}`}
                        >
                          <div className={styles.notificationIcon}>
                            <ShoppingBag size={14} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className={styles.notificationTitle}>{item.title}</div>
                            <div className={styles.notificationDesc}>{item.desc}</div>
                            <div className={styles.notificationTime}>{item.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>


              {/* 4. Profile Pill & Dropdown */}
              <div className={styles.headerActionItem} style={{ zIndex: activeHeaderPopup === "profile" ? 131 : 1 }}>
                <div
                  className={styles.profilePill}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveHeaderPopup(activeHeaderPopup === "profile" ? null : "profile")}
                >
                  <div className={styles.profileAvatar}>M</div>
                  <div className={styles.profileText}>
                    <span className={styles.profileName}>مدير المتجر</span>
                    <span className={styles.profileRole}>Admin Manager</span>
                  </div>
                  <ChevronDown
                    size={14}
                    color="#94a3b8"
                    style={{
                      transform: activeHeaderPopup === "profile" ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </div>

                {activeHeaderPopup === "profile" && (
                  <div className={`${styles.headerDropdownMenu} ${styles.profileDropdownMenu}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>
                      <div className={styles.profileAvatar} style={{ width: 38, height: 38, fontSize: 15 }}>M</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>مدير المتجر</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{adminAccountEmail}</div>
                      </div>
                    </div>
                    <div className={styles.profileMenuLinks}>
                      <Link
                        href="/"
                        target="_blank"
                        className={styles.profileMenuItem}
                        onClick={() => setActiveHeaderPopup(null)}
                      >
                        <Eye size={15} /> معاينة واجهة المتجر
                      </Link>
                      <button
                        type="button"
                        className={styles.profileMenuItem}
                        onClick={() => {
                          setActiveHeaderPopup(null);
                          setAccountActiveTab("email");
                          setAccountNewEmail("");
                          setAccountCurrentPass("");
                          setAccountNewPass("");
                          setAccountConfirmPass("");
                          setAccountModalError("");
                          setShowAdminAccountModal(true);
                        }}
                      >
                        <Key size={15} /> تعديل البريد والرقم السري
                      </button>
                      <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                      <button
                        type="button"
                        className={`${styles.profileMenuItem} ${styles.profileMenuItemDanger}`}
                        onClick={() => {
                          setActiveHeaderPopup(null);
                          handleLogout();
                        }}
                      >
                        <LogOut size={15} /> تسجيل الخروج
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Greeting Section */}
          <div className={styles.greetingSection}>
            <div>
              <h1 className={styles.greetingTitle}>صباح الفل، منوّر لوحة تحكم جوفينيل</h1>
              <p className={styles.greetingSubtitle}>
                تابع مبيعاتك وأوردراتك أول بأول، وعدّل أي سعر أو صورة أو كلام في المتجر بكل سهولة.
              </p>
            </div>

            <div className={styles.greetingRightBtns}>
              <Link href="/" target="_blank" className={styles.previewPillBtn}>
                <Eye size={16} /> معاينة الموقع
              </Link>
              <button
                type="button"
                onClick={handleGlobalSave}
                disabled={isSavingLocal}
                className={styles.publishActionBtn}
              >
                {isSavingLocal ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                <span>حفظ ونشر التعديلات</span>
              </button>
            </div>
          </div>

          {/* =========================================================
              TAB CONTENT: OVERVIEW (DRIBBBLE FINEXY 3-COL ROW)
              ========================================================= */}
          {activeTab === "overview" && (() => {
            const totalSalesAmount = orders
              .filter((o) => o.status !== "cancelled")
              .reduce((acc, curr) => acc + (curr.total || 0), 0);

            const activeOrdersCount = orders.filter(
              (o) => o.status === "pending_confirmation" || o.status === "processing" || o.status === "shipped"
            ).length;

            const perfumeCounts: Record<string, number> = {};
            orders.forEach((o) => {
              if (o.status !== "cancelled") {
                (o.items || []).forEach((item) => {
                  const name = item.name || "عطر فاخر";
                  perfumeCounts[name] = (perfumeCounts[name] || 0) + (item.quantity || 1);
                });
              }
            });
            const bestSellerEntry = Object.entries(perfumeCounts).sort((a, b) => b[1] - a[1])[0];
            const topPerfumeName = bestSellerEntry ? bestSellerEntry[0] : "HALF MILLION";
            const topPerfumeCount = bestSellerEntry ? bestSellerEntry[1] : 0;

            const filteredOrders = orders.filter((order) => {
              if (orderStatusFilter !== "all" && order.status !== orderStatusFilter) {
                return false;
              }
              if (orderSearchQuery.trim()) {
                const q = orderSearchQuery.toLowerCase().trim();
                const matchesId = order.orderId?.toLowerCase().includes(q);
                const matchesCustomer =
                  order.customer?.firstName?.toLowerCase().includes(q) ||
                  order.customer?.lastName?.toLowerCase().includes(q) ||
                  order.customer?.phone?.includes(q);
                const matchesGov =
                  order.delivery?.governorate?.toLowerCase().includes(q) ||
                  order.delivery?.city?.toLowerCase().includes(q);
                const matchesItems = (order.items || []).some((item) =>
                  item.name?.toLowerCase().includes(q)
                );
                return matchesId || matchesCustomer || matchesGov || matchesItems;
              }
              return true;
            });

            return (
              <div className={styles.dashboardContent}>
                <div className={styles.mainGridRow}>
                  {/* Metric Cards (Hero banner + sub cards) */}
                  <div className={styles.metricTilesGrid}>
                    {/* Card 1: Featured Brand Blue (Full Width Banner) */}
                    <div className={`${styles.tileCard} ${styles.tileCardFeatured}`}>
                      <div className={styles.tileTop}>
                        <span className={styles.tileTitleWhite}>إجمالي المبيعات المحققة</span>
                        <div className={styles.tileIconCircleWhite}>
                          <TrendingUp size={16} />
                        </div>
                      </div>
                      <div>
                        <div className={styles.tileValueWhite}>
                          {totalSalesAmount > 0
                            ? `${totalSalesAmount.toLocaleString("ar-EG")} ج.م`
                            : "95,850 ج.م"}
                        </div>
                        <div className={styles.tileTrendWhite}>
                          <span>
                            {orders.length > 0
                              ? `من واقع ${orders.length} طلبية مسجلة بالمتجر`
                              : "↑ 22% زيادة عن الشهر اللي فات"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Signature Fragrance / Best Seller */}
                    <div className={styles.tileCard}>
                      <div className={styles.tileTop}>
                        <span className={styles.tileTitle}>أكتر عطر مطلوب في الأوردرات</span>
                        <div className={styles.tileIconCircle}>
                          <Sparkles size={16} />
                        </div>
                      </div>
                      <div>
                        <div
                          className={styles.tileValue}
                          style={{
                            fontSize: 17,
                            fontFamily: "var(--font-sans-luxury, sans-serif)",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {topPerfumeName}
                        </div>
                        <div className={styles.tileTrend}>
                          <span>
                            {topPerfumeCount > 0
                              ? `مطلوب ${topPerfumeCount} مرات في أوردرات العملاء`
                              : "واخد 42% من طلبات الزباين"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Confirmed Orders */}
                    <div className={styles.tileCard}>
                      <div className={styles.tileTop}>
                        <span className={styles.tileTitle}>طلبات قيد التجهيز والتوصيل</span>
                        <div className={styles.tileIconCircle}>
                          <ShoppingBag size={16} />
                        </div>
                      </div>
                      <div>
                        <div className={styles.tileValue}>
                          {activeOrdersCount > 0 ? `${activeOrdersCount} طلب نشط` : "148 أوردر"}
                        </div>
                        <div className={styles.tileTrend}>
                          <span>
                            {activeOrdersCount > 0
                              ? "بانتظار التأكيد أو قيد الشحن مع المندوب"
                              : "جاهزين للشحن والتوصيل للعملاء"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Monthly Sales Curve Graph (100ml only) */}
                  <div className={styles.cleanCard}>
                    <div className={styles.chartHeader}>
                      <div>
                        <h3 className={styles.chartTitle}>منحنى المبيعات لعام 2026</h3>
                        <p className={styles.chartSubtitle}>حركة مبيعات عطور جوفينيل 100 مل عبر الشهور</p>
                      </div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: "#f0fdf4",
                          color: "#15803d",
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          direction: "rtl",
                        }}
                      >
                        <span dir="ltr" style={{ display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 800 }}>
                          <span>↑</span>
                          <span>28.4%</span>
                        </span>
                        <span>نمو متصاعد</span>
                      </div>
                    </div>

                    {/* Modern SVG Area Graph with Live Mouse Tracking & Interactive Hover */}
                    <div
                      className={styles.graphContainer}
                      style={{ position: "relative" }}
                      onPointerMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const relX = ((e.clientX - rect.left) / rect.width) * 500;
                        let closestIdx = 0;
                        let minDiff = 9999;
                        salesMonthlyData.forEach((pt, i) => {
                          const diff = Math.abs(pt.x - relX);
                          if (diff < minDiff) {
                            minDiff = diff;
                            closestIdx = i;
                          }
                        });
                        setHoveredPointIndex(closestIdx);
                      }}
                      onPointerLeave={() => setHoveredPointIndex(5)}
                    >
                      <svg
                        viewBox="0 0 500 150"
                        className={styles.salesSvg}
                        preserveAspectRatio="none"
                        style={{ cursor: "crosshair" }}
                        onPointerMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const relX = ((e.clientX - rect.left) / rect.width) * 500;
                          let closestIdx = 0;
                          let minDiff = 9999;
                          salesMonthlyData.forEach((pt, i) => {
                            const diff = Math.abs(pt.x - relX);
                            if (diff < minDiff) {
                              minDiff = diff;
                              closestIdx = i;
                            }
                          });
                          setHoveredPointIndex(closestIdx);
                        }}
                        onPointerLeave={() => setHoveredPointIndex(5)}
                      >
                        <defs>
                          <linearGradient id="salesAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0750cd" stopOpacity="0.35" />
                            <stop offset="60%" stopColor="#0750cd" stopOpacity="0.08" />
                            <stop offset="100%" stopColor="#0750cd" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Subtle Grid Guidelines */}
                        <line x1="20" y1="30" x2="480" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="20" y1="65" x2="480" y2="65" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="20" y1="105" x2="480" y2="105" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

                        {/* Area Fill Path */}
                        <path
                          d="M 30 118 C 65 114, 80 102, 98 98 C 120 94, 138 112, 160 108 C 185 102, 200 78, 222 72 C 248 66, 265 56, 285 52 C 310 46, 328 22, 348 18 C 375 16, 388 48, 410 44 C 435 40, 450 32, 475 28 L 475 135 L 30 135 Z"
                          fill="url(#salesAreaGrad)"
                        />

                        {/* Spline Stroke Curve */}
                        <path
                          d="M 30 118 C 65 114, 80 102, 98 98 C 120 94, 138 112, 160 108 C 185 102, 200 78, 222 72 C 248 66, 265 56, 285 52 C 310 46, 328 22, 348 18 C 375 16, 388 48, 410 44 C 435 40, 450 32, 475 28"
                          fill="none"
                          stroke="#0750cd"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                        />

                        {/* Active Vertical Guideline to hovered point */}
                        {hoveredPointIndex !== null && salesMonthlyData[hoveredPointIndex] && (
                          <line
                            x1={salesMonthlyData[hoveredPointIndex].x}
                            y1={salesMonthlyData[hoveredPointIndex].y}
                            x2={salesMonthlyData[hoveredPointIndex].x}
                            y2={135}
                            stroke="#0750cd"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                          />
                        )}

                        {/* Point Dots with Hover Glow */}
                        {salesMonthlyData.map((pt, idx) => {
                          const isHovered = hoveredPointIndex === idx;
                          return (
                            <g
                              key={idx}
                              style={{ cursor: "pointer" }}
                              onMouseEnter={() => setHoveredPointIndex(idx)}
                            >
                              {isHovered ? (
                                <>
                                  <circle cx={pt.x} cy={pt.y} r="11" fill="#0750cd" fillOpacity="0.2" />
                                  <circle cx={pt.x} cy={pt.y} r="5.5" fill="#0750cd" stroke="#ffffff" strokeWidth="2.5" />
                                </>
                              ) : (
                                <circle cx={pt.x} cy={pt.y} r="3.2" fill="#ffffff" stroke="#0750cd" strokeWidth="2" />
                              )}
                            </g>
                          );
                        })}
                      </svg>

                      {/* HTML High-Precision BiDi Tooltip Badge (Zero distortion or overlapping) */}
                      {hoveredPointIndex !== null && salesMonthlyData[hoveredPointIndex] && (() => {
                        const activePt = salesMonthlyData[hoveredPointIndex];
                        const leftPct = (activePt.x / 500) * 100;
                        const topPx = (activePt.y / 150) * 145;
                        return (
                          <div
                            style={{
                              position: "absolute",
                              left: `${leftPct}%`,
                              top: `${topPx}px`,
                              transform: "translate(-50%, -108%)",
                              pointerEvents: "none",
                              zIndex: 20,
                              transition: "left 0.12s ease-out, top 0.12s ease-out",
                              background: "#0f172a",
                              color: "#ffffff",
                              padding: "6px 14px",
                              borderRadius: "10px",
                              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.45)",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              whiteSpace: "nowrap",
                              direction: "rtl",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#94a3b8",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                marginBottom: 3,
                              }}
                            >
                              <span>{activePt.month}</span>
                              <span style={{ opacity: 0.5 }}>—</span>
                              <span>{activePt.bottles}</span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: 5,
                                fontWeight: 800,
                              }}
                            >
                              <span
                                dir="ltr"
                                style={{
                                  fontSize: "15px",
                                  color: "#ffffff",
                                  letterSpacing: "0.5px",
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                {activePt.amount}
                              </span>
                              <span style={{ fontSize: "11px", fontWeight: 700, color: "#38bdf8" }}>
                                ج.م
                              </span>
                            </div>
                            {/* Downward triangle arrow */}
                            <div
                              style={{
                                position: "absolute",
                                bottom: "-5px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: 0,
                                height: 0,
                                borderLeft: "5px solid transparent",
                                borderRight: "5px solid transparent",
                                borderTop: "5px solid #0f172a",
                              }}
                            />
                          </div>
                        );
                      })()}

                      {/* Month labels along the bottom with live interactive hover & click */}
                      <div className={styles.graphMonthsRow}>
                        {salesMonthlyData.map((pt, i) => (
                          <span
                            key={i}
                            onClick={() => setHoveredPointIndex(i)}
                            onMouseEnter={() => setHoveredPointIndex(i)}
                            style={{
                              cursor: "pointer",
                              transition: "all 0.15s",
                              color: hoveredPointIndex === i ? "#0750cd" : undefined,
                              fontWeight: hoveredPointIndex === i ? 700 : undefined,
                            }}
                            className={`${styles.graphMonthLabel} ${hoveredPointIndex === i ? styles.graphMonthPeak : ""}`}
                          >
                            {pt.month}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* =========================================================
                    BOTTOM ROW: REAL-TIME ORDERS & SALES TRACKING (GLOBAL STANDARD)
                    ========================================================= */}
                <div className={styles.tableCard}>
                  <div className={styles.tableHeaderBar} style={{ flexWrap: "wrap", gap: 14 }}>
                    <div className={styles.ordersHeaderTitleRow}>
                      <h3 className={styles.tableTitle} style={{ fontSize: 18 }}>
                        إدارة وتتبع طلبات ومبيعات العملاء
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowWhatsAppModal(true)}
                        className={`${styles.whatsappStatusPill} ${
                          whatsappInfo.connected
                            ? styles.whatsappStatusPillConnected
                            : styles.whatsappStatusPillDisconnected
                        }`}
                        title="اضغط لربط أو فحص خدمة الواتساب الأوتوماتيكي"
                      >
                        <MessageCircle size={14} />
                        {whatsappInfo.connected ? (
                          <span>
                            🟢 واتساب المتجر: متصل (+{whatsappInfo.userPhone || "البراند"})
                          </span>
                        ) : (
                          <span>
                            🟡 ربط واتساب المتجر (إرسال أوتوماتيكي)
                          </span>
                        )}
                      </button>
                    </div>

                    <div className={styles.tableSearchFilter}>
                      <div className={styles.searchBox} style={{ width: 260 }}>
                        <Search size={15} color="#94a3b8" />
                        <input
                          type="text"
                          placeholder="ابحث بالاسم، الفون، العطر، المحافظة..."
                          className={styles.searchInput}
                          value={orderSearchQuery}
                          onChange={(e) => setOrderSearchQuery(e.target.value)}
                        />
                        {orderSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setOrderSearchQuery("")}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        className={styles.filterBtn}
                        onClick={() => fetchOrders()}
                        title="تحديث قائمة الطلبات"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        <RefreshCw size={13} className={isLoadingOrders ? "animate-spin" : ""} />
                        <span>تحديث</span>
                      </button>
                    </div>
                  </div>

                  {/* Status Filter Tabs */}
                  <div className={styles.orderFilterTabs}>
                    {[
                      { key: "all", label: "كل الطلبات", count: orders.length },
                      {
                        key: "pending_confirmation",
                        label: "طلبات جديدة",
                        count: orders.filter((o) => o.status === "pending_confirmation").length,
                      },
                      {
                        key: "processing",
                        label: "جاري التجهيز",
                        count: orders.filter((o) => o.status === "processing").length,
                      },
                      {
                        key: "shipped",
                        label: "قيد الشحن مع المندوب",
                        count: orders.filter((o) => o.status === "shipped").length,
                      },
                      {
                        key: "delivered",
                        label: "تم الاستلام بنجاح",
                        count: orders.filter((o) => o.status === "delivered").length,
                      },
                      {
                        key: "cancelled",
                        label: "ملغية",
                        count: orders.filter((o) => o.status === "cancelled").length,
                      },
                    ].map((filterTab) => (
                      <button
                        key={filterTab.key}
                        type="button"
                        onClick={() => setOrderStatusFilter(filterTab.key)}
                        className={`${styles.orderFilterPill} ${
                          orderStatusFilter === filterTab.key ? styles.orderFilterPillActive : ""
                        }`}
                      >
                        <span>{filterTab.label}</span>
                        <span className={styles.orderFilterCount}>{filterTab.count}</span>
                      </button>
                    ))}
                  </div>

                  {/* Desktop Data Table */}
                  <div className={styles.desktopTableWrapper} style={{ marginTop: 16 }}>
                    {filteredOrders.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b" }}>
                        <Package size={44} color="#cbd5e1" style={{ margin: "0 auto 12px" }} />
                        <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>
                          لا توجد طلبات تطابق الفلتر المختار
                        </div>
                        <p style={{ fontSize: 13, marginTop: 4 }}>
                          {orderSearchQuery
                            ? "جرب تبحث بكلمة تانية أو امسح البحث"
                            : "أي طلب جديد هيعمله عميل في صفحة الدفع هيظهر هنا فوراً"}
                        </p>
                        {(orderSearchQuery || orderStatusFilter !== "all") && (
                          <button
                            type="button"
                            onClick={() => {
                              setOrderSearchQuery("");
                              setOrderStatusFilter("all");
                            }}
                            className={styles.actionBtnSecondary}
                            style={{ marginTop: 12 }}
                          >
                            عرض كل الطلبات
                          </button>
                        )}
                      </div>
                    ) : (
                      <table className={styles.finexyTable}>
                        <thead>
                          <tr>
                            <th>رقم الطلب والتاريخ</th>
                            <th>بيانات العميل</th>
                            <th>العطور والكميات</th>
                            <th>الإجمالي والدفع</th>
                            <th>حالة الطلب والتوصيل</th>
                            <th style={{ textAlign: "center" }}>التواصل والإجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((ord) => {
                            const statusConf =
                              ORDER_STATUS_CONFIG[ord.status] || ORDER_STATUS_CONFIG.pending_confirmation;
                            const cleanPhone = (ord.customer.phone || "").replace(/\D/g, "");
                            const waPhone = cleanPhone.startsWith("0") ? `2${cleanPhone}` : cleanPhone;
                            const waMsg = encodeURIComponent(
                              `أهلاً بك أستاذ ${ord.customer.firstName}، معاك براند جوفينيل للعطور بخصوص طلبك رقم ${ord.orderId}.`
                            );

                            return (
                              <tr key={ord.orderId}>
                                {/* Order ID & Created Date */}
                                <td>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                    <span
                                      style={{
                                        fontWeight: 800,
                                        color: "#0f172a",
                                        fontFamily: "monospace",
                                        fontSize: 13,
                                      }}
                                    >
                                      #{ord.orderId}
                                    </span>
                                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                      {new Date(ord.createdAt).toLocaleDateString("ar-EG", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </td>

                                {/* Customer Details */}
                                <td>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 13.5 }}>
                                      {ord.customer.firstName} {ord.customer.lastName}
                                    </span>
                                    <a
                                      href={`tel:${ord.customer.phone}`}
                                      style={{
                                        fontSize: 12,
                                        color: "#0750cd",
                                        textDecoration: "none",
                                        direction: "ltr",
                                        textAlign: "right",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {ord.customer.phone}
                                    </a>
                                    <span style={{ fontSize: 11, color: "#64748b" }}>
                                      📍 {ord.delivery.governorate} {ord.delivery.city ? `- ${ord.delivery.city}` : ""}
                                    </span>
                                  </div>
                                </td>

                                {/* Ordered Items */}
                                <td>
                                  <div className={styles.orderItemsPillList}>
                                    {(ord.items || []).map((item, idx) => (
                                      <div key={idx} className={styles.orderItemRowSnippet}>
                                        <span className={styles.orderItemBadgeCount}>{item.quantity}x</span>
                                        <span style={{ fontWeight: 600, color: "#1e293b" }}>{item.name}</span>
                                        <span style={{ fontSize: 11, color: "#64748b" }}>
                                          ({(item.price || 0).toLocaleString("ar-EG")} ج.م)
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </td>

                                {/* Total & Payment Method */}
                                <td>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <span style={{ fontWeight: 800, color: "#0f172a", fontSize: 14 }}>
                                      {(ord.total || 0).toLocaleString("ar-EG")} ج.م
                                    </span>
                                    {ord.couponCode && (
                                      <span
                                        style={{
                                          fontSize: 10.5,
                                          fontWeight: 700,
                                          background: "#ecfdf5",
                                          color: "#047857",
                                          padding: "2px 8px",
                                          borderRadius: 8,
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 4,
                                          width: "fit-content",
                                          border: "1px solid #a7f3d0",
                                        }}
                                      >
                                        🏷️ {ord.couponCode}
                                        {ord.discount > 0 && ` (-${ord.discount.toLocaleString("ar-EG")} ج.م)`}
                                      </span>
                                    )}
                                    <span
                                      style={{
                                        fontSize: 10.5,
                                        fontWeight: 700,
                                        background: "#f1f5f9",
                                        color: "#475569",
                                        padding: "2px 8px",
                                        borderRadius: 10,
                                        display: "inline-block",
                                        width: "fit-content",
                                      }}
                                    >
                                      الدفع عند الاستلام (COD)
                                    </span>
                                  </div>
                                </td>

                                {/* Status Select Dropdown */}
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <select
                                      value={ord.status}
                                      disabled={isUpdatingOrderId === ord.orderId}
                                      onChange={(e) =>
                                        handleUpdateOrderStatus(ord.orderId, e.target.value as CustomerOrder["status"])
                                      }
                                      className={styles.statusSelectControl}
                                      style={{
                                        background: statusConf.bg,
                                        color: statusConf.color,
                                        borderColor: statusConf.borderColor,
                                      }}
                                      title="اضغط لتغيير حالة الطلب والتوصيل فوراً"
                                    >
                                      <option value="pending_confirmation">طلب جديد (قيد التأكيد)</option>
                                      <option value="processing">جاري التجهيز والتعبئة</option>
                                      <option value="shipped">خرج للشحن مع المندوب</option>
                                      <option value="delivered">تم الاستلام بنجاح</option>
                                      <option value="cancelled">طلب ملغي</option>
                                    </select>
                                    {isUpdatingOrderId === ord.orderId && (
                                      <RefreshCw size={13} className="animate-spin" color="#0750cd" />
                                    )}
                                  </div>
                                </td>

                                {/* Actions */}
                                <td style={{ textAlign: "center" }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                    {/* Direct WhatsApp */}
                                    <a
                                      href={`https://wa.me/${waPhone}?text=${waMsg}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={styles.whatsappDirectBtn}
                                      title={`محادثة واتساب مع العميل (${ord.customer.firstName})`}
                                    >
                                      <MessageCircle size={13} />
                                      <span>واتساب</span>
                                    </a>

                                    {/* View Details */}
                                    <button
                                      type="button"
                                      onClick={() => setSelectedOrderForModal(ord)}
                                      className={styles.actionBtnSecondary}
                                      title="عرض كافة تفاصيل الطلب والعنوان"
                                    >
                                      التفاصيل
                                    </button>

                                    {/* Delete Order */}
                                    <button
                                      type="button"
                                      onClick={() => setOrderToDelete(ord)}
                                      style={{
                                        padding: "6px 8px",
                                        borderRadius: 14,
                                        border: "1px solid #fee2e2",
                                        background: "#fef2f2",
                                        color: "#ef4444",
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                      title="حذف هذا الطلب"
                                      aria-label={`حذف الطلب ${ord.orderId}`}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* iPhone Native Inset Grouped List (Mobile Only) */}
                  <div className={styles.mobilePerfumeList}>
                    {filteredOrders.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "30px 16px", color: "#64748b" }}>
                        <Package size={36} color="#cbd5e1" style={{ margin: "0 auto 10px" }} />
                        <div style={{ fontWeight: 700, fontSize: 14 }}>لا توجد طلبات تطابق الفلتر</div>
                      </div>
                    ) : (
                      filteredOrders.map((ord) => {
                        const statusConf =
                          ORDER_STATUS_CONFIG[ord.status] || ORDER_STATUS_CONFIG.pending_confirmation;
                        const cleanPhone = (ord.customer.phone || "").replace(/\D/g, "");
                        const waPhone = cleanPhone.startsWith("0") ? `2${cleanPhone}` : cleanPhone;
                        const waMsg = encodeURIComponent(
                          `أهلاً بك أستاذ ${ord.customer.firstName}، معاك براند جوفينيل للعطور بخصوص طلبك رقم ${ord.orderId}.`
                        );

                        return (
                          <div key={ord.orderId} className={styles.mobileOrderCard}>
                            <div className={styles.mobileOrderTop}>
                              <div>
                                <div className={styles.mobileOrderId}>#{ord.orderId}</div>
                                <div className={styles.mobileOrderDate}>
                                  {new Date(ord.createdAt).toLocaleDateString("ar-EG", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                              <select
                                value={ord.status}
                                disabled={isUpdatingOrderId === ord.orderId}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(ord.orderId, e.target.value as CustomerOrder["status"])
                                }
                                className={styles.statusSelectControl}
                                style={{
                                  background: statusConf.bg,
                                  color: statusConf.color,
                                  borderColor: statusConf.borderColor,
                                  fontSize: 11,
                                  padding: "4px 22px 4px 8px",
                                }}
                              >
                                <option value="pending_confirmation">طلب جديد</option>
                                <option value="processing">تجهيز وتعبئة</option>
                                <option value="shipped">قيد الشحن</option>
                                <option value="delivered">تم الاستلام</option>
                                <option value="cancelled">ملغي</option>
                              </select>
                            </div>

                            <div className={styles.mobileOrderCustomer}>
                              <div className={styles.mobileCustomerName}>
                                {ord.customer.firstName} {ord.customer.lastName}
                              </div>
                              <div className={styles.mobileCustomerPhone}>
                                <a href={`tel:${ord.customer.phone}`} style={{ color: "inherit", textDecoration: "none" }}>
                                  {ord.customer.phone}
                                </a>
                              </div>
                              <div style={{ fontSize: 11.5, color: "#64748b" }}>
                                📍 {ord.delivery.governorate} {ord.delivery.city ? `- ${ord.delivery.city}` : ""}
                              </div>
                            </div>

                            <div className={styles.mobileOrderItemsBox}>
                              {(ord.items || []).map((item, idx) => (
                                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                                  <span>
                                    <strong>{item.quantity}x</strong> {item.name}
                                  </span>
                                  <span style={{ fontWeight: 700, color: "#0f172a" }}>
                                    {(item.price || 0).toLocaleString("ar-EG")} ج.م
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className={styles.mobileOrderFooter}>
                              <div>
                                <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>الإجمالي:</span>
                                <span className={styles.mobileOrderTotal}>
                                  {(ord.total || 0).toLocaleString("ar-EG")} ج.م
                                </span>
                              </div>

                              <div className={styles.mobileOrderActions}>
                                <a
                                  href={`https://wa.me/${waPhone}?text=${waMsg}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.whatsappDirectBtn}
                                >
                                  <MessageCircle size={13} />
                                  <span>واتساب</span>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderForModal(ord)}
                                  className={styles.actionBtnSecondary}
                                >
                                  تفاصيل
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* =========================================================
              TAB: PRODUCTS & OLFACTORY PYRAMID FULL CATALOG
              ========================================================= */}
          {activeTab === "products" && (
            <div className={styles.dashboardContent}>
              {/* Category Filter Pills (عطور مستوحاة، رجالي، حريمي، للجنسين، بخور، بادي سبلاش) */}
              <div className={styles.categoryFilterRow} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {[
                    { key: "bestsellers", label: "🌟 اختياراتنا المميزة (Best Sellers)", count: (draftData.featuredProductIds || DEFAULT_FEATURED_PRODUCT_IDS).length },
                    { key: "inspired", label: "عطور مستوحاة (Inspired)", count: Object.keys(draftData.inspiredProducts || {}).length },
                    { key: "men", label: "عطور رجالي", count: Object.values(draftData.products || {}).filter(p => getProductClassification(p) === "men").length },
                    { key: "women", label: "عطور حريمي", count: Object.values(draftData.products || {}).filter(p => getProductClassification(p) === "women").length },
                    { key: "unisex", label: "للجنسين (Unisex)", count: Object.values(draftData.products || {}).filter(p => getProductClassification(p) === "unisex").length },
                    { key: "bukhoor", label: "بخور ومبثوث", count: Object.values(draftData.products || {}).filter(p => getProductClassification(p) === "bukhoor").length },
                    { key: "bodysplash", label: "بادي سبلاش", count: Object.values(draftData.products || {}).filter(p => getProductClassification(p) === "bodysplash").length },
                    { key: "musk", label: "مجموعة المسك (Musk)", count: Object.values(draftData.products || {}).filter(p => getProductClassification(p) === "musk").length },
                    { key: "all", label: "جميع المنتجات", count: Object.keys(draftData.products || {}).length },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(tab.key as ProductClassification)}
                      className={`${styles.categoryFilterPill} ${selectedCategoryFilter === tab.key ? styles.categoryFilterPillActive : ""}`}
                    >
                      <span>{tab.label}</span>
                      <span className={styles.categoryFilterBadge}>{tab.count}</span>
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  {selectedCategoryFilter === "bestsellers" ? (
                    <button
                      type="button"
                      onClick={excludeMuskFromBestsellers}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "9px 18px",
                        borderRadius: 20,
                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        color: "#ffffff",
                        fontSize: 13,
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(239, 68, 68, 0.28)",
                      }}
                      title="استبعاد كافة عطور ومنتجات المسك من سيكشن اختياراتنا المميزة بنقرة واحدة"
                    >
                      <span>🚫 استبعاد كل المسك من السيكشن</span>
                    </button>
                  ) : selectedCategoryFilter === "inspired" ? (
                    <button
                      type="button"
                      onClick={openCreateInspiredModal}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "9px 18px",
                        borderRadius: 20,
                        background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                        color: "#ffffff",
                        fontSize: 13,
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(124, 58, 237, 0.28)",
                      }}
                    >
                      <Plus size={16} />
                      <span>+ إضافة إزازة مستوحاة جديدة</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={openCreateProductModal}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "9px 18px",
                        borderRadius: 20,
                        background: "linear-gradient(135deg, #1d6bf3 0%, #0750cd 100%)",
                        color: "#ffffff",
                        fontSize: 13,
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(7, 80, 205, 0.28)",
                      }}
                    >
                      <Plus size={16} />
                      <span>
                        {selectedCategoryFilter === "musk" ? "+ إضافة منتج مسك جديد" : "إضافة عطر جديد"}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.catalogGrid}>
                {selectedCategoryFilter === "bestsellers" ? (
                  <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 18 }}>
                    {/* Bestsellers Showcase Manager Header */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #0a0f1d 0%, #1e293b 100%)",
                        color: "#ffffff",
                        padding: "24px 28px",
                        borderRadius: 20,
                        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
                        <div>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.3)", padding: "4px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, color: "#38bdf8", marginBottom: 8 }}>
                            <Sparkles size={13} />
                            <span>الصفحة الرئيسية • شريط اختياراتنا المميزة (الأكثر مبيعاً)</span>
                          </div>
                          <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "#ffffff" }}>
                            إدارة المنتجات المعروضة في شريط "اختياراتنا المميزة"
                          </h3>
                          <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", maxWidth: 660, lineHeight: 1.6 }}>
                            اختر المنتجات التي تريد ظهورها في هذا السيكشن بالصفحة الرئيسية للمتجر. تفعيل أي عطر يجعله يظهر فوراً في الشريط المتحرك، ويمكنك استبعاد المسك أو استعادة العطور الملكية بنقرة واحدة.
                          </p>
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                          <button
                            type="button"
                            onClick={excludeMuskFromBestsellers}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "9px 16px",
                              borderRadius: 14,
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "#fca5a5",
                              border: "1px solid rgba(239, 68, 68, 0.35)",
                              fontSize: 12.5,
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            title="إزالة جميع منتجات المسك من سيكشن اختياراتنا المميزة"
                          >
                            <span>🚫 استبعاد كل المسك</span>
                          </button>

                          <button
                            type="button"
                            onClick={resetBestsellersToDefault}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "9px 16px",
                              borderRadius: 14,
                              background: "rgba(56, 189, 248, 0.15)",
                              color: "#7dd3fc",
                              border: "1px solid rgba(56, 189, 248, 0.35)",
                              fontSize: 12.5,
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            title="استعادة العطور الملكية التسعة الافتراضية فقط"
                          >
                            <span>👑 العطور الملكية فقط</span>
                          </button>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: 14, flexWrap: "wrap" }}>
                        <div style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>
                          عدد المنتجات المعروضة حالياً: <strong style={{ color: "#38bdf8", fontSize: 15 }}>{(draftData.featuredProductIds || DEFAULT_FEATURED_PRODUCT_IDS).length}</strong> منتج
                        </div>
                        <span style={{ color: "#475569" }}>•</span>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>
                          كل منتج محدد باللون الأخضر يظهر الآن مباشرة على الموقع.
                        </div>
                      </div>
                    </div>

                    {/* Sub-Filter Pills within Best Sellers Manager */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, background: "#f8fafc", padding: "12px 16px", borderRadius: 16, border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {[
                          { key: "all", label: "جميع المنتجات" },
                          { key: "active_only", label: "✓ المعروضة حالياً بالسيكشن" },
                          { key: "inactive_only", label: "غير المعروضة" },
                          { key: "men", label: "عطور رجالي" },
                          { key: "women", label: "عطور حريمي" },
                          { key: "unisex", label: "للجنسين" },
                          { key: "musk", label: "المسك" },
                          { key: "inspired", label: "مستوحى" },
                        ].map((sub) => (
                          <button
                            key={sub.key}
                            type="button"
                            onClick={() => setBestsellerSubFilter(sub.key)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: bestsellerSubFilter === sub.key ? 700 : 500,
                              background: bestsellerSubFilter === sub.key ? "#0f172a" : "#ffffff",
                              color: bestsellerSubFilter === sub.key ? "#ffffff" : "#475569",
                              border: bestsellerSubFilter === sub.key ? "1px solid #0f172a" : "1px solid #cbd5e1",
                              cursor: "pointer",
                            }}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>

                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        اضغط على أي زر لإضافة العطر أو حذفه فوراً من السيكشن
                      </div>
                    </div>

                    {/* Grid of Product Cards for Selection */}
                    <div className={styles.catalogGrid}>
                      {(() => {
                        const currentFeatured = draftData.featuredProductIds || DEFAULT_FEATURED_PRODUCT_IDS;
                        const allItems: Array<{
                          id: string;
                          itemKey: string;
                          itemType: "catalog" | "inspired";
                          name: string;
                          arabicName: string;
                          categoryAr: string;
                          image: string;
                          priceFormatted: string;
                          classification: string;
                          isFeatured: boolean;
                        }> = [];

                        // 1. Regular catalog products
                        for (const [id, prod] of Object.entries(draftData.products || {})) {
                          allItems.push({
                            id,
                            itemKey: `catalog-${id}`,
                            itemType: "catalog",
                            name: prod.name,
                            arabicName: prod.arabicName,
                            categoryAr: prod.category?.ar || "عطور فاخرة",
                            image: prod.image,
                            priceFormatted: prod.formattedPrice?.ar || `${prod.price} ج.م`,
                            classification: getProductClassification(prod),
                            isFeatured: currentFeatured.includes(id),
                          });
                        }

                        // 2. Inspired products
                        for (const [id, insp] of Object.entries(draftData.inspiredProducts || {})) {
                          allItems.push({
                            id,
                            itemKey: `inspired-${id}`,
                            itemType: "inspired",
                            name: insp.name,
                            arabicName: insp.arabicName,
                            categoryAr: "عطر مستوحى",
                            image: insp.image,
                            priceFormatted: insp.formattedPrice?.ar || `${insp.price} ج.م`,
                            classification: "inspired",
                            isFeatured: currentFeatured.includes(id),
                          });
                        }

                        // Filter by search & subFilter
                        const filtered = allItems.filter((item) => {
                          if (searchQuery) {
                            const q = searchQuery.toLowerCase();
                            if (!item.name.toLowerCase().includes(q) && !item.arabicName.includes(q)) return false;
                          }
                          if (bestsellerSubFilter === "active_only") return item.isFeatured;
                          if (bestsellerSubFilter === "inactive_only") return !item.isFeatured;
                          if (bestsellerSubFilter === "inspired") return item.classification === "inspired";
                          if (bestsellerSubFilter === "men") return item.classification === "men";
                          if (bestsellerSubFilter === "women") return item.classification === "women";
                          if (bestsellerSubFilter === "unisex") return item.classification === "unisex";
                          if (bestsellerSubFilter === "musk") return item.classification === "musk";
                          return true;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "50px 20px", background: "#f8fafc", borderRadius: 16 }}>
                              <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>لا توجد منتجات مطابقة لهذا الفلتر</p>
                            </div>
                          );
                        }

                        return filtered.map((item) => (
                          <div
                            key={item.itemKey}
                            className={styles.catalogItemCard}
                            style={{
                              border: item.isFeatured ? "2px solid #10b981" : "1px solid #e2e8f0",
                              boxShadow: item.isFeatured ? "0 4px 18px rgba(16, 185, 129, 0.12)" : "none",
                              position: "relative",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  padding: "3px 8px",
                                  borderRadius: 8,
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  background: item.isFeatured ? "#ecfdf5" : "#f1f5f9",
                                  color: item.isFeatured ? "#059669" : "#64748b",
                                }}
                              >
                                {item.isFeatured ? "✓ معروض في السيكشن" : "غير معروض"}
                              </span>

                              <span style={{ fontSize: 10.5, color: "#94a3b8" }}>
                                {item.categoryAr}
                              </span>
                            </div>

                            <div className={styles.catalogBottleRow}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.image}
                                alt={item.name}
                                className={styles.catalogBottleImg}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/products/half-million.jpg";
                                }}
                              />
                              <div className={styles.catalogInfo}>
                                <h4 className={styles.catalogName}>{item.arabicName}</h4>
                                <div className={styles.catalogCategory}>{item.name}</div>
                                <div className={styles.catalogPrice}>{item.priceFormatted}</div>
                              </div>
                            </div>

                            <div style={{ marginTop: "auto", paddingTop: 10 }}>
                              <button
                                type="button"
                                onClick={() => toggleFeaturedProduct(item.id)}
                                style={{
                                  width: "100%",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 6,
                                  padding: "9px 12px",
                                  borderRadius: 12,
                                  fontSize: 12.5,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  transition: "all 0.18s ease",
                                  background: item.isFeatured ? "#fee2e2" : "linear-gradient(135deg, #1d6bf3 0%, #0750cd 100%)",
                                  color: item.isFeatured ? "#b91c1c" : "#ffffff",
                                  border: item.isFeatured ? "1px solid #fca5a5" : "none",
                                }}
                              >
                                {item.isFeatured ? (
                                  <>
                                    <X size={14} />
                                    <span>إلغاء من اختياراتنا المميزة</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus size={14} />
                                    <span>+ إضافة إلى اختياراتنا المميزة</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                ) : selectedCategoryFilter === "inspired" ? (
                  (() => {
                    const inspiredList = Object.entries(draftData.inspiredProducts || {}).filter(([_, item]) => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        item.name.toLowerCase().includes(q) ||
                        item.arabicName.includes(q) ||
                        (item.inspiredByAr && item.inspiredByAr.includes(q)) ||
                        (item.inspiredByEn && item.inspiredByEn.toLowerCase().includes(q))
                      );
                    });

                    if (inspiredList.length === 0) {
                      return (
                        <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "50px 24px", background: "#f8fafc", borderRadius: 16, border: "1px dashed #cbd5e1" }}>
                          <p style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#334155" }}>
                            لا توجد عطور مستوحاة مضافة حالياً
                          </p>
                          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>
                            تم حذف جميع العطور المستوحاة بنجاح. يمكنك إضافة عطر مستوحى جديد بالضغط على الزر أدناه في أي وقت.
                          </p>
                          <button
                            type="button"
                            onClick={openCreateInspiredModal}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "9px 20px",
                              borderRadius: 20,
                              background: "linear-gradient(135deg, #1d6bf3 0%, #0750cd 100%)",
                              color: "#ffffff",
                              fontSize: 13,
                              fontWeight: 700,
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <Plus size={16} />
                            <span>+ إضافة عطر مستوحى جديد</span>
                          </button>
                        </div>
                      );
                    }

                    return (
                      <>
                        {/* Inspired Homepage Showcase Manager Banner */}
                        <div
                          style={{
                            gridColumn: "1 / -1",
                            background: "linear-gradient(135deg, #1e1b4b 0%, #31104b 100%)",
                            color: "#ffffff",
                            padding: "20px 24px",
                            borderRadius: 18,
                            border: "1px solid rgba(192, 132, 252, 0.3)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 16,
                            marginBottom: 8,
                            boxShadow: "0 8px 24px rgba(30, 27, 75, 0.25)",
                          }}
                        >
                          <div>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(192, 132, 252, 0.2)", border: "1px solid rgba(192, 132, 252, 0.4)", padding: "4px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, color: "#d8b4fe", marginBottom: 6 }}>
                              <Sparkles size={13} />
                              <span>سيكشن العطور المستوحاة بالصفحة الرئيسية (Inspired Homepage Showcase)</span>
                            </div>
                            <h4 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: "#ffffff" }}>
                              التحكم في الـ 6 عطور المعروضة افتراضياً في الصفحة الرئيسية
                            </h4>
                            <div style={{ fontSize: 12.5, color: "#cbd5e1" }}>
                              عدد العطور المختارة حالياً: <strong style={{ color: "#facc15", fontSize: 14 }}>{(draftData.featuredInspiredProductIds || DEFAULT_FEATURED_INSPIRED_PRODUCT_IDS).length}</strong> عطور (يوصى باختيار 6 ليظهر السيكشن بذكاء)
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                              type="button"
                              onClick={resetFeaturedInspiredToDefault}
                              style={{
                                padding: "8px 14px",
                                borderRadius: 12,
                                background: "rgba(255, 255, 255, 0.12)",
                                color: "#ffffff",
                                border: "1px solid rgba(255, 255, 255, 0.25)",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                              title="استعادة أشهر 6 عطور مستوحاة الأكثر مبيعاً"
                            >
                              <Award size={13} />
                              <span>👑 تعيين الـ 6 الأكثر طلباً تلقائياً</span>
                            </button>
                          </div>
                        </div>

                        {inspiredList.map(([id, item]) => {
                          const isFeaturedInBestsellers = (draftData.featuredProductIds || DEFAULT_FEATURED_PRODUCT_IDS).includes(id);
                          const isFeaturedInInspiredShowcase = (draftData.featuredInspiredProductIds || DEFAULT_FEATURED_INSPIRED_PRODUCT_IDS).includes(id);

                          return (
                            <div key={id} className={styles.catalogItemCard}>
                              <div className={styles.catalogBottleRow}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className={styles.catalogBottleImg}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/products/half-million.jpg";
                                  }}
                                />
                                <div className={styles.catalogInfo}>
                                  <h4 className={styles.catalogName}>{item.arabicName}</h4>
                                  <div className={styles.catalogCategory}>{item.name}</div>
                                  <div className={styles.catalogPrice}>{item.formattedPrice.ar}</div>
                                  {item.formattedOriginalPrice?.ar && (
                                    <div style={{ fontSize: 11, color: "#94a3b8", textDecoration: "line-through", marginTop: 2 }}>
                                      {item.formattedOriginalPrice.ar}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className={styles.catalogPyramidBox}>
                                <div className={styles.pyramidRow}>
                                  <span className={styles.pyramidLabel}>الحجم:</span>
                                  <span>{item.volume || "100 ml"}</span>
                                </div>
                                <div className={styles.pyramidRow}>
                                  <span className={styles.pyramidLabel}>التركيز:</span>
                                  <span>{item.concentrationAr || "خلاصة عطر نقي"}</span>
                                </div>
                                {item.descriptionAr && (
                                  <div className={styles.pyramidRow}>
                                    <span className={styles.pyramidLabel}>الوصف:</span>
                                    <span>{item.descriptionAr.slice(0, 60)}...</span>
                                  </div>
                                )}
                              </div>

                              {/* Toggle 1: Inspired Homepage 6-Perfumes Showcase */}
                              <button
                                type="button"
                                onClick={() => toggleFeaturedInspiredProduct(id)}
                                style={{
                                  width: "100%",
                                  marginBottom: 6,
                                  padding: "7px 12px",
                                  borderRadius: 10,
                                  border: isFeaturedInInspiredShowcase ? "1.5px solid #9333ea" : "1px dashed #cbd5e1",
                                  background: isFeaturedInInspiredShowcase ? "#faf5ff" : "#ffffff",
                                  color: isFeaturedInInspiredShowcase ? "#7e22ce" : "#64748b",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 6,
                                  transition: "all 0.18s ease",
                                }}
                                title={isFeaturedInInspiredShowcase ? "معروض في سيكشن المستوحاة بالرئيسية (اضغط للإلغاء)" : "اضغط لعرضه في سيكشن المستوحاة بالرئيسية"}
                              >
                                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <Sparkles size={13} color={isFeaturedInInspiredShowcase ? "#9333ea" : "#94a3b8"} />
                                  <span>{isFeaturedInInspiredShowcase ? "معروض في المستوحاة بالرئيسية" : "عرض في سيكشن المستوحاة"}</span>
                                </span>
                                <span
                                  style={{
                                    fontSize: 10.5,
                                    padding: "2px 7px",
                                    borderRadius: 6,
                                    background: isFeaturedInInspiredShowcase ? "#9333ea" : "#e2e8f0",
                                    color: isFeaturedInInspiredShowcase ? "#ffffff" : "#475569",
                                    fontWeight: 700,
                                  }}
                                >
                                  {isFeaturedInInspiredShowcase ? "✓ في الـ 6 الرئيسية" : "+ أضف"}
                                </span>
                              </button>

                              {/* Toggle 2: Bestsellers Showcase */}
                              <button
                                type="button"
                                onClick={() => toggleFeaturedProduct(id)}
                                style={{
                                  width: "100%",
                                  marginBottom: 10,
                                  padding: "6px 12px",
                                  borderRadius: 10,
                                  border: isFeaturedInBestsellers ? "1.5px solid #10b981" : "1px dashed #e2e8f0",
                                  background: isFeaturedInBestsellers ? "#ecfdf5" : "#f8fafc",
                                  color: isFeaturedInBestsellers ? "#047857" : "#94a3b8",
                                  fontSize: 11.5,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 6,
                                  transition: "all 0.18s ease",
                                }}
                                title={isFeaturedInBestsellers ? "معروض في شريط الأكثر مبيعاً (Best Sellers)" : "إضافة إلى شريط الأكثر مبيعاً"}
                              >
                                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <Star size={12} fill={isFeaturedInBestsellers ? "#10b981" : "none"} color={isFeaturedInBestsellers ? "#10b981" : "#94a3b8"} />
                                  <span>{isFeaturedInBestsellers ? "معروض في الأكثر مبيعاً" : "إضافة للأكثر مبيعاً"}</span>
                                </span>
                                <span
                                  style={{
                                    fontSize: 10,
                                    padding: "2px 6px",
                                    borderRadius: 6,
                                    background: isFeaturedInBestsellers ? "#10b981" : "#e2e8f0",
                                    color: isFeaturedInBestsellers ? "#ffffff" : "#64748b",
                                    fontWeight: 700,
                                  }}
                                >
                                  {isFeaturedInBestsellers ? "✓ معروض" : "+"}
                                </span>
                              </button>

                              <div style={{ display: "flex", gap: 8, marginTop: "auto", alignItems: "center" }}>
                                <button
                                  type="button"
                                  className={styles.publishActionBtn}
                                  style={{ flex: 1, padding: "8px 12px", fontSize: 12.5, justifyContent: "center" }}
                                  onClick={() => openEditInspiredModal(id)}
                                >
                                  تعديل سعر وتفاصيل العطر
                                </button>
                                <Link
                                  href="/inspired"
                                  target="_blank"
                                  className={styles.previewPillBtn}
                                  style={{ padding: "8px 12px" }}
                                  title="معاينة في صفحة INSPIRED"
                                >
                                  <ExternalLink size={14} />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => setDeleteInspiredConfirmId(id)}
                                  className={styles.deletePillBtn}
                                  style={{ padding: "8px 12px" }}
                                  title="حذف هذا العطر نهائياً"
                                  aria-label={`حذف عطر ${item.arabicName}`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    );
                  })()
                ) : productEntries.length === 0 ? (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "50px 24px", background: "#f8fafc", borderRadius: 16, border: "1px dashed #cbd5e1" }}>
                    <p style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#334155" }}>
                      {selectedCategoryFilter === "musk"
                        ? "لا توجد منتجات مسك مضافة حالياً في المتجر"
                        : "لا توجد منتجات متطابقة في هذا القسم"}
                    </p>
                    <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>
                      {selectedCategoryFilter === "musk"
                        ? "صفحة المسك مفعلة وشغالة بنجاح! يمكنك إضافة أول منتج مسك بالضغط على الزر أدناه وسيظهر فوراً في صفحة المسك."
                        : "يمكنك إضافة عطر جديد أو اختيار قسم آخر."}
                    </p>
                    {selectedCategoryFilter === "musk" && (
                      <button
                        type="button"
                        onClick={openCreateProductModal}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "9px 20px",
                          borderRadius: 20,
                          background: "linear-gradient(135deg, #1d6bf3 0%, #0750cd 100%)",
                          color: "#ffffff",
                          fontSize: 13,
                          fontWeight: 700,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={16} />
                        <span>+ إضافة أول منتج لمجموعة المسك</span>
                      </button>
                    )}
                  </div>
                ) : (
                  productEntries.map(([id, prod]) => {
                    const cls = getProductClassification(prod);
                    const meta = CLASSIFICATION_LABELS[cls] || CLASSIFICATION_LABELS.unisex;

                    return (
                      <div key={id} className={styles.catalogItemCard}>
                        <div className={styles.catalogBottleRow}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className={styles.catalogBottleImg}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/products/half-million.jpg";
                            }}
                          />
                          <div className={styles.catalogInfo}>
                            <h4 className={styles.catalogName}>{prod.arabicName}</h4>
                            <div className={styles.catalogCategory}>{prod.name}</div>
                            <div style={{ marginBottom: 6 }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: 8,
                                  color: meta.badgeColor,
                                  background: meta.badgeBg,
                                }}
                              >
                                {meta.ar}
                              </span>
                            </div>
                            <div className={styles.catalogPrice}>{prod.formattedPrice.ar}</div>
                          </div>
                        </div>

                        <div className={styles.catalogPyramidBox}>
                          <div className={styles.pyramidRow}>
                            <span className={styles.pyramidLabel}>المقدمة:</span>
                            <span>{prod.pyramid.topNotes.ar}</span>
                          </div>
                          <div className={styles.pyramidRow}>
                            <span className={styles.pyramidLabel}>قلب العطر:</span>
                            <span>{prod.pyramid.heartNotes.ar}</span>
                          </div>
                          <div className={styles.pyramidRow}>
                            <span className={styles.pyramidLabel}>القاعدة الثابتة:</span>
                            <span>{prod.pyramid.baseNotes.ar}</span>
                          </div>
                        </div>

                        {(() => {
                          const isFeatured = (draftData.featuredProductIds || DEFAULT_FEATURED_PRODUCT_IDS).includes(id);
                          return (
                            <button
                              type="button"
                              onClick={() => toggleFeaturedProduct(id)}
                              style={{
                                width: "100%",
                                marginBottom: 10,
                                padding: "7px 12px",
                                borderRadius: 10,
                                border: isFeatured ? "1.5px solid #10b981" : "1px dashed #cbd5e1",
                                background: isFeatured ? "#ecfdf5" : "#ffffff",
                                color: isFeatured ? "#047857" : "#64748b",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 6,
                                transition: "all 0.18s ease",
                              }}
                              title={isFeatured ? "معروض الآن في اختياراتنا المميزة (اضغط للإزالة)" : "اضغط لإضافته لقسم اختياراتنا المميزة"}
                            >
                              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Star size={13} fill={isFeatured ? "#10b981" : "none"} color={isFeatured ? "#10b981" : "#94a3b8"} />
                                <span>{isFeatured ? "معروض في اختياراتنا المميزة" : "إضافة إلى المميزة"}</span>
                              </span>
                              <span
                                style={{
                                  fontSize: 10.5,
                                  padding: "2px 7px",
                                  borderRadius: 6,
                                  background: isFeatured ? "#10b981" : "#e2e8f0",
                                  color: isFeatured ? "#ffffff" : "#475569",
                                  fontWeight: 700,
                                }}
                              >
                                {isFeatured ? "✓ معروض" : "+ أضف"}
                              </span>
                            </button>
                          );
                        })()}

                        <div style={{ display: "flex", gap: 8, marginTop: "auto", alignItems: "center" }}>
                          <button
                            type="button"
                            className={styles.publishActionBtn}
                            style={{ flex: 1, padding: "8px 12px", fontSize: 12.5, justifyContent: "center" }}
                            onClick={() => openProductModal(id)}
                          >
                            تعديل سعر وتفاصيل العطر
                          </button>
                          <Link
                            href={`/product/${id}`}
                            target="_blank"
                            className={styles.previewPillBtn}
                            style={{ padding: "8px 12px" }}
                            title="معاينة العطر في الموقع"
                          >
                            <ExternalLink size={14} />
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => promptDeleteProduct(id, e)}
                            className={styles.deletePillBtn}
                            style={{ padding: "8px 12px" }}
                            title="حذف هذا العطر نهائياً"
                            aria-label={`حذف عطر ${prod.arabicName}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              TAB: LUXURY DISCOUNT COUPONS & PROMO CODES
              ========================================================= */}
          {activeTab === "coupons" && (() => {
            const isCouponExpired = (c: CMSCoupon) => {
              if (!c.expiresAt) return false;
              const d = c.expiresAt.includes("T") ? new Date(c.expiresAt) : new Date(`${c.expiresAt}T23:59:59`);
              return !isNaN(d.getTime()) && Date.now() > d.getTime();
            };

            const allCoupons = Object.values(draftData.coupons || {});
            const activeCoupons = allCoupons.filter((c) => c.isActive && !isCouponExpired(c));
            const expiredCoupons = allCoupons.filter(isCouponExpired);
            const inactiveCoupons = allCoupons.filter((c) => !c.isActive || isCouponExpired(c));
            const percentCoupons = allCoupons.filter((c) => c.type === "percent");
            const maxPercent = percentCoupons.length > 0 ? Math.max(...percentCoupons.map((c) => c.value)) : 0;
            const ordersUsingCoupons = orders.filter((o) => Boolean(o.couponCode)).length;

            const filteredCoupons = allCoupons.filter((c) => {
              const expired = isCouponExpired(c);
              if (couponStatusFilter === "active" && (!c.isActive || expired)) return false;
              if (couponStatusFilter === "inactive" && c.isActive && !expired) return false;
              if (!couponSearchQuery.trim()) return true;
              const q = couponSearchQuery.trim().toLowerCase();
              return (
                c.code.toLowerCase().includes(q) ||
                (c.descriptionAr && c.descriptionAr.toLowerCase().includes(q))
              );
            });

            return (
              <div className={styles.dashboardContent}>
                {/* 1. Header Card */}
                <div className={styles.cleanCard} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: "linear-gradient(135deg, #0750cd 0%, #032b70 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        boxShadow: "0 6px 16px rgba(7, 80, 205, 0.28)",
                      }}>
                        <Tag size={22} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                          نظام أكواد الخصم والكوبونات الترويجية
                        </h3>
                        <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b" }}>
                          أنشئ وأدِر كوبونات الخصم بدقة واحترافية مثل البراندات العالمية، مع ضبط تاريخ انتهاء الصلاحية أوتوماتيكياً.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={openCreateCouponModal}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 20px",
                        borderRadius: 14,
                        background: "linear-gradient(135deg, #0750cd 0%, #1d6bf3 100%)",
                        color: "#ffffff",
                        fontSize: 13.5,
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(7, 80, 205, 0.28)",
                        transition: "transform 0.15s",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(-1px)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(0)")}
                    >
                      <Plus size={17} />
                      <span>+ إنشاء كود خصم جديد</span>
                    </button>
                  </div>
                </div>

                {/* 2. Metrics Bar (4 Cards) */}
                <div className={styles.couponMetricsGrid}>
                  {/* Card 1: Total Coupons */}
                  <div className={styles.couponMetricCard}>
                    <div className={styles.couponMetricIcon} style={{ background: "#eff6ff", color: "#1d4ed8" }}>
                      <Tag size={22} />
                    </div>
                    <div>
                      <div className={styles.couponMetricValue}>{allCoupons.length}</div>
                      <div className={styles.couponMetricLabel}>إجمالي الأكواد المسجلة</div>
                    </div>
                  </div>

                  {/* Card 2: Active Coupons */}
                  <div className={styles.couponMetricCard}>
                    <div className={styles.couponMetricIcon} style={{ background: "#ecfdf5", color: "#047857" }}>
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <div className={styles.couponMetricValue} style={{ color: "#047857" }}>{activeCoupons.length}</div>
                      <div className={styles.couponMetricLabel}>أكواد فعالة وصالحة الآن</div>
                    </div>
                  </div>

                  {/* Card 3: Max Discount */}
                  <div className={styles.couponMetricCard}>
                    <div className={styles.couponMetricIcon} style={{ background: "#fef3c7", color: "#b45309" }}>
                      <Percent size={22} />
                    </div>
                    <div>
                      <div className={styles.couponMetricValue}>{maxPercent > 0 ? `${maxPercent}%` : "—"}</div>
                      <div className={styles.couponMetricLabel}>أعلى نسبة خصم مئوية</div>
                    </div>
                  </div>

                  {/* Card 4: Orders Placed with Coupon */}
                  <div className={styles.couponMetricCard}>
                    <div className={styles.couponMetricIcon} style={{ background: "#f5f3ff", color: "#7c3aed" }}>
                      <ShoppingBag size={22} />
                    </div>
                    <div>
                      <div className={styles.couponMetricValue} style={{ color: "#7c3aed" }}>{ordersUsingCoupons}</div>
                      <div className={styles.couponMetricLabel}>أوردرات استفادت من الكوبونات</div>
                    </div>
                  </div>
                </div>

                {/* 3. Search and Filters Toolbar */}
                <div style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  padding: "12px 18px",
                  border: "1px solid #edf0f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 16,
                }}>
                  {/* Search Input */}
                  <div className={styles.searchBox} style={{ flex: 1, minWidth: 260, maxWidth: 420 }}>
                    <Search size={15} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="ابحث برمز الكوبون أو تفاصيل الخصم..."
                      className={styles.searchInput}
                      value={couponSearchQuery}
                      onChange={(e) => setCouponSearchQuery(e.target.value)}
                    />
                    {couponSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCouponSearchQuery("")}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setCouponStatusFilter("all")}
                      className={`${styles.filterPill} ${couponStatusFilter === "all" ? styles.filterPillActive : ""}`}
                    >
                      الكل ({allCoupons.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCouponStatusFilter("active")}
                      className={`${styles.filterPill} ${couponStatusFilter === "active" ? styles.filterPillActive : ""}`}
                    >
                      🟢 الفعالة الصالحة ({activeCoupons.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCouponStatusFilter("inactive")}
                      className={`${styles.filterPill} ${couponStatusFilter === "inactive" ? styles.filterPillActive : ""}`}
                    >
                      ⚪ المتوقفة والمنتهية ({inactiveCoupons.length})
                    </button>
                  </div>
                </div>

                {/* 4. Coupons Cards Grid */}
                {filteredCoupons.length === 0 ? (
                  <div style={{
                    background: "#ffffff",
                    borderRadius: 20,
                    padding: "48px 24px",
                    textAlign: "center",
                    border: "1px dashed #cbd5e1",
                  }}>
                    <Tag size={36} color="#94a3b8" style={{ margin: "0 auto 12px", display: "block" }} />
                    <h4 style={{ margin: 0, fontSize: 16, color: "#1e293b" }}>لا توجد أكواد خصم تطابق بحثك</h4>
                    <p style={{ margin: "4px 0 16px", fontSize: 13, color: "#64748b" }}>
                      يمكنك إنشاء كود خصم جديد لعملائك وتحديده كنسبة مئوية أو مبلغ ثابت وتاريخ انتهاء.
                    </p>
                    <button
                      type="button"
                      onClick={openCreateCouponModal}
                      className={styles.publishActionBtn}
                      style={{ margin: "0 auto" }}
                    >
                      <Plus size={15} /> إنشاء أول كود خصم
                    </button>
                  </div>
                ) : (
                  <div className={styles.couponsGrid}>
                    {filteredCoupons.map((coupon) => {
                      const isPercent = coupon.type === "percent";
                      const isCopied = copiedCouponCode === coupon.code;
                      const expiryDate = coupon.expiresAt
                        ? (coupon.expiresAt.includes("T") ? new Date(coupon.expiresAt) : new Date(`${coupon.expiresAt}T23:59:59`))
                        : null;
                      const isExpired = expiryDate ? (!isNaN(expiryDate.getTime()) && Date.now() > expiryDate.getTime()) : false;

                      return (
                        <div
                          key={coupon.id}
                          className={`${styles.couponCard} ${(!coupon.isActive || isExpired) ? styles.couponCardInactive : ""}`}
                        >
                          {/* Card Header: Code & Toggle */}
                          <div className={styles.couponCardHeader}>
                            <div className={styles.couponCodeBox}>
                              <span className={styles.couponCodeText}>{coupon.code}</span>
                              <button
                                type="button"
                                className={styles.couponCopyBtn}
                                onClick={() => copyCouponToClipboard(coupon.code)}
                                title="نسخ رمز الكوبون"
                              >
                                {isCopied ? <CheckCheck size={14} color="#16a34a" /> : <Copy size={13} />}
                              </button>
                            </div>

                            {/* Active/Inactive/Expired Status Badge */}
                            {isExpired ? (
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  padding: "5px 12px",
                                  borderRadius: 20,
                                  fontSize: 11.5,
                                  fontWeight: 700,
                                  background: "#fef2f2",
                                  color: "#dc2626",
                                  border: "1px solid #fecaca",
                                }}
                                title="انتهت صلاحية هذا الكود أوتوماتيكياً حسب تاريخ الانتهاء المحدد"
                              >
                                <span>منتهي الصلاحية ⏳</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleCouponStatus(coupon.id)}
                                className={`${styles.couponStatusToggle} ${
                                  coupon.isActive ? styles.couponStatusActive : styles.couponStatusDisabled
                                }`}
                                title={coupon.isActive ? "اضغط لإيقاف الكوبون مؤقتاً" : "اضغط لتفعيل الكوبون"}
                              >
                                <span
                                  style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    background: coupon.isActive ? "#10b981" : "#94a3b8",
                                  }}
                                />
                                <span>{coupon.isActive ? "نشط ومفعل" : "معطل مؤقتاً"}</span>
                              </button>
                            )}
                          </div>

                          {/* Value Display */}
                          <div>
                            <div className={styles.couponValueDisplay}>
                              <span className={styles.couponValueNumber}>
                                {isPercent ? `${coupon.value}%` : `${coupon.value.toLocaleString("ar-EG")}`}
                              </span>
                              <span className={styles.couponValueType}>
                                {isPercent ? "خصم مئوي من إجمالي السلة" : "ج.م خصم نقدي مباشر"}
                              </span>
                            </div>

                            {coupon.descriptionAr && (
                              <p className={styles.couponDescription} style={{ marginTop: 8 }}>
                                {coupon.descriptionAr}
                              </p>
                            )}
                          </div>

                          {/* Details Box */}
                          <div className={styles.couponDetailsBox}>
                            <div className={styles.couponDetailRow}>
                              <span className={styles.couponDetailLabel}>الحد الأدنى للطلب:</span>
                              <span className={styles.couponDetailValue}>
                                {coupon.minOrderAmount && coupon.minOrderAmount > 0
                                  ? `${coupon.minOrderAmount.toLocaleString("ar-EG")} ج.م`
                                  : "بدون حد أدنى (متاح لأي طلب)"}
                              </span>
                            </div>
                            <div className={styles.couponDetailRow}>
                              <span className={styles.couponDetailLabel}>صلاحية الكود:</span>
                              <span
                                className={styles.couponDetailValue}
                                style={{
                                  color: isExpired ? "#dc2626" : (expiryDate ? "#0750cd" : "#0f172a"),
                                  fontWeight: isExpired ? 800 : 700,
                                }}
                              >
                                {expiryDate ? (
                                  <>
                                    {expiryDate.toLocaleDateString("ar-EG", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                    {isExpired ? " (انتهى ⚠️)" : " (أوتوماتيك)"}
                                  </>
                                ) : (
                                  "صالح دائماً (بدون انتهاء ♾️)"
                                )}
                              </span>
                            </div>
                            <div className={styles.couponDetailRow}>
                              <span className={styles.couponDetailLabel}>النوع في النظام:</span>
                              <span className={styles.couponDetailValue}>
                                {isPercent ? "نسبة مئوية (%)" : "مبلغ خصم ثابت (EGP)"}
                              </span>
                            </div>
                            {coupon.createdAt && (
                              <div className={styles.couponDetailRow}>
                                <span className={styles.couponDetailLabel}>تاريخ الإنشاء:</span>
                                <span className={styles.couponDetailValue} style={{ fontSize: 11, color: "#64748b" }}>
                                  {new Date(coupon.createdAt).toLocaleDateString("ar-EG", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Actions Footer */}
                          <div className={styles.couponActions}>
                            <button
                              type="button"
                              className={styles.couponEditBtn}
                              onClick={() => openEditCouponModal(coupon.id)}
                            >
                              <Edit3 size={14} />
                              <span>تعديل تفاصيل الكود</span>
                            </button>
                            <button
                              type="button"
                              className={styles.couponDeleteBtn}
                              onClick={() => setCouponToDelete(coupon)}
                              title="حذف هذا الكوبون"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* =========================================================
              TAB: VISUALS & MEDIA HUB
              ========================================================= */}
          {activeTab === "visuals" && (
            <div className={styles.dashboardContent}>
              {/* 1. HERO SIZING & PROPORTIONS STUDIO (DESKTOP & MOBILE) */}
              {/* 1. HERO BANNER DIMENSIONS GUIDE (Sleek, Formal & Focused) */}
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 20px", marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                  {/* Left Label */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#334155" }}>
                      <Sliders size={16} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>المقاسات المعتمدة لبانرات الهيرو</h4>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>تم ضبط الموقع تلقائياً؛ ارفع التصميم بالأبعاد التالية ليظهر بدون أي قص</p>
                    </div>
                  </div>

                  {/* Right: Dimension Badges */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    {/* Desktop Dimension Badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px" }}>
                      <Monitor size={15} color="#475569" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>الكمبيوتر:</span>
                      <code style={{ fontFamily: "monospace", fontSize: 12.5, fontWeight: 700, color: "#0f172a", background: "#ffffff", border: "1px solid #cbd5e1", padding: "1px 7px", borderRadius: 5 }}>
                        2560 × 1100 px
                      </code>
                    </div>

                    {/* Mobile Dimension Badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px" }}>
                      <Smartphone size={15} color="#475569" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>الموبايل:</span>
                      <code style={{ fontFamily: "monospace", fontSize: 12.5, fontWeight: 700, color: "#0f172a", background: "#ffffff", border: "1px solid #cbd5e1", padding: "1px 7px", borderRadius: 5 }}>
                        1600 × 900 px (16:9 عريض)
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. HERO SLIDES MANAGER */}
              <div className={styles.cleanCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>شرائح البانر الرئيسي ({draftData.heroSlides.length} شرائح)</h3>
                    <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#64748b" }}>
                      يمكنك تخصيص صورة للديسكتوب وصورة أخرى للهاتف لكل شريحة على حدة، وإضافة وحذف الشرائح بحرية تامة وبدون أي ضغط على جودة الصورة.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.publishActionBtn}
                    onClick={() => {
                      const nextId = draftData.heroSlides.length > 0
                        ? Math.max(...draftData.heroSlides.map((s) => s.id)) + 1
                        : 0;
                      updateDraft((prev) => ({
                        ...prev,
                        heroSlides: [
                          ...prev.heroSlides,
                          {
                            id: nextId,
                            imageSrc: "/hero/hero-1.jpg",
                            link: "#bestsellers",
                            titleAr: "بانر جديد",
                            titleEn: "New Banner",
                          },
                        ],
                      }));
                      triggerToast("✓ تم إضافة شريحة بانر جديدة!");
                    }}
                  >
                    <Plus size={16} /> إضافة شريحة جديدة
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>
                  {draftData.heroSlides.map((slide, idx) => (
                    <div
                      key={slide.id}
                      style={{
                        background: "#ffffff",
                        borderRadius: 20,
                        padding: 20,
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", background: "#0750cd", color: "#ffffff", fontSize: 12, fontWeight: 700 }}>
                            {idx + 1}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>الشريحة رقم #{idx + 1}</span>
                        </div>
                        {draftData.heroSlides.length > 1 && (
                          <button
                            type="button"
                            style={{
                              background: "#fef2f2",
                              border: "1px solid #fee2e2",
                              color: "#dc2626",
                              fontSize: 12,
                              fontWeight: 600,
                              padding: "6px 12px",
                              borderRadius: 10,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                            onClick={() => {
                              updateDraft((prev) => ({
                                ...prev,
                                heroSlides: prev.heroSlides.filter((_, i) => i !== idx),
                              }));
                              triggerToast(`✓ تم حذف الشريحة #${idx + 1}`);
                            }}
                          >
                            <Trash2 size={13} /> حذف هذه الشريحة
                          </button>
                        )}
                      </div>

                      {/* Desktop & Mobile Upload Columns with Realistic Live Previews */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
                        {/* Desktop Image & Live Browser Mockup */}
                        <div style={{ background: "#f8fafc", borderRadius: 16, padding: 14, border: "1px solid #edf0f5", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                <Monitor size={15} color="#0750cd" />
                                <span>معاينة شاشات الكمبيوتر (Desktop)</span>
                              </div>
                              <code style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#0f172a", background: "#ffffff", border: "1px solid #cbd5e1", padding: "1px 6px", borderRadius: 4 }}>
                                2560 × 1100 px
                              </code>
                            </div>

                            {/* Realistic Desktop Browser Mockup */}
                            <div style={{
                              background: "#0f172a",
                              borderRadius: 12,
                              overflow: "hidden",
                              border: "1px solid #cbd5e1",
                              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
                              display: "flex",
                              flexDirection: "column",
                              height: 220,
                            }}>
                              {/* Browser Top Window Bar */}
                              <div style={{
                                height: 24,
                                background: "#1e293b",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "0 10px",
                                borderBottom: "1px solid #334155",
                                userSelect: "none",
                              }}>
                                <div style={{ display: "flex", gap: 5 }}>
                                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} />
                                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#eab308" }} />
                                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
                                </div>
                                <div style={{
                                  fontSize: 9.5,
                                  color: "#94a3b8",
                                  fontFamily: "monospace",
                                  background: "#0f172a",
                                  padding: "1px 12px",
                                  borderRadius: 5,
                                  border: "1px solid #334155",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4
                                }}>
                                  <span>🔒 juvenile-perfume.com</span>
                                </div>
                                <div style={{ width: 30, display: "flex", justifyContent: "flex-end" }}>
                                  <span style={{ fontSize: 9, color: "#64748b" }}>100%</span>
                                </div>
                              </div>

                              {/* Mini Store Header Bar */}
                              <div style={{
                                height: 22,
                                background: "#ffffff",
                                borderBottom: "1px solid #e2e8f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "0 10px",
                                userSelect: "none",
                              }}>
                                <span style={{ fontWeight: 800, fontSize: 9.5, letterSpacing: "1px", color: "#0750cd", fontFamily: "serif" }}>
                                  JUVENILE
                                </span>
                                <div style={{ display: "flex", gap: 8, fontSize: 8, color: "#64748b", fontWeight: 600 }}>
                                  <span>العطور</span>
                                  <span>العروض</span>
                                  <span>الأكثر مبيعاً</span>
                                </div>
                                <div style={{ display: "flex", gap: 5, fontSize: 8.5, color: "#475569" }}>
                                  <span>🔍</span>
                                  <span>🛍️</span>
                                </div>
                              </div>

                              {/* Mini Desktop Hero Banner Area */}
                              <div style={{
                                position: "relative",
                                flex: 1,
                                background: "#000000",
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={slide.imageSrc}
                                  alt={`Slide Desktop ${idx + 1}`}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                  }}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/hero/hero-1.jpg";
                                  }}
                                />

                                {/* Mini Hero Pagination Indicator */}
                                <div style={{
                                  position: "absolute",
                                  bottom: 6,
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  background: "rgba(15, 23, 42, 0.55)",
                                  backdropFilter: "blur(4px)",
                                  border: "1px solid rgba(255, 255, 255, 0.25)",
                                  borderRadius: 20,
                                  padding: "2px 8px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}>
                                  <span style={{ width: 12, height: 3.5, borderRadius: 2, background: "#ffffff" }} />
                                  <span style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: "rgba(255, 255, 255, 0.4)" }} />
                                  <span style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: "rgba(255, 255, 255, 0.4)" }} />
                                </div>

                                {uploadingSlideIdx === idx && (
                                  <div className={styles.uploadLoadingOverlay}>
                                    <span>جارِ رفع الصورة بجودتها الأصلية...</span>
                                  </div>
                                )}
                              </div>

                              {/* Mini Page Content Hint Below Banner */}
                              <div style={{
                                height: 18,
                                background: "#f8fafc",
                                borderTop: "1px solid #e2e8f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-around",
                                padding: "0 10px",
                              }}>
                                <span style={{ width: 40, height: 4, background: "#cbd5e1", borderRadius: 2 }} />
                                <span style={{ width: 40, height: 4, background: "#cbd5e1", borderRadius: 2 }} />
                                <span style={{ width: 40, height: 4, background: "#cbd5e1", borderRadius: 2 }} />
                              </div>
                            </div>
                          </div>

                          <div style={{ marginTop: 12 }}>
                            <label className={styles.directUploadBtn} style={{ margin: 0 }}>
                              <Upload size={14} />
                              <span>{uploadingSlideIdx === idx ? "جارِ الرفع..." : "رفع صورة الديسكتوب (WebP / صور)"}</span>
                              <input
                                type="file"
                                accept="image/*,.webp"
                                style={{ display: "none" }}
                                disabled={uploadingSlideIdx === idx}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleUploadBannerImage(idx, file);
                                  }
                                }}
                              />
                            </label>
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 6, textAlign: "center" }}>
                              🖥️ المعاينة توضح شكل الغلاف الفعلي لزوار الكمبيوتر واللابتوب
                            </div>
                          </div>
                        </div>

                        {/* Mobile Image & Live Phone Mockup */}
                        <div style={{ background: "#f8fafc", borderRadius: 16, padding: 14, border: "1px solid #edf0f5", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                <Smartphone size={15} color="#0750cd" />
                                <span>معاينة شاشات الهاتف (Mobile)</span>
                              </div>
                              <code style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#0f172a", background: "#ffffff", border: "1px solid #cbd5e1", padding: "1px 6px", borderRadius: 4 }}>
                                16:9 عريض (1600 × 900 px)
                              </code>
                            </div>

                            {/* Realistic Smartphone Mockup Container */}
                            <div style={{
                              background: "#e2e8f0",
                              borderRadius: 12,
                              height: 220,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              border: "1px solid #cbd5e1",
                            }}>
                              {/* Smartphone Frame (iPhone style) */}
                              <div style={{
                                width: 140,
                                height: 206,
                                background: "#ffffff",
                                borderRadius: 22,
                                border: "3px solid #0f172a",
                                boxShadow: "0 6px 18px rgba(15, 23, 42, 0.2)",
                                position: "relative",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                              }}>
                                {/* Dynamic Island / Top Speaker */}
                                <div style={{
                                  position: "absolute",
                                  top: 3,
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  width: 34,
                                  height: 4,
                                  background: "#0f172a",
                                  borderRadius: 4,
                                  zIndex: 5,
                                }} />

                                {/* Mini Mobile Header */}
                                <div style={{
                                  height: 20,
                                  padding: "4px 8px 0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  borderBottom: "1px solid #f1f5f9",
                                  background: "#ffffff",
                                  userSelect: "none",
                                }}>
                                  <span style={{ fontSize: 8, color: "#1e293b" }}>☰</span>
                                  <span style={{ fontWeight: 800, fontSize: 8, letterSpacing: "0.5px", color: "#0750cd", fontFamily: "serif" }}>
                                    JUVENILE
                                  </span>
                                  <span style={{ fontSize: 8, color: "#1e293b" }}>🛍️</span>
                                </div>

                                {/* Mini Mobile Hero Area */}
                                <div style={{
                                  position: "relative",
                                  width: "100%",
                                  aspectRatio: "16 / 9",
                                  background: "#000000",
                                  overflow: "hidden",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={slide.mobileImageSrc || slide.imageSrc}
                                    alt={`Slide Mobile ${idx + 1}`}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      display: "block",
                                    }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/hero/hero-1.jpg";
                                    }}
                                  />

                                  {/* Mini mobile dots */}
                                  <div style={{
                                    position: "absolute",
                                    bottom: 2.5,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    background: "rgba(15, 23, 42, 0.55)",
                                    borderRadius: 6,
                                    padding: "1px 5px",
                                    display: "flex",
                                    gap: 2.5,
                                  }}>
                                    <span style={{ width: 7, height: 2, borderRadius: 2, background: "#ffffff" }} />
                                    <span style={{ width: 2, height: 2, borderRadius: "50%", background: "rgba(255, 255, 255, 0.45)" }} />
                                    <span style={{ width: 2, height: 2, borderRadius: "50%", background: "rgba(255, 255, 255, 0.45)" }} />
                                  </div>

                                  {uploadingMobileSlideIdx === idx && (
                                    <div className={styles.uploadLoadingOverlay}>
                                      <span style={{ fontSize: 9 }}>جارِ الرفع...</span>
                                    </div>
                                  )}
                                </div>

                                {/* Mini Mobile Page Skeleton Below Banner */}
                                <div style={{ flex: 1, padding: "5px 6px", background: "#f8fafc", display: "flex", flexDirection: "column", gap: 4 }}>
                                  {/* Guarantees strip */}
                                  <div style={{ height: 8, background: "#ffffff", borderRadius: 3, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-around" }}>
                                    <span style={{ width: 14, height: 2.5, background: "#cbd5e1", borderRadius: 1 }} />
                                    <span style={{ width: 14, height: 2.5, background: "#cbd5e1", borderRadius: 1 }} />
                                    <span style={{ width: 14, height: 2.5, background: "#cbd5e1", borderRadius: 1 }} />
                                  </div>

                                  {/* Mini products grid */}
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3.5, flex: 1 }}>
                                    <div style={{ background: "#ffffff", borderRadius: 3, border: "1px solid #e2e8f0", padding: 2.5, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                      <div style={{ width: "100%", height: 34, background: "#f1f5f9", borderRadius: 2 }} />
                                      <div style={{ width: "70%", height: 2.5, background: "#cbd5e1", borderRadius: 1 }} />
                                    </div>
                                    <div style={{ background: "#ffffff", borderRadius: 3, border: "1px solid #e2e8f0", padding: 2.5, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                      <div style={{ width: "100%", height: 34, background: "#f1f5f9", borderRadius: 2 }} />
                                      <div style={{ width: "70%", height: 2.5, background: "#cbd5e1", borderRadius: 1 }} />
                                    </div>
                                  </div>
                                </div>

                                {/* iPhone Home Bar */}
                                <div style={{
                                  width: 36,
                                  height: 2.5,
                                  background: "#94a3b8",
                                  borderRadius: 2,
                                  margin: "0 auto 3px",
                                  flexShrink: 0,
                                }} />
                              </div>
                            </div>
                          </div>

                          <div style={{ marginTop: 12 }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <label className={styles.directUploadBtn} style={{ flex: 1, margin: 0 }}>
                                <Upload size={14} />
                                <span>{uploadingMobileSlideIdx === idx ? "جارِ الرفع..." : "رفع صورة مخصصة للهاتف"}</span>
                                <input
                                  type="file"
                                  accept="image/*,.webp"
                                  style={{ display: "none" }}
                                  disabled={uploadingMobileSlideIdx === idx}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleUploadBannerMobileImage(idx, file);
                                    }
                                  }}
                                />
                              </label>
                              {slide.mobileImageSrc && (
                                <button
                                  type="button"
                                  style={{
                                    background: "#ffffff",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: 10,
                                    padding: "0 10px",
                                    fontSize: 11,
                                    color: "#64748b",
                                    cursor: "pointer",
                                  }}
                                  title="إلغاء صورة الهاتف والاعتماد على صورة الديسكتوب"
                                  onClick={() => {
                                    updateDraft((prev) => {
                                      const copy = [...prev.heroSlides];
                                      const updated = { ...copy[idx] };
                                      delete updated.mobileImageSrc;
                                      copy[idx] = updated;
                                      return { ...prev, heroSlides: copy };
                                    });
                                    triggerToast("✓ تم إلغاء صورة الهاتف، سيتم استخدام صورة الديسكتوب");
                                  }}
                                >
                                  استخدام الديسكتوب
                                </button>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 6, textAlign: "center" }}>
                              📱 المعاينة توضح شكل الغلاف الفعلي داخل شاشة الهاتف قبل الحفظ
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Slide Link Input */}
                      <div className={styles.formGroup} style={{ marginTop: 14 }}>
                        <label className={styles.label}>رابط التوجيه عند الضغط على الشريحة (Link):</label>
                        <input
                          type="text"
                          className={styles.cleanInput}
                          value={slide.link}
                          placeholder="مثال: #bestsellers أو /category/men أو #offers"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const copy = [...prev.heroSlides];
                              copy[idx] = { ...copy[idx], link: val };
                              return { ...prev, heroSlides: copy };
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div className={styles.cleanCard}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>كروت الأقسام السريعة والهايلايتس</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginTop: 14 }}>
                  {draftData.highlights.map((card, idx) => (
                    <div key={card.id} style={{ background: "#f8fafc", borderRadius: 16, padding: 14, border: "1px solid #edf0f5" }}>
                      <div className={styles.uploadCardContainer}>
                        <div className={styles.uploadImgWrap}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={card.image}
                            alt={card.labelAr}
                            className={styles.uploadPreviewImg}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/highlights/her.jpg";
                            }}
                          />
                          {uploadingHighlightIdx === idx && (
                            <div className={styles.uploadLoadingOverlay}>
                              <span>جارِ رفع صورة الكارت...</span>
                            </div>
                          )}
                        </div>

                        <label className={styles.directUploadBtn}>
                          <Upload size={14} />
                          <span>{uploadingHighlightIdx === idx ? "جارِ رفع الصورة..." : "رفع صورة الكارت من جهازك"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            disabled={uploadingHighlightIdx === idx}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadHighlightImage(idx, file);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <div className={styles.formGroup} style={{ marginTop: 8 }}>
                        <label className={styles.label}>الكلام اللي مكتوب على الكارت:</label>
                        <input
                          type="text"
                          className={styles.cleanInput}
                          value={card.labelAr}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const copy = [...prev.highlights];
                              copy[idx] = { ...copy[idx], labelAr: val };
                              return { ...prev, highlights: copy };
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Musk Page Configuration Card */}
              <div className={styles.cleanCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                      إعدادات وتصميم صفحة المسك الفاخر (Musk Page Hub)
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#64748b" }}>
                      يمكنك تخصيص غلاف البانر الرئيسي لصفحة المسك وعنوانها والوصف الترويجي لها في المتجر
                    </p>
                  </div>
                  <Link
                    href="/musk"
                    target="_blank"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      borderRadius: 20,
                      background: "#f8fafc",
                      color: "#334155",
                      fontSize: 12.5,
                      fontWeight: 600,
                      textDecoration: "none",
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <ExternalLink size={14} />
                    <span>معاينة صفحة المسك ↗</span>
                  </Link>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 360px) 1fr", gap: 20, alignItems: "start" }}>
                  {/* Banner Image Preview & Upload */}
                  <div style={{ background: "#f8fafc", borderRadius: 16, padding: 14, border: "1px solid #edf0f5" }}>
                    <label className={styles.label} style={{ marginBottom: 8, display: "block" }}>غلاف بانر صفحة المسك:</label>
                    <div className={styles.uploadCardContainer}>
                      <div className={styles.uploadImgWrap} style={{ height: 160 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={draftData.muskPage?.bannerImage || "/highlights/unisex.jpg"}
                          alt="Musk Page Banner"
                          className={styles.uploadPreviewImg}
                        />
                        {isUploadingMuskBanner && (
                          <div className={styles.uploadLoadingOverlay}>
                            <span>جارِ رفع صورة الغلاف...</span>
                          </div>
                        )}
                      </div>

                      <label className={styles.directUploadBtn}>
                        <Upload size={14} />
                        <span>{isUploadingMuskBanner ? "جارِ الرفع..." : "رفع صورة غلاف جديدة"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          disabled={isUploadingMuskBanner}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUploadMuskBanner(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Title & Subtitle Form */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>عنوان صفحة المسك (بالعربي):</label>
                      <input
                        type="text"
                        className={styles.cleanInput}
                        value={draftData.muskPage?.titleAr || "مجموعة المسك الفاخر"}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            muskPage: { ...(prev.muskPage || {}), titleAr: val },
                          }));
                        }}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>عنوان صفحة المسك (بالإنجليزي):</label>
                      <input
                        type="text"
                        className={styles.cleanInput}
                        value={draftData.muskPage?.titleEn || "EXCLUSIVE MUSK COLLECTION"}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            muskPage: { ...(prev.muskPage || {}), titleEn: val },
                          }));
                        }}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>الوصف الترويجي لصفحة المسك:</label>
                      <textarea
                        className={styles.cleanInput}
                        rows={2}
                        value={draftData.muskPage?.subtitleAr || "نقاء مخملي ونفحات نقية تأسر الحواس بأرقى خلاصات المسك الطبيعي والفرنسي الفاخر"}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            muskPage: { ...(prev.muskPage || {}), subtitleAr: val },
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. EDITORIAL VIDEOS MANAGER (قصص تُروى بالعطر) */}
              <div className={styles.cleanCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Film size={20} color="#0f172a" />
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                        فيديوهات القصص البصرية (Editorial Videos - قصص تُروى بالعطر)
                      </h3>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: "#f1f5f9", color: "#475569" }}>
                        {(draftData.editorialVideos || []).length} فيديو
                      </span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#64748b" }}>
                      تحكم كامل في مقاطع الفيديو المعروضة في قسم &quot;قصص تُروى بالعطر&quot; في الصفحة الرئيسية. يمكنك رفع فيديوهات من جهازك أو وضع روابط مباشرة وحذف وتعديل أي فيديو.
                    </p>
                  </div>

                  <button
                    type="button"
                    className={styles.publishActionBtn}
                    onClick={() => {
                      const currentVideos = draftData.editorialVideos || [];
                      const nextId = `v_${Date.now()}`;
                      updateDraft((prev) => ({
                        ...prev,
                        editorialVideos: [
                          ...(prev.editorialVideos || []),
                          {
                            id: nextId,
                            src: "/videos/showcase-1.mp4",
                            titleAr: "عنوان جديد",
                            titleEn: "NEW EDITORIAL",
                            labelAr: "إصدار خاص",
                            labelEn: "SPECIAL EDITION",
                          },
                        ],
                      }));
                      triggerToast("✓ تم إضافة فيديو جديد! لا تنسَ حفظ ونشر التعديلات");
                    }}
                  >
                    <Plus size={16} /> إضافة فيديو جديد
                  </button>
                </div>

                {/* Section Texts Config */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
                    <Edit3 size={15} /> نصوص وعناوين قسم الفيديوهات في الصفحة الرئيسية
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>عنوان القسم (عربي):</label>
                      <input
                        type="text"
                        className={styles.cleanInput}
                        value={draftData.editorialSection?.titleAr || "قصص تُروى بالعطر"}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            editorialSection: { ...(prev.editorialSection || {}), titleAr: val },
                          }));
                        }}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>عنوان القسم (إنجليزي):</label>
                      <input
                        type="text"
                        className={styles.cleanInput}
                        value={draftData.editorialSection?.titleEn || "BEYOND THE BOTTLE"}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            editorialSection: { ...(prev.editorialSection || {}), titleEn: val },
                          }));
                        }}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>الشعار العلوي (عربي):</label>
                      <input
                        type="text"
                        className={styles.cleanInput}
                        value={draftData.editorialSection?.eyebrowAr || "رؤية بصرية • JUVENILE EDITORIAL"}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            editorialSection: { ...(prev.editorialSection || {}), eyebrowAr: val },
                          }));
                        }}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>الشعار العلوي (إنجليزي):</label>
                      <input
                        type="text"
                        className={styles.cleanInput}
                        value={draftData.editorialSection?.eyebrowEn || "JUVENILE EDITORIAL"}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            editorialSection: { ...(prev.editorialSection || {}), eyebrowEn: val },
                          }));
                        }}
                      />
                    </div>
                    <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                      <label className={styles.label}>الوصف الترويجي للقسم (عربي):</label>
                      <input
                        type="text"
                        className={styles.cleanInput}
                        value={draftData.editorialSection?.subtitleAr || "اكتشف الحكايات والإلهام وراء كل عطر."}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            editorialSection: { ...(prev.editorialSection || {}), subtitleAr: val },
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Videos Cards List */}
                {(!draftData.editorialVideos || draftData.editorialVideos.length === 0) ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", background: "#f8fafc", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
                    <Film size={36} color="#94a3b8" style={{ marginBottom: 10 }} />
                    <p style={{ margin: "0 0 12px", fontSize: 14, color: "#64748b", fontWeight: 600 }}>
                      لا توجد فيديوهات مضافة حالياً في هذا القسم
                    </p>
                    <button
                      type="button"
                      className={styles.publishActionBtn}
                      onClick={() => {
                        updateDraft((prev) => ({
                          ...prev,
                          editorialVideos: [
                            {
                              id: "v1",
                              src: "/videos/showcase-1.mp4",
                              titleAr: "المجموعة الملكية",
                              titleEn: "ROYAL COLLECTION",
                              labelAr: "المجموعة الملكية",
                              labelEn: "ROYAL COLLECTION",
                            },
                            {
                              id: "v2",
                              src: "/videos/showcase-2.mp4",
                              titleAr: "إصدار 2026",
                              titleEn: "SIGNATURE EDITION",
                              labelAr: "إصدار 2026",
                              labelEn: "SIGNATURE EDITION",
                            },
                          ],
                        }));
                        triggerToast("✓ تم استرجاع الفيديوهات الافتراضية!");
                      }}
                    >
                      استرجاع الفيديوهات الافتراضية
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
                    {draftData.editorialVideos.map((video, idx) => (
                      <div
                        key={video.id || idx}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 14,
                          padding: 16,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 14,
                          position: "relative",
                        }}
                      >
                        {/* Video Card Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                            <Film size={15} color="#2563eb" /> فيديو #{idx + 1}: {video.titleAr || video.titleEn || "بدون عنوان"}
                          </span>
                          <button
                            type="button"
                            title="حذف هذا الفيديو"
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف الفيديو #${idx + 1}؟`)) {
                                updateDraft((prev) => {
                                  const list = (prev.editorialVideos || []).filter((_, i) => i !== idx);
                                  return { ...prev, editorialVideos: list };
                                });
                                triggerToast("✓ تم حذف الفيديو!");
                              }
                            }}
                            style={{
                              background: "#fef2f2",
                              border: "1px solid #fecaca",
                              color: "#ef4444",
                              borderRadius: 8,
                              padding: "4px 8px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            <Trash2 size={13} /> حذف
                          </button>
                        </div>

                        {/* Video Preview Player */}
                        <div style={{ width: "100%", height: 180, borderRadius: 10, overflow: "hidden", background: "#000000", position: "relative" }}>
                          <video
                            src={video.src}
                            controls
                            muted
                            playsInline
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                          {uploadingVideoIdx === idx && (
                            <div style={{
                              position: "absolute",
                              inset: 0,
                              background: "rgba(0,0,0,0.75)",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontSize: 13,
                              fontWeight: 600,
                              gap: 8,
                            }}>
                              <RefreshCw size={20} className={styles.spin} />
                              <span>جارِ رفع الفيديو إلى السيرفر...</span>
                            </div>
                          )}
                        </div>

                        {/* Upload Button & Direct URL */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                              padding: "10px 14px",
                              borderRadius: 10,
                              background: "#f8fafc",
                              border: "1px dashed #cbd5e1",
                              cursor: uploadingVideoIdx === idx ? "not-allowed" : "pointer",
                              color: "#1e293b",
                              fontSize: 12.5,
                              fontWeight: 600,
                              transition: "all 0.2s",
                            }}
                          >
                            <Upload size={15} color="#2563eb" />
                            <span>{uploadingVideoIdx === idx ? "جارِ الرفع..." : "رفع فيديو من جهازك (MP4 / WebM)"}</span>
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/quicktime,video/m4v"
                              style={{ display: "none" }}
                              disabled={uploadingVideoIdx === idx}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUploadEditorialVideo(idx, file);
                                }
                              }}
                            />
                          </label>

                          <div className={styles.formGroup}>
                            <label className={styles.label} style={{ fontSize: 11.5 }}>أو رابط الفيديو المباشر (URL):</label>
                            <input
                              type="text"
                              dir="ltr"
                              className={styles.cleanInput}
                              placeholder="/videos/showcase-1.mp4"
                              value={video.src}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft((prev) => {
                                  const list = [...(prev.editorialVideos || [])];
                                  list[idx] = { ...list[idx], src: val };
                                  return { ...prev, editorialVideos: list };
                                });
                              }}
                            />
                          </div>
                        </div>

                        {/* Text Fields */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div className={styles.formGroup}>
                            <label className={styles.label} style={{ fontSize: 11.5 }}>العنوان الرئيسي (عربي):</label>
                            <input
                              type="text"
                              className={styles.cleanInput}
                              placeholder="المجموعة الملكية"
                              value={video.titleAr || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft((prev) => {
                                  const list = [...(prev.editorialVideos || [])];
                                  list[idx] = { ...list[idx], titleAr: val };
                                  return { ...prev, editorialVideos: list };
                                });
                              }}
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.label} style={{ fontSize: 11.5 }}>العنوان الرئيسي (إنجليزي):</label>
                            <input
                              type="text"
                              className={styles.cleanInput}
                              placeholder="ROYAL COLLECTION"
                              value={video.titleEn || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft((prev) => {
                                  const list = [...(prev.editorialVideos || [])];
                                  list[idx] = { ...list[idx], titleEn: val };
                                  return { ...prev, editorialVideos: list };
                                });
                              }}
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.label} style={{ fontSize: 11.5 }}>السطر التوضيحي (عربي):</label>
                            <input
                              type="text"
                              className={styles.cleanInput}
                              placeholder="المجموعة الملكية"
                              value={video.labelAr || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft((prev) => {
                                  const list = [...(prev.editorialVideos || [])];
                                  list[idx] = { ...list[idx], labelAr: val };
                                  return { ...prev, editorialVideos: list };
                                });
                              }}
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.label} style={{ fontSize: 11.5 }}>السطر التوضيحي (إنجليزي):</label>
                            <input
                              type="text"
                              className={styles.cleanInput}
                              placeholder="ROYAL COLLECTION"
                              value={video.labelEn || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft((prev) => {
                                  const list = [...(prev.editorialVideos || [])];
                                  list[idx] = { ...list[idx], labelEn: val };
                                  return { ...prev, editorialVideos: list };
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. BUKHOOR & SCENTED AGARWOOD SHOWCASE MANAGER */}
              <div className={styles.cleanCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Flame size={20} color="#b45309" />
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                        قسم ومعرض البخور والعود المعطر (Bukhoor Showcase)
                      </h3>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 12,
                          background: draftData.bukhoorSection?.isEnabled !== false ? "#ecfdf5" : "#fef2f2",
                          color: draftData.bukhoorSection?.isEnabled !== false ? "#059669" : "#dc2626",
                        }}
                      >
                        {draftData.bukhoorSection?.isEnabled !== false ? "مُفعّل وظاهر" : "مخفي"}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: "#f1f5f9", color: "#475569" }}>
                        {(draftData.bukhoorSection?.items || DEFAULT_BUKHOOR_ITEMS).length} منتجات
                      </span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#64748b" }}>
                      تحكم كامل في غلاف البانر السينمائي، العناوين والنصوص الوصفية، والمنتجات المعروضة في قسم البخور بالصفحة الرئيسية وصفحة البخور.
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, background: "#f8fafc", padding: "6px 14px", borderRadius: 20, border: "1px solid #cbd5e1" }}>
                      <input
                        type="checkbox"
                        checked={draftData.bukhoorSection?.isEnabled !== false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          updateDraft((prev) => ({
                            ...prev,
                            bukhoorSection: {
                              ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION),
                              isEnabled: checked,
                            },
                          }));
                          triggerToast(checked ? "✓ تم تفعيل وإظهار قسم البخور" : "تم إخفاء قسم البخور من الصفحة الرئيسية");
                        }}
                      />
                      <span>إظهار القسم في الموقع</span>
                    </label>

                    <Link
                      href="/category/bukhoor"
                      target="_blank"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 14px",
                        borderRadius: 20,
                        background: "#f8fafc",
                        color: "#334155",
                        fontSize: 12.5,
                        fontWeight: 600,
                        textDecoration: "none",
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      <ExternalLink size={14} />
                      <span>معاينة صفحة البخور ↗</span>
                    </Link>
                  </div>
                </div>

                {/* 1. Cinematic Banner Cover & Live Visual Preview */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                      <ImageIcon size={16} color="#b45309" /> غلاف البانر السينمائي (Banner Cover)
                    </h4>
                    <button
                      type="button"
                      style={{
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 8,
                        padding: "4px 10px",
                        fontSize: 12,
                        color: "#475569",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        updateDraft((prev) => ({
                          ...prev,
                          bukhoorSection: {
                            ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION),
                            bannerImage: "/highlights/bukhoor-banner.jpg",
                          },
                        }));
                        triggerToast("✓ تم استعادة الغلاف الافتراضي للبانر");
                      }}
                    >
                      استعادة الغلاف الافتراضي
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, alignItems: "start" }}>
                    {/* Live Realistic Banner Preview */}
                    <div
                      style={{
                        position: "relative",
                        height: 200,
                        borderRadius: 12,
                        overflow: "hidden",
                        border: "1px solid #cbd5e1",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        padding: 16,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={draftData.bukhoorSection?.bannerImage || "/highlights/bukhoor-banner.jpg"}
                        alt="Bukhoor Banner Preview"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/highlights/bukhoor-banner.jpg";
                        }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.45)" }} />

                      <div style={{ position: "relative", zIndex: 2, color: "#ffffff" }}>
                        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>
                          {draftData.bukhoorSection?.bannerHeadlineAr || DEFAULT_BUKHOOR_SECTION.bannerHeadlineAr}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.9, maxWidth: 360, margin: "0 auto", lineHeight: 1.4 }}>
                          {draftData.bukhoorSection?.bannerSubtitleAr || DEFAULT_BUKHOOR_SECTION.bannerSubtitleAr}
                        </div>
                      </div>

                      {isUploadingBukhoorBanner && (
                        <div className={styles.uploadLoadingOverlay}>
                          <span>جارِ رفع صورة الغلاف...</span>
                        </div>
                      )}
                    </div>

                    {/* Upload Controls & URL */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <label className={styles.directUploadBtn} style={{ background: "#0f172a", color: "#ffffff", justifyContent: "center", padding: "10px 18px", borderRadius: 10 }}>
                        <Upload size={16} />
                        <span>{isUploadingBukhoorBanner ? "جارِ رفع الغلاف..." : "رفع صورة غلاف جديدة من جهازك"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          disabled={isUploadingBukhoorBanner}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUploadBukhoorBanner(file);
                            }
                          }}
                        />
                      </label>

                      <div className={styles.formGroup}>
                        <label className={styles.label} style={{ fontSize: 12 }}>أو رابط الصورة المباشر (Image URL):</label>
                        <input
                          type="text"
                          dir="ltr"
                          className={styles.cleanInput}
                          placeholder="/highlights/bukhoor-banner.jpg"
                          value={draftData.bukhoorSection?.bannerImage || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => ({
                              ...prev,
                              bukhoorSection: {
                                ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION),
                                bannerImage: val,
                              },
                            }));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Banner Headline & Subtitle Typography */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18, marginBottom: 20 }}>
                  <h4 style={{ margin: "0 0 14px", fontSize: 14.5, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                    <Type size={16} color="#b45309" /> نصوص البانر السينمائي (Mood Banner Typography)
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>العنوان الرئيسي للبانر (عربي):</label>
                      <input
                        type="text"
                        className={styles.cleanInput}
                        value={draftData.bukhoorSection?.bannerHeadlineAr ?? DEFAULT_BUKHOOR_SECTION.bannerHeadlineAr}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            bukhoorSection: {
                              ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION),
                              bannerHeadlineAr: val,
                            },
                          }));
                        }}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>العنوان الرئيسي للبانر (إنجليزي):</label>
                      <input
                        type="text"
                        className={styles.cleanInput}
                        value={draftData.bukhoorSection?.bannerHeadlineEn ?? DEFAULT_BUKHOOR_SECTION.bannerHeadlineEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            bukhoorSection: {
                              ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION),
                              bannerHeadlineEn: val,
                            },
                          }));
                        }}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>النص الوصفي للبانر (عربي):</label>
                      <textarea
                        rows={2}
                        className={styles.cleanInput}
                        value={draftData.bukhoorSection?.bannerSubtitleAr ?? DEFAULT_BUKHOOR_SECTION.bannerSubtitleAr}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            bukhoorSection: {
                              ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION),
                              bannerSubtitleAr: val,
                            },
                          }));
                        }}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>النص الوصفي للبانر (إنجليزي):</label>
                      <textarea
                        rows={2}
                        className={styles.cleanInput}
                        value={draftData.bukhoorSection?.bannerSubtitleEn ?? DEFAULT_BUKHOOR_SECTION.bannerSubtitleEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            bukhoorSection: {
                              ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION),
                              bannerSubtitleEn: val,
                            },
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Products Showcase Headers */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18, marginBottom: 20 }}>
                  <h4 style={{ margin: "0 0 14px", fontSize: 14.5, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                    <Edit3 size={16} color="#b45309" /> نصوص عنوان معرض المنتجات (Product Showcase Header)
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>عنوان المعرض (عربي):</label>
                      <input
                        type="text"
                        className={styles.cleanInput}
                        value={draftData.bukhoorSection?.titleAr ?? DEFAULT_BUKHOOR_SECTION.titleAr}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            bukhoorSection: {
                              ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION),
                              titleAr: val,
                            },
                          }));
                        }}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>عنوان المعرض (إنجليزي):</label>
                      <input
                        type="text"
                        className={styles.cleanInput}
                        value={draftData.bukhoorSection?.titleEn ?? DEFAULT_BUKHOOR_SECTION.titleEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            bukhoorSection: {
                              ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION),
                              titleEn: val,
                            },
                          }));
                        }}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>الوصف الفرعي للمعرض (عربي):</label>
                      <input
                        type="text"
                        className={styles.cleanInput}
                        value={draftData.bukhoorSection?.subtitleAr ?? DEFAULT_BUKHOOR_SECTION.subtitleAr}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            bukhoorSection: {
                              ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION),
                              subtitleAr: val,
                            },
                          }));
                        }}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>الوصف الفرعي للمعرض (إنجليزي):</label>
                      <input
                        type="text"
                        className={styles.cleanInput}
                        value={draftData.bukhoorSection?.subtitleEn ?? DEFAULT_BUKHOOR_SECTION.subtitleEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            bukhoorSection: {
                              ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION),
                              subtitleEn: val,
                            },
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Bukhoor Products Collection Manager */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                        <ShoppingBag size={17} color="#b45309" /> منتجات معرض البخور ({(draftData.bukhoorSection?.items || DEFAULT_BUKHOOR_ITEMS).length} منتج)
                      </h4>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>
                        يمكنك إضافة منتجات جديدة، رفع صور الزجاجات، تعديل الأسماء والأسعار وحالة التوفر (نفدت الكمية).
                      </p>
                    </div>

                    <button
                      type="button"
                      className={styles.publishActionBtn}
                      onClick={() => {
                        const currentItems = [...(draftData.bukhoorSection?.items || DEFAULT_BUKHOOR_ITEMS)];
                        const newId = `bukhoor-${Date.now()}`;
                        const newItem: CMSBukhoorItem = {
                          id: newId,
                          nameAr: "بخور جديد",
                          nameEn: "NEW BUKHOOR",
                          subAr: "عود مروكي معطر",
                          subEn: "Scented Agarwood",
                          priceRaw: 5860.4,
                          priceAr: "5,860.40 ج.م",
                          priceEn: "LE 5,860.40",
                          image: "/products/agarwood-rose.png",
                          isSoldOut: false,
                        };
                        updateDraft((prev) => ({
                          ...prev,
                          bukhoorSection: {
                            ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION),
                            items: [...currentItems, newItem],
                          },
                        }));
                        triggerToast("✓ تم إضافة منتج بخور جديد!");
                      }}
                    >
                      <Plus size={16} /> إضافة منتج بخور جديد
                    </button>
                  </div>

                  {/* Grid of Bukhoor Products */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                    {(draftData.bukhoorSection?.items || DEFAULT_BUKHOOR_ITEMS).map((item, idx) => (
                      <div
                        key={item.id || idx}
                        style={{
                          background: "#ffffff",
                          borderRadius: 16,
                          padding: 16,
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        {/* Top row: Index & Delete */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                            #{idx + 1} {item.nameAr}
                          </span>
                          {(draftData.bukhoorSection?.items || DEFAULT_BUKHOOR_ITEMS).length > 1 && (
                            <button
                              type="button"
                              style={{
                                background: "#fef2f2",
                                border: "1px solid #fee2e2",
                                color: "#dc2626",
                                fontSize: 11.5,
                                fontWeight: 600,
                                padding: "4px 8px",
                                borderRadius: 8,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                              onClick={() => {
                                updateDraft((prev) => {
                                  const currentItems = [...(prev.bukhoorSection?.items || DEFAULT_BUKHOOR_ITEMS)];
                                  return {
                                    ...prev,
                                    bukhoorSection: {
                                      ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION),
                                      items: currentItems.filter((_, i) => i !== idx),
                                    },
                                  };
                                });
                                triggerToast(`✓ تم حذف المنتج #${idx + 1}`);
                              }}
                            >
                              <Trash2 size={12} /> حذف
                            </button>
                          )}
                        </div>

                        {/* Image Preview & Upload */}
                        <div style={{ display: "flex", gap: 12, alignItems: "center", background: "#f8fafc", padding: 10, borderRadius: 12, border: "1px solid #edf0f5" }}>
                          <div style={{ position: "relative", width: 64, height: 64, borderRadius: 8, overflow: "hidden", background: "#ffffff", border: "1px solid #cbd5e1", flexShrink: 0 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image}
                              alt={item.nameAr}
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/products/agarwood-rose.png";
                              }}
                            />
                            {uploadingBukhoorItemIdx === idx && (
                              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", color: "#ffffff", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                                رفع...
                              </div>
                            )}
                          </div>

                          <div style={{ flex: 1 }}>
                            <label className={styles.directUploadBtn} style={{ fontSize: 11, padding: "5px 10px" }}>
                              <Upload size={12} />
                              <span>{uploadingBukhoorItemIdx === idx ? "جارِ الرفع..." : "تغيير الصورة"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                disabled={uploadingBukhoorItemIdx === idx}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleUploadBukhoorItemImage(idx, file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Names */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <div className={styles.formGroup}>
                            <label className={styles.label} style={{ fontSize: 11 }}>اسم المنتج (عربي):</label>
                            <input
                              type="text"
                              className={styles.cleanInput}
                              value={item.nameAr}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft((prev) => {
                                  const list = [...(prev.bukhoorSection?.items || DEFAULT_BUKHOOR_ITEMS)];
                                  list[idx] = { ...list[idx], nameAr: val };
                                  return {
                                    ...prev,
                                    bukhoorSection: { ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION), items: list },
                                  };
                                });
                              }}
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.label} style={{ fontSize: 11 }}>اسم المنتج (إنجليزي):</label>
                            <input
                              type="text"
                              className={styles.cleanInput}
                              value={item.nameEn}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft((prev) => {
                                  const list = [...(prev.bukhoorSection?.items || DEFAULT_BUKHOOR_ITEMS)];
                                  list[idx] = { ...list[idx], nameEn: val };
                                  return {
                                    ...prev,
                                    bukhoorSection: { ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION), items: list },
                                  };
                                });
                              }}
                            />
                          </div>
                        </div>

                        {/* Subtitles */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <div className={styles.formGroup}>
                            <label className={styles.label} style={{ fontSize: 11 }}>النوع/التصنيف (عربي):</label>
                            <input
                              type="text"
                              className={styles.cleanInput}
                              value={item.subAr}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft((prev) => {
                                  const list = [...(prev.bukhoorSection?.items || DEFAULT_BUKHOOR_ITEMS)];
                                  list[idx] = { ...list[idx], subAr: val };
                                  return {
                                    ...prev,
                                    bukhoorSection: { ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION), items: list },
                                  };
                                });
                              }}
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.label} style={{ fontSize: 11 }}>النوع/التصنيف (إنجليزي):</label>
                            <input
                              type="text"
                              className={styles.cleanInput}
                              value={item.subEn}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft((prev) => {
                                  const list = [...(prev.bukhoorSection?.items || DEFAULT_BUKHOOR_ITEMS)];
                                  list[idx] = { ...list[idx], subEn: val };
                                  return {
                                    ...prev,
                                    bukhoorSection: { ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION), items: list },
                                  };
                                });
                              }}
                            />
                          </div>
                        </div>

                        {/* Price and Stock Toggle */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, alignItems: "center" }}>
                          <div className={styles.formGroup}>
                            <label className={styles.label} style={{ fontSize: 11 }}>السعر (ج.م):</label>
                            <input
                              type="number"
                              className={styles.cleanInput}
                              value={item.priceRaw}
                              onChange={(e) => {
                                const num = parseFloat(e.target.value) || 0;
                                updateDraft((prev) => {
                                  const list = [...(prev.bukhoorSection?.items || DEFAULT_BUKHOOR_ITEMS)];
                                  list[idx] = {
                                    ...list[idx],
                                    priceRaw: num,
                                    priceAr: `${num.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م`,
                                    priceEn: `LE ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                  };
                                  return {
                                    ...prev,
                                    bukhoorSection: { ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION), items: list },
                                  };
                                });
                              }}
                            />
                          </div>

                          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, marginTop: 16 }}>
                            <input
                              type="checkbox"
                              checked={item.isSoldOut === true}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                updateDraft((prev) => {
                                  const list = [...(prev.bukhoorSection?.items || DEFAULT_BUKHOOR_ITEMS)];
                                  list[idx] = { ...list[idx], isSoldOut: checked };
                                  return {
                                    ...prev,
                                    bukhoorSection: { ...(prev.bukhoorSection || DEFAULT_BUKHOOR_SECTION), items: list },
                                  };
                                });
                              }}
                            />
                            <span style={{ color: item.isSoldOut ? "#dc2626" : "#475569" }}>نفدت الكمية</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB: PROMO ENGINE
              ========================================================= */}
          {activeTab === "copy" && (
            <div className={styles.dashboardContent}>
              <div className={styles.cleanCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>شريط العروض والخصومات اللي فوق</h3>
                    <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#64748b" }}>اكتب هنا عروض الشحن المجاني والخصومات اللي بتتحرك في أعلى الموقع</p>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={draftData.promoStrip.isEnabled}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        updateDraft((prev) => ({
                          ...prev,
                          promoStrip: { ...prev.promoStrip, isEnabled: checked },
                        }));
                      }}
                    />
                    <span>تشغيل الشريط في الموقع</span>
                  </label>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                  {draftData.promoStrip.items.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr auto",
                        gap: 12,
                        alignItems: "center",
                        background: "#f8fafc",
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "1px solid #edf0f5",
                      }}
                    >
                      <input
                        type="text"
                        className={styles.cleanInput}
                        value={item.ar}
                        placeholder="النص بالعربي (مثال: شحن مجاني لجميع الطلبات)"
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => {
                            const copy = [...prev.promoStrip.items];
                            copy[idx] = { ...copy[idx], ar: val };
                            return { ...prev, promoStrip: { ...prev.promoStrip, items: copy } };
                          });
                        }}
                      />
                      <input
                        type="text"
                        className={styles.cleanInput}
                        value={item.en}
                        dir="ltr"
                        placeholder="English Promo Text"
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => {
                            const copy = [...prev.promoStrip.items];
                            copy[idx] = { ...copy[idx], en: val };
                            return { ...prev, promoStrip: { ...prev.promoStrip, items: copy } };
                          });
                        }}
                      />
                      {draftData.promoStrip.items.length > 1 && (
                        <button
                          type="button"
                          style={{ background: "none", border: "none", color: "#cf142b", cursor: "pointer", padding: 6 }}
                          onClick={() => {
                            updateDraft((prev) => ({
                              ...prev,
                              promoStrip: {
                                ...prev.promoStrip,
                                items: prev.promoStrip.items.filter((_, i) => i !== idx),
                              },
                            }));
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    className={styles.publishActionBtn}
                    style={{ alignSelf: "flex-start", marginTop: 8 }}
                    onClick={() => {
                      const newId = `p${Date.now()}`;
                      updateDraft((prev) => ({
                        ...prev,
                        promoStrip: {
                          ...prev.promoStrip,
                          items: [...prev.promoStrip.items, { id: newId, ar: "عرض جديد متاح الآن", en: "New promo text" }],
                        },
                      }));
                    }}
                  >
                    <Plus size={15} /> إضافة عرض جديد
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          PRODUCT EDITING MODAL (FINEXY ROUNDED STYLE)
          ========================================================= */}
      {editingProductId && editingProductDraft && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalWindow} dir="rtl">
            <div className={styles.iosDragHandle} />
            <div className={styles.modalTop}>
              <h3 className={styles.modalHeading}>
                تعديل عطر: {editingProductDraft.arabicName} ({editingProductDraft.name})
              </h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => {
                  setEditingProductId(null);
                  setEditingProductDraft(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>الاسم بالعربي:</label>
                  <input
                    type="text"
                    className={styles.cleanInput}
                    value={editingProductDraft.arabicName}
                    onChange={(e) =>
                      setEditingProductDraft({ ...editingProductDraft, arabicName: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>الاسم بالإنجليزي:</label>
                  <input
                    type="text"
                    className={styles.cleanInput}
                    value={editingProductDraft.name}
                    dir="ltr"
                    onChange={(e) =>
                      setEditingProductDraft({ ...editingProductDraft, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>السعر الحالي للعطر (إزازة 100 مل بالجنيه):</label>
                <input
                  type="number"
                  className={styles.cleanInput}
                  value={editingProductDraft.price}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEditingProductDraft({
                      ...editingProductDraft,
                      price: val,
                      formattedPrice: {
                        ar: `${val.toLocaleString()} ج.م`,
                        en: `${val.toLocaleString()} LE`,
                      },
                    });
                  }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>السعر قبل الخصم (السعر القديم المشطوب بالجنيه):</label>
                <input
                  type="number"
                  className={styles.cleanInput}
                  placeholder="مثال: 2650 (اتركه فارغاً أو 0 إذا لا يوجد خصم)"
                  value={editingProductDraft.originalPrice || ""}
                  onChange={(e) => {
                    const rawVal = e.target.value.trim();
                    const val = Number(rawVal);
                    if (!rawVal || isNaN(val) || val <= 0) {
                      setEditingProductDraft({
                        ...editingProductDraft,
                        originalPrice: undefined,
                        formattedOriginalPrice: undefined,
                      });
                    } else {
                      setEditingProductDraft({
                        ...editingProductDraft,
                        originalPrice: val,
                        formattedOriginalPrice: {
                          ar: `${val.toLocaleString("en-US")} ج.م`,
                          en: `${val.toLocaleString("en-US")} LE`,
                        },
                      });
                    }
                  }}
                />
                <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 5, display: "block" }}>
                  💡 إذا وضعت رقماً هنا، سيظهر مشطوباً بجانب السعر الحالي في كروت العطور وصفحة المنتج ليوضح للزبون أن العطر كان بكذا وبقى بكذا.
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>تصنيف ونوع المنتج (يحدد ظهوره في أقسام وفلاتر المتجر):</label>
                <select
                  className={styles.cleanInput}
                  value={editingProductDraft.classification || getProductClassification(editingProductDraft)}
                  onChange={(e) => {
                    const val = e.target.value as ProductClassificationType;
                    setEditingProductDraft({
                      ...editingProductDraft,
                      classification: val,
                    });
                  }}
                  style={{ cursor: "pointer", fontWeight: 700, color: "#0f172a" }}
                >
                  <option value="inspired">عطور مستوحاة (Inspired Fragrances)</option>
                  <option value="men">عطور رجالية (Men)</option>
                  <option value="women">عطور حريمية (Women)</option>
                  <option value="unisex">عطور للجنسين (Unisex)</option>
                  <option value="bukhoor">بخور فاخر (Bukhoor)</option>
                  <option value="bodysplash">بادي سبلاش ومعطرات جسم (Body Splash)</option>
                  <option value="musk">مجموعة المسك الفاخر (Musk Collection)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                {(() => {
                  const isFeatured = (draftData.featuredProductIds || DEFAULT_FEATURED_PRODUCT_IDS).includes(editingProductId);
                  return (
                    <div
                      onClick={() => toggleFeaturedProduct(editingProductId)}
                      style={{
                        padding: "14px 18px",
                        borderRadius: 14,
                        border: isFeatured ? "1.5px solid #10b981" : "1.5px solid #e2e8f0",
                        background: isFeatured ? "#f0fdf4" : "#f8fafc",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: isFeatured ? "#10b981" : "#e2e8f0",
                            color: isFeatured ? "#ffffff" : "#64748b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Star size={18} fill={isFeatured ? "#ffffff" : "none"} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: isFeatured ? "#065f46" : "#1e293b" }}>
                            الظهور في شريط &quot;اختياراتنا المميزة&quot; (Best Sellers) بالرئيسية
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                            {isFeatured
                              ? "هذا العطر معروض حالياً في شريط الأكثر مبيعاً بالصفحة الرئيسية (انقر للاستبعاد)"
                              : "اضغط هنا لتضمين هذا العطر وإظهاره في شريط الأكثر مبيعاً بالصفحة الرئيسية"}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "6px 14px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          background: isFeatured ? "#10b981" : "#cbd5e1",
                          color: isFeatured ? "#ffffff" : "#475569",
                          flexShrink: 0,
                        }}
                      >
                        {isFeatured ? "✓ معروض بالسيكشن" : "+ غير معروض"}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>صورة العطر / المنتج:</label>
                <div className={styles.uploadCardContainer} style={{ background: "#f8fafc", borderRadius: 16, padding: 14, border: "1px solid #edf0f5" }}>
                  <div className={styles.uploadImgWrap} style={{ height: 160, background: "#ffffff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editingProductDraft.image}
                      alt={editingProductDraft.arabicName}
                      className={styles.uploadPreviewImg}
                      style={{ maxHeight: 150, width: "auto", objectFit: "contain" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/perfumes/bottle-clean.png";
                      }}
                    />
                    {isUploadingProductImg && (
                      <div className={styles.uploadLoadingOverlay}>
                        <span>جارِ رفع صورة العطر...</span>
                      </div>
                    )}
                  </div>

                  <label className={styles.directUploadBtn} style={{ marginTop: 12 }}>
                    <Upload size={16} />
                    <span>{isUploadingProductImg ? "جارِ رفع الصورة..." : "رفع صورة العطر من جهازك مباشرة"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      disabled={isUploadingProductImg}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUploadProductImage(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Pyramid */}
              <div style={{ background: "#f8fafc", borderRadius: 16, padding: 18, border: "1px solid #edf0f5" }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0750cd", marginBottom: 12 }}>
                  مكونات وريحة العطر
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>أول رشة بتشمها (افتتاحية العطر):</label>
                  <input
                    type="text"
                    className={styles.cleanInput}
                    value={editingProductDraft.pyramid.topNotes.ar}
                    onChange={(e) =>
                      setEditingProductDraft({
                        ...editingProductDraft,
                        pyramid: {
                          ...editingProductDraft.pyramid,
                          topNotes: { ...editingProductDraft.pyramid.topNotes, ar: e.target.value },
                        },
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup} style={{ marginTop: 10 }}>
                  <label className={styles.label}>ريحة العطر الأساسية (قلب العطر):</label>
                  <input
                    type="text"
                    className={styles.cleanInput}
                    value={editingProductDraft.pyramid.heartNotes.ar}
                    onChange={(e) =>
                      setEditingProductDraft({
                        ...editingProductDraft,
                        pyramid: {
                          ...editingProductDraft.pyramid,
                          heartNotes: { ...editingProductDraft.pyramid.heartNotes, ar: e.target.value },
                        },
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup} style={{ marginTop: 10 }}>
                  <label className={styles.label}>الريحة اللي بتثبت وتقعد معاك (قاعدة العطر):</label>
                  <input
                    type="text"
                    className={styles.cleanInput}
                    value={editingProductDraft.pyramid.baseNotes.ar}
                    onChange={(e) =>
                      setEditingProductDraft({
                        ...editingProductDraft,
                        pyramid: {
                          ...editingProductDraft.pyramid,
                          baseNotes: { ...editingProductDraft.pyramid.baseNotes, ar: e.target.value },
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>وصف العطر اللي بيظهر للزبون في الموقع:</label>
                <textarea
                  className={styles.cleanTextarea}
                  value={editingProductDraft.description.ar}
                  onChange={(e) =>
                    setEditingProductDraft({
                      ...editingProductDraft,
                      description: { ...editingProductDraft.description, ar: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className={styles.modalFooter} style={{ justifyContent: "space-between" }}>
              <button
                type="button"
                className={styles.deletePillBtn}
                style={{ padding: "9px 16px", borderRadius: 16 }}
                onClick={(e) => {
                  if (editingProductId) {
                    promptDeleteProduct(editingProductId, e);
                  }
                }}
              >
                <Trash2 size={14} />
                حذف هذا العطر نهائياً
              </button>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className={styles.previewPillBtn}
                  onClick={() => {
                    setEditingProductId(null);
                    setEditingProductDraft(null);
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className={styles.publishActionBtn}
                  onClick={saveProductModal}
                >
                  حفظ التعديلات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          PRODUCT DELETION CONFIRMATION MODAL (EXPLICIT CONFIRM)
          ========================================================= */}
      {deleteConfirmId && (() => {
        const targetProd = draftData.products?.[deleteConfirmId];
        return (
          <div className={styles.modalBackdrop} style={{ zIndex: 100010 }}>
            <div
              className={styles.deleteConfirmWindow}
              dir="rtl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-confirm-title"
            >
              <div className={styles.deleteWarningIconBox}>
                <Trash2 size={26} color="#dc2626" />
              </div>

              <h3 id="delete-confirm-title" className={styles.deleteConfirmTitle}>
                تأكيد حذف العطر نهائياً
              </h3>

              <p className={styles.deleteConfirmSubtitle}>
                هل أنت متأكد من رغبتك في حذف هذا العطر من متجر جوفينيل؟
              </p>

              {targetProd && (
                <div className={styles.deleteItemPreviewCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={targetProd.image}
                    alt={targetProd.name}
                    className={styles.deleteItemImg}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/products/half-million.jpg";
                    }}
                  />
                  <div className={styles.deleteItemDetails}>
                    <span className={styles.deleteItemNameAr}>{targetProd.arabicName}</span>
                    <span className={styles.deleteItemNameEn}>{targetProd.name}</span>
                    <span className={styles.deleteItemPrice}>{targetProd.formattedPrice.ar}</span>
                  </div>
                </div>
              )}

              <div className={styles.deleteNoticeBox}>
                <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>
                  <strong>تنبيه:</strong> سيتم حذف العطر فوراً من الموقع ولن يظهر للعملاء أو في الكتالوج بعد الحذف.
                </span>
              </div>

              <div className={styles.deleteActionsRow}>
                <button
                  type="button"
                  className={styles.deleteCancelBtn}
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                >
                  إلغاء وتراجع
                </button>
                <button
                  type="button"
                  className={styles.deleteConfirmBtn}
                  onClick={confirmDeleteProduct}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>جارِ الحذف...</>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      نعم، احذف العطر الآن
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================
          INSPIRED PERFUME BOTTLE EDITOR MODAL
          ========================================================= */}
      {editingInspiredDraft && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalWindow} dir="rtl" style={{ maxWidth: 640 }}>
            <div className={styles.iosDragHandle} />
            <div className={styles.modalTop}>
              <div>
                <h3 className={styles.modalHeading} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles size={18} color="#7c3aed" />
                  <span>
                    {isCreatingInspired
                      ? "إضافة إزازة عطر مستوحى جديدة"
                      : `تعديل إزازة: ${editingInspiredDraft.arabicName}`}
                  </span>
                </h3>
                <span style={{ fontSize: 13, color: "#64748b", display: "block", marginTop: 4 }}>
                  هذه الإزازة ستظهر حصرياً لعملائك في صفحة INSPIRED المستقلة.
                </span>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => {
                  setEditingInspiredId(null);
                  setEditingInspiredDraft(null);
                  setIsCreatingInspired(false);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* 1. Name in Juvenile */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>اسم العطر في جوفينيل (بالعربي):</label>
                  <input
                    type="text"
                    className={styles.cleanInput}
                    placeholder="مثال: جوفينيل رويال"
                    value={editingInspiredDraft.arabicName}
                    onChange={(e) =>
                      setEditingInspiredDraft({ ...editingInspiredDraft, arabicName: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>الاسم بالإنجليزي:</label>
                  <input
                    type="text"
                    className={styles.cleanInput}
                    placeholder="e.g. JUVENILE ROYALE"
                    value={editingInspiredDraft.name}
                    onChange={(e) =>
                      setEditingInspiredDraft({ ...editingInspiredDraft, name: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* 2. Pricing & Volume */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>السعر الحالي (ج.م):</label>
                  <input
                    type="number"
                    className={styles.cleanInput}
                    value={editingInspiredDraft.price}
                    onChange={(e) =>
                      setEditingInspiredDraft({ ...editingInspiredDraft, price: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>السعر القديم المشطوب:</label>
                  <input
                    type="number"
                    className={styles.cleanInput}
                    placeholder="اختياري"
                    value={editingInspiredDraft.originalPrice || ""}
                    onChange={(e) =>
                      setEditingInspiredDraft({
                        ...editingInspiredDraft,
                        originalPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>حجم الزجاجة:</label>
                  <input
                    type="text"
                    className={styles.cleanInput}
                    value={editingInspiredDraft.volume || "100 ml"}
                    onChange={(e) =>
                      setEditingInspiredDraft({ ...editingInspiredDraft, volume: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* 4. Bottle Image */}
              <div className={styles.formGroup}>
                <label className={styles.label}>صورة إزازة العطر:</label>
                <div className={styles.uploadCardContainer} style={{ background: "#f8fafc", borderRadius: 16, padding: 14, border: "1px solid #edf0f5" }}>
                  <div className={styles.uploadImgWrap} style={{ height: 150, background: "#ffffff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editingInspiredDraft.image}
                      alt={editingInspiredDraft.arabicName}
                      className={styles.uploadPreviewImg}
                      style={{ maxHeight: 140, width: "auto", objectFit: "contain" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/products/half-million.jpg";
                      }}
                    />
                    {isUploadingInspiredImg && (
                      <div className={styles.uploadLoadingOverlay}>
                        <span>جارِ رفع صورة الإزازة...</span>
                      </div>
                    )}
                  </div>

                  <label className={styles.directUploadBtn} style={{ marginTop: 12 }}>
                    <Upload size={16} />
                    <span>{isUploadingInspiredImg ? "جارِ رفع الصورة..." : "رفع صورة الإزازة من جهازك مباشرة"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      disabled={isUploadingInspiredImg}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUploadInspiredImage(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* 5. Description */}
              <div className={styles.formGroup}>
                <label className={styles.label}>وصف العطر ونبذة عنه:</label>
                <textarea
                  className={styles.cleanTextarea}
                  rows={3}
                  value={editingInspiredDraft.descriptionAr || ""}
                  onChange={(e) =>
                    setEditingInspiredDraft({ ...editingInspiredDraft, descriptionAr: e.target.value })
                  }
                  placeholder="وصف مختصر للرائحة والمكونات والثبات..."
                />
              </div>

              {editingInspiredId && (
                <>
                  <div className={styles.formGroup}>
                    {(() => {
                      const isInspiredFeatured = (draftData.featuredInspiredProductIds || DEFAULT_FEATURED_INSPIRED_PRODUCT_IDS).includes(editingInspiredId);
                      return (
                        <div
                          onClick={() => toggleFeaturedInspiredProduct(editingInspiredId)}
                          style={{
                            padding: "14px 18px",
                            borderRadius: 14,
                            border: isInspiredFeatured ? "1.5px solid #9333ea" : "1.5px solid #e2e8f0",
                            background: isInspiredFeatured ? "#faf5ff" : "#f8fafc",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            transition: "all 0.2s ease",
                            marginBottom: 8,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: isInspiredFeatured ? "#9333ea" : "#e2e8f0",
                                color: isInspiredFeatured ? "#ffffff" : "#64748b",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <Sparkles size={18} />
                            </div>
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 700, color: isInspiredFeatured ? "#6b21a8" : "#1e293b" }}>
                                الظهور في سيكشن &quot;العطور المستوحاة&quot; (Inspired Showcase) بالصفحة الرئيسية
                              </div>
                              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                                {isInspiredFeatured
                                  ? "هذا العطر معروض حالياً ضمن الـ 6 عطور المستوحاة بالصفحة الرئيسية (انقر للاستبعاد)"
                                  : "اضغط هنا لعرض هذا العطر ضمن الـ 6 عطور المستوحاة في الصفحة الرئيسية"}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              padding: "6px 14px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 700,
                              background: isInspiredFeatured ? "#9333ea" : "#cbd5e1",
                              color: isInspiredFeatured ? "#ffffff" : "#475569",
                              flexShrink: 0,
                            }}
                          >
                            {isInspiredFeatured ? "✓ معروض بالرئيسية (6)" : "+ غير معروض"}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className={styles.formGroup}>
                  {(() => {
                    const isFeatured = (draftData.featuredProductIds || DEFAULT_FEATURED_PRODUCT_IDS).includes(editingInspiredId);
                    return (
                      <div
                        onClick={() => toggleFeaturedProduct(editingInspiredId)}
                        style={{
                          padding: "14px 18px",
                          borderRadius: 14,
                          border: isFeatured ? "1.5px solid #10b981" : "1.5px solid #e2e8f0",
                          background: isFeatured ? "#f0fdf4" : "#f8fafc",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              background: isFeatured ? "#10b981" : "#e2e8f0",
                              color: isFeatured ? "#ffffff" : "#64748b",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Star size={18} fill={isFeatured ? "#ffffff" : "none"} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: isFeatured ? "#065f46" : "#1e293b" }}>
                              الظهور في شريط &quot;اختياراتنا المميزة&quot; (Best Sellers) بالرئيسية
                            </div>
                            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                              {isFeatured
                                ? "هذه الإزازة معروضة حالياً في شريط الأكثر مبيعاً بالرئيسية (انقر للاستبعاد)"
                                : "اضغط هنا لتضمين هذه الإزازة في شريط الأكثر مبيعاً المعروض بالصفحة الرئيسية"}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            padding: "6px 14px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 700,
                            background: isFeatured ? "#10b981" : "#cbd5e1",
                            color: isFeatured ? "#ffffff" : "#475569",
                            flexShrink: 0,
                          }}
                        >
                          {isFeatured ? "✓ معروض بالسيكشن" : "+ غير معروض"}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
            </div>

            <div className={styles.modalFooter} style={{ justifyContent: "space-between" }}>
              {!isCreatingInspired ? (
                <button
                  type="button"
                  className={styles.deletePillBtn}
                  onClick={() => setDeleteInspiredConfirmId(editingInspiredId)}
                >
                  <Trash2 size={14} />
                  حذف هذه الإزازة
                </button>
              ) : <div />}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className={styles.previewPillBtn}
                  onClick={() => {
                    setEditingInspiredId(null);
                    setEditingInspiredDraft(null);
                    setIsCreatingInspired(false);
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className={styles.publishActionBtn}
                  style={{ background: "#7c3aed" }}
                  onClick={saveInspiredModal}
                >
                  حفظ ونشر الإزازة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          INSPIRED PERFUME DELETION CONFIRMATION MODAL
          ========================================================= */}
      {deleteInspiredConfirmId && (() => {
        const item = draftData.inspiredProducts?.[deleteInspiredConfirmId];
        return (
          <div className={styles.modalBackdrop} style={{ zIndex: 100010 }}>
            <div className={styles.deleteConfirmWindow} dir="rtl">
              <div className={styles.deleteWarningIconBox}>
                <Trash2 size={26} color="#dc2626" />
              </div>
              <h3 className={styles.deleteConfirmTitle}>تأكيد حذف إزازة العطر المستوحى</h3>
              <p className={styles.deleteConfirmSubtitle}>
                هل أنت متأكد من رغبتك في حذف هذا العطر من صفحة العطور المستوحاة (INSPIRED)؟
              </p>
              {item && (
                <div className={styles.deleteItemPreviewCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.deleteItemImg}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/products/half-million.jpg";
                    }}
                  />
                  <div className={styles.deleteItemDetails}>
                    <span className={styles.deleteItemNameAr}>{item.arabicName}</span>
                    <span className={styles.deleteItemNameEn}>مستوحى من: {item.inspiredByAr}</span>
                    <span className={styles.deleteItemPrice}>{item.formattedPrice.ar}</span>
                  </div>
                </div>
              )}
              <div className={styles.deleteActionsRow}>
                <button
                  type="button"
                  className={styles.deleteCancelBtn}
                  onClick={() => setDeleteInspiredConfirmId(null)}
                >
                  إلغاء وتراجع
                </button>
                <button
                  type="button"
                  className={styles.deleteConfirmBtn}
                  onClick={() => deleteInspiredPerfume(deleteInspiredConfirmId)}
                >
                  <Trash2 size={16} />
                  نعم، احذف الإزازة
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================
          ORDER DETAILS INSPECTION MODAL (FULL CUSTOMER & ORDER VIEW)
          ========================================================= */}
      {selectedOrderForModal && (() => {
        const ord = selectedOrderForModal;
        const statusConf = ORDER_STATUS_CONFIG[ord.status] || ORDER_STATUS_CONFIG.pending_confirmation;
        const cleanPhone = (ord.customer.phone || "").replace(/\D/g, "");
        const waPhone = cleanPhone.startsWith("0") ? `2${cleanPhone}` : cleanPhone;
        const waMsg = encodeURIComponent(
          `أهلاً بك أستاذ ${ord.customer.firstName}، معاك براند جوفينيل للعطور بخصوص طلبك رقم ${ord.orderId}.`
        );

        return (
          <div
            className={styles.modalBackdrop}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedOrderForModal(null);
            }}
          >
            <div className={styles.orderDetailModalWindow} dir="rtl">
              {/* Header */}
              <div className={styles.orderModalHeader}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                      تفاصيل الطلب #{ord.orderId}
                    </h3>
                    <span
                      className={`${styles.statusBadgeBase} ${statusConf.badgeClass}`}
                      style={{ fontSize: 11.5 }}
                    >
                      {statusConf.label}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, display: "block" }}>
                    تاريخ ووقت تسجيل الطلب:{" "}
                    {new Date(ord.createdAt).toLocaleString("ar-EG", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForModal(null)}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#64748b",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className={styles.orderModalBody}>
                {/* 1. Customer & Shipping Destination */}
                <div className={styles.orderDetailSection}>
                  <div className={styles.orderDetailSectionTitle}>
                    <MapPin size={16} color="#0750cd" />
                    <span>بيانات العميل ومكان التوصيل</span>
                  </div>
                  <div className={styles.orderDetailRow}>
                    <span className={styles.orderDetailLabel}>اسم العميل:</span>
                    <span className={styles.orderDetailValue}>
                      {ord.customer.firstName} {ord.customer.lastName}
                    </span>
                  </div>
                  <div className={styles.orderDetailRow}>
                    <span className={styles.orderDetailLabel}>رقم الموبايل الأساسي:</span>
                    <span className={styles.orderDetailValue} style={{ direction: "ltr" }}>
                      <a href={`tel:${ord.customer.phone}`} style={{ color: "#0750cd", textDecoration: "none" }}>
                        {ord.customer.phone}
                      </a>
                    </span>
                  </div>
                  {ord.customer.secondaryPhone && (
                    <div className={styles.orderDetailRow}>
                      <span className={styles.orderDetailLabel}>رقم موبايل إضافي:</span>
                      <span className={styles.orderDetailValue} style={{ direction: "ltr" }}>
                        {ord.customer.secondaryPhone}
                      </span>
                    </div>
                  )}
                  <div className={styles.orderDetailRow}>
                    <span className={styles.orderDetailLabel}>المحافظة والمدينة:</span>
                    <span className={styles.orderDetailValue}>
                      {ord.delivery.governorate} {ord.delivery.city ? `- ${ord.delivery.city}` : ""}
                    </span>
                  </div>
                  <div className={styles.orderDetailRow}>
                    <span className={styles.orderDetailLabel}>العنوان التفصيلي:</span>
                    <span className={styles.orderDetailValue}>
                      {ord.delivery.address} {ord.delivery.apartment ? `(شقة/علامة: ${ord.delivery.apartment})` : ""}
                    </span>
                  </div>
                  {ord.customer.notes && (
                    <div className={styles.orderDetailRow}>
                      <span className={styles.orderDetailLabel}>ملاحظات العميل:</span>
                      <span className={styles.orderDetailValue} style={{ color: "#d97706" }}>
                        {ord.customer.notes}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Items in Order */}
                <div className={styles.orderDetailSection}>
                  <div className={styles.orderDetailSectionTitle}>
                    <Package size={16} color="#0750cd" />
                    <span>العطور المطلوبة والكميات ({(ord.items || []).length} صنف)</span>
                  </div>
                  {(ord.items || []).map((item, idx) => (
                    <div key={idx} className={styles.orderItemModalCard}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a" }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
                          الكمية: {item.quantity} | السعر للقطعة: {(item.price || 0).toLocaleString("ar-EG")} ج.م
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: "#0750cd", fontSize: 14 }}>
                        {((item.price || 0) * (item.quantity || 1)).toLocaleString("ar-EG")} ج.م
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed #cbd5e1" }}>
                    <div className={styles.orderDetailRow}>
                      <span className={styles.orderDetailLabel}>المجموع الفرعي:</span>
                      <span className={styles.orderDetailValue}>
                        {(ord.subtotal || ord.total || 0).toLocaleString("ar-EG")} ج.م
                      </span>
                    </div>
                    {(ord.discount > 0 || ord.couponCode) && (
                      <div className={styles.orderDetailRow}>
                        <span className={styles.orderDetailLabel}>
                          كود الخصم المطبق {ord.couponCode ? `(${ord.couponCode})` : ""}:
                        </span>
                        <span className={styles.orderDetailValue} style={{ color: "#16a34a", fontWeight: 700 }}>
                          -{(ord.discount || 0).toLocaleString("ar-EG")} ج.م
                        </span>
                      </div>
                    )}
                    <div className={styles.orderDetailRow}>
                      <span className={styles.orderDetailLabel}>تكلفة الشحن والتوصيل:</span>
                      <span className={styles.orderDetailValue}>
                        {ord.shipping?.cost ? `${ord.shipping.cost} ج.م` : "شحن مجاني فاخر"}
                      </span>
                    </div>
                    <div className={styles.orderDetailRow} style={{ paddingTop: 8, fontSize: 15 }}>
                      <span className={styles.orderDetailLabel} style={{ fontWeight: 800, color: "#0f172a" }}>
                        الإجمالي النهائي المطلوب تحصيله:
                      </span>
                      <span className={styles.orderDetailValue} style={{ fontWeight: 900, color: "#0750cd", fontSize: 17 }}>
                        {(ord.total || 0).toLocaleString("ar-EG")} ج.م
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Status Controller */}
                <div className={styles.orderDetailSection} style={{ background: "#ffffff", border: "1.5px solid #e2e8f0" }}>
                  <div className={styles.orderDetailSectionTitle}>
                    <Clock size={16} color="#0750cd" />
                    <span>تغيير حالة الطلب والتوصيل</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <select
                      value={ord.status}
                      disabled={isUpdatingOrderId === ord.orderId}
                      onChange={(e) =>
                        handleUpdateOrderStatus(ord.orderId, e.target.value as CustomerOrder["status"])
                      }
                      className={styles.statusSelectControl}
                      style={{
                        background: statusConf.bg,
                        color: statusConf.color,
                        borderColor: statusConf.borderColor,
                        fontSize: 13,
                        padding: "8px 28px 8px 14px",
                        flex: 1,
                      }}
                    >
                      <option value="pending_confirmation">طلب جديد (قيد التأكيد والمراجعة)</option>
                      <option value="processing">جاري تجهيز وتعبئة العطر</option>
                      <option value="shipped">خرج للشحن مع المندوب</option>
                      <option value="delivered">تم التوصيل والاستلام بنجاح</option>
                      <option value="cancelled">طلب ملغي</option>
                    </select>
                    {isUpdatingOrderId === ord.orderId && (
                      <span style={{ fontSize: 12, color: "#0750cd", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <RefreshCw size={13} className="animate-spin" /> جارِ الحفظ...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "16px 26px",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#f8fafc",
                }}
              >
                <div style={{ display: "flex", gap: 10 }}>
                  <a
                    href={`https://wa.me/${waPhone}?text=${waMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappDirectBtn}
                    style={{ padding: "8px 16px", fontSize: 13 }}
                  >
                    <MessageCircle size={15} />
                    <span>تواصل عبر واتساب</span>
                  </a>
                  <a
                    href={`tel:${ord.customer.phone}`}
                    className={styles.actionBtnSecondary}
                    style={{ padding: "8px 14px", gap: 6 }}
                  >
                    <Phone size={14} />
                    <span>اتصال تليفوني</span>
                  </a>
                </div>

                <button
                  type="button"
                  className={styles.previewPillBtn}
                  onClick={() => setSelectedOrderForModal(null)}
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================
          ORDER DELETION CONFIRMATION MODAL
          ========================================================= */}
      {orderToDelete && (
        <div className={styles.modalBackdrop} style={{ zIndex: 100010 }}>
          <div className={styles.deleteConfirmWindow} dir="rtl">
            <div className={styles.deleteWarningIconBox}>
              <Trash2 size={26} color="#dc2626" />
            </div>
            <h3 className={styles.deleteConfirmTitle}>تأكيد حذف الطلب</h3>
            <p className={styles.deleteConfirmSubtitle}>
              هل أنت متأكد من حذف الطلب رقم (#{orderToDelete.orderId}) للعميل ({orderToDelete.customer.firstName} {orderToDelete.customer.lastName})؟
            </p>
            <div className={styles.deleteActionsRow}>
              <button
                type="button"
                className={styles.deleteCancelBtn}
                onClick={() => setOrderToDelete(null)}
              >
                إلغاء وتراجع
              </button>
              <button
                type="button"
                className={styles.deleteConfirmBtn}
                onClick={() => handleDeleteOrder(orderToDelete.orderId)}
              >
                <Trash2 size={16} />
                نعم، احذف الطلب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          WHATSAPP BOT CONNECTION & QR CODE MODAL
          ========================================================= */}
      {showWhatsAppModal && (
        <div
          className={styles.modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowWhatsAppModal(false);
          }}
        >
          <div className={styles.orderDetailModalWindow} dir="rtl" style={{ maxWidth: 540 }}>
            {/* Header */}
            <div className={styles.orderModalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                  ربط واتساب متجر جوفينيل (الإرسال الأوتوماتيكي)
                </h3>
                <span style={{ fontSize: 12, color: "#64748b", marginTop: 4, display: "block" }}>
                  إرسال تحديثات الأوردرات للعملاء تلقائياً وبشكل مجاني 100%
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className={styles.orderModalBody}>
              {whatsappInfo.connected ? (
                /* Connected State View */
                <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "center", alignItems: "center" }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "#dcfce7",
                      color: "#16a34a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 24px rgba(22, 163, 74, 0.15)",
                    }}
                  >
                    <Check size={36} strokeWidth={2.6} />
                  </div>

                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                      متصل ومفعل بنجاح!
                    </h4>
                    <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                      المتجر الآن متصل برقم واتساب:{" "}
                      <strong style={{ color: "#0f172a", direction: "ltr", display: "inline-block" }}>
                        +{whatsappInfo.userPhone}
                      </strong>
                      <br />
                      أي أوردر جديد أو تغيير في حالة الشحن بيتبعت أوتوماتيك للعميل فوراً!
                    </p>
                  </div>

                  {/* Test Message Box */}
                  <div
                    style={{
                      width: "100%",
                      background: "#f8fafc",
                      borderRadius: 18,
                      border: "1px solid #e2e8f0",
                      padding: 16,
                      textAlign: "right",
                    }}
                  >
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 8 }}>
                      جرب إرسال رسالة اختبارية على موبايلك:
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="tel"
                        placeholder="اكتب رقمك (مثال: 01012345678)"
                        value={testWhatsAppPhone}
                        onChange={(e) => setTestWhatsAppPhone(e.target.value)}
                        className={styles.cleanInput}
                        style={{ flex: 1, direction: "ltr", textAlign: "right" }}
                      />
                      <button
                        type="button"
                        disabled={isSendingTestWhatsApp}
                        onClick={handleSendTestWhatsApp}
                        className={styles.publishActionBtn}
                        style={{ background: "#25d366", fontSize: 12.5, padding: "8px 16px", whiteSpace: "nowrap" }}
                      >
                        {isSendingTestWhatsApp ? <RefreshCw size={14} className="animate-spin" /> : <MessageCircle size={14} />}
                        <span>إرسال تجربة</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleWhatsAppLogout}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#dc2626",
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: "6px 12px",
                      textDecoration: "underline",
                    }}
                  >
                    تسجيل الخروج وربط رقم واتساب آخر
                  </button>
                </div>
              ) : (
                /* Disconnected / QR Ready View */
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {whatsappInfo.qr ? (
                    <div className={styles.whatsappQrCard}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={whatsappInfo.qr}
                        alt="WhatsApp QR Code"
                        className={styles.whatsappQrImage}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, color: "#0750cd", fontSize: 12, fontWeight: 700 }}>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>في انتظار المسح بالكاميرا (يتصل تلقائياً)...</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "30px 16px" }}>
                      <RefreshCw size={28} className="animate-spin" color="#0750cd" style={{ margin: "0 auto 10px" }} />
                      <div style={{ fontWeight: 700, fontSize: 14 }}>جاري إنشاء رمز الـ QR الجديد...</div>
                    </div>
                  )}

                  <div className={styles.orderDetailSection}>
                    <div className={styles.orderDetailSectionTitle}>
                      <span>طريقة ربط رقمك في 3 خطوات بسيطة:</span>
                    </div>

                    <div className={styles.whatsappStepItem}>
                      <span className={styles.whatsappStepNumber}>1</span>
                      <span>افتح تطبيق واتساب على هاتفك المحمول.</span>
                    </div>

                    <div className={styles.whatsappStepItem}>
                      <span className={styles.whatsappStepNumber}>2</span>
                      <span>
                        اضغط على القائمة (الثلاث نقاط) أو <strong>الإعدادات</strong> واختر{" "}
                        <strong>الأجهزة المرتبطة (Linked Devices)</strong>.
                      </span>
                    </div>

                    <div className={styles.whatsappStepItem}>
                      <span className={styles.whatsappStepNumber}>3</span>
                      <span>
                        اضغط على <strong>ربط جهاز (Link a Device)</strong> ووجّه كاميرا الهاتف نحو الرمز بالأعلى.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "flex-end",
                background: "#f8fafc",
              }}
            >
              <button
                type="button"
                className={styles.previewPillBtn}
                onClick={() => setShowWhatsAppModal(false)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          COUPON CREATE / EDIT MODAL
          ========================================================= */}
      {editingCouponId && couponDraft && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalWindow} dir="rtl" style={{ maxWidth: 540 }}>
            <div className={styles.iosDragHandle} />
            <div className={styles.modalTop}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: "#eff6ff",
                  color: "#0750cd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Tag size={19} />
                </div>
                <div>
                  <h3 className={styles.modalHeading}>
                    {editingCouponId === "new" ? "إنشاء كود خصم ترويجي جديد" : `تعديل كود الخصم: ${couponDraft.code}`}
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>
                    يتم تفعيل هذا الكود فوراً لعملاء المتجر عند إتمام الطلب
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => {
                  setEditingCouponId(null);
                  setCouponDraft(null);
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Field 1: Coupon Code */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  رمز كود الخصم (Promo Code) <span style={{ color: "#cf142b" }}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.cleanInput}
                  placeholder="مثال: JUVENILE10 أو RAMADAN أو VIP"
                  value={couponDraft.code}
                  dir="ltr"
                  style={{ textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}
                  onChange={(e) => {
                    const clean = e.target.value.toUpperCase().replace(/\s+/g, "");
                    setCouponDraft((prev) => (prev ? { ...prev, code: clean } : null));
                  }}
                />
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  الرمز الذي يكتبه العميل في صفحة الدفع (بدون مسافات، حروف إنجليزية أو أرقام).
                </span>
              </div>

              {/* Field 2: Discount Type */}
              <div className={styles.formGroup}>
                <label className={styles.label}>نوع الخصم</label>
                <div className={styles.typeSegmentContainer}>
                  <button
                    type="button"
                    className={`${styles.typeSegmentBtn} ${couponDraft.type === "percent" ? styles.typeSegmentBtnActive : ""}`}
                    onClick={() => setCouponDraft((prev) => (prev ? { ...prev, type: "percent" } : null))}
                  >
                    نسبة مئوية (%)
                  </button>
                  <button
                    type="button"
                    className={`${styles.typeSegmentBtn} ${couponDraft.type === "fixed" ? styles.typeSegmentBtnActive : ""}`}
                    onClick={() => setCouponDraft((prev) => (prev ? { ...prev, type: "fixed" } : null))}
                  >
                    مبلغ ثابت (ج.م EGP)
                  </button>
                </div>
              </div>

              {/* Field 3: Discount Value & Minimum Order */}
              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    {couponDraft.type === "percent" ? "نسبة الخصم (%)" : "قيمة الخصم (ج.م)"}{" "}
                    <span style={{ color: "#cf142b" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      min="1"
                      max={couponDraft.type === "percent" ? 100 : 10000}
                      className={styles.cleanInput}
                      value={couponDraft.value || ""}
                      placeholder={couponDraft.type === "percent" ? "10" : "150"}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        setCouponDraft((prev) => (prev ? { ...prev, value: val } : null));
                      }}
                    />
                    <span style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 12,
                      color: "#64748b",
                      fontWeight: 700,
                    }}>
                      {couponDraft.type === "percent" ? "%" : "ج.م"}
                    </span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>الحد الأدنى للطلب (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    className={styles.cleanInput}
                    value={couponDraft.minOrderAmount ?? 0}
                    placeholder="0 = بدون حد أدنى"
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      setCouponDraft((prev) => (prev ? { ...prev, minOrderAmount: val } : null));
                    }}
                  />
                  <span style={{ fontSize: 11, color: "#64748b" }}>
                    اتركه 0 إذا كان الكوبون يطبق على أي طلب مهما كانت قيمته.
                  </span>
                </div>
              </div>

              {/* Field 4: Description */}
              <div className={styles.formGroup}>
                <label className={styles.label}>وصف العرض / الكوبون (بالعربية)</label>
                <input
                  type="text"
                  className={styles.cleanInput}
                  placeholder="مثال: خصم ترحيبي 10% لجميع العملاء الجدد"
                  value={couponDraft.descriptionAr || ""}
                  onChange={(e) => {
                    const desc = e.target.value;
                    setCouponDraft((prev) => (prev ? { ...prev, descriptionAr: desc } : null));
                  }}
                />
              </div>

              {/* Field 5: Automatic Expiration Date */}
              <div className={styles.formGroup}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className={styles.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Calendar size={14} color="#0750cd" />
                    <span>تاريخ انتهاء الكود تلقائياً (تاريخ الصلاحية)</span>
                  </label>
                  {couponDraft.expiresAt && (
                    <button
                      type="button"
                      onClick={() => setCouponDraft((prev) => (prev ? { ...prev, expiresAt: undefined } : null))}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#cf142b",
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      إلغاء الانتهاء (صالح دائماً)
                    </button>
                  )}
                </div>

                <input
                  type="date"
                  className={styles.cleanInput}
                  value={couponDraft.expiresAt || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCouponDraft((prev) => (prev ? { ...prev, expiresAt: val || undefined } : null));
                  }}
                  min={new Date().toISOString().split("T")[0]}
                />

                {/* Quick Presets */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: "#64748b" }}>تحديد سريع:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      setCouponDraft((prev) => (prev ? { ...prev, expiresAt: d.toISOString().split("T")[0] } : null));
                    }}
                    style={{
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      padding: "2px 8px",
                      fontSize: 11,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    + أسبوع
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 30);
                      setCouponDraft((prev) => (prev ? { ...prev, expiresAt: d.toISOString().split("T")[0] } : null));
                    }}
                    style={{
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      padding: "2px 8px",
                      fontSize: 11,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    + شهر
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + 3);
                      setCouponDraft((prev) => (prev ? { ...prev, expiresAt: d.toISOString().split("T")[0] } : null));
                    }}
                    style={{
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      padding: "2px 8px",
                      fontSize: 11,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    + 3 أشهر
                  </button>
                  <button
                    type="button"
                    onClick={() => setCouponDraft((prev) => (prev ? { ...prev, expiresAt: undefined } : null))}
                    style={{
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      padding: "2px 8px",
                      fontSize: 11,
                      color: "#64748b",
                      cursor: "pointer",
                    }}
                  >
                    بدون انتهاء ♾️
                  </button>
                </div>

                <span style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  {couponDraft.expiresAt
                    ? `ينتهي الكود أوتوماتيكياً بنهاية يوم ${new Date(`${couponDraft.expiresAt}T23:59:59`).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}.`
                    : "اتركه فارغاً إذا أردت أن يظل الكود متاحاً ومفعلاً دائماً بدون موعد انتهاء."}
                </span>
              </div>

              {/* Field 6: Active Status */}
              <div style={{
                background: "#f8fafc",
                borderRadius: 14,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid #edf0f5",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>حالة الكوبون</div>
                  <div style={{ fontSize: 11.5, color: "#64748b" }}>تفعيل الكود ليعمل فوراً للعملاء في صفحة الدفع</div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={couponDraft.isActive}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setCouponDraft((prev) => (prev ? { ...prev, isActive: checked } : null));
                    }}
                  />
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{couponDraft.isActive ? "نشط ومفعل" : "معطل مؤقتاً"}</span>
                </label>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={handleSaveCoupon}
                  className={styles.publishActionBtn}
                  style={{ flex: 1, justifyContent: "center", padding: "12px" }}
                >
                  <Save size={16} />
                  <span>حفظ ونشر كود الخصم</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCouponId(null);
                    setCouponDraft(null);
                  }}
                  className={styles.previewPillBtn}
                  style={{ padding: "12px 20px" }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          COUPON DELETE CONFIRMATION MODAL
          ========================================================= */}
      {couponToDelete && (
        <div className={styles.modalBackdrop} style={{ zIndex: 100010 }}>
          <div className={styles.modalWindow} dir="rtl" style={{ maxWidth: 420 }}>
            <div className={styles.iosDragHandle} />
            <div className={styles.modalTop}>
              <h3 className={styles.modalHeading} style={{ color: "#dc2626" }}>
                حذف كود الخصم
              </h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setCouponToDelete(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ margin: 0, fontSize: 13.5, color: "#334155", lineHeight: 1.6 }}>
                هل أنت متأكد من حذف كود الخصم{" "}
                <strong style={{ fontFamily: "monospace", color: "#0f172a" }}>"{couponToDelete.code}"</strong>؟
                لن يتمكن العملاء من استخدامه في المتجر بعد الحذف.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => handleDeleteCoupon(couponToDelete.id)}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 12,
                    background: "#dc2626",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  نعم، احذف الكود نهائياً
                </button>
                <button
                  type="button"
                  onClick={() => setCouponToDelete(null)}
                  className={styles.previewPillBtn}
                  style={{ padding: "10px 18px" }}
                >
                  تراجع
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Admin Single Account Credentials Modal */}
      {showAdminAccountModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => !isSavingAccount && setShowAdminAccountModal(false)}
        >
          <div
            className={styles.modalWindow}
            style={{ maxWidth: 480 }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className={styles.modalTop}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "#0f172a",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Key size={18} />
                </div>
                <div>
                  <h3 className={styles.modalHeading}>إعدادات أمان حساب الإدارة</h3>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                    تعديل بيانات الدخول المعتمدة
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => !isSavingAccount && setShowAdminAccountModal(false)}
                disabled={isSavingAccount}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateAdminAccount}>
              <div className={styles.modalBody}>
                {accountModalError && (
                  <div className={styles.adminGateError} style={{ margin: "0 0 16px" }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{accountModalError}</span>
                  </div>
                )}

                {/* Tabs for switching between email and password modification */}
                <div className={styles.accountModalTabs}>
                  <button
                    type="button"
                    className={`${styles.accountModalTabBtn} ${
                      accountActiveTab === "email" ? styles.accountModalTabBtnActive : ""
                    }`}
                    onClick={() => {
                      setAccountActiveTab("email");
                      setAccountModalError("");
                    }}
                  >
                    <Mail size={14} />
                    <span>تغيير البريد الإلكتروني</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.accountModalTabBtn} ${
                      accountActiveTab === "password" ? styles.accountModalTabBtnActive : ""
                    }`}
                    onClick={() => {
                      setAccountActiveTab("password");
                      setAccountModalError("");
                    }}
                  >
                    <Lock size={14} />
                    <span>تغيير كلمة المرور</span>
                  </button>
                </div>

                {accountActiveTab === "email" ? (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>
                        البريد الإلكتروني الحالي
                      </label>
                      <div
                        style={{
                          background: "#f1f5f9",
                          padding: "10px 14px",
                          borderRadius: 10,
                          fontSize: 13,
                          color: "#475569",
                          direction: "ltr",
                          textAlign: "left",
                          fontWeight: 500,
                        }}
                      >
                        {adminAccountEmail}
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>
                        البريد الإلكتروني الجديد
                      </label>
                      <div className={styles.accountInputRow}>
                        <input
                          type="email"
                          required
                          className={styles.accountInputField}
                          value={accountNewEmail}
                          onChange={(e) => setAccountNewEmail(e.target.value)}
                          placeholder="new-admin@example.com"
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>
                        كلمة المرور الحالية (لتأكيد الهوية)
                      </label>
                      <div className={styles.accountInputRow}>
                        <input
                          type={accountShowCurrentPass ? "text" : "password"}
                          required
                          className={styles.accountInputField}
                          style={{ letterSpacing: accountShowCurrentPass ? "normal" : "0.15em" }}
                          value={accountCurrentPass}
                          onChange={(e) => setAccountCurrentPass(e.target.value)}
                          placeholder="أدخل كلمة المرور الحالية"
                        />
                        <button
                          type="button"
                          className={styles.accountInputToggleBtn}
                          onClick={() => setAccountShowCurrentPass((prev) => !prev)}
                          tabIndex={-1}
                          aria-label={accountShowCurrentPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        >
                          {accountShowCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>
                        كلمة المرور الحالية
                      </label>
                      <div className={styles.accountInputRow}>
                        <input
                          type={accountShowCurrentPass ? "text" : "password"}
                          required
                          className={styles.accountInputField}
                          style={{ letterSpacing: accountShowCurrentPass ? "normal" : "0.15em" }}
                          value={accountCurrentPass}
                          onChange={(e) => setAccountCurrentPass(e.target.value)}
                          placeholder="أدخل كلمة المرور الحالية"
                        />
                        <button
                          type="button"
                          className={styles.accountInputToggleBtn}
                          onClick={() => setAccountShowCurrentPass((prev) => !prev)}
                          tabIndex={-1}
                          aria-label={accountShowCurrentPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        >
                          {accountShowCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>
                        كلمة المرور الجديدة
                      </label>
                      <div className={styles.accountInputRow}>
                        <input
                          type={accountShowNewPass ? "text" : "password"}
                          required
                          minLength={6}
                          className={styles.accountInputField}
                          style={{ letterSpacing: accountShowNewPass ? "normal" : "0.15em" }}
                          value={accountNewPass}
                          onChange={(e) => setAccountNewPass(e.target.value)}
                          placeholder="6 أحرف أو أرقام على الأقل"
                        />
                        <button
                          type="button"
                          className={styles.accountInputToggleBtn}
                          onClick={() => setAccountShowNewPass((prev) => !prev)}
                          tabIndex={-1}
                          aria-label={accountShowNewPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        >
                          {accountShowNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>
                        تأكيد كلمة المرور الجديدة
                      </label>
                      <div className={styles.accountInputRow}>
                        <input
                          type={accountShowConfirmPass ? "text" : "password"}
                          required
                          minLength={6}
                          className={styles.accountInputField}
                          style={{ letterSpacing: accountShowConfirmPass ? "normal" : "0.15em" }}
                          value={accountConfirmPass}
                          onChange={(e) => setAccountConfirmPass(e.target.value)}
                          placeholder="أعد إدخال كلمة المرور الجديدة"
                        />
                        <button
                          type="button"
                          className={styles.accountInputToggleBtn}
                          onClick={() => setAccountShowConfirmPass((prev) => !prev)}
                          tabIndex={-1}
                          aria-label={accountShowConfirmPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        >
                          {accountShowConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.modalFooter} style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 28px" }}>
                <button
                  type="button"
                  className={styles.accountCancelBtn}
                  onClick={() => setShowAdminAccountModal(false)}
                  disabled={isSavingAccount}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={styles.accountSubmitBtn}
                  disabled={isSavingAccount}
                >
                  {isSavingAccount ? (
                    <>
                      <RefreshCw size={15} className={styles.spinIcon} />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>
                      {accountActiveTab === "email" ? "تحديث البريد" : "تحديث كلمة المرور"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && <div className={styles.finexyToast}>{toastMessage}</div>}

      {/* =========================================================
          JUVENILE FLOATING GLASS CAPSULE BOTTOM NAV (Fixed at root level)
          ========================================================= */}
      <nav className={styles.bottomNavContainer} aria-label="شريط تنقل لوحة الإدارة">
        <div className={styles.glassPill}>
          {/* Overview */}
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`${styles.navItem} ${activeTab === "overview" ? styles.navItemActive : ""}`}
            aria-label="الرئيسية"
          >
            <div className={styles.iconWrapper}>
              <LayoutDashboard size={19} strokeWidth={activeTab === "overview" ? 2.4 : 1.8} />
            </div>
            {activeTab === "overview" && <span className={styles.navLabel}>الرئيسية</span>}
          </button>

          {/* Products */}
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`${styles.navItem} ${activeTab === "products" ? styles.navItemActive : ""}`}
            aria-label="العطور"
          >
            <div className={styles.iconWrapper}>
              <PerfumeBottleIcon size={19} strokeWidth={activeTab === "products" ? 2.4 : 1.8} />
            </div>
            {activeTab === "products" && <span className={styles.navLabel}>العطور</span>}
          </button>

          {/* Coupons */}
          <button
            type="button"
            onClick={() => setActiveTab("coupons")}
            className={`${styles.navItem} ${activeTab === "coupons" ? styles.navItemActive : ""}`}
            aria-label="الكوبونات"
          >
            <div className={styles.iconWrapper}>
              <Tag size={19} strokeWidth={activeTab === "coupons" ? 2.4 : 1.8} />
            </div>
            {activeTab === "coupons" && <span className={styles.navLabel}>الكوبونات</span>}
          </button>

          {/* Visuals */}
          <button
            type="button"
            onClick={() => setActiveTab("visuals")}
            className={`${styles.navItem} ${activeTab === "visuals" ? styles.navItemActive : ""}`}
            aria-label="الوسائط"
          >
            <div className={styles.iconWrapper}>
              <ImageIcon size={19} strokeWidth={activeTab === "visuals" ? 2.4 : 1.8} />
            </div>
            {activeTab === "visuals" && <span className={styles.navLabel}>الوسائط</span>}
          </button>

          {/* Copy / Promo */}
          <button
            type="button"
            onClick={() => setActiveTab("copy")}
            className={`${styles.navItem} ${activeTab === "copy" ? styles.navItemActive : ""}`}
            aria-label="الإعلانات"
          >
            <div className={styles.iconWrapper}>
              <FileText size={19} strokeWidth={activeTab === "copy" ? 2.4 : 1.8} />
            </div>
            {activeTab === "copy" && <span className={styles.navLabel}>الإعلانات</span>}
          </button>
        </div>
      </nav>
    </div>
  );
}
