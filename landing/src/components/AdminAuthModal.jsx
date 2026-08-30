import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, KeyRound, X, AlertCircle } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useNavigate } from "react-router-dom";

export const AdminAuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, login } = useAdminAuth();
  const [passkey, setPasskey] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    const res = login(passkey);
    if (res.success) {
      setPasskey("");
      navigate("/admin");
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-surface-dark border-2 border-border-dark p-6 sm:p-8 rounded-3xl shadow-2xl text-text-dark"
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-dark hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Admin Passkey Challenge</h3>
            <p className="text-xs text-muted-dark leading-relaxed">
              Enter the internal admin secret key to unlock tester feedback analytics and game metrics dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-dark" />
              <input
                type="password"
                placeholder="Enter Admin Passkey..."
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                autoFocus
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface-card-dark border border-border-dark text-sm font-semibold text-text-dark placeholder:text-muted-dark outline-none focus:border-primary transition-all"
              />
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-error/15 border border-error/40 text-error text-xs font-bold"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={closeAuthModal}
                className="flex-1 py-3 rounded-xl border border-border-dark text-muted-dark font-extrabold text-xs hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-primary text-accent font-black text-xs hover:scale-102 active:scale-98 transition-all shadow-md cursor-pointer"
              >
                Unlock Dashboard
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
