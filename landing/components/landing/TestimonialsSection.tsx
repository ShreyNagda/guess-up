"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Star,
  Heart,
  MessageSquarePlus,
  Flame,
  Sparkles,
  Instagram,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/Button";

interface Highlight {
  handle: string;
  tag: string;
  location: string;
  sticker: string;
  text: string;
  deckBadge: string;
  likes: string;
  avatarColor: string;
}

export function TestimonialsSection() {
  const partyHighlights: Highlight[] = [
    {
      handle: "@aarav_mumbai",
      tag: "House Party Host",
      location: "Mumbai, MH",
      sticker: "🔥 100x BETTER THAN OTHER CHARADES APPS",
      text: "The Bollywood Buff deck had our entire house party screaming dialogues at 2 AM! The fact that there are ZERO ad breaks mid-game makes it a total gamechanger.",
      deckBadge: "Bollywood Buff Deck",
      likes: "1.4k party reactions",
      avatarColor: "bg-gradient-to-tr from-party-pink to-party-orange",
    },
    {
      handle: "@priya_blr_hostel",
      tag: "Hostel Game Organizer",
      location: "Bengaluru, KA",
      sticker: "🏏 UNINTERRUPTED IPL HYPE",
      text: "We played Cricket Fever during the IPL finals hangout. Tilt motion sensing worked flawlessly on my phone with zero lag. Absolute crowd favorite for hostel nights!",
      deckBadge: "Cricket Fever Deck",
      likes: "2.1k party reactions",
      avatarColor: "bg-gradient-to-tr from-party-cyan to-[#FFD600]",
    },
    {
      handle: "@rohan_delhi_squad",
      tag: "College Reunion Crew",
      location: "Delhi, NCR",
      sticker: "⚡ INSANE CUSTOM DECK STUDIO",
      text: "Custom deck builder is crazy! We created a secret deck filled with inside college jokes and old memories. Best icebreaker app hands down.",
      deckBadge: "Custom Deck Studio",
      likes: "980 party reactions",
      avatarColor: "bg-gradient-to-tr from-party-orange to-party-pink",
    },
  ];

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
            <span>SQUAD GOALS & PARTY HIGHLIGHTS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-lilita font-black text-brand-text tracking-tight uppercase mb-4">
            House Party Highlights
          </h2>
          <p className="text-base sm:text-xl text-brand-muted font-bold leading-relaxed mb-6">
            Real chaotic party moments, midnight hostel showdowns, and screaming
            Bollywood dialogue matches.
          </p>

          <Link href="/feedback">
            <Button
              variant="secondary"
              size="md"
              className="gap-2 text-xs uppercase font-extrabold border-2 border-party-pink/30 hover:bg-party-pink/10"
            >
              <MessageSquarePlus className="w-4 h-4 text-party-pink" />
              <span>Share Your Squad Story</span>
            </Button>
          </Link>
        </motion.div>

        {/* Casual Screenshot / Instagram Story Cards Layout (2-column layout on mobile) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-8">
          {partyHighlights.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.12 }}
              whileHover={{ y: -6, rotate: idx % 2 === 0 ? 1 : -1 }}
              className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-brand-surface border-2 border-brand-border shadow-xl relative flex flex-col justify-between overflow-hidden"
            >
              {/* Instagram Story-style Header */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-border">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-full ${item.avatarColor} p-0.5 flex items-center justify-center shadow-md`}
                    >
                      <div className="w-full h-full rounded-full bg-brand-surface flex items-center justify-center font-black text-xs text-brand-text">
                        {item.handle.substring(1, 3).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-brand-text leading-none mb-1 flex items-center gap-1">
                        {item.handle}
                        <Instagram className="w-3.5 h-3.5 text-party-pink inline" />
                      </h3>
                      <span className="text-[11px] font-bold text-brand-muted">
                        {item.tag} • {item.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex text-[#FFD600]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 fill-current text-current"
                      />
                    ))}
                  </div>
                </div>

                {/* Story Reaction Sticker Tag */}
                <div className="inline-block px-3 py-1 rounded-xl bg-party-orange/15 text-party-orange text-[11px] font-black uppercase tracking-wider mb-4 border border-party-orange/30 shadow-xs">
                  {item.sticker}
                </div>

                {/* Casual Review Quote */}
                <p className="text-sm sm:text-base text-brand-text font-bold leading-relaxed mb-6">
                  "{item.text}"
                </p>
              </div>

              {/* Card Footer with Deck Tag & Likes */}
              <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                <span className="text-xs font-black px-3 py-1 rounded-xl bg-brand-bg text-brand-text border border-brand-border">
                  {item.deckBadge}
                </span>
                <span className="text-[11px] font-extrabold text-party-pink flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 fill-current" />
                  {item.likes}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
