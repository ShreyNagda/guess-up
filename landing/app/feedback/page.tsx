"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  ArrowLeft,
  Send,
  CheckCircle2,
  MessageSquareHeart,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { UserFeedback } from "@/models/feedback";

export default function FeedbackPage() {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [nameText, setNameText] = useState<string>("");
  const [roleText, setRoleText] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const ratingLabels: Record<number, string> = {
    1: "Needs Improvement 😕",
    2: "It's Okay 😐",
    3: "Good Experience 🙂",
    4: "Loved Playing! 😄",
    5: "Absolute Game-Changer! 🔥",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!feedbackText.trim() || !nameText.trim() || !roleText.trim()) {
      setErrorMessage("Please complete all three fields before submitting.");
      return;
    }

    setIsLoading(true);

    const payload: UserFeedback = {
      rating,
      feedback: feedbackText.trim(),
      name: nameText.trim(),
      role: roleText.trim(),
    };

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit feedback.");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col justify-between transition-colors duration-300">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-50 w-full bg-brand-surface/90 backdrop-blur-md border-b border-brand-border transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/images/bujho-icon.png"
              alt="Bujho Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-contain shadow-xs border border-brand-border group-hover:scale-105 transition-transform"
            />
            <span className="font-black text-lg text-brand-text tracking-tight uppercase">
              Bujho
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-black text-brand-muted hover:text-brand-text transition-colors px-3 py-1.5 rounded-full border border-brand-border hover:bg-brand-surface"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Feedback Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-10 sm:py-16 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="feedback-form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="p-6 sm:p-10 rounded-3xl bg-brand-surface border-2 border-brand-primary/20 shadow-2xl transition-all"
            >
              {/* Header Title */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-black uppercase tracking-wider mb-3 border border-brand-primary/30">
                  <MessageSquareHeart className="w-4 h-4 fill-brand-primary" />
                  <span>Player Feedback</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-brand-text tracking-tight mb-2">
                  Share Your Experience
                </h1>
                <p className="text-sm text-brand-muted font-medium max-w-md mx-auto">
                  How was your party game session with Bujho? Your feedback
                  helps us shape future decks and features!
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold text-center">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* FIELD 1: Star Rating */}
                <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-brand-bg/60 border border-brand-border">
                  <label className="text-xs font-extrabold text-brand-muted uppercase tracking-wider">
                    Field 1: Rating (1 to 5 Stars)
                  </label>

                  <div className="flex items-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const activeStar =
                        (hoverRating !== null ? hoverRating : rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                          aria-label={`Rate ${star} star`}
                        >
                          <Star
                            className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                              activeStar
                                ? "fill-brand-primary text-brand-primary drop-shadow-[0_0_10px_rgba(229,158,0,0.4)]"
                                : "fill-brand-muted/20 text-brand-muted/40"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-xs font-black text-brand-primary tracking-wide min-h-5">
                    {ratingLabels[hoverRating !== null ? hoverRating : rating]}
                  </span>
                </div>
                {/* FIELD 2: Name & FIELD 3: Role / Bio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="name-input"
                      className="block text-xs font-extrabold text-brand-text uppercase tracking-wider"
                    >
                      Your Name
                    </label>
                    <input
                      id="name-input"
                      type="text"
                      value={nameText}
                      onChange={(e) => setNameText(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      required
                      className="w-full px-4 py-3 text-sm font-medium rounded-2xl bg-brand-bg border border-brand-border text-brand-text focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="role-input"
                      className="block text-xs font-extrabold text-brand-text uppercase tracking-wider"
                    >
                      Your Role / Bio
                    </label>
                    <input
                      id="role-input"
                      type="text"
                      value={roleText}
                      onChange={(e) => setRoleText(e.target.value)}
                      placeholder="e.g. House Party Host, College Student"
                      required
                      className="w-full px-4 py-3 text-sm font-medium rounded-2xl bg-brand-bg border border-brand-border text-brand-text focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    />
                  </div>
                </div>

                {/* FIELD 4: Actual Feedback */}
                <div className="space-y-2">
                  <label
                    htmlFor="feedback-input"
                    className="block text-xs font-extrabold text-brand-text uppercase tracking-wider"
                  >
                    Your Detailed Feedback
                  </label>
                  <textarea
                    id="feedback-input"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={4}
                    placeholder="Tell us what you loved about Bujho, favorite decks, or suggestions to make your game nights even more awesome..."
                    required
                    className="w-full px-4 py-3 text-sm font-medium rounded-2xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none  focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none"
                  />
                </div>

                {/* Submit Action Button */}
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isLoading}
                  type="submit"
                  className="mt-4 shadow-lg shadow-brand-primary/20"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Send className="w-4 h-4 text-current" />
                    <span>Submit Feedback</span>
                  </div>
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="p-8 sm:p-12 rounded-3xl bg-brand-surface border-2 border-brand-primary/40 shadow-2xl text-center flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center mb-6 border border-brand-primary/40 shadow-xl shadow-brand-primary/10">
                <CheckCircle2 className="w-12 h-12 text-brand-primary fill-brand-primary/20" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-black uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 fill-brand-primary text-brand-primary" />
                <span>Feedback Received</span>
              </div>

              <h2 className="text-3xl font-black text-brand-text tracking-tight mb-3">
                Thank You, {nameText}!
              </h2>

              <p className="text-sm text-brand-muted font-medium max-w-md mx-auto mb-8 leading-relaxed">
                Your feedback has been saved successfully. We appreciate your
                insights in helping make Bujho the ultimate party charades
                game!
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Link href="/" className="w-full sm:w-auto">
                  <Button variant="primary" size="md" className="w-full">
                    Return to Home Page
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFeedbackText("");
                    setNameText("");
                    setRoleText("");
                    setRating(5);
                  }}
                  className="w-full sm:w-auto"
                >
                  Submit Another Feedback
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Page Footer */}
      <footer className="py-6 text-center text-xs text-brand-muted font-bold border-t border-brand-border">
        <span>Bujho • Party Charades Feedback</span>
      </footer>
    </div>
  );
}
