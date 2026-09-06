import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, ShieldCheck, Globe, Share2, MessageCircle } from "lucide-react";
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
    <footer className="border-t border-border/40 py-12 px-6 mt-auto bg-transparent relative">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 text-center text-muted text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-text text-base tracking-tight">Guess Up</span>
          <span className="text-[0.65rem] text-primary font-black px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 uppercase tracking-widest">
            Beta v1.0
          </span>
        </div>

        <p className="max-w-md leading-relaxed">
          The ultimate motion-activated party charades game designed for Indian youth, roommates, and families.
        </p>

        {/* Social Links & Navigation */}
        <div className="flex flex-wrap justify-center items-center gap-6 font-bold text-xs">
          <a href="#hero" className="hover:text-primary transition-colors">
            Home
          </a>
          <a href="#decks" className="hover:text-primary transition-colors">
            Decks
          </a>
          <a href="#story" className="hover:text-primary transition-colors">
            Origin Story
          </a>
          <a href="#testers" className="hover:text-primary transition-colors">
            Testers Wall
          </a>
          <a href="#feedback" className="hover:text-primary transition-colors">
            Feedback
          </a>
          <Link to="/privacy" className="hover:text-primary transition-colors flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy Policy
          </Link>
        </div>

        {/* Social Icons & Discreet Admin Link */}
        <div className="flex items-center justify-center gap-4 text-muted pt-2">
          <a href="#hero" className="hover:text-primary transition-colors p-2" title="Website">
            <Globe className="w-4 h-4" />
          </a>
          <a href="#feedback" className="hover:text-primary transition-colors p-2" title="Community Hub">
            <MessageCircle className="w-4 h-4" />
          </a>
          <a href="#hero" className="hover:text-primary transition-colors p-2" title="Share App">
            <Share2 className="w-4 h-4" />
          </a>
          <button
            onClick={handleAdminClick}
            className="hover:text-primary transition-colors p-2 opacity-50 hover:opacity-100 cursor-pointer text-[0.7rem] flex items-center gap-1"
            title="Admin Dashboard"
            rel="nofollow"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[0.7rem] opacity-50">
          &copy; {new Date().getFullYear()} Guess Up. All rights reserved. Zero ad tracking.
        </p>
      </div>
    </footer>
  );
};
