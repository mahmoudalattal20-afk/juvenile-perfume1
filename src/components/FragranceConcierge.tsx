"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  X,
  Send,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
  Check,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartData, useCartUI } from "@/context/CartContext";
import { useCMS } from "@/context/CMSContext";
import { ProductDetailData } from "@/data/products";
import styles from "./FragranceConcierge.module.css";
import { usePathname, useRouter } from "next/navigation";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  recommendedProductIds?: string[];
  timestamp: Date;
}

// Official Smiling Robot Mascot Icon (matching brand & user reference)
export const SmilingBotIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Top Antenna */}
    <circle cx="32" cy="7" r="3.5" fill="currentColor" />
    <rect x="30" y="9.5" width="4" height="6.5" rx="2" fill="currentColor" />

    {/* Outer Robot Head Silhouette */}
    <path
      d="M18 16C10 16 7 21 7 32C7 43 10 49 19 50.5C23 51.2 27.5 51.5 32 51.5C36.5 51.5 41 51.2 45 50.5C54 49 57 43 57 32C57 21 54 16 46 16H18Z"
      fill="currentColor"
    />

    {/* Side Ears / Headphone bumps */}
    <rect x="3" y="25" width="5.5" height="14" rx="2.75" fill="currentColor" />
    <rect x="55.5" y="25" width="5.5" height="14" rx="2.75" fill="currentColor" />

    {/* Inner Screen Face Visor (dark mask / blue cutout) */}
    <rect x="13.5" y="21" width="37" height="24" rx="10" fill="#0750cd" />

    {/* Left Eye */}
    <rect x="23" y="27.5" width="4.5" height="7.5" rx="2.25" fill="#ffffff" />

    {/* Right Eye */}
    <rect x="36.5" y="27.5" width="4.5" height="7.5" rx="2.25" fill="#ffffff" />

    {/* Cute Smile Line */}
    <path
      d="M27.5 38.5C28.8 40.2 30.2 40.8 32 40.8C33.8 40.8 35.2 40.2 36.5 38.5"
      stroke="#ffffff"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

