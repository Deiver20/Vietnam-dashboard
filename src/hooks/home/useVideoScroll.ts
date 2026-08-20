"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "video1" | "video2" | "video3";

export function useVideoScroll() {
  const [phase, setPhase] = useState<Phase>("video1");
  const [video1Opacity, setVideo1Opacity] = useState(1);
  const [video2Opacity, setVideo2Opacity] = useState(0);
  const [video3Opacity, setVideo3Opacity] = useState(0);
  const [video2Progress, setVideo2Progress] = useState(0);
  
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video3Ref = useRef<HTMLVideoElement>(null);
  
  const phaseRef = useRef<Phase>("video1");
  const isReady = useRef(false);

  useEffect(() => {
    if (video1Ref.current) {
      video1Ref.current.playbackRate = 0.35;
    }

    const handleScroll = () => {
      if (!isReady.current) return;
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      
      const scrollStart = vh * 0.1;
      const scrollEnd = vh * 1.9;
      const scrollRange = scrollEnd - scrollStart;

      if (scrollY < scrollStart) {
        if (phaseRef.current !== "video1") {
          phaseRef.current = "video1";
          setPhase("video1");
          setVideo2Opacity(0);
          setVideo3Opacity(0);
          setVideo2Progress(0);
          
          if (video3Ref.current) {
            video3Ref.current.pause();
          }
        }
        setVideo1Opacity(1);
        return;
      }

      if (scrollY >= scrollEnd) {
        if (phaseRef.current !== "video3") {
          phaseRef.current = "video3";
          setPhase("video3");
          setVideo1Opacity(0);
          setVideo2Opacity(0);
          setVideo3Opacity(1);
          setVideo2Progress(1);
          
          if (video3Ref.current) {
            video3Ref.current.play().catch(console.error);
          }
        }
        return;
      }

      if (phaseRef.current !== "video2") {
        phaseRef.current = "video2";
        setPhase("video2");
        setVideo2Opacity(1);
        setVideo3Opacity(0);
        
        if (video3Ref.current) {
          video3Ref.current.pause();
        }
      }

      const fadeEnd = vh;
      if (scrollY < fadeEnd) {
        const fadeProgress = (scrollY - scrollStart) / (fadeEnd - scrollStart);
        setVideo1Opacity(1 - fadeProgress);
      } else {
        setVideo1Opacity(0);
      }

      const scrollProgress = (scrollY - scrollStart) / scrollRange;
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
      setVideo2Progress(clampedProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    isReady.current = true;
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return {
    phase,
    video1Ref,
    video3Ref,
    video1Opacity,
    video2Opacity,
    video3Opacity,
    video2Progress,
  };
}
