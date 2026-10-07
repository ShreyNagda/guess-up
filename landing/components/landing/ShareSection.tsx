"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Copy, Check, Share2, Twitter } from "lucide-react";
import { SITE_URL } from "@/lib/config";

interface ShareSectionProps {
  onToastMessage?: (msg: string) => void;
}

export function ShareSection({ onToastMessage }: ShareSectionProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const shareText = `Found early access to a new desi party game called Bujho — phone on forehead, friends shout clues. Get in before public launch: ${SITE_URL}`;

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText,
  )}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      if (onToastMessage) {
        onToastMessage("Link copied");
      }
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Failed to copy link:", e);
    }
  };

  return (
    <section className="py-12 md:py-16 bg-transparent transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-6 sm:p-10 rounded-3xl bg-brand-surface border-2 border-brand-border text-center shadow-xl space-y-6"
        >
          {/* Header */}
          <div className="max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-party-pink/10 text-party-pink text-xs font-black uppercase tracking-wider border border-party-pink/25">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share With Friends</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-lilita font-black text-brand-text uppercase tracking-tight">
              Know someone whose gang would love this?
            </h2>
            <p className="text-xs sm:text-base text-brand-muted font-bold leading-relaxed">
              Founders get 3 bonus deck unlocks at launch for every friend who
              joins early access through their link.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {/* WhatsApp Share */}
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-lilita text-sm sm:text-base uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Share on WhatsApp</span>
            </a>

            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-brand-surface hover:bg-brand-bg border-2 border-brand-border text-brand-text font-lilita text-sm sm:text-base uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-brand-muted" />
                  <span>Copy link</span>
                </>
              )}
            </button>

            {/* Share on X */}
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-neutral-900 hover:bg-black text-white font-lilita text-sm sm:text-base uppercase tracking-wider transition-all border border-neutral-700 shadow-sm active:scale-95"
            >
              <Twitter className="w-4 h-4 fill-current" />
              <span>Share on X</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
