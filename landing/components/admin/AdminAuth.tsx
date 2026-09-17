import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Lock, Mail, ShieldAlert, ArrowLeft } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "../../lib/firebase";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ui/ThemeToggle";

interface AdminAuthProps {
  onAuthenticated: () => void;
}

export function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email.trim(), password);
      try {
        localStorage.setItem("bujho_admin_auth", "true");
        localStorage.setItem("guessup_admin_auth", "true");
      } catch (e) {}
      onAuthenticated();
    } catch (err: any) {
      console.error("Firebase auth error:", err);
      let msg = "Invalid Firebase admin credentials.";
      if (
        err?.code === "auth/invalid-credential" ||
        err?.code === "auth/wrong-password"
      ) {
        msg = "Incorrect email or password for Firebase authentication.";
      } else if (err?.code === "auth/user-not-found") {
        msg = "No admin user found with this email address.";
      } else if (err?.code === "auth/too-many-requests") {
        msg = "Too many failed attempts. Please wait a moment and try again.";
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 bg-brand-bg text-brand-text transition-colors duration-300 relative z-10">
      {/* Top Header Bar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-brand-muted hover:text-brand-text transition-colors group"
          id="admin-auth-back-home"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Login Card - Mobile First Responsive */}
      <div className="w-full max-w-md mx-auto my-auto p-5 sm:p-8 rounded-3xl bg-brand-surface border border-brand-border shadow-2xl relative overflow-hidden">
        <div className="text-center mb-6 pt-2">
          <Image
            src="/images/bujho-icon.png"
            alt="Bujho Logo"
            width={56}
            height={56}
            className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-2xl object-contain border border-brand-border shadow-md"
            priority
          />
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-brand-text uppercase">
            Bujho Admin Login
          </h1>
          <p className="text-xs font-medium text-brand-muted mt-1">
            Authenticate directly via Firebase Auth to manage decks &
            playtesters
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-brand-pass/15 text-brand-pass text-xs font-bold border border-brand-pass/30 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Firebase Admin Email"
            id="admin-email-input"
            type="email"
            placeholder="admin@bujho.app"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            id="admin-password-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            className="mt-3 text-sm sm:text-base font-extrabold shadow-lg"
          >
            Authenticate with Firebase
          </Button>
        </form>
      </div>

      <footer className="text-center text-[11px] text-brand-muted font-bold py-3">
        Bujho • Direct Firebase Authentication
      </footer>
    </div>
  );
}
