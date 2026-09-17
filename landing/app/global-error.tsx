"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0B0F19] text-white flex flex-col items-center justify-center min-h-screen p-4 text-center font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#161C2B] border border-amber-500/30 shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 text-2xl font-black">
            ⚡
          </div>
          <h1 className="text-2xl font-black mb-2 uppercase tracking-tight">
            Application Error
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            A critical error occurred. Click below to refresh the application.
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-3 px-6 rounded-full bg-amber-400 text-black font-black uppercase text-xs tracking-wider hover:bg-amber-300 transition-colors cursor-pointer"
          >
            Refresh App
          </button>
        </div>
      </body>
    </html>
  );
}
