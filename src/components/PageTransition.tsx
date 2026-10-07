"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./PageTransition.module.css";

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const pathname = usePathname();
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      // Trigger subtle luxury entrance & hairline progress
      setAnimating(true);
      setProgress(25);

      const t1 = setTimeout(() => setProgress(75), 80);
      const t2 = setTimeout(() => setProgress(100), 220);
      const t3 = setTimeout(() => {
        setAnimating(false);
        setProgress(0);
      }, 340);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [pathname]);

  return (
    <>
      {/* Maison Tricolour Champagne Gold Hairline Progress Bar */}
      <div
        className={`${styles.progressBar} ${progress > 0 ? styles.progressActive : ""}`}
        style={{
          width: `${progress}%`,
          opacity: progress > 0 ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* Haute Parfumerie Page Content Wrapper with Silk Crossfade */}
      <div
        key={pathname}
        className={`${styles.pageWrapper} ${animating ? styles.animating : ""}`}
      >
        {children}
      </div>
    </>
  );
};
