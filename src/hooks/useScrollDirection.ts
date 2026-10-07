"use client";

import { useState, useEffect, useRef } from "react";

interface ScrollDirectionOptions {
  threshold?: number;
  initialDirection?: "up" | "down" | null;
  minScroll?: number;
}

export function useScrollDirection({
  threshold = 8,
  initialDirection = null,
  minScroll = 0,
}: ScrollDirectionOptions = {}) {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    initialDirection
  );
  const [isPastThreshold, setIsPastThreshold] = useState(false);

  const prevScrollY = useRef(0);
  const prevDirection = useRef<"up" | "down" | null>(initialDirection);
  const prevIsPast = useRef(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialY = window.scrollY || 0;
    prevScrollY.current = initialY;
    const initialPast = initialY > minScroll;
    prevIsPast.current = initialPast;
    setIsPastThreshold(initialPast);

    const handleScroll = () => {
      if (rafId.current !== null) return;

      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null;
        const currentScrollY = window.scrollY || 0;

        // Guard against iOS rubber-banding / elastic overscroll bounce
        if (currentScrollY < 0) return;

        const maxScroll = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight
        );
        if (currentScrollY > maxScroll) return;

        // Only trigger state change if the minScroll boundary is crossed
        const past = currentScrollY > minScroll;
        if (past !== prevIsPast.current) {
          prevIsPast.current = past;
          setIsPastThreshold(past);
        }

        const delta = currentScrollY - prevScrollY.current;

        if (Math.abs(delta) >= threshold) {
          const nextDir = delta > 0 ? "down" : "up";
          if (nextDir !== prevDirection.current) {
            prevDirection.current = nextDir;
            setScrollDirection(nextDir);
          }
          prevScrollY.current = currentScrollY;
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current !== null) {
        window.cancelAnimationFrame(rafId.current);
      }
    };
  }, [threshold, minScroll]);

  // Backward-compatible scrollY proxy: satisfies `scrollY > minScroll` checks without 60fps re-renders
  return {
    scrollDirection,
    isPastThreshold,
    scrollY: isPastThreshold ? minScroll + 1 : 0,
  };
}
