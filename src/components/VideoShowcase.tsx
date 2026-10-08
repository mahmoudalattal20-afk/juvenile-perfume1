"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCMS } from "@/context/CMSContext";
import { useSpatialReveal } from "@/hooks/useSpatialReveal";
import styles from "./VideoShowcase.module.css";

interface VideoItem {
  src: string;
  poster?: string;
  label: string;
  title: string;
}

const defaultContent = {
  ar: {
    eyebrow: "",
    title: "قصص تُروى بالعطر",
    subtitle: "اكتشف الحكايات والإلهام وراء كل عطر.",
    videos: [
      { src: "/uploads/videos/video_1791364703195_7c3eb85f0f13.mp4", label: "المجموعة الملكية", title: "ROYAL COLLECTION" },
      { src: "/uploads/videos/video_1791364718433_725aa05d2965.mp4", label: "إصدار 2026", title: "SIGNATURE EDITION" },
    ] as VideoItem[],
  },
  en: {
    eyebrow: "",
    title: "BEYOND THE BOTTLE",
    subtitle: "Discover the stories that shape each fragrance.",
    videos: [
      { src: "/uploads/videos/video_1791364703195_7c3eb85f0f13.mp4", label: "Royal Collection", title: "ROYAL COLLECTION" },
      { src: "/uploads/videos/video_1791364718433_725aa05d2965.mp4", label: "2026 Edition", title: "SIGNATURE EDITION" },
    ] as VideoItem[],
  },
};

export function VideoShowcase() {
  const { locale } = useLanguage();
  const { cmsData } = useCMS();

  // Dynamic editorial texts from CMS
  const eyebrow = locale === "ar"
    ? (cmsData?.editorialSection?.eyebrowAr || defaultContent.ar.eyebrow)
    : (cmsData?.editorialSection?.eyebrowEn || defaultContent.en.eyebrow);

  const title = locale === "ar"
    ? (cmsData?.editorialSection?.titleAr || defaultContent.ar.title)
    : (cmsData?.editorialSection?.titleEn || defaultContent.en.title);

  const subtitle = locale === "ar"
    ? (cmsData?.editorialSection?.subtitleAr || defaultContent.ar.subtitle)
    : (cmsData?.editorialSection?.subtitleEn || defaultContent.en.subtitle);

  // Dynamic video list from CMS
  const cmsVideos = cmsData?.editorialVideos;
  const videos: VideoItem[] = (cmsVideos && cmsVideos.length > 0)
    ? cmsVideos.map((v) => ({
        src: v.src,
        poster: v.poster,
        label: locale === "ar" ? (v.labelAr || v.labelEn || "") : (v.labelEn || v.labelAr || ""),
        title: locale === "ar" ? (v.titleAr || v.titleEn || "") : (v.titleEn || v.titleAr || ""),
      }))
    : defaultContent[locale].videos;

  const { ref: sectionRef, isRevealed } = useSpatialReveal<HTMLElement>({
    threshold: 0.08,
    rootMargin: "0px 0px -6% 0px",
  });
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [mutedState, setMutedState] = useState<Record<number, boolean>>({});
  const [isPlaying, setIsPlaying] = useState<Record<number, boolean>>({});
  const [videoReady, setVideoReady] = useState<Record<number, boolean>>({});

  const isVideoPlaying = (idx: number) => isPlaying[idx] !== undefined ? isPlaying[idx] : true;
  const isVideoMuted = (idx: number) => mutedState[idx] !== undefined ? mutedState[idx] : true;

  // Aggressively attempt to play videos (muted is guaranteed allowed by all browsers)
  const attemptPlay = useCallback(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      video.muted = true;
      video.defaultMuted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying((prev) => ({ ...prev, [idx]: true }));
            setVideoReady((prev) => ({ ...prev, [idx]: true }));
          })
          .catch(() => {
            // Retry muted if initial play had audio policy restriction
            video.muted = true;
            video.play().catch(() => {});
          });
      }
    });
  }, []);

  // Preload and play when approaching viewport (320px lead time for instant play)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          attemptPlay();
        } else {
          videoRefs.current.forEach((video) => {
            if (video && !video.paused) {
              video.pause();
            }
          });
        }
      },
      { threshold: 0.05, rootMargin: "320px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [attemptPlay]);

  const togglePlay = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying((prev) => ({ ...prev, [index]: true }));
      }).catch(() => {});
    } else {
      video.pause();
      setIsPlaying((prev) => ({ ...prev, [index]: false }));
    }
  };

  const toggleMute = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMutedState((prev) => {
      const currentMuted = prev[index] !== undefined ? prev[index] : true;
      const nextMuted = !currentMuted;
      const video = videoRefs.current[index];
      if (video) video.muted = nextMuted;
      return { ...prev, [index]: nextMuted };
    });
  }, []);

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <section id="heritage" className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        {/* Header */}
        <div className={`${styles.header} ${isRevealed ? styles.headerVisible : ""}`}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {/* Video Grid */}
        <div className={styles.videoGrid}>
          {videos.map((item, idx) => (
            <div
              key={idx}
              className={`${styles.videoCard} ${
                isRevealed ? styles.videoCardVisible : ""
              }`}
              style={{
                transitionDelay: `${Math.min(idx * 40, 160)}ms`,
              }}
              onClick={() => togglePlay(idx)}
              role="button"
              tabIndex={0}
              aria-label={`${item.title} - ${isVideoPlaying(idx) ? "Pause" : "Play"}`}
            >
              {/* Video Skeleton / Loading Placeholder */}
              <div
                className={`${styles.videoSkeleton} ${
                  videoReady[idx] ? styles.videoSkeletonHidden : ""
                }`}
                aria-hidden="true"
              />

              {/* Video Element with guaranteed autoplay attributes */}
              <video
                ref={(el) => {
                  videoRefs.current[idx] = el;
                  if (el) {
                    el.muted = true;
                    el.defaultMuted = true;
                  }
                }}
                className={`${styles.video} ${videoReady[idx] ? styles.videoLoaded : ""}`}
                src={item.src.includes("#") ? item.src : `${item.src}#t=0.001`}
                poster={item.poster || undefined}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onLoadedData={() => {
                  setVideoReady((prev) => ({ ...prev, [idx]: true }));
                }}
                onCanPlay={() => {
                  setVideoReady((prev) => ({ ...prev, [idx]: true }));
                }}
                onPlay={() => {
                  setIsPlaying((prev) => ({ ...prev, [idx]: true }));
                  setVideoReady((prev) => ({ ...prev, [idx]: true }));
                }}
                onPause={() => {
                  setIsPlaying((prev) => ({ ...prev, [idx]: false }));
                }}
              />

              {/* Bottom gradient for text readability */}
              <div className={styles.videoGradient} />

              {/* Play / Pause overlay on hover or when paused */}
              <div
                className={styles.videoOverlay}
                style={{ opacity: isVideoPlaying(idx) ? undefined : 1 }}
              >
                <div className={styles.playIcon}>
                  {isVideoPlaying(idx) ? (
                    <Pause size={24} fill="#ffffff" />
                  ) : (
                    <Play size={24} fill="#ffffff" style={{ marginLeft: "2px" }} />
                  )}
                </div>
              </div>

              {/* Sound toggle */}
              <button
                className={styles.soundBtn}
                onClick={(e) => toggleMute(idx, e)}
                aria-label={isVideoMuted(idx) ? "Unmute" : "Mute"}
              >
                {isVideoMuted(idx) ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              {/* Info */}
              <div className={styles.videoInfo}>
                <p className={styles.videoLabel}>{item.label}</p>
                <h3 className={styles.videoTitle}>{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
