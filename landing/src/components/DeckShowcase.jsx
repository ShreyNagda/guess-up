import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  Tag,
  Volume2,
  VolumeX,
  Lock,
} from "lucide-react";
import { normalizeCategory } from "../utils/categoryModel";
import { ArcadeDeckCard } from "./ArcadeDeckCard";

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (_) {}
};

export const DeckShowcase = ({
  decks = [],
  searchQuery,
  onSearchChange,
  onSelectDeckForGame,
  onCreateCustomDeckClick,
}) => {
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const normalizedDecks = decks.map((d) =>
    normalizeCategory(d.id || d.deckId, d),
  );

  const handleSelectDeck = (rawDeck) => {
    const deck = normalizeCategory(rawDeck.id || rawDeck.deckId, rawDeck);
    if (selectedDeck?.id === deck.id) {
      setSelectedDeck(null);
    } else {
      setSelectedDeck(deck);
      setCardIndex(0);
      if (onSelectDeckForGame) onSelectDeckForGame(deck);
    }
  };

  const selectedWords = selectedDeck ? selectedDeck.words : [];
  const PREVIEW_LIMIT = 5;
  const sampleWords = selectedWords.slice(0, PREVIEW_LIMIT);
  const hiddenCount = Math.max(0, selectedWords.length - sampleWords.length);

  const triggerFeedback = () => {
    if (soundEnabled) playBeep();
    if (navigator.vibrate) navigator.vibrate(25);
  };

  const handleNextCard = () => {
    if (sampleWords.length === 0) return;
    triggerFeedback();
    setCardIndex((prev) => (prev + 1) % sampleWords.length);
  };

  const handlePrevCard = () => {
    if (sampleWords.length === 0) return;
    triggerFeedback();
    setCardIndex(
      (prev) => (prev - 1 + sampleWords.length) % sampleWords.length,
    );
  };

  return (
    <section
      className="py-16 md:py-24 border-t border-border/40 relative"
      id="decks"
    >
      <div className="max-w-4xl mx-auto px-6 flex flex-col gap-8">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-black text-xs uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> EXPLORE THE VAULT
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight">
            A Deck For Every Mood <br className="hidden sm:inline" />
            <span className="text-primary">& Group Vibe</span>
          </h2>
          <p className="text-muted text-xs sm:text-sm max-w-xl leading-relaxed">
            From Bollywood blockbusters and cricket fever to street food
            cravings and college memes — choose a deck or build your custom
            category.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full h-13 rounded-2xl border border-border/60 bg-surface-card/80 backdrop-blur-md p-3.5 flex items-center gap-3 shadow-md">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            type="text"
            placeholder="🔍 Search 500+ party cards (e.g. SRK, Samosa, Super Over, Wankhede)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs sm:text-sm font-semibold bg-transparent outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="text-muted hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Expanded Deck Preview Modal Board */}
        <AnimatePresence>
          {selectedDeck && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-[#0E0C1C] border-2 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col gap-6 relative"
              style={{
                borderColor: selectedDeck.color || "var(--color-primary)",
              }}
            >
              <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-3xl shrink-0 border-2"
                    style={{
                      backgroundColor: `${selectedDeck.color}25`,
                      borderColor: selectedDeck.color,
                    }}
                  >
                    {selectedDeck.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-white">
                        {selectedDeck.name}
                      </h3>
                      <span className="text-[0.65rem] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                        {selectedWords.length} Cards
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {selectedDeck.description ||
                        "Previewing word deck cards below."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDeck(null)}
                  className="p-2 rounded-xl bg-surface-card text-muted hover:text-white transition-all cursor-pointer font-bold text-xs flex items-center gap-1 shrink-0"
                >
                  <X className="w-4 h-4" /> Close
                </button>
              </div>

              {/* Cards Simulator View */}
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="bg-surface-card border border-border p-6 rounded-2xl flex flex-col items-center justify-between text-center min-h-55 relative overflow-hidden">
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-[0.65rem] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Flashcard Simulator
                    </span>
                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="p-1 text-muted hover:text-primary transition-colors cursor-pointer"
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-primary" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {sampleWords.length > 0 ? (
                    <motion.div
                      key={cardIndex}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="py-4 px-2 w-full"
                    >
                      <h4 className="text-2xl font-black uppercase text-primary tracking-tight">
                        {sampleWords[cardIndex]}
                      </h4>
                      <span className="text-[0.65rem] text-muted font-bold mt-2 block">
                        Sample Card {cardIndex + 1} of {sampleWords.length}
                      </span>
                    </motion.div>
                  ) : (
                    <p className="text-xs text-muted py-8">
                      No cards in this deck yet.
                    </p>
                  )}

                  {sampleWords.length > 1 && (
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={handlePrevCard}
                        className="p-2 rounded-xl bg-surface border border-border text-xs font-black hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" /> Prev
                      </button>
                      <button
                        onClick={handleNextCard}
                        className="px-4 py-2 rounded-xl bg-primary text-accent font-black text-xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1 shadow-md"
                      >
                        Next Card <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black uppercase text-muted tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-primary" /> Sample Card
                    Preview:
                  </span>
                  <div className="p-3 rounded-2xl bg-surface-card border border-border flex flex-wrap gap-2 max-h-45 overflow-y-auto">
                    {sampleWords.map((word, idx) => (
                      <span
                        key={idx}
                        onClick={() => {
                          setCardIndex(idx);
                          triggerFeedback();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          cardIndex === idx
                            ? "bg-primary text-accent shadow-sm scale-105"
                            : "bg-surface border border-border text-text hover:border-primary"
                        }`}
                      >
                        {word}
                      </span>
                    ))}

                    {hiddenCount > 0 && (
                      <div className="w-full mt-1 p-2.5 rounded-xl bg-surface border border-primary/30 flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2 text-primary font-black">
                          <Lock className="w-3.5 h-3.5 shrink-0" />
                          <span>+{hiddenCount} More Secret Cards</span>
                        </div>
                        <span className="text-[0.65rem] font-black uppercase tracking-wider text-muted">
                          Play in App
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2-Column Arcade Deck Cards Matrix */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full">
          {normalizedDecks.map((deck, idx) => {
            const isSelected = selectedDeck?.id === deck.id;
            return (
              <ArcadeDeckCard
                key={deck.id || idx}
                deck={deck}
                isSelected={isSelected}
                onClick={() => handleSelectDeck(deck)}
              />
            );
          })}

          <ArcadeDeckCard isCreateDeck onClick={onCreateCustomDeckClick} />
        </div>
      </div>
    </section>
  );
};
