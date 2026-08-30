import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

const DEMO_DECKS = [
  {
    id: "bollywood",
    name: "Bollywood",
    icon: "🎬",
    color: "#E91E63",
    words: [
      "Dilwale Dulhania Le Jayenge",
      "Shah Rukh Khan",
      "3 Idiots",
      "Sholay",
      "Pushpa",
      "Deepika Padukone",
      "Lagaan",
      "Stree",
      "Zindagi Na Milegi Dobara",
    ],
  },
  {
    id: "cricket",
    name: "Cricket Mania",
    icon: "🏏",
    color: "#2196F3",
    words: [
      "Sachin Tendulkar",
      "MS Dhoni",
      "Virat Kohli",
      "Cover Drive",
      "Wankhede Stadium",
      "Helicopter Shot",
      "Super Over",
      "IPL Trophy",
    ],
  },
  {
    id: "food",
    name: "Desi Food",
    icon: "🍕",
    color: "#FF9800",
    words: [
      "Samosa",
      "Pani Puri",
      "Masala Chai",
      "Biryani",
      "Chole Bhature",
      "Vada Pav",
      "Gulab Jamun",
      "Butter Chicken",
    ],
  },
];

// Audio Synth helper using Web Audio API (zero external sound file dependencies)
const playTone = (type) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "correct") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "pass") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === "win") {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + i * 0.08 + 0.25,
        );
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.25);
      });
    }
  } catch {}
};

