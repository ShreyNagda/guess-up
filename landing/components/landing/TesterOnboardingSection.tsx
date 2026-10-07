"use client";

import React, { forwardRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  Smartphone,
  AlertTriangle,
  RefreshCw,
  Mail,
  ShieldCheck,
  Send,
  HelpCircle,
} from "lucide-react";
import QRCode from "qrcode";
import { Button } from "../ui/Button";

export const DEFAULT_GOOGLE_GROUP_URL =
  "https://groups.google.com/g/bujho-testers";
export const DEFAULT_PLAY_STORE_URL =
  "https://play.google.com/apps/testing/com.shreynagda.guess_up";

interface TesterOnboardingSectionProps {
  onConfirm?: () => void;
  googleGroupUrl?: string;
  playStoreUrl?: string;
  isHighlighted?: boolean;
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
      isHighlighted = false,
    },
    ref,
  ) => {
    // Step tracking state
    const [hasJoinedGroup, setHasJoinedGroup] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

    // Optional email subscription state
    const [email, setEmail] = useState<string>("");
    const [emailStatus, setEmailStatus] = useState<
      "idle" | "loading" | "success" | "error"
    >("idle");
    const [emailMessage, setEmailMessage] = useState<string>("");

    // Load persisted state
    useEffect(() => {
      try {
        const storedGroup = localStorage.getItem("bujho_joined_google_group");
        if (storedGroup === "true") {
          setHasJoinedGroup(true);
        }
        const storedEmail = localStorage.getItem("bujho_tester_email");
        if (storedEmail) {
          setEmail(storedEmail);
          setEmailStatus("success");
          setEmailMessage(`Registered: ${storedEmail}`);
        }
      } catch (err) {
        console.error("Failed to read localStorage:", err);
      }
    }, []);

    // Generate client-side QR Code for Play Store link
    useEffect(() => {
      QRCode.toDataURL(playStoreUrl, {
        width: 220,
        margin: 2,
        color: {
          dark: "#111827",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("Error generating QR Code:", err));
    }, [playStoreUrl]);

    // Handle Step 1: Open Google Group
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

    // Handle Step 2: Open Play Store
    const handleOpenPlayStore = () => {
      window.open(playStoreUrl, "_blank", "noopener,noreferrer");
    };

    // Copy link helper
    const handleCopyLink = async () => {
      try {
        await navigator.clipboard.writeText(playStoreUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    };

    // Reset steps
    const handleResetSteps = () => {
      setHasJoinedGroup(false);
      try {
        localStorage.removeItem("bujho_joined_google_group");
      } catch (err) {
        console.error("Failed to clear localStorage:", err);
      }
    };

    // Handle optional email registration
    const handleEmailSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setEmailStatus("error");
        setEmailMessage("Please enter a valid email address.");
        return;
      }

      setEmailStatus("loading");
      setEmailMessage("");

      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Playtester", email: cleanEmail }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setEmailStatus("success");
          setEmailMessage(`Saved: ${cleanEmail}`);
          try {
            localStorage.setItem("bujho_tester_email", cleanEmail);
          } catch (e) {}
        } else {
          setEmailStatus("error");
          setEmailMessage(data.error || "Failed to save email.");
        }
      } catch (err: any) {
        setEmailStatus("error");
        setEmailMessage("Network error. Please try again.");
      }
    };

    return (
      <section
        ref={ref}
        id="tester-onboarding"
        className="py-16 md:py-24 bg-transparent transition-colors duration-300 relative scroll-mt-16"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`relative overflow-hidden p-6 sm:p-10 rounded-3xl shadow-2xl border-2 transition-all duration-300 backdrop-blur-xl ${
              isHighlighted
                ? "border-party-orange ring-4 ring-party-orange/30 shadow-party-orange/20"
                : "border-brand-border"
            }`}
          >
            {/* Header Badge & Title */}
            <div className="text-center sm:text-left max-w-3xl mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-party-orange/15 text-party-orange text-xs font-black uppercase tracking-wider mb-3 border border-party-orange/30 shadow-xs">
                <Users className="w-3.5 h-3.5" />
                <span>Google Play Closed Beta Access</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-lilita font-black text-brand-text leading-tight mb-2">
                Join the Bujho Testers 🎉
              </h2>
              <p className="font-manrope text-sm sm:text-base text-brand-muted font-bold leading-relaxed">
                Because Bujho is in private testing on Google Play, Google
                requires you to join our official Google Group before allowing
                you to download.
              </p>
            </div>

            {/* MANDATORY REQUIREMENT EXPLANATION ALERT */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-brand-text flex items-start gap-3.5 mb-8 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm">
                <p className="font-extrabold text-amber-500 uppercase tracking-wide">
                  Crucial: You Must Join Google Group in Step 1
                </p>
                <p className="text-brand-muted leading-relaxed font-medium">
                  Google Play strictly restricts private beta apps to verified
                  group members. If you skip Step 1 and go straight to Google
                  Play, Google will display an error:{" "}
                  <strong className="text-brand-text">
                    &quot;A testing version hasn&apos;t been published yet or
                    isn&apos;t available.&quot;
                  </strong>
                </p>
              </div>
            </div>

            {/* Main Interactive Grid: 2 Steps on Left, QR + Preview on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: The 2 Core Steps (lg:col-span-7) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-brand-muted px-1">
                  <span>How it works (2 Simple Steps)</span>
                  {hasJoinedGroup && (
                    <button
                      type="button"
                      onClick={handleResetSteps}
                      className="inline-flex items-center gap-1 text-[11px] text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset Steps</span>
                    </button>
                  )}
                </div>

                {/* STEP 1: Join Google Group */}
                <div
                  className={`p-5 rounded-2xl border-2 transition-all space-y-3.5 ${
                    hasJoinedGroup
                      ? "bg-emerald-500/10 border-emerald-500/40 shadow-xs"
                      : "bg-brand-bg/90 border-party-orange/50 shadow-md ring-2 ring-party-orange/15"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-8 h-8 rounded-xl font-lilita font-black text-sm flex items-center justify-center shrink-0 shadow-xs ${
                          hasJoinedGroup
                            ? "bg-emerald-500 text-white"
                            : "bg-party-orange text-white"
                        }`}
                      >
                        {hasJoinedGroup ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          "1"
                        )}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm sm:text-base text-brand-text">
                            Step 1: Join Official Google Group
                          </h3>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-party-orange/20 text-party-orange">
                            Required
                          </span>
                        </div>
                        <p className="text-xs text-brand-muted font-medium mt-1 leading-relaxed">
                          Tap the button below to open Google Group. Log in with
                          your Google account and tap{" "}
                          <strong className="text-brand-text">
                            &quot;Join group&quot;
                          </strong>
                          .
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant={hasJoinedGroup ? "outline" : "primary"}
                    size="md"
                    onClick={handleJoinGroup}
                    className={`w-full font-lilita text-sm sm:text-base uppercase tracking-wider py-3.5 justify-center shadow-md ${
                      hasJoinedGroup
                        ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/5!"
                        : ""
                    }`}
                  >
                    {hasJoinedGroup ? (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>✓ Step 1 Completed (Re-open Group)</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>1. Join Google Group (Takes 5s) →</span>
                        <ExternalLink className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </div>

                {/* STEP 2: Download on Google Play Store */}
                <div
                  className={`p-5 rounded-2xl border-2 transition-all space-y-3.5 ${
                    hasJoinedGroup
                      ? "bg-party-pink/10 border-party-pink/40 shadow-lg ring-2 ring-party-pink/20"
                      : "bg-brand-bg/60 border-brand-border/60 opacity-85"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl font-lilita font-black text-sm flex items-center justify-center shrink-0 shadow-xs ${
                        hasJoinedGroup
                          ? "bg-party-pink text-white"
                          : "bg-brand-muted/30 text-brand-muted"
                      }`}
                    >
                      2
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm sm:text-base text-brand-text">
                          Step 2: Download on Google Play Store
                        </h3>
                        {hasJoinedGroup && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                            Ready
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-brand-muted font-medium mt-1 leading-relaxed">
                        Once you&apos;ve joined the group, open the Play Store
                        invite link. Tap{" "}
                        <strong className="text-party-orange">
                          &quot;BECOME A TESTER&quot;
                        </strong>{" "}
                        and download Bujho!
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={handleOpenPlayStore}
                      className={`flex-1 font-lilita text-sm sm:text-base uppercase tracking-wider py-3.5 justify-center shadow-lg ${
                        hasJoinedGroup
                          ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-400"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>2. Download on Play Store 🚀</span>
                        <ExternalLink className="w-4 h-4" />
                      </span>
                    </Button>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-surface hover:bg-brand-card border-2 border-brand-border text-brand-text font-lilita text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-brand-muted" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Optional Email Registration for Release Notifications */}
                <div className="p-4 rounded-2xl bg-brand-bg/60 border border-brand-border text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-brand-text flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-party-orange" />
                      <span>
                        Want Email Updates &amp; Build Releases? (Optional)
                      </span>
                    </span>
                    <span className="text-[10px] text-brand-muted font-bold">
                      No spam
                    </span>
                  </div>

                  {emailStatus === "success" ? (
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-bold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{emailMessage}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEmailStatus("idle")}
                        className="text-[11px] underline text-brand-muted hover:text-brand-text cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleEmailSubmit} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email for notifications"
                        className="flex-1 px-3.5 py-2.5 bg-brand-surface text-brand-text border border-brand-border rounded-xl text-xs focus:outline-none focus:border-party-orange transition-all font-medium placeholder-brand-muted"
                      />
                      <Button
                        type="submit"
                        variant="secondary"
                        size="sm"
                        isLoading={emailStatus === "loading"}
                        className="font-bold text-xs shrink-0"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        <span>Save</span>
                      </Button>
                    </form>
                  )}
                  {emailStatus === "error" && (
                    <p className="text-[11px] text-rose-400 font-medium">
                      {emailMessage}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Visual Preview & Desktop QR Code (lg:col-span-5) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Visual Screenshot of Play Store Button */}
                <div className="p-4 rounded-2xl bg-brand-bg/70 border border-brand-border text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-muted">
                    <HelpCircle className="w-3.5 h-3.5 text-party-orange" />
                    <span>What to look for on Google Play</span>
                  </div>

                  <div className="rounded-xl border-2 border-brand-border bg-white p-2.5 shadow-sm overflow-hidden flex items-center justify-center">
                    <img
                      src="/images/play_invite_screenshot.png"
                      alt="Google Play Become a Tester screenshot preview"
                      className="w-full h-auto object-contain max-h-52 rounded-lg"
                    />
                  </div>

                  <p className="text-[11px] text-brand-muted italic font-medium">
                    Tap the blue{" "}
                    <strong className="text-party-orange">
                      &quot;BECOME A TESTER&quot;
                    </strong>{" "}
                    button to unlock download.
                  </p>
                </div>

                {/* Desktop QR Code */}
                <div className="p-4 rounded-2xl bg-brand-bg/70 border border-brand-border text-center flex flex-col items-center space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-party-cyan">
                    <QrCode className="w-4 h-4" />
                    <span>Scan on Mobile</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl shadow-sm border border-brand-border max-w-[170px] aspect-square flex items-center justify-center">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="Bujho Play Store QR Code"
                        className="w-full h-full object-contain rounded-md"
                      />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center text-xs text-neutral-400">
                        Generating QR...
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-brand-muted font-medium max-w-xs">
                    Visiting on computer? Scan with your Android camera after
                    joining the group.
                  </p>
                </div>

                {/* iPhone Note */}
                <div className="p-3 rounded-xl bg-brand-surface border border-brand-border text-[11px] text-brand-muted font-medium">
                  🍏 <strong className="text-brand-text">iPhone user?</strong>{" "}
                  iOS version is in active development. Enter your email on the
                  left to be first on the TestFlight list!
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  },
);

TesterOnboardingSection.displayName = "TesterOnboardingSection";
