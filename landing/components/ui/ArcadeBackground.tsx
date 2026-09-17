"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
  isStar: boolean;
}

export function ArcadeBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let isDark = document.documentElement.classList.contains("dark");

    // Initialize 24 floating arcade particles matching Flutter AmbientBackground
    const particleCount = 24;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        speed: 0.0003 + Math.random() * 0.0007,
        size: 4 + Math.random() * 8,
        opacity: 0.25 + Math.random() * 0.55,
        isStar: i % 2 === 0,
      });
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Watch for class changes on documentElement (light/dark theme toggle)
    const observer = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains("dark");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const drawStar = (
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
    ) => {
      context.beginPath();
      context.moveTo(cx, cy - size);
      context.quadraticCurveTo(cx, cy, cx + size, cy);
      context.quadraticCurveTo(cx, cy, cx, cy + size);
      context.quadraticCurveTo(cx, cy, cx - size, cy);
      context.quadraticCurveTo(cx, cy, cx, cy - size);
      context.closePath();
      context.fill();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Base Arcade Deep Canvas Color
      const bgColor = isDark ? "#0E0C1C" : "#F4F6FC";
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // 2. Dynamic Radial Color Aura (Top Center Glow)
      const auraX = width * 0.5;
      const auraY = height * 0.25;
      const auraRadius = Math.max(width, height) * 0.75;
      const radial = ctx.createRadialGradient(
        auraX,
        auraY,
        0,
        auraX,
        auraY,
        auraRadius,
      );

      if (isDark) {
        radial.addColorStop(0, "rgba(255, 214, 0, 0.26)");
        radial.addColorStop(0.55, "rgba(255, 214, 0, 0.07)");
        radial.addColorStop(1, "rgba(255, 214, 0, 0)");
      } else {
        radial.addColorStop(0, "rgba(255, 183, 0, 0.22)");
        radial.addColorStop(0.55, "rgba(255, 183, 0, 0.05)");
        radial.addColorStop(1, "rgba(255, 183, 0, 0)");
      }

      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      // 3. Diagonal Arcade Mesh Pattern Overlay (45 degree diagonal lines)
      ctx.strokeStyle = isDark
        ? "rgba(255, 255, 255, 0.04)"
        : "rgba(0, 0, 0, 0.05)";
      ctx.lineWidth = 1.2;

      const step = 32;
      ctx.beginPath();
      for (let i = -height; i < width + height; i += step) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
      }
      ctx.stroke();

      // 4. Floating Animated Arcade Micro Particles
      for (const p of particles) {
        p.y -= p.speed;
        if (p.y < 0) {
          p.y = 1;
          p.x = Math.random();
        }

        const px = p.x * width;
        const py = p.y * height;

        const pColor = isDark
          ? `rgba(255, 214, 0, ${p.opacity})`
          : p.isStar
            ? `rgba(217, 119, 6, ${p.opacity})`
            : `rgba(245, 158, 11, ${p.opacity})`;

        ctx.fillStyle = pColor;

        if (p.isStar) {
          drawStar(ctx, px, py, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 transition-opacity duration-500"
    />
  );
}
