"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  Flame,
  Volume2,
  CheckCircle,
  ArrowUpRight,
  RotateCcw,
  Smile,
  PartyPopper,
  Play,
  Check,
} from "lucide-react";

interface ActionCard {
  deck: string;
  word: string;
  clueText: string;
  action: "down" | "up";
  statusText: string;
  bgColor: string;
}

const actionDemos: ActionCard[] = [
  {
    deck: "Bollywood Buff",
    word: "GABBAR SINGH",
    clueText: "🗣️ 'Kitne aadmi the?!' Shout the dialogue!",
    action: "down",
    statusText: "+1 CORRECT! 🎉",
    bgColor: "from-party-pink/30 via-party-orange/20 to-[#FFD600]/10",
  },
  {
    deck: "Cricket Fever",
    word: "HELICOPTER SHOT",
    clueText: "🏏 Act like MS Dhoni hitting a 6th gear yorker!",
    action: "down",
    statusText: "+1 CORRECT! 💥",
    bgColor: "from-party-cyan/30 via-party-orange/20 to-party-pink/10",
  },
  {
    deck: "Sweet & Spicy",
    word: "PANI PURI",
    clueText: "😋 Pretend to eat spicy teekha paani without tearing up!",
    action: "up",
    statusText: "PASS ⏩",
    bgColor: "from-party-orange/30 via-[#FFD600]/20 to-party-pink/10",
  },
];

export function VibeCheckSection() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [tiltState, setTiltState] = useState<"neutral" | "down" | "up">(
    "neutral",
  );
  const [score, setScore] = useState<number>(14);

  const currentDemo = actionDemos[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      // Auto cycle actions for a dynamic GIF-like video vibe
      triggerTilt(
        actionDemos[(currentIndex + 1) % actionDemos.length].action === "down"
          ? "down"
          : "up",
      );
    }, 4000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const triggerTilt = (direction: "down" | "up") => {
    setTiltState(direction);
    if (direction === "down") {
      setScore((s) => s + 1);
    }
    setTimeout(() => {
      setTiltState("neutral");
      setCurrentIndex((prev) => (prev + 1) % actionDemos.length);
    }, 1200);
  };

  return (
    <section
      id="vibe-check"
      className="py-16 md:py-24 relative overflow-hidden bg-brand-surface/60 transition-colors duration-300"
    >
      {/* Background Party Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-party-pink/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-party-cyan/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-party-pink/15 to-party-orange/15 text-party-orange text-xs font-black uppercase tracking-wider mb-4 border border-party-orange/30 shadow-md">
            <Zap className="w-4 h-4 text-party-orange fill-party-orange" />
            <span>VIBE CHECK • PURE CHAOS IN ACTION</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-lilita font-black text-brand-text tracking-tight uppercase mb-4">
            See How The Party Goes Wild!
          </h2>
          <p className="text-base sm:text-xl text-brand-muted font-bold leading-relaxed">
            No manuals to read. Place the phone on your forehead, let your crew
            enact wild clues, and tilt down to score. Pure, uninterrupted party
            energy!
          </p>
        </motion.div>

        {/* Interactive Simulated Game Visual Card (GIF/Video replacement) */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl p-6 sm:p-10 border-2 border-party-orange/30 bg-brand-surface/90 shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* Top Squad Hype Bar */}
            <div className="flex items-center justify-between pb-6 border-b border-brand-border mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-party-pink/20 flex items-center justify-center text-party-pink">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-party-pink">
                    DECK: {currentDemo.deck}
                  </div>
                  <div className="text-sm font-extrabold text-brand-text">
                    ROUND 1 • TEAM DESI LEGENDS
                  </div>
                </div>
              </div>

              {/* Dynamic Score Display */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FFD600]/15 border border-[#FFD600]/40">
                <TrophyIcon className="w-5 h-5 text-[#FFD600]" />
                <span className="text-lg font-lilita tracking-wider text-brand-text">
                  SCORE: {score}
                </span>
              </div>
            </div>

            {/* Main Interactive Stage */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left Side: Animated Phone Display */}
              <div className="md:col-span-7 flex flex-col items-center justify-center">
                <motion.div
                  animate={{
                    rotateX:
                      tiltState === "down" ? 25 : tiltState === "up" ? -25 : 0,
                    scale: tiltState !== "neutral" ? 1.05 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`w-full max-w-sm h-64 sm:h-72 rounded-3xl bg-linear-to-br ${currentDemo.bgColor} border-4 ${
                    tiltState === "down"
                      ? "border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.6)]"
                      : tiltState === "up"
                        ? "border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.6)]"
                        : "border-brand-border shadow-2xl"
                  } p-6 flex flex-col justify-between items-center text-center relative overflow-hidden`}
                >
                  {/* Forehead Banner */}
                  <div className="px-3 py-1 rounded-full bg-brand-bg/80 text-[10px] font-black uppercase tracking-widest text-brand-text border border-brand-border">
                    FOREHEAD SCREEN DISPLAY
                  </div>

                  {/* Secret Clue Word */}
                  <div className="my-auto">
                    <span className="text-3xl sm:text-5xl font-lilita font-black text-brand-text uppercase tracking-wide block">
                      {currentDemo.word}
                    </span>
                  </div>

                  {/* Motion Result Overlay Banner */}
                  <AnimatePresence>
                    {tiltState !== "neutral" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`absolute inset-0 flex items-center justify-center font-lilita text-3xl sm:text-4xl uppercase tracking-wider text-white backdrop-blur-sm ${
                          tiltState === "down"
                            ? "bg-emerald-600/95"
                            : "bg-rose-600/95"
                        }`}
                      >
                        {currentDemo.statusText}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tilt Indicator Arrows */}
                  <div className="flex items-center justify-between w-full text-xs font-lilita tracking-wider text-brand-muted">
                    <span className="text-rose-400">⬆️ Pass</span>
                    <span className="text-emerald-400">⬇️ Score +1</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Side: Squad Shouting Clue Animation & Manual Controls */}
              <div className="md:col-span-5 flex flex-col justify-between space-y-4">
                <div className="p-5 rounded-2xl bg-brand-bg border border-brand-border space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-party-cyan">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span>SQUAD SHOUTING IN REAL TIME:</span>
                  </div>
                  <p className="text-base font-extrabold text-brand-text leading-snug">
                    "{currentDemo.clueText}"
                  </p>
                </div>

                {/* Try Interactive Motion Buttons */}
                <div className="space-y-2.5">
                  <div className="text-xs font-black uppercase tracking-wider text-brand-muted text-center">
                    TEST TILT MOTION CONTROLS:
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => triggerTilt("down")}
                      className="px-4 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-lilita text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>Tilt Down (+1)</span>
                    </button>
                    <button
                      onClick={() => triggerTilt("up")}
                      className="px-4 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-lilita text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Tilt Up (Pass)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrophyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
