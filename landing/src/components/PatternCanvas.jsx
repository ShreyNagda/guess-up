import React, { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

const DECK_EMOJIS = ["🎬", "🏏", "🍔", "😎", "🎵", "🏆", "🎭", "🧠", "🎯"];

export const PatternCanvas = () => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const drawPattern = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.font = "32px Manrope, sans-serif";
      ctx.fillStyle = theme === "light" ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.04)";
      ctx.textBaseline = "top";

      const spacing = 140;
      const cols = Math.ceil(canvas.width / spacing) + 2;
      const rows = Math.ceil(canvas.height / spacing) + 2;

      const offsetX = (scrollRef.current * spacing) % (cols * spacing);
      const offsetY = (scrollRef.current * spacing) % (rows * spacing);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const emojiIdx = (i + j) % DECK_EMOJIS.length;

          let x = i * spacing + offsetX - spacing;
          let y = j * spacing + offsetY - spacing;

          x = x % (cols * spacing);
          y = y % (rows * spacing);

          ctx.fillText(DECK_EMOJIS[emojiIdx], x, y);
        }
      }

      scrollRef.current += 0.0008;
      animationFrameId = requestAnimationFrame(drawPattern);
    };

    drawPattern();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full block z-[-1] pointer-events-none transition-opacity duration-500"
    />
  );
};
