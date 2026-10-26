"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "../ui/ThemeToggle";
import { INSTAGRAM_URL } from "@/lib/config";

export function Footer() {
  return (
    <footer className="py-10 border-t border-brand-border/40 text-xs text-brand-muted bg-transparent transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        {/* Left: BUJHO (font-lilita) + Made with ☕ by an Indie Dev in India */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Link
            href="/"
            className="font-lilita text-2xl text-brand-text uppercase tracking-tight hover:opacity-90"
          >
            BUJHO
          </Link>
          <span className="hidden sm:inline text-brand-border">|</span>
          <span className="font-manrope text-brand-muted font-bold text-xs">
            Made with ☕ by an Indie Dev in India
          </span>
        </div>

        {/* Middle: Privacy · Contact · Instagram */}
        <div className="flex items-center justify-center gap-3 font-manrope font-extrabold text-xs">
          <Link
            href="/privacy"
            className="hover:text-brand-text transition-colors"
          >
            Privacy
          </Link>
          <span>·</span>
          <a
            href="mailto:shreynagda2714@gmail.com"
            className="hover:text-brand-text transition-colors"
          >
            Contact
          </a>
          <span>·</span>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-text transition-colors"
          >
            Instagram
          </a>
        </div>

        {/* Right: Theme toggle (mirrored) · Copyright */}
        <div className="flex items-center gap-3 font-manrope font-bold text-xs">
          <ThemeToggle />
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
