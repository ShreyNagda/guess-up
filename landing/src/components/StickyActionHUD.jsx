import React, { useState } from "react";
import { motion } from "motion/react";
import { Clock, Trophy, Play, Users, Settings2, Sparkles } from "lucide-react";

export const StickyActionHUD = ({
  activeDeck,
  onPlayClick,
  selectedTime = 60,
  onTimeChange,
  selectedRounds = 5,
  onRoundsChange,
}) => {
  const [isTeamMode, setIsTeamMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const timeOptions = [30, 45, 60, 90, 120, 180];
  const roundOptions = [3, 5, 7, 10];

  return (
    <div className="w-full max-w-4xl mx-auto bg-surface-dark border-2.5 border-border-dark p-3.5 sm:p-5 rounded-[28px] shadow-2xl relative z-30">
      {/* Upper HUD Settings Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 pb-3.5 border-b border-border-dark">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {/* Time Selector Pill */}
          <div className="relative">
            <select
              value={selectedTime}
              onChange={(e) =>
                onTimeChange && onTimeChange(Number(e.target.value))
              }
              className="appearance-none text-xs font-black px-3.5 py-2 pr-8 rounded-xl bg-surface-card-dark border border-border-dark text-primary outline-none cursor-pointer hover:border-primary transition-all"
            >
              {timeOptions.map((t) => (
                <option
                  key={t}
                  value={t}
                  className="bg-surface-dark text-white"
                >
                  ⏱️ {t} sec
                </option>
              ))}
            </select>
            <Clock className="w-3.5 h-3.5 text-primary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Rounds Selector Pill */}
          <div className="relative">
            <select
              value={selectedRounds}
              onChange={(e) =>
                onRoundsChange && onRoundsChange(Number(e.target.value))
              }
              className="appearance-none text-xs font-black px-3.5 py-2 pr-8 rounded-xl bg-surface-card-dark border border-border-dark text-primary outline-none cursor-pointer hover:border-primary transition-all"
            >
              {roundOptions.map((r) => (
                <option
                  key={r}
                  value={r}
                  className="bg-surface-dark text-white"
                >
                  🏆 {r} rounds
                </option>
              ))}
            </select>
            <Trophy className="w-3.5 h-3.5 text-primary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Team Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setIsTeamMode(!isTeamMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              isTeamMode
                ? "bg-team-a text-accent shadow-sm"
                : "bg-surface-card-dark border border-border-dark text-muted-dark hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {isTeamMode ? "Team Battle ON" : "Solo Mode"}
          </button>
        </div>

        {/* Selected Deck Summary Info */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-muted-dark">
          <span>Active Deck:</span>
          <span className="text-primary font-black flex items-center gap-1">
            {activeDeck ? activeDeck.icon || "🎮" : "🎬"}{" "}
            {activeDeck ? activeDeck.name || activeDeck.title : "Bollywood"}
          </span>
        </div>
      </div>

      {/* Hero Play Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={onPlayClick}
        className="w-full py-4 rounded-2xl bg-primary text-accent font-black text-lg sm:text-xl uppercase tracking-widest flex items-center justify-center gap-3 shadow-bevel-gold hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
        <Play className="w-6 h-6 fill-accent stroke-accent" />
        <span>START CHARADES DEMO</span>
        <Sparkles className="w-5 h-5 text-accent" />
      </motion.button>
    </div>
  );
};
