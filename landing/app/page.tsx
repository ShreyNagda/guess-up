"use client";

import React, { useRef } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowToPlaySection } from "@/components/landing/HowToPlaySection";
import { DeckShowcaseSection } from "@/components/landing/DeckShowcaseSection";
import { BentoFeatures } from "@/components/landing/BentoFeatures";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  const waitlistRef = useRef<HTMLDivElement>(null);

  const scrollToWaitlist = () => {
    waitlistRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <main className="relative z-10 min-h-screen bg-brand-bg text-brand-text transition-colors duration-300">
      <Navbar />
      <HeroSection onCtaClick={scrollToWaitlist} />
      <HowToPlaySection />
      <DeckShowcaseSection />
      <BentoFeatures />
      <TestimonialsSection />
      <FaqSection />
      <WaitlistForm ref={waitlistRef} />
      <Footer />
    </main>
  );
}
