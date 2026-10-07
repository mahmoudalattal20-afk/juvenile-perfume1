"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  ChevronDown,
  Loader2,
  AlertCircle,
  MessageCircle,
  Navigation,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./Contact.module.css";

export const ContactClient: React.FC = () => {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    serviceType: "general",
    preferredContact: "whatsapp",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.firstName.trim()) {
      setErrorMessage(isAr ? "يرجى كتابة الاسم" : "Please enter your name");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage(
        isAr ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email address"
      );
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 5) {
      setErrorMessage(
        isAr
          ? "يرجى كتابة تفاصيل استفسارك (5 أحرف على الأقل)"
          : "Please write your message (at least 5 characters)"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitSuccess(true);
        setReferenceId(data.referenceId || `JUV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      } else {
        setErrorMessage(
          data.error ||
            (isAr
              ? "تعذر إرسال الرسالة حالياً، يرجى المحاولة لاحقاً أو مراسلتنا على واتساب."
              : "Unable to submit inquiry at this moment, please try again.")
        );
      }
    } catch (err) {
      setErrorMessage(
        isAr
          ? "حدث خطأ أثناء الإرسال. يمكنك مراسلتنا مباشرة عبر واتساب."
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      serviceType: "general",
      preferredContact: "whatsapp",
      message: "",
    });
    setSubmitSuccess(false);
    setReferenceId("");
    setErrorMessage("");
  };

  const googleMapsUrl = "https://maps.google.com/?q=Citystars+Mall+Cairo+Egypt";

  const getWhatsAppLink = (customText?: string) => {
    const basePhone = "201123233355";
    const defaultText = isAr
      ? `السلام عليكم، حابب استفسر عن عطور جوفينيل وفرع سيتي ستارز.`
      : `Hello JUVENILE, I would like to inquire about your perfumes and Citystars branch.`;
    const textToSend = encodeURIComponent(customText || defaultText);
    return `https://wa.me/${basePhone}?text=${textToSend}`;
  };

  const faqs = isAr
    ? [
        {
          q: "مكان فرع جوفينيل فين بالظبط جوة سيتي ستارز؟",
          a: "منورنا دايماً في سيتي ستارز مول - المرحلة التانية (Phase 2) - الدور الأول، مباشرة قدام محل Skechers.",
        },
        {
          q: "مواعيد عمل الفرع إيه؟",
          a: "شغالين يومياً طوال الأسبوع من الساعة 10:00 الصبح لحد 11:30 بالليل.",
        },
        {
          q: "الشحن بياخد قد إيه لو طلبت أونلاين؟",
          a: "التوصيل داخل القاهرة والجيزة بيكون خلال 24 لـ 48 ساعة، وباقي المحافظات من يومين لـ 4 أيام عمل.",
        },
        {
          q: "إيه هو تركيز عطور جوفينيل وضمان الثبات؟",
          a: "كل عطور جوفينيل بتركيز Extrait de Parfum عالي النقاء باستخدام زيوت فرنسية أصلية بثبات مضمون يتجاوز 24 ساعة.",
        },
      ]
    : [
        {
          q: "Where is JUVENILE located inside Citystars Mall?",
          a: "We are located at Citystars Mall, Phase 2, 1st Floor, directly in front of Skechers.",
        },
        {
          q: "What are your opening hours?",
          a: "Open daily from 10:00 AM to 11:30 PM.",
        },
        {
          q: "How fast is delivery for online orders?",
          a: "Orders in Cairo and Giza are delivered within 24–48 hours, and 2–4 business days for other governorates.",
        },
        {
          q: "What is the perfume concentration?",
          a: "All our perfumes are Extrait de Parfum concentration with 24+ hour longevity guarantee.",
        },
      ];

  return (
    <div className={styles.pageWrapper} dir={isAr ? "rtl" : "ltr"}>
      <div className={styles.container}>
        {/* =================================================================
            1. TOP HERO CONTAINER (MATCHING REFERENCE LAYOUT)
            ================================================================= */}
        <section className={styles.topHeroBox}>
          <div className={styles.pillBadge}>
            <span>{isAr ? "تواصل معنا" : "CONTACT US"}</span>
          </div>

          <h1 className={styles.mainHeading}>
            {isAr
              ? "تواصل معنا، إحنا دايماً في خدمتك"
              : "Get in touch, let us know how we can help"}
          </h1>

          <p className={styles.subHeading}>
            {isAr
              ? "لو عندك أي استفسار عن عطورنا، مواعيد الفرع، أو متابعة طلبك.. تواصل معانا وهنرد عليك فوراً."
              : "Have a question about our perfumes, branch hours, or an order? Reach out and we'll help you promptly."}
          </p>

          {/* 3 Quick Cards Row */}
          <div className={styles.quickInfoGrid}>
            {/* Card 1: Email */}
            <a
              href="mailto:juvenilefragrance@gmail.com"
              className={styles.infoCard}
              title="juvenilefragrance@gmail.com"
            >
              <div className={styles.infoCardIconBubble}>
                <Mail size={20} />
              </div>
              <div className={styles.infoCardContent}>
                <div className={styles.infoCardLabel}>
                  {isAr ? "البريد الإلكتروني" : "Email Address"}
                </div>
                <div className={styles.infoCardValue} dir="ltr">
                  juvenilefragrance@gmail.com
                </div>
              </div>
            </a>

            {/* Card 2: Phone */}
            <a
              href="tel:01123233355"
              className={styles.infoCard}
              title="+20 112 323 3355"
            >
              <div className={styles.infoCardIconBubble}>
                <Phone size={20} />
              </div>
              <div className={styles.infoCardContent}>
                <div className={styles.infoCardLabel}>
                  {isAr ? "رقم الهاتف / واتساب" : "Phone Number"}
                </div>
                <div className={styles.infoCardValue} dir="ltr">
                  +20 112 323 3355
                </div>
              </div>
            </a>

            {/* Card 3: Our Office / Branch */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.infoCard}
              title="Juvenile – Citystars Mall, Phase 2, 1st Floor, in front of Skechers"
            >
              <div className={styles.infoCardIconBubble}>
                <MapPin size={20} />
              </div>
              <div className={styles.infoCardContent}>
                <div className={styles.infoCardLabel}>
                  {isAr ? "الفرع الرئيسي" : "Our Branch"}
                </div>
                <div className={styles.infoCardValue}>
                  {isAr
                    ? "سيتي ستارز مول - المرحلة 2 - الدور 1"
                    : "Citystars Mall, Phase 2, 1st Floor"}
                </div>
              </div>
            </a>
          </div>
        </section>

        {/* =================================================================
            2. BOTTOM MAIN CONTAINER: MAP & FORM (MATCHING REFERENCE LAYOUT)
            ================================================================= */}
        <section className={styles.bottomMainBox}>
          <div className={styles.mainSplitGrid}>
            {/* Column 1: Map */}
            <div className={styles.mapCardColumn}>
              <div className={styles.mapVisualContainer}>
                <iframe
                  title="Juvenile Perfume - Citystars Mall"
                  className={styles.mapIframe}
                  src="https://maps.google.com/maps?q=Citystars+Mall+Heliopolis+Cairo&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  loading="lazy"
                  allowFullScreen
                />
                <div className={styles.mapFloatingOverlay}>
                  <div className={styles.mapOverlayInfo}>
                    <span className={styles.mapOverlayTitle}>
                      {isAr ? "فرع سيتي ستارز (أمام Skechers)" : "Citystars Mall (in front of Skechers)"}
                    </span>
                    <span>
                      {isAr ? "المرحلة 2، الدور الأول • يومياً حتى 11:30 م" : "Phase 2, 1st Floor • Daily till 11:30 PM"}
                    </span>
                  </div>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapDirectionsBtn}
                  >
                    <Navigation size={13} />
                    <span>{isAr ? "الاتجاهات" : "Directions"}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Form */}
            <div className={styles.formColumn}>
              {!submitSuccess ? (
                <form onSubmit={handleSubmit} className={styles.contactForm}>
                  {errorMessage && (
                    <div className={styles.errorMessageBanner} role="alert">
                      <AlertCircle size={16} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Name Row */}
                  <div className={styles.formRowDouble}>
                    <div className={styles.formGroup}>
                      <label htmlFor="firstName" className={styles.formLabel}>
                        {isAr ? "الاسم الأول" : "Your Name"}
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder={isAr ? "اسمك" : "Your name"}
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="lastName" className={styles.formLabel}>
                        {isAr ? "اسم العائلة" : "Last Name"}
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder={isAr ? "اسم العائلة" : "Last name"}
                        className={styles.formInput}
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className={styles.formRowDouble}>
                    <div className={styles.formGroup}>
                      <label htmlFor="email" className={styles.formLabel}>
                        {isAr ? "البريد الإلكتروني" : "Email address"}
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={isAr ? "بريدك الإلكتروني" : "Your email address"}
                        className={styles.formInput}
                        dir="ltr"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="phone" className={styles.formLabel}>
                        {isAr ? "رقم الموبايل / واتساب" : "Phone number"}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="01123233355"
                        className={styles.formInput}
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className={styles.formGroup}>
                    <label htmlFor="message" className={styles.formLabel}>
                      {isAr ? "الرسالة أو الاستفسار" : "Message"}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={isAr ? "اكتب استفسارك هنا..." : "Write something..."}
                      className={styles.formTextarea}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={styles.formSubmitBtn}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>{isAr ? "جاري الإرسال..." : "Sending..."}</span>
                      </>
                    ) : (
                      <span>{isAr ? "إرسال الرسالة" : "Submit"}</span>
                    )}
                  </button>
                </form>
              ) : (
                /* Success Card */
                <div className={styles.successCard}>
                  <div className={styles.successIconBadge}>
                    <CheckCircle2 size={32} />
                  </div>

                  <h3 className={styles.successTitle}>
                    {isAr ? "تم استلام رسالتك بنجاح!" : "Message Sent!"}
                  </h3>

                  <p className={styles.successDesc}>
                    {isAr
                      ? "شكراً لتواصلك معانا، هنراجع رسالتك ونرد عليك في أقرب وقت."
                      : "Thank you for reaching out. We will get back to you shortly."}
                  </p>

                  <div className={styles.referenceBadge}>
                    {isAr ? "رقم الطلب:" : "Reference:"} <strong>{referenceId}</strong>
                  </div>

                  <div className={styles.successActions}>
                    <a
                      href={getWhatsAppLink(
                        isAr
                          ? `السلام عليكم، بعت رسالة برقم مرجع: ${referenceId}`
                          : `Hello, I submitted an inquiry with reference: ${referenceId}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnWhatsAppSuccess}
                    >
                      <MessageCircle size={16} />
                      <span>{isAr ? "المتابعة عبر واتساب" : "Chat on WhatsApp"}</span>
                    </a>

                    <button
                      type="button"
                      onClick={resetForm}
                      className={styles.btnResetSuccess}
                    >
                      <span>{isAr ? "إرسال رسالة أخرى" : "Send Another"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =================================================================
            3. FAQ SECTION (CLEAN & DIRECT)
            ================================================================= */}
        <section className={styles.faqSection}>
          <div className={styles.sectionHeaderCenter}>
            <h2 className={styles.sectionTitle}>
              {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
            </h2>
            <p className={styles.sectionSubtitle}>
              {isAr
                ? "إجابات سريعة على أهم الأسئلة بخصوص الفرع والأوردرات."
                : "Quick answers about our branch and orders."}
            </p>
          </div>

          <div className={styles.faqList}>
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}
                >
                  <button
                    type="button"
                    className={styles.faqQuestionBtn}
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`${styles.faqIconRotator} ${
                        isOpen ? styles.faqIconRotatorOpen : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className={styles.faqAnswerWrapper}>
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
