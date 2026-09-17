"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-brand-surface border border-brand-border shadow-xs opacity-50" />
    );
  }

  const isDark = (resolvedTheme || theme) === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      id="theme-toggle-btn"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="p-2.5 rounded-full bg-brand-surface text-brand-text hover:scale-105 active:scale-95 transition-all duration-200 border border-brand-border cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-brand-primary drop-shadow-xs" />
      ) : (
        <Moon className="w-5 h-5 text-brand-text fill-current" />
      )}
    </button>
  );
}
