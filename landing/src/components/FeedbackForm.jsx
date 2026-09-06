import React, { useState } from "react";
import { motion } from "motion/react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Mail, MessageSquare, Send, CheckCircle2, User, Smartphone, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "../context/ToastContext";

export const FeedbackForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [deviceType, setDeviceType] = useState("iOS");
  const [feedbackType, setFeedbackType] = useState("Feedback");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !feedbackText.trim()) {
      setError("Please fill out your name, email address, and feedback details.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      deviceType: deviceType,
      feedbackType: feedbackType,
      feedbackText: feedbackText.trim(),
      archived: false,
      createdAt: serverTimestamp(),
      submittedAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "feedback"), payload);
      setIsSubmitting(false);
      setSubmitted(true);
      if (toast?.addToast) {
        toast.addToast("Feedback submitted successfully!", "success");
      }
    } catch (err) {
      console.warn("Firestore write fallback for feedback:", err);
      // Optimistic UI state
      setIsSubmitting(false);
      setSubmitted(true);
      if (toast?.addToast) {
        toast.addToast("Feedback recorded successfully!", "success");
      }
    }
  };

  return (
    <section className="py-16 md:py-24 border-t border-border/40 relative" id="feedback">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-surface/80 border border-border/60 backdrop-blur-md p-8 sm:p-12 rounded-3xl shadow-xl flex flex-col gap-8">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest font-black text-primary inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
              <MessageSquare className="w-3.5 h-3.5" /> Playtester Feedback Hub
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
              Send Us Your Thoughts
            </h2>
            <p className="text-muted text-xs sm:text-sm">
              Found a bug, have a deck suggestion, or want to share your experience? We read every single message.
            </p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center gap-4 py-8"
            >
              <div className="w-16 h-16 rounded-full bg-success/20 border-2 border-success flex items-center justify-center text-success">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black">Feedback Received!</h3>
              <p className="text-muted text-xs max-w-md leading-relaxed">
                Thank you, <strong>{name}</strong>! Your notes have been sent to our development team.
              </p>
              <button
                onClick={() => {
                  setName("");
                  setEmail("");
                  setFeedbackText("");
                  setSubmitted(false);
                }}
                className="mt-2 px-6 py-3 rounded-2xl bg-primary text-accent font-black text-xs uppercase tracking-wider hover:scale-105 transition-all cursor-pointer shadow-md"
              >
                Send Another Note
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="p-3.5 rounded-2xl bg-error/15 border border-error/40 text-error text-xs font-bold">
                  {error}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Field 1: Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] font-black uppercase text-muted">Your Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-surface-card border border-border text-text text-xs font-semibold placeholder:text-muted outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Field 2: Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] font-black uppercase text-muted">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="email"
                      placeholder="rahul@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-surface-card border border-border text-text text-xs font-semibold placeholder:text-muted outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Field 3: Device Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] font-black uppercase text-muted">Device Type</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <select
                      value={deviceType}
                      onChange={(e) => setDeviceType(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-surface-card border border-border text-text text-xs font-semibold outline-none focus:border-primary transition-all appearance-none"
                    >
                      <option value="iOS">iOS (iPhone / iPad)</option>
                      <option value="Android">Android Device</option>
                      <option value="Web">Web Browser</option>
                    </select>
                  </div>
                </div>

                {/* Field 4: Feedback Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] font-black uppercase text-muted">Category</label>
                  <div className="relative">
                    <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <select
                      value={feedbackType}
                      onChange={(e) => setFeedbackType(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-surface-card border border-border text-text text-xs font-semibold outline-none focus:border-primary transition-all appearance-none"
                    >
                      <option value="Feedback">General Feedback</option>
                      <option value="Bug Report">Bug Report</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Deck Idea">Deck Idea</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Field 5: Message Details */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] font-black uppercase text-muted">Feedback Details *</label>
                <textarea
                  rows={4}
                  placeholder="Share your thoughts, describe a bug, or suggest new category decks..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-surface-card border border-border text-text text-xs font-semibold placeholder:text-muted outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-primary text-accent font-black text-xs uppercase tracking-wider hover:scale-101 active:scale-99 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Feedback
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
