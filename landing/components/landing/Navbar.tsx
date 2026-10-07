"use client";

import React from "react";
import { ThemeToggle } from "../ui/ThemeToggle";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/Button";
import { FOUNDER_COUNT } from "@/lib/config";

interface NavbarProps {
  onOpenEarlyAccess?: () => void;
}

export function Navbar({ onOpenEarlyAccess }: NavbarProps) {
  const handleCta = () => {
    if (onOpenEarlyAccess) {
      onOpenEarlyAccess();
    } else {
      const el = document.getElementById("early-access");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else if (typeof window !== "undefined") {
        window.location.href = "/#early-access";
      }
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else if (typeof window !== "undefined") {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-surface/90 backdrop-blur-md border-b border-brand-border transition-colors duration-300 py-2.5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: BUJHO Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <Image
            src="/images/bujho-icon.png"
            alt="Bujho Logo"
            width={32}
            height={32}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-contain shadow-xs group-hover:scale-105 transition-transform border border-brand-border"
            priority
          />
          <span className="font-lilita text-2xl sm:text-3xl text-brand-text tracking-tight uppercase">
            BUJHO
          </span>
        </Link>

        {/* Center: In-Page Navigation Links (How it plays, Decks, Early Access) */}
        <nav className="hidden lg:flex items-center gap-6 font-manrope font-bold text-xs uppercase tracking-wider text-brand-muted">
          <button
            type="button"
            onClick={() => scrollToSection("how-to-play")}
            className="hover:text-brand-text transition-colors cursor-pointer"
          >
            How it plays
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("decks")}
            className="hover:text-brand-text transition-colors cursor-pointer"
          >
            Decks
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("early-access")}
            className="hover:text-brand-text transition-colors cursor-pointer"
          >
            Early Access
          </button>
        </nav>

        {/* Right: Live Pill + Theme Toggle + CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Desktop Live Pill */}
          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-party-orange/10 border border-party-orange/25 text-party-orange text-xs font-extrabold tracking-wide select-none">
            <span>🔥 {FOUNDER_COUNT} players in the Founders Circle</span>
          </div>

          <ThemeToggle />

          <Button
            variant="primary"
            size="sm"
            onClick={handleCta}
            className="font-lilita font-black text-xs sm:text-sm uppercase tracking-wider px-3.5 py-2 sm:px-4 sm:py-2 shadow-md"
          >
            <span>Get Early Access</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
