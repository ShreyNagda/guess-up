"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "../ui/ThemeToggle";

interface NavbarProps {
  onScrollToTesters?: () => void;
}

export function Navbar({ onScrollToTesters }: NavbarProps) {
  const handleScroll = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onScrollToTesters) {
      onScrollToTesters();
    } else {
      const el = document.getElementById("founding-testers");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-surface/90 backdrop-blur-md border-b border-brand-border py-2.5 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-between gap-3">
        {/* Left: BUJHO (font-lilita) + a tiny badge next to it: Indie Made 🇮🇳 (using party-orange text) */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <Image
            src="/images/bujho-icon.png"
            alt="Bujho Logo"
            width={30}
            height={30}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-contain shadow-xs group-hover:scale-105 transition-transform border border-brand-border"
            priority
          />
          <span className="font-lilita text-2xl sm:text-3xl text-brand-text tracking-tight uppercase">
            BUJHO
          </span>
          <span className="ml-1 px-2.5 py-0.5 rounded-full bg-party-orange/10 border border-party-orange/25 text-party-orange text-[10px] sm:text-xs font-extrabold tracking-wide select-none">
            Indie Made 🇮🇳
          </span>
        </Link>

        {/* Right: Theme toggle icon (🌙 / ☀️) + compact Become a Tester button */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <ThemeToggle />

          <a
            href="#founding-testers"
            onClick={handleScroll}
            className="btn-theme-primary font-lilita text-xs sm:text-sm uppercase tracking-wider px-3.5 py-2 sm:px-4 sm:py-2 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all text-center select-none cursor-pointer"
          >
            Become a Tester
          </a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
