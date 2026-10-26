"use client";

import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ScreenshotsAndDecksSection } from "@/components/landing/ScreenshotsAndDecksSection";
import { VibeChipStrip } from "@/components/landing/VibeChipStrip";
import { FoundingTestersSection } from "@/components/landing/FoundingTestersSection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  const scrollToTesters = () => {
    const section = document.getElementById("founding-testers");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="relative z-10 min-h-screen bg-transparent text-brand-text transition-colors duration-300">
      {/* SECTION 1 — NAV (Thin, sticky) */}
      <Navbar onScrollToTesters={scrollToTesters} />

      {/* SECTION 2 — HERO (The Dev's Pitch) */}
      <HeroSection onCtaClick={scrollToTesters} />

      {/* SECTION 3 — SCREENSHOTS & DECKS (Visuals Only) */}
      <ScreenshotsAndDecksSection />

      {/* SECTION 4 — VIBE CHIP STRIP */}
      <VibeChipStrip />

      {/* SECTION 5 — FOUNDING TESTERS CTA (The Core Focus) */}
      <FoundingTestersSection />

      {/* SECTION 6 — FOOTER */}
      <Footer />
    </main>
  );
}
