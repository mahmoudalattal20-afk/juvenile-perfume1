"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { SiteCMSData, DEFAULT_CMS_DATA } from "@/lib/cmsTypes";

interface CMSContextType {
  cmsData: SiteCMSData;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  refreshCMS: () => Promise<void>;
  updateCMS: (partial: Partial<SiteCMSData>) => Promise<boolean>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cmsData, setCmsData] = useState<SiteCMSData>(DEFAULT_CMS_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const fetchCMS = useCallback(async () => {
    try {
      // Instant cache check on client to prevent UI flash
      if (typeof window !== "undefined") {
        const cached = sessionStorage.getItem("juvenile_cms_cache");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && typeof parsed === "object") {
              if (Array.isArray(parsed.heroSlides)) {
                parsed.heroSlides = parsed.heroSlides.map((s: any) => ({
                  ...s,
                  imageSrc: s.imageSrc ? s.imageSrc.replace(/\.(png|jpg)$/i, ".webp") : s.imageSrc,
                  mobileImageSrc: s.mobileImageSrc ? s.mobileImageSrc.replace(/\.(png|jpg)$/i, ".webp") : s.mobileImageSrc,
                }));
              }
              setCmsData(parsed);
              setIsLoading(false);
            }
          } catch (e) {}
        }
      }

      const res = await fetch("/api/admin/content");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setCmsData(json.data);
          setLastSaved(json.data.lastUpdated || null);
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem("juvenile_cms_cache", JSON.stringify(json.data));
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live CMS content, using defaults", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCMS();
  }, [fetchCMS]);

  const updateCMS = async (partial: Partial<SiteCMSData>): Promise<boolean> => {
    setIsSaving(true);
    // Optimistic local update
    const nextData: SiteCMSData = {
      ...cmsData,
      ...partial,
      lastUpdated: new Date().toISOString(),
    };
    setCmsData(nextData);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("juvenile_cms_cache", JSON.stringify(nextData));
      } catch (e) {}
    }

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCmsData(json.data);
        setLastSaved(json.data.lastUpdated);
        setIsSaving(false);
        return true;
      }
    } catch (err) {
      console.error("Error saving CMS data:", err);
    }
    setIsSaving(false);
    return false;
  };

  return (
    <CMSContext.Provider
      value={{
        cmsData,
        isLoading,
        isSaving,
        lastSaved,
        refreshCMS: fetchCMS,
        updateCMS,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = (): CMSContextType => {
  const ctx = useContext(CMSContext);
  if (!ctx) {
    throw new Error("useCMS must be used within a CMSProvider");
  }
  return ctx;
};
