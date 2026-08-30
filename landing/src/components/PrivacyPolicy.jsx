import React from "react";
import { ShieldCheck, Lock, EyeOff, Radio } from "lucide-react";

export const PrivacyPolicy = () => {
  return (
    <section
      className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24"
      id="privacy"
    >
      <div className="bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark p-8 md:p-12 rounded-3xl shadow-lg flex flex-col gap-8">
        <div className="flex flex-col gap-3 text-center md:text-left">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary self-center md:self-start">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-black tracking-tight">
            Privacy & Transparency Policy
          </h2>
          <p className="text-sm text-muted-light dark:text-muted-dark">
            Our 100% Zero-Data Stance for **Guess Up** (Last updated: August
            2026)
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface-card-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark flex flex-col gap-3">
            <div className="flex items-center gap-2 font-black text-sm text-text-light dark:text-text-dark">
              <Lock className="w-4 h-4 text-primary" /> No User Accounts
            </div>
            <p className="text-xs text-muted-light dark:text-muted-dark leading-relaxed">
              Guess Up requires zero registration, email sign-ups, or social
              logins. You open the app and play immediately.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark flex flex-col gap-3">
            <div className="flex items-center gap-2 font-black text-sm text-text-light dark:text-text-dark">
              <EyeOff className="w-4 h-4 text-primary" /> No Ad Tracking
            </div>
            <p className="text-xs text-muted-light dark:text-muted-dark leading-relaxed">
              We do not include third-party advertising SDKs, tracking pixels,
              or cross-app identifier networks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark flex flex-col gap-3">
            <div className="flex items-center gap-2 font-black text-sm text-text-light dark:text-text-dark">
              <Radio className="w-4 h-4 text-primary" /> Local Sensors Only
            </div>
            <p className="text-xs text-muted-light dark:text-muted-dark leading-relaxed">
              Accelerometer and gyroscope data are processed strictly on-device
              during active round timers and never stored or transmitted.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
