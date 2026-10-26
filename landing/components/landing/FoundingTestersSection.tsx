"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  GOOGLE_GROUP_URL,
  PLAY_STORE_WEB_URL,
  INSTAGRAM_URL,
} from "@/lib/config";

export function FoundingTestersSection() {
  return (
    <section
      id="founding-testers"
      className="py-20 md:py-28 bg-transparent transition-colors duration-300 relative scroll-mt-20"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Large prominent card with distinct border & background */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl sm:rounded-[36px] bg-brand-card border-2 border-brand-primary/40 shadow-2xl p-6 sm:p-10 md:p-14 text-center relative overflow-hidden"
        >
          {/* Subtle party ambient glow behind */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-party-pink/10 rounded-full blur-3xl pointer-events-none" />

          {/* Indie Overline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-party-orange/10 border border-party-orange/25 text-party-orange text-xs font-black uppercase tracking-wider mb-4">
            <span>👋 Solo Dev Invite</span>
          </div>

          {/* Header (font-lilita, large) */}
          <h2 className="font-lilita text-4xl sm:text-6xl md:text-7xl text-brand-text uppercase tracking-tight mb-4">
            Become a Founding Tester.
          </h2>

          {/* Sub-header (font-manrope) */}
          <p className="font-manrope text-base sm:text-xl text-brand-muted font-bold max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-12">
            I need people to play this, break it, and tell me what&apos;s fun.
            The first batch of testers get their names featured in the app
            credits as Founding Testers.
          </p>

          {/* The 3 Steps (Visual, numbered, very clear) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 text-left mb-10 sm:mb-12">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border shadow-card-light flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-brand-primary text-slate-900 font-lilita text-2xl flex items-center justify-center font-black shadow-sm mb-4">
                  1
                </div>
                <h3 className="font-lilita text-xl sm:text-2xl text-brand-text uppercase tracking-tight mb-2">
                  Join the tester list
                </h3>
                <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold leading-relaxed">
                  Join our Google Group or DM me on Instagram. It takes 10
                  seconds to get on the invite roster.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 mt-2 border-t border-brand-border/60">
                <a
                  href={GOOGLE_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-black text-party-orange hover:underline inline-flex items-center gap-1"
                >
                  Google Group ↗
                </a>
                <span className="text-brand-muted text-xs">·</span>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-black text-party-pink hover:underline inline-flex items-center gap-1"
                >
                  Instagram ↗
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border shadow-card-light flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-party-cyan text-slate-900 font-lilita text-2xl flex items-center justify-center font-black shadow-sm mb-4">
                  2
                </div>
                <h3 className="font-lilita text-xl sm:text-2xl text-brand-text uppercase tracking-tight mb-2">
                  Get the Play Store link
                </h3>
                <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold leading-relaxed">
                  I&apos;ll send it to you directly so you can download and
                  install Bujho right to your Android device.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-brand-border/60">
                <a
                  href={PLAY_STORE_WEB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-black text-party-cyan hover:underline inline-flex items-center gap-1"
                >
                  Direct Play Store Test Link ↗
                </a>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border shadow-card-light flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-party-pink text-white font-lilita text-2xl flex items-center justify-center font-black shadow-sm mb-4">
                  3
                </div>
                <h3 className="font-lilita text-xl sm:text-2xl text-brand-text uppercase tracking-tight mb-2">
                  Play &amp; tell me what breaks
                </h3>
                <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold leading-relaxed">
                  Post your feedback, bugs, or chaos stories on the group or
                  chat. Get immortalized in the app credits!
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-brand-border/60">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-party-pink/15 border border-party-pink/30 text-party-pink text-xs font-black">
                  🏆 Featured in Credits
                </span>
              </div>
            </div>
          </div>

          {/* Primary Button (btn-theme-primary) */}
          <div className="flex flex-col items-center">
            <a
              href={GOOGLE_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-theme-primary inline-flex items-center justify-center font-lilita text-lg sm:text-2xl uppercase tracking-wider py-4 sm:py-5 px-8 sm:px-12 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all text-center select-none cursor-pointer"
            >
              Join the Founders List ▶
            </a>

            {/* Tiny micro-copy below the button */}
            <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold mt-4 select-none">
              No spam. Just early access and me asking you what needs fixing.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default FoundingTestersSection;
