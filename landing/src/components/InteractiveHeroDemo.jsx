import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, RotateCcw, Volume2, VolumeX, Sparkles, RefreshCw } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { normalizeCategory } from "../utils/categoryModel";

const DEMO_DECKS = [
  {
    id: "bollywood",
    name: "Bollywood",
    icon: "🎬",
    color: "#FFD600",
    words: [
      "Dilwale Dulhania Le Jayenge",
      "Shah Rukh Khan",
      "3 Idiots",
      "Sholay",
      "Pushpa",
      "Deepika Padukone",
      "Lagaan",
      "Stree 2",
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
    icon: "🍔",
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

// Audio Synth helper using Web Audio API
const playTone = (type) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "correct") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
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
      p.vy += 0.4;
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
  const [liveDecks, setLiveDecks] = useState([]);
  const [isLiveLoading, setIsLiveLoading] = useState(true);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [gameState, setGameState] = useState("idle"); // 'idle' | 'playing' | 'ended'
  const [currentDeckWords, setCurrentDeckWords] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [flashColor, setFlashColor] = useState(null); // 'green' | 'amber'
  const canvasRef = useRef(null);

  // Subscribe to real-time Firestore 'categories' collection
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onSnapshot(
        collection(db, "categories"),
        (snapshot) => {
          const list = [];
          snapshot.forEach((docSnap) => {
            const norm = normalizeCategory(docSnap.id, docSnap.data());
            if (norm.isAvailable && norm.words && norm.words.length > 0) {
              list.push(norm);
            }
          });
          list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setLiveDecks(list);
          setIsLiveLoading(false);
        },
        (err) => {
          console.warn("Firestore live demo subscription fallback:", err);
          setIsLiveLoading(false);
        }
      );
    } catch (_) {
      setIsLiveLoading(false);
    }
    return () => unsubscribe();
  }, []);

  const activeDecksList = liveDecks.length > 0 ? liveDecks : DEMO_DECKS;

  const activeDeck =
    activeDecksList.find((d) => d.id === selectedDeckId || d.deckId === selectedDeckId) ||
    activeDecksList[0];

  const startGame = () => {
    const rawWords = activeDeck ? activeDeck.words : [];
    const shuffled = [...rawWords].sort(() => Math.random() - 0.5);
    setCurrentDeckWords(shuffled.length > 0 ? shuffled : ["Guess Up", "Charades", "Party"]);
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
    <div
      id="interactive-hero-demo"
      className="relative w-full max-w-3xl mx-auto aspect-[16/9] min-h-[340px] sm:min-h-[380px] bg-slate-950 border-4 sm:border-6 border-slate-800 rounded-[32px] sm:rounded-[40px] shadow-2xl p-4 sm:p-6 flex flex-col justify-between overflow-hidden text-white font-sans select-none border-bevel-dark"
    >
      {/* Canvas layer for confetti */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-30 w-full h-full"
      />

      {/* Screen Landscape Camera Notch / Island (Left side) */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-16 bg-black rounded-full border border-white/10 z-40 hidden sm:flex flex-col items-center justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700" />
        <div className="w-1 h-1 rounded-full bg-blue-900/60" />
      </div>

      {/* Ambient Background Glow */}
      <div
        className="absolute -inset-10 opacity-25 blur-3xl transition-colors duration-500 pointer-events-none"
        style={{ backgroundColor: activeDeck?.color || "#FFD600" }}
      />

      {/* Header Bar */}
      <div className="px-2 sm:px-6 flex justify-between items-center z-10">
        <span className="text-xs font-black tracking-wider uppercase text-slate-400 flex items-center gap-2">
          <span className="text-base">{activeDeck?.icon || "🎮"}</span> {activeDeck?.name || activeDeck?.title || "Bollywood"}
        </span>
        <div className="bg-white/10 border border-white/15 px-3 py-1 rounded-full text-xs font-mono font-bold text-primary flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" /> Live Firestore Data
        </div>
      </div>

      {/* Main Interactive Screen Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-2 sm:px-6 py-2">
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

        {/* IDLE STATE */}
        {gameState === "idle" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-4 w-full max-w-lg"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/20 border-2 border-primary flex items-center justify-center text-3xl shadow-lg">
              {activeDeck?.icon || "🎮"}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                Try Forehead Charades Live Demo
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select a live Firestore deck below and test out 15 seconds of landscape tilt gameplay!
              </p>
            </div>

            {/* Live Firestore Deck Selector Pills */}
            <div className="flex flex-wrap gap-2 w-full justify-center max-h-24 overflow-y-auto p-1">
              {activeDecksList.slice(0, 6).map((d) => {
                const deckKey = d.id || d.deckId;
                const isSelected = (activeDeck?.id || activeDeck?.deckId) === deckKey;
                return (
                  <button
                    key={deckKey}
                    onClick={() => setSelectedDeckId(deckKey)}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-primary text-accent scale-105 shadow-md"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    <span>{d.icon || "🎮"}</span>
                    <span>{d.name || d.title}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={startGame}
              className="w-full max-w-xs py-3 rounded-2xl bg-primary text-accent font-black text-xs uppercase tracking-wider shadow-bevel-gold hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-accent" /> Start 15s Landscape Demo
            </button>
          </motion.div>
        )}

        {/* PLAYING STATE */}
        {gameState === "playing" && (
          <div className="flex flex-col items-center justify-between h-full w-full py-1">
            {/* Top Game Timer Bar */}
            <div className="w-full flex items-center justify-between bg-black/50 border border-white/10 px-4 py-1.5 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase">
                  Time Left:
                </span>
                <span className="text-base font-black font-mono text-primary animate-pulse">
                  {timeLeft}s
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-black">
                <span className="text-emerald-400">Correct: ✓ {score}</span>
                <span className="text-amber-400">Pass: ✗ {passedCount}</span>
              </div>
            </div>

            {/* Active Cardboard Display */}
            <motion.div
              key={wordIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full bg-gradient-to-b from-slate-900 to-slate-950 border-3 border-primary/50 rounded-2xl p-4 my-auto text-center shadow-2xl flex flex-col justify-center items-center min-h-[110px] sm:min-h-[130px]"
            >
              <span className="text-[0.65rem] uppercase tracking-widest text-primary font-black mb-1 opacity-80">
                GUESS THE CARD:
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white leading-tight drop-shadow-md tracking-wide uppercase">
                {currentDeckWords[wordIndex]}
              </h2>
            </motion.div>

            {/* Simulated Physical Tilt Buttons */}
            <div className="w-full flex flex-col gap-1.5 z-20">
              <span className="text-[0.65rem] text-slate-400 uppercase tracking-wider font-extrabold text-center">
                Simulated Forehead Tilt Controls:
              </span>
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full">
                <button
                  onClick={() => handleGuess(true)}
                  className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>👇 Tilt Down (Correct)</span>
                  <span className="bg-black/20 px-1.5 py-0.5 rounded text-[0.65rem]">
                    +1
                  </span>
                </button>
                <button
                  onClick={() => handleGuess(false)}
                  className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>👆 Tilt Up (Pass)</span>
                  <span className="bg-black/20 px-1.5 py-0.5 rounded text-[0.65rem]">
                    Pass
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ENDED STATE */}
        {gameState === "ended" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-3 w-full max-w-md"
          >
            <div className="text-3xl">🎉</div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-primary tracking-tight">
                Demo Complete!
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                You scored <strong>{score} points</strong> in 15 seconds!
              </p>
            </div>

            <div className="bg-black/50 border border-white/10 rounded-2xl p-3 w-full flex justify-around text-center my-1">
              <div>
                <span className="text-[0.65rem] uppercase font-bold text-slate-400 block">
                  Correct Cards
                </span>
                <span className="text-lg font-black text-emerald-400">
                  {score}
                </span>
              </div>
              <div className="border-r border-white/10" />
              <div>
                <span className="text-[0.65rem] uppercase font-bold text-slate-400 block">
                  Passed Cards
                </span>
                <span className="text-lg font-black text-amber-400">
                  {passedCount}
                </span>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={startGame}
                className="flex-1 py-2.5 bg-primary text-accent font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Play Again
              </button>
              <button
                onClick={() => setGameState("idle")}
                className="flex-1 py-2.5 bg-white/10 text-slate-300 font-extrabold text-xs rounded-xl hover:bg-white/20 transition-all cursor-pointer"
              >
                ← Switch Deck
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Bar Accent */}
      <div className="px-2 sm:px-6 flex justify-between items-center text-[0.65rem] font-bold text-slate-500 z-10">
        <span>GUESS UP CHARADES</span>
        <span>REAL-TIME FIRESTORE DATA STREAM</span>
      </div>
    </div>
  );
};
