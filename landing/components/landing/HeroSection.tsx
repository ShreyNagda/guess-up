"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  Zap,
  ShieldCheck,
  Flame,
  WifiOff,
  Sparkles,
  Share2,
} from "lucide-react";
import { Phone3DAnimation } from "./Phone3DAnimation";
import { Button } from "../ui/Button";

interface HeroSectionProps {
  onCtaClick: () => void;
}

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  const heroHighlights = [
    {
      icon: <Zap className="w-4 h-4 text-brand-primary fill-brand-primary" />,
      label: "Tilt & Tap Controls",
    },
    {
      icon: <Flame className="w-4 h-4 text-brand-primary fill-brand-primary" />,
      label: "Desi Pop Culture Decks",
    },
    {
      icon: (
        <Share2 className="w-4 h-4 text-brand-primary fill-brand-primary/20" />
      ),
      label: "Social Score Sharing",
    },
    {
      icon: <WifiOff className="w-4 h-4 text-brand-primary" />,
      label: "Play 100% Offline",
    },
  ];

  return (
    <section className="relative pt-8 pb-14 md:py-20 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-140 h-140 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
        >
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] sm:text-xs md:text-sm font-extrabold tracking-wider uppercase mb-4 sm:mb-6 border border-brand-primary/30 shadow-xs max-w-[92%] sm:max-w-none text-balance">
            <Sparkles className="w-3.5 h-3.5 text-brand-primary fill-brand-primary shrink-0" />
            <span>AD-FREE PARTY CHARADES GAME FOR INDIA</span>
          </div>

          {/* Centered Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight sm:tracking-tighter uppercase leading-tight sm:leading-[0.95] mb-4 sm:mb-6 max-w-5xl px-2 text-balance">
            <span className="block text-brand-text mb-1 sm:mb-2">
              FLIP YOUR PHONE.
            </span>
            <span className="block text-brand-primary drop-shadow-[0_0_35px_rgba(229,158,0,0.35)]">
              HILARIOUS CHAOS UNLOCKED.
            </span>
          </h1>

          {/* Centered Tagline */}
          <p className="text-sm sm:text-lg md:text-xl text-brand-text/90 font-medium sm:font-bold max-w-4xl mx-auto leading-relaxed mb-3 px-3 text-balance">
            Put your phone on your forehead, let your crew enact wild clues, and
            nod down to score! Handcrafted for Indian youth, house parties, and
            hostel hangouts.
          </p>

          {/* Secondary Micro-Copy */}
          <p className="text-xs sm:text-sm text-brand-muted font-medium max-w-2xl mx-auto mb-6 sm:mb-8 px-4 text-balance">
            Curated Desi pop-culture decks, dual tilt & tap controls, instant
            9:16 Instagram story scorecards, and 100% uninterrupted game flow.
          </p>

          {/* Primary CTA Button */}
          <div className="flex flex-col items-center gap-2.5 mb-12 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              onClick={onCtaClick}
              className="w-full sm:w-auto px-4 py-3 sm:px-8 sm:py-4 text-xs sm:text-base md:text-lg font-black uppercase tracking-wider whitespace-nowrap"
            >
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-current shrink-0" />
                <span>Register for Free Beta Access</span>
              </div>
            </Button>

            <span className="text-xs text-brand-muted font-medium tracking-wide">
              *iOS version currently in active development.
            </span>
          </div>

          {/* Centered 3D Phone Animation */}
          <div className="w-full flex justify-center mb-12">
            <Phone3DAnimation />
          </div>

          {/* Quick Stats / USPs Bar - Ensured single line per feature */}
          <div className="pt-6 border-t border-brand-border flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-3 w-full max-w-4xl text-center">
            {heroHighlights.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-brand-text whitespace-nowrap shrink-0"
              >
                {item.icon}
                <span className="whitespace-nowrap">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
