import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  RotateCcw,
  Smartphone,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  User,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react";

const DEMO_20_WORDS = [
  { word: "Sholay", deck: "Bollywood Buff", icon: "🎬" },
  { word: "MS Dhoni", deck: "Cricket Fever", icon: "🏏" },
  { word: "Pani Puri", deck: "Sweet & Spicy", icon: "🍔" },
  { word: "Virat Kohli", deck: "Cricket Fever", icon: "🏏" },
  { word: "Dilwale Dulhania Le Jayenge", deck: "Bollywood Buff", icon: "🎬" },
  { word: "Butter Chicken", deck: "Sweet & Spicy", icon: "🍔" },
  { word: "3 Idiots", deck: "Bollywood Buff", icon: "🎬" },
  { word: "Wankhede Stadium", deck: "Cricket Fever", icon: "🏏" },
  { word: "Vada Pav", deck: "Aamchi Mumbai", icon: "🏙️" },
  { word: "Super Over", deck: "Cricket Fever", icon: "🏏" },
  { word: "Pushpa", deck: "Bollywood Buff", icon: "🎬" },
  { word: "Biryani", deck: "Sweet & Spicy", icon: "🍔" },
  { word: "Helicopter Shot", deck: "Cricket Fever", icon: "🏏" },
  { word: "Stree 2", deck: "Bollywood Buff", icon: "🎬" },
  { word: "Taj Mahal", deck: "Incredible India", icon: "🇮🇳" },
  { word: "Pav Bhaji", deck: "Sweet & Spicy", icon: "🍔" },
  { word: "Marine Drive", deck: "Aamchi Mumbai", icon: "🏙️" },
  { word: "Jugaad", deck: "Incredible India", icon: "🇮🇳" },
  { word: "Tapri Chai", deck: "Sweet & Spicy", icon: "🍔" },
  { word: "Auto Rickshaw", deck: "Incredible India", icon: "🇮🇳" },
];

