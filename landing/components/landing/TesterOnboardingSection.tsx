"use client";

import React, { forwardRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, ExternalLink, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";

export const DEFAULT_GOOGLE_GROUP_URL =
  "https://groups.google.com/g/bujho-testers";
export const DEFAULT_PLAY_STORE_URL =
  "https://play.google.com/apps/testing/com.shreynagda.guess_up";

interface TesterOnboardingSectionProps {
  onConfirm?: () => void;
  googleGroupUrl?: string;
  playStoreUrl?: string;
}

export const TesterOnboardingSection = forwardRef<
  HTMLDivElement,
  TesterOnboardingSectionProps
>(
  (
    {
      onConfirm,
      googleGroupUrl = DEFAULT_GOOGLE_GROUP_URL,
      playStoreUrl = DEFAULT_PLAY_STORE_URL,
    },
    ref,
  ) => {
    const [hasJoinedGroup, setHasJoinedGroup] = useState<boolean>(false);

    useEffect(() => {
      try {
        const storedState = localStorage.getItem("bujho_joined_google_group");
        if (storedState === "true") {
          setHasJoinedGroup(true);
        }
      } catch (err) {
        console.error("Failed to read localStorage:", err);
      }
    }, []);

    const handleJoinGroup = () => {
      window.open(googleGroupUrl, "_blank", "noopener,noreferrer");
      setHasJoinedGroup(true);
      try {
        localStorage.setItem("bujho_joined_google_group", "true");
      } catch (err) {
        console.error("Failed to save to localStorage:", err);
      }
      if (onConfirm) onConfirm();
    };

    const handleOpenPlayStore = () => {
      window.open(playStoreUrl, "_blank", "noopener,noreferrer");
    };

    const handleResetSteps = () => {
      setHasJoinedGroup(false);
      try {
        localStorage.removeItem("bujho_joined_google_group");
      } catch (err) {
        console.error("Failed to clear localStorage:", err);
      }
    };

    return (
      <section
        ref={ref}
        id="tester-onboarding"
        className="py-16 md:py-24 bg-transparent transition-colors duration-300 relative"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-brand-border backdrop-blur-xl flex flex-col space-y-6 text-brand-text"
          >
            {/* Header Badge & Title */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-party-orange/15 text-party-orange text-xs font-black uppercase tracking-wider mb-3 border border-party-orange/30">
                <Users className="w-3.5 h-3.5" />
                <span>Early Access Program</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-lilita font-black text-brand-text leading-tight mb-2">
                Join the Bujho Testers 🎉
              </h2>
              <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold leading-relaxed">
                No form or email required! Simply join our Google Group with
                your Google Account, then tap to download on Google Play Store.
              </p>
            </div>

            <p className="text-xs text-brand-muted font-medium bg-brand-bg p-3.5 rounded-2xl border border-brand-border">
              ✨ Free · Instant Play Store Access · Leave anytime with 1 click.
            </p>

            {/* Interactive 2-Step Visual Flow with Click Tracking */}
            <div className="space-y-3 bg-brand-bg/80 p-4 sm:p-5 rounded-2xl border border-brand-border">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-brand-muted mb-1">
                <span>How it works (2 Simple Steps)</span>
                {hasJoinedGroup && (
                  <button
                    onClick={handleResetSteps}
                    className="inline-flex items-center gap-1 text-[11px] text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Step 1: Join Google Group */}
              <div
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                  hasJoinedGroup
                    ? "bg-emerald-500/10 border-emerald-500/40"
                    : "bg-brand-surface border-party-orange/40 shadow-xs"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-lg font-lilita font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${
                    hasJoinedGroup
                      ? "bg-emerald-500 text-white"
                      : "bg-party-orange text-white"
                  }`}
                >
                  {hasJoinedGroup ? <CheckCircle2 className="w-4 h-4" /> : "1"}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs sm:text-sm text-brand-text">
                      Step 1: Join Google Group
                    </span>
                    {hasJoinedGroup && (
                      <span className="text-[11px] font-bold text-emerald-400">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-brand-muted font-medium">
                    Tap the button below to open Google Group and click
                    &quot;Join group&quot;.
                  </div>
                </div>
              </div>

              {/* Step 2: Download on Google Play Store */}
              <div
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                  hasJoinedGroup
                    ? "bg-party-pink/10 border-party-pink/40 shadow-xs"
                    : "bg-brand-surface border-brand-border/60 opacity-80"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-lg font-lilita font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${
                    hasJoinedGroup
                      ? "bg-party-pink text-white"
                      : "bg-brand-muted/40 text-brand-muted"
                  }`}
                >
                  2
                </span>
                <div className="flex-1">
                  <div className="font-extrabold text-xs sm:text-sm text-brand-text">
                    Step 2: Download on Play Store
                  </div>
                  <div className="text-xs text-brand-muted font-medium">
                    Once you&apos;ve joined the group, open the Play Store link
                    to install Bujho.
                  </div>
                </div>
              </div>
            </div>

            {/* Reference Screenshot Preview - Clean Un-cropped Framing */}
            <div className="space-y-1.5">
              <div className="rounded-2xl border-2 border-brand-border bg-white p-3 shadow-md flex items-center justify-center">
                <img
                  src="/images/play_invite_screenshot.png"
                  alt="Google Play Accept Invite Screenshot Preview"
                  className="w-full h-auto object-contain max-h-56 sm:max-h-64 rounded-xl"
                />
              </div>
              <p className="text-[11px] sm:text-xs text-center text-brand-muted italic font-medium">
                *On Google Play, tap{" "}
                <strong className="text-party-orange">
                  &quot;BECOME A TESTER&quot;
                </strong>{" "}
                to unlock instant download.*
              </p>
            </div>

            {/* Action Buttons based on tracked click state */}
            <div className="pt-2 flex flex-col space-y-3">
              {!hasJoinedGroup ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleJoinGroup}
                  className="w-full font-lilita text-base sm:text-lg uppercase tracking-wider py-4 gap-2 justify-center shadow-lg"
                >
                  <span>1. Join Google Group →</span>
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleOpenPlayStore}
                    className="w-full font-lilita text-base sm:text-lg uppercase tracking-wider py-4 gap-2 justify-center shadow-lg bg-emerald-600 hover:bg-emerald-500 border-emerald-400"
                  >
                    <span>2. Download on Play Store 🚀</span>
                    <ExternalLink className="w-5 h-5" />
                  </Button>
                  <button
                    type="button"
                    onClick={handleJoinGroup}
                    className="text-xs text-brand-muted hover:text-brand-text font-bold text-center underline cursor-pointer"
                  >
                    Need to re-open Google Group page?
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    );
  },
);

TesterOnboardingSection.displayName = "TesterOnboardingSection";
