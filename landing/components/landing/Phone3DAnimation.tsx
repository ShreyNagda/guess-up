"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Pause, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "../ui/Button";

interface Phone3DAnimationProps {
  className?: string;
}

export function Phone3DAnimation({ className = "" }: Phone3DAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.3 });

  const [tiltState, setTiltState] = useState<"idle" | "down" | "up">("idle");
  const [overlayState, setOverlayState] = useState<"none" | "correct" | "pass">(
    "none",
  );
  const [score, setScore] = useState<number>(1);
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [loopCount, setLoopCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const cardItems = [
    { word: "Dal Makhani", category: "Sweet & Spicy", icon: "" },
    { word: "Dhurandhar", category: "Bollywood Buff", icon: "" },
    { word: "MS Dhoni", category: "Cricket Fever", icon: "" },
    { word: "India Gate", category: "Incredible India", icon: "" },
  ];

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (!isInView || isCompleted) return;

    const runSequence = () => {
      // Step 1: Idle display
      setTiltState("idle");
      setOverlayState("none");

      timeoutId = setTimeout(() => {
        // Step 2: Tilt DOWN for CORRECT
        setTiltState("up");
        setOverlayState("correct");
        setScore((prev) => prev + 1);

        timeoutId = setTimeout(() => {
          // Step 3: Return to Idle
          setTiltState("idle");
          setOverlayState("none");
          setWordIndex((prev) => (prev + 1) % cardItems.length);

          timeoutId = setTimeout(() => {
            // Step 4: Tilt UP for PASS
            setTiltState("down");
            setOverlayState("pass");

            timeoutId = setTimeout(() => {
              // Step 5: Return to Idle & loop count check
              setTiltState("idle");
              setOverlayState("none");
              setWordIndex((prev) => (prev + 1) % cardItems.length);

              setLoopCount((count) => {
                const nextCount = count + 1;
                if (nextCount >= 3) {
                  setIsCompleted(true);
                }
                return nextCount;
              });
            }, 800);
          }, 1800);
        }, 1000);
      }, 2000);
    };

    runSequence();

    return () => clearTimeout(timeoutId);
  }, [isInView, loopCount, isCompleted, cardItems.length]);

  const handleReplay = () => {
    setScore(1);
    setWordIndex(0);
    setLoopCount(0);
    setIsCompleted(false);
    setTiltState("idle");
    setOverlayState("none");
  };

  const getRotateX = () => {
    if (tiltState === "down") return 28;
    if (tiltState === "up") return -28;
    return 0;
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center w-full bg-transparent ${className}`}
    >
      {/* 3D Perspective Container - Scaled up for medium (md), large (lg), and extra-large (xl) screens */}
      <div
        className="perspective-1000 w-full max-w-85 sm:max-w-105 md:max-w-145 lg:max-w-175 xl:max-w-200 aspect-19.5/9 flex items-center justify-center bg-transparent transition-all duration-300"
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          animate={{
            rotateX: getRotateX(),
            scale: tiltState === "idle" ? 1 : 0.97,
          }}
          transition={{
            duration: 0.45,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="will-change-transform relative w-full h-full rounded-3xl md:rounded-[36px] border-2 md:border-3 border-neutral-700/80 ring-1 ring-white/10 p-1.5 sm:p-2.5 md:p-3 bg-neutral-900 shadow-2xl shadow-brand-primary/10 flex items-center justify-center select-none"
        >
          {/* Inner Phone Screen Container */}
          <div className="relative w-full h-full bg-neutral-950 overflow-hidden rounded-[18px] md:rounded-[28px]">
            {/* Camera Notch Pill */}
            <div className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 bg-neutral-800/90 rounded-full z-20 flex flex-col items-center justify-center border-[0.5px] border-neutral-700/50 p-[0.5px]">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-black rounded-full border-[0.5px] border-neutral-700" />
            </div>

            {/* Game Screen Header Bar */}
            <div className="absolute top-3 sm:top-5 md:top-6 left-4 sm:left-7 right-4 sm:right-7 z-20 flex items-center justify-between text-white font-extrabold tracking-wide pointer-events-none">
              <span className="text-brand-text font-black text-sm sm:text-base md:text-xl lg:text-2xl">
                {score}
              </span>

              {/* Top-Center: Circular Timer Ring */}
              <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-13 md:h-13 lg:w-16 lg:h-16">
                <svg className="w-7 h-7 sm:w-10 sm:h-10 md:w-13 md:h-13 lg:w-16 lg:h-16 transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="3"
                    fill="transparent"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke="#FFB700"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray="90"
                    strokeDashoffset="22"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs sm:text-sm md:text-base lg:text-lg text-brand-text font-black">
                  26
                </span>
              </div>
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-brand-text fill-brand-text" />
            </div>

            {/* Center Word Display - Dead Centered to Entire Phone Screen Geometry */}
            <div className="absolute bg-brand-surface inset-0 z-10 flex items-center justify-center text-center p-2.5 sm:p-5 md:p-8 select-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={wordIndex}
                  initial={{ opacity: 0, scale: 0.85, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex flex-col items-center justify-center gap-1 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-4 rounded-2xl max-w-[88%]"
                >
                  <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-amber-300 drop-shadow-[0_2px_15px_rgba(255,214,0,0.45)] uppercase leading-tight sm:leading-snug">
                    {cardItems[wordIndex].word}
                  </h2>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Full Screen Overlay: CORRECT */}
            <AnimatePresence>
              {overlayState === "correct" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-30 bg-emerald-600 flex flex-col items-center justify-center text-white p-4 text-center rounded-[18px] md:rounded-[28px]"
                >
                  <span className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-wider uppercase drop-shadow-md">
                    CORRECT!
                  </span>
                  <span className="text-xs sm:text-sm md:text-base font-extrabold mt-1 sm:mt-2 text-emerald-100 bg-emerald-700/60 px-3 sm:px-4 py-1 rounded-lg">
                    +1 POINT
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Full Screen Overlay: PASS */}
            <AnimatePresence>
              {overlayState === "pass" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-30 bg-rose-600 flex flex-col items-center justify-center text-white p-4 text-center rounded-[18px] md:rounded-[28px]"
                >
                  <span className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-wider uppercase drop-shadow-md">
                    PASS
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {isCompleted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-40 bg-blend-darken backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center rounded-[18px] md:rounded-[28px]"
              >
                <Button
                  variant="outline"
                  size="md"
                  className="bg-brand-surface!"
                  onClick={handleReplay}
                >
                  Replay Demo
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
