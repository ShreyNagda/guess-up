import React from "react";
import { UserCheck, Play, ShieldCheck, Flame } from "lucide-react";

export const ClosingCta = () => {
  const scrollToDemo = () => {
    const demoEl = document.getElementById("interactive-hero-demo");
    if (demoEl) {
      demoEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 md:py-24 border-t border-border/40 relative" id="cta">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-gradient-to-r from-[#FFD600] to-[#FF9100] text-accent p-8 sm:p-14 rounded-[36px] shadow-2xl flex flex-col items-center text-center gap-6 relative overflow-hidden">
          
          <div className="absolute inset-0 bg-white/10 pointer-events-none" />

          <span className="px-3.5 py-1 rounded-full bg-accent/15 text-accent font-black text-xs uppercase tracking-widest z-10 border border-accent/20">
            🔥 READY TO GUESS UP?
          </span>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight text-accent z-10">
            Turn Your Next Gathering Into <br className="hidden sm:inline" /> An Electric Game Night
          </h2>

          <p className="font-extrabold text-sm sm:text-base max-w-xl leading-relaxed text-accent/90 z-10">
            Join hundreds of beta playtesters testing early builds, balancing decks, and unlocking zero-ad party charades.
          </p>

          {/* DUAL CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md z-10 mt-2">
            <a
              href="#testers"
              className="w-full sm:w-auto bg-accent text-primary font-black px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
            >
              <UserCheck className="w-4 h-4" /> Get Free Beta Access Now 🚀
            </a>

            <button
              onClick={scrollToDemo}
              className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-accent font-black px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer border border-accent/20"
            >
              <Play className="w-4 h-4 fill-accent" /> Play Interactive Demo 🎮
            </button>
          </div>

          {/* Microcopy Friction Reducers */}
          <div className="flex items-center justify-center gap-2 text-[0.7rem] font-bold text-accent/80 z-10 mt-2">
            <ShieldCheck className="w-4 h-4" />
            <span>⚡ 100% Free • No Credit Card Required • Instant TestFlight / APK Access • Zero Ads</span>
          </div>

        </div>
      </div>
    </section>
  );
};
