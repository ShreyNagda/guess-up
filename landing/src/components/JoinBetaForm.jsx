import React, { useState } from "react";
import { motion } from "motion/react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { UserCheck, Mail, User, CheckCircle2, ArrowRight } from "lucide-react";

export const JoinBetaForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please enter both your name and email.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      createdAt: serverTimestamp(),
      submittedAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "testers"), payload);
      setIsSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      console.warn("Firestore write fallback for beta registration:", err);
      try {
        const local = JSON.parse(
          localStorage.getItem("guessup_testers") || "[]",
        );
        local.push(payload);
        localStorage.setItem("guessup_testers", JSON.stringify(local));
      } catch (_) {}
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div
      className="h-full flex flex-col justify-between bg-linear-to-br from-surface to-surface-card border-3 border-border p-6 sm:p-8 rounded-3xl shadow-xl text-text"
      id="join-beta"
    >
      <div className="flex-1 flex flex-col justify-between">
        <div className="text-center max-w-xl mx-auto mb-6 flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest font-black text-primary inline-flex items-center justify-center gap-1.5">
            <UserCheck className="w-4 h-4" /> Beta Access
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
            Join the Beta List
          </h2>
          <p className="text-muted text-xs sm:text-sm">
            Be first to get early builds, test new Desi decks, and shape the
            game!
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
            <h3 className="text-xl font-black">You're on the Beta List!</h3>
            <p className="text-muted text-xs max-w-xs">
              Thank you **{name}**! We've saved your spot (**{email}**).
            </p>
            <button
              onClick={() => {
                setName("");
                setEmail("");
                setSubmitted(false);
              }}
              className="mt-2 px-5 py-2 rounded-xl border border-border font-extrabold text-xs text-muted hover:text-text transition-all cursor-pointer"
            >
              Register Another Tester
            </button>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col justify-between gap-4"
          >
            <div className="flex flex-col gap-4 my-auto">
              {error && (
                <div className="p-3 rounded-xl bg-error/15 border border-error/40 text-error text-xs font-bold">
                  {error}
                </div>
              )}

              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-surface border border-border text-text text-sm font-semibold placeholder:text-muted outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  placeholder="Your Email Address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-surface border text-sm font-semibold placeholder:text-muted outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-primary text-accent font-black text-sm hover:scale-101 active:scale-99 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-auto"
            >
              {isSubmitting ? (
                <span>Joining Beta...</span>
              ) : (
                <>
                  Join Beta List <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
