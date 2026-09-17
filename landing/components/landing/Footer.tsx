"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Modal } from "../ui/Modal";
import { ThemeToggle } from "../ui/ThemeToggle";

export function Footer() {
  const [activeModal, setActiveModal] = useState<"terms" | null>(null);

  return (
    <footer className="py-10 border-t border-brand-border text-xs text-brand-muted bg-brand-surface transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Copyright */}
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/bujho-icon.png"
            alt="Bujho Icon"
            width={24}
            height={24}
            className="w-6 h-6 rounded-lg object-contain border border-brand-border"
          />
          <span className="font-black text-brand-text uppercase tracking-tight">
            Bujho
          </span>
          <span className="font-bold">
            © {new Date().getFullYear()} All rights reserved. 100% Ad-Free
            Motion Charades.
          </span>
        </div>

        {/* Links & Theme Toggle */}
        <div className="flex items-center gap-6">
          <Link
            href="/feedback"
            id="footer-feedback-link"
            className="hover:text-brand-text transition-colors font-extrabold"
          >
            Submit Feedback
          </Link>
          <Link
            href="/privacy"
            id="footer-privacy-policy-link"
            className="hover:text-brand-text transition-colors font-extrabold"
          >
            Privacy Policy
          </Link>
          <button
            onClick={() => setActiveModal("terms")}
            id="footer-terms-link"
            className="hover:text-brand-text transition-colors font-extrabold cursor-pointer"
          >
            Terms of Service
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Terms of Service Modal */}
      <Modal
        isOpen={activeModal === "terms"}
        onClose={() => setActiveModal(null)}
        title="Terms of Service"
      >
        <div className="space-y-3 text-sm text-brand-muted font-bold leading-relaxed">
          <p>
            By signing up for early access, you agree to receive email
            notifications regarding Bujho Android beta testing builds and
            release updates.
          </p>
          <p>
            Bujho is currently under active development. Game features, card
            content, and user interface elements are subject to continuous
            enhancement prior to public launch.
          </p>
        </div>
      </Modal>
    </footer>
  );
}

export default Footer;
