import React from "react";
import { motion } from "motion/react";
import { Cpu, HeartHandshake, Compass, Zap } from "lucide-react";

export const Story = () => {
  return (
    <section
      className="bg-surface-card-light/40 dark:bg-surface-card-dark/40 border-y border-border-light dark:border-border-dark py-16 md:py-24 px-4 md:px-8 backdrop-blur-sm"
      id="story"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
          <span className="text-xs uppercase tracking-widest font-black text-primary">
            Behind The Game
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
            Built for Real Connections
          </h2>
          <p className="text-muted-light dark:text-muted-dark text-base md:text-lg">
            How a simple idea grew into the ultimate motion-activated charades
            experience.
          </p>
        </div>

        {/* 3 Story Columns */}
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark p-8 rounded-3xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-black">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">1. The Inspiration</h3>
            <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">
              We noticed existing charades games were clunky, filled with
              intrusive ads, and lacking Indian pop-culture references. We
              wanted a game where college friends, families, and roommates could
              immediately laugh together without tutorial friction.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark p-8 rounded-3xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-black">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">2. The Technology</h3>
            <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">
              Built with Flutter, **Guess Up** reads raw hardware accelerometer
              and gyroscope streams directly. By processing real-time
              orientation vectors, the game detects subtle tilt-down (Correct)
              and tilt-up (Pass) motions only while the timer is active.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark p-8 rounded-3xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-black">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">3. Note to Playtesters</h3>
            <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">
              As a beta tester, your feedback shapes our game balance, deck
              categories, and motion thresholds! Test both Solo and Team modes
              with your friends and tell us what works best.
            </p>
          </motion.div>
        </div>

        {/* Tech Specs Banner */}
        {/* <div className="bg-surface-dark border-2 border-border-dark p-6 md:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-accent font-black flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-text-dark">60 FPS Hardware Sensing</h4>
              <p className="text-xs text-muted-dark">Zero latency motion detection on both Android & iOS devices.</p>
            </div>
          </div>
          <a
            href="#feedback"
            className="px-6 py-3 rounded-xl bg-primary text-accent font-black text-xs hover:scale-105 transition-all shrink-0 cursor-pointer"
          >
            Submit Feedback
          </a>
        </div> */}
      </div>
    </section>
  );
};
