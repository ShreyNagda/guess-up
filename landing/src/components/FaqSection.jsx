import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Is Guess Up completely free of ads?",
    a: "Yes! Unlike other charades apps that force 30-second unskippable video ads between rounds, Guess Up on Android is built for 100% uninterrupted party gameplay.",
  },
  {
    q: "Why should I test the app on Android instead of just using the web demo?",
    a: "While our web demo lets you preview sample cards, the full Guess Up experience is built exclusively for Android! Installing the Android app unlocks 60 FPS motion tilt sensing (nod down for points, tilt up to pass), forehead placement, 2-Team Battle mode, and custom deck creation.",
  },
  {
    q: "How does motion tilt detection work on Android?",
    a: "Guess Up uses your Android phone's built-in accelerometer and gyroscope. When held to your forehead, tilting down registers a Correct point, and tilting up passes to the next card — keeping your hands completely off the screen.",
  },
  {
    q: "What round timers and play modes are supported in the Android app?",
    a: "The Android app supports flexible round durations of 30, 45, 60, and 90 seconds, in both Solo Mode (quick casual rounds) and 2-Team Battle Mode (automatic score tracking for Team A vs Team B).",
  },
  {
    q: "How do I get early access to the Android app?",
    a: "Simply enter your Google Play email address on our playtester sign-up form! You'll receive an instant invitation link to join the official Google Play closed testing track.",
  },
];

export const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-8 sm:py-16 md:py-24 border-t border-border/40 relative" id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col gap-6 sm:gap-10">
        
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-black text-xs uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5" /> GOT QUESTIONS? WE’VE GOT ANSWERS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-text">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
        </div>

        {/* Accordion List */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl sm:rounded-3xl bg-surface-card border border-border backdrop-blur-md overflow-hidden transition-all shadow-card shadow-card-hover"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  className="w-full p-4 sm:p-6 text-left font-black text-xs sm:text-base text-text flex items-center justify-between gap-3 sm:gap-4 cursor-pointer hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${idx}`}
                      role="region"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-6 pb-6 text-xs sm:text-sm text-muted leading-relaxed border-t border-border/30 pt-4"
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
    </section>
  );
};
