"use client";

import React from "react";
import { motion } from "framer-motion";

export function VibeChipStrip() {
  const chips = [
    "🚫 No ads",
    "✈️ Works offline",
    "👆 Tilt controls",
    "⚔️ 2-team mode",
    "📱 Story scorecards",
    "🎨 Custom decks",
    "⚡ No signup",
  ];

  // Quadruple items for seamless 60fps infinite marquee loop
  const marqueeItems = [...chips, ...chips, ...chips, ...chips];

  return (
    <section className="py-10 bg-transparent border-y border-brand-border/40 overflow-hidden transition-colors duration-300">
      <div className="w-full flex overflow-hidden select-none">
        <motion.div
          className="flex items-center gap-4 md:gap-8 shrink-0"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 40,
            ease: "linear",
          }}
        >
          {marqueeItems.map((chip, idx) => (
            <div
              key={idx}
              className="font-manrope text-sm sm:text-base font-black whitespace-nowrap px-6 py-3 rounded-full bg-brand-surface/80 backdrop-blur-md text-brand-text border border-brand-border/80 shadow-xs hover:scale-105 transition-transform shrink-0"
            >
              {chip}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
