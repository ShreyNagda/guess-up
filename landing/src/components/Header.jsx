import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Sun,
  Moon,
  X,
  Menu,
  Sparkles,
  HelpCircle,
  Layers,
  ShieldCheck,
  Home,
  UserCheck,
  Users,
  MessageSquare,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted] = useState(() => typeof window !== "undefined");
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  // Mobile Drawer Portal Markup
  const mobileDrawerMarkup = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-999 md:hidden flex justify-end">
          {/* Dark Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Slide-out Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative w-4/5 max-w-sm h-full bg-surface border-l-2 border-border shadow-2xl flex flex-col justify-between p-6 z-10 text-text overflow-y-auto"
          >
            {/* Drawer Top Header Bar */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <img
                    className="w-9 h-9 rounded-full object-contain p-0.5"
                    src="/images/guessup-icon.png"
                    alt="Guess Up Icon"
                  />
                  <span className="font-black text-lg text-text tracking-tight uppercase">
                    Guess Up
                  </span>
                </Link>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 rounded-xl bg-surface-card border border-border text-muted hover:text-text cursor-pointer transition-colors"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links List */}
              <nav className="flex flex-col gap-2.5">
                {isHome ? (
                  <>
                    <a
                      href="#features"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-card/70 hover:bg-surface-card border border-border/70 text-sm font-extrabold text-text transition-all active:scale-98"
                    >
                      <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <span>Features</span>
                    </a>

                    <a
                      href="#how-to-play"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-card/70 hover:bg-surface-card border border-border/70 text-sm font-extrabold text-text transition-all active:scale-98"
                    >
                      <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-4 h-4 text-primary" />
                      </div>
                      <span>How to Play</span>
                    </a>

                    <a
                      href="#decks"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-card/70 hover:bg-surface-card border border-border/70 text-sm font-extrabold text-text transition-all active:scale-98"
                    >
                      <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4 text-primary" />
                      </div>
                      <span>Category Decks</span>
                    </a>

                    <a
                      href="#testers"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-card/70 hover:bg-surface-card border border-border/70 text-sm font-extrabold text-text transition-all active:scale-98"
                    >
                      <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span>Beta Playtesters</span>
                    </a>

                    <a
                      href="#feedback"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-card/70 hover:bg-surface-card border border-border/70 text-sm font-extrabold text-text transition-all active:scale-98"
                    >
                      <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <span>Feedback Hub</span>
                    </a>
                  </>
                ) : (
                  <>
                    <Link
                      to="/"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-card/70 hover:bg-surface-card border border-border/70 text-sm font-extrabold text-text transition-all active:scale-98"
                    >
                      <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                        <Home className="w-4 h-4 text-primary" />
                      </div>
                      <span>Home Page</span>
                    </Link>
                  </>
                )}

                <Link
                  to="/privacy"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-card/70 hover:bg-surface-card border border-border/70 text-sm font-extrabold text-text transition-all active:scale-98"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                  </div>
                  <span>Privacy & Legal</span>
                </Link>
              </nav>
            </div>

            {/* Drawer Footer Controls & CTA */}
            <div className="flex flex-col gap-4 pt-6 border-t border-border/80 mt-6">
              {/* Theme Selector Card */}
              <div className="p-3.5 rounded-2xl bg-surface-card border border-border/80 flex items-center justify-between">
                <span className="text-xs font-black uppercase text-muted tracking-wider">
                  Theme Mode
                </span>
                <button
                  onClick={toggleTheme}
                  className="px-3.5 py-1.5 rounded-xl bg-primary text-accent font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="w-3.5 h-3.5" /> Light
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5" /> Dark
                    </>
                  )}
                </button>
              </div>

              {/* Primary Mobile Action Button */}
              <a
                href="#testers"
                onClick={() => setIsOpen(false)}
                className="w-full py-4 rounded-2xl bg-primary text-accent font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all text-center"
              >
                <UserCheck className="w-4 h-4" /> Register For Free Beta Access
              </a>

              <p className="text-[0.65rem] text-center text-muted font-bold">
                Guess Up v1.1 • Ad-Free Party Charades
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <header className="sticky top-0 w-full bg-bg/90 backdrop-blur-xl border-b border-border/80 z-40 transition-colors duration-300 shadow-xs">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3.5 md:px-8">
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            className="w-9 h-9 md:w-10 md:h-10 rounded-full shadow-md object-contain dark:bg-white/5 p-1 group-hover:scale-105 transition-transform"
            src="/images/guessup-icon.png"
            alt="Guess Up Logo"
          />
          <h1
            className="logo-text text-xl md:text-2xl font-black tracking-tight text-text font-sans"
            style={{
              textShadow:
                theme === "light"
                  ? "2px 2px 0px rgba(0, 0, 0, 0.15)"
                  : "2px 2px 0px #0c091a",
            }}
          >
            GUESS UP
          </h1>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-text">
          {isHome ? (
            <>
              <a
                href="#features"
                className="font-extrabold text-sm hover:text-primary transition-colors px-2 py-1"
              >
                Features
              </a>
              <a
                href="#how-to-play"
                className="font-extrabold text-sm hover:text-primary transition-colors px-2 py-1"
              >
                How to Play
              </a>
              <a
                href="#decks"
                className="font-extrabold text-sm hover:text-primary transition-colors px-2 py-1"
              >
                Decks
              </a>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="font-extrabold text-sm hover:text-primary transition-colors px-2 py-1"
              >
                Home
              </Link>
              <a
                href="/#features"
                className="font-extrabold text-sm hover:text-primary transition-colors px-2 py-1"
              >
                Features
              </a>
            </>
          )}

          <Link
            to="/privacy"
            className="font-extrabold text-sm hover:text-primary transition-colors px-2 py-1"
          >
            Privacy
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="border-2 border-border/80 bg-surface text-text font-black text-xs px-3.5 py-2 rounded-xl hover:border-primary transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shadow-xs"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-primary" /> Light
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-primary" /> Dark
              </>
            )}
          </button>

          {/* CTA Header Button */}
          <a
            href="#testers"
            className="btn-primary inline-flex items-center justify-center font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl bg-primary text-accent shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer gap-1.5"
          >
            <UserCheck className="w-4 h-4" /> Beta Access
          </a>
        </nav>

        {/* Mobile Action Controls: Theme Switch + Hamburger */}
        <div className="flex items-center gap-2.5 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-surface border border-border text-text hover:border-primary transition-all cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-primary" />
            ) : (
              <Moon className="w-4 h-4 text-primary" />
            )}
          </button>

          <button
            onClick={toggleMenu}
            className="p-2.5 rounded-xl bg-surface border border-border text-primary hover:border-primary transition-all cursor-pointer shadow-xs active:scale-95"
            aria-label="Open Navigation Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Render Mobile Drawer via Portal directly to body */}
        {mounted && createPortal(mobileDrawerMarkup, document.body)}
      </div>
    </header>
  );
};
