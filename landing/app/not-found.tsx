"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Home, Sparkles, Layers, ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col justify-between transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full bg-brand-surface/90 backdrop-blur-md border-b border-brand-border transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/images/bujho-icon.png"
              alt="Bujho Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-contain shadow-xs border border-brand-border group-hover:scale-105 transition-transform"
            />
            <span className="font-black text-lg text-brand-text tracking-tight uppercase">
              Bujho
            </span>
          </Link>

          <ThemeToggle />
        </div>
      </header>

      {/* Main 404 Hero Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="p-8 sm:p-14 rounded-3xl bg-brand-surface border-2 border-brand-primary/30 shadow-2xl w-full flex flex-col items-center"
        >
          {/* Animated Glowing 404 Badge */}
          <div className="relative mb-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-brand-primary/10 border-2 border-brand-primary/40 flex items-center justify-center shadow-xl shadow-brand-primary/10">
              <SearchX className="w-12 h-12 sm:w-14 sm:h-14 text-brand-primary fill-brand-primary/20 animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-brand-primary text-brand-bg text-xs font-black uppercase tracking-wider shadow-md">
              404
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-black uppercase tracking-wider mb-4 border border-brand-primary/30">
            <Sparkles className="w-3.5 h-3.5 fill-brand-primary" />
            <span>Card Not Found In Deck</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-text tracking-tight uppercase mb-4 leading-tight">
            OOPS! THIS PAGE WAS PASSED.
          </h1>

          <p className="text-sm sm:text-base text-brand-muted font-medium max-w-md mx-auto mb-8 leading-relaxed">
            Looks like you've tilted your phone into unknown territory! The URL
            you're trying to access doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full gap-2">
                <Home className="w-4 h-4 fill-current" />
                <span>Return to Home Page</span>
              </Button>
            </Link>

            <Link href="/#decks" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full gap-2">
                <Layers className="w-4 h-4 text-brand-primary fill-brand-primary/20" />
                <span>Explore Decks</span>
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-brand-muted font-bold border-t border-brand-border">
        <span>Bujho • 404 Card Not Found Page</span>
      </footer>
    </div>
  );
}
