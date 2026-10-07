"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Package,
  Award,
  Sparkles,
  Phone,
  MessageCircle,
  User,
  Mail,
  MapPin,
  Building2,
  Home,
  Navigation,
  FileText,
  Globe,
  Tag,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartData } from "@/context/CartContext";
import { useCMS } from "@/context/CMSContext";
import styles from "./Checkout.module.css";

// 27 Egyptian Governorates
const EGYPT_GOVERNORATES = [
  { id: "cairo", ar: "القاهرة", en: "Cairo" },
  { id: "giza", ar: "الجيزة", en: "Giza" },
  { id: "alexandria", ar: "الإسكندرية", en: "Alexandria" },
  { id: "qalyubia", ar: "القليوبية", en: "Qalyubia" },
  { id: "sharqia", ar: "الشرقية", en: "Sharqia" },
  { id: "dakahlia", ar: "الدقهلية", en: "Dakahlia" },
  { id: "gharbia", ar: "الغربية", en: "Gharbia" },
  { id: "monufia", ar: "المنوفية", en: "Monufia" },
  { id: "beheira", ar: "البحيرة", en: "Beheira" },
  { id: "kafr-el-sheikh", ar: "كفر الشيخ", en: "Kafr El Sheikh" },
  { id: "damietta", ar: "دمياط", en: "Damietta" },
  { id: "port-said", ar: "بورسعيد", en: "Port Said" },
  { id: "ismailia", ar: "الإسماعيلية", en: "Ismailia" },
  { id: "suez", ar: "السويس", en: "Suez" },
  { id: "fayoum", ar: "الفيوم", en: "Fayoum" },
  { id: "beni-suef", ar: "بني سويف", en: "Beni Suef" },
  { id: "minya", ar: "المنيا", en: "Minya" },
  { id: "asyut", ar: "أسيوط", en: "Asyut" },
  { id: "sohag", ar: "سوهاج", en: "Sohag" },
  { id: "qena", ar: "قنا", en: "Qena" },
  { id: "luxor", ar: "الأقصر", en: "Luxor" },
  { id: "aswan", ar: "أسوان", en: "Aswan" },
  { id: "red-sea", ar: "البحر الأحمر (الغردقة / الجونة)", en: "Red Sea" },
  { id: "matruh", ar: "مطروح والساحل الشمالي", en: "Matruh & North Coast" },
  { id: "new-valley", ar: "الوادي الجديد", en: "New Valley" },
  { id: "south-sinai", ar: "جنوب سيناء (شرم الشيخ / دهب)", en: "South Sinai" },
  { id: "north-sinai", ar: "شمال سيناء", en: "North Sinai" },
];

