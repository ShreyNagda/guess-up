"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, XCircle } from "lucide-react";

interface DeckItem {
  name: string;
  emoji: string;
  cards: string[];
  accentBorder: string;
  accentBg: string;
  tag: string;
}

export function ScreenshotsAndDecksSection() {
  const [activeGameplayTab, setActiveGameplayTab] = useState<"clue" | "forehead">("clue");
  const [activeTiltTab, setActiveTiltTab] = useState<"correct" | "pass">("correct");

  // Show exactly 3 featured decks as requested
  const featuredDecks: DeckItem[] = [
    {
      name: "Bollywood Buff",
      emoji: "🎬",
      cards: ["Sholay", "DDLJ", "Pathaan", "3 Idiots", "Lagaan"],
      accentBorder: "hover:border-party-pink/60 border-party-pink/30",
      accentBg: "from-party-pink/15 to-transparent",
      tag: "Fan Favorite",
    },
    {
      name: "Cricket Fever",
      emoji: "🏏",
      cards: ["MS Dhoni", "Virat Kohli", "Helicopter Shot", "Sachin"],
      accentBorder: "hover:border-party-orange/60 border-party-orange/30",
      accentBg: "from-party-orange/15 to-transparent",
      tag: "Match Day",
    },
    {
      name: "Sweet & Spicy",
      emoji: "🌶️",
      cards: ["Vada Pav", "Gol Gappa", "Biryani", "Jalebi", "Butter Chicken"],
      accentBorder: "hover:border-party-yellow/60 border-party-yellow/30",
      accentBg: "from-party-yellow/15 to-transparent",
      tag: "Street Food",
    },
  ];

  // The remaining 5 decks in the app (+5 in the game)
  const remainingDecks = [
    { name: "Incredible India", emoji: "🕌" },
    { name: "Desi Nostalgia", emoji: "📼" },
    { name: "Meme Central", emoji: "🤡" },
    { name: "Campus Life", emoji: "🎒" },
    { name: "Filmi Dialogues", emoji: "🗣️" },
  ];

  return (
    <section className="py-20 md:py-28 bg-transparent transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        {/* Header */}
        <div className="mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary font-lilita text-xs tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Actual App Gameplay
          </div>
          <h2 className="font-lilita text-5xl sm:text-7xl md:text-8xl text-brand-text uppercase tracking-tight">
            See it. Play it.
          </h2>
          <p className="font-manrope text-base sm:text-lg text-brand-muted font-bold mt-2">
            Real in-game screens from the Flutter release build — no mockups.
          </p>
        </div>

        {/* 4 In-Game Step Screenshots (Portrait -> Landscape -> Landscape -> Portrait) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start mb-24 md:mb-32">
          {/* Step 1: Portrait Deck Select */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className="w-full max-w-[270px] rounded-[2.3rem] bg-neutral-950 p-2.5 shadow-phone-3d border-2 border-neutral-700/80 ring-1 ring-white/10 relative overflow-hidden group">
              {/* Phone Notch/Island */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800" />
              </div>

              {/* Real Screenshot */}
              <div className="relative w-full aspect-[9/19.5] rounded-[1.8rem] overflow-hidden bg-neutral-900">
                <img
                  src="/screenshots/deck-select.png"
                  alt="Bujho Deck Selection Screen"
                  className="w-full h-full object-cover select-none"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Caption */}
            <div className="mt-5 text-center">
              <span className="font-lilita text-xs uppercase px-2.5 py-1 rounded-full bg-brand-primary/15 text-brand-primary border border-brand-primary/30">
                Step 1
              </span>
              <h3 className="font-lilita text-xl sm:text-2xl text-brand-text uppercase tracking-tight mt-2">
                Pick a Deck
              </h3>
              <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold mt-1">
                8 curated decks • Solo or Team
              </p>
            </div>
          </motion.div>

          {/* Step 2: Forehead Guess Screen (Landscape Phone) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="w-full max-w-[300px] rounded-[2rem] bg-neutral-950 p-2.5 shadow-phone-3d border-2 border-neutral-700/80 ring-1 ring-white/10 relative overflow-hidden group">
              {/* Landscape Side Notch */}
              <div className="absolute top-1/2 left-3 -translate-y-1/2 w-3.5 h-12 bg-black rounded-full z-20" />

              {/* Interactive toggle between forehead prompt & active clue */}
              <div className="relative w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-neutral-900">
                <img
                  src={
                    activeGameplayTab === "clue"
                      ? "/screenshots/gameplay-word.png"
                      : "/screenshots/forehead-prompt.png"
                  }
                  alt="Bujho In-game Screen"
                  className="w-full h-full object-cover select-none transition-all duration-300"
                  loading="lazy"
                />
              </div>
            </div>

            {/* View Switcher Chips */}
            <div className="flex items-center gap-1.5 mt-3">
              <button
                type="button"
                onClick={() => setActiveGameplayTab("clue")}
                className={`font-manrope text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                  activeGameplayTab === "clue"
                    ? "bg-brand-primary text-slate-900 shadow-sm"
                    : "bg-brand-card text-brand-muted hover:text-brand-text border border-brand-border"
                }`}
              >
                Clue & Timer
              </button>
              <button
                type="button"
                onClick={() => setActiveGameplayTab("forehead")}
                className={`font-manrope text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                  activeGameplayTab === "forehead"
                    ? "bg-brand-primary text-slate-900 shadow-sm"
                    : "bg-brand-card text-brand-muted hover:text-brand-text border border-brand-border"
                }`}
              >
                Forehead Prompt
              </button>
            </div>

            {/* Caption */}
            <div className="mt-3 text-center">
              <span className="font-lilita text-xs uppercase px-2.5 py-1 rounded-full bg-party-cyan/15 text-party-cyan border border-party-cyan/30">
                Step 2
              </span>
              <h3 className="font-lilita text-xl sm:text-2xl text-brand-text uppercase tracking-tight mt-2">
                Forehead Up
              </h3>
              <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold mt-1">
                Friends act & scream clues
              </p>
            </div>
          </motion.div>

          {/* Step 3: Tilt Reactions - Correct vs Pass (Landscape Phone) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div
              className={`w-full max-w-[300px] rounded-[2rem] bg-neutral-950 p-2.5 shadow-phone-3d border-2 transition-colors duration-300 ring-1 relative overflow-hidden group ${
                activeTiltTab === "correct"
                  ? "border-emerald-500/70 ring-emerald-500/20"
                  : "border-red-500/70 ring-red-500/20"
              }`}
            >
              {/* Landscape Side Notch */}
              <div className="absolute top-1/2 left-3 -translate-y-1/2 w-3.5 h-12 bg-black rounded-full z-20" />

              {/* Real App Screenshot: Correct vs Pass */}
              <div className="relative w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-neutral-900">
                <img
                  src={
                    activeTiltTab === "correct"
                      ? "/screenshots/gameplay-correct.png"
                      : "/screenshots/gameplay-pass.png"
                  }
                  alt={
                    activeTiltTab === "correct"
                      ? "Bujho Correct Flash Screen"
                      : "Bujho Pass Flash Screen"
                  }
                  className="w-full h-full object-cover select-none transition-all duration-300"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Correct / Pass Switcher Chips */}
            <div className="flex items-center gap-1.5 mt-3">
              <button
                type="button"
                onClick={() => setActiveTiltTab("correct")}
                className={`font-manrope text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                  activeTiltTab === "correct"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-brand-card text-brand-muted hover:text-brand-text border border-brand-border"
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                Tilt Down (+1)
              </button>
              <button
                type="button"
                onClick={() => setActiveTiltTab("pass")}
                className={`font-manrope text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                  activeTiltTab === "pass"
                    ? "bg-red-500 text-white shadow-sm"
                    : "bg-brand-card text-brand-muted hover:text-brand-text border border-brand-border"
                }`}
              >
                <XCircle className="w-3 h-3" />
                Tilt Up (Pass)
              </button>
            </div>

            {/* Caption */}
            <div className="mt-3 text-center">
              <span
                className={`font-lilita text-xs uppercase px-2.5 py-1 rounded-full border ${
                  activeTiltTab === "correct"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/15 text-red-400 border-red-500/30"
                }`}
              >
                Step 3
              </span>
              <h3 className="font-lilita text-xl sm:text-2xl text-brand-text uppercase tracking-tight mt-2">
                Tilt to Score
              </h3>
              <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold mt-1">
                Tilt down: Correct • Tilt up: Pass
              </p>
            </div>
          </motion.div>

          {/* Step 4: Portrait Result Scorecard */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="w-full max-w-[270px] rounded-[2.3rem] bg-neutral-950 p-2.5 shadow-phone-3d border-2 border-brand-primary/60 ring-1 ring-brand-primary/20 relative overflow-hidden group">
              {/* Phone Notch/Island */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800" />
              </div>

              {/* Real Screenshot */}
              <div className="relative w-full aspect-[9/19.5] rounded-[1.8rem] overflow-hidden bg-neutral-900">
                <img
                  src="/screenshots/result-scorecard.png"
                  alt="Bujho Solo Scorecard Result Screen"
                  className="w-full h-full object-cover select-none"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Caption */}
            <div className="mt-5 text-center">
              <span className="font-lilita text-xs uppercase px-2.5 py-1 rounded-full bg-brand-primary/15 text-brand-primary border border-brand-primary/30">
                Step 4
              </span>
              <h3 className="font-lilita text-xl sm:text-2xl text-brand-text uppercase tracking-tight mt-2">
                Epic Scorecard
              </h3>
              <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold mt-1">
                Word breakdown & shareable story card
              </p>
            </div>
          </motion.div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* THE DECK GRID: 3 Decks + "+5 in the game"             */}
        {/* ---------------------------------------------------- */}
        <div id="decks" className="pt-8 border-t border-brand-border">
          <div className="mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary font-lilita text-xs tracking-wider uppercase mb-3">
              No Fake Data • 100% Real
            </div>
            <h3 className="font-lilita text-4xl sm:text-6xl text-brand-text uppercase tracking-tight">
              8 hand-crafted decks. Zero boring words.
            </h3>
            <p className="font-manrope text-sm sm:text-base text-brand-muted font-bold mt-2">
              Showing 3 featured decks below — plus 5 more already in the app.
            </p>
          </div>

          {/* Grid: 3 Featured Decks + 1 "+5 in the game" Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 text-left">
            {featuredDecks.map((deck, idx) => (
              <motion.div
                key={deck.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className={`p-6 rounded-3xl bg-brand-card/90 backdrop-blur-md border-2 bg-gradient-to-b ${deck.accentBg} ${deck.accentBorder} shadow-card-light transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl sm:text-5xl">{deck.emoji}</span>
                    <span className="font-manrope text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-brand-surface text-brand-muted border border-brand-border">
                      {deck.tag}
                    </span>
                  </div>
                  <h4 className="font-lilita text-2xl text-brand-text uppercase tracking-tight mb-4">
                    {deck.name}
                  </h4>
                </div>

                {/* Word pills */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-brand-border/80">
                  {deck.cards.map((card) => (
                    <span
                      key={card}
                      className="font-manrope text-xs font-black px-2.5 py-1 rounded-xl bg-brand-surface/90 text-brand-text border border-brand-border"
                    >
                      {card}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* 4th Card: Dedicated "+5 IN THE GAME" Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.24 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl bg-brand-card/90 backdrop-blur-md border-2 border-brand-primary/50 bg-gradient-to-b from-brand-primary/15 to-transparent shadow-card-light flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl sm:text-5xl">👑</span>
                  <span className="font-manrope text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/40">
                    Full Roster
                  </span>
                </div>
                <h4 className="font-lilita text-2xl text-brand-primary uppercase tracking-tight mb-2">
                  +5 in the game
                </h4>
                <p className="font-manrope text-xs text-brand-muted font-bold mb-4">
                  Already playable offline right now:
                </p>
              </div>

              {/* The other 5 decks listed clearly */}
              <div className="space-y-1.5 pt-3 border-t border-brand-primary/30">
                {remainingDecks.map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-brand-surface/80 border border-brand-border text-xs font-manrope font-extrabold text-brand-text"
                  >
                    <span>{d.emoji}</span>
                    <span>{d.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer banner */}
          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-brand-surface/90 border border-brand-border text-brand-text shadow-sm">
              <span className="font-lilita text-lg text-brand-primary uppercase tracking-wide">
                +5 in the game
              </span>
              <span className="text-brand-muted">•</span>
              <span className="font-manrope text-sm font-bold text-brand-muted">
                8 total decks • 100% offline • Zero ads • Zero signups
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ScreenshotsAndDecksSection;
