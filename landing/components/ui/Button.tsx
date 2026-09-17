"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends Omit<
  HTMLMotionProps<"button">,
  "children"
> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-black rounded-full uppercase tracking-wider transition-colors duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer select-none whitespace-nowrap";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-[11px] sm:px-4 sm:py-2 sm:text-xs",
    md: "px-4 py-2.5 text-xs sm:px-6 sm:py-3 sm:text-sm md:text-base",
    lg: "px-4 py-3 text-xs sm:px-6 sm:py-3.5 sm:text-base md:px-8 md:py-4 md:text-lg",
  };

  const variantStyles = {
    primary:
      "bg-brand-primary text-[var(--primary-text)] hover:bg-brand-primary-hover border border-[var(--primary-text)]/20 shadow-[0_6px_0_0_var(--primary-shadow)] hover:shadow-[0_8px_0_0_var(--primary-shadow)] active:shadow-[0_2px_0_0_var(--primary-shadow)]",
    secondary:
      "bg-brand-surface text-brand-text hover:bg-brand-card border border-brand-border shadow-[0_4px_0_0_var(--btn-3d-shadow)] hover:shadow-[0_6px_0_0_var(--btn-3d-shadow)] active:shadow-[0_2px_0_0_var(--btn-3d-shadow)]",
    outline:
      "bg-transparent border-2 border-brand-border text-brand-text hover:bg-brand-surface/60 shadow-[0_4px_0_0_var(--btn-3d-shadow)] hover:shadow-[0_6px_0_0_var(--btn-3d-shadow)] active:shadow-[0_2px_0_0_var(--btn-3d-shadow)]",
    ghost:
      "bg-transparent text-brand-text hover:bg-brand-surface/40 shadow-none border-none tracking-normal font-bold lowercase capitalize",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-current" />
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
