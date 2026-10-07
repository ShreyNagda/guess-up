"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";
import { FORMSPREE_ENDPOINT } from "@/lib/config";

export function IosWaitlistSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      // 1. Try sending to Formspree endpoint if configured
      let formspreeSuccess = false;
      if (FORMSPREE_ENDPOINT && FORMSPREE_ENDPOINT.includes("formspree.io")) {
        try {
          const res = await fetch(FORMSPREE_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              email: cleanEmail,
              platform: "iOS TestFlight",
            }),
          });
          if (res.ok) formspreeSuccess = true;
        } catch (e) {
          console.warn("Formspree submit fallback to internal API:", e);
        }
      }

      // 2. Also save to internal Firestore waitlist endpoint as a guarantee
      try {
        await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "iOS Waitlist Lead",
            email: cleanEmail,
          }),
        });
      } catch (e) {
        console.warn("Internal waitlist backup error:", e);
      }

      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="py-12 md:py-16 bg-transparent transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-6 sm:p-10 rounded-3xl bg-brand-surface border-2 border-brand-border text-center shadow-xl space-y-6"
        >
          {/* Header */}
          <div className="max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-party-cyan/10 text-party-cyan text-xs font-black uppercase tracking-wider border border-party-cyan/25">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Apple TestFlight</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-lilita font-black text-brand-text uppercase tracking-tight">
              iPhone user? Get in line.
            </h2>
            <p className="text-xs sm:text-base text-brand-muted font-bold leading-relaxed">
              Bujho is landing on iOS soon. Drop your email and we&apos;ll send
              your TestFlight invite the moment it&apos;s ready.
            </p>
          </div>

          {/* Form / Success State */}
          <div className="max-w-md mx-auto">
            {status === "success" ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>You&apos;re on the list. Watch your inbox ✌️</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 bg-brand-bg text-brand-text border-2 border-brand-border rounded-full focus:outline-none transition-all text-sm font-bold shadow-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={status === "loading"}
                    className="font-lilita text-sm uppercase tracking-wider py-3 px-6 shadow-md shrink-0"
                  >
                    <span>Notify Me</span>
                  </Button>
                </div>

                {status === "error" && (
                  <p className="text-xs text-rose-400 font-bold">
                    {errorMessage}
                  </p>
                )}
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
