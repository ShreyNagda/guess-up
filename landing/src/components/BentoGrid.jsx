import React from "react";
import { motion } from "motion/react";
import { Swords, Users, Smartphone, Flame, Sparkles } from "lucide-react";

export const BentoGrid = () => {
  return (
    <section
      className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24"
      id="features"
    >
      <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
        <span className="text-xs uppercase tracking-widest font-black text-primary">
          Game Highlights
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
          Engineered for Fun
        </h2>
        <p className="text-muted text-base md:text-lg">
          Features built from the ground up for competitive house parties and
          casual hangouts.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Card 1: Team Battles (Span 2) */}
        <motion.div
          whileHover={{ y: -6 }}
          className="md:col-span-2 bg-linear-to-br from-surface to-surface-card border-2 border-border p-8 rounded-3xl flex flex-col justify-between gap-6 shadow-card shadow-card-hover relative overflow-hidden group hover:border-primary/50"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-team-a/20 border-2 border-team-a flex items-center justify-center text-team-a">
              <Swords className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest bg-team-b/20 text-team-b px-3 py-1 rounded-full border border-team-b/40">
              Team Showdown Mode
            </span>
          </div>

          <div className="flex flex-col gap-2 z-10">
            <h3 className="text-2xl font-black text-text">Team Battle Mode</h3>
            <p className="text-muted text-sm leading-relaxed max-w-lg">
              Simply divide your group into 2 equal teams! Play multi-round
              match games with automatic score tracking, round turn handoffs,
              and instant winner celebrations.
            </p>
          </div>

          {/* Team vs Team Badges visual */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 bg-team-a/15 border border-team-a/40 px-4 py-2 rounded-xl text-team-a font-black text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-team-a"></span>
              <span>Team Cyan</span>
            </div>
            <span className="font-black text-muted text-xs">VS</span>
            <div className="flex items-center gap-2 bg-team-b/15 border border-team-b/40 px-4 py-2 rounded-xl text-team-b font-black text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-team-b"></span>
              <span>Team Purple</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Solo vs Everyone */}
        <motion.div
          whileHover={{ y: -6 }}
          className="bg-surface border-2 border-border p-8 rounded-3xl flex flex-col justify-between gap-6 shadow-card shadow-card-hover hover:border-primary/50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary">
            <Users className="w-6 h-6" />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-black">Solo vs. Everyone</h3>
            <p className="text-muted text-sm leading-relaxed">
              Pass the phone around in a free-for-all classic charades round!
              Everyone shouts clues while one guesser tries to score maximum
              points before time runs out.
            </p>
          </div>

          <div className="text-xs font-extrabold text-primary flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> Quick 60s & 90s Timers
          </div>
        </motion.div>

        {/* Card 3: Motion Controls */}
        <motion.div
          whileHover={{ y: -6 }}
          className="bg-surface border-2 border-border p-8 rounded-3xl flex flex-col justify-between gap-6 shadow-card shadow-card-hover hover:border-primary/50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary">
            <Smartphone className="w-6 h-6" />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-black">Hardware Motion Sensing</h3>
            <p className="text-muted text-sm leading-relaxed">
              Tilt down towards the floor for Correct (+1) or tilt up towards
              the ceiling to Pass. Forehead placement auto-detects positioning
              before starting!
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-success"></span> Tilt
            Down = Point
            <span className="w-2.5 h-2.5 rounded-full bg-primary ml-2"></span>{" "}
            Tilt Up = Pass
          </div>
        </motion.div>

        {/* Card 4: Desi Decks (Span 2) */}
        <motion.div
          whileHover={{ y: -6 }}
          className="md:col-span-2 bg-surface border-2 border-border p-8 rounded-3xl flex flex-col justify-between gap-6 shadow-card shadow-card-hover hover:border-primary/50"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary">
              <Flame className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/30">
              Desi Youth Specific
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-black">Curated Pop-Culture Decks</h3>
            <p className="text-muted text-sm leading-relaxed">
              Hand-crafted categories including Bollywood Blockbusters, Cricket
              Mania, Desi Foodies & Cravings, and Desi Youth & Vibes — plus
              custom deck creation for your own inside jokes!
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-xl bg-primary/15 text-primary border border-primary/30 font-extrabold text-xs">
              Bollywood
            </span>
            <span className="px-3 py-1 rounded-xl bg-primary/15 text-primary border border-primary/30 font-extrabold text-xs">
              Cricket
            </span>
            <span className="px-3 py-1 rounded-xl bg-primary/15 text-primary border border-primary/30 font-extrabold text-xs">
              Desi Food
            </span>
            <span className="px-3 py-1 rounded-xl bg-primary/15 text-primary border border-primary/30 font-extrabold text-xs">
              Youth Vibes
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
