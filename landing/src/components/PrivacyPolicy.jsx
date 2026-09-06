import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, EyeOff, Radio, ArrowRight } from "lucide-react";

export const PrivacyPolicy = () => {
  return (
    <section
      className="py-8 sm:py-16 md:py-24 border-t border-border/40 relative"
      id="privacy"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col gap-6 sm:gap-8">
        <div className="bg-surface/80 border border-border/60 backdrop-blur-md p-4 md:p-12 rounded-3xl shadow-xl flex flex-col gap-8">
          <div className="flex flex-col gap-3 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary self-center md:self-start">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight uppercase">
              Privacy & Transparency Policy
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              100% Zero-Data & On-Device Processing Guarantee for{" "}
              <strong>Guess Up</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-surface-card border border-border flex flex-col gap-3">
              <div className="flex items-center gap-2 font-black text-sm text-text">
                <Lock className="w-4 h-4 text-primary" /> No User Accounts
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Guess Up requires zero registration or social logins. You open
                the app and play immediately.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-card border border-border flex flex-col gap-3">
              <div className="flex items-center gap-2 font-black text-sm text-text">
                <EyeOff className="w-4 h-4 text-primary" /> No Ad Tracking
              </div>
              <p className="text-xs text-muted leading-relaxed">
                We do not include third-party advertising SDKs, tracking pixels,
                or cross-app identifier networks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-card border border-border flex flex-col gap-3">
              <div className="flex items-center gap-2 font-black text-sm text-text">
                <Radio className="w-4 h-4 text-primary" /> Local Sensors Only
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Accelerometer and gyroscope data are processed strictly
                on-device during active round timers and never stored.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40">
            <Link
              to="/privacy"
              className="px-5 py-3 rounded-2xl bg-primary text-accent font-black text-xs inline-flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" /> Full Policy Details{" "}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
