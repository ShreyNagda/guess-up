"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  Users,
  Edit3,
  WifiOff,
  UserX,
  Share2,
} from "lucide-react";

interface BentoCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  featured?: boolean;
}

function BentoCard({ icon, title, subtitle, badge, featured }: BentoCardProps) {
  return (
    <div
      className={`h-full p-6 sm:p-7 rounded-3xl border transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${
        featured
          ? "bg-brand-surface border-brand-border shadow-md"
          : "bg-brand-surface/80 border-brand-border shadow-xs"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 text-brand-text flex items-center justify-center">
            {icon}
          </div>
          {badge && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-primary/10 text-brand-text border border-brand-border">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-lg sm:text-xl font-black text-brand-text mb-2.5 tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-medium">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export function BentoFeatures() {
  const features = [
    {
      icon: (
        <ShieldCheck className="w-6 h-6 text-brand-primary fill-brand-primary/20" />
      ),
      title: "100% Ad-Free Experience",
      subtitle:
        "Zero forced 30-second popups or video ad breaks killing your party vibe between rounds.",
      badge: "Pure Fun",
      featured: true,
    },
    {
      icon: (
        <Share2 className="w-6 h-6 text-brand-primary fill-brand-primary/20" />
      ),
      title: "Story Scorecard Sharing",
      subtitle:
        "Instantly export HD victory scorecards with team standings and word breakdown chips directly to Instagram & TikTok stories!",
      badge: "Social Share",
      featured: false,
    },
    {
      icon: <Zap className="w-6 h-6 text-brand-primary fill-brand-primary" />,
      title: "Tilt & Tap Controls",
      subtitle:
        "Play with intuitive forehead tilt gestures or quick screen tap controls for max comfort.",
      badge: "Dual Modes",
      featured: false,
    },
    {
      icon: (
        <Users className="w-6 h-6 text-brand-primary fill-brand-primary/20" />
      ),
      title: "2-Team Battle Mode",
      subtitle:
        "Head-to-head party showdowns with automatic scorekeeping and round timer summaries.",
      badge: "Multiplayer",
      featured: false,
    },
    {
      icon: <WifiOff className="w-6 h-6 text-brand-primary" />,
      title: "100% Offline Mode",
      subtitle:
        "No Wi-Fi or mobile data needed on road trips, camping, or remote hostels.",
      badge: "Anywhere Play",
      featured: false,
    },
    {
      icon: (
        <Edit3 className="w-6 h-6 text-brand-primary fill-brand-primary/20" />
      ),
      title: "Custom Deck Studio",
      subtitle:
        "Create, save, and share inside jokes & custom secret word decks with your crew.",
      badge: "Deck Builder",
      featured: false,
    },
    {
      icon: (
        <UserX className="w-6 h-6 text-brand-primary fill-brand-primary/20" />
      ),
      title: "Zero Account Friction",
      subtitle:
        "No email verification or passwords required. Open app and start playing in 3 seconds.",
      badge: "Instant Play",
      featured: true,
    },
  ];

  return (
    <section
      id="features"
      className="py-16 md:py-24 bg-brand-surface transition-colors duration-300"
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
            <span>Built for Uninterrupted Hilarity</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight mb-4">
            Everything You Need in a Party App
          </h2>
          <p className="text-base text-brand-muted font-medium">
            Designed specifically to eliminate friction, ad interruptions, and
            complex setup so your group stays locked in the game.
          </p>
        </motion.div>

        {/* Bento Grid with exact 3-column span patterns and equal height rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {features.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`h-full ${feat.featured ? "md:col-span-2" : "md:col-span-1"}`}
            >
              <BentoCard {...feat} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