// Canvas confetti burst generator
const triggerConfetti = (canvasEl) => {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext("2d");
  if (!ctx) return;
  const width = (canvasEl.width = canvasEl.offsetWidth);
  const height = (canvasEl.height = canvasEl.offsetHeight);

  const particles = Array.from({ length: 35 }).map(() => ({
    x: width / 2,
    y: height / 2,
    vx: (Math.random() - 0.5) * 12,
    vy: (Math.random() - 0.8) * 10,
    size: Math.random() * 6 + 4,
    color: ["#ffd600", "#ff4081", "#00e676", "#29b6f6", "#ab47bc"][
      Math.floor(Math.random() * 5)
    ],
    alpha: 1,
    rotation: Math.random() * 360,
  }));

  let animId;
  const render = () => {
    ctx.clearRect(0, 0, width, height);
    let active = false;

    particles.forEach((p) => {
      if (p.alpha <= 0) return;
      active = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravity
      p.alpha -= 0.025;
      p.rotation += 5;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    if (active) {
      animId = requestAnimationFrame(render);
    }
  };
  render();
};

export const InteractiveHeroDemo = () => {
  const [selectedDeckId, setSelectedDeckId] = useState("bollywood");
  const [gameState, setGameState] = useState("idle"); // 'idle' | 'playing' | 'ended'
  const [currentDeckWords, setCurrentDeckWords] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [flashColor, setFlashColor] = useState(null); // 'green' | 'amber'
  const canvasRef = useRef(null);

  const activeDeck =
    DEMO_DECKS.find((d) => d.id === selectedDeckId) || DEMO_DECKS[0];

  const startGame = () => {
    const shuffled = [...activeDeck.words].sort(() => Math.random() - 0.5);
    setCurrentDeckWords(shuffled);
    setWordIndex(0);
    setScore(0);
    setPassedCount(0);
    setTimeLeft(15);
    setGameState("playing");
  };

  useEffect(() => {
    let timer;
    if (gameState === "playing") {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState("ended");
            playTone("win");
            if (canvasRef.current) triggerConfetti(canvasRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  const handleGuess = (isCorrect) => {
    if (gameState !== "playing") return;

    if (isCorrect) {
      setScore((s) => s + 1);
      setFlashColor("green");
      playTone("correct");
      if (canvasRef.current) triggerConfetti(canvasRef.current);
    } else {
      setPassedCount((p) => p + 1);
      setFlashColor("amber");
      playTone("pass");
    }

    setTimeout(() => setFlashColor(null), 300);

    if (wordIndex + 1 < currentDeckWords.length) {
      setWordIndex((i) => i + 1);
    } else {
      setGameState("ended");
      playTone("win");
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[9/16] max-h-[580px] bg-slate-950 border-4 border-slate-800 rounded-[40px] shadow-2xl p-4 flex flex-col justify-between overflow-hidden text-white font-sans select-none">
      {/* Canvas layer for confetti */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-30 w-full h-full"
      />

      {/* Screen Notch / Camera Island */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full border border-white/10 z-40 flex items-center justify-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
        <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
      </div>

      {/* Background Glow */}
      <div
        className="absolute -inset-10 opacity-20 blur-3xl transition-colors duration-500 pointer-events-none"
        style={{ backgroundColor: activeDeck.color }}
      />

      {/* Header Bar */}
      <div className="pt-6 px-3 flex justify-between items-center z-10">
        <span className="text-xs font-black tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
          <span>{activeDeck.icon}</span> {activeDeck.name}
        </span>
        <div className="bg-white/10 border border-white/15 px-2.5 py-1 rounded-full text-xs font-mono font-bold text-amber-400">
          🎮 Web Demo
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-2 py-4">
        {/* Flash Effect on guess */}
        <AnimatePresence>
          {flashColor && (
            <motion.div
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`absolute inset-0 rounded-2xl pointer-events-none z-20 ${
                flashColor === "green" ? "bg-emerald-500/30" : "bg-amber-500/30"
              }`}
            />
          )}
        </AnimatePresence>

        {gameState === "idle" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-5 w-full"
          >
            <div className="w-16 h-16 rounded-3xl bg-primary/20 border-2 border-primary flex items-center justify-center text-3xl shadow-lg">
              {activeDeck.icon}
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                Quick Charades Demo
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Pick a deck below and try guessing 15 seconds of cards on screen!
              </p>
            </div>

            {/* Deck Selector Pills */}
            <div className="flex gap-2 w-full justify-center">
              {DEMO_DECKS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeckId(d.id)}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                    selectedDeckId === d.id
                      ? "bg-primary text-black scale-105 shadow-md"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  <span>{d.icon}</span>
                  <span>{d.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={startGame}
              className="w-full max-w-xs py-3.5 bg-primary text-accent font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer mt-2"
            >
              🚀 Start 15s Demo
            </button>
          </motion.div>
        )}

        {gameState === "playing" && (
          <div className="flex flex-col items-center justify-between h-full w-full py-4">
            {/* Top Game Timer Bar */}
            <div className="w-full flex items-center justify-between bg-black/40 border border-white/10 px-4 py-2 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase">
                  Time:
                </span>
                <span className="text-lg font-black font-mono text-primary animate-pulse">
                  {timeLeft}s
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="text-emerald-400">✓ {score}</span>
                <span className="text-amber-400">✗ {passedCount}</span>
              </div>
            </div>

            {/* Active Card Cardboard Container */}
            <motion.div
              key={wordIndex}
              initial={{ scale: 0.8, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -15 }}
              className="w-full bg-gradient-to-b from-slate-900 to-slate-950 border-3 border-primary/40 rounded-3xl p-6 my-auto text-center shadow-2xl flex flex-col justify-center items-center min-h-[160px]"
            >
              <span className="text-[0.65rem] uppercase tracking-widest text-primary font-black mb-2 opacity-80">
                GUESS THE CARD:
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-md">
                {currentDeckWords[wordIndex]}
              </h2>
            </motion.div>

            {/* Simulated Physical Tilt Buttons */}
            <div className="w-full flex flex-col gap-2 z-20">
              <p className="text-[0.65rem] text-slate-400 uppercase tracking-wider font-extrabold text-center">
                Simulated Forehead Motion Controls:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleGuess(true)}
                  className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>👇 Tilt Down</span>
                  <span className="bg-black/20 px-1.5 py-0.5 rounded text-[0.65rem]">
                    +1
                  </span>
                </button>
                <button
                  onClick={() => handleGuess(false)}
                  className="py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>👆 Tilt Up</span>
                  <span className="bg-black/20 px-1.5 py-0.5 rounded text-[0.65rem]">
                    Pass
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === "ended" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-4 w-full"
          >
            <div className="text-4xl">🎉</div>
            <div>
              <h3 className="text-2xl font-black uppercase text-primary tracking-tight">
                Demo Complete!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                You scored <strong>{score} points</strong> in 15 seconds!
              </p>
            </div>

            <div className="bg-black/50 border border-white/10 rounded-2xl p-4 w-full flex justify-around text-center my-2">
              <div>
                <span className="text-[0.65rem] uppercase font-bold text-slate-400 block">
                  Correct
                </span>
                <span className="text-xl font-black text-emerald-400">
                  {score}
                </span>
              </div>
              <div className="border-r border-white/10" />
              <div>
                <span className="text-[0.65rem] uppercase font-bold text-slate-400 block">
                  Passed
                </span>
                <span className="text-xl font-black text-amber-400">
                  {passedCount}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={startGame}
                className="w-full py-3 bg-primary text-accent font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                🔄 Play Demo Again
              </button>
              <button
                onClick={() => setGameState("idle")}
                className="w-full py-2 bg-white/10 text-slate-300 font-extrabold text-xs rounded-xl hover:bg-white/20 transition-all cursor-pointer"
              >
                ← Select Different Deck
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Home Indicator */}
      <div className="pb-1 flex justify-center z-10">
        <div className="w-28 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
};
