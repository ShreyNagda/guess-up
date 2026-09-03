import React from "react";
import { motion } from "motion/react";
import { Plus, Tag, Flame, Check } from "lucide-react";

export const ArcadeDeckCard = ({
  deck,
  isSelected = false,
  onClick,
  isCreateDeck = false,
}) => {
  if (isCreateDeck) {
    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="relative rounded-3xl p-5 cursor-pointer bg-gradient-to-b from-[#261F47] to-[#191430] border-2.5 border-primary/60 shadow-bevel-dark flex flex-col items-center justify-center min-h-[170px] overflow-hidden group select-none"
      >
        {/* Top Gloss Highlight Strip */}
        <div className="absolute top-0 left-0 right-0 h-9 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

        {/* Center Content */}
        <div className="flex flex-col items-center gap-2.5 text-center relative z-10">
          <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
            <Plus className="w-7 h-7 stroke-[3]" />
          </div>

          <div>
            <h4 className="font-black text-sm uppercase tracking-wider text-text-dark">
              CREATE DECK
            </h4>
            <span className="text-xs font-bold text-primary tracking-wide block mt-0.5">
              + Custom Deck
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  const primaryColor = deck.color || "#FFD600";
  const gradientEnd = deck.gradientEnd || "#FF9100";
  const wordCount = deck.words ? deck.words.length : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative rounded-3xl p-5 cursor-pointer shadow-bevel-dark flex flex-col justify-between min-h-[170px] overflow-hidden transition-all duration-200 select-none ${
        isSelected
          ? "ring-4 ring-primary shadow-xl scale-[1.02]"
          : "hover:shadow-2xl"
      }`}
      style={{
        background: `linear-gradient(180deg, ${primaryColor} 0%, ${gradientEnd} 100%)`,
      }}
    >
      {/* Top Gloss Highlight Strip */}
      <div className="absolute top-0 left-0 right-0 h-9 bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />

      {/* Selected Checkmark Badge */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-accent text-primary flex items-center justify-center shadow-md z-20">
          <Check className="w-4.5 h-4.5 stroke-[3]" />
        </div>
      )}

      {/* Trending Badge */}
      {deck.isTrending && !isSelected && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-accent/80 text-primary border border-primary/40 text-[0.65rem] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm z-20">
          <Flame className="w-3 h-3 text-orange-400 fill-orange-400" /> Hot
        </div>
      )}

      {/* Top Section: Icon & Title */}
      <div className="flex items-start gap-3.5 relative z-10">
        <div className="w-13 h-13 rounded-2xl bg-black/20 border-2 border-white/40 flex items-center justify-center text-2xl shrink-0 shadow-inner backdrop-blur-xs">
          {deck.icon || "🎮"}
        </div>

        <div className="flex flex-col gap-0.5 text-accent font-sans">
          <h4 className="font-black text-lg sm:text-xl tracking-tight leading-snug drop-shadow-xs line-clamp-1">
            {deck.name || deck.title}
          </h4>
          <p className="text-xs font-extrabold text-accent/80 line-clamp-2 leading-snug">
            {deck.description || deck.subtitle || `${wordCount} cards inside`}
          </p>
        </div>
      </div>

      {/* Bottom Section: Word Count Pill */}
      <div className="flex items-center justify-between pt-3 border-t border-black/15 relative z-10">
        <span className="text-[0.7rem] font-black uppercase tracking-wider px-3 py-1 rounded-xl bg-black/20 text-accent border border-black/20 flex items-center gap-1">
          <Tag className="w-3 h-3" /> {wordCount} Cards
        </span>
        <span className="text-[0.7rem] font-black uppercase tracking-wider text-accent opacity-90 group-hover:translate-x-1 transition-transform">
          Play Preview →
        </span>
      </div>
    </motion.div>
  );
};