export const InteractiveHeroDemo = () => {
  const [gameState, setGameState] = useState("idle"); // 'idle' | 'playing' | 'ended'
  const [selectedTimer, setSelectedTimer] = useState(60); // 30, 45, 60, 90
  const [gameMode, setGameMode] = useState("solo"); // 'solo' | 'team'
  const [activeTeam, setActiveTeam] = useState("Team A"); // 'Team A' | 'Team B'
  const [teamScores, setTeamScores] = useState({ "Team A": 0, "Team B": 0 });

  const [words, setWords] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [flashColor, setFlashColor] = useState(null); // 'green' | 'red'
  const [sensorPermission, setSensorPermission] = useState("prompt"); // 'prompt' | 'granted' | 'unavailable'
  const lastTiltTimeRef = useRef(0);

  // Play sound effect using Flutter asset audio files
  const playSound = (type) => {
    try {
      const soundFile =
        type === "correct"
          ? "/sounds/correct_sound.ogg"
          : "/sounds/pass_sound.ogg";
      const audio = new Audio(soundFile);
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Fallback to Web Audio oscillator synth if audio file playback is blocked
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        if (type === "correct") {
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(
            880,
            ctx.currentTime + 0.15,
          );
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        } else {
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(
            150,
            ctx.currentTime + 0.15,
          );
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        }
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      });
    } catch {}
  };

  // Handle Correct or Pass
  const handleAnswer = useCallback(
    (isCorrect) => {
      if (gameState !== "playing") return;

      if (isCorrect) {
        setScore((s) => s + 1);
        setFlashColor("green");
        playSound("correct");
      } else {
        setPassedCount((p) => p + 1);
        setFlashColor("red");
        playSound("pass");
      }

      setTimeout(() => setFlashColor(null), 250);

      if (wordIndex + 1 < words.length) {
        setWordIndex((i) => i + 1);
      } else {
        setGameState("ended");
        if (gameMode === "team") {
          setTeamScores((prevScores) => ({
            ...prevScores,
            [activeTeam]: prevScores[activeTeam] + score + (isCorrect ? 1 : 0),
          }));
        }
      }
    },
    [gameState, wordIndex, words.length, gameMode, activeTeam, score],
  );

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== "playing") return;
      if (e.key === "ArrowDown" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleAnswer(true);
      } else if (e.key === "ArrowUp" || e.key === "Escape") {
        e.preventDefault();
        handleAnswer(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, handleAnswer]);

  // Mobile DeviceOrientation Accelerometer Sensor Listener
  useEffect(() => {
    if (gameState !== "playing") return;

    const handleOrientation = (event) => {
      const now = Date.now();
      if (now - lastTiltTimeRef.current < 800) return; // Debounce 800ms

      const gamma = event.gamma; // [-90, 90]
      const beta = event.beta; // [-180, 180]

      if (beta > 45 || gamma > 45) {
        lastTiltTimeRef.current = now;
        handleAnswer(true);
      } else if (beta < -30 || gamma < -30) {
        lastTiltTimeRef.current = now;
        handleAnswer(false);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    return () =>
      window.removeEventListener("deviceorientation", handleOrientation, true);
  }, [gameState, handleAnswer]);

  // Request iOS Sensor Permissions
  const requestSensorPermission = () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      DeviceOrientationEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === "granted") {
            setSensorPermission("granted");
          } else {
            setSensorPermission("unavailable");
          }
        })
        .catch(() => setSensorPermission("unavailable"));
    } else {
      setSensorPermission("granted");
    }
  };

  // Start Game Routine
  const startGame = () => {
    const shuffled = [...DEMO_20_WORDS].sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setWordIndex(0);
    setScore(0);
    setPassedCount(0);
    setTimeLeft(selectedTimer);
    setGameState("playing");
  };

  // Timer Interval
  useEffect(() => {
    let timer;
    if (gameState === "playing") {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState("ended");
            if (gameMode === "team") {
              setTeamScores((prevScores) => ({
                ...prevScores,
                [activeTeam]: prevScores[activeTeam] + score,
              }));
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, gameMode, activeTeam, score]);

  const currentItem = words[wordIndex] || DEMO_20_WORDS[0];

  return (
    <div
      className="w-full max-w-sm sm:max-w-3xl mx-auto flex flex-col gap-4"
      id="interactive-hero-demo"
    >
      {/* Playground Simulator Container */}
      <div className="relative w-full min-h-115 sm:min-h-105 sm:aspect-video bg-surface border-2 sm:border-4 border-border rounded-3xl p-4 sm:p-6 flex flex-col justify-between overflow-hidden text-text font-sans shadow-2xl dark:shadow-amber-500/10 transition-all duration-300">
        {/* Mobile Screen Top Speaker Notch */}
        <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-border/80 rounded-full z-30 pointer-events-none" />

        {/* Flash Effect */}
        <AnimatePresence>
          {flashColor && (
            <motion.div
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`absolute inset-0 z-30 pointer-events-none rounded-[28px] ${
                flashColor === "green"
                  ? "bg-emerald-500/30 border-4 border-emerald-500"
                  : "bg-red-500/30 border-4 border-red-500"
              }`}
            />
          )}
        </AnimatePresence>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header HUD Bar */}
        <div className="flex items-center justify-between z-20 bg-surface-card/80 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-border/60 text-xs font-black mt-1 sm:mt-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
            <span className="uppercase tracking-widest text-primary text-[0.7rem] sm:text-xs">
              Live Playable Demo
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-muted text-[0.65rem] sm:text-[0.7rem] uppercase font-bold">
              {gameMode === "solo" ? "Solo Play" : activeTeam}
            </span>
          </div>
        </div>

        {/* --- STATE 1: IDLE / CONFIGURATION --- */}
        {gameState === "idle" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-3.5 sm:gap-4 my-auto z-20 max-w-lg mx-auto w-full pt-1 sm:pt-0"
          >
            <div>
              <h3 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-text">
                Game Demo
              </h3>
              <p className="text-muted text-[0.7rem] sm:text-sm mt-0.5 sm:mt-1 leading-relaxed">
                Tilt phone on mobile or use keyboard controls on desktop.
              </p>
            </div>

            {/* Timer Selector */}
            <div className="flex flex-col gap-1 w-full">
              <span className="text-[0.65rem] font-black uppercase text-muted tracking-wider flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-primary" /> Select Round
                Duration:
              </span>
              <div className="grid grid-cols-4 gap-1.5 sm:flex sm:justify-center sm:gap-2">
                {[30, 45, 60, 90].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTimer(t)}
                    className={`py-2 px-2 sm:px-4 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      selectedTimer === t
                        ? "bg-primary text-accent scale-105 shadow-md"
                        : "bg-surface-card border border-border text-muted hover:text-text"
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Selector */}
            <div className="flex flex-col gap-1 w-full">
              <span className="text-[0.65rem] font-black uppercase text-muted tracking-wider flex items-center justify-center gap-1">
                <Users className="w-3 h-3 text-primary" /> Select Game Mode:
              </span>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-center">
                <button
                  onClick={() => setGameMode("solo")}
                  className={`py-2 px-3 sm:px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    gameMode === "solo"
                      ? "bg-primary text-accent scale-105 shadow-md"
                      : "bg-surface-card border border-border text-muted hover:text-text"
                  }`}
                >
                  <User className="w-3.5 h-3.5" /> Solo Mode
                </button>
                <button
                  onClick={() => setGameMode("team")}
                  className={`py-2 px-3 sm:px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    gameMode === "team"
                      ? "bg-primary text-accent scale-105 shadow-md"
                      : "bg-surface-card border border-border text-muted hover:text-text"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> 2-Team Battle
                </button>
              </div>
            </div>

            {/* Action Launch Button */}
            <button
              onClick={startGame}
              className="w-full max-w-xs py-3.5 sm:py-4 rounded-2xl bg-primary text-accent font-black text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <Play className="w-4 h-4 fill-accent" /> Start {selectedTimer}s
              Round Now
            </button>

            {sensorPermission === "prompt" && (
              <button
                onClick={requestSensorPermission}
                className="text-[0.65rem] text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Smartphone className="w-3 h-3" /> Enable Mobile Tilt Sensing
                Permissions
              </button>
            )}
          </motion.div>
        )}

        {/* --- STATE 2: ACTIVE GAMEPLAY --- */}
        {gameState === "playing" && (
          <div className="flex flex-col justify-between h-full z-20 py-1 sm:py-2 gap-2">
            {/* Top Score Bar */}
            <div className="flex items-center justify-between bg-surface-card border border-border/60 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span className="text-base sm:text-lg font-mono font-black text-primary">
                  {timeLeft}s
                </span>
              </div>

              {gameMode === "team" && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[0.65rem] ${activeTeam === "Team A" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-pink-500/20 text-pink-400 border border-pink-500/30"}`}
                >
                  {activeTeam}
                </span>
              )}

              <div className="flex items-center gap-2 sm:gap-3 text-[0.7rem] sm:text-xs">
                <span className="text-emerald-400 font-black flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {score} Correct
                </span>
                <span className="text-red-400 font-black flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> {passedCount} Pass
                </span>
              </div>
            </div>

            {/* Active Cardboard Display */}
            <motion.div
              key={wordIndex}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="my-auto bg-surface-card border-2 border-primary/60 rounded-3xl p-5 sm:p-8 text-center shadow-card shadow-primary/20 flex flex-col justify-center items-center gap-1.5 min-h-32.5 sm:min-h-40"
            >
              <div className="flex items-center gap-1.5 text-[0.7rem] sm:text-xs font-black text-primary uppercase tracking-widest">
                <span>{currentItem.icon}</span> {currentItem.deck}
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-text uppercase tracking-tight leading-tight">
                {currentItem.word}
              </h2>
            </motion.div>

            {/* On-screen Controls & Keyboard Shortcuts */}
            <div className="flex flex-col gap-1.5">
              <div className="hidden md:flex justify-between items-center text-[0.65rem] text-muted font-bold px-2">
                <span>Keyboard: ↓ / Space (Correct)</span>
                <span>Keyboard: ↑ / Esc (Pass)</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  onClick={() => handleAnswer(true)}
                  className="py-3 bg-emerald-500 hover:bg-emerald-400 text-accent font-black text-xs uppercase rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Got It! (Tilt Down{" "}
                  <ChevronDown className="w-3.5 h-3.5" />)
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  className="py-3 bg-red-500 hover:bg-red-400 text-white font-black text-xs uppercase rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" /> Pass (Tilt Up{" "}
                  <ChevronUp className="w-3.5 h-3.5" />)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- STATE 3: ROUND COMPLETED --- */}
        {gameState === "ended" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-3 sm:gap-4 my-auto z-20 max-w-md mx-auto w-full"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-black">
              <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-primary uppercase tracking-tight">
                Round Complete!
              </h3>
              <p className="text-[0.75rem] sm:text-xs text-muted mt-0.5">
                You scored <strong>{score} correct points</strong> in{" "}
                {selectedTimer} seconds!
              </p>
            </div>

            {gameMode === "team" && (
              <div className="w-full grid grid-cols-2 gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl bg-surface-card border border-border">
                <div className="flex flex-col">
                  <span className="text-[0.65rem] font-bold text-cyan-400 uppercase">
                    Team A Score
                  </span>
                  <span className="text-lg sm:text-xl font-black text-text">
                    {teamScores["Team A"]}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[0.65rem] font-bold text-pink-400 uppercase">
                    Team B Score
                  </span>
                  <span className="text-lg sm:text-xl font-black text-text">
                    {teamScores["Team B"]}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2 sm:gap-3 w-full">
              {gameMode === "team" && (
                <button
                  onClick={() => {
                    setActiveTeam(
                      activeTeam === "Team A" ? "Team B" : "Team A",
                    );
                    startGame();
                  }}
                  className="flex-1 py-3 bg-primary text-accent font-black text-xs uppercase tracking-wider rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Next Turn: {activeTeam === "Team A" ? "Team B" : "Team A"}
                </button>
              )}
              <button
                onClick={startGame}
                className="flex-1 py-3 bg-surface-card text-text border border-border font-extrabold text-xs uppercase tracking-wider rounded-2xl hover:border-primary transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Replay Round
              </button>
            </div>
          </motion.div>
        )}

        {/* Bottom Bar Info */}
        <div className="flex justify-between items-center text-[0.65rem] text-muted font-bold z-20 pt-2 border-t border-border/40">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-primary" /> Auto Sensor
          </span>
          <span className="truncate max-w-50 sm:max-w-none">
            {sensorPermission === "granted"
              ? "Tilt Active: Down = Correct | Up = Pass"
              : "Use On-Screen Buttons or Gyro Sensor"}
          </span>
        </div>
      </div>
    </div>
  );
};