export const FragranceConcierge: React.FC = () => {
  const { locale } = useLanguage();
  const { addToCart } = useCartData();
  const { setIsCartOpen } = useCartUI();
  const { cmsData } = useCMS();
  const pathname = usePathname();
  const router = useRouter();

  const isAr = locale === "ar";

  const isHidden =
    pathname === "/checkout" ||
    pathname?.startsWith("/checkout") ||
    pathname === "/admin" ||
    pathname?.startsWith("/admin") ||
    pathname === "/atelier-gate" ||
    pathname?.startsWith("/atelier-gate");

  const [isOpen, setIsOpen] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isLauncherVisible, setIsLauncherVisible] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set());

  // Proactive Egyptian Dialect Prompts
  const EGYPTIAN_PROMPTS = [
    { text: "منورنا! حابب تسألني عن أي حاجة؟", emoji: "😊" },
    { text: "بتدور على عطر معين؟ هساعدك تلاقيه", emoji: "🌸" },
    { text: "عايز ترشيح لعطر يناسب ذوقك ومناسبتك؟", emoji: "👌" },
    { text: "محتاج مساعدة تختار عطر لمناسبة خاصة؟", emoji: "🎁" },
  ];

  const EN_PROMPTS = [
    { text: "Welcome! Need any help?", emoji: "😊" },
    { text: "Looking for a signature scent?", emoji: "🌸" },
    { text: "Need a quick recommendation?", emoji: "👌" },
    { text: "Looking for a luxury gift?", emoji: "🎁" },
  ];

  const currentPrompts = isAr ? EGYPTIAN_PROMPTS : EN_PROMPTS;
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);
  const [bubbleIndex, setBubbleIndex] = useState(0);

  // Smooth entrance of the bot icon after page load
  useEffect(() => {
    if (isHidden) return;
    const timer = setTimeout(() => {
      setIsLauncherVisible(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [isHidden]);

  // Show speech bubble after 10 seconds of visiting, then rotate messages every 8 seconds
  useEffect(() => {
    if (isHidden || isOpen || hasUserInteracted) {
      setIsBubbleVisible(false);
      return;
    }

    // Step 1: Wait 10 seconds before first showing the bubble
    const initialTimer = setTimeout(() => {
      if (!hasUserInteracted && !isOpen) {
        setIsBubbleVisible(true);
      }
    }, 10000); // 10 seconds delay

    return () => clearTimeout(initialTimer);
  }, [isHidden, isOpen, hasUserInteracted]);

  // Step 2: Once bubble is visible, cycle messages every 8 seconds
  useEffect(() => {
    if (isHidden || !isBubbleVisible || isOpen || hasUserInteracted) return;

    const rotationInterval = setInterval(() => {
      setBubbleIndex((prev) => (prev + 1) % currentPrompts.length);
    }, 8000); // Rotate every 8 seconds

    return () => clearInterval(rotationInterval);
  }, [isHidden, isBubbleVisible, isOpen, hasUserInteracted, currentPrompts.length]);

  const handleOpenBot = () => {
    setHasUserInteracted(true);
    setIsLauncherVisible(true);
    setIsBubbleVisible(false);
    setIsOpen(true);
  };

  const initialWelcomeText = isAr
    ? `أهلاً بحضرتك في دار جُوفينيل للعطور 🌸
أنا مستشارك العطري الخاص، وموجود عشان أساعدك تختار العطر الأنسب لذوقك ومناسبتك.

قولي يا فندم، بتفضل العطور الهادية المنعشة، ولا الفخمة التقيلة للمناسبات؟`
    : `Welcome to JUVENILE Haute Parfumerie 🌸
I am your private fragrance consultant, here to guide you to the perfect scent for your style and occasions.

Would you prefer something fresh and vibrant, or rich and distinguished for evening wear?`;

  const DEFAULT_PROMPTS_AR = [
    "عايز عطر رسمي فخم للمناسبات",
    "إيه أفضل عطر رجالي هيبة وثابت؟",
    "عايزة عطر نسائي ناعم ومميز",
    "تفاصيل الشحن لجميع المحافظات",
  ];

  const DEFAULT_PROMPTS_EN = [
    "Warm winter fragrances",
    "Fresh everyday scents",
    "Best-selling picks",
    "Shipping & Delivery details",
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      text: initialWelcomeText,
      timestamp: new Date(),
    },
  ]);

  const [prompts, setPrompts] = useState<string[]>(
    isAr ? DEFAULT_PROMPTS_AR : DEFAULT_PROMPTS_EN
  );

  // Synchronize initial welcome message and suggestion prompts whenever language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant" && prev[0].id.startsWith("welcome")) {
        return [
          {
            ...prev[0],
            text: isAr
              ? "يا أهلاً بيك في دار جُوفينيل 🌸\nبتدور على عطر معين، ولا حابب أساعدك تختار الأنسب لذوقك ومناسبتك؟"
              : "Welcome to JUVENILE 🌸\nLooking for a specific fragrance, or can I help you choose the best match for your taste?",
          },
        ];
      }
      return prev;
    });

    setPrompts(isAr ? DEFAULT_PROMPTS_AR : DEFAULT_PROMPTS_EN);
  }, [locale, isAr]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const chipsRowRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({
    isDown: false,
    hasMoved: false,
    startX: 0,
    scrollLeft: 0,
  });

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input on desktop only when opened (never on mobile/touch screens to prevent virtual keyboard popping up)
  useEffect(() => {
    if (isOpen) {
      const isMobileOrTouch =
        typeof window !== "undefined" &&
        (window.innerWidth <= 768 ||
          (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) ||
          /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

      if (!isMobileOrTouch) {
        setTimeout(() => inputRef.current?.focus(), 250);
      }
    }
  }, [isOpen]);

  // Click outside listener for zero-backdrop floating desktop window
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        chatWindowRef.current &&
        !chatWindowRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Delay slightly to prevent the button click that opens the chat from triggering this
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }, 120);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  // Horizontal Wheel Scroll for Quick Prompt Chips on PC
  const handleChipsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (chipsRowRef.current && e.deltaY !== 0) {
      chipsRowRef.current.scrollLeft += isAr ? -e.deltaY : e.deltaY;
    }
  };

  // Mouse Drag to Scroll on Desktop
  const handleChipsMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chipsRowRef.current) return;
    dragStateRef.current = {
      isDown: true,
      hasMoved: false,
      startX: e.pageX,
      scrollLeft: chipsRowRef.current.scrollLeft,
    };
  };

  const handleChipsMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.isDown || !chipsRowRef.current) return;
    const dx = e.pageX - dragStateRef.current.startX;
    if (Math.abs(dx) > 5) {
      dragStateRef.current.hasMoved = true;
    }
    if (dragStateRef.current.hasMoved) {
      e.preventDefault();
      chipsRowRef.current.scrollLeft = dragStateRef.current.scrollLeft - dx;
    }
  };

  const handleChipsMouseUpOrLeave = () => {
    if (dragStateRef.current.isDown) {
      dragStateRef.current.isDown = false;
      setTimeout(() => {
        dragStateRef.current.hasMoved = false;
      }, 80);
    }
  };

  const handleChipClick = (promptText: string) => {
    if (dragStateRef.current.hasMoved) return;
    handleSendMessage(promptText);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    // Direct Instant CTA Navigation if user clicked or requested Checkout
    const norm = query.toLowerCase();
    if (
      (norm.includes("دفع") &&
        (norm.includes("اتمام") ||
          norm.includes("إتمام") ||
          norm.includes("صفحة") ||
          norm.includes("ذهاب") ||
          norm.includes("الان") ||
          norm.includes("الآن"))) ||
      norm.includes("checkout")
    ) {
      setIsOpen(false);
      router.push("/checkout");
      return;
    }

    const userMsgId = `user-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: "user",
        text: query,
        timestamp: new Date(),
      },
    ];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/bot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          locale: locale,
          history: newMessages.slice(-6).map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            text: (data.reply || "").replace(/\*{1,4}/g, "").replace(/#{1,6}\s?/g, ""),
            recommendedProductIds: data.recommendedProductIds,
            timestamp: new Date(),
          },
        ]);

        if (Array.isArray(data.suggestedPrompts) && data.suggestedPrompts.length > 0) {
          const cleanPrompts = data.suggestedPrompts.map((p: string) =>
            p
              .replace(
                /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu,
                ""
              )
              .trim()
          );
          setPrompts(cleanPrompts);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            text: isAr
              ? "نعتذر، حدثت استجابة غير متوقعة. يرجى إعادة المحاولة."
              : "Apologies, an unexpected response occurred. Please try again.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to query bot:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          text: isAr
            ? "تعذر الاتصال بمستشار العطور حالياً. يرجى التأكد من اتصالك وإعادة المحاولة."
            : "Could not reach the fragrance concierge. Please check your connection and retry.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for global open event (e.g. from smart AI search bar)
  useEffect(() => {
    const handleGlobalOpen = (e: any) => {
      setIsOpen(true);
      setHasUserInteracted(true);
      const query = e.detail?.query;
      if (query && typeof query === "string" && query.trim()) {
        setTimeout(() => {
          handleSendMessage(query.trim());
        }, 150);
      }
    };

    window.addEventListener("open-fragrance-concierge", handleGlobalOpen as EventListener);
    return () => {
      window.removeEventListener("open-fragrance-concierge", handleGlobalOpen as EventListener);
    };
  }, [handleSendMessage]);

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        text: initialWelcomeText,
        timestamp: new Date(),
      },
    ]);
    setPrompts(isAr ? DEFAULT_PROMPTS_AR : DEFAULT_PROMPTS_EN);
  };

  const handleAddToCartFromBot = (prod: ProductDetailData, e: React.MouseEvent) => {
    e.stopPropagation();

    // If already added, clicking it acts as a direct instant Checkout CTA!
    if (addedItemIds.has(prod.id)) {
      setIsOpen(false);
      router.push("/checkout");
      return;
    }

    addToCart({
      id: prod.id,
      name: isAr ? prod.arabicName : prod.name,
      type: isAr ? "إكستريت دي بارفان • 100 مل" : "Extrait de Parfum • 100ml",
      price: prod.price,
      formattedPrice: isAr ? `${prod.price.toLocaleString("ar-EG")} ج.م` : `${prod.price} EGP`,
      image: prod.image,
    });

    setAddedItemIds((prev) => new Set(prev).add(prod.id));

    // Append proactive, elegant assistant message with smart CTA
    const prodName = isAr ? prod.arabicName : prod.name;
    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-added-${Date.now()}`,
        role: "assistant",
        text: isAr
          ? `تمت إضافة عطر ${prodName} إلى سلتك بنجاح 🛍️✨\nتحب تتوجه فوراً لصفحة الدفع لتأكيد طلبك، ولا حابب تستكشف عطراً إضافياً لمناسبتك؟`
          : `Added ${prodName} to your cart successfully 🛍️✨\nWould you like to proceed directly to checkout, or explore another scent?`,
        timestamp: new Date(),
      },
    ]);

    setPrompts(
      isAr
        ? ["إتمام الطلب والدفع الآن 💳", "عايز ترشيح لعطر آخر 🌸", "تفاصيل الشحن والتوصيل"]
        : ["Proceed to Checkout 💳", "Discover another scent 🌸", "Shipping details"]
    );
  };

  if (isHidden) {
    return null;
  }

  return (
    <>
      {/* Official AI Smiling Bot Launcher with Egyptian Speech Bubble (Slides Up & Down) */}
      {!isOpen && (
        <div
          className={`${styles.launcherWrapper} ${
            isLauncherVisible ? styles.launcherWrapperVisible : ""
          }`}
          onMouseEnter={() => setIsLauncherVisible(true)}
        >
          {/* Proactive Egyptian Dialect Speech Bubble */}
          {isBubbleVisible && (
            <div
              key={bubbleIndex}
              className={styles.speechBubble}
              onClick={handleOpenBot}
              role="button"
              tabIndex={0}
            >
              <span className={styles.bubbleEmoji}>
                {currentPrompts[bubbleIndex]?.emoji || "😊"}
              </span>
              <div className={styles.bubbleContent}>
                <p className={styles.bubbleText}>
                  {currentPrompts[bubbleIndex]?.text}
                </p>
              </div>
              <button
                type="button"
                className={styles.bubbleCloseBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBubbleVisible(false);
                  setHasUserInteracted(true);
                }}
                aria-label={isAr ? "إغلاق" : "Close"}
              >
                <X size={10} />
              </button>
              <div className={styles.bubbleTail} />
            </div>
          )}

          {/* Official Smiling Robot Head Button */}
          <button
            type="button"
            className={styles.botLauncherBtn}
            onClick={handleOpenBot}
            aria-label={isAr ? "مستشار العطور الذكي" : "AI Fragrance Sommelier"}
          >
            <div className={styles.botAuraRing} />
            <div className={styles.botIconWrap}>
              <SmilingBotIcon size={36} />
            </div>
            <span className={styles.botStatusDot} />
          </button>
        </div>
      )}

      {/* Floating Chat Panel (Zero-GPU overhead, no full-screen blur) */}
      {isOpen && (
        <div
          className={styles.chatContainer}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div ref={chatWindowRef} className={styles.chatWindow}>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerIdentity}>
                <div className={styles.avatar}>
                  <SmilingBotIcon size={26} />
                </div>
                <div className={styles.headerText}>
                  <h3 className={styles.headerTitle}>
                    {isAr ? "خبير جُوفينيل" : "JUVENILE Sommelier"}
                  </h3>
                </div>
              </div>

              <div className={styles.headerActions}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={handleResetChat}
                  title={isAr ? "بدء محادثة جديدة" : "Reset conversation"}
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => setIsOpen(false)}
                  title={isAr ? "إغلاق" : "Close"}
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Messages Stream */}
            <div className={styles.messagesList}>
              {messages.map((msg) => {
                const isAssistant = msg.role === "assistant";

                // Resolve products if attached
                const attachedProducts: ProductDetailData[] = [];
                if (msg.recommendedProductIds && cmsData?.products) {
                  for (const pid of msg.recommendedProductIds) {
                    const found = cmsData.products[pid];
                    if (found) attachedProducts.push(found);
                  }
                }

                return (
                  <div
                    key={msg.id}
                    className={`${styles.messageRow} ${
                      isAssistant ? styles.messageRowAssistant : styles.messageRowUser
                    }`}
                  >
                    {isAssistant && (
                      <div className={styles.msgAvatar}>
                        <SmilingBotIcon size={18} />
                      </div>
                    )}

                    <div className={styles.msgBody}>
                      <div
                        className={`${styles.messageBubble} ${
                          isAssistant
                            ? styles.messageBubbleAssistant
                            : styles.messageBubbleUser
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Interactive Product Cards inside chat */}
                      {attachedProducts.length > 0 && (
                        <div className={styles.cardsList}>
                          {attachedProducts.map((prod) => {
                            const isJustAdded = addedItemIds.has(prod.id);
                            const topNote = isAr
                              ? prod.pyramid?.topNotes?.ar
                              : prod.pyramid?.topNotes?.en;
                            const baseNote = isAr
                              ? prod.pyramid?.baseNotes?.ar
                              : prod.pyramid?.baseNotes?.en;

                            return (
                              <div key={prod.id} className={styles.productCard}>
                                <div className={styles.cardImgWrap}>
                                  <Image
                                    src={prod.image}
                                    alt={prod.name}
                                    fill
                                    sizes="58px"
                                    className={styles.cardImg}
                                  />
                                </div>

                                <div className={styles.cardDetails}>
                                  <h4 className={styles.cardName}>
                                    {isAr ? prod.arabicName : prod.name}
                                  </h4>
                                  <div className={styles.cardNotes}>
                                    {topNote} • {baseNote}
                                  </div>
                                  <div className={styles.cardPriceRow}>
                                    <span className={styles.cardPrice}>
                                      {isAr
                                        ? `${prod.price.toLocaleString("ar-EG")} ج.م`
                                        : `${prod.price} EGP`}
                                    </span>

                                    <div className={styles.cardActions}>
                                      <button
                                        type="button"
                                        className={`${styles.addBtn} ${isJustAdded ? styles.addBtnChecked : ""}`}
                                        onClick={(e) => handleAddToCartFromBot(prod, e)}
                                        title={isJustAdded ? (isAr ? "الانتقال للدفع" : "Proceed to Checkout") : ""}
                                      >
                                        {isJustAdded ? (
                                          <>
                                            <ArrowRight size={12} />
                                            {isAr ? "إتمام الطلب 💳" : "Checkout 💳"}
                                          </>
                                        ) : (
                                          <>
                                            <ShoppingBag size={12} />
                                            {isAr ? "أضف للسلة" : "Add"}
                                          </>
                                        )}
                                      </button>

                                      <Link
                                        href={`/product/${prod.id}`}
                                        className={styles.viewBtn}
                                        onClick={() => setIsOpen(false)}
                                      >
                                        <ArrowRight size={12} />
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className={`${styles.messageRow} ${styles.messageRowAssistant}`}>
                  <div className={styles.msgAvatar}>
                    <SmilingBotIcon size={18} />
                  </div>
                  <div className={styles.msgBody}>
                    <div className={`${styles.messageBubble} ${styles.messageBubbleAssistant}`}>
                      <div className={styles.typingIndicator}>
                        <span className={styles.typingDot} />
                        <span className={styles.typingDot} />
                        <span className={styles.typingDot} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Chips (Smooth Scroll on Mobile & PC) */}
            <div
              ref={chipsRowRef}
              className={styles.chipsRow}
              onWheel={handleChipsWheel}
              onMouseDown={handleChipsMouseDown}
              onMouseMove={handleChipsMouseMove}
              onMouseUp={handleChipsMouseUpOrLeave}
              onMouseLeave={handleChipsMouseUpOrLeave}
            >
              {prompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className={styles.chipBtn}
                  onClick={() => handleChipClick(p)}
                  draggable={false}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              className={styles.inputForm}
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                className={styles.textInput}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isAr
                    ? "اسألني عن أي حاجة: نوتات، أسعار، ثبات، شحن..."
                    : "Ask about anything: notes, prices, longevity..."
                }
              />
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={!input.trim() || isLoading}
                aria-label={isAr ? "إرسال" : "Send"}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
