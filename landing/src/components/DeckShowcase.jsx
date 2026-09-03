import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  Tag,
  Eye,
  Volume2,
  VolumeX,
} from "lucide-react";
import { normalizeCategory } from "../utils/categoryModel";
import { ArcadeDeckCard } from "./ArcadeDeckCard";

// Web Audio synth beep helper
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

  // Normalize decks list using Category model contract
  const normalizedDecks = decks.map((d) => normalizeCategory(d.id || d.deckId, d));

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

  const triggerFeedback = () => {
    if (soundEnabled) playBeep();
    if (navigator.vibrate) navigator.vibrate(25);
  };

  const handleNextCard = () => {
    if (selectedWords.length === 0) return;
    triggerFeedback();
    setCardIndex((prev) => (prev + 1) % selectedWords.length);
  };

  const handlePrevCard = () => {
    if (selectedWords.length === 0) return;
    triggerFeedback();
    setCardIndex(
      (prev) => (prev - 1 + selectedWords.length) % selectedWords.length
    );
  };

  return (
    <section
      className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16"
      id="decks"
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest font-black text-primary flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Arcade Deck Matrix
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            EXPLORE WORD DECKS
          </h2>
          <p className="text-muted-dark text-sm sm:text-base">
            Select any deck below to preview cards or launch the live game simulator!
          </p>
        </div>

        {/* APP SEARCH BAR (MATCHING _buildSearchBar IN home_screen.dart) */}
        <div className="relative w-full h-12 rounded-[20px] bg-surface-dark border-1.5 border-border-dark p-3.5 flex items-center gap-2.5 shadow-md">
          <Search className="w-5.5 h-5.5 text-primary shrink-0" />
          <input
            type="text"
            placeholder="Search decks by title or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-sm font-bold bg-transparent text-text-dark outline-none placeholder:text-muted-dark"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="text-muted-dark hover:text-text-dark cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* INLINE EXPANDED DECK PREVIEW BOARD */}
        <AnimatePresence>
          {selectedDeck && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-surface-dark border-3 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col gap-6 relative"
              style={{
                borderColor: selectedDeck.color,
              }}
            >
              {/* Top Banner Bar */}
              <div className="flex items-start justify-between gap-4 border-b border-border-dark pb-6">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl shrink-0 border-2 shadow-inner"
                    style={{
                      backgroundColor: `${selectedDeck.color}25`,
                      borderColor: selectedDeck.color,
                    }}
                  >
                    {selectedDeck.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black">{selectedDeck.name}</h3>
                      <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                        {selectedWords.length} Cards
                      </span>
                    </div>
                    <p className="text-xs text-muted-dark mt-1">
                      {selectedDeck.description || "Previewing word deck cards below."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDeck(null)}
                  className="p-2 rounded-xl bg-surface-card-dark text-muted-dark hover:text-white transition-all cursor-pointer font-bold text-xs flex items-center gap-1 shrink-0"
                >
                  <X className="w-4 h-4" /> Close Preview
                </button>
              </div>

              {/* Flashcard Simulator & Cards View */}
              <div className="grid md:grid-cols-2 gap-6 items-center">
                {/* Column 1: Interactive Flashcard Simulator */}
                <div className="bg-surface-card-dark border-2 border-border-dark p-6 rounded-2xl flex flex-col items-center justify-between text-center min-h-55 shadow-inner relative overflow-hidden">
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-[0.65rem] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Flashcard Simulator
                    </span>

                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="p-1 rounded-md text-muted-dark hover:text-primary transition-colors cursor-pointer"
                      title={soundEnabled ? "Mute sound preview" : "Enable sound preview"}
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-primary" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {selectedWords.length > 0 ? (
                    <motion.div
                      key={cardIndex}
                      initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
                      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
                        className="p-2.5 rounded-xl bg-surface-dark border border-border-dark text-xs font-black hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" /> Prev
                      </button>
                      <button
                        onClick={handleNextCard}
                        className="px-5 py-2.5 rounded-xl bg-primary text-accent font-black text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-md"
                      >
                        Next Card <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Column 2: Word Cards Pills Grid */}
                <div className="flex flex-col gap-2 max-h-60">
                  <span className="text-xs font-black uppercase text-muted-dark tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-primary" /> All Deck Words ({selectedWords.length}):
                  </span>
                  <div className="overflow-y-auto p-3 rounded-2xl bg-surface-card-dark border border-border-dark flex flex-wrap gap-2 max-h-50">
                    {selectedWords.map((word, idx) => (
                      <span
                        key={idx}
                        onClick={() => {
                          setCardIndex(idx);
                          triggerFeedback();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          cardIndex === idx
                            ? "bg-primary text-accent shadow-sm scale-105"
                            : "bg-surface-dark border border-border-dark text-text-dark hover:border-primary"
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

        {/* 2-COLUMN SUPERCELL ARCADE DECK CARDS MATRIX SHOWCASE */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-5 w-full">
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

          {/* Special "+ CREATE DECK" Card in Matrix Grid */}
          <ArcadeDeckCard
            isCreateDeck
            onClick={onCreateCustomDeckClick}
          />
        </div>
      </div>
    </section>
  );
};
