"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react";

type Phase = "hero" | "transition" | "stats";

interface VideoScrollContextType {
  phase: Phase;
  setPhase: (phase: Phase) => void;
  video1Ref: React.RefObject<HTMLVideoElement | null>;
  video2Ref: React.RefObject<HTMLVideoElement | null>;
  video3Ref: React.RefObject<HTMLVideoElement | null>;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  hasPlayedTransition: React.MutableRefObject<boolean>;
}

const VideoScrollContext = createContext<VideoScrollContextType | null>(null);

export function VideoScrollProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("hero");
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const video3Ref = useRef<HTMLVideoElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const hasPlayedTransition = useRef(false);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && phase === "hero" && !hasPlayedTransition.current) {
            hasPlayedTransition.current = true;
            setPhase("transition");
            document.body.style.overflow = "hidden";
            if (video2Ref.current) {
              video2Ref.current.currentTime = 0;
              video2Ref.current.play();
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [phase]);

  useEffect(() => {
    if (phase === "transition" && video2Ref.current) {
      const handleEnded = () => {
        setPhase("stats");
        document.body.style.overflow = "";
        if (video3Ref.current) {
          video3Ref.current.play();
        }
      };

      video2Ref.current.addEventListener("ended", handleEnded);
      return () => {
        video2Ref.current?.removeEventListener("ended", handleEnded);
      };
    }
  }, [phase]);

  useEffect(() => {
    const handleScroll = () => {
      if (phase === "stats" && window.scrollY === 0) {
        hasPlayedTransition.current = false;
        setPhase("hero");
        if (video1Ref.current) {
          video1Ref.current.play();
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [phase]);

  return (
    <VideoScrollContext.Provider
      value={{
        phase,
        setPhase,
        video1Ref,
        video2Ref,
        video3Ref,
        triggerRef,
        hasPlayedTransition,
      }}
    >
      {children}
      <video
        ref={video2Ref}
        className={`fixed inset-0 w-full h-full object-cover z-50 transition-opacity duration-300 ${
          phase === "transition" ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        src="/videos/video2.mp4"
        muted
        playsInline
      />
    </VideoScrollContext.Provider>
  );
}

export function VideoHero() {
  const context = useContext(VideoScrollContext);
  if (!context) return null;

  const { phase, video1Ref, triggerRef } = context;

  return (
    <>
      <video
        ref={video1Ref}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          phase === "hero" ? "opacity-100" : "opacity-0"
        }`}
        src="/videos/video1.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div
        ref={triggerRef}
        className="absolute bottom-0 left-0 right-0 h-[20vh] pointer-events-none"
      />
    </>
  );
}

export function VideoStats() {
  const context = useContext(VideoScrollContext);
  if (!context) return null;

  const { phase, video3Ref } = context;

  return (
    <video
      ref={video3Ref}
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
        phase === "stats" ? "opacity-100" : "opacity-0"
      }`}
      src="/videos/video3.mp4"
      muted
      loop
      playsInline
    />
  );
}
