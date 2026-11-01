"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, XCircle, Flame, Rocket, PlusCircle } from "lucide-react";

interface DeckItem {
  name: string;
  emoji: string;
  cards: string[];
  accentBorder: string;
  accentBg: string;
  tag: string;
}

export function ScreenshotsAndDecksSection() {
  const [activeGameplayTab, setActiveGameplayTab] = useState<
    "clue" | "forehead"
  >("clue");
  const [activeTiltTab, setActiveTiltTab] = useState<"correct" | "pass">(
    "correct",
  );

  // Show exactly 3 featured decks
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

  // The remaining 5 decks in the app
  const remainingDecks = [
    { name: "Incredible India", emoji: "🕌" },
    { name: "Desi Nostalgia", emoji: "📼" },
    { name: "Meme Central", emoji: "🤡" },
    { name: "Campus Life", emoji: "🎒" },
    { name: "Filmi Dialogues", emoji: "🗣️" },
  ];

  // Upcoming Decks on the way
  const upcomingDecks = [
    { name: "90s Bollywood Rewind", emoji: "📻", tag: "Coming Soon" },
    { name: "IPL Legends & Derbies", emoji: "🏆", tag: "Coming Soon" },
    { name: "Chai Pe Charcha & Adda", emoji: "☕", tag: "In The Oven" },
    { name: "Punjabi & Desi Beats", emoji: "🪩", tag: "Coming Soon" },
    { name: "2000s Desi TV & Cartoons", emoji: "📺", tag: "Community Pick" },
    { name: "Street Foodies Extreme", emoji: "🍢", tag: "In The Oven" },
  ];

  // ----------------------------------------------------
  // STEP RENDERERS (Semantic Article + Figure + Figcaption)
  // ----------------------------------------------------

  const renderStep1 = () => (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center w-full max-w-[290px] mx-auto"
      aria-labelledby="step1-heading"
    >
      <figure className="w-full flex flex-col items-center m-0">
        <div className="w-full max-w-[270px] rounded-[2.3rem] bg-neutral-950 p-2.5 shadow-phone-3d border-2 border-neutral-700/80 ring-1 ring-white/10 relative overflow-hidden group">
          {/* Phone Notch/Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800" />
          </div>

          {/* Real Screenshot */}
          <div className="relative w-full aspect-9/19.5 rounded-[1.8rem] overflow-hidden bg-neutral-900">
            <img
              src="/screenshots/deck-select.png"
              alt="Bujho Deck Selection Screen - Choose from 8 Desi Decks"
              className="w-full h-full object-cover select-none"
              loading="lazy"
            />
          </div>
        </div>

        {/* Caption */}
        <figcaption className="mt-5 text-center">
          <span className="font-lilita text-xs uppercase px-2.5 py-1 rounded-full bg-brand-primary/15 text-brand-primary border border-brand-primary/30">
            Step 1
          </span>
          <h3 id="step1-heading" className="font-lilita text-xl sm:text-2xl text-brand-text uppercase tracking-tight mt-2">
            Pick a Deck
          </h3>
          <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold mt-1">
            8 curated decks • Solo or Team
          </p>
        </figcaption>
      </figure>
    </motion.article>
  );

  const renderStep2 = () => (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex flex-col items-center w-full max-w-[340px] mx-auto"
      aria-labelledby="step2-heading"
    >
      <figure className="w-full flex flex-col items-center m-0">
        <div className="w-full max-w-[310px] rounded-[2rem] bg-neutral-950 p-2.5 shadow-phone-3d border-2 border-neutral-700/80 ring-1 ring-white/10 relative overflow-hidden group">
          {/* Landscape Side Notch */}
          <div className="absolute top-1/2 left-3 -translate-y-1/2 w-3.5 h-12 bg-black rounded-full z-20" />

          {/* Interactive toggle between forehead prompt & active clue */}
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-neutral-900">
            <img
              src={
                activeGameplayTab === "clue"
                  ? "/screenshots/gameplay-word.png"
                  : "/screenshots/forehead-prompt.png"
              }
              alt="Bujho Gameplay In-Game Clue and Forehead Screen"
              className="w-full h-full object-cover select-none transition-all duration-300"
              loading="lazy"
            />
          </div>
        </div>

        {/* View Switcher Chips (Semantic Nav + Buttons) */}
        <nav aria-label="Step 2 gameplay screen views" className="flex items-center gap-1.5 mt-3">
          <button
            type="button"
            onClick={() => setActiveGameplayTab("clue")}
            aria-pressed={activeGameplayTab === "clue"}
            className={`font-manrope text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              activeGameplayTab === "clue"
                ? "bg-brand-primary text-slate-900 shadow-sm"
                : "bg-brand-card text-brand-muted hover:text-brand-text border border-brand-border"
            }`}
          >
            Clue &amp; Timer
          </button>
          <button
            type="button"
            onClick={() => setActiveGameplayTab("forehead")}
            aria-pressed={activeGameplayTab === "forehead"}
            className={`font-manrope text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              activeGameplayTab === "forehead"
                ? "bg-brand-primary text-slate-900 shadow-sm"
                : "bg-brand-card text-brand-muted hover:text-brand-text border border-brand-border"
            }`}
          >
            Forehead Prompt
          </button>
        </nav>

        {/* Caption */}
        <figcaption className="mt-3 text-center">
          <span className="font-lilita text-xs uppercase px-2.5 py-1 rounded-full bg-party-cyan/15 text-party-cyan border border-party-cyan/30">
            Step 2
          </span>
          <h3 id="step2-heading" className="font-lilita text-xl sm:text-2xl text-brand-text uppercase tracking-tight mt-2">
            Forehead Up
          </h3>
          <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold mt-1">
            Friends act &amp; scream clues
          </p>
        </figcaption>
      </figure>
    </motion.article>
  );

  const renderStep3 = () => (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex flex-col items-center w-full max-w-[340px] mx-auto"
      aria-labelledby="step3-heading"
    >
      <figure className="w-full flex flex-col items-center m-0">
        <div
          className={`w-full max-w-[310px] rounded-[2rem] bg-neutral-950 p-2.5 shadow-phone-3d border-2 transition-colors duration-300 ring-1 relative overflow-hidden group ${
            activeTiltTab === "correct"
              ? "border-emerald-500/70 ring-emerald-500/20"
              : "border-red-500/70 ring-red-500/20"
          }`}
        >
          {/* Landscape Side Notch */}
          <div className="absolute top-1/2 left-3 -translate-y-1/2 w-3.5 h-12 bg-black rounded-full z-20" />

          {/* Real App Screenshot: Correct vs Pass */}
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-neutral-900">
            <img
              src={
                activeTiltTab === "correct"
                  ? "/screenshots/gameplay-correct.png"
                  : "/screenshots/gameplay-pass.png"
              }
              alt={
                activeTiltTab === "correct"
                  ? "Bujho Correct Flash Screen - Tilt Down"
                  : "Bujho Pass Flash Screen - Tilt Up"
              }
              className="w-full h-full object-cover select-none transition-all duration-300"
              loading="lazy"
            />
          </div>
        </div>

        {/* Correct / Pass Switcher Chips (Semantic Nav + Buttons) */}
        <nav aria-label="Step 3 tilt reaction test" className="flex items-center gap-1.5 mt-3">
          <button
            type="button"
            onClick={() => setActiveTiltTab("correct")}
            aria-pressed={activeTiltTab === "correct"}
            className={`font-manrope text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
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
            aria-pressed={activeTiltTab === "pass"}
            className={`font-manrope text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
              activeTiltTab === "pass"
                ? "bg-red-500 text-white shadow-sm"
                : "bg-brand-card text-brand-muted hover:text-brand-text border border-brand-border"
            }`}
          >
            <XCircle className="w-3 h-3" />
            Tilt Up (Pass)
          </button>
        </nav>

        {/* Caption */}
        <figcaption className="mt-3 text-center">
          <span
            className={`font-lilita text-xs uppercase px-2.5 py-1 rounded-full border ${
              activeTiltTab === "correct"
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/15 text-red-400 border-red-500/30"
            }`}
          >
            Step 3
          </span>
          <h3 id="step3-heading" className="font-lilita text-xl sm:text-2xl text-brand-text uppercase tracking-tight mt-2">
            Tilt to Score
          </h3>
          <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold mt-1">
            Tilt down: Correct • Tilt up: Pass
          </p>
        </figcaption>
      </figure>
    </motion.article>
  );

  const renderStep4 = () => (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="flex flex-col items-center w-full max-w-[290px] mx-auto"
      aria-labelledby="step4-heading"
    >
      <figure className="w-full flex flex-col items-center m-0">
        <div className="w-full max-w-[270px] rounded-[2.3rem] bg-neutral-950 p-2.5 shadow-phone-3d border-2 border-brand-primary/60 ring-1 ring-brand-primary/20 relative overflow-hidden group">
          {/* Phone Notch/Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800" />
          </div>

          {/* Real Screenshot */}
          <div className="relative w-full aspect-9/19.5 rounded-[1.8rem] overflow-hidden bg-neutral-900">
            <img
              src="/screenshots/result-scorecard.png"
              alt="Bujho Solo Scorecard Result Screen - Shareable Victory Card"
              className="w-full h-full object-cover select-none"
              loading="lazy"
            />
          </div>
        </div>

        {/* Caption */}
        <figcaption className="mt-5 text-center">
          <span className="font-lilita text-xs uppercase px-2.5 py-1 rounded-full bg-brand-primary/15 text-brand-primary border border-brand-primary/30">
            Step 4
          </span>
          <h3 id="step4-heading" className="font-lilita text-xl sm:text-2xl text-brand-text uppercase tracking-tight mt-2">
            Epic Scorecard
          </h3>
          <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold mt-1">
            Word breakdown &amp; shareable story card
          </p>
        </figcaption>
      </figure>
    </motion.article>
  );

  return (
    <section
      id="gameplay"
      aria-labelledby="gameplay-heading"
      className="py-20 md:py-28 bg-transparent transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        {/* Header */}
        <header className="mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary font-lilita text-xs tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Actual App Gameplay
          </div>
          <h2 id="gameplay-heading" className="font-lilita text-5xl sm:text-7xl md:text-8xl text-brand-text uppercase tracking-tight">
            See it. Play it.
          </h2>
          <p className="font-manrope text-base sm:text-lg text-brand-muted font-bold mt-2">
            Real in-game screens from the Flutter release build — no mockups.
          </p>
        </header>

        {/* ---------------------------------------------------------------------- */}
        {/* RESPONSIVE SCREENSHOTS LAYOUT:                                         */}
        {/* - Mobile / Narrow: All 4 screenshots appear ONE BELOW THE OTHER.       */}
        {/* - PC / Wide screens: 3 Columns. Landscapes are STACKED ONE ABOVE OTHER */}
        {/* ---------------------------------------------------------------------- */}

        {/* Mobile / Narrow Screens Layout (Sequential vertical stack) */}
        <div className="flex flex-col gap-12 lg:hidden items-center mb-20">
          {renderStep1()}
          {renderStep2()}
          {renderStep3()}
          {renderStep4()}
        </div>

        {/* PC / Wide Screens Layout (3 Columns: Left Portrait, Center 2 Landscapes Stacked, Right Portrait) */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto mb-24 md:mb-32">
          {/* Column 1: Step 1 (Portrait) */}
          <div className="flex justify-center h-full items-center">
            {renderStep1()}
          </div>

          {/* Column 2: Step 2 & Step 3 (Landscape Stacked One Above the Other) */}
          <div className="flex flex-col gap-8 justify-center items-center">
            {renderStep2()}
            {renderStep3()}
          </div>

          {/* Column 3: Step 4 (Portrait) */}
          <div className="flex justify-center h-full items-center">
            {renderStep4()}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* THE DECK GRID: 3 Decks + "+5 in the game"             */}
        {/* ---------------------------------------------------- */}
        <section id="decks" aria-labelledby="decks-heading" className="pt-8 border-t border-brand-border">
          <header className="mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary font-lilita text-xs tracking-wider uppercase mb-3">
              No Fake Data • 100% Real
            </div>
            <h3 id="decks-heading" className="font-lilita text-4xl sm:text-6xl text-brand-text uppercase tracking-tight">
              8 hand-crafted decks. Zero boring words.
            </h3>
            <p className="font-manrope text-sm sm:text-base text-brand-muted font-bold mt-2">
              Showing 3 featured decks below — plus 5 more already in the app. More interesting decks on the way!
            </p>
          </header>

          {/* Grid: 3 Featured Decks + 1 "+5 in the game" Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 text-left mb-12">
            {featuredDecks.map((deck, idx) => (
              <motion.article
                key={deck.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className={`p-6 rounded-3xl bg-brand-card/90 backdrop-blur-md border-2 bg-linear-to-b ${deck.accentBg} ${deck.accentBorder} shadow-card-light transition-all flex flex-col justify-between`}
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
              </motion.article>
            ))}

            {/* 4th Card: Dedicated "+5 IN THE GAME" Card */}
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.24 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl bg-brand-card/90 backdrop-blur-md border-2 border-brand-primary/50 bg-linear-to-b from-brand-primary/15 to-transparent shadow-card-light flex flex-col justify-between"
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
            </motion.article>
          </div>

          {/* ---------------------------------------------------- */}
          {/* UPCOMING DECKS BANNER: "More Interesting Decks on the Way" */}
          {/* ---------------------------------------------------- */}
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            aria-label="Upcoming Bujho Decks"
            className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-party-orange/15 via-brand-primary/10 to-party-pink/15 border-2 border-party-orange/30 shadow-card-light text-left relative overflow-hidden mb-10"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-party-orange/20 border border-party-orange/40 text-party-orange text-xs font-black uppercase tracking-wider mb-2.5">
                  <Rocket className="w-3.5 h-3.5 animate-bounce" />
                  <span>Roadmap Preview</span>
                </div>
                <h4 className="font-lilita text-3xl sm:text-4xl text-brand-text uppercase tracking-tight">
                  More interesting decks on the way! 🚀
                </h4>
                <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold mt-1.5 leading-relaxed">
                  We are constantly hand-curating fresh, chaotic desi decks based on community votes.
                  Here are some of the themed decks currently in development:
                </p>
              </div>

              {/* Teaser Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full lg:w-auto shrink-0">
                {upcomingDecks.map((deck) => (
                  <div
                    key={deck.name}
                    className="flex flex-col gap-0.5 px-3 py-2 rounded-xl bg-brand-surface/90 border border-brand-border shadow-xs"
                  >
                    <div className="flex items-center gap-1.5 font-lilita text-xs sm:text-sm text-brand-text truncate">
                      <span>{deck.emoji}</span>
                      <span className="truncate">{deck.name}</span>
                    </div>
                    <span className="text-[10px] font-manrope font-extrabold text-party-orange uppercase">
                      {deck.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* Footer banner */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-brand-surface/90 border border-brand-border text-brand-text shadow-sm">
              <span className="font-lilita text-lg text-brand-primary uppercase tracking-wide">
                100% Offline Game
              </span>
              <span className="text-brand-muted">•</span>
              <span className="font-manrope text-sm font-bold text-brand-muted">
                8 playable decks today • Zero ads • Zero logins • Endless chaos
              </span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

export default ScreenshotsAndDecksSection;
