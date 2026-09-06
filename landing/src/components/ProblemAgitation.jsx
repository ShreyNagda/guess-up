import React from "react";
import { motion } from "motion/react";
import { XCircle, CheckCircle2, AlertTriangle, Sparkles, Flame } from "lucide-react";

export const ProblemAgitation = () => {
  return (
    <section className="py-16 md:py-24 border-t border-border/40 relative" id="problems">
      <div className="max-w-4xl mx-auto px-6 flex flex-col gap-12">
        
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-black text-xs uppercase tracking-widest">
            <AlertTriangle className="w-3.5 h-3.5" /> THE PARTY KILLERS YOU KNOW ALL TOO WELL
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            Why Most Charades Apps <br className="hidden sm:inline" />
            <span className="text-red-400">Ruin House Parties</span>
          </h2>
          <p className="text-muted text-xs sm:text-sm max-w-xl leading-relaxed">
            Ever had your game night killed by 30-second unskippable casino ads or clues nobody understands? Here is why Guess Up changes the game.
          </p>
        </div>

        {/* 2-Column Split Contrast Container */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* Column 1: The Old Way */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-red-950/20 border-2 border-red-500/30 backdrop-blur-md flex flex-col gap-6"
          >
            <div className="flex items-center gap-3 border-b border-red-500/20 pb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-black">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-red-400 uppercase tracking-tight">The Frustrating Old Way</h3>
                <span className="text-[0.65rem] text-red-300/70 uppercase font-bold">Standard Cheap Charades Apps</span>
              </div>
            </div>

            <div className="flex flex-col gap-5 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <span className="text-red-400 font-black text-base shrink-0">❌</span>
                <div>
                  <strong className="text-white block font-extrabold text-sm mb-0.5">Unskippable 30-Second Video Ads</strong>
                  You're in the middle of a high-energy round, and suddenly a 30-second casino ad pauses the game. Party vibe dies instantly.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-red-400 font-black text-base shrink-0">❌</span>
                <div>
                  <strong className="text-white block font-extrabold text-sm mb-0.5">Irrelevant Western Decks</strong>
                  Generic apps built for US audiences with clues no one at your Indian house party understands or cares about.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-red-400 font-black text-base shrink-0">❌</span>
                <div>
                  <strong className="text-white block font-extrabold text-sm mb-0.5">Clunky Screen Tapping</strong>
                  Tapping tiny touch targets on a phone held against your forehead leads to accidental passes and broken rounds.
                </div>
              </div>
            </div>
          </motion.div>

          {/* Column 2: The Guess Up Way */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-primary/10 border-2 border-primary/50 backdrop-blur-md flex flex-col gap-6 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3 border-b border-primary/20 pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-black">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-primary uppercase tracking-tight">The Guess Up Experience</h3>
                <span className="text-[0.65rem] text-primary/80 uppercase font-bold">Built Specifically For Indian Parties</span>
              </div>
            </div>

            <div className="flex flex-col gap-5 text-xs text-slate-200">
              <div className="flex items-start gap-3">
                <span className="text-primary font-black text-base shrink-0">✅</span>
                <div>
                  <strong className="text-white block font-extrabold text-sm mb-0.5">100% Uninterrupted Ad-Free Gameplay</strong>
                  Zero pop-ups. Zero video ads. Continuous party gameplay from start to finish without interruptions.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-primary font-black text-base shrink-0">✅</span>
                <div>
                  <strong className="text-white block font-extrabold text-sm mb-0.5">Handcrafted Indian Pop Culture</strong>
                  From Bollywood blockbusters and IPL cricket legends to tapri chai memes and 2 AM hostel cravings.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-primary font-black text-base shrink-0">✅</span>
                <div>
                  <strong className="text-white block font-extrabold text-sm mb-0.5">Instant Motion Tilt Detection</strong>
                  Nod down for Correct, tilt up to Pass. Natural 60 FPS motion sensing keeps your hands completely off the screen.
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
