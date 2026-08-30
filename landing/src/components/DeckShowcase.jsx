import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  X,
  Layers,
  ChevronRight,
  ChevronLeft,
  Search,
  Tag,
  Eye,
} from "lucide-react";

export const DeckShowcase = ({
  decks = [],
  categoryFilters = [],
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);

  const handleSelectDeck = (deck) => {
    if (selectedDeck?.deckId === deck.deckId || selectedDeck?.id === deck.id) {
      setSelectedDeck(null); // Toggle collapse
    } else {
      setSelectedDeck(deck);
      setCardIndex(0);
    }
  };

  const getWords = (deck) => {
    if (!deck) return [];
    if (typeof deck.words === "string") {
      return deck.words
        .split(/[\n,]+/)
        .map((w) => w.trim())
        .filter(Boolean);
    }
    if (Array.isArray(deck.words)) {
      return deck.words.map((w) => w.toString().trim()).filter(Boolean);
    }
    return [];
  };

  const selectedWords = selectedDeck ? getWords(selectedDeck) : [];

  const handleNextCard = () => {
    if (selectedWords.length === 0) return;
    setCardIndex((prev) => (prev + 1) % selectedWords.length);
  };

  const handlePrevCard = () => {
    if (selectedWords.length === 0) return;
    setCardIndex(
      (prev) => (prev - 1 + selectedWords.length) % selectedWords.length,
    );
  };

  return (
    <section
      className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20"
      id="decks"
    >
      <div className="flex flex-col gap-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
          <span className="text-xs uppercase tracking-widest font-black text-primary">
            Content Catalog
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
            Explore Word Decks
          </h2>
          <p className="text-muted-light dark:text-muted-dark text-base md:text-lg">
            Click any deck to expand word cards and preview the in-game
            flashcard player!
          </p>
        </div>

        {/* Decks Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto w-full bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark p-3 px-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1 scrollbar-none">
            {categoryFilters.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onFilterChange(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === cat.id
                    ? "bg-primary text-accent shadow-sm scale-105"
                    : "bg-surface-card-light dark:bg-surface-card-dark text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="w-full md:w-64 shrink-0 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-dark" />
            <input
              type="text"
              placeholder="Search decks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full text-xs font-semibold pl-9 pr-3 py-2 rounded-xl border border-border-light dark:border-border-dark bg-surface-card-light dark:bg-surface-card-dark outline-none focus:border-primary transition-all placeholder:text-muted-light dark:placeholder:text-muted-dark"
            />
          </div>
        </div>

        {/* INLINE EXPANDED DECK PREVIEW BOARD */}
        <AnimatePresence>
          {selectedDeck && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto w-full bg-surface-light dark:bg-surface-dark border-3 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden flex flex-col gap-6 relative"
              style={{
                borderColor:
                  selectedDeck.colorHex ||
                  selectedDeck.color ||
                  "var(--color-primary)",
              }}
            >
              {/* Top Banner Bar */}
              <div className="flex items-start justify-between gap-4 border-b border-border-light dark:border-border-dark pb-6">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl shrink-0 border-2 shadow-inner"
                    style={{
                      backgroundColor: selectedDeck.colorHex
                        ? `${selectedDeck.colorHex}25`
                        : "rgba(255,214,0,0.15)",
                      borderColor:
                        selectedDeck.colorHex || "var(--color-primary)",
                    }}
                  >
                    {selectedDeck.icon || "🎮"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black">
                        {selectedDeck.title || selectedDeck.name}
                      </h3>
                      <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                        {selectedWords.length} Cards
                      </span>
                    </div>
                    <p className="text-xs text-muted-light dark:text-muted-dark mt-1">
                      {selectedDeck.subtitle ||
                        selectedDeck.description ||
                        "Previewing word deck cards below."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDeck(null)}
                  className="p-2 rounded-xl bg-surface-card-light dark:bg-surface-card-dark text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-all cursor-pointer font-bold text-xs flex items-center gap-1 shrink-0"
                >
                  <X className="w-4 h-4" /> Close Preview
                </button>
              </div>

              {/* Flashcard Simulator & Cards View (2 Columns on Desktop) */}
              <div className="grid md:grid-cols-2 gap-6 items-center">
                {/* Column 1: Interactive Flashcard Simulator */}
                <div className="bg-surface-card-light dark:bg-surface-card-dark border-2 border-border-light dark:border-border-dark p-6 rounded-2xl flex flex-col items-center justify-between text-center min-h-55 shadow-inner relative overflow-hidden">
                  <span className="text-[0.65rem] font-black uppercase tracking-widest text-primary flex items-center gap-1 mb-2">
                    <Sparkles className="w-3.5 h-3.5" /> In-Game Flashcard
                    Simulator
                  </span>

                  {selectedWords.length > 0 ? (
                    <motion.div
                      key={cardIndex}
                      initial={{ scale: 0.8, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      className="py-6 px-4 w-full"
                    >
                      <h4 className="text-2xl sm:text-3xl font-black uppercase text-primary tracking-tight">
                        {selectedWords[cardIndex]}
                      </h4>
                      <span className="text-[0.7rem] text-muted-dark font-bold mt-2 block">
                        Card {cardIndex + 1} of {selectedWords.length}
                      </span>
                    </motion.div>
                  ) : (
                    <p className="text-xs text-muted-dark py-8">
                      No cards in this deck yet.
                    </p>
                  )}

                  {/* Simulator Controls */}
                  {selectedWords.length > 1 && (
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={handlePrevCard}
                        className="p-2.5 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-xs font-black hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" /> Prev
                      </button>
                      <button
                        onClick={handleNextCard}
                        className="px-5 py-2.5 rounded-xl bg-primary text-accent font-black text-xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1 shadow-md"
                      >
                        Next Card <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Column 2: Word Cards Pills Grid */}
                <div className="flex flex-col gap-2 max-h-60">
                  <span className="text-xs font-black uppercase text-muted-light dark:text-muted-dark tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-primary" /> All Deck Words
                    ({selectedWords.length}):
                  </span>
                  <div className="overflow-y-auto p-3 rounded-2xl bg-surface-card-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark flex flex-wrap gap-2 max-h-50">
                    {selectedWords.map((word, idx) => (
                      <span
                        key={idx}
                        onClick={() => setCardIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          cardIndex === idx
                            ? "bg-primary text-accent shadow-sm scale-105"
                            : "bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:border-primary"
                        }`}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deck Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          {decks.map((deck, idx) => {
            const isSelected =
              (selectedDeck?.deckId || selectedDeck?.id) ===
              (deck.deckId || deck.id);
            const wordCount = getWords(deck).length;

            return (
              <motion.div
                key={deck.deckId || deck.id || idx}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleSelectDeck(deck)}
                className={`bg-surface-light dark:bg-surface-dark border-3 rounded-2xl p-6 flex items-center justify-between gap-4 cursor-pointer shadow-sm hover:shadow-md transition-all ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border-light dark:border-border-dark"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl select-none shrink-0 shadow-inner border-2"
                    style={{
                      backgroundColor: deck.colorHex
                        ? `${deck.colorHex}20`
                        : "rgba(255,214,0,0.15)",
                      borderColor: deck.colorHex || "var(--color-primary)",
                    }}
                  >
                    {deck.icon || "🎮"}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h4 className="font-black text-lg">
                      {deck.title || deck.name}
                    </h4>
                    <p className="text-muted-light dark:text-muted-dark text-xs">
                      {deck.subtitle || `${wordCount} cards in deck`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[0.7rem] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-surface-card-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark text-primary flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
