"use client";

import React from "react";
import { motion } from "framer-motion";
import { Pause } from "lucide-react";

interface HeroSectionProps {
  onCtaClick?: () => void;
}

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  const handleCta = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCtaClick) {
      onCtaClick();
    } else {
      const el = document.getElementById("founding-testers");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-transparent transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Small overline text (font-manrope, text-brand-muted, uppercase) */}
          <p className="font-manrope text-xs sm:text-sm font-extrabold tracking-widest text-brand-muted uppercase mb-3 sm:mb-4 select-none">
            Hey, I&apos;m building Bujho.
          </p>

          {/* H1 (font-lilita, massive) */}
          <h1 className="font-lilita text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-brand-text uppercase leading-[0.92] tracking-tight mb-5 max-w-4xl mx-auto">
            The Desi
            <br />
            Charades Game.
          </h1>

          {/* One-liner (text-brand-muted) */}
          <p className="font-manrope text-base sm:text-xl md:text-2xl text-brand-muted font-bold max-w-2xl mx-auto mb-8 sm:mb-10 leading-snug">
            Phone on forehead. Friends screaming. Tilt to score. I made this for
            our house parties and hostel nights. No ads, no Wi-Fi, just chaos.
          </p>

          {/* Primary CTA (btn-theme-primary, large) */}
          <div className="mb-14 sm:mb-16">
            <a
              href="#founding-testers"
              onClick={handleCta}
              className="btn-theme-primary inline-flex items-center justify-center font-lilita text-lg sm:text-2xl uppercase tracking-wider py-4 sm:py-4.5 px-8 sm:px-12 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all text-center select-none cursor-pointer"
            >
              Help me test it ▶
            </a>
          </div>

          {/* Gameplay screenshot ("Mahendra Singh Dhoni" card), framed with shadow-phone-3d, rounded corners, slight tilt */}
          <div className="w-full flex justify-center px-2">
            <div className="perspective-1000 w-full max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl">
              <motion.div
                initial={{ rotate: -2, y: 12 }}
                animate={{ rotate: -2, y: 0 }}
                whileHover={{ rotate: 0, scale: 1.02 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative w-full aspect-[19.5/9] rounded-3xl sm:rounded-[36px] border-2 sm:border-3 border-neutral-700/80 ring-1 ring-white/10 p-2 sm:p-3 bg-neutral-900 shadow-phone-3d select-none overflow-hidden"
              >
                {/* Inner Phone Screen */}
                <div className="relative w-full h-full bg-neutral-950 rounded-[20px] sm:rounded-[28px] overflow-hidden flex flex-col justify-between p-3.5 sm:p-6 text-white border border-neutral-800">
                  {/* Camera hole */}
                  <div className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-black rounded-full border border-neutral-700 z-30" />

                  {/* Top Bar HUD */}
                  <div className="flex items-center justify-between z-20 pointer-events-none">
                    <span className="font-lilita text-xl sm:text-2xl md:text-3xl text-emerald-400 drop-shadow-xs">
                      ★ 04
                    </span>

                    {/* Circular Timer Ring */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-700/70 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
                      <span className="font-lilita text-xs sm:text-sm md:text-base text-brand-primary tracking-wide">
                        28s
                      </span>
                    </div>

                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-900/80 border border-neutral-700 flex items-center justify-center">
                      <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-300 fill-neutral-300" />
                    </div>
                  </div>

                  {/* Center Gameplay Card: "Mahendra Singh Dhoni" */}
                  <div className="my-auto text-center z-10 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-party-orange/20 border border-party-orange/40 text-party-orange text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2">
                      <span>🏏 Cricket Fever</span>
                    </div>
                    <h2 className="font-lilita text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-amber-300 drop-shadow-[0_2px_18px_rgba(255,214,0,0.5)] uppercase tracking-tight leading-tight">
                      Mahendra Singh Dhoni
                    </h2>
                  </div>

                  {/* Bottom Tilt Instruction Pills */}
                  <div className="flex items-center justify-between text-[9px] sm:text-xs font-manrope font-black uppercase tracking-wider text-neutral-400 z-20">
                    <span className="flex items-center gap-1 text-emerald-400">
                      ↓ Tilt Down · Correct (+1)
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      ↑ Tilt Up · Pass
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