export default function CheckoutPage() {
  const { locale, toggleLanguage } = useLanguage();
  const isAr = locale === "ar";
  const router = useRouter();

  const { cartItems, clearCart, isLoaded } = useCartData();
  const { cmsData } = useCMS();

  // Mobile Accordion toggle for order summary
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailOrPhone: "",
    phone: "",
    secondaryPhone: "",
    governorate: "cairo",
    city: "",
    address: "",
    apartment: "",
    notes: "",
    whatsappUpdates: true,
    paymentMethod: "cod", // 'cod' | 'card' | 'instapay'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent?: number;
    discountAmount?: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");

  // Placed Order Success state
  const [orderConfirmation, setOrderConfirmation] = useState<{
    orderId: string;
    customerName: string;
    total: number;
    phone: string;
    governorateName: string;
  } | null>(null);

  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountPercent) {
      return Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    }
    if (appliedCoupon.discountAmount) {
      return Math.min(appliedCoupon.discountAmount, subtotal);
    }
    return 0;
  }, [subtotal, appliedCoupon]);

  const shippingCost = 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Coupon Handler
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const cleanedCode = couponInput.trim().toUpperCase();

    if (!cleanedCode) return;

    const availableCoupons = cmsData?.coupons || {};
    // Find coupon by direct key or matching coupon.code
    const coupon =
      availableCoupons[cleanedCode] ||
      Object.values(availableCoupons).find(
        (c) => (c.code || "").trim().toUpperCase() === cleanedCode
      );

    if (!coupon) {
      setCouponError(isAr ? "كود الخصم غير صحيح أو غير موجود" : "Invalid coupon code");
      return;
    }

    if (!coupon.isActive) {
      setCouponError(isAr ? "عفواً، تم إيقاف كود الخصم هذا حالياً" : "This coupon is currently inactive");
      return;
    }

    // Check expiration date if specified
    if (coupon.expiresAt) {
      const expiryDate = coupon.expiresAt.includes("T")
        ? new Date(coupon.expiresAt)
        : new Date(`${coupon.expiresAt}T23:59:59`);

      if (!isNaN(expiryDate.getTime()) && Date.now() > expiryDate.getTime()) {
        setCouponError(
          isAr
            ? `عفواً، انتهت صلاحية كود الخصم هذا في ${expiryDate.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}`
            : `Sorry, this coupon expired on ${expiryDate.toLocaleDateString()}`
        );
        return;
      }
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      setCouponError(
        isAr
          ? `الحد الأدنى لتطبيق هذا الكوبون هو ${coupon.minOrderAmount.toLocaleString("ar-EG")} ج.م (إجمالي طلبك الحالي: ${subtotal.toLocaleString("ar-EG")} ج.م)`
          : `Minimum order amount for this coupon is ${coupon.minOrderAmount} EGP`
      );
      return;
    }

    if (coupon.type === "percent") {
      setAppliedCoupon({
        code: coupon.code,
        discountPercent: coupon.value,
      });
    } else {
      setAppliedCoupon({
        code: coupon.code,
        discountAmount: coupon.value,
      });
    }
    setCouponInput("");
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  // Field change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = isAr ? "يرجى كتابة الاسم الأول" : "First name is required";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = isAr ? "يرجى كتابة اسم العائلة" : "Last name is required";
    }

    const phoneRegex = /^01[0125][0-9]{8}$/;
    const cleanPhone = formData.phone.trim().replace(/[\s-]/g, "");

    if (!cleanPhone) {
      errors.phone = isAr ? "رقم الهاتف المحمول مطلوب" : "Phone number is required";
    } else if (!phoneRegex.test(cleanPhone)) {
      errors.phone = isAr
        ? "يرجى إدخال رقم هاتف مصري صحيح مكون من 11 رقم (010, 011, 012, 015)"
        : "Please enter a valid 11-digit Egyptian phone number (010, 011, 012, 015)";
    }

    if (!formData.city.trim()) {
      errors.city = isAr ? "يرجى تحديد المدينة أو الحي" : "City / District is required";
    }
    if (!formData.address.trim()) {
      errors.address = isAr ? "يرجى كتابة العنوان واسم الشارع بالتفصيل" : "Street address is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorKey = Object.keys(formErrors)[0];
      const el = document.getElementById(firstErrorKey);
      if (el) el.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedGov = EGYPT_GOVERNORATES.find((g) => g.id === formData.governorate);
      const govName = isAr ? selectedGov?.ar || "القاهرة" : selectedGov?.en || "Cairo";

      const orderPayload = {
        customer: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          secondaryPhone: formData.secondaryPhone.trim(),
          email: formData.emailOrPhone.trim(),
          notes: formData.notes.trim(),
        },
        delivery: {
          governorate: govName,
          city: formData.city.trim(),
          address: formData.address.trim(),
          apartment: formData.apartment.trim(),
        },
        shipping: {
          method: "شحن سريع عبر البريد المصري (جميع محافظات مصر)",
          cost: shippingCost,
        },
        payment: {
          method:
            formData.paymentMethod === "cod"
              ? "الدفع عند الاستلام كاش (COD)"
              : "الدفع الإلكتروني الآمن (بوابة الدفع - بطاقات ومحافظ وإنستاباي)",
        },
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          type: item.type || "100ml Extrait de Parfum",
        })),
        subtotal,
        discount: discountAmount,
        total: finalTotal,
        couponCode: appliedCoupon?.code || undefined,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (data.success && data.orderId) {
        setOrderConfirmation({
          orderId: data.orderId,
          customerName: `${formData.firstName} ${formData.lastName}`,
          total: finalTotal,
          phone: formData.phone,
          governorateName: govName,
        });
        clearCart();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert(isAr ? "حدث خطأ أثناء تسجيل الطلب، يرجى المحاولة مرة أخرى" : "Error placing order, please retry");
      }
    } catch (err) {
      console.error("Order submit error:", err);
      alert(isAr ? "حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى" : "Network error, please retry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  // Case 1: Order Confirmed Screen
  if (orderConfirmation) {
    const waText = encodeURIComponent(
      `مرحباً دار جُوفينيل للعطور، أنا ${orderConfirmation.customerName}، قمت بتأكيد طلب جديد برقم: ${orderConfirmation.orderId} بقيمة ${orderConfirmation.total.toLocaleString("ar-EG")} ج.م، وحابب أتابع تفاصيل الشحنة والتوصيل.`
    );
    const waUrl = `https://wa.me/201123233355?text=${waText}`;

    return (
      <div className={styles.checkoutWrapper}>
        <header className={styles.checkoutHeader}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.brandLink} aria-label="JUVENILE">
              <Image
                src="/logo.png"
                alt="JUVENILE Fragrance"
                width={160}
                height={45}
                priority
                style={{ objectFit: "contain", height: "40px", width: "auto" }}
              />
            </Link>

            <button
              type="button"
              className={styles.langToggleBtn}
              onClick={toggleLanguage}
              aria-label={locale === "ar" ? "Switch to English" : "التحويل إلى العربية"}
              title={locale === "ar" ? "English" : "العربية"}
            >
              <Globe size={15} />
              <span>{locale === "ar" ? "English" : "العربية"}</span>
            </button>
          </div>
        </header>

        <main className={styles.successWrapper}>
          <div className={styles.successHeader}>
            <div className={styles.successBadge}>
              <CheckCircle2 size={42} strokeWidth={2.5} />
            </div>
            <h1 className={styles.successTitle}>
              {isAr ? "تهانينا! تم تأكيد طلبك الفاخر بنجاح" : "Thank you! Your Order is Confirmed"}
            </h1>
            <div className={styles.orderNumberTag}>
              {isAr ? `رقم الطلب: #${orderConfirmation.orderId}` : `Order ID: #${orderConfirmation.orderId}`}
            </div>
            <p className={styles.successDesc}>
              {isAr
                ? "أهلاً بحضرتك في عائلة جُوفينيل. تم استلام طلبك وبدأ معملنا في تجهيز زجاجتك بتغليف فاخر يليق بحضورك للشحن عبر البريد المصري السريع. سيتم التواصل معك عبر الهاتف والواتساب لتنسيق موعد الاستلام."
                : "Welcome to the world of JUVENILE. Your order is now being hand-packaged with luxury care for Egypt Post express dispatch. Our concierge will reach out to confirm your delivery schedule."}
            </p>
          </div>

          <div className={styles.successDetailsCard}>
            <div className={styles.successDetailsGrid}>
              <div className={styles.successDetailCol}>
                <span className={styles.detailLabel}>{isAr ? "اسم العميل" : "Customer"}</span>
                <span className={styles.detailValue}>{orderConfirmation.customerName}</span>
              </div>
              <div className={styles.successDetailCol}>
                <span className={styles.detailLabel}>{isAr ? "المحافظة والتوصيل" : "Destination"}</span>
                <span className={styles.detailValue}>{orderConfirmation.governorateName}</span>
              </div>
              <div className={styles.successDetailCol}>
                <span className={styles.detailLabel}>{isAr ? "رقم الهاتف المسجل" : "Contact Phone"}</span>
                <span className={styles.detailValue}>{orderConfirmation.phone}</span>
              </div>
              <div className={styles.successDetailCol}>
                <span className={styles.detailLabel}>{isAr ? "إجمالي المبلغ المستحق" : "Total Due"}</span>
                <span className={styles.detailValue}>
                  {orderConfirmation.total.toLocaleString(isAr ? "ar-EG" : "en-US")} {isAr ? "ج.م" : "EGP"}
                </span>
              </div>
            </div>
          </div>

          <a href={waUrl} target="_blank" rel="noopener noreferrer" className={styles.whatsappActionBtn}>
            <MessageCircle size={20} />
            <span>{isAr ? "تتبع حالة الشحنة فوراً عبر واتساب" : "Track Order via WhatsApp"}</span>
          </a>

          <Link href="/" className={styles.returnHomeBtn}>
            <ShoppingBag size={18} />
            <span>{isAr ? "العودة للرئيسية وتصفح المتجر" : "Return to Store & Browse"}</span>
          </Link>
        </main>
      </div>
    );
  }

  // Case 2: Loading State (Waiting for LocalStorage Cart to Hydrate)
  if (!isLoaded) {
    return (
      <div className={styles.checkoutWrapper}>
        <header className={styles.checkoutHeader}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.brandLink} aria-label="JUVENILE">
              <Image
                src="/logo.png"
                alt="JUVENILE Fragrance"
                width={160}
                height={45}
                priority
                style={{ objectFit: "contain", height: "40px", width: "auto" }}
              />
            </Link>
          </div>
        </header>
        <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "24px", height: "24px", border: "2px solid #e2e8f0", borderTopColor: "#0750cd", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Case 3: Empty Cart Screen (Only when loaded and cart is actually empty)
  if (cartItems.length === 0) {
    return (
      <div className={styles.checkoutWrapper}>
        <header className={styles.checkoutHeader}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.brandLink} aria-label="JUVENILE">
              <Image
                src="/logo.png"
                alt="JUVENILE Fragrance"
                width={160}
                height={45}
                priority
                style={{ objectFit: "contain", height: "40px", width: "auto" }}
              />
            </Link>

            <button
              type="button"
              className={styles.langToggleBtn}
              onClick={toggleLanguage}
              aria-label={locale === "ar" ? "Switch to English" : "التحويل إلى العربية"}
              title={locale === "ar" ? "English" : "العربية"}
            >
              <Globe size={15} />
              <span>{locale === "ar" ? "English" : "العربية"}</span>
            </button>
          </div>
        </header>

        <main className={styles.emptyCard}>
          <div className={styles.emptyIconCircle}>
            <ShoppingBag size={32} />
          </div>
          <h1 className={styles.emptyTitle}>
            {isAr ? "حقيبة التسوق فارغة حالياً" : "Your Shopping Bag is Empty"}
          </h1>
          <p className={styles.emptySubtitle}>
            {isAr
              ? "لم تقم بإضافة أي من عطورنا النيش الفاخرة بعد. استكشف تشكيلتنا الحصرية واختر العطر الذي يعبر عن فخامتك."
              : "You haven't selected any luxury perfumes yet. Discover our exclusive collection and choose your signature scent."}
          </p>
          <Link href="/#bestsellers" className={styles.emptyBtn}>
            <span>{isAr ? "استكشف التشكيلة العطرية" : "Explore Fragrance Collection"}</span>
            <ArrowIcon size={16} />
          </Link>
        </main>
      </div>
    );
  }

  // Case 3: Interactive Luxury Checkout Flow
  return (
    <div className={styles.checkoutWrapper}>
      {/* Top Header */}
      <header className={styles.checkoutHeader}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brandLink} aria-label="JUVENILE">
            <Image
              src="/logo.png"
              alt="JUVENILE Fragrance"
              width={160}
              height={45}
              priority
              style={{ objectFit: "contain", height: "40px", width: "auto" }}
            />
          </Link>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.langToggleBtn}
              onClick={toggleLanguage}
              aria-label={locale === "ar" ? "Switch to English" : "التحويل إلى العربية"}
              title={locale === "ar" ? "English" : "العربية"}
            >
              <Globe size={15} />
              <span>{locale === "ar" ? "English" : "العربية"}</span>
            </button>

            <span className={styles.headerDivider} aria-hidden="true" />

            <Link href="/" className={styles.headerBackLink}>
              <ArrowIcon size={14} />
              <span>{isAr ? "العودة للمتجر" : "Return to store"}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Sticky Order Summary Toggle (Shopify style) */}
      <button
        type="button"
        className={styles.mobileSummaryToggle}
        onClick={() => setIsMobileSummaryOpen((prev) => !prev)}
        aria-expanded={isMobileSummaryOpen}
      >
        <div className={styles.mobileSummaryLeft}>
          <ShoppingBag size={18} />
          <span>{isAr ? "إظهار ملخص الطلب والكوبون" : "Show order summary"}</span>
          {isMobileSummaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        <div className={styles.mobileSummaryPrice}>
          {finalTotal.toLocaleString(isAr ? "ar-EG" : "en-US")} {isAr ? "ج.م" : "EGP"}
        </div>
      </button>

      {/* Stepper Breadcrumbs */}
      <div className={styles.stepperContainer}>
        <nav className={styles.stepper} aria-label="Checkout Steps">
          <Link href="/" className={`${styles.stepItem} ${styles.stepCompleted}`}>
            {isAr ? "حقيبة التسوق" : "Bag"}
          </Link>
          <span className={styles.stepSeparator}>/</span>
          <span className={`${styles.stepItem} ${styles.stepActive}`}>
            {isAr ? "بيانات التوصيل وإتمام الطلب" : "Delivery & Checkout"}
          </span>
        </nav>
      </div>

      {/* Main Checkout Container */}
      <main className={styles.checkoutMain}>
        <div className={styles.layoutGrid}>
          {/* Left Form Column */}
          <form className={styles.formColumn} onSubmit={handleSubmitOrder} noValidate>
            {/* 1. Personal & Contact Details */}
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderLeft}>
                  <div className={styles.headerIconWrap}>
                    <User size={18} />
                  </div>
                  <div className={styles.sectionTitleCol}>
                    <h2 className={styles.sectionTitle}>
                      {isAr ? "البيانات الشخصية ومعلومات التواصل" : "Customer & Contact Info"}
                    </h2>
                    <span className={styles.sectionSubtitle}>
                      {isAr ? "لتأكيد طلبك وتحديثات الشحنة الفاخرة أولاً بأول" : "For order confirmation and real-time luxury delivery updates"}
                    </span>
                  </div>
                </div>
              </div>

              {/* First & Last Name */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName" className={styles.label}>
                    <span>{isAr ? "الاسم الأول" : "First Name"} *</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}><User size={16} /></span>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder={isAr ? "مثال: أحمد" : "e.g. Ahmed"}
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`${styles.input} ${formErrors.firstName ? styles.inputError : ""}`}
                      required
                    />
                  </div>
                  {formErrors.firstName && <span className={styles.errorText}>{formErrors.firstName}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="lastName" className={styles.label}>
                    <span>{isAr ? "اسم العائلة" : "Last Name"} *</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}><User size={16} /></span>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder={isAr ? "مثال: المنشاوي" : "e.g. Manshawi"}
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`${styles.input} ${formErrors.lastName ? styles.inputError : ""}`}
                      required
                    />
                  </div>
                  {formErrors.lastName && <span className={styles.errorText}>{formErrors.lastName}</span>}
                </div>
              </div>

              {/* Egyptian Primary Phone & Secondary Phone */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.label}>
                    <span>{isAr ? "رقم الهاتف المحمول الأساسي" : "Mobile Phone Number"} *</span>
                  </label>
                  <div className={`${styles.phoneInputContainer} ${formErrors.phone ? styles.phoneInputContainerError : ""}`}>
                    <div className={styles.phonePrefix} dir="ltr">
                      <svg width="18" height="13" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: "2px", flexShrink: 0, boxShadow: "0 0 1px rgba(0,0,0,0.3)" }}>
                        <rect width="20" height="4.67" fill="#C8102E" />
                        <rect y="4.67" width="20" height="4.67" fill="#FFFFFF" />
                        <rect y="9.33" width="20" height="4.67" fill="#000000" />
                        <circle cx="10" cy="7" r="1.5" fill="#C69214" />
                      </svg>
                      <span dir="ltr" style={{ direction: "ltr", unicodeBidi: "isolate" }}>+20</span>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={styles.phoneInput}
                      required
                      dir="ltr"
                    />
                  </div>
                  {formErrors.phone && <span className={styles.errorText}>{formErrors.phone}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="secondaryPhone" className={styles.label}>
                    <span>{isAr ? "رقم هاتف بديل (اختياري)" : "Secondary Phone"}</span>
                    <span className={styles.optionalTag}>{isAr ? "اختياري" : "Optional"}</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}><Phone size={16} /></span>
                    <input
                      type="tel"
                      id="secondaryPhone"
                      name="secondaryPhone"
                      placeholder={isAr ? "رقم هاتف إضافي للمندوب" : "Alternate phone for courier"}
                      value={formData.secondaryPhone}
                      onChange={handleInputChange}
                      className={styles.input}
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* 2026 Interactive Luxury WhatsApp Switch — Directly linked to phone */}
              <div
                className={`${styles.whatsappCardToggle} ${formData.whatsappUpdates ? styles.whatsappCardToggleActive : ""}`}
                onClick={() => setFormData((prev) => ({ ...prev, whatsappUpdates: !prev.whatsappUpdates }))}
                role="button"
                tabIndex={0}
                aria-pressed={formData.whatsappUpdates}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setFormData((prev) => ({ ...prev, whatsappUpdates: !prev.whatsappUpdates }));
                  }
                }}
              >
                <div className={styles.whatsappLeft}>
                  <div className={styles.whatsappIconWrap}>
                    <MessageCircle size={20} />
                  </div>
                  <div className={styles.whatsappTextCol}>
                    <span className={styles.whatsappTitle}>
                      {isAr ? "تلقي إشعارات وتحديثات الشحنة عبر واتساب" : "WhatsApp Delivery Updates"}
                    </span>
                    <span className={styles.whatsappSubtitle}>
                      {isAr
                        ? "سنرسل لك رابط التتبع المباشر وموعد وصول المندوب فور انطلاق الشحنة"
                        : "Receive real-time courier dispatch and live tracking alerts via WhatsApp"}
                    </span>
                  </div>
                </div>
                <div className={`${styles.toggleSwitch} ${formData.whatsappUpdates ? styles.toggleSwitchActive : ""}`}>
                  <div className={styles.toggleThumb} />
                </div>
              </div>

              {/* Email Address (Optional) */}
              <div className={styles.formGroup} style={{ marginTop: "16px" }}>
                <label htmlFor="emailOrPhone" className={styles.label}>
                  <span>{isAr ? "البريد الإلكتروني (اختياري لتأكيد الفاتورة)" : "Email address (Optional for receipt)"}</span>
                  <span className={styles.optionalTag}>{isAr ? "اختياري" : "Optional"}</span>
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}><Mail size={16} /></span>
                  <input
                    type="email"
                    id="emailOrPhone"
                    name="emailOrPhone"
                    placeholder={isAr ? "example@domain.com" : "example@domain.com"}
                    value={formData.emailOrPhone}
                    onChange={handleInputChange}
                    className={styles.input}
                    dir="ltr"
                  />
                </div>
              </div>
            </section>

            {/* 2. Delivery Address (Egypt Governorates) */}
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderLeft}>
                  <div className={styles.headerIconWrap}>
                    <Truck size={18} />
                  </div>
                  <div className={styles.sectionTitleCol}>
                    <h2 className={styles.sectionTitle}>
                      {isAr ? "عنوان الشحن والتوصيل" : "Delivery Address"}
                    </h2>
                    <span className={styles.sectionSubtitle}>
                      {isAr ? "توصيل سريع ومضمون عبر البريد المصري لباب بيتك في جميع المحافظات" : "Fast & secure delivery via Egypt Post to your doorstep"}
                    </span>
                  </div>
                </div>
                <span className={styles.sectionBadge}>
                  <span>🇪🇬</span>
                  <span>{isAr ? "مصر" : "Egypt"}</span>
                </span>
              </div>

              {/* Governorate Dropdown & City */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="governorate" className={styles.label}>
                    <span>{isAr ? "المحافظة" : "Governorate"} *</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}><MapPin size={16} /></span>
                    <select
                      id="governorate"
                      name="governorate"
                      value={formData.governorate}
                      onChange={handleInputChange}
                      className={styles.select}
                    >
                      {EGYPT_GOVERNORATES.map((gov) => (
                        <option key={gov.id} value={gov.id}>
                          {isAr ? gov.ar : gov.en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="city" className={styles.label}>
                    <span>{isAr ? "المدينة / المنطقة / الحي" : "City / District"} *</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}><Building2 size={16} /></span>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      placeholder={isAr ? "مثال: التجمع الخامس / مصر الجديدة / سموحة" : "e.g. New Cairo / Maadi"}
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`${styles.input} ${formErrors.city ? styles.inputError : ""}`}
                      required
                    />
                  </div>
                  {formErrors.city && <span className={styles.errorText}>{formErrors.city}</span>}
                </div>
              </div>

              {/* Street Address & Building */}
              <div className={styles.formGroup}>
                <label htmlFor="address" className={styles.label}>
                  <span>{isAr ? "العنوان بالتفصيل، اسم الشارع، ورقم العمارة" : "Street Address, Building No."} *</span>
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}><Home size={16} /></span>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder={isAr ? "شارع التسعين الشمالي، عمارة 42" : "Street name, Building number"}
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`${styles.input} ${formErrors.address ? styles.inputError : ""}`}
                    required
                  />
                </div>
                {formErrors.address && <span className={styles.errorText}>{formErrors.address}</span>}
              </div>

              {/* Apartment, floor, notes */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="apartment" className={styles.label}>
                    <span>{isAr ? "الدور / الشقة / علامة مميزة" : "Apartment, suite, landmark"}</span>
                    <span className={styles.optionalTag}>{isAr ? "اختياري" : "Optional"}</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}><Navigation size={16} /></span>
                    <input
                      type="text"
                      id="apartment"
                      name="apartment"
                      placeholder={isAr ? "الدور الرابع - شقة 12 - بجوار بنك مصر" : "Apt 12, 4th floor"}
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="notes" className={styles.label}>
                    <span>{isAr ? "ملاحظات إضافية للمندوب" : "Courier delivery notes"}</span>
                    <span className={styles.optionalTag}>{isAr ? "اختياري" : "Optional"}</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}><FileText size={16} /></span>
                    <input
                      type="text"
                      id="notes"
                      name="notes"
                      placeholder={isAr ? "مثال: يرجى الاتصال قبل الوصول بساعة" : "e.g. Call 1 hour ahead"}
                      value={formData.notes}
                      onChange={handleInputChange}
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Payment Methods */}
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderLeft}>
                  <div className={styles.headerIconWrap}>
                    <CreditCard size={18} />
                  </div>
                  <div className={styles.sectionTitleCol}>
                    <h2 className={styles.sectionTitle}>
                      {isAr ? "طريقة الدفع" : "Payment Method"}
                    </h2>
                    <span className={styles.sectionSubtitle}>
                      {isAr ? "اختر وسيلة الدفع المناسبة، جميع المعاملات مؤمنة ومشفرة 100%" : "Choose your payment method, 100% secure & encrypted"}
                    </span>
                  </div>
                </div>
                <span className={styles.sectionBadge}>
                  <ShieldCheck size={13} style={{ color: "#0750cd" }} />
                  <span>{isAr ? "دفع آمن ومضمون" : "100% Secure"}</span>
                </span>
              </div>

              <div className={styles.paymentMethodsList} role="radiogroup" aria-label="Payment Methods">
                {/* 1. Cash on Delivery */}
                <div
                  className={`${styles.paymentMethodCard} ${
                    formData.paymentMethod === "cod" ? styles.paymentMethodCardActive : ""
                  }`}
                  onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: "cod" }))}
                  role="radio"
                  aria-checked={formData.paymentMethod === "cod"}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setFormData((prev) => ({ ...prev, paymentMethod: "cod" }));
                    }
                  }}
                >
                  <div className={styles.paymentRadioOuter}>
                    {formData.paymentMethod === "cod" && <div className={styles.paymentRadioInner} />}
                  </div>
                  <div className={styles.paymentMethodContent}>
                    <div className={styles.paymentMethodTop}>
                      <div className={styles.paymentMethodTitleRow}>
                        <span className={styles.paymentMethodIcon}><Banknote size={18} /></span>
                        <span className={styles.paymentMethodTitle}>
                          {isAr ? "الدفع عند الاستلام كاش (Cash on Delivery)" : "Cash on Delivery (COD)"}
                        </span>
                      </div>
                    </div>
                    <p className={styles.paymentMethodDesc}>
                      {isAr
                        ? "سدد قيمة طلبك نقداً لمندوب الشحن عند استلام الطرد الفاخر على باب بيتك"
                        : "Pay in cash directly to the courier upon delivery at your doorstep"}
                    </p>
                  </div>
                </div>

                {/* 2. Unified Online Payment Gateway */}
                <div
                  className={`${styles.paymentMethodCard} ${
                    formData.paymentMethod === "online" ? styles.paymentMethodCardActive : ""
                  }`}
                  onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: "online" }))}
                  role="radio"
                  aria-checked={formData.paymentMethod === "online"}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setFormData((prev) => ({ ...prev, paymentMethod: "online" }));
                    }
                  }}
                >
                  <div className={styles.paymentRadioOuter}>
                    {formData.paymentMethod === "online" && <div className={styles.paymentRadioInner} />}
                  </div>
                  <div className={styles.paymentMethodContent}>
                    <div className={styles.paymentMethodTop}>
                      <div className={styles.paymentMethodTitleRow}>
                        <span className={styles.paymentMethodIcon}><CreditCard size={18} /></span>
                        <span className={styles.paymentMethodTitle}>
                          {isAr ? "الدفع الإلكتروني الآمن (Online Payment)" : "Secure Online Payment"}
                        </span>
                      </div>
                    </div>
                    <p className={styles.paymentMethodDesc}>
                      {isAr
                        ? "دفع إلكتروني فوري ومؤمن 100% عبر بوابات الدفع البنكية المعتمدة (بطاقات بنكية، محافظ الهواتف، إنستاباي)"
                        : "Instant & 256-bit bank encrypted payment via cards, mobile wallets & InstaPay"}
                    </p>
                    <div className={styles.paymentBadgesRow}>
                      <div className={styles.paymentLogoBadge} title="Visa">
                        <img src="/payments/visa.svg" alt="Visa" className={styles.paymentLogoImg} style={{ height: "12px" }} />
                      </div>
                      <div className={styles.paymentLogoBadge} title="Mastercard">
                        <img src="/payments/mastercard.svg" alt="Mastercard" className={styles.paymentLogoImg} style={{ height: "16px" }} />
                      </div>
                      <div className={styles.paymentLogoBadge} title="Meeza">
                        <img src="/payments/meeza.svg" alt="Meeza" className={styles.paymentLogoImg} style={{ height: "13px" }} />
                      </div>
                      <div className={styles.paymentLogoBadge} title="InstaPay">
                        <img src="/payments/instapay.png" alt="InstaPay" className={styles.paymentLogoImg} style={{ height: "16px" }} />
                        <span className={styles.paymentLogoText}>InstaPay</span>
                      </div>
                      <div className={styles.paymentLogoBadge} title="Vodafone Cash">
                        <img src="/payments/vodafone.svg" alt="Vodafone Cash" className={styles.paymentLogoImg} style={{ height: "13px" }} />
                        <span className={styles.paymentLogoText}>Cash</span>
                      </div>
                      <div className={styles.paymentLogoBadge} title="Orange Cash">
                        <img src="/payments/orange.svg" alt="Orange Cash" className={styles.paymentLogoImg} style={{ height: "14px", borderRadius: "2px" }} />
                        <span className={styles.paymentLogoText}>Cash</span>
                      </div>
                      <div className={styles.paymentLogoBadge} title="e& money">
                        <img src="/payments/eand.svg" alt="e& money" className={styles.paymentLogoImg} style={{ height: "14px" }} />
                        <span className={styles.paymentLogoText}>money</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Submit Action Button */}
            <div>
              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? (
                  <span>{isAr ? "جارٍ تأكيد طلبك الفاخر..." : "Processing Your Luxury Order..."}</span>
                ) : (
                  <>
                    <span>
                      {formData.paymentMethod === "online"
                        ? isAr
                          ? "المتابعة للدفع الإلكتروني"
                          : "Proceed to Payment"
                        : isAr
                        ? "تأكيد الطلب الآن"
                        : "Complete Order"}
                    </span>
                    <span className={styles.submitBtnTotal}>
                      {finalTotal.toLocaleString(isAr ? "ar-EG" : "en-US")} {isAr ? "ج.م" : "EGP"}
                    </span>
                    <ArrowIcon size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Right Column: Sticky Order Summary */}
          <aside
            className={`${styles.summaryColumn} ${
              isMobileSummaryOpen ? styles.summaryColumnMobileOpen : ""
            }`}
          >
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <div className={styles.summaryTitleRow}>
                  <div className={styles.summaryIconWrap}>
                    <ShoppingBag size={17} />
                  </div>
                  <h2 className={styles.summaryTitle}>{isAr ? "ملخص الطلب" : "Order Summary"}</h2>
                </div>
                <span className={styles.summaryCount}>
                  {cartItems.length} {isAr ? "عطور" : "items"}
                </span>
              </div>

              {/* Items List */}
              <div className={styles.itemsList}>
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.itemRow}>
                    <div className={styles.itemImageWrapper}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={70}
                        height={70}
                        className={styles.itemImage}
                      />
                      <span className={styles.itemQtyBadge}>{item.quantity}</span>
                    </div>
                    <div className={styles.itemDetails}>
                      <div className={styles.itemName}>{item.name}</div>
                      <div className={styles.itemMeta}>{isAr ? "100 مل" : "100ml"}</div>
                    </div>
                    <div className={styles.itemPrice}>
                      {(item.price * item.quantity).toLocaleString(isAr ? "ar-EG" : "en-US")}{" "}
                      {isAr ? "ج.م" : "EGP"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modern Unified Coupon Box */}
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className={styles.couponBox}>
                  <span className={styles.couponIcon}>
                    <Tag size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder={isAr ? "كود الخصم (مثال: JUVENILE10)" : "Discount code (e.g. JUVENILE10)"}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className={styles.couponInput}
                  />
                  <button type="submit" className={styles.couponBtn}>
                    {isAr ? "تطبيق" : "Apply"}
                  </button>
                </form>
              ) : (
                <div className={styles.couponSuccessTag}>
                  <span>
                    ✓ {isAr ? `تم تفعيل كود الخصم: ${appliedCoupon.code}` : `Applied: ${appliedCoupon.code}`} (
                    {appliedCoupon.discountPercent
                      ? `${appliedCoupon.discountPercent}%`
                      : `${(appliedCoupon.discountAmount || 0).toLocaleString(isAr ? "ar-EG" : "en-US")} ${isAr ? "ج.م" : "EGP"}`}
                    )
                  </span>
                  <button type="button" onClick={handleRemoveCoupon} className={styles.couponRemoveBtn}>
                    {isAr ? "إلغاء" : "Remove"}
                  </button>
                </div>
              )}

              {couponError && <div className={styles.errorText}>{couponError}</div>}

              {/* Price Breakdown */}
              <div className={styles.costBreakdown}>
                <div className={styles.costRow}>
                  <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span className={styles.costRowValue}>
                    {subtotal.toLocaleString(isAr ? "ar-EG" : "en-US")} {isAr ? "ج.م" : "EGP"}
                  </span>
                </div>

                <div className={styles.costRow}>
                  <span>{isAr ? "الشحن والتوصيل (البريد المصري)" : "Egypt Post Express Shipping"}</span>
                  <span className={styles.costRowShippingFree}>
                    {isAr ? "مجاني" : "Free"}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className={styles.costRow}>
                    <span>{isAr ? "قيمة الخصم" : "Discount"}</span>
                    <span className={styles.costRowDiscount}>
                      - {discountAmount.toLocaleString(isAr ? "ar-EG" : "en-US")} {isAr ? "ج.م" : "EGP"}
                    </span>
                  </div>
                )}
              </div>

              {/* Elevated Modern Total Row */}
              <div className={styles.totalRow}>
                <div>
                  <div className={styles.totalLabel}>{isAr ? "الإجمالي النهائي" : "Total"}</div>
                  <div className={styles.totalSubtext}>
                    {isAr ? "شامل الضريبة وتغليف الدار الفاخر" : "Including taxes & luxury packaging"}
                  </div>
                </div>
                <div className={styles.totalPrice}>
                  {finalTotal.toLocaleString(isAr ? "ar-EG" : "en-US")} {isAr ? "ج.م" : "EGP"}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
