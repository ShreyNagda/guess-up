"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote, Heart, MessageSquarePlus } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/Button";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
  highlightDeck: string;
}

export function TestimonialsSection() {
  const testimonials: Testimonial[] = [
    {
      quote:
        "The Bollywood Buff deck had our entire house party screaming dialogues! The fact that there are zero ad breaks mid-game makes it 100x better than other charades apps.",
      author: "Aarav Sharma",
      role: "House Party Host, Mumbai",
      rating: 5,
      highlightDeck: "Bollywood Buff Deck",
    },
    {
      quote:
        "We played Cricket Fever during the IPL finals hangout. Tilt motion sensing worked flawlessly on my phone with zero lag. Absolute crowd favorite!",
      author: "Priya Patel",
      role: "Hostel Game Organizer, Bengaluru",
      rating: 5,
      highlightDeck: "Cricket Fever Deck",
    },
    {
      quote:
        "Custom deck builder is insane! We created a secret deck filled with inside college jokes and old memories. Best icebreaker app hands down.",
      author: "Rohan & Squad",
      role: "College Reunion, Delhi",
      rating: 5,
      highlightDeck: "Custom Deck Engine",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-brand-bg/50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header with subtle fade-in */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 text-brand-text text-xs font-bold uppercase tracking-wider mb-3 border border-brand-border">
            <Heart className="w-3.5 h-3.5 text-brand-primary fill-brand-primary" />
            <span>Loved by Game Night Hosts</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight mb-4">
            Party Squads Love Bujho
          </h2>
          <p className="text-base text-brand-muted font-medium mb-6">
            See how player groups, hostel friends, and family gatherings bring
            the hype with Bujho.
          </p>

          <Link href="/feedback">
            <Button variant="secondary" size="md" className="gap-2">
              <MessageSquarePlus className="w-4 h-4 text-brand-primary fill-brand-primary/20" />
              <span>Submit Your Own Feedback</span>
            </Button>
          </Link>
        </motion.div>

        {/* Testimonials Cards Grid with subtle animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-6 rounded-3xl bg-brand-surface border border-brand-border shadow-md flex flex-col justify-between hover:border-brand-border transition-all duration-300"
            >
              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-4 text-brand-primary">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-brand-primary text-brand-primary" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-brand-primary/20 fill-brand-primary/10 mb-2" />

                <p className="text-xs sm:text-sm text-brand-text font-medium leading-relaxed mb-6">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-brand-text">
                    {item.author}
                  </h4>
                  <span className="text-xs text-brand-muted font-medium">
                    {item.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
