import React from "react";
import { Sparkles, ShieldCheck, Flame, Star, Zap } from "lucide-react";

export const TrustBar = () => {
  return (
    <section className="py-8 border-y border-border/40 bg-surface/50 backdrop-blur-md relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-center">
          
          {/* Item 1 */}
          <div className="flex flex-col items-center gap-1 p-2">
            <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight">500+</span>
            <span className="text-[0.7rem] font-black uppercase text-muted tracking-wider">
              Desi Pop-Culture Cards
            </span>
          </div>

          {/* Item 2 */}
          <div className="flex flex-col items-center gap-1 p-2 border-l md:border-l border-border/40">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-1">
              60 FPS <Zap className="w-5 h-5 text-primary fill-primary" />
            </span>
            <span className="text-[0.7rem] font-black uppercase text-muted tracking-wider">
              Zero-Lag Motion Sensing
            </span>
          </div>

          {/* Item 3 */}
          <div className="flex flex-col items-center gap-1 p-2 border-l border-border/40">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">100%</span>
            <span className="text-[0.7rem] font-black uppercase text-muted tracking-wider">
              Ad-Free Game Flow
            </span>
          </div>

          {/* Item 4 */}
          <div className="flex flex-col items-center gap-1 p-2 border-l border-border/40">
            <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight flex items-center gap-1">
              4.9★ <Star className="w-5 h-5 text-primary fill-primary" />
            </span>
            <span className="text-[0.7rem] font-black uppercase text-muted tracking-wider">
              Playtester Beta Rating
            </span>
          </div>

        </div>
      </div>
    </section>
  );
};
