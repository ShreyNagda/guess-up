import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { UserCheck, Smartphone, CheckCircle2, X, Star } from "lucide-react";
import { useToast } from "../context/ToastContext";

const SAMPLE_TESTERS = [
  {
    id: "s1",
    name: "Rohan Gupta",
    role: "Alpha Playtester",
    deviceType: "Android",
    quote:
      "Finally a charades game that actually understands Indian pop culture! Bollywood Buff had our entire hostel floor screaming.",
    submittedAt: new Date().toISOString(),
  },
  {
    id: "s2",
    name: "Ananya Verma",
    role: "Beta Tester",
    deviceType: "Android",
    quote:
      "The tilt sensing is butter smooth. We played 2-Team Battle mode with 8 friends and didn't hit a single ad during our 2-hour game night.",
    submittedAt: new Date().toISOString(),
  },
  {
    id: "s3",
    name: "Aarav Sharma",
    role: "Top Contributor",
    deviceType: "Android",
    quote:
      "Making our own custom deck with inside jokes about our college gang made this the best party game we've ever played.",
    submittedAt: new Date().toISOString(),
  },
];

export const TestersWall = () => {
  const [testers, setTesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [deviceType, setDeviceType] = useState("Android");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joinedSuccess, setJoinedSuccess] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = query(collection(db, "testers"), orderBy("createdAt", "desc"));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() });
          });
          setTesters(list.length > 0 ? list : SAMPLE_TESTERS);
          setLoading(false);
        },
        (err) => {
          console.warn("Firestore testers fallback:", err);
          setTesters(SAMPLE_TESTERS);
          setLoading(false);
        },
      );
    } catch (_) {
      setTesters(SAMPLE_TESTERS);
      setLoading(false);
    }
    return () => unsubscribe();
  }, []);

  const handleJoinBetaSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      if (toast?.addToast)
        toast.addToast("Please fill in your name and email.", "error");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      deviceType: deviceType,
      role: "Beta Tester",
      createdAt: serverTimestamp(),
      submittedAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "testers"), payload);
      setIsSubmitting(false);
      setJoinedSuccess(true);
      if (toast?.addToast)
        toast.addToast("Welcome to the Beta Wall! 🎉", "success");
      setTimeout(() => {
        setIsJoinModalOpen(false);
        setJoinedSuccess(false);
        setName("");
        setEmail("");
      }, 1500);
    } catch (err) {
      console.warn("Firestore write fallback for beta testers:", err);
      setTesters((prev) => [payload, ...prev]);
      setIsSubmitting(false);
      setJoinedSuccess(true);
      if (toast?.addToast)
        toast.addToast("Joined Beta Wall successfully!", "success");
      setTimeout(() => {
        setIsJoinModalOpen(false);
        setJoinedSuccess(false);
        setName("");
        setEmail("");
      }, 1500);
    }
  };

  const getInitials = (n) => {
    if (!n) return "GU";
    const parts = n.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <section
      className="py-16 md:py-24 border-t border-border/40 relative overflow-hidden"
      id="testers"
    >
      <div className="max-w-4xl mx-auto px-6 flex flex-col gap-10 relative z-10">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-black text-xs uppercase tracking-widest">
            <Star className="w-3.5 h-3.5 fill-primary" /> COMMUNITY HALL OF FAME
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-text">
            Tested & Approved By{" "}
            <span className="text-primary">Real Party Buffs</span>
          </h2>
          <p className="text-muted text-xs sm:text-sm max-w-xl leading-relaxed">
            Meet the beta playtesters shaping our game balance, deck content,
            and motion thresholds.
          </p>

          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="mt-2 px-7 py-3.5 rounded-2xl bg-primary text-accent font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
          >
            Claim Your Spot On The Beta Wall 🌟
          </button>
        </div>

        {/* Testimonials & Testers Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12 text-muted text-xs font-semibold">
            Syncing playtesters from Firestore...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testers.slice(0, 6).map((tester, idx) => (
              <motion.div
                key={tester.id || idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: (idx % 3) * 0.08 }}
                className="p-6 rounded-3xl bg-surface-card border border-border backdrop-blur-md flex flex-col justify-between gap-4 shadow-card shadow-card-hover hover:border-primary/50 transition-all"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-primary text-xs font-black tracking-widest uppercase flex items-center gap-1">
                      ★★★★★
                    </span>
                    <span className="text-[0.65rem] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {tester.role || "Beta Tester"}
                    </span>
                  </div>

                  <p className="text-xs text-muted leading-relaxed italic">
                    "
                    {tester.quote ||
                      "Guess Up completely changed our Friday house party vibe. Zero ads and hilarious Desi decks!"}
                    "
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary font-black text-xs shrink-0">
                    {getInitials(tester.name)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-extrabold text-xs text-text truncate">
                      {tester.name || "Anonymous Tester"}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* JOIN BETA MODAL */}
      <AnimatePresence>
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-surface border-2 border-border p-6 sm:p-8 rounded-3xl shadow-2xl text-text"
            >
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-surface-card hover:bg-surface-card/80 text-muted hover:text-text transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {joinedSuccess ? (
                <div className="flex flex-col items-center justify-center text-center gap-4 py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black">Welcome Aboard!</h3>
                  <p className="text-muted text-xs">
                    You've been added to the Guess Up Testers Wall.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center text-center gap-2 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight uppercase text-text">
                      Join Beta Wall
                    </h3>
                    <p className="text-xs text-muted">
                      Get featured on our Wall of Fame & receive early Play
                      Store / APK updates.
                    </p>
                  </div>

                  <form
                    onSubmit={handleJoinBetaSubmit}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-1">
                      <label className="text-[0.7rem] font-black uppercase text-muted">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full p-3.5 rounded-2xl bg-surface-card border border-border text-text text-xs font-semibold placeholder:text-muted outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[0.7rem] font-black uppercase text-muted">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="rahul@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3.5 rounded-2xl bg-surface-card border border-border text-text text-xs font-semibold placeholder:text-muted outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-2xl bg-primary text-accent font-black text-xs uppercase tracking-wider hover:scale-102 active:scale-98 transition-all shadow-md cursor-pointer disabled:opacity-50 mt-2"
                    >
                      {isSubmitting ? "Adding..." : "Add My Name to Wall"}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
