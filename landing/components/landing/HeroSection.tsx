"use client";

import React from "react";
import { motion } from "framer-motion";
import { Phone3DAnimation } from "./Phone3DAnimation";
import { CTAButton } from "../ui/CTAButton";

interface HeroSectionProps {
  onCtaClick: () => void;
}

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* H1 Headline (font-lilita, massive) */}
          <h1 className="font-lilita text-6xl sm:text-8xl md:text-9xl text-brand-text uppercase leading-[0.9] tracking-tight mb-4">
            The Desi
            <br />
            Charades Game.
          </h1>

          {/* One-liner (text-brand-muted) */}
          <p className="font-manrope text-lg sm:text-2xl text-brand-muted font-bold max-w-2xl mx-auto mb-8">
            Phone on forehead. Friends screaming. Tilt to score.
          </p>

          {/* Primary CTA (btn-theme-primary, large) */}
          <div className="mb-3">
            <CTAButton onClick={onCtaClick} size="lg">
              Let the chaos begin ▶
            </CTAButton>
          </div>

          {/* Micro-line below CTA */}
          <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold tracking-wide uppercase mb-12">
            Free · Offline · Ad-free
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
