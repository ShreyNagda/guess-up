"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", id, ...props }, ref) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-black uppercase tracking-wider text-brand-muted mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full ${
              icon ? "pl-10" : "px-4"
            } py-3.5 bg-brand-surface text-brand-text border-2 ${
              error
                ? "border-brand-pass ring-2 ring-brand-pass/20"
                : "focus:border-brand-primary"
            } rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all text-base placeholder-brand-muted shadow-xs font-medium ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-brand-pass font-bold">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
