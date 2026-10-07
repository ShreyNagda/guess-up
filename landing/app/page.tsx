"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, ExternalLink, X } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowToPlaySection } from "@/components/landing/HowToPlaySection";
import { DeckShowcaseSection } from "@/components/landing/DeckShowcaseSection";
import { VibeChipStrip } from "@/components/landing/VibeChipStrip";
import { FaqSection } from "@/components/landing/FaqSection";
import {
  TesterOnboardingSection,
  DEFAULT_PLAY_STORE_URL,
} from "@/components/landing/TesterOnboardingSection";
import { Footer } from "@/components/landing/Footer";
import { CTAButton } from "@/components/ui/CTAButton";

export default function LandingPage() {
  const [showMobileBottomBar, setShowMobileBottomBar] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setShowMobileBottomBar(true);
      } else {
        setShowMobileBottomBar(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTesterSection = () => {
    const section = document.getElementById("tester-onboarding");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleConfirmTesterFlow = () => {
    setShowSuccessToast(true);
  };

  return (
    <main className="relative z-10 min-h-screen bg-transparent text-brand-text transition-colors duration-300 pb-20 md:pb-0">
      {/* 1. NAV (Thin, sticky) */}
      <Navbar onOpenTesterModal={scrollToTesterSection} />

      {/* 2. HERO */}
      <HeroSection onCtaClick={scrollToTesterSection} />

      {/* 3. HOW TO PLAY (Visual 4-step cards) */}
      <HowToPlaySection />

      {/* 4. DECKS SHOWCASE */}
      <DeckShowcaseSection />

      {/* 5. VIBE CHIP STRIP (Marquee) */}
      <VibeChipStrip />

      {/* 6. FAQ SECTION */}
      <FaqSection />

      {/* 7. FIXED TESTER ONBOARDING SECTION (High-trust permanent section) */}
      <TesterOnboardingSection onConfirm={handleConfirmTesterFlow} />

      {/* 8. FOOTER */}
      <Footer />

      {/* Success Toast Notification after continuing */}
      {showSuccessToast && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:max-w-md z-50 p-4 rounded-2xl bg-brand-surface border-2 border-emerald-500/40 text-brand-text shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300 font-manrope">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="font-extrabold text-xs sm:text-sm text-brand-text">
                You&apos;re in! 🎉
              </div>
              <a
                href={DEFAULT_PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-party-orange hover:underline inline-flex items-center gap-1"
              >
                <span>Head to the Play Store to download Bujho.</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="p-1 text-brand-muted hover:text-brand-text rounded-lg cursor-pointer"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Bottom Quick CTA Bar for Mobile */}
      {showMobileBottomBar && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-2.5 bg-brand-surface/95 backdrop-blur-xl border-t border-brand-border shadow-[0_-10px_25px_rgba(0,0,0,0.3)] transition-all animate-in slide-in-from-bottom duration-300 flex justify-center">
          <CTAButton
            onClick={scrollToTesterSection}
            size="md"
            className="w-full justify-center"
          >
            Let the chaos begin ▶
          </CTAButton>
        </div>
      )}
    </main>
  );
}
