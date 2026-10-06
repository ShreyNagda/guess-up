"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Smartphone, Volume2, Joystick, Sparkles } from "lucide-react";

interface Step {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tagline: string;
  badge: string;
  color: string;
}

export function HowToPlaySection() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps: Step[] = [
    {
      id: 1,
      title: "Pick Your Category Deck",
      subtitle:
        "Choose from 50+ hand-curated decks like Bollywood Buff, Cricket Fever, or Sweet & Spicy street food.",
      icon: <Layers className="w-6 h-6 text-party-pink" />,
      tagline: "Deck Selection",
      badge: "Step 1",
      color: "border-party-pink/30 bg-party-pink/5",
    },
    {
      id: 2,
      title: "Hold to Your Forehead",
      subtitle:
        "Place your phone on your forehead with the screen facing your squad so everyone can see the card.",
      icon: <Smartphone className="w-6 h-6 text-party-orange" />,
      tagline: "Forehead Position",
      badge: "Step 2",
      color: "border-party-orange/30 bg-party-orange/5",
    },
    {
      id: 3,
      title: "Friends Shout & Act Clues",
      subtitle:
        "Your teammates act out charades, hum tunes, or shout clues without uttering the secret word!",
      icon: <Volume2 className="w-6 h-6 text-party-cyan" />,
      tagline: "Shout & Act",
      badge: "Step 3",
      color: "border-party-cyan/30 bg-party-cyan/5",
    },
    {
      id: 4,
      title: "Tilt or Tap to Score & Pass",
      subtitle:
        "Play with phone motion tilt gestures (tilt DOWN to score, tilt UP to pass) or screen tap controls.",
      icon: <Joystick className="w-6 h-6 text-[#FFD600]" />,
      tagline: "Tilt & Tap Controls",
      badge: "Step 4",
      color: "border-[#FFD600]/30 bg-[#FFD600]/5",
    },
  ];

  return (
    <section
      id="how-to-play"
      className="py-16 md:py-24 bg-brand-bg/80 transition-colors duration-300 relative"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-party-cyan/15 text-party-cyan text-xs font-black uppercase tracking-wider mb-4 border border-party-cyan/30 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-party-cyan" />
            <span>4 STEPS TO TOTAL CHAOS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-brand-text tracking-tight uppercase mb-4">
            How To Play Bujho
          </h2>
          <p className="text-base sm:text-xl text-brand-muted font-bold leading-relaxed">
            Zero setup, zero rules to learn. Grab a phone, gather your crew, and
            let the chaos begin!
          </p>
        </motion.div>

        {/* 4-Step Interactive Grid (2x2 layout on mobile for compact height) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {steps.map((step, idx) => {
            const isActive = activeStep === step.id;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                onClick={() => setActiveStep(step.id)}
                whileHover={{ y: -6, transition: { duration: 0.1 } }}
                className={`cursor-pointer p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between ${
                  isActive
                    ? `${step.color} shadow-xl scale-[1.02]`
                    : "bg-brand-surface border-brand-border hover:border-brand-border"
                }`}
              >
                <div>
                  {/* Badge & Icon Header */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4 gap-1">
                    <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-brand-bg text-brand-text border border-brand-border uppercase">
                      {step.badge}
                    </span>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-surface flex items-center justify-center shadow-xs border border-brand-border shrink-0">
                      {step.icon}
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-lg font-lilita font-black text-brand-text mb-1.5 uppercase tracking-tight">
                    {step.title}
                  </h3>
                  {/* <p className="text-[11px] sm:text-sm text-brand-muted font-bold leading-snug sm:leading-relaxed">
                    {step.subtitle}
                  </p> */}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
