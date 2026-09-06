import React from "react";
import { motion } from "motion/react";

export const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  ariaLabel = "Toggle switch",
  size = "md",
}) => {
  const isSm = size === "sm";

  const trackWidth = isSm ? "w-9 h-5" : "w-12 h-6.5";
  const thumbSize = isSm ? "w-3.5 h-3.5" : "w-4.5 h-4.5";
  const travelX = isSm ? 16 : 22;

  const handleClick = (e) => {
    e.stopPropagation();
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      className={`relative inline-flex items-center shrink-0 rounded-full p-1 cursor-pointer transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${trackWidth} ${
        checked
          ? "bg-primary shadow-sm"
          : "bg-surface-card-dark border border-border-dark"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        animate={{
          x: checked ? travelX : 0,
        }}
        className={`rounded-full shadow-md ${thumbSize} ${
          checked ? "bg-accent" : "bg-muted-dark"
        }`}
      />
    </button>
  );
};
