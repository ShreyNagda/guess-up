import React from "react";
import { motion } from "motion/react";
import { Sparkles, Film, Cpu, Users } from "lucide-react";

export const ValuePropositions = () => {
  return (
    <section className="py-16 md:py-24 border-t border-border/40 relative" id="values">
      <div className="max-w-4xl mx-auto px-6 flex flex-col gap-12">
        
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-black text-xs uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> BUILT FOR INSTANT LAUGHS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            Everything You Need For <br className="hidden sm:inline" />
            <span className="text-primary">The Ultimate Game Night</span>
          </h2>
        </div>

        {/* 3 Numbered Prop Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Card 01 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl bg-surface-card/60 border border-border/60 backdrop-blur-md flex flex-col gap-4 relative overflow-hidden group hover:border-primary/50 transition-all shadow-md"
          >
            <span className="text-5xl font-black font-mono text-primary/30 group-hover:text-primary transition-colors">
              01
            </span>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Culturally Crafted Decks</h3>
            <p className="text-xs text-muted leading-relaxed">
              No more generic clues. Pick from handcrafted Indian decks like <strong>Bollywood Buff</strong>, <strong>Cricket Fever</strong>, <strong>Sweet & Spicy</strong>, <strong>Incredible India</strong>, and <strong>Aamchi Mumbai</strong>.
            </p>
          </motion.div>

          {/* Card 02 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl bg-surface-card/60 border border-border/60 backdrop-blur-md flex flex-col gap-4 relative overflow-hidden group hover:border-primary/50 transition-all shadow-md"
          >
            <span className="text-5xl font-black font-mono text-primary/30 group-hover:text-primary transition-colors">
              02
            </span>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Hardware Motion Sensing</h3>
            <p className="text-xs text-muted leading-relaxed">
              Our 60 FPS motion algorithm processes orientation vectors live on-device. Nod down for points, tilt up to pass — zero lag, zero tutorial friction.
            </p>
          </motion.div>

          {/* Card 03 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl bg-surface-card/60 border border-border/60 backdrop-blur-md flex flex-col gap-4 relative overflow-hidden group hover:border-primary/50 transition-all shadow-md"
          >
            <span className="text-5xl font-black font-mono text-primary/30 group-hover:text-primary transition-colors">
              03
            </span>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Solo & 2-Team Battle Modes</h3>
            <p className="text-xs text-muted leading-relaxed">
              Play quick 1-on-1 rounds or split your party into Team A vs Team B. Custom round timers (30s, 45s, 60s, 90s) fit any party intensity.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
