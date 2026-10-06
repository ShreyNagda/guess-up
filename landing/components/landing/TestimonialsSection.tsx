"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Flame, MessageSquarePlus } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/Button";
import { getFeedbackFromFirestore, FeedbackEntry } from "../../lib/firestore";

const defaultTestimonials: FeedbackEntry[] = [
  {
    name: "Aarav Sharma",
    role: "House Party Host",
    rating: 5,
    feedback:
      "The Bollywood Buff deck had our entire house party screaming dialogues at 2 AM! The fact that there are ZERO ad breaks mid-game makes it a total gamechanger.",
  },
  {
    name: "Priya Nair",
    role: "Hostel Game Organizer",
    rating: 5,
    feedback:
      "We played Cricket Fever during the IPL finals hangout. Tilt motion sensing worked flawlessly on my phone with zero lag. Absolute crowd favorite for hostel nights!",
  },
  {
    name: "Rohan Gupta",
    role: "College Reunion Crew",
    rating: 5,
    feedback:
      "Custom deck builder is crazy! We created a secret deck filled with inside college jokes and old memories. Best icebreaker app hands down.",
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] =
    useState<FeedbackEntry[]>(defaultTestimonials);

  useEffect(() => {
    async function fetchRealFeedback() {
      try {
        const firestoreFeedback = await getFeedbackFromFirestore();
        if (firestoreFeedback && firestoreFeedback.length > 0) {
          setTestimonials(firestoreFeedback.slice(0, 6));
        }
      } catch (e) {
        console.warn("Using default testimonials fallback:", e);
      }
    }

    fetchRealFeedback();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-brand-bg relative overflow-hidden transition-colors duration-300">
      {/* Background glow effects */}
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-party-pink/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-party-orange/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-party-pink/15 text-party-pink text-xs font-black uppercase tracking-wider mb-4 border border-party-pink/30 shadow-md">
            <Flame className="w-4 h-4 text-party-pink fill-party-pink" />
            <span>REAL PLAYER REVIEWS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-lilita font-black text-brand-text tracking-tight uppercase mb-4">
            House Party Highlights
          </h2>
          <p className="text-base sm:text-xl text-brand-muted font-bold leading-relaxed mb-6">
            Real feedback from house party hosts, college crews, and midnight
            charades champions.
          </p>

          <Link href="/feedback">
            <Button
              variant="secondary"
              size="md"
              className="gap-2 text-xs uppercase font-extrabold border-2 border-party-pink/30 hover:bg-party-pink/10"
            >
              <MessageSquarePlus className="w-4 h-4 text-party-pink" />
              <span>Share Your Feedback</span>
            </Button>
          </Link>
        </motion.div>

        {/* Clean Testimonials Cards Grid displaying ONLY Name, Role, Rating & Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.12 }}
              whileHover={{ y: -6 }}
              className="rounded-3xl p-6 bg-brand-surface border-2 border-brand-border shadow-xl relative flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Header: Name, Role & Star Rating */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-brand-border gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-party-pink/20 to-party-orange/20 border border-party-orange/30 flex items-center justify-center font-lilita font-black text-sm text-brand-text shrink-0 shadow-xs">
                      {getInitials(item.name)}
                    </div>
                    <div>
                      <h3 className="text-base font-lilita font-black text-brand-text leading-tight uppercase">
                        {item.name}
                      </h3>
                      <span className="text-xs font-bold text-brand-muted block">
                        {item.role}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex text-[#FFD600] shrink-0 pt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < item.rating
                            ? "fill-current text-[#FFD600]"
                            : "text-brand-muted/30 fill-none"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Feedback Quote Text */}
                <p className="text-sm sm:text-base text-brand-text font-bold leading-relaxed">
                  "{item.feedback}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
