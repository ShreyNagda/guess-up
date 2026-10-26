"use client";

import React from "react";
import { motion } from "framer-motion";

export function VibeChipStrip() {
  const chips = [
    "🚫 No ads",
    "✈️ Works offline",
    "👆 Tilt controls",
    "⚔️ 2-team mode",
    "🎨 Custom decks",
    "⚡ No signup",
  ];

  // Repeat items for seamless 60fps infinite marquee loop
  const marqueeItems = [...chips, ...chips, ...chips, ...chips];

  return (
    <section className="py-12 md:py-16 bg-transparent border-y border-brand-border/40 overflow-hidden transition-colors duration-300">
      <div className="w-full flex overflow-hidden select-none">
        <motion.div
          className="flex items-center gap-4 sm:gap-6 md:gap-8 shrink-0"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          }}
        >
          {marqueeItems.map((chip, idx) => (
            <div
              key={idx}
              className="font-manrope text-sm sm:text-base md:text-lg font-black whitespace-nowrap px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-brand-surface/90 backdrop-blur-md text-brand-text border border-brand-border shadow-xs shrink-0 select-none"
            >
              {chip}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default VibeChipStrip;
