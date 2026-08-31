import React from "react";
import { motion, AnimatePresence } from "motion/react";

export const DeckModal = ({ isOpen, deck, onClose }) => {
  if (!deck) return null;

  const words =
    typeof deck.words === "string"
      ? deck.words.split(", ")
      : Array.isArray(deck.words)
        ? deck.words
        : [];

  const accentColor = deck.color || deck.colorHex || "#FFC107";
  const description = deck.description || deck.desc || "";
  const isAvailable = deck.isAvailable !== undefined ? deck.isAvailable : true;
  const isLocked = deck.isLocked || false;
  const lockReason = deck.lockReason || "";
  const badgeText = deck.theme?.badgeText || deck.badgeText || "";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 cursor-pointer"
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative bg-surface-light dark:bg-surface-dark border-3 rounded-3xl p-6 sm:p-8 max-w-lg w-full z-10 shadow-2xl overflow-hidden flex flex-col gap-4 max-h-[85vh]"
            style={{ borderColor: accentColor }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-5 text-3xl font-bold text-muted-light dark:text-muted-dark hover:text-primary transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              &times;
            </button>

            {/* Header */}
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl select-none shrink-0 shadow-sm border-2"
                style={{
                  backgroundColor: `${accentColor}25`,
                  borderColor: accentColor,
                  color: accentColor,
                }}
              >
                {deck.icon || "🎮"}
              </div>
              <div className="flex-1 pr-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-2xl font-black text-text-light dark:text-text-dark leading-tight">
                    {deck.title || deck.name || "Category Deck"}
                  </h3>
                  {badgeText && (
                    <span
                      className="text-[0.65rem] font-black uppercase px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: `${accentColor}30`,
                        color: accentColor,
                      }}
                    >
                      {badgeText}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap text-xs font-bold">
                  <span className="text-muted-light dark:text-muted-dark">
                    {words.length} Cards
                  </span>
                  <span>•</span>
                  <span
                    className={
                      isAvailable ? "text-emerald-500" : "text-amber-500"
                    }
                  >
                    {isAvailable ? "● Active in App" : "○ Inactive / Hidden"}
                  </span>
                  {isLocked && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400">
                        🔒 Locked ({lockReason || "Premium"})
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Category Description */}
            {description && (
              <div
                className="p-3.5 rounded-2xl border text-xs font-medium leading-relaxed"
                style={{
                  backgroundColor: `${accentColor}10`,
                  borderColor: `${accentColor}40`,
                }}
              >
                <p className="font-extrabold uppercase text-[0.65rem] mb-1 opacity-80">
                  Deck Overview & Rules:
                </p>
                <p>{description}</p>
              </div>
            )}

            {/* Cards Header & Word List */}
            <div className="flex-1 flex flex-col min-h-0">
              <p className="text-primary font-black text-xs uppercase tracking-wider mb-2 shrink-0">
                Sample Cards ({words.length}):
              </p>

              <div className="flex-1 overflow-y-auto pr-1 flex flex-wrap gap-2 auto-rows-max">
                {words.map((word, idx) => (
                  <span
                    key={idx}
                    className="bg-black/5 dark:bg-white/5 border border-border-light dark:border-border-dark px-3 py-1.5 rounded-xl text-xs font-semibold text-text-light dark:text-text-dark"
                  >
                    {word}
                  </span>
                ))}
                {words.length === 0 && (
                  <p className="text-muted-light dark:text-muted-dark text-xs py-4">
                    No cards in this deck yet.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
