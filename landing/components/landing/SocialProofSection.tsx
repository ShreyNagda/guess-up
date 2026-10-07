"use client";

import React from "react";
import { motion } from "framer-motion";
import { Quote, MapPin, Heart } from "lucide-react";

export function SocialProofSection() {
  {
    /* REPLACE BEFORE DEPLOY */
  }
  const testimonials = [
    {
      quote: "Finally a charades app that knows what DDLJ is.",
      author: "Aarav",
      city: "Mumbai",
      color: "from-party-pink/20 to-party-orange/20 border-party-pink/30",
    },
    {
      quote: "Our hostel floor hasn't been this loud since Diwali.",
      author: "Priya",
      city: "Pune",
      color: "from-party-orange/20 to-party-yellow/20 border-party-orange/30",
    },
    {
      quote: "Went through 3 decks in one night. Zero ads. Unreal.",
      author: "Rohan",
      city: "Bangalore",
      color: "from-[#FFD600]/20 to-party-cyan/20 border-[#FFD600]/30",
    },
  ];

  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Pune",
    "Hyderabad",
    "Chennai",
  ];

  return (
    <section className="py-16 md:py-20 bg-transparent transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* 1. Real-looking Testimonial Cards (3 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`p-6 rounded-3xl bg-brand-card/90 backdrop-blur-md border-2 ${t.color} shadow-card-light flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <Quote className="w-6 h-6 text-party-orange opacity-75" />
                <p className="font-manrope text-base sm:text-lg font-extrabold text-brand-text leading-snug">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between text-xs font-black">
                <span className="text-brand-text uppercase tracking-wide">
                  — {t.author}
                </span>
                <span className="text-brand-muted flex items-center gap-1 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-party-pink" />
                  <span>{t.city}</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 2. Trusted by Early Players in Cities Line */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full bg-brand-surface/80 border border-brand-border text-xs sm:text-sm font-extrabold text-brand-muted shadow-xs">
            <span className="text-brand-text">
              Trusted by early players in:
            </span>
            {cities.map((city, idx) => (
              <React.Fragment key={city}>
                <span className="text-party-orange font-black">{city}</span>
                {idx < cities.length - 1 && (
                  <span className="text-brand-border">·</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 3. Small Founder Note */}
        <div className="max-w-2xl mx-auto p-5 sm:p-6 rounded-2xl bg-brand-surface/70 border border-brand-border text-center shadow-xs">
          <p className="font-manrope text-xs sm:text-sm text-brand-muted font-bold leading-relaxed flex items-center justify-center gap-1.5 flex-wrap">
            <Heart className="w-4 h-4 text-party-pink fill-party-pink inline shrink-0" />
            <span>
              Built by one person in Bombay who was tired of ad-riddled party
              games. If you want to see it launch, grab early access below.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
