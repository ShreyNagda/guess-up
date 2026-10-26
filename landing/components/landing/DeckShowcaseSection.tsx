"use client";

import React from "react";
import { motion } from "framer-motion";

interface DeckCard {
  name: string;
  emoji: string;
  cards: string[];
  gradient: string;
}

export function DeckShowcaseSection() {
  const deckCards: DeckCard[] = [
    {
      name: "Bollywood Buff",
      emoji: "🎬",
      cards: ["Sholay", "DDLJ", "Pathaan", "3 Idiots"],
      gradient: "from-party-pink/20 to-party-orange/20 border-party-pink/30",
    },
    {
      name: "Incredible India",
      emoji: "🕌",
      cards: ["Taj Mahal", "Garba Night", "Auto Rickshaw"],
      gradient:
        "from-party-orange/20 to-party-yellow/20 border-party-orange/30",
    },
    {
      name: "Cricket Fever",
      emoji: "🏏",
      cards: ["MS Dhoni", "Virat Kohli", "Helicopter Shot"],
      gradient: "from-[#FFD600]/20 to-party-cyan/20 border-[#FFD600]/30",
    },
  ];

  return (
    <section
      id="decks"
      className="py-16 md:py-24 bg-transparent transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Header (font-lilita) */}
        <div className="mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary font-lilita text-xs tracking-wider uppercase mb-3">
            8 Hand-Crafted Decks
          </div>
          <h2 className="font-lilita text-4xl sm:text-6xl text-brand-text uppercase tracking-tight">
            Zero boring words.
          </h2>
        </div>

        {/* Grid of 3 decks only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {deckCards.map((deck, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              whileHover={{ y: -4 }}
              className={`p-6 rounded-3xl bg-brand-card/90 backdrop-blur-md border-2 ${deck.gradient} shadow-card-light flex flex-col justify-between text-left`}
            >
              <div>
                <div className="text-4xl mb-3">{deck.emoji}</div>
                <h3 className="font-lilita text-2xl text-brand-text uppercase tracking-tight mb-4">
                  {deck.name}
                </h3>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-brand-border">
                {deck.cards.map((c, cIdx) => (
                  <span
                    key={cIdx}
                    className="font-manrope text-xs font-black px-2.5 py-1 rounded-xl bg-brand-surface/80 text-brand-text border border-brand-border"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Text +5 in the game */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-brand-card/90 border border-brand-border shadow-xs">
            <span className="font-lilita text-lg text-brand-primary uppercase tracking-wide">
              +5 in the game
            </span>
            <span className="text-brand-muted">•</span>
            <span className="font-manrope text-sm font-bold text-brand-muted">
              Meme Central, Sweet & Spicy, Desi Nostalgia & more included free
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
