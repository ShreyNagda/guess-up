"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Film,
  Trophy,
  Utensils,
  Compass,
  Train,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  getDecksFromFirestore,
  Deck as FirestoreDeck,
} from "../../lib/firestore";

interface Deck {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  cards: string[];
}

const defaultDecks: Deck[] = [
  {
    id: "bollywood",
    name: "Bollywood Buff",
    category: "Movies & Stars",
    description: "Iconic Indian movies, famous dialogues, and superstars.",
    icon: <Film className="w-5 h-5" />,
    cards: ["Sholay", "DDLJ", "Pathaan", "3 Idiots", "Gabbar Singh", "K3G"],
  },
  {
    id: "cricket",
    name: "Cricket Fever",
    category: "Sports & Legends",
    description: "Legendary players, IPL moments, and iconic shots.",
    icon: <Trophy className="w-5 h-5" />,
    cards: [
      "MS Dhoni",
      "Helicopter Shot",
      "IPL Final",
      "Virat Kohli",
      "Wankhede",
    ],
  },
  {
    id: "food",
    name: "Sweet & Spicy",
    category: "Street Food",
    description: "Street snacks, Indian delicacies, and 2 AM cravings.",
    icon: <Utensils className="w-5 h-5" />,
    cards: [
      "Vada Pav",
      "Pani Puri",
      "Hyderabadi Biryani",
      "Gulab Jamun",
      "Samosa",
    ],
  },
  {
    id: "mumbai",
    name: "Aamchi Mumbai",
    category: "City Nostalgia",
    description: "Local train vibes, Marine Drive sunsets, and cutting chai.",
    icon: <Train className="w-5 h-5" />,
    cards: [
      "Local Train",
      "Marine Drive",
      "Cutting Chai",
      "Gateway of India",
      "Dabbawala",
    ],
  },
  {
    id: "india",
    name: "Incredible India",
    category: "Culture & Vibes",
    description: "Famous monuments, cultural festivals, and desi quirks.",
    icon: <Compass className="w-5 h-5" />,
    cards: [
      "Taj Mahal",
      "Garba Night",
      "Auto Rickshaw",
      "Diwali Sweets",
      "Holi Colors",
    ],
  },
  {
    id: "memes",
    name: "Gen-Z & Memes",
    category: "Internet Trends",
    description: "Viral Indian memes, trending reels, and internet humor.",
    icon: <Sparkles className="w-5 h-5" />,
    cards: [
      "Viral Reel",
      "Binge Watch",
      "FOMO",
      "POV",
      "Sigma Grind",
      "Desi Aunties",
    ],
  },
];

export function DeckShowcaseSection() {
  const [decks, setDecks] = useState<Deck[]>(defaultDecks);
  const [selectedDeck, setSelectedDeck] = useState<Deck>(defaultDecks[0]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchFirebaseDecks() {
      try {
        const firestoreDecks: FirestoreDeck[] = await getDecksFromFirestore();
        if (firestoreDecks && firestoreDecks.length > 0) {
          const mapped: Deck[] = firestoreDecks.map((d, index) => {
            const fallbackIcon = defaultDecks[index % defaultDecks.length]
              ?.icon || <Layers className="w-5 h-5" />;
            return {
              id: d.id || `deck-${index}`,
              name: d.name || d.title || "Untitled Deck",
              category: "Deck",
              description:
                d.description || "Exciting party charades deck ready to play.",
              icon: fallbackIcon,
              cards:
                d.cards && d.cards.length > 0
                  ? d.cards
                  : ["Sample Card 1", "Sample Card 2"],
            };
          });
          setDecks(mapped);
          setSelectedDeck(mapped[0]);
        }
      } catch (err) {
        console.warn(
          "Could not fetch decks from Firebase, using defaults:",
          err,
        );
      } finally {
        setLoading(false);
      }
    }

    fetchFirebaseDecks();
  }, []);

  return (
    <section
      id="decks"
      className="py-16 md:py-24 bg-brand-surface transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header with subtle fade-in */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 text-brand-text text-xs font-bold uppercase tracking-wider mb-3 border border-brand-border">
            <span>50+ Playable Category Decks</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight mb-4">
            Curated Desi Pop-Culture Decks
          </h2>
          <p className="text-base text-brand-muted font-medium">
            From Bollywood blockbusters to 2 AM street food cravings, explore
            decks hand-crafted for max laughter.
          </p>
        </motion.div>

        {/* Grid of Deck Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {decks.slice(0, 3).map((deck, idx) => {
            const isSelected = selectedDeck.id === deck.id;
            return (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => setSelectedDeck(deck)}
                whileHover={{ y: -3 }}
                className={`cursor-pointer relative overflow-hidden p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? "bg-brand-surface border-brand-border shadow-lg"
                    : "bg-brand-bg/60 border-brand-border hover:border-brand-border"
                }`}
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-text flex items-center justify-center">
                      {deck.icon}
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-bg text-brand-muted border border-brand-border">
                      {deck.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-brand-text mb-1">
                    {deck.name}
                  </h3>
                  <p className="text-xs text-brand-muted leading-relaxed mb-4 font-medium">
                    {deck.description}
                  </p>
                </div>

                {/* Sample Card Chips */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-brand-border">
                  {deck.cards.slice(0, 4).map((card, cardIdx) => (
                    <span
                      key={cardIdx}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-brand-primary/10 text-brand-text"
                    >
                      {card}
                    </span>
                  ))}
                  {deck.cards.length > 4 && (
                    <span className="text-xs font-bold px-2 py-1 text-brand-muted">
                      +{deck.cards.length - 4} more
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footnote callout */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-center gap-2 text-sm sm:text-base font-extrabold text-brand-muted tracking-wide"
        >
          <Sparkles className="w-4 h-4 text-brand-primary animate-pulse" />
          <span className="text-brand-text">and many more in the app</span>
        </motion.div>
      </div>
    </section>
  );
}
