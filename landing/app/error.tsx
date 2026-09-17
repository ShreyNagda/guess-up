"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { RefreshCw, AlertTriangle, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Next.js Error Boundary caught error:", error);
  }, [error]);

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

      {/* Main Error Hero Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="p-8 sm:p-14 rounded-3xl bg-brand-surface border-2 border-rose-500/30 shadow-2xl w-full flex flex-col items-center"
        >
          {/* Animated Glowing Error Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center shadow-xl shadow-rose-500/10">
              <AlertTriangle className="w-12 h-12 sm:w-14 sm:h-14 text-rose-500 fill-rose-500/20 animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-md">
              ERROR
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-black uppercase tracking-wider mb-4 border border-rose-500/30">
            <Sparkles className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Unexpected Glitch Detected</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-text tracking-tight uppercase mb-4 leading-tight">
            SOMETHING WENT WRONG!
          </h1>

          <p className="text-sm sm:text-base text-brand-muted font-medium max-w-md mx-auto mb-6 leading-relaxed">
            An unexpected error occurred while loading this page. Don't worry,
            your party session is safe!
          </p>

          {error?.message && (
            <div className="mb-8 p-3 px-4 rounded-xl bg-brand-bg border border-brand-border text-brand-muted text-xs font-mono text-center max-w-md overflow-hidden text-ellipsis whitespace-nowrap">
              {error.message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              onClick={() => reset()}
              className="w-full sm:w-auto gap-2"
            >
              <RefreshCw className="w-4 h-4 text-current shrink-0" />
              <span>Try Again</span>
            </Button>

            <Link href="/" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full gap-2">
                <Home className="w-4 h-4 text-brand-primary fill-brand-primary/20" />
                <span>Return Home</span>
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-brand-muted font-bold border-t border-brand-border">
        <span>Bujho • Error Handler Page</span>
      </footer>
    </div>
  );
}
