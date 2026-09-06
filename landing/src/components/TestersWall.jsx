import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  CheckCircle2,
  AlertCircle,
  Star,
  Mail,
  Send,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useToast } from "../context/ToastContext";

const SAMPLE_TESTERS = [
  {
    id: "s1",
    name: "Rohan Gupta",
    role: "Alpha Playtester",
    quote:
      "Finally a charades game that actually understands Indian pop culture! Bollywood Buff had our entire hostel floor screaming.",
    submittedAt: new Date().toISOString(),
  },
  {
    id: "s2",
    name: "Ananya Verma",
    role: "Beta Tester",
    quote:
      "The tilt sensing is butter smooth. We played 2-Team Battle mode with 8 friends and didn't hit a single ad during our 2-hour game night.",
    submittedAt: new Date().toISOString(),
  },
  {
    id: "s3",
    name: "Aarav Sharma",
    role: "Top Contributor",
    quote:
      "Making our own custom deck with inside jokes about our college gang made this the best party game we've ever played.",
    submittedAt: new Date().toISOString(),
  },
];

export const TestersWall = () => {
  const [testers, setTesters] = useState(SAMPLE_TESTERS);
  const [loading, setLoading] = useState(true);

  // Inline Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const deviceType = "Android";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

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
          setLoading(false);
        },
      );
    } catch {
      queueMicrotask(() => setLoading(false));
    }
    return () => unsubscribe();
  }, []);

  const handleJoinBetaSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatusMsg({
        type: "error",
        text: "Please enter your Google Play email address.",
      });
      if (toast?.addToast)
        toast.addToast("Please enter your Google Play email address.", "error");
      return;
    }

    setIsSubmitting(true);
    setStatusMsg({ type: "", text: "" });

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    try {
      // 1. Trigger Netlify Serverless Email Invite Function
      const res = await fetch("/.netlify/functions/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          name: cleanName,
          deviceType: deviceType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send email invitation.");
      }

      setIsSubmitting(false);
      setStatusMsg({
        type: "success",
        text: "🎉 Success! Check your inbox for the Google Play testing link.",
      });
      if (toast?.addToast) {
        toast.addToast("Invite sent! Check your inbox.", "success");
      }

      // Add to local state for instant feedback
      const newEntry = {
        name: cleanName || "Beta Playtester",
        email: cleanEmail,
        deviceType: deviceType,
        role: "Beta Tester",
        status: "sent",
        submittedAt: new Date().toISOString(),
      };
      setTesters((prev) => [newEntry, ...prev]);

      setName("");
      setEmail("");
    } catch (err) {
      console.warn("Netlify function fallback to direct Firestore:", err);

      // Fallback: Direct write to Firestore if function endpoint is unavailable
      try {
        const payload = {
          name: cleanName || "Beta Playtester",
          email: cleanEmail,
          deviceType: deviceType,
          role: "Beta Tester",
          status: "pending",
          createdAt: serverTimestamp(),
          submittedAt: new Date().toISOString(),
        };

        await addDoc(collection(db, "testers"), payload);
        setIsSubmitting(false);
        setStatusMsg({
          type: "success",
          text: "Registration received! We'll send your Google Play testing link shortly.",
        });
        if (toast?.addToast) {
          toast.addToast("Registered for Beta Access!", "success");
        }
        setName("");
        setEmail("");
      } catch (firestoreErr) {
        console.error("Firestore write failed:", firestoreErr);
        setIsSubmitting(false);
        setStatusMsg({
          type: "error",
          text: err.message || "Failed to submit. Please try again.",
        });
      }
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
      className="py-8 sm:py-16 md:py-24 border-t border-border/40 relative overflow-hidden"
      id="testers"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col gap-6 sm:gap-12 relative z-10">
        {/* INLINE BETA REGISTRATION FORM CARD (VISIBLE, NOT IN DIALOG) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface-card border-2 border-primary/40 shadow-2xl backdrop-blur-md relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-black text-xs uppercase tracking-wider w-fit">
                  <Sparkles className="w-3.5 h-3.5" /> Instant Google Play Beta
                  Access
                </span>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-text">
                  Get Your Testing Invite{" "}
                  <span className="text-primary">Now</span>
                </h3>
              </div>
              <span className="text-xs font-bold text-muted bg-surface/80 px-3 py-1.5 rounded-xl border border-border">
                Limited Playtester Slots
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Enter your Google Play email below to get an instant invitation
              link sent directly to your inbox. Test unreleased decks and shape
              game balance!
            </p>

            <form
              onSubmit={handleJoinBetaSubmit}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] font-black uppercase tracking-wider text-muted">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={name}
                    required
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-surface border border-border text-text text-xs font-semibold outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] font-black uppercase tracking-wider text-muted">
                    Google Play Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="email"
                      placeholder="john.doe@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-surface border text-text text-xs font-semibold outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-primary text-accent font-black text-xs sm:text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-bevel-gold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending Testing
                    Link...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Become a tester
                  </>
                )}
              </button>
            </form>

            {/* REAL-TIME FEEDBACK STATUS BANNERS */}
            {statusMsg.text && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 border ${
                  statusMsg.type === "success"
                    ? "bg-success/15 border-success/30 text-success"
                    : "bg-error/15 border-error/30 text-error"
                }`}
              >
                {statusMsg.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-success" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 text-error" />
                )}
                <span>{statusMsg.text}</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* COMMUNITY HALL OF FAME & TESTERS WALL GRID */}
        <div className="flex flex-col gap-8">
          <div className="text-center flex flex-col items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-black text-xs uppercase tracking-widest">
              <Star className="w-3.5 h-3.5 fill-primary" /> COMMUNITY HALL OF
              FAME
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-text">
              Tested & Approved By{" "}
              <span className="text-primary">Real Party Buffs</span>
            </h2>
            <p className="text-muted text-xs sm:text-sm max-w-xl leading-relaxed">
              Meet the playtesters shaping our game balance, deck content, and
              motion thresholds.
            </p>
          </div>

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
                      <div className="flex items-center gap-0.5 text-primary">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 fill-primary text-primary"
                          />
                        ))}
                      </div>
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
                      {tester.status === "sent" && (
                        <span className="text-[0.65rem] font-bold text-success flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Invite Sent
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
