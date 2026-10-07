"use client";

import React from "react";
import { Button } from "./Button";

export interface CTAButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function CTAButton({
  onClick,
  className = "",
  size = "lg",
  children,
  disabled = false,
  type = "button",
}: CTAButtonProps) {
  return (
    <Button
      type={type}
      variant="primary"
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={`font-lilita font-black tracking-wider uppercase ${className}`}
    >
      <span>{children || "Let the chaos begin ▶"}</span>
    </Button>
  );
}
