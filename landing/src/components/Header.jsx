import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isAdmin = location.pathname === "/admin";

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const menuVariants = {
    closed: {
      right: "-100%",
      transition: { type: "tween", duration: 0.3 },
    },
    open: {
      right: 0,
      transition: { type: "tween", duration: 0.3 },
    },
  };

  const navLinks = (
    <>
      {isHome ? (
        <>
          <a
            href="#features"
            onClick={() => setIsOpen(false)}
            className="font-bold text-[0.95rem] hover:text-primary transition-colors"
          >
            Features
          </a>
          <a
            href="#how-to-play"
            onClick={() => setIsOpen(false)}
            className="font-bold text-[0.95rem] hover:text-primary transition-colors"
          >
            How to Play
          </a>
          <a
            href="#decks"
            onClick={() => setIsOpen(false)}
            className="font-bold text-[0.95rem] hover:text-primary transition-colors"
          >
            Decks
          </a>
        </>
      ) : (
        <>
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="font-bold text-[0.95rem] hover:text-primary transition-colors"
          >
            Home
          </Link>
          <a
            href="/#features"
            onClick={() => setIsOpen(false)}
            className="font-bold text-[0.95rem] hover:text-primary transition-colors"
          >
            Features
          </a>
        </>
      )}

      {!isAdmin && (
        <Link
          to="/admin"
          onClick={() => setIsOpen(false)}
          className="font-bold text-[0.95rem] hover:text-primary transition-colors"
        >
          Admin
        </Link>
      )}

      <button
        onClick={() => {
          toggleTheme();
          setIsOpen(false);
        }}
        className="border-2 border-border-light dark:border-border-dark text-text-light dark:text-text-dark font-bold text-xs px-3 py-1.5 rounded-lg hover:border-primary dark:hover:border-accent hover:bg-black/5 dark:hover:bg-white/5 transition-all uppercase tracking-wider cursor-pointer"
        aria-label="Toggle Theme"
      >
        {theme === "dark" ? "Light" : "Dark"}
      </button>

      <a
        href="#download"
        onClick={() => setIsOpen(false)}
        className="btn-primary inline-flex items-center justify-center font-extrabold text-[0.95rem] px-5 py-2.5 rounded-xl bg-primary text-accent shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        Get App
      </a>
    </>
  );

  return (
    <header className="sticky top-0 w-full bg-bg-light/85 dark:bg-bg-dark/85 backdrop-blur-md border-b border-border-light dark:border-border-dark z-40 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img
              className="w-9 h-9 md:w-11 md:h-11 rounded-full shadow-md"
              src="/images/logo.png"
              alt="Guess Up Logo"
            />
            <h1
              className="logo-text text-xl md:text-2xl font-black tracking-tight text-primary dark:text-text-dark font-sans"
              style={{
                textShadow:
                  theme === "light"
                    ? "2px 2px 0px #ffd600"
                    : "2px 2px 0px #212121",
              }}
            >
              GUESS UP
            </h1>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-text-light dark:text-text-dark">
          {navLinks}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMenu}
          className="flex md:hidden flex-col justify-between w-7 h-5 bg-transparent border-none cursor-pointer p-0 z-50"
          aria-label="Toggle Menu"
        >
          <span
            className={`w-full h-0.75 bg-primary dark:bg-text-dark rounded transition-all duration-300 ${isOpen ? "transform translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`w-full h-0.75 bg-primary dark:bg-text-dark rounded transition-all duration-300 ${isOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`w-full h-0.75 bg-primary dark:bg-text-dark rounded transition-all duration-300 ${isOpen ? "transform -translate-y-2 -rotate-45" : ""}`}
          />
        </button>

        {/* Mobile Nav Menu */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleMenu}
                className="fixed inset-0 bg-black/60 z-40 md:hidden"
              />

              {/* Sidebar */}
              <motion.nav
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="fixed top-0 bottom-0 right-0 w-70 bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark flex flex-col justify-start items-start p-20 gap-8 z-45 md:hidden shadow-2xl"
              >
                <div className="flex flex-col gap-6 w-full text-text-light dark:text-text-dark items-start">
                  {navLinks}
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
