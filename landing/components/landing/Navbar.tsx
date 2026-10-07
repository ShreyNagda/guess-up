"use client";

import React from "react";
import { ThemeToggle } from "../ui/ThemeToggle";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/Button";

interface NavbarProps {
  onOpenTesterModal?: () => void;
}

export function Navbar({ onOpenTesterModal }: NavbarProps) {
  const handleCta = () => {
    if (onOpenTesterModal) {
      onOpenTesterModal();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-surface/90 backdrop-blur-md border-b border-brand-border transition-colors duration-300 py-2.5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
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

        {/* Right: Theme Toggle + Get the App CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <Button
            variant="primary"
            size="sm"
            onClick={handleCta}
            className="font-lilita font-black text-xs sm:text-sm uppercase tracking-wider px-4 py-2"
          >
            <span>Get the App</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

