import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Lock, EyeOff, Radio, X, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export const PrivacyModalDrawer = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-surface border-2 border-border p-6 sm:p-8 rounded-3xl shadow-2xl text-text my-8 max-h-[85vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-surface-card hover:bg-surface-card/80 text-muted hover:text-text transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-6 border-b border-border/60 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight text-text">
                Privacy & Data Policy
              </h3>
              <p className="text-xs text-muted">
                Guess Up 100% On-Device & Zero-Tracking Guarantee
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 text-xs sm:text-sm leading-relaxed text-muted">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-surface-card border border-border flex flex-col gap-2">
                <div className="flex items-center gap-2 font-black text-text text-xs">
                  <Lock className="w-4 h-4 text-primary" /> No User Accounts
                </div>
                <p className="text-[0.75rem]">
                  Zero registration required. Open the app and play immediately.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-card border border-border flex flex-col gap-2">
                <div className="flex items-center gap-2 font-black text-text text-xs">
                  <EyeOff className="w-4 h-4 text-primary" /> No Ad SDKs
                </div>
                <p className="text-[0.75rem]">
                  No ad networks, tracking pixels, or cross-app identifiers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-card border border-border flex flex-col gap-2">
                <div className="flex items-center gap-2 font-black text-text text-xs">
                  <Radio className="w-4 h-4 text-primary" /> Local Sensors
                </div>
                <p className="text-[0.75rem]">
                  Gyroscope streams stay 100% local during rounds.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 border-t border-border/40">
              <h4 className="font-extrabold text-text text-base">Full Compliance Statement</h4>
              <p>
                <strong>1. Information We Collect:</strong> Guess Up does not collect personal identifiers, device contact lists, or location data. When you submit feedback or join the beta list, your email and feedback notes are securely processed via Firebase Firestore.
              </p>
              <p>
                <strong>2. Motion Sensing & Accelerometer Data:</strong> Orientation vectors derived from device sensors are evaluated strictly on-device to score tilt gestures (Tilt Down = Correct, Tilt Up = Pass). Sensor data is never cached or uploaded to remote servers.
              </p>
              <p>
                <strong>3. Children's Privacy (COPPA & GDPR):</strong> Because Guess Up collects no personal data or location tracking during gameplay, it is safe for family gatherings and players of all ages.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <Link
                to="/privacy"
                onClick={onClose}
                className="text-xs font-black text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                View Full Legal Page <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-primary text-accent font-black text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-md cursor-pointer"
              >
                Close Policy
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
