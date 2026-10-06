"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  Zap,
  Flame,
  WifiOff,
  Sparkles,
  Share2,
  PartyPopper,
  Play,
} from "lucide-react";
import { Phone3DAnimation } from "./Phone3DAnimation";
import { Button } from "../ui/Button";

interface HeroSectionProps {
  onCtaClick: () => void;
  onVibeClick?: () => void;
}

export function HeroSection({ onCtaClick, onVibeClick }: HeroSectionProps) {
  const heroHighlights = [
    {
      icon: <Zap className="w-4 h-4 text-party-cyan fill-party-cyan/20" />,
      label: "Tilt & Tap Controls",
      color: "border-party-cyan/30 bg-party-cyan/10 text-brand-text",
    },
    {
      icon: (
        <Flame className="w-4 h-4 text-party-orange fill-party-orange/20" />
      ),
      label: "Bollywood, Cricket & Street Food",
      color: "border-party-orange/30 bg-party-orange/10 text-brand-text",
    },
    {
      icon: <Share2 className="w-4 h-4 text-party-pink fill-party-pink/20" />,
      label: "Instagram Story Scorecards",
      color: "border-party-pink/30 bg-party-pink/10 text-brand-text",
    },
    {
      icon: <WifiOff className="w-4 h-4 text-[#FFD600]" />,
      label: "100% Offline & Ad-Free",
      color: "border-[#FFD600]/30 bg-[#FFD600]/10 text-brand-text",
    },
  ];

  return (
    <section className="relative pt-8 pb-14 md:py-20 overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-linear-to-tr from-party-pink/20 via-party-orange/20 to-[#FFD600]/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      {/* Dynamic ambient gradient glow */}

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
        >
          {/* Centered H1 Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight sm:tracking-tighter uppercase leading-[0.95] mb-5 max-w-5xl px-2 text-balance">
            <span className="block text-brand-text mb-1">
              THE DESI CHARADES
            </span>
            <span className="block bg-linear-to-r from-party-pink via-party-orange to-[#FFD600] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,107,0,0.45)]">
              GAME.
            </span>
          </h1>

          {/* Centered Sub-headline */}
          <p className="text-base sm:text-xl md:text-2xl text-brand-text font-bold max-w-4xl mx-auto leading-relaxed mb-4 px-3 text-balance">
            Flip your phone. Gather your crew. Act out wild clues from
            Bollywood, cricket & street food. The 100% ad-free party game that
            turns any hangout into hilarious chaos.
          </p>

          {/* Secondary Hype Micro-Copy */}
          <p className="text-xs sm:text-sm text-brand-muted font-semibold max-w-2xl mx-auto mb-8 px-4 text-balance flex items-center justify-center gap-2">
            <PartyPopper className="w-4 h-4 text-party-pink shrink-0 inline" />
            <span>
              No ads. No setup. No buzzkills. Just pure, unfiltered party chaos.
            </span>
          </p>

          {/* Primary & Secondary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-12 w-full sm:w-auto justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={onCtaClick}
              className="w-full sm:w-auto px-6 py-4 text-sm sm:text-lg font-black uppercase tracking-wider whitespace-nowrap shadow-xl shadow-party-orange/25 hover:scale-105 transition-transform"
            >
              <div className="flex items-center justify-center gap-2.5">
                <Smartphone className="w-5 h-5 text-current shrink-0" />
                <span>Get the Party Started</span>
              </div>
            </Button>

            {onVibeClick && (
              <Button
                variant="secondary"
                size="lg"
                onClick={onVibeClick}
                className="w-full sm:w-auto px-6 py-4 text-sm sm:text-lg font-black uppercase tracking-wider whitespace-nowrap border-2 border-party-cyan/40 hover:bg-party-cyan/10 text-brand-text"
              >
                <div className="flex items-center justify-center gap-2">
                  <Play className="w-4 h-4 text-party-cyan fill-party-cyan shrink-0" />
                  <span>Vibe Check ⚡</span>
                </div>
              </Button>
            )}
          </div>

          {/* Centered 3D Phone Animation */}
          <div className="w-full flex justify-center mb-12">
            <Phone3DAnimation />
          </div>

          {/* Quick Stats / Highlights Bar */}
          <div className="pt-6 border-t border-brand-border flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full max-w-5xl text-center">
            {heroHighlights.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 transition-transform hover:scale-105 ${item.color}`}
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
