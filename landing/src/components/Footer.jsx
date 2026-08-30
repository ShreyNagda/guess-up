import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

export const Footer = () => {
  const { isAdminLoggedIn, openAuthModal } = useAdminAuth();
  const navigate = useNavigate();

  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      navigate("/admin");
    } else {
      openAuthModal();
    }
  };

  return (
    <footer className="border-t border-border-light dark:border-border-dark py-10 px-4 text-center mt-auto bg-transparent transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 text-muted-light dark:text-muted-dark text-sm">
        <div className="flex items-center justify-center gap-2">
          <span className="font-extrabold text-text-light dark:text-text-dark">
            Guess Up
          </span>
          <span className="text-xs text-primary font-black px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30">
            Beta v1.0
          </span>
        </div>

        <p className="text-xs opacity-75 max-w-md mx-auto leading-relaxed">
          The ultimate motion-activated party charades game designed for Indian
          youth and families.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-6 mt-2 font-bold text-xs">
          <Link
            to="/privacy"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy Policy
          </Link>
          <a href="/#story" className="hover:text-primary transition-colors">
            Behind the Game
          </a>
          <a href="/#features" className="hover:text-primary transition-colors">
            Features
          </a>
          <a href="/#feedback" className="hover:text-primary transition-colors">
            Playtester Hub
          </a>
          <a href="/#download" className="hover:text-primary transition-colors">
            Download App
          </a>

          {/* Discreet Admin Lock Button */}
          <button
            onClick={handleAdminClick}
            className="hover:text-primary transition-colors flex items-center gap-1 opacity-60 hover:opacity-100 cursor-pointer ml-2"
            title="Admin Dashboard"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isAdminLoggedIn ? "Admin Dashboard" : "Admin Lock"}</span>
          </button>
        </div>

        <p className="text-[0.7rem] opacity-50 mt-4">
          &copy; {new Date().getFullYear()} Guess Up. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
