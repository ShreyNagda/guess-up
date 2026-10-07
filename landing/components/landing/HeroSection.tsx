"use client";

import React from "react";
import { motion } from "framer-motion";
import { Phone3DAnimation } from "./Phone3DAnimation";
import { Button } from "../ui/Button";
import { FOUNDER_COUNT } from "@/lib/config";

interface HeroSectionProps {
  onCtaClick: () => void;
}

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  const scrollToHowItPlays = () => {
    const el = document.getElementById("how-to-play");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* H1 Headline */}
          <h1 className="font-lilita text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-brand-text uppercase leading-[0.95] tracking-tight mb-4 max-w-5xl mx-auto">
            The Desi Charades Game
          </h1>

          {/* Subhead */}
          <p className="font-manrope text-base sm:text-xl md:text-2xl text-brand-muted font-bold max-w-2xl mx-auto mb-8 leading-snug">
            Phone on forehead. Friends screaming. Tilt to score. Free, offline,
            and ad-free — forever.
          </p>

          {/* CTAs: Primary + Secondary Ghost Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 w-full sm:w-auto">
            <Button
              onClick={onCtaClick}
              size="lg"
              variant="primary"
              className="w-full sm:w-auto font-lilita text-base sm:text-lg uppercase tracking-wider py-4 px-8 shadow-xl"
            >
              Get Early Access ▶
            </Button>

            <Button
              onClick={scrollToHowItPlays}
              size="lg"
              variant="ghost"
              className="w-full sm:w-auto text-sm sm:text-base font-extrabold text-brand-muted hover:text-brand-text py-3.5 px-6 border border-brand-border/60 hover:border-brand-border rounded-full"
            >
              See how to play ↓
            </Button>
          </div>

          {/* Trust line below CTAs */}
          <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold tracking-wide uppercase mb-12">
            Free · No ads · Works offline · {FOUNDER_COUNT} founding players
            already in
          </p>

          {/* Gameplay screenshot framed with shadow-phone-3d */}
          <div className="w-full flex justify-center">
            <Phone3DAnimation />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
