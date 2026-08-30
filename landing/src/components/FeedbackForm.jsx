import React, { useState } from "react";
import { motion } from "motion/react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export const FeedbackForm = () => {
  const [email, setEmail] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !feedbackText.trim()) {
      setError("Please enter your email and your feedback.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    const payload = {
      email: email.trim().toLowerCase(),
      feedbackText: feedbackText.trim(),
      createdAt: serverTimestamp(),
      submittedAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "feedback"), payload);
      setIsSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      console.warn("Firestore write fallback for feedback:", err);
      try {
        const local = JSON.parse(
          localStorage.getItem("guessup_feedback") || "[]"
        );
        local.push(payload);
        localStorage.setItem("guessup_feedback", JSON.stringify(local));
      } catch (_) {}
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div
      className="h-full flex flex-col justify-between bg-surface-light dark:bg-surface-dark border-3 border-border-light dark:border-border-dark p-6 sm:p-8 rounded-3xl shadow-xl"
      id="feedback"
    >
      <div className="flex-1 flex flex-col justify-between">
        <div className="text-center max-w-xl mx-auto mb-6 flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest font-black text-primary inline-flex items-center justify-center gap-1.5">
            <MessageSquare className="w-4 h-4" /> Feedback
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
            Send Us Feedback
          </h2>
          <p className="text-muted-light dark:text-muted-dark text-xs sm:text-sm">
            Have suggestions, deck ideas, or bug reports? Leave your thoughts!
          </p>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8"
          >
            <div className="w-14 h-14 rounded-full bg-success/20 border-2 border-success flex items-center justify-center text-success">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black">Thank You!</h3>
            <p className="text-muted-light dark:text-muted-dark text-xs max-w-xs">
              We've received your note from **{email}**.
            </p>
            <button
              onClick={() => {
                setEmail("");
                setFeedbackText("");
                setSubmitted(false);
              }}
              className="mt-2 px-5 py-2 rounded-xl bg-primary text-accent font-black text-xs hover:scale-105 transition-all cursor-pointer shadow-md"
            >
              Send Another Note
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-4 my-auto">
              {error && (
                <div className="p-3 rounded-xl bg-error/15 border border-error/40 text-error text-xs font-bold">
                  {error}
                </div>
              )}

              {/* Field 1: Email */}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-dark" />
                <input
                  type="email"
                  placeholder="Your Email Address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-surface-card-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark text-sm font-semibold outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Field 2: Single Feedback Textbox */}
              <div className="flex flex-col gap-2">
                <textarea
                  rows={3}
                  placeholder="Write your feedback, suggestions, or bug reports... *"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-surface-card-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark text-sm font-semibold outline-none focus:border-primary transition-all resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-primary text-accent font-black text-sm hover:scale-101 active:scale-99 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-auto"
            >
              {isSubmitting ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Feedback
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
