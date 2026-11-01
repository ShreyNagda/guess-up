"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, Award, ShieldCheck, ArrowDown, UserCheck } from "lucide-react";

interface SpecialThanksSectionProps {
  onJoinClick?: () => void;
}

interface FoundingTesterItem {
  name: string;
  role: string;
  badge: string;
  gradient: string;
  favoriteDeck: string;
}

// Exactly the 5 founding testers specified by the creator
const FOUNDING_TESTERS: FoundingTesterItem[] = [
  {
    name: "Atharva Patil",
    role: "Founding Tester #01",
    badge: "The Game breaker",
    gradient: "from-party-pink to-party-orange",
    favoriteDeck: "🏏 Cricket Fever",
  },
  {
    name: "Harsh Nagda",
    role: "Founding Tester #02",
    badge: "Lead Bug Breaker",
    gradient: "from-party-cyan to-brand-primary",
    favoriteDeck: "🎬 Bollywood Buff",
  },
  {
    name: "Siddharth Jain",
    role: "Founding Tester #03",
    badge: "Clue Master",
    gradient: "from-party-purple to-party-pink",
    favoriteDeck: "🤡 Meme Central",
  },
  {
    name: "Shreshth Vora",
    role: "Founding Tester #04",
    badge: "Precision Tilter",
    gradient: "from-brand-primary to-party-orange",
    favoriteDeck: "🎒 Campus Life",
  },
  {
    name: "Kunal Chaudari",
    role: "Founding Tester #05",
    badge: "Chaos Specialist",
    gradient: "from-emerald-400 to-party-cyan",
    favoriteDeck: "🌶️ Sweet & Spicy",
  },
];

