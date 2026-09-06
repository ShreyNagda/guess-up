import React from "react";
import { motion } from "motion/react";
import { Plus, Flame, Check } from "lucide-react";

export const ArcadeDeckCard = ({
  deck,
  isSelected = false,
  onClick,
  isCreateDeck = false,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (onClick) onClick(e);
    }
  };

  if (isCreateDeck) {
    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Create Custom Deck"
        className="relative rounded-2xl sm:rounded-3xl p-3 sm:p-5 cursor-pointer bg-linear-to-b from-surface dark:to-[#191430] border-2 border-primary/60 shadow-bevel-light dark:shadow-bevel-dark shadow-card shadow-card-hover flex flex-col items-center justify-center min-h-35 sm:min-h-42.5 overflow-hidden group select-none focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {/* Top Gloss Highlight Strip */}
        <div className="absolute top-0 left-0 right-0 h-6 sm:h-9 bg-linear-to-b from-white/20 to-transparent pointer-events-none" />

        {/* Center Content */}
        <div className="flex flex-col items-center gap-2 sm:gap-2.5 text-center relative z-10">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
            <Plus className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={3} />
          </div>

          <div>
            <h4 className="font-black text-xs sm:text-sm uppercase tracking-wider text-text">
              CREATE DECK
            </h4>
            <span className="text-[0.65rem] sm:text-xs font-bold text-primary tracking-wide block mt-0.5">
              + Custom Deck
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  const primaryColor = deck.color || "#FFD600";
  const gradientEnd = deck.gradientEnd || "#FF9100";
  const deckTitle = deck.name || deck.title || "Party Deck";

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Select ${deckTitle} Deck`}
      className={`relative rounded-2xl sm:rounded-3xl p-3 sm:p-5 cursor-pointer shadow-bevel-dark shadow-card shadow-card-hover flex flex-col justify-between min-h-35 sm:min-h-42.5 overflow-hidden transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-primary ${
        isSelected
          ? "ring-3 sm:ring-4 ring-primary shadow-xl scale-[1.02]"
          : "hover:shadow-2xl"
      }`}
      style={{
        background: `linear-gradient(180deg, ${primaryColor} 0%, ${gradientEnd} 100%)`,
      }}
    >
      {/* Top Gloss Highlight Strip */}
      <div className="absolute top-0 left-0 right-0 h-6 sm:h-9 bg-linear-to-b from-white/35 to-transparent pointer-events-none" />

      {/* Selected Checkmark Badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-accent text-primary flex items-center justify-center shadow-md z-20">
          <Check className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={3} />
        </div>
      )}

      {/* Trending Badge */}
      {deck.isTrending && !isSelected && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 sm:px-2 py-0.5 rounded-full bg-accent/80 text-primary border border-primary/40 text-[0.55rem] sm:text-[0.65rem] font-black uppercase tracking-wider flex items-center gap-0.5 sm:gap-1 shadow-sm z-20">
          <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400 fill-orange-400" />{" "}
          Hot
        </div>
      )}

      {/* Top Section: Icon & Title */}
      <div className="flex flex-col items-center gap-1.5 sm:gap-3.5 relative z-10 pt-0.5 sm:pt-0">
        <div className="w-9 h-9 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-black/20 border-2 border-white/40 flex items-center justify-center text-lg sm:text-2xl shrink-0 shadow-inner backdrop-blur-xs">
          {deck.icon || "🎮"}
        </div>

        <div className="flex flex-col items-center gap-0.5 text-accent font-sans w-full text-center">
          <h4 className="font-black text-xs sm:text-lg md:text-xl tracking-tight leading-tight sm:leading-snug drop-shadow-xs line-clamp-1 w-full px-0.5">
            {deck.name || deck.title}
          </h4>
          <p className="text-[0.62rem] sm:text-xs text-center font-extrabold text-accent/85 line-clamp-2 leading-tight sm:leading-snug w-full px-0.5">
            {deck.description || deck.subtitle || "Fun party deck inside"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
