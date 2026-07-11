import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border-light dark:border-border-dark py-8 px-4 text-center mt-auto bg-transparent transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex flex-col gap-3 text-muted-light dark:text-muted-dark text-sm">
        <p>&copy; {new Date().getFullYear()} Guess Up. All rights reserved.</p>
        <p className="text-[0.75rem] opacity-60 max-w-md mx-auto">
          A modern heads-up style mobile app built for party lovers in India.
        </p>
        <div className="flex justify-center gap-6 mt-2 font-bold text-[0.85rem]">
          <Link to="/privacy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <a href="/#features" className="hover:text-primary transition-colors">
            Features
          </a>
          <a href="/#download" className="hover:text-primary transition-colors">
            Download App
          </a>
        </div>
      </div>
    </footer>
  );
};
