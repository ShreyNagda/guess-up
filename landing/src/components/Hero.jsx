import React from "react";
import { motion } from "motion/react";
import { PhoneMockup } from "./PhoneMockup";
import { UserCheck, Sparkles, MessageSquare } from "lucide-react";

export const Hero = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20 grid lg:grid-cols-[1.2fr_1fr] items-center gap-12 text-center lg:text-left">
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-6 items-center lg:items-start"
      >
        <span className="inline-flex items-center gap-2 bg-primary/15 border border-primary/40 text-primary dark:text-primary px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest self-center lg:self-start shadow-sm">
          <Sparkles className="w-4 h-4" /> Powered by Hardware Motion Sensors
        </span>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight uppercase">
          The Ultimate Party Charades Game —{" "}
          <span className="text-primary drop-shadow-[3px_3px_0px_var(--color-accent)] dark:drop-shadow-[3px_3px_0px_rgba(255,255,255,0.15)]">
            Powered by Motion.
          </span>
        </h1>

        <p className="text-lg md:text-xl font-extrabold text-muted-dark dark:text-text-dark">
          Hold your phone to your forehead and let your friends act, shout, and
          enact!
        </p>

        <p className="text-muted-light dark:text-muted-dark leading-relaxed max-w-xl text-base">
          Guess Up turns any gathering into a high-energy showdown! Designed
          specifically for Indian youth and families with curated Desi
          pop-culture decks, 2-team battle mode, and zero ad interruptions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
          <a
            href="#join-beta"
            className="btn bg-primary text-accent text-center justify-center font-black px-8 py-3.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2 text-sm cursor-pointer"
          >
            <UserCheck className="w-5 h-5" /> Join Beta Testers List
          </a>
          <a
            href="#feedback"
            className="border-2 border-primary/50 dark:border-border-dark bg-surface-card-dark text-text-dark text-center justify-center font-extrabold px-8 py-3.5 rounded-2xl hover:bg-white/10 transition-all shadow-sm flex items-center gap-2 text-sm cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" /> Submit Feedback
          </a>
        </div>
      </motion.div>

      {/* Hero Visual Mockup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full flex justify-center"
      >
        <PhoneMockup />
      </motion.div>
    </section>
  );
};
