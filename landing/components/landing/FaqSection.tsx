"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: "Is Bujho completely free of ads?",
      answer:
        "Yes! Unlike other charades apps that force 30-second unskippable video ads between rounds, Bujho is built for 100% uninterrupted party gameplay with zero ad popups.",
    },
    {
      question: "How does motion tilt detection work on mobile?",
      answer:
        "Bujho utilizes your phone's built-in accelerometer and gyroscope. When held to your forehead facing your friends, tilting down registers a Correct point (+1) and tilting up passes to the next card.",
    },
    {
      question: "Can I play Bujho offline without Wi-Fi?",
      answer:
        "Absolutely! All built-in decks and custom decks work 100% offline once downloaded initially. You can play on road trips, beaches, or remote hostel hangouts without needing mobile data or Wi-Fi.",
    },
    {
      question: "Is Bujho coming to iOS / iPhone?",
      answer:
        "The Android app is currently in early access beta playtesting. iOS (iPhone) development is actively underway, and early waitlist members will get first access when the iOS build goes live.",
    },
    {
      question: "Can I create my own custom secret word decks?",
      answer:
        "Yes! Bujho features a built-in Custom Deck Studio where you can easily type, save, and play custom secret decks filled with inside jokes, family names, or custom trivia.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="py-16 md:py-24 bg-brand-surface transition-colors duration-300"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header with subtle fade-in */}
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
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-brand-muted font-medium">
            Everything you need to know about tilt gestures, offline play,
            ad-free policy, and release builds.
          </p>
        </motion.div>

        {/* Accordion List with subtle animation */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="rounded-2xl bg-brand-bg/60 border border-brand-border overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-button-${idx}`}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-extrabold text-brand-text text-base sm:text-lg hover:text-brand-primary transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform duration-300 text-brand-muted ${
                      isOpen ? "rotate-180 text-brand-primary" : ""
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
                      <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-brand-muted font-medium leading-relaxed border-t border-brand-border pt-4">
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
