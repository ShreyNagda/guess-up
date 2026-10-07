"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Check,
  QrCode,
  Smartphone,
  Info,
  ChevronDown,
  RefreshCw,
  Loader2,
  Sparkles,
  MessageCircle,
  Award,
} from "lucide-react";
import QRCode from "qrcode";
import { Button } from "../ui/Button";
import {
  GOOGLE_GROUP_URL,
  PLAY_STORE_INTENT_URL,
  PLAY_STORE_WEB_URL,
  SHORT_LINK_URL,
  WHATSAPP_GROUP_URL,
} from "@/lib/config";

interface EarlyAccessSectionProps {
  onToastMessage?: (msg: string) => void;
  isHighlighted?: boolean;
}

type EarlyAccessProgress = "list" | "downloaded" | "playing";

export function EarlyAccessSection({
  onToastMessage,
  isHighlighted = false,
}: EarlyAccessSectionProps) {
  const [progress, setProgress] = useState<EarlyAccessProgress>("list");
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [isOptedInCheckbox, setIsOptedInCheckbox] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [openTroubleshootIdx, setOpenTroubleshootIdx] = useState<number | null>(
    null,
  );
  const [isAndroidDevice, setIsAndroidDevice] = useState<boolean>(false);

  const popupPollTimer = useRef<NodeJS.Timeout | null>(null);
  const popupRef = useRef<Window | null>(null);

  // Detect Android on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent || "";
      setIsAndroidDevice(/android/i.test(ua));
    }
  }, []);

  // Restore step progress from localStorage
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(
        "bujho_early_access_progress",
      ) as EarlyAccessProgress | null;
      if (
        savedProgress &&
        ["list", "downloaded", "playing"].includes(savedProgress)
      ) {
        setProgress(savedProgress);
        if (savedProgress === "playing") {
          setIsOptedInCheckbox(true);
        }
      }
    } catch (e) {
      console.error("Error reading bujho_early_access_progress:", e);
    }
  }, []);

  // Generate QR Code for desktop view
  useEffect(() => {
    const qrTarget = SHORT_LINK_URL.startsWith("http")
      ? SHORT_LINK_URL
      : `https://${SHORT_LINK_URL}`;
    QRCode.toDataURL(qrTarget, {
      width: 200,
      margin: 2,
      color: {
        dark: "#111827",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((e) => console.error("Error generating QR code:", e));
  }, []);

  // Cleanup popup polling on unmount
  useEffect(() => {
    return () => {
      if (popupPollTimer.current) {
        clearInterval(popupPollTimer.current);
      }
    };
  }, []);

  // Step 1: Open Google Group in a controlled popup window
  const handleOpenGroupPopup = () => {
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      GOOGLE_GROUP_URL,
      "bujhoGroup",
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`,
    );

    popupRef.current = popup;
    setIsPopupOpen(true);

    if (popup) {
      if (popupPollTimer.current) clearInterval(popupPollTimer.current);

      popupPollTimer.current = setInterval(() => {
        try {
          if (!popupRef.current || popupRef.current.closed) {
            if (popupPollTimer.current) clearInterval(popupPollTimer.current);
            setIsPopupOpen(false);
            // Auto-advance to Step 2
            advanceToProgress(
              "downloaded",
              "You're on the list. Next step unlocked 👇",
            );
          }
        } catch (err) {
          // Cross-origin safety
        }
      }, 500);
    } else {
      // Fallback if popup blocked
      window.open(GOOGLE_GROUP_URL, "_blank");
    }
  };

  const advanceToProgress = (
    nextProgress: EarlyAccessProgress,
    toastMsg?: string,
  ) => {
    setProgress(nextProgress);
    try {
      localStorage.setItem("bujho_early_access_progress", nextProgress);
    } catch (e) {
      console.error(e);
    }
    if (toastMsg && onToastMessage) {
      onToastMessage(toastMsg);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsOptedInCheckbox(checked);
    if (checked) {
      advanceToProgress("playing", "Spot claimed! Final step unlocked 👇");
    }
  };

  const handleResetProgress = () => {
    setProgress("list");
    setIsOptedInCheckbox(false);
    setIsPopupOpen(false);
    if (popupPollTimer.current) clearInterval(popupPollTimer.current);
    try {
      localStorage.removeItem("bujho_early_access_progress");
    } catch (e) {
      console.error(e);
    }
  };

  const troubleshootingItems = [
    {
      q: "Play Store says 'app not available'",
      a: "Google needs 5–10 minutes to sync your spot across servers. Grab a chai and try again in a bit, and make sure your phone is signed into the same Google account.",
    },
    {
      q: "I used a different Google account",
      a: "Sign into the Play Store using the exact Google account you used in Step 1. Using two different accounts is the #1 reason Play Store blocks the link.",
    },
    {
      q: "I can't install from Play Store",
      a: "Tap the blue 'BECOME A TESTER' button on the Play Store web page first. Once the page confirms you are in, tap the install link to download.",
    },
    {
      q: "Nothing happened when I tapped 'Join the Founders List'",
      a: "If your browser blocked the popup window, tap the fallback link below the button ('Popup blocked? Open in new tab →') to join directly.",
    },
  ];

  return (
    <section
      id="early-access"
      className="py-16 md:py-24 bg-transparent transition-colors duration-300 relative scroll-mt-16"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`relative overflow-hidden p-6 sm:p-10 rounded-3xl shadow-2xl border-2 transition-all duration-300 backdrop-blur-xl bg-brand-surface/90 ${
            isHighlighted
              ? "border-party-orange ring-4 ring-party-orange/30 shadow-party-orange/20"
              : "border-brand-border"
          }`}
        >
          {/* Section Header */}
          <div className="text-center sm:text-left mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-party-orange/15 text-party-orange text-xs font-black uppercase tracking-wider mb-3 border border-party-orange/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Founders Circle Access</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-lilita font-black text-brand-text leading-tight mb-2 uppercase">
              Claim Your Founding Player Spot
            </h2>
            <p className="font-manrope text-sm sm:text-base text-brand-muted font-bold leading-relaxed">
              Only 60 spots in the first drop. Here&apos;s how to grab yours —
              takes about 30 seconds.
            </p>
          </div>

          {/* PROGRESS UI: 3-DOT STEPPER ●━━○━━○ */}
          <div className="mb-8 p-4 rounded-2xl bg-brand-bg/80 border border-brand-border shadow-xs">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {/* Dot 1 */}
              <div className="flex flex-col items-center">
                <span
                  className={`w-7 h-7 rounded-full font-lilita text-xs font-black flex items-center justify-center transition-all ${
                    progress === "downloaded" || progress === "playing"
                      ? "bg-emerald-500 text-white"
                      : "bg-party-orange text-white ring-4 ring-party-orange/20"
                  }`}
                >
                  {progress === "downloaded" || progress === "playing" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    "●"
                  )}
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-brand-text mt-1.5">
                  Join the list
                </span>
              </div>

              {/* Connecting Bar 1-2 */}
              <div
                className={`h-0.5 flex-1 mx-3 transition-colors ${
                  progress === "downloaded" || progress === "playing"
                    ? "bg-emerald-500"
                    : "bg-brand-border"
                }`}
              />

              {/* Dot 2 */}
              <div className="flex flex-col items-center">
                <span
                  className={`w-7 h-7 rounded-full font-lilita text-xs font-black flex items-center justify-center transition-all ${
                    progress === "playing"
                      ? "bg-emerald-500 text-white"
                      : progress === "downloaded"
                        ? "bg-party-pink text-white ring-4 ring-party-pink/20"
                        : "bg-brand-muted/20 text-brand-muted"
                  }`}
                >
                  {progress === "playing" ? (
                    <Check className="w-4 h-4" />
                  ) : progress === "downloaded" ? (
                    "●"
                  ) : (
                    "○"
                  )}
                </span>
                <span
                  className={`text-[11px] font-black uppercase tracking-wider mt-1.5 ${
                    progress === "downloaded" || progress === "playing"
                      ? "text-brand-text"
                      : "text-brand-muted"
                  }`}
                >
                  Get the app
                </span>
              </div>

              {/* Connecting Bar 2-3 */}
              <div
                className={`h-0.5 flex-1 mx-3 transition-colors ${
                  progress === "playing" ? "bg-emerald-500" : "bg-brand-border"
                }`}
              />

              {/* Dot 3 */}
              <div className="flex flex-col items-center">
                <span
                  className={`w-7 h-7 rounded-full font-lilita text-xs font-black flex items-center justify-center transition-all ${
                    progress === "playing"
                      ? "bg-party-cyan text-white ring-4 ring-party-cyan/20"
                      : "bg-brand-muted/20 text-brand-muted"
                  }`}
                >
                  {progress === "playing" ? "●" : "○"}
                </span>
                <span
                  className={`text-[11px] font-black uppercase tracking-wider mt-1.5 ${
                    progress === "playing"
                      ? "text-brand-text"
                      : "text-brand-muted"
                  }`}
                >
                  Start playing
                </span>
              </div>
            </div>

            {/* Reset link if advanced */}
            {progress !== "list" && (
              <div className="text-right pt-2 border-t border-brand-border/40 mt-3">
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="text-[11px] text-brand-muted hover:text-brand-text inline-flex items-center gap-1 cursor-pointer font-bold"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Start over</span>
                </button>
              </div>
            )}
          </div>

          {/* PERMANENT NOTICE BOX (SUBTLE, PRO-TIP TONE) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-brand-bg/80 border border-brand-border text-brand-text flex items-start gap-3.5 mb-8 shadow-xs">
            <Info className="w-5 h-5 text-party-cyan shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm font-medium leading-relaxed">
              <strong className="font-extrabold text-brand-text block mb-0.5">
                Pro tip before you start:
              </strong>
              ℹ️ Use the SAME Google account for both steps below. Mixing
              accounts is the #1 reason people hit &apos;app not available&apos;
              on Play Store.
            </div>
          </div>

          {/* ================= STEP 1: ADD YOURSELF TO THE FOUNDERS LIST ================= */}
          <div
            className={`p-6 rounded-2xl border-2 transition-all mb-6 ${
              progress === "list"
                ? "bg-brand-bg/90 border-party-orange/60 shadow-lg ring-2 ring-party-orange/15"
                : "bg-brand-bg/40 border-brand-border opacity-70"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-lilita text-lg sm:text-2xl text-brand-text uppercase tracking-tight">
                ① Add yourself to the Founders list
              </h3>
              {progress !== "list" && (
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  ✓ On the list
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-brand-muted font-medium mb-4 leading-relaxed">
              Tap below to add your Google account to our early-access list. One
              tap. That&apos;s it.
            </p>

            {progress === "list" && (
              <div className="space-y-3">
                {isPopupOpen && (
                  <div className="p-3.5 rounded-xl bg-party-orange/10 border border-party-orange/30 flex items-center justify-between gap-3 text-xs animate-in fade-in">
                    <div className="flex items-center gap-2 text-party-orange font-bold">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>
                        Popup open! Tap &apos;Join group&apos; inside, then
                        close it to continue.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        advanceToProgress(
                          "downloaded",
                          "You're on the list. Next step unlocked 👇",
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-party-orange text-white font-extrabold text-xs shadow-xs hover:bg-party-orange/90 transition-colors cursor-pointer shrink-0"
                    >
                      Done ✓
                    </button>
                  </div>
                )}

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleOpenGroupPopup}
                  className="w-full font-lilita text-base uppercase tracking-wider py-4 justify-center shadow-lg gap-2"
                >
                  <span>Join the Founders List</span>
                  <ExternalLink className="w-5 h-5" />
                </Button>

                <div className="text-center pt-1">
                  <a
                    href={GOOGLE_GROUP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => advanceToProgress("downloaded")}
                    className="text-xs text-brand-muted hover:text-brand-text font-bold underline cursor-pointer"
                  >
                    Popup blocked? Open in new tab →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* ================= STEP 2: DOWNLOAD THE GAME ================= */}
          <div
            className={`p-6 rounded-2xl border-2 transition-all mb-6 ${
              progress === "downloaded"
                ? "bg-brand-bg/90 border-party-pink/60 shadow-lg ring-2 ring-party-pink/15"
                : progress === "playing"
                  ? "bg-brand-bg/40 border-brand-border opacity-70"
                  : "bg-brand-bg/20 border-brand-border/40 opacity-40 pointer-events-none"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-lilita text-lg sm:text-2xl text-brand-text uppercase tracking-tight">
                ② Download the game
              </h3>
              {progress === "playing" && (
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  ✓ Installed
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-brand-muted font-medium mb-4 leading-relaxed">
              ⏳ Heads up: Google needs 5–10 minutes to sync your spot. Grab a
              chai. When you come back, tap below.
            </p>

            {progress === "downloaded" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={
                      isAndroidDevice
                        ? PLAY_STORE_INTENT_URL
                        : PLAY_STORE_WEB_URL
                    }
                    {...(!isAndroidDevice
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full btn-theme-primary font-lilita text-base uppercase tracking-wider cursor-pointer"
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>Open Play Store</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Desktop QR Code block */}
                <div className="hidden md:flex items-center gap-4 p-4 rounded-xl bg-brand-surface border border-brand-border">
                  {qrCodeDataUrl ? (
                    <div className="p-2 bg-white rounded-xl shadow-xs border border-brand-border max-w-30 aspect-square flex items-center justify-center shrink-0">
                      <img
                        src={qrCodeDataUrl}
                        alt="Play Store QR Code"
                        className="w-full h-full object-contain rounded-md"
                      />
                    </div>
                  ) : null}
                  <div className="space-y-1 text-xs">
                    <p className="font-extrabold text-brand-text flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-party-cyan" />
                      <span>On computer right now?</span>
                    </p>
                    <p className="text-brand-muted">
                      Scan this code with your Android camera, or type this
                      short link into your phone:
                    </p>
                    <div className="font-mono text-xs font-bold text-party-orange">
                      {SHORT_LINK_URL}
                    </div>
                  </div>
                </div>

                {/* Checkbox to reveal Step 3 */}
                <label className="flex items-center gap-3 p-3.5 rounded-xl bg-brand-surface border border-brand-border cursor-pointer select-none hover:border-party-pink transition-colors">
                  <input
                    type="checkbox"
                    checked={isOptedInCheckbox}
                    onChange={handleCheckboxChange}
                    className="w-5 h-5 rounded text-party-pink focus:ring-party-pink cursor-pointer shrink-0"
                  />
                  <span className="text-xs sm:text-sm font-extrabold text-brand-text">
                    I&apos;ve tapped &apos;Become a tester&apos; on Play Store
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* ================= STEP 3: JOIN THE FOUNDING PLAYERS GROUP ================= */}
          <div
            className={`p-6 rounded-2xl border-2 transition-all mb-8 ${
              progress === "playing"
                ? "bg-brand-bg/90 border-party-cyan/60 shadow-lg ring-2 ring-party-cyan/15"
                : "bg-brand-bg/20 border-brand-border/40 opacity-40 pointer-events-none"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-lilita text-lg sm:text-2xl text-brand-text uppercase tracking-tight">
                ③ Join the Founding Players group
              </h3>
              <span className="text-xs font-black text-party-cyan bg-party-cyan/10 px-2.5 py-1 rounded-full border border-party-cyan/20">
                Founders Circle
              </span>
            </div>

            <p className="text-xs sm:text-sm text-brand-muted font-medium mb-4 leading-relaxed">
              You&apos;re in. Join the private Founders WhatsApp — early deck
              drops, feature votes, and the Founding Player badge when we
              launch.
            </p>

            {progress === "playing" && (
              <div className="space-y-3">
                <a
                  href={WHATSAPP_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#25D366] hover:bg-[#22c55e] text-white font-lilita text-base sm:text-lg uppercase tracking-wider transition-colors shadow-lg"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Join the Founders WhatsApp</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-party-cyan/10 border border-party-cyan/25 text-xs text-brand-text">
                  <Award className="w-4 h-4 text-party-cyan shrink-0" />
                  <span className="font-bold text-brand-muted">
                    Optional but recommended. We send maybe 2 messages a week.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* TROUBLESHOOTING ACCORDION (COLLAPSED, BELOW STEPPER) */}
          <div className="rounded-2xl border border-brand-border bg-brand-bg/60 overflow-hidden">
            <div className="p-4 border-b border-brand-border font-lilita text-sm sm:text-base text-brand-text uppercase tracking-wide">
              Quick Troubleshooting Guide
            </div>

            <div className="divide-y divide-brand-border/60">
              {troubleshootingItems.map((item, idx) => {
                const isOpen = openTroubleshootIdx === idx;
                return (
                  <div key={idx} className="transition-all">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenTroubleshootIdx(isOpen ? null : idx)
                      }
                      className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-extrabold text-brand-text hover:text-party-orange transition-colors cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isOpen
                            ? "rotate-180 text-party-orange"
                            : "text-brand-muted"
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 text-xs text-brand-muted leading-relaxed font-medium"
                        >
                          {item.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
