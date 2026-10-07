"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  Smartphone,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Loader2,
} from "lucide-react";
import QRCode from "qrcode";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/Button";

const GOOGLE_GROUP_URL = "https://groups.google.com/g/bujho-testers";
const PLAY_STORE_URL =
  "https://play.google.com/apps/testing/com.shreynagda.guess_up";

export default function BecomeATesterPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>(false ? "" : "");
  const popupPollTimer = useRef<NodeJS.Timeout | null>(null);
  const popupRef = useRef<Window | null>(null);

  // Restore step progress from localStorage
  useEffect(() => {
    try {
      const storedGroupJoined = localStorage.getItem(
        "bujho_joined_google_group",
      );
      if (storedGroupJoined === "true") {
        setCurrentStep(2);
      }
    } catch (err) {
      console.error("Failed to read localStorage:", err);
    }
  }, []);

  // Generate QR Code for Play Store link
  useEffect(() => {
    QRCode.toDataURL(PLAY_STORE_URL, {
      width: 220,
      margin: 2,
      color: {
        dark: "#111827",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("Error generating QR Code:", err));
  }, []);

  // Cleanup popup polling on unmount
  useEffect(() => {
    return () => {
      if (popupPollTimer.current) {
        clearInterval(popupPollTimer.current);
      }
    };
  }, []);

  // Handle opening Google Group in a controlled popup window
  const handleOpenGoogleGroupPopup = () => {
    const width = 560;
    const height = 720;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      GOOGLE_GROUP_URL,
      "BujhoGoogleGroupPopup",
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`,
    );

    popupRef.current = popup;
    setIsPopupOpen(true);

    if (popup) {
      // Poll popup to detect when user finishes and closes it
      if (popupPollTimer.current) clearInterval(popupPollTimer.current);

      popupPollTimer.current = setInterval(() => {
        try {
          if (!popupRef.current || popupRef.current.closed) {
            if (popupPollTimer.current) clearInterval(popupPollTimer.current);
            setIsPopupOpen(false);
            // Automatically advance to Step 2
            advanceToStep2();
          }
        } catch (e) {
          // Cross-origin access restriction safety
        }
      }, 600);
    } else {
      // Fallback if browser blocked popups: open in regular tab
      window.open(GOOGLE_GROUP_URL, "_blank");
    }
  };

  const advanceToStep2 = () => {
    setCurrentStep(2);
    try {
      localStorage.setItem("bujho_joined_google_group", "true");
    } catch (err) {
      console.error("Failed to save to localStorage:", err);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setIsPopupOpen(false);
    if (popupPollTimer.current) clearInterval(popupPollTimer.current);
    try {
      localStorage.removeItem("bujho_joined_google_group");
    } catch (err) {
      console.error("Failed to clear localStorage:", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(PLAY_STORE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-between transition-colors duration-300 bg-brand-bg text-brand-text">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full grow">
        {/* Back Link Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-brand-muted hover:text-brand-text transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Hero Header Banner */}
        <div className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-brand-surface backdrop-blur-xl border border-brand-border shadow-xl mb-8 text-center">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-party-orange via-party-pink to-party-cyan" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-party-orange/15 text-party-orange text-xs font-black uppercase tracking-wider mb-4 border border-party-orange/30 shadow-xs">
            <Users className="w-3.5 h-3.5" />
            <span>Google Play Early Access Program</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-lilita font-black text-brand-text tracking-tight mb-3 uppercase">
            Become an Official Bujho Tester 🎉
          </h1>

          <p className="text-sm sm:text-base text-brand-muted font-bold max-w-2xl mx-auto leading-relaxed">
            Follow our guided 2-step setup to unlock private Google Play testing
            access and download the game right away.
          </p>
        </div>

        {/* PROGRESS STEPPER HEADER */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-brand-surface border border-brand-border shadow-md">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            {/* Step 1 Pill */}
            <div className="flex items-center gap-3">
              <span
                className={`w-9 h-9 rounded-xl font-lilita font-black text-sm flex items-center justify-center transition-all shadow-xs ${
                  currentStep === 2
                    ? "bg-emerald-500 text-white"
                    : currentStep === 1 && isPopupOpen
                      ? "bg-party-orange text-white ring-4 ring-party-orange/20 animate-pulse"
                      : "bg-party-orange text-white"
                }`}
              >
                {currentStep === 2 ? <Check className="w-5 h-5" /> : "1"}
              </span>
              <div>
                <div className="text-[11px] font-black uppercase text-brand-muted tracking-wider">
                  Step 1
                </div>
                <div
                  className={`text-xs sm:text-sm font-extrabold ${
                    currentStep === 1 ? "text-brand-text" : "text-emerald-400"
                  }`}
                >
                  Join Google Group
                </div>
              </div>
            </div>

            {/* Connecting Chevron */}
            <ChevronRight
              className={`w-5 h-5 transition-colors ${
                currentStep === 2 ? "text-emerald-400" : "text-brand-muted"
              }`}
            />

            {/* Step 2 Pill */}
            <div className="flex items-center gap-3">
              <span
                className={`w-9 h-9 rounded-xl font-lilita font-black text-sm flex items-center justify-center transition-all shadow-xs ${
                  currentStep === 2
                    ? "bg-party-pink text-white ring-4 ring-party-pink/20"
                    : "bg-brand-muted/20 text-brand-muted"
                }`}
              >
                2
              </span>
              <div>
                <div className="text-[11px] font-black uppercase text-brand-muted tracking-wider">
                  Step 2
                </div>
                <div
                  className={`text-xs sm:text-sm font-extrabold ${
                    currentStep === 2 ? "text-party-pink" : "text-brand-muted"
                  }`}
                >
                  Download on Play Store
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTIVE GUIDED STEP CARD */}
        <div className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-brand-surface border-2 border-brand-border shadow-2xl mb-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 ? (
              /* ================= STEP 1 VIEW ================= */
              <motion.div
                key="step-1-content"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Warning Alert */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-brand-text flex items-start gap-3.5 shadow-xs">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p className="font-extrabold text-amber-500 uppercase tracking-wide">
                      Why Google Group is Required First
                    </p>
                    <p className="text-brand-muted leading-relaxed font-medium">
                      Google Play strictly locks private closed testing to
                      verified group members. If you skip this step, Google Play
                      will display an error:{" "}
                      <strong className="text-brand-text">
                        &quot;Content unavailable / A testing version isn&apos;t
                        available&quot;
                      </strong>
                      .
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-brand-bg/80 border border-brand-border space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-lilita text-xl sm:text-2xl text-brand-text uppercase tracking-tight flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-party-orange" />
                      <span>Step 1: Join the Bujho Testers Group</span>
                    </h3>
                    <span className="text-xs font-bold text-party-orange bg-party-orange/15 px-3 py-1 rounded-full border border-party-orange/30 uppercase tracking-wider">
                      Takes 5 Seconds
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-brand-muted font-medium leading-relaxed">
                    Click the button below to open Google Group in a quick popup
                    window. Tap{" "}
                    <strong className="text-brand-text">
                      &quot;Join group&quot;
                    </strong>{" "}
                    with your Google Account, then close the popup. Our page
                    will automatically detect when you&apos;re done!
                  </p>

                  {/* Active Popup Waiting Radar */}
                  {isPopupOpen && (
                    <div className="p-4 rounded-xl bg-party-orange/10 border border-party-orange/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
                      <div className="flex items-center gap-2.5 text-party-orange font-bold">
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span>
                          Popup window open! Tap &quot;Join group&quot; inside,
                          then close it to continue.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={advanceToStep2}
                        className="px-3 py-1.5 rounded-lg bg-party-orange text-white font-extrabold text-xs shadow-xs hover:bg-party-orange/90 transition-colors cursor-pointer shrink-0"
                      >
                        I&apos;ve Joined Group ✓
                      </button>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      onClick={handleOpenGoogleGroupPopup}
                      className="w-full font-lilita text-base sm:text-lg uppercase tracking-wider py-4 justify-center shadow-lg gap-2"
                    >
                      <span>1. Open Google Group to Join →</span>
                      <ExternalLink className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-brand-muted font-medium px-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Free Forever · 100% Ad-Free · Zero Spam</span>
                  </span>
                  <button
                    type="button"
                    onClick={advanceToStep2}
                    className="hover:text-brand-text underline cursor-pointer"
                  >
                    Already in the group? Skip to Step 2 →
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ================= STEP 2 VIEW ================= */
              <motion.div
                key="step-2-content"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Success Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 text-brand-text flex items-start justify-between gap-3.5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-xs sm:text-sm">
                      <p className="font-extrabold text-emerald-400 uppercase tracking-wide">
                        Step 1 Complete: You&apos;re Whitelisted! 🎉
                      </p>
                      <p className="text-brand-muted font-medium">
                        Your Google account now has permission to download Bujho
                        from the Google Play Store.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 text-[11px] text-brand-muted hover:text-brand-text bg-brand-surface/70 px-2.5 py-1 rounded-lg border border-brand-border shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Start Over</span>
                  </button>
                </div>

                {/* Step 2 Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Direct Action Buttons */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="p-5 sm:p-6 rounded-2xl bg-brand-bg/80 border border-brand-border space-y-4">
                      <h3 className="font-lilita text-xl sm:text-2xl text-brand-text uppercase tracking-tight">
                        Step 2: Download on Google Play Store
                      </h3>

                      <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-muted space-y-1.5">
                        <p className="font-bold text-brand-text">
                          Instructions on Play Store:
                        </p>
                        <ol className="list-decimal list-inside space-y-1 pl-1">
                          <li>
                            Click the green button below to open the invite.
                          </li>
                          <li>
                            Tap the blue{" "}
                            <strong className="text-party-orange">
                              &quot;BECOME A TESTER&quot;
                            </strong>{" "}
                            button.
                          </li>
                          <li>
                            Tap the link to download the app on Google Play!
                          </li>
                        </ol>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                        <a
                          href={PLAY_STORE_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-lilita text-base uppercase tracking-wider transition-colors shadow-lg"
                        >
                          <span>Download on Play Store 🚀</span>
                          <ExternalLink className="w-5 h-5" />
                        </a>

                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="inline-flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-brand-surface hover:bg-brand-card border-2 border-brand-border text-brand-text font-lilita text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-400">
                                Link Copied!
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-brand-muted" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenGoogleGroupPopup}
                        className="text-xs text-brand-muted hover:text-brand-text underline cursor-pointer block pt-1"
                      >
                        Need to re-open the Google Group window?
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Screenshot Visual & QR Code */}
                  <div className="md:col-span-5 space-y-4">
                    {/* Visual Screenshot of Become a Tester button */}
                    <div className="p-4 rounded-2xl bg-brand-bg/80 border border-brand-border text-center space-y-2">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-muted">
                        <HelpCircle className="w-3.5 h-3.5 text-party-orange" />
                        <span>What to tap on Google Play</span>
                      </div>

                      <div className="rounded-xl border-2 border-brand-border bg-white p-2 shadow-xs overflow-hidden flex items-center justify-center">
                        <img
                          src="/images/play_invite_screenshot.png"
                          alt="Google Play Accept Invite Screenshot Preview"
                          className="w-full h-auto object-contain max-h-48 rounded-lg"
                        />
                      </div>

                      <p className="text-[11px] text-brand-muted italic font-medium">
                        Look for the blue &quot;BECOME A TESTER&quot; button.
                      </p>
                    </div>

                    {/* QR Code for PC visitors */}
                    {qrCodeUrl && (
                      <div className="p-4 rounded-2xl bg-brand-bg/80 border border-brand-border text-center flex flex-col items-center space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-party-cyan">
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Scan with Phone Camera</span>
                        </div>

                        <div className="p-2 bg-white rounded-xl shadow-xs border border-brand-border max-w-[140px] aspect-square flex items-center justify-center">
                          <img
                            src={qrCodeUrl}
                            alt="Play Store QR Code"
                            className="w-full h-full object-contain rounded-md"
                          />
                        </div>

                        <p className="text-[11px] text-brand-muted font-medium">
                          Scan to install directly on your Android phone.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FAQ & HELP ACCORDION */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-lilita font-black text-brand-text uppercase tracking-tight">
            Frequently Asked Tester Questions
          </h2>

          <div className="space-y-3">
            <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border">
              <h3 className="font-extrabold text-sm sm:text-base text-brand-text mb-1.5">
                Why do I need to join a Google Group to test the app?
              </h3>
              <p className="text-xs sm:text-sm text-brand-muted font-medium leading-relaxed">
                Google Play Console requires all private closed beta testers to
                be verified members of an authorized tester list or Google
                Group. Joining the group instantly authorizes your Google
                Account to download the beta build.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border">
              <h3 className="font-extrabold text-sm sm:text-base text-brand-text mb-1.5">
                What if Google says &quot;Content unavailable&quot; or &quot;Not
                allowed&quot;?
              </h3>
              <p className="text-xs sm:text-sm text-brand-muted font-medium leading-relaxed">
                Make sure you are logged into your primary Google Account in
                your browser. Also, you must complete Step 1 (Join Google Group)
                before clicking the Google Play link.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border">
              <h3 className="font-extrabold text-sm sm:text-base text-brand-text mb-1.5">
                Is Bujho really 100% free and ad-free?
              </h3>
              <p className="text-xs sm:text-sm text-brand-muted font-medium leading-relaxed">
                Yes! Bujho was built for seamless house parties, road trips, and
                hostel hangouts. There are zero video ads, zero banner ads, and
                it works completely offline once downloaded.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
