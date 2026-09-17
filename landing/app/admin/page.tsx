"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Layers, Users, LogOut } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { AdminAuth } from "@/components/admin/AdminAuth";
import { DecksManager } from "@/components/admin/DecksManager";
import { TestersManager } from "@/components/admin/TestersManager";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"decks" | "testers">("decks");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsAuthenticated(true);
        } else {
          try {
            const authStatus =
              localStorage.getItem("bujho_admin_auth") ||
              localStorage.getItem("guessup_admin_auth");
            setIsAuthenticated(authStatus === "true");
          } catch (e) {
            setIsAuthenticated(false);
          }
        }
        setMounted(true);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error(e);
      setMounted(true);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    try {
      localStorage.removeItem("bujho_admin_auth");
      localStorage.removeItem("guessup_admin_auth");
    } catch (e) {}
    setIsAuthenticated(false);
  };

  if (!mounted) {
    return <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans transition-colors duration-300 relative z-10">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-brand-surface/90 backdrop-blur-md border-b border-brand-border transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/bujho-icon.png"
              alt="Bujho Logo"
              width={36}
              height={36}
              className="w-9 h-9 rounded-xl object-contain shadow-sm border border-brand-border"
              priority
            />
            <div>
              <h1 className="font-black text-brand-text text-base sm:text-lg tracking-tight uppercase leading-tight">
                Bujho Admin
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Tabs */}
            <nav className="flex items-center gap-1 bg-brand-bg p-1 rounded-xl border border-brand-border">
              <button
                onClick={() => setActiveTab("decks")}
                className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === "decks"
                    ? "bg-brand-primary text-brand-text shadow-md"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Decks</span>
              </button>

              <button
                onClick={() => setActiveTab("testers")}
                className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === "testers"
                    ? "bg-brand-primary text-brand-text shadow-md"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Testers</span>
              </button>
            </nav>

            <ThemeToggle />

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold transition-colors cursor-pointer border border-red-500/20"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === "decks" ? <DecksManager /> : <TestersManager />}
      </main>
    </div>
  );
}
