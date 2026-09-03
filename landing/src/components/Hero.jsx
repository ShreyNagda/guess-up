import React, { useState } from "react";
import { motion } from "motion/react";
import { InteractiveHeroDemo } from "./InteractiveHeroDemo";
import { StickyActionHUD } from "./StickyActionHUD";
import { UserCheck, Sparkles, Flame } from "lucide-react";

export const Hero = ({ activeDeck, onPlayDemoClick }) => {
  const [hudTime, setHudTime] = useState(60);
  const [hudRounds, setHudRounds] = useState(5);

  return (
    <section className="max-w-5xl mx-auto px-4 md:px-8 pt-6 pb-10 md:pt-12 md:pb-16 flex flex-col items-center text-center gap-10">
      {/* Centered Hero Header Fold */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-5 max-w-3xl"
      >
        <span className="inline-flex items-center gap-2 bg-primary/15 border border-primary/40 text-primary px-4.5 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-sm">
          <Sparkles className="w-4 h-4" /> Party Charades Powered by Motion
        </span>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight uppercase">
          The Ultimate Party Charades Game —{" "}
          <span className="text-primary drop-shadow-[3px_3px_0px_var(--color-accent)] dark:drop-shadow-[3px_3px_0px_rgba(255,255,255,0.15)]">
            Powered by Motion.
          </span>
        </h1>

        <p className="text-lg md:text-xl font-extrabold text-text-dark max-w-2xl">
          Hold your phone to your forehead and let your friends act, shout, and enact clues!
        </p>

        <p className="text-muted-dark leading-relaxed max-w-xl text-sm sm:text-base">
          Guess Up turns any gathering into an electric party battle! Built with curated Desi pop-culture decks, 2-team battle mode, tilt detection, and zero ad interruptions.
        </p>

        <div className="flex flex-wrap justify-center gap-3.5 w-full sm:w-auto mt-1">
          <a
            href="#join-beta"
            className="btn bg-primary text-accent text-center font-black px-7 py-3.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-bevel-gold flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
          >
            <UserCheck className="w-4 h-4" /> Join Beta Testers
          </a>
          <a
            href="#decks"
            className="border-2 border-border-dark bg-surface-dark text-text-dark text-center font-extrabold px-7 py-3.5 rounded-2xl hover:bg-white/10 transition-all shadow-sm flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
          >
            <Flame className="w-4 h-4 text-primary" /> Browse Decks Matrix
          </a>
        </div>
      </motion.div>

      {/* Centered Landscape Interactive Demo Simulator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="w-full flex justify-center"
      >
        <InteractiveHeroDemo />
      </motion.div>

      {/* Centered Sticky Action HUD (Time & Rounds Dropdowns + Hero Play Button) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full"
      >
        <StickyActionHUD
          activeDeck={activeDeck}
          selectedTime={hudTime}
          onTimeChange={setHudTime}
          selectedRounds={hudRounds}
          onRoundsChange={setHudRounds}
          onPlayClick={onPlayDemoClick}
        />
      </motion.div>
    </section>
  );
};
