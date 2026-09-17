"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "../ui/ThemeToggle";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Sparkles, Menu, X } from "lucide-react";
import { Button } from "../ui/Button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-surface/90 backdrop-blur-md border-b border-brand-border transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/images/bujho-icon.png"
            alt="Bujho Logo"
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-contain shadow-sm group-hover:scale-105 transition-transform border border-brand-border"
            priority
          />
          <span className="font-black text-lg sm:text-xl text-brand-text tracking-tight uppercase">
            Bujho
          </span>
        </Link>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-brand-muted">
          <button
            onClick={() => scrollToSection("how-to-play")}
            className="hover:text-brand-text transition-colors cursor-pointer"
          >
            How To Play
          </button>
          <button
            onClick={() => scrollToSection("decks")}
            className="hover:text-brand-text transition-colors cursor-pointer"
          >
            Decks
          </button>
          <button
            onClick={() => scrollToSection("features")}
            className="hover:text-brand-text transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="hover:text-brand-text transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => scrollToSection("waitlist-section")}
            className="hidden sm:inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-current fill-current" />
            <span>Beta Access</span>
          </Button>

          <ThemeToggle />

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-brand-text hover:bg-brand-primary/10 border border-brand-border transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-brand-text" />
            ) : (
              <Menu className="w-5 h-5 text-brand-text" />
            )}
          </button>
        </div>
      </div>

      {/* Animated Mobile Dropdown Menu Floating On Top */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden absolute top-full left-0 right-0 z-50 bg-brand-surface/98 backdrop-blur-xl border-b border-brand-border shadow-2xl px-4 py-4"
          >
            <div className="flex flex-col space-y-2 text-sm font-extrabold text-brand-text">
              <button
                onClick={() => {
                  scrollToSection("how-to-play");
                  setMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl hover:bg-brand-primary/10 text-left cursor-pointer transition-colors"
              >
                How To Play
              </button>
              <button
                onClick={() => {
                  scrollToSection("decks");
                  setMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl hover:bg-brand-primary/10 text-left cursor-pointer transition-colors"
              >
                Decks
              </button>
              <button
                onClick={() => {
                  scrollToSection("features");
                  setMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl hover:bg-brand-primary/10 text-left cursor-pointer transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => {
                  scrollToSection("faq");
                  setMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl hover:bg-brand-primary/10 text-left cursor-pointer transition-colors"
              >
                FAQ
              </button>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    scrollToSection("waitlist-section");
                    setMobileMenuOpen(false);
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-current" />
                    <span>Get Early Beta Access</span>
                  </div>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
