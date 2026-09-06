import React, { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

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

      const color =
        theme === "light"
          ? "rgba(15, 12, 28, 0.04)"
          : "rgba(255, 255, 255, 0.04)";

      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;

      const spacing = 120;
      const cols = Math.ceil(canvas.width / spacing) + 2;
      const rows = Math.ceil(canvas.height / spacing) + 2;

      const offsetX = (scrollRef.current * spacing) % (cols * spacing);
      const offsetY = (scrollRef.current * spacing) % (rows * spacing);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          let x = i * spacing + offsetX - spacing;
          let y = j * spacing + offsetY - spacing;

          x = x % (cols * spacing);
          y = y % (rows * spacing);

          const shapeType = (i + j) % 4;

          ctx.beginPath();
          if (shapeType === 0) {
            // Plus Cross
            ctx.moveTo(x - 6, y);
            ctx.lineTo(x + 6, y);
            ctx.moveTo(x, y - 6);
            ctx.lineTo(x, y + 6);
            ctx.stroke();
          } else if (shapeType === 1) {
            // Small Circle Ring
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.stroke();
          } else if (shapeType === 2) {
            // Diamond Accent
            ctx.moveTo(x, y - 5);
            ctx.lineTo(x + 5, y);
            ctx.lineTo(x, y + 5);
            ctx.lineTo(x - 5, y);
            ctx.closePath();
            ctx.stroke();
          } else {
            // Solid Dot
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      scrollRef.current += 0.0006;
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

