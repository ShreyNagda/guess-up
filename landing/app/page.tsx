"use client";

import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, X, Sparkles } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowToPlaySection } from "@/components/landing/HowToPlaySection";
import { DeckShowcaseSection } from "@/components/landing/DeckShowcaseSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { VibeChipStrip } from "@/components/landing/VibeChipStrip";
import { FaqSection } from "@/components/landing/FaqSection";
import { EarlyAccessSection } from "@/components/landing/EarlyAccessSection";
import { ShareSection } from "@/components/landing/ShareSection";
import { IosWaitlistSection } from "@/components/landing/IosWaitlistSection";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  const [showMobileBottomBar, setShowMobileBottomBar] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEarlyAccessHighlighted, setIsEarlyAccessHighlighted] =
    useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("early-access");
      let isEarlyAccessVisible = false;

      if (section) {
        const rect = section.getBoundingClientRect();
        // Hide if early access section is in viewport
        isEarlyAccessVisible =
          rect.top < window.innerHeight - 80 && rect.bottom > 80;
      }

      if (window.scrollY > 300 && !isEarlyAccessVisible) {
        setShowMobileBottomBar(true);
      } else {
        setShowMobileBottomBar(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const scrollToEarlyAccess = () => {
    const section = document.getElementById("early-access");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setIsEarlyAccessHighlighted(true);
      setTimeout(() => {
        setIsEarlyAccessHighlighted(false);
      }, 2000);
    }
  };

  return (
    <main className="relative z-10 min-h-screen bg-transparent text-brand-text transition-colors duration-300 pb-20 md:pb-0">
      {/* 1. NAVBAR (sticky) */}
      <Navbar onOpenEarlyAccess={scrollToEarlyAccess} />

      {/* 2. HERO — MARKETING FIRST */}
      <HeroSection onCtaClick={scrollToEarlyAccess} />

      {/* 3. HOW IT PLAYS */}
      <HowToPlaySection />

      {/* 4. DECK PREVIEW */}
      <DeckShowcaseSection />

      {/* 5. SOCIAL PROOF BLOCK (3 columns: Testimonials, Cities, Founder Note) */}
      <SocialProofSection />

      {/* 6. FEATURE MARQUEE */}
      <VibeChipStrip />

      {/* 7. FAQ (EXPANDED ACCORDION) */}
      <FaqSection />

      {/* 8. EARLY ACCESS SECTION (id="early-access") — THE FUNNEL */}
      <EarlyAccessSection
        onToastMessage={triggerToast}
        isHighlighted={isEarlyAccessHighlighted}
      />

      {/* 9. SHARE / RECRUITMENT BLOCK */}
      <ShareSection onToastMessage={triggerToast} />

      {/* 10. iOS WAITLIST SECTION */}
      <IosWaitlistSection />

      {/* 11. FOOTER */}
      <Footer />

      {/* Dynamic Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:max-w-md z-50 p-4 rounded-2xl bg-brand-surface border-2 border-emerald-500/40 text-brand-text shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300 font-manrope">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-brand-text">
              {toastMessage}
            </div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-brand-muted hover:text-brand-text rounded-lg cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Bottom Quick CTA Bar for Mobile */}
      {showMobileBottomBar && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-2.5 bg-brand-surface/95 backdrop-blur-xl border-t border-brand-border shadow-[0_-10px_25px_rgba(0,0,0,0.3)] transition-all animate-in slide-in-from-bottom duration-300 flex justify-center">
          <Button
            variant="primary"
            size="md"
            onClick={scrollToEarlyAccess}
            className="w-full justify-center shadow-lg font-lilita"
          >
            <span>Get Early Access ▶</span>
          </Button>
        </div>
      )}
    </main>
  );
}
