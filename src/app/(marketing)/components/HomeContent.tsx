"use client";

import { useEffect } from "react";
import { useVideoScroll } from "@/hooks/home/useVideoScroll";
import { VideoSequence } from "@/components/VideoSequence";
import HeroSection from "./home/HeroSection";
import StatsSection from "./home/StatsSection";
import ProductChartSection from "./home/ProductChartSection";
import IndustriesGrid from "./home/IndustriesGrid";
import EventCountdown from "./home/EventCountdown";
import CtaSection from "./home/CtaSection";
import PartnersClients from "./home/PartnersClients";

export default function HomeContent() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* Fixed video backdrop the page scrolls over */
  const {
    video1Ref,
    video3Ref,
    video1Opacity,
    video2Opacity,
    video3Opacity,
    video2Progress,
  } = useVideoScroll();

  return (
    <div className="flex flex-col flex-1 bg-[#001730]">
      {/* ════════════════════════ FIXED VIDEOS ════════════════════════ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video
          ref={video1Ref}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: video1Opacity }}
          src="/videos/video1.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <VideoSequence
          progress={video2Progress}
          opacity={video2Opacity}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
        />
        <video
          ref={video3Ref}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: video3Opacity }}
          src="/videos/video3.mp4"
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,23,48,0.9)_0%,_rgba(0,23,48,0.5)_80%,_transparent_100%)]" />
      </div>

      <HeroSection />

      {/* ════════════════════════ SCROLL SPACER ════════════════════════ */}
      <div className="h-[100dvh]" aria-hidden="true" />

      <StatsSection />
      <ProductChartSection />
      <IndustriesGrid />
      <EventCountdown />
      <CtaSection />
      <PartnersClients />
    </div>
  );
}