export function SpecialThanksSection({ onJoinClick }: SpecialThanksSectionProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "core">("all");

  const handleScrollToSignup = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onJoinClick) {
      onJoinClick();
    } else {
      const el = document.getElementById("founding-testers");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <section
      id="special-thanks"
      aria-labelledby="special-thanks-title"
      className="py-20 md:py-28 bg-transparent transition-colors duration-300 relative scroll-mt-20 overflow-hidden"
    >
      {/* Ambient background glow accents */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-party-pink/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <header className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            {/* Overline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-party-pink/10 border border-party-pink/30 text-party-pink text-xs font-black uppercase tracking-wider mb-4 shadow-xs">
              <Heart className="w-3.5 h-3.5 fill-party-pink text-party-pink animate-pulse" />
              <span>Wall of Fame</span>
            </div>

            {/* Main Headline */}
            <h2
              id="special-thanks-title"
              className="font-lilita text-4xl sm:text-6xl md:text-7xl text-brand-text uppercase tracking-tight mb-4"
            >
              Special Thanks to
            </h2>

            {/* Sub-headline */}
            <p className="font-manrope text-base sm:text-xl text-brand-muted font-bold leading-relaxed mb-6">
              Bujho was built in hostel rooms and late-night party sessions.
              Huge love to our founding testers who yelled clues, broke early builds,
              and helped shape the game before anyone else saw it.
            </p>

            {/* Live Count & Verification Pill */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-2 rounded-2xl bg-brand-surface/90 border border-brand-border shadow-xs text-xs sm:text-sm font-manrope font-extrabold text-brand-text">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-black">{FOUNDING_TESTERS.length} Founding Testers</span>
              </span>
              <span className="text-brand-muted">•</span>
              <span className="flex items-center gap-1 text-party-orange">
                <Award className="w-3.5 h-3.5" />
                Featured in App Credits
              </span>
              <span className="text-brand-muted">•</span>
              <span className="flex items-center gap-1 text-party-cyan">
                <ShieldCheck className="w-3.5 h-3.5" />
                Offline Game Hall of Fame
              </span>
            </div>
          </motion.div>
        </header>

        {/* Solo Dev Warm Note Card */}
        <aside
          aria-label="Developer Acknowledgement"
          className="mb-12 p-6 sm:p-8 rounded-3xl bg-brand-card/90 backdrop-blur-md border border-brand-border/80 shadow-card-light relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-br from-party-orange via-brand-primary to-party-pink p-0.5 shrink-0 shadow-md">
              <div className="w-full h-full rounded-[14px] bg-neutral-900 flex items-center justify-center text-2xl font-lilita text-brand-primary">
                SN
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-lilita text-lg sm:text-xl text-brand-text uppercase">
                  A Note from Shrey
                </span>
                <span className="px-2 py-0.5 rounded-md bg-party-orange/15 text-party-orange text-[10px] font-black uppercase tracking-wider">
                  Solo Dev
                </span>
              </div>
              <blockquote className="font-manrope text-xs sm:text-sm text-brand-muted font-bold leading-relaxed italic">
                &ldquo;You cannot test a multiplayer party game alone in a room. These people answered
                my late-night texts, installed buggy debug builds on their phones, and yelled words across
                the table so I could fix tilt angles and deck timers. Every single one of them has a permanent spot in the Bujho credits.&rdquo;
              </blockquote>
            </div>
          </div>
        </aside>

        {/* Founding Testers Cards Grid - 5 Founding Testers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 mb-14">
          {FOUNDING_TESTERS.map((tester, index) => (
            <motion.article
              key={tester.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="p-5 rounded-2xl bg-brand-surface border border-brand-border shadow-xs hover:shadow-card-light hover:border-brand-primary/50 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Subtle top card glow on hover */}
              <div
                className={`absolute -top-12 -right-12 w-24 h-24 bg-linear-to-br ${tester.gradient} opacity-0 group-hover:opacity-20 rounded-full blur-xl transition-opacity pointer-events-none`}
              />

              <div>
                {/* Header with Avatar & Badge */}
                <div className="flex items-center justify-between mb-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl bg-linear-to-br ${tester.gradient} p-0.5 shadow-sm group-hover:rotate-3 transition-transform`}
                  >
                    <div className="w-full h-full rounded-[10px] bg-neutral-900 flex items-center justify-center font-lilita text-base text-white font-black tracking-wider">
                      {getInitials(tester.name)}
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-card border border-brand-border text-[10px] font-manrope font-black text-brand-muted uppercase tracking-wider group-hover:border-brand-primary/40 group-hover:text-brand-text transition-colors">
                    <UserCheck className="w-3 h-3 text-emerald-500" />
                    Verified
                  </span>
                </div>

                {/* Tester Name */}
                <h3
                  className="font-lilita text-xl text-brand-text uppercase tracking-tight mb-1 truncate"
                  title={tester.name}
                >
                  {tester.name}
                </h3>

                {/* Subtitle / Role Tag */}
                <p className="font-manrope text-xs font-bold text-brand-muted flex items-center gap-1.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-party-orange" />
                  {tester.role}
                </p>
              </div>

              {/* Bottom pill tag */}
              <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-[11px] font-manrope font-extrabold text-brand-muted">
                <span className="px-2 py-0.5 rounded-md bg-brand-card border border-brand-border/60 text-brand-text">
                  {tester.badge}
                </span>
                <span className="text-[10px] text-brand-muted truncate max-w-[100px]" title={tester.favoriteDeck}>
                  {tester.favoriteDeck}
                </span>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Interactive Invitation Callout below the wall */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl bg-linear-to-r from-party-orange/10 via-brand-primary/10 to-party-pink/10 border-2 border-brand-primary/30 p-6 sm:p-8 text-center flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs"
        >
          <div className="text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/20 text-brand-text text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              <span>Next Cohort Open</span>
            </div>
            <h3 className="font-lilita text-2xl sm:text-3xl text-brand-text uppercase tracking-tight">
              Want your name on this wall &amp; in the game?
            </h3>
            <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold mt-1">
              Join the founding tester roster right now. Download the latest test APK, test the decks with friends, and get permanent in-game credit.
            </p>
          </div>

          <a
            href="#founding-testers"
            role="button"
            onClick={handleScrollToSignup}
            className="btn-theme-primary shrink-0 inline-flex items-center gap-2 font-lilita text-base sm:text-lg uppercase tracking-wider py-3.5 px-6 sm:px-8 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer select-none"
          >
            <span>Claim Your Spot</span>
            <ArrowDown className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default SpecialThanksSection;
