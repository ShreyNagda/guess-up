"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "../ui/ThemeToggle";
import { GOOGLE_GROUP_URL, WHATSAPP_GROUP_URL } from "@/lib/config";

export function Footer() {
  return (
    <footer className="py-8 border-t border-brand-border/40 text-xs text-brand-muted bg-transparent transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        {/* Left: BUJHO + Made in India */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="font-lilita text-xl text-brand-text uppercase tracking-tight hover:opacity-90"
          >
            BUJHO
          </Link>
          <span className="font-manrope text-brand-muted font-bold text-xs">
            · Made in India 🇮🇳
          </span>
        </div>

        {/* Middle: Founders Group · WhatsApp Community · Privacy · Contact */}
        <div className="flex flex-wrap items-center justify-center gap-4 font-manrope font-bold text-xs">
          <a
            href={GOOGLE_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-text transition-colors"
          >
            Founders Group
          </a>
          <span>·</span>
          <a
            href={WHATSAPP_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-text transition-colors"
          >
            WhatsApp Community
          </a>
          <span>·</span>
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
        </div>

        {/* Right: Theme Toggle + Copyright */}
        <div className="flex items-center gap-3 font-manrope font-bold text-xs">
          <ThemeToggle />
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
