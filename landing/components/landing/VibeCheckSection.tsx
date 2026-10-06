"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Flame,
  Zap,
  Volume2,
  Check,
  RotateCcw,
  Smartphone,
  Trophy,
  Sparkles,
  ArrowRightLeft,
  Users,
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
    clueText: "🗣️ 'Kitne aadmi the?!' Shout the iconic dialogue!",
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
  {
    deck: "Aamchi Mumbai",
    word: "LOCAL TRAIN",
    clueText: "🚆 Act like hanging from a crowded Virar fast local train!",
    action: "down",
    statusText: "+1 CORRECT! ⚡",
    bgColor: "from-party-pink/30 via-party-cyan/20 to-party-orange/10",
  },
];

export function VibeCheckSection() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [tiltState, setTiltState] = useState<"neutral" | "down" | "up">(
    "neutral",
  );
  const [activeTeam, setActiveTeam] = useState<"cyan" | "magenta">("cyan");
  const [cyanScore, setCyanScore] = useState<number>(18);
  const [magentaScore, setMagentaScore] = useState<number>(15);
  const [streakCount, setStreakCount] = useState<number>(2);

  const currentDemo = actionDemos[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      // Auto cycle showdown actions for a dynamic game demo
      const nextAction =
        actionDemos[(currentIndex + 1) % actionDemos.length].action;
      triggerTilt(nextAction === "down" ? "down" : "up");
    }, 4500);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const triggerTilt = (direction: "down" | "up") => {
    setTiltState(direction);
    if (direction === "down") {
      if (activeTeam === "cyan") {
        setCyanScore((s) => s + 1);
      } else {
        setMagentaScore((s) => s + 1);
      }
      setStreakCount((s) => s + 1);
    } else {
      setStreakCount(0);
    }

    setTimeout(() => {
      setTiltState("neutral");
      setCurrentIndex((prev) => (prev + 1) % actionDemos.length);
    }, 1200);
  };

  const switchActiveTurn = () => {
    setActiveTeam((prev) => (prev === "cyan" ? "magenta" : "cyan"));
    setStreakCount(0);
    setTiltState("neutral");
  };

  return (
    <section
      id="vibe-check"
      className="py-16 md:py-24 relative overflow-hidden bg-brand-surface/60 transition-colors duration-300"
    >
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-party-cyan/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-party-pink/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-party-cyan/15 via-party-orange/15 to-party-pink/15 text-party-orange text-xs font-black uppercase tracking-wider mb-4 border border-party-orange/30 shadow-md">
            <Swords className="w-4 h-4 text-party-orange fill-party-orange" />
            <span>2-TEAM SHOWDOWN • HEAD-TO-HEAD PARTY CHAOS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-lilita font-black text-brand-text tracking-tight uppercase mb-4">
            Party Mode Showdown
          </h2>
          <p className="text-base sm:text-xl text-brand-muted font-bold leading-relaxed">
            Split your squad into 2 teams. Track live scores automatically, pass
            the phone between rounds, and trigger Hot Streak multipliers for
            maximum brag rights!
          </p>
        </motion.div>

        {/* Interactive 2-Team Battle Arena */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl p-5 sm:p-8 md:p-10 border-2 border-party-orange/30 bg-brand-surface/90 shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* Live Standings Header Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-brand-border mb-6 sm:mb-8 gap-4">
              {/* Team Cyan Box */}
              <div
                className={`flex items-center gap-3 p-3 px-4 rounded-2xl border-2 transition-all duration-300 w-full sm:w-auto ${
                  activeTeam === "cyan"
                    ? "bg-party-cyan/15 border-party-cyan shadow-lg shadow-party-cyan/10 scale-[1.02]"
                    : "bg-brand-bg/60 border-brand-border opacity-75"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-party-cyan/20 text-party-cyan flex items-center justify-center font-black text-lg">
                  ⚡
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-party-cyan">
                    TEAM A •{" "}
                    {activeTeam === "cyan" ? "ACTIVE TURN 📱" : "WAITING"}
                  </div>
                  <div className="text-sm font-lilita font-black text-brand-text uppercase">
                    TEAM DESI LEGENDS
                  </div>
                </div>
                <div className="ml-auto sm:ml-4 px-3 py-1 rounded-xl bg-party-cyan text-black font-lilita text-base font-black">
                  {cyanScore} PTS
                </div>
              </div>

              {/* VS Center Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 rounded-full bg-brand-bg text-brand-text border border-brand-border font-lilita text-sm font-black uppercase">
                  VS • ROUND 2
                </span>
              </div>

              {/* Team Magenta Box */}
              <div
                className={`flex items-center gap-3 p-3 px-4 rounded-2xl border-2 transition-all duration-300 w-full sm:w-auto ${
                  activeTeam === "magenta"
                    ? "bg-party-pink/15 border-party-pink shadow-lg shadow-party-pink/10 scale-[1.02]"
                    : "bg-brand-bg/60 border-brand-border opacity-75"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-party-pink/20 text-party-pink flex items-center justify-center font-black text-lg">
                  🔥
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-party-pink">
                    TEAM B •{" "}
                    {activeTeam === "magenta" ? "ACTIVE TURN 📱" : "WAITING"}
                  </div>
                  <div className="text-sm font-lilita font-black text-brand-text uppercase">
                    BOLLY BOOMERS
                  </div>
                </div>
                <div className="ml-auto sm:ml-4 px-3 py-1 rounded-xl bg-party-pink text-white font-lilita text-base font-black">
                  {magentaScore} PTS
                </div>
              </div>
            </div>

            {/* Main Interactive Gameplay Stage */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
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
                        : activeTeam === "cyan"
                          ? "border-party-cyan/80 shadow-[0_0_30px_rgba(0,229,255,0.3)]"
                          : "border-party-pink/80 shadow-[0_0_30px_rgba(255,20,147,0.3)]"
                  } p-5 sm:p-6 flex flex-col justify-between items-center text-center relative overflow-hidden`}
                >
                  {/* Top Bar inside Forehead Display */}
                  <div className="flex items-center justify-between w-full">
                    <div className="px-2.5 py-0.5 rounded-full bg-brand-bg/80 text-[10px] font-black uppercase tracking-widest text-brand-text border border-brand-border">
                      {activeTeam === "cyan"
                        ? "⚡ DESI LEGENDS"
                        : "🔥 BOLLY BOOMERS"}
                    </div>
                    {streakCount >= 3 && (
                      <div className="px-2 py-0.5 rounded-full bg-[#FFD600] text-black text-[10px] font-lilita uppercase tracking-wider animate-bounce">
                        🔥 {streakCount} STREAK!
                      </div>
                    )}
                  </div>

                  {/* Secret Clue Word */}
                  <div className="my-auto">
                    <span className="text-3xl sm:text-5xl font-lilita font-black text-brand-text uppercase tracking-wide block drop-shadow-md">
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
                        className={`absolute inset-0 flex flex-col items-center justify-center font-lilita text-3xl sm:text-4xl uppercase tracking-wider text-white backdrop-blur-sm ${
                          tiltState === "down"
                            ? "bg-emerald-600/95"
                            : "bg-rose-600/95"
                        }`}
                      >
                        <span>{currentDemo.statusText}</span>
                        {tiltState === "down" && streakCount >= 3 && (
                          <span className="text-sm font-lilita text-[#FFD600] mt-1">
                            🔥 STREAK BONUS ACTIVE!
                          </span>
                        )}
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

              {/* Right Side: Real-time Clues & Interactive Turn Pass Button */}
              <div className="md:col-span-5 flex flex-col justify-between space-y-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-brand-bg border border-brand-border space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-party-cyan">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span>SQUAD SHOUTING CLUES:</span>
                  </div>
                  <p className="text-sm sm:text-base font-extrabold text-brand-text leading-snug">
                    "{currentDemo.clueText}"
                  </p>
                </div>

                {/* Try Motion Buttons */}
                <div className="space-y-2.5">
                  <div className="text-xs font-black uppercase tracking-wider text-brand-muted text-center">
                    TEST TILT MOTION CONTROLS:
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    <button
                      onClick={() => triggerTilt("down")}
                      className="px-3.5 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-lilita text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>Tilt Down (+1)</span>
                    </button>
                    <button
                      onClick={() => triggerTilt("up")}
                      className="px-3.5 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-lilita text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Tilt Up (Pass)</span>
                    </button>
                  </div>

                  {/* Pass Phone to Next Team Button */}
                  <button
                    onClick={switchActiveTurn}
                    className="w-full px-4 py-3 rounded-xl bg-party-orange/20 hover:bg-party-orange/30 text-party-orange border border-party-orange/40 font-lilita text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>
                      Pass Phone to{" "}
                      {activeTeam === "cyan"
                        ? "Team B (Bolly Boomers)"
                        : "Team A (Desi Legends)"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Mobile-Optimized Feature Badges Below */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 border-t border-brand-border">
              <div className="p-3 sm:p-4 rounded-2xl bg-brand-bg/80 border border-brand-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-party-cyan/20 text-party-cyan flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-lilita font-black text-brand-text uppercase">
                    Auto Scorekeeper
                  </h4>
                  <p className="text-[10px] text-brand-muted font-bold leading-tight">
                    Zero paper or pens needed.
                  </p>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-brand-bg/80 border border-brand-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFD600]/20 text-[#FFD600] flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-lilita font-black text-brand-text uppercase">
                    Hot Streak Multipliers
                  </h4>
                  <p className="text-[10px] text-brand-muted font-bold leading-tight">
                    Bonus seconds on 3+ combo streaks.
                  </p>
                </div>
              </div>

              <div className="col-span-2 md:col-span-1 p-3 sm:p-4 rounded-2xl bg-brand-bg/80 border border-brand-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-party-pink/20 text-party-pink flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-lilita font-black text-brand-text uppercase">
                    Pass Phone Screen
                  </h4>
                  <p className="text-[10px] text-brand-muted font-bold leading-tight">
                    Instant turn switching between teams.
                  </p>
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
