"use client";

import React, { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  Sparkles,
  Smartphone,
} from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { addTesterToFirestore } from "../../lib/firestore";

export const WaitlistForm = forwardRef<HTMLDivElement>((props, ref) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validate = () => {
    let isValid = true;
    setNameError("");
    setEmailError("");

    if (!name.trim()) {
      setNameError("Please enter your name.");
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Please enter your email.");
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
      } else {
        if (data.alreadyRegistered || res.status === 409) {
          setStatus("error");
          setErrorMessage(
            data.error || "This email is already registered for early access!",
          );
          return;
        }
        // Fallback to direct client firestore call if server API fails
        const fallbackRes = await addTesterToFirestore(name, email);
        if (fallbackRes.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(
            fallbackRes.error ||
              data.error ||
              "Something went wrong. Please try again.",
          );
        }
      }
    } catch (err) {
      console.error("Waitlist submit error:", err);
      // Fallback to client firestore call
      try {
        const fallbackRes = await addTesterToFirestore(name, email);
        if (fallbackRes.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(
            fallbackRes.error || "Something went wrong. Please try again.",
          );
        }
      } catch (fallbackErr) {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <section
      ref={ref}
      id="waitlist-section"
      className="relative py-16 md:py-24 transition-colors duration-300 overflow-hidden"
    >
      {/* Ambient background yellow glow
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-120 h-120 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none -z-10" /> */}

      <div className="max-w-xl mx-auto px-4 sm:px-6y">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden p-6 sm:p-10 rounded-3xl shadow-2xl transition-all border-2 border-brand-primary/10"
        >
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-8 text-center flex flex-col items-center justify-center"
              >
                <div className="w-20 h-20 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center mb-4 border border-brand-primary/40 shadow-lg shadow-brand-primary/10">
                  <CheckCircle2 className="w-12 h-12 text-brand-primary" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-text mb-2">
                  You're on the Priority List!
                </h3>
                <p className="text-base text-brand-muted font-medium max-w-sm">
                  We'll email you once the next early access build goes live.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase px-4 py-1.5 rounded-full bg-linear-to-r from-party-pink/15 to-party-orange/15 text-party-orange mb-3 border border-party-orange/30 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-party-orange" />
                    <span>PRIORITY ANDROID EARLY ACCESS</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-brand-text uppercase tracking-tight mb-2">
                    Join the Chaos - Get Early Access!
                  </h2>
                  <p className="text-sm sm:text-base text-brand-muted font-bold">
                    Join early playtesters getting priority Android beta
                    invites, exclusive custom pop-culture decks, and zero ad
                    interruptions.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Name"
                    id="waitlist-name-input"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={nameError}
                    icon={<User className="w-4 h-4 text-party-orange" />}
                    disabled={status === "loading"}
                  />

                  <Input
                    label="Email"
                    id="waitlist-email-input"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={emailError}
                    icon={<Mail className="w-4 h-4 text-party-pink" />}
                    disabled={status === "loading"}
                  />

                  {status === "error" && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-pass/10 text-brand-pass text-xs font-bold border border-brand-border">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={status === "loading"}
                    className="mt-4 text-xs sm:text-base md:text-lg font-black uppercase tracking-wider py-4 px-4 whitespace-nowrap shadow-xl shadow-party-orange/25 hover:scale-105 transition-transform"
                  >
                    <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                      <Smartphone className="w-5 h-5 text-current shrink-0" />
                      <span>Get the Party Started</span>
                    </div>
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
});

WaitlistForm.displayName = "WaitlistForm";
