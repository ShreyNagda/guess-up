"use client";

import React, { useRef, useState, useEffect } from "react";
import { Sparkles, Smartphone } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowToPlaySection } from "@/components/landing/HowToPlaySection";
import { DeckShowcaseSection } from "@/components/landing/DeckShowcaseSection";
import { BentoFeatures } from "@/components/landing/BentoFeatures";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  const waitlistRef = useRef<HTMLDivElement>(null);
  const [showMobileBottomBar, setShowMobileBottomBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show mobile bottom CTA after scrolling past initial hero header (250px)
      if (window.scrollY > 250) {
        setShowMobileBottomBar(true);
      } else {
        setShowMobileBottomBar(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToWaitlist = () => {
    waitlistRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <main className="relative z-10 min-h-screen bg-brand-bg text-brand-text transition-colors duration-300 pb-16 md:pb-0">
      <Navbar />
      <HeroSection onCtaClick={scrollToWaitlist} />
      <HowToPlaySection />
      <DeckShowcaseSection />
      <BentoFeatures />
      <TestimonialsSection />
      <FaqSection />
      <WaitlistForm ref={waitlistRef} />
      <Footer />

      {/* Floating Bottom Quick CTA Bar for Mobile First Experience */}
      {showMobileBottomBar && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-brand-surface/95 backdrop-blur-xl border-t border-brand-border shadow-[0_-10px_25px_rgba(0,0,0,0.3)] transition-all animate-in slide-in-from-bottom duration-300">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={scrollToWaitlist}
            className="py-3.5 text-xs font-black uppercase tracking-wider shadow-lg shadow-party-orange/25"
          >
            <div className="flex items-center justify-center gap-2">
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>Get the Party Started</span>
              <Sparkles className="w-3.5 h-3.5 text-[#FFD600] shrink-0" />
            </div>
          </Button>
        </div>
      )}
    </main>
  );
}
