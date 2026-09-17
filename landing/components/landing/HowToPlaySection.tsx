"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Smartphone, Volume2, Joystick } from "lucide-react";

interface Step {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tagline: string;
  badge: string;
}

export function HowToPlaySection() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps: Step[] = [
    {
      id: 1,
      title: "Pick Your Category Deck",
      subtitle:
        "Choose from 50+ hand-curated decks like Bollywood Buff, Cricket Fever, or Street Snacks.",
      icon: (
        <Layers className="w-6 h-6 text-brand-primary fill-brand-primary/20" />
      ),
      tagline: "Deck Selection",
      badge: "Step 1",
    },
    {
      id: 2,
      title: "Hold to Your Forehead",
      subtitle:
        "Place your phone on your forehead with the screen facing your squad so everyone can see the card.",
      icon: (
        <Smartphone className="w-6 h-6 text-brand-primary fill-brand-primary/20" />
      ),
      tagline: "Forehead Position",
      badge: "Step 2",
    },
    {
      id: 3,
      title: "Friends Shout & Act Clues",
      subtitle:
        "Your teammates act out charades, hum tunes, or shout clues without uttering the secret word!",
      icon: (
        <Volume2 className="w-6 h-6 text-brand-primary fill-brand-primary" />
      ),
      tagline: "Shout & Act",
      badge: "Step 3",
    },
    {
      id: 4,
      title: "Tilt or Tap to Score & Pass",
      subtitle:
        "Play with phone motion tilt gestures (tilt DOWN to score, tilt UP to pass) or screen tap controls (tap right for Correct, tap left to Pass).",
      icon: (
        <Joystick className="w-6 h-6 text-brand-primary fill-brand-primary/20" />
      ),
      tagline: "Tilt & Tap Controls",
      badge: "Step 4",
    },
  ];

  return (
    <section
      id="how-to-play"
      className="py-16 md:py-24 bg-brand-bg/50 transition-colors duration-300"
    >
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
            <span>Easy 4-Step Gameplay</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight mb-4">
            How To Play Bujho
          </h2>
          <p className="text-base text-brand-muted font-medium">
            Zero setup, zero rules to learn. Grab a phone, gather your crew, and
            let the chaos begin!
          </p>
        </motion.div>

        {/* 4-Step Interactive Grid with subtle animation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
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
                whileHover={{ y: -4, transition: { duration: 0.1 } }}
                className={`cursor-pointer p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  isActive
                    ? "bg-brand-surface border-brand-border shadow-lg"
                    : "bg-brand-surface/70 border-brand-border hover:border-brand-border"
                }`}
              >
                <div>
                  {/* Badge & Icon Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-brand-bg text-brand-muted border border-brand-border">
                      {step.badge}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-brand-text mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-muted font-medium leading-relaxed">
                    {step.subtitle}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
