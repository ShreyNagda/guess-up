"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqSection() {
  // All answers collapsed by default as required
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FaqItem[] = [
    {
      question: "Is Bujho really free?",
      answer: "Yes, and no ads ever. No subscriptions, no paywalled decks, and no video interruptions between rounds.",
    },
    {
      question: "Does it work without internet?",
      answer: "Fully offline. Once downloaded, you can play on flights, road trips, remote house parties, or beaches without Wi-Fi or data.",
    },
    {
      question: "What's the catch with early access?",
      answer: "Nothing. You get the game first, plus a Founding Player badge when we launch publicly.",
    },
    {
      question: "What Android version do I need?",
      answer: "Android 8.0 and above. Any modern Android phone with tilt sensors (accelerometer) runs it smoothly at 60 FPS.",
    },
    {
      question: "How long is early access?",
      answer: "Until we launch publicly. Usually a few weeks.",
    },
    {
      question: "Can I play on iPhone?",
      answer: "Not yet — drop your email below for the iOS waitlist.",
    },
    {
      question: "Why do I need to join a group to get access?",
      answer: "Google Play's early-access system works this way. It's a one-tap step — takes 10 seconds. Guide below.",
    },
    {
      question: "I joined but Play Store says it's not available.",
      answer: "Two common reasons: (1) Google takes 5–10 minutes to sync your spot — try again in a bit. (2) Make sure you're signed into the same Google account you used to join. Details in the guide below.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="py-16 md:py-24 bg-transparent transition-colors duration-300 scroll-mt-16"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 text-brand-text text-xs font-bold uppercase tracking-wider mb-3 border border-brand-border">
            <HelpCircle className="w-3.5 h-3.5 text-brand-primary fill-brand-primary/20" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-lilita font-black text-brand-text tracking-tight mb-4 uppercase">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-brand-muted font-bold">
            Everything you need to know about early access, offline play, and getting the app.
          </p>
        </motion.div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="rounded-2xl bg-brand-surface/80 border border-brand-border overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-button-${idx}`}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-brand-text text-sm sm:text-base hover:text-party-orange transition-colors cursor-pointer select-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform duration-300 text-brand-muted ${
                      isOpen ? "rotate-180 text-party-orange" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${idx}`}
                      role="region"
                      aria-labelledby={`faq-button-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 text-xs sm:text-sm text-brand-muted font-medium leading-relaxed border-t border-brand-border/60 pt-3.5">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
