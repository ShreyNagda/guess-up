import React from "react";
import { motion } from "motion/react";
import { InteractiveHeroDemo } from "./InteractiveHeroDemo";
import { Sparkles, UserCheck, Play, ShieldCheck } from "lucide-react";

export const Hero = () => {
  const scrollToDemo = () => {
    const demoEl = document.getElementById("interactive-hero-demo");
    if (demoEl) {
      demoEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden" id="hero">
      {/* Dynamic Ambient Spotlight Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 sm:w-200 h-125 bg-linear-to-b from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl pointer-events-none transition-colors duration-500" />

      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center gap-10 relative z-10">
        
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest backdrop-blur-md shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-primary" /> 🔥 THE #1 AD-FREE PARTY CHARADES GAME FOR INDIA
        </motion.div>

        {/* Hero Headline & Subheadline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center gap-5 max-w-3xl"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight uppercase text-text">
            Flip Your Phone. <br className="hidden sm:inline" />
            <span className="text-primary drop-shadow-[0_4px_25px_rgba(255,214,0,0.4)]">
              Hilarious Chaos Unlocked.
            </span>
          </h1>

          <p className="text-base sm:text-xl font-bold text-text max-w-2xl leading-relaxed">
            Put your phone on your forehead, let your crew enact wild clues, and nod down to score! Handcrafted for Indian youth, house parties, and hostel hangouts.
          </p>

          <p className="text-muted text-xs sm:text-sm max-w-xl leading-relaxed">
            Curated Desi pop-culture decks, 60 FPS motion sensing, 2-team battle mode, and 100% uninterrupted game flow.
          </p>

          {/* DUAL CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mt-2">
            {/* High Commitment CTA */}
            <a
              href="#testers"
              className="w-full sm:w-auto bg-primary text-accent font-black px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-bevel-gold shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 flex items-center justify-center gap-2.5 text-xs uppercase tracking-wider cursor-pointer"
            >
              <UserCheck className="w-4 h-4" /> Register For Free Beta Access 🚀
            </a>

            {/* Low Commitment CTA */}
            <button
              onClick={scrollToDemo}
              className="w-full sm:w-auto border border-border bg-surface-card/80 backdrop-blur-md text-text font-black px-8 py-4 rounded-2xl hover:border-primary transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2.5 text-xs uppercase tracking-wider cursor-pointer"
            >
              <Play className="w-4 h-4 fill-primary text-primary" /> Try Live Interactive Demo 🎮
            </button>
          </div>

          {/* Microcopy Friction Reducer */}
          <div className="flex items-center justify-center gap-2 text-[0.7rem] text-muted font-bold mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>100% Free • No Credit Card Required • Available on Android (Google Play & APK)</span>
          </div>
        </motion.div>

        {/* EMBEDDED PLAYABLE DEMO */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full"
        >
          <InteractiveHeroDemo />
        </motion.div>
      </div>
    </section>
  );
};
