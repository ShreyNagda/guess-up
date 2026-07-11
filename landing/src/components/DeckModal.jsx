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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
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
            className="relative bg-surface-light dark:bg-surface-dark border-3 border-primary dark:border-accent rounded-3xl p-6 sm:p-10 max-w-lg w-full z-10 shadow-2xl overflow-hidden"
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
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/15 border-2 border-primary flex items-center justify-center text-primary font-black text-lg select-none">
                {deck.icon}
              </div>
              <h3 className="text-2xl font-black text-text-light dark:text-text-dark">
                {deck.title}
              </h3>
            </div>

            <p className="text-primary font-black text-xs uppercase tracking-wider mb-3">
              Sample Cards:
            </p>

            <div className="flex flex-wrap gap-2 max-h-55 sm:max-h-62.5 overflow-y-auto pr-2">
              {words.map((word, idx) => (
                <span
                  key={idx}
                  className="bg-black/5 dark:bg-white/5 border border-border-light dark:border-border-dark px-4 py-2 rounded-xl text-sm font-semibold text-text-light dark:text-text-dark"
                >
                  {word}
                </span>
              ))}
              {words.length === 0 && (
                <p className="text-muted-light dark:text-muted-dark text-sm">
                  No sample cards available for this deck.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
