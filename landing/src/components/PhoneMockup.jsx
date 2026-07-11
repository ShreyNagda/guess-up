import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const SCREENS = [
  "/images/onboarding2.png",
  "/images/correct_mockup.png",
  "/images/pass_mockup.png",
];

export const PhoneMockup = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SCREENS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex justify-center items-center w-full max-w-sm lg:max-w-md mx-auto aspect-500/260">
      {/* Background glow */}
      <div className="absolute inset-0 bg-radial from-primary/15 to-transparent blur-2xl z-0 pointer-events-none scale-125" />

      {/* Phone frame */}
      <div className="relative w-full h-full bg-surface-dark p-2 md:p-3 rounded-2xl md:rounded-3xl shadow-2xl flex z-10 border-4 border-[#2d2d2d]">
        {/* Notch - camera / speaker details */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[3.6%] h-[23%] bg-surface-dark rounded-r-lg z-30" />

        {/* Internal Screen */}
        <div className="relative flex-1 w-full h-full rounded-xl md:rounded-2xl overflow-hidden bg-black flex ">
          <AnimatePresence mode="wait">
            <motion.img
              key={SCREENS[index]}
              src={SCREENS[index]}
              alt="Guess Up Screen Mockup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
