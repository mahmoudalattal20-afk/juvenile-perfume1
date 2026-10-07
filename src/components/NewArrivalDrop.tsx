"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./NewArrivalDrop.module.css";

const UNIT_TEXT = "COMING SOON  ✦  ";

export function NewArrivalDrop() {
  const [isHovered, setIsHovered] = useState(false);
  const { locale, direction: dir } = useLanguage();
  const isAr = locale === "ar";

  const stageRef = useRef<HTMLDivElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const backCanvas = backCanvasRef.current;
    const frontCanvas = frontCanvasRef.current;
    if (!stage || !backCanvas || !frontCanvas) return;

    const ctxBack = backCanvas.getContext("2d");
    const ctxFront = frontCanvas.getContext("2d");
    if (!ctxBack || !ctxFront) return;

    let animId: number;
    let baseAngle1 = 0;
    let baseAngle2 = Math.PI * 0.55;
    let isVisible = true;

    const resizeCanvases = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = rect.width;
      const h = rect.height;

      backCanvas.width = w * dpr;
      backCanvas.height = h * dpr;
      backCanvas.style.width = `${w}px`;
      backCanvas.style.height = `${h}px`;

      frontCanvas.width = w * dpr;
      frontCanvas.height = h * dpr;
      frontCanvas.style.width = `${w}px`;
      frontCanvas.style.height = `${h}px`;

      ctxBack.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctxFront.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvases();
    window.addEventListener("resize", resizeCanvases);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          animId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(stage);

    // 3D Orbital Projection Helper
    const projectOrbit = (
      theta: number,
      radius: number,
      tilt: number,
      slant: number,
      centerX: number,
      centerY: number
    ) => {
      const D = 680; // Perspective focal depth

      // Point on flat 3D circle
      const x0 = radius * Math.cos(theta);
      const z0 = radius * Math.sin(theta);

      // Tilt circle (pitch around X axis)
      const x1 = x0;
      const y1 = -z0 * Math.sin(tilt);
      const z1 = z0 * Math.cos(tilt);

      // Slant in 2D (yaw around Z axis)
      const cosS = Math.cos(slant);
      const sinS = Math.sin(slant);
      const X = x1 * cosS - y1 * sinS;
      const Y = x1 * sinS + y1 * cosS;
      const Z = z1;

      // Perspective projection
      const scale = D / (D - Z);
      const screenX = centerX + X * scale;
      const screenY = centerY + Y * scale;

      // Direction of reading (strictly Left to Right):
      // As theta decreases, the point moves left-to-right across the front of the bottle.
      // Tangent vector in the reading direction (-d/dtheta):
      const dx1 = radius * Math.sin(theta);
      const dy1 = radius * Math.cos(theta) * Math.sin(tilt);
      const Tx = dx1 * cosS - dy1 * sinS;
      const Ty = dx1 * sinS + dy1 * cosS;

      let tangent = Math.atan2(Ty, Tx);
      // Ensure letters are always standing upright and readable
      if (tangent > Math.PI / 2) {
        tangent -= Math.PI;
      } else if (tangent < -Math.PI / 2) {
        tangent += Math.PI;
      }

      // Foreshortening as letters turn around the sides
      const foreshorten = Math.max(0.48, Math.abs(Math.sin(theta)));

      return {
        screenX,
        screenY,
        Z,
        scale,
        tangent,
        foreshorten,
        isFront: z0 >= 0,
      };
    };

    // Render loop
    const render = () => {
      if (isVisible) {
        const rect = stage.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        const centerX = w / 2;
        // Vertically align orbit right around the amber belly / waist of the perfume bottle
        const centerY = h / 2 + 22;

        // Snug luxury radius (hugging the perfume bottle gracefully)
        const radius1 = Math.min(w * 0.28, 175);
        const radius2 = radius1 * 1.08;
        const fontSize = Math.max(14, Math.min(22, w * 0.034));

        ctxBack.clearRect(0, 0, w, h);
        ctxFront.clearRect(0, 0, w, h);

        // Calm, smooth rotation speeds
        const speed1 = isHovered ? 0.003 : 0.0062;
        const speed2 = isHovered ? -0.0026 : -0.0055;
        baseAngle1 += speed1;
        baseAngle2 += speed2;

        const tilt1 = 0.44;   // ~25 deg tilt
        const slant1 = -0.36; // ~ -21 deg slant (downward slope)

        const tilt2 = 0.42;   // ~24 deg tilt
        const slant2 = 0.38;  // ~ +22 deg slant (upward slope)

        const fontStr = `850 ${fontSize}px var(--font-sans-luxury), 'Montserrat', -apple-system, sans-serif`;
        ctxFront.font = fontStr;

        // Calculate seamless repetitions around circumference
        const unitW = ctxFront.measureText(UNIT_TEXT).width;
        const repeats1 = Math.max(3, Math.round((2 * Math.PI * radius1) / unitW));
        const fullText1 = UNIT_TEXT.repeat(repeats1);

        const repeats2 = Math.max(3, Math.round((2 * Math.PI * radius2) / unitW));
        const fullText2 = UNIT_TEXT.repeat(repeats2);

        // Measure Ring 1 characters for natural proportional kerning
        const charWidths1: number[] = [];
        let totalW1 = 0;
        for (let i = 0; i < fullText1.length; i++) {
          const char = fullText1[i];
          const cw = ctxFront.measureText(char).width + (char === " " ? 6 : 2.5);
          charWidths1.push(cw);
          totalW1 += cw;
        }

        // ── Render Ring 1 (Bold Solid Black) ──
        let currentAngle1 = baseAngle1;
        for (let i = 0; i < fullText1.length; i++) {
          const char = fullText1[i];
          const cw = charWidths1[i];
          // Advance angle in reading direction (decreasing theta ensures left-to-right reading: C-O-M-I-N-G S-O-O-N)
          const charTheta = currentAngle1 - (cw / 2 / totalW1) * (2 * Math.PI);
          currentAngle1 -= (cw / totalW1) * (2 * Math.PI);

          if (char === " ") continue;

          const p = projectOrbit(charTheta, radius1, tilt1, slant1, centerX, centerY);
          const ctx = p.isFront ? ctxFront : ctxBack;

          ctx.save();
          ctx.translate(p.screenX, p.screenY);
          ctx.rotate(p.tangent);
          ctx.scale(p.scale * p.foreshorten, p.scale);

          ctx.font = fontStr;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          if (p.isFront) {
            ctx.fillStyle = "#0a0a0a";
            ctx.fillText(char, 0, 0);
          } else {
            ctx.fillStyle = "rgba(10, 10, 10, 0.22)";
            ctx.fillText(char, 0, 0);
          }
          ctx.restore();
        }

        // Measure Ring 2 characters
        const charWidths2: number[] = [];
        let totalW2 = 0;
        for (let i = 0; i < fullText2.length; i++) {
          const char = fullText2[i];
          const cw = ctxFront.measureText(char).width + (char === " " ? 6 : 2.5);
          charWidths2.push(cw);
          totalW2 += cw;
        }

        // ── Render Ring 2 (Sleek Outlined Black) ──
        let currentAngle2 = baseAngle2;
        for (let i = 0; i < fullText2.length; i++) {
          const char = fullText2[i];
          const cw = charWidths2[i];
          const charTheta = currentAngle2 - (cw / 2 / totalW2) * (2 * Math.PI);
          currentAngle2 -= (cw / totalW2) * (2 * Math.PI);

          if (char === " ") continue;

          const p = projectOrbit(charTheta, radius2, tilt2, slant2, centerX, centerY);
          const ctx = p.isFront ? ctxFront : ctxBack;

          ctx.save();
          ctx.translate(p.screenX, p.screenY);
          ctx.rotate(p.tangent);
          ctx.scale(p.scale * p.foreshorten, p.scale);

          ctx.font = fontStr;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          if (p.isFront) {
            ctx.strokeStyle = "#0a0a0a";
            ctx.lineWidth = 1.4;
            ctx.strokeText(char, 0, 0);
          } else {
            ctx.strokeStyle = "rgba(10, 10, 10, 0.18)";
            ctx.lineWidth = 1.1;
            ctx.strokeText(char, 0, 0);
          }
          ctx.restore();
        }
      }

      if (isVisible) {
        animId = requestAnimationFrame(render);
      } else {
        animId = 0;
      }
    };

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", resizeCanvases);
      observer.disconnect();
    };
  }, [isHovered]);

  return (
    <section 
      className={styles.section}
      aria-label={isAr ? "إطلاق العطر الأحدث" : "New Fragrance Reveal - L'Origine Nocturne"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle Warm Amber Studio Aura behind flacon on pure white floor */}
      <div className={styles.ambientAura} />

      {/* Top Editorial Header */}
      <div className={styles.editorialHeader}>
        <div className={styles.badgeWrapper}>
          <span className={styles.badgeDot}>✦</span>
          <span className={styles.badgeText}>
            {isAr ? "L'ÉDITION NOUVELLE • الابتكار الأحدث" : "L'ÉDITION NOUVELLE • THE NEW CREATION"}
          </span>
          <span className={styles.badgeDot}>✦</span>
        </div>
        <h2 className={styles.title}>L'ORIGINE NOCTURNE</h2>
        <p className={styles.subtitle}>
          {isAr
            ? "سيمفونية عطرية نادرة تجمع بين دفء العنبر الملكي وغموض الباتشولي المخملي"
            : "A rare olfactory symphony uniting royal amber warmth with the velvet enigma of rare patchouli"}
        </p>
      </div>

      {/* Center Stage: Hero Perfume Flacon with 3D Orbiting Kinetic Typography */}
      <div className={styles.stageWrapper} ref={stageRef}>
        {/* Layer 1: Back Canvas (Orbits passing BEHIND the perfume bottle) */}
        <canvas className={styles.orbitCanvasBack} ref={backCanvasRef} aria-hidden="true" />

        {/* Layer 2: Perfume Flacon (Center Stage) */}
        <div className={styles.flaconStage}>
          <div className={styles.bottleContainer}>
            <div className={styles.flaconGlow} />
            <Image
              src="/heritage-bottle-transparent.png"
              alt="L'Origine Nocturne - Juvenile New Perfume"
              width={440}
              height={440}
              priority
              className={styles.bottleImage}
            />
            {/* Realistic Pedestal Contact Shadow on Pure White Floor */}
            <div className={styles.pedestalShadow} />
          </div>
        </div>

        {/* Layer 3: Front Canvas (Orbits passing IN FRONT of the perfume bottle) */}
        <canvas className={styles.orbitCanvasFront} ref={frontCanvasRef} aria-hidden="true" />
      </div>

      {/* Bottom Editorial Details & Modern Action */}
      <div className={styles.actionBlock}>
        <div className={styles.ctaGroup}>
          <button className={styles.modernCta} type="button">
            <span className={styles.ctaText}>
              {isAr ? "اكتشف العطر الجديد" : "DISCOVER THE NEW SCENT"}
            </span>
            <span className={styles.ctaSep}>/</span>
            <span className={styles.ctaPrice}>
              {isAr ? "720 ر.س" : "720 SAR"}
            </span>
            <svg 
              className={styles.ctaArrow} 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ transform: dir === "rtl" ? "none" : "scaleX(-1)" }}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <span className={styles.editionMeta}>
            {isAr 
              ? "50 مل • EXTRAIT DE PARFUM • إصدار محدود"
              : "50ML • EXTRAIT DE PARFUM • LIMITED NOCTURNE"}
          </span>
        </div>
      </div>
    </section>
  );
}
