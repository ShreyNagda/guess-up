import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { auth, db } from "../lib/firebase";
import { generateAICards } from "../lib/gemini";
import { useToast } from "../context/ToastContext";
import { useInactivityLogout } from "../hooks/useInactivityLogout";
import { Header } from "../components/Header";

const DECK_EMOJI_MAPPING = {
  CF: "🏏",
  BH: "🎬",
  DC: "🍕",
  II: "🗻",
  HP: "🎧",
  GU: "📺",
};

const getDeckEmoji = (icon) => {
  return DECK_EMOJI_MAPPING[icon] || icon;
};

export const AdminPage = () => {
  const { showToast } = useToast();

  // Desktop / Laptop Access Check (>= 1024px)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auth state
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Decks list & Selected Deck
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState(null);

  // Active Workspace Tab: 'cards' | 'add' | 'settings'
  const [activeTab, setActiveTab] = useState("cards");

  // Deck Title Editing State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedDeckName, setEditedDeckName] = useState("");
  const [editedDeckIcon, setEditedDeckIcon] = useState("");
  const [editTitleLoading, setEditTitleLoading] = useState(false);

  // Form states (Create New Deck Modal)
  const [isNewDeckModalOpen, setIsNewDeckModalOpen] = useState(false);
  const [newDeckId, setNewDeckId] = useState("");
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckIcon, setNewDeckIcon] = useState("📺");
  const [saveDeckLoading, setSaveDeckLoading] = useState(false);

  // Words & Search states
  const [bulkInput, setBulkInput] = useState("");
  const [wordSearchQuery, setWordSearchQuery] = useState("");
  const [addWordsLoading, setAddWordsLoading] = useState(false);
  const [aiCount, setAiCount] = useState(15);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatusText, setAiStatusText] = useState("");
  const [deleteDeckLoading, setDeleteDeckLoading] = useState(false);

  // Hook for 1-hour inactivity logout
  useInactivityLogout(user, () => {
    setSelectedDeckId(null);
    setSelectedDeck(null);
  });

  // Track Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Sync Categories list in real time from Firestore
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const categoriesList = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          categoriesList.push({
            id: docSnap.id,
            name: data.name || "Unnamed",
            icon: getDeckEmoji(data.icon || "📺"),
            words: data.words || [],
          });
        });
        setDecks(categoriesList);

        // Auto select first deck if none selected
        if (categoriesList.length > 0 && !selectedDeckId) {
          setSelectedDeckId(categoriesList[0].id);
        }
      },
      (err) => {
        showToast(`Error syncing collection: ${err.message}`, "error");
      },
    );

    return unsubscribe;
  }, [user]);

  // Update selected deck state when selection or list updates
  useEffect(() => {
    if (selectedDeckId && decks.length > 0) {
      const match = decks.find((d) => d.id === selectedDeckId);
      setSelectedDeck(match || null);
      if (match) {
        setEditedDeckName(match.name);
        setEditedDeckIcon(match.icon);
      }
      setIsEditingTitle(false);
    } else {
      setSelectedDeck(null);
    }
  }, [selectedDeckId, decks]);

  // Auth Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Logged in successfully", "success");
    } catch (err) {
      setLoginError(err.message);
      showToast(`Login failed: ${err.message}`, "error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast("Logged out successfully", "info");
      setSelectedDeckId(null);
      setSelectedDeck(null);
    } catch (err) {
      showToast(`Logout failed: ${err.message}`, "error");
    }
  };

  // Create Deck Handler
  const handleNewDeckNameChange = (e) => {
    const val = e.target.value;
    setNewDeckName(val);
    if (!newDeckId) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setNewDeckId(slug);
    }
  };

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    const id = newDeckId.trim();
    const name = newDeckName.trim();
    const icon = newDeckIcon.trim();

    if (!id || !name || !icon) {
      showToast("All category fields are required", "error");
      return;
    }

    setSaveDeckLoading(true);

    try {
      await setDoc(doc(db, "categories", id), {
        name,
        icon,
        words: [],
      });
      showToast(`Deck "${name}" created successfully!`, "success");
      setIsNewDeckModalOpen(false);
      setNewDeckId("");
      setNewDeckName("");
      setNewDeckIcon("📺");
      setSelectedDeckId(id);
    } catch (err) {
      showToast(`Save failed: ${err.message}`, "error");
    } finally {
      setSaveDeckLoading(false);
    }
  };

  // Edit Deck Title Handler
  const handleUpdateDeckTitle = async (e) => {
    e.preventDefault();
    const name = editedDeckName.trim();
    const icon = editedDeckIcon.trim();

    if (!selectedDeckId || !name) {
      showToast("Deck title cannot be empty.", "error");
      return;
    }

    setEditTitleLoading(true);

    try {
      await updateDoc(doc(db, "categories", selectedDeckId), {
        name,
        icon: icon || selectedDeck.icon,
      });
      showToast("Deck title updated successfully!", "success");
      setIsEditingTitle(false);
    } catch (err) {
      showToast(`Failed to update deck title: ${err.message}`, "error");
    } finally {
      setEditTitleLoading(false);
    }
  };

  // Delete Deck Handler
  const handleDeleteDeck = async () => {
    if (!selectedDeckId || !selectedDeck) return;

    const confirmDelete = window.confirm(
      `Are you absolutely sure you want to delete the entire deck "${selectedDeck.name}"? This action cannot be undone!`,
    );
    if (!confirmDelete) return;

    setDeleteDeckLoading(true);
    try {
      await deleteDoc(doc(db, "categories", selectedDeckId));
      showToast(`Deck "${selectedDeck.name}" deleted.`, "success");
      setSelectedDeckId(
        decks.length > 1
          ? decks.find((d) => d.id !== selectedDeckId)?.id
          : null,
      );
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, "error");
    } finally {
      setDeleteDeckLoading(false);
    }
  };

  // Add Words Handler
  const handleAddWords = async (e) => {
    e.preventDefault();
    if (!selectedDeckId) return;

    const cleanInput = bulkInput.trim();
    if (!cleanInput) {
      showToast("Please enter at least one word.", "error");
      return;
    }

    const newWords = cleanInput
      .split(/[,\n]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (newWords.length === 0) {
      showToast("No valid words found.", "error");
      return;
    }

    setAddWordsLoading(true);

    try {
      const categoryRef = doc(db, "categories", selectedDeckId);
      const currentWords = selectedDeck ? selectedDeck.words || [] : [];
      const combined = [...currentWords, ...newWords];

      // Deduplicate case-insensitively
      const finalUniqueList = [];
      const seen = new Set();
      for (const word of combined) {
        const lower = word.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          finalUniqueList.push(word);
        }
      }

      const addedCount = finalUniqueList.length - currentWords.length;
      const skippedCount =
        combined.length -
        finalUniqueList.length -
        (currentWords.length - finalUniqueList.length);

      if (addedCount === 0) {
        showToast("All entered words already exist in this deck.", "info");
      } else {
        await updateDoc(categoryRef, { words: finalUniqueList });
        showToast(
          `Successfully added ${addedCount} new card(s)!${skippedCount > 0 ? ` Skipped ${skippedCount} duplicate(s).` : ""}`,
          "success",
        );
        setBulkInput("");
        setActiveTab("cards");
      }
    } catch (err) {
      showToast(`Add failed: ${err.message}`, "error");
    } finally {
      setAddWordsLoading(false);
    }
  };

  // AI Generator Handler
  const handleGenerateAI = async () => {
    if (!selectedDeckId || !selectedDeck) {
      showToast("Please select a deck first.", "error");
      return;
    }

    const promptVal = bulkInput.trim();
    if (!promptVal) {
      showToast(
        "Please enter a topic or theme description in the text box first.",
        "error",
      );
      return;
    }

    setAiLoading(true);
    setAiStatusText("Connecting to Gemini AI...");

    try {
      setAiStatusText("Querying live database...");
      const categoryDoc = await getDoc(doc(db, "categories", selectedDeckId));
      const liveData = categoryDoc.data();
      const currentWords = liveData ? liveData.words || [] : [];

      setAiStatusText("Generating cards with Gemini...");
      const generated = await generateAICards(
        selectedDeck.name,
        promptVal,
        aiCount,
      );

      setAiStatusText("Filtering duplicates...");
      const currentLower = new Set(currentWords.map((w) => w.toLowerCase()));
      const newUnique = [];
      const duplicates = [];

      for (const word of generated) {
        const cleaned = word.trim();
        if (!cleaned) continue;
        if (!currentLower.has(cleaned.toLowerCase())) {
          currentLower.add(cleaned.toLowerCase());
          newUnique.push(cleaned);
        } else {
          duplicates.push(cleaned);
        }
      }

      if (newUnique.length === 0) {
        showToast(
          `All ${generated.length} AI generated words already exist in this deck!`,
          "info",
        );
        return;
      }

      setAiStatusText("Writing latest cards to database...");
      const finalMerged = [...currentWords, ...newUnique];
      await updateDoc(doc(db, "categories", selectedDeckId), {
        words: finalMerged,
      });

      showToast(
        `Successfully generated and added ${newUnique.length} new card(s)!${duplicates.length > 0 ? ` Skipped ${duplicates.length} duplicate(s).` : ""}`,
        "success",
      );
      setBulkInput("");
      setActiveTab("cards");
    } catch (err) {
      showToast(`AI generation failed: ${err.message}`, "error");
    } finally {
      setAiLoading(false);
      setAiStatusText("");
    }
  };

  // Word Delete Handler
  const handleDeleteWord = async (word) => {
    if (!selectedDeckId) return;

    try {
      await updateDoc(doc(db, "categories", selectedDeckId), {
        words: arrayRemove(word),
      });
      showToast(`Removed: "${word}"`, "success");
    } catch (err) {
      showToast(`Remove failed: ${err.message}`, "error");
    }
  };

  // 💻 Desktop Only Access Shield
  if (!isDesktop) {
    return (
      <div className="h-screen w-screen flex flex-col overflow-hidden text-text-light dark:text-text-dark bg-transparent">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary text-3xl">
              💻
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">
              Desktop Access Required
            </h2>
            <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">
              The <strong>Guess Up Admin Dashboard</strong> is designed as a
              single-page app optimized exclusively for laptop and desktop
              screens (minimum 1024px width).
            </p>
            <Link
              to="/"
              className="btn bg-primary text-accent font-black px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md mt-2 inline-flex items-center gap-2"
            >
              <span>← Back to Home</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col overflow-hidden text-text-light dark:text-text-dark bg-transparent">
        <Header />
        <div className="flex-1 flex justify-center items-center">
          <div className="spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const totalWordsAcrossDecks = decks.reduce(
    (acc, d) => acc + (d.words?.length || 0),
    0,
  );

  const filteredWords = selectedDeck
    ? selectedDeck.words.filter((w) =>
        w.toLowerCase().includes(wordSearchQuery.toLowerCase()),
      )
    : [];

  return (
    <div className="h-screen w-screen max-h-screen flex flex-col overflow-hidden text-text-light dark:text-text-dark bg-transparent">
      {/* Header Bar (Fixed Height) */}
      <div className="shrink-0">
        <Header />
      </div>

      <AnimatePresence mode="wait">
        {!user ? (
          /* Auth Wall (Single Viewport) */
          <motion.div
            key="auth-wall"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center p-6 overflow-hidden"
          >
            <div className="bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col gap-5 text-center">
              <div className="flex flex-col gap-1 items-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary text-2xl font-black">
                  🔐
                </div>
                <h2 className="text-2xl font-black text-primary dark:text-text-dark uppercase tracking-tight">
                  Admin Portal
                </h2>
                <p className="text-xs text-muted-light dark:text-muted-dark">
                  Connect to Firestore database
                </p>
              </div>

              <form
                onSubmit={handleLogin}
                className="flex flex-col gap-3 text-left"
              >
                <div className="input-group flex flex-col">
                  <label
                    htmlFor="fb-email"
                    className="font-extrabold text-[0.7rem] uppercase tracking-wider mb-1"
                  >
                    Admin Email
                  </label>
                  <input
                    type="email"
                    className="input-control border-2 border-border-light dark:border-border-dark bg-surface-card-light dark:bg-surface-card-dark p-2.5 rounded-xl outline-none focus:border-primary font-medium text-sm"
                    id="fb-email"
                    placeholder="admin@guessup.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group flex flex-col">
                  <label
                    htmlFor="fb-password"
                    className="font-extrabold text-[0.7rem] uppercase tracking-wider mb-1"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    className="input-control border-2 border-border-light dark:border-border-dark bg-surface-card-light dark:bg-surface-card-dark p-2.5 rounded-xl outline-none focus:border-primary font-medium text-sm"
                    id="fb-password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="btn bg-primary text-accent w-full font-black py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-md mt-1 disabled:opacity-50 cursor-pointer text-sm"
                >
                  {loginLoading ? "Authenticating..." : "Authenticate & Access"}
                </button>
              </form>

              {loginError && (
                <div className="text-error font-extrabold text-xs border border-error/20 bg-error/5 p-2.5 rounded-xl">
                  {loginError}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Single Viewport Dashboard App (No Outer Page Scrolling) */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col p-4 md:px-8 max-w-[1600px] w-full mx-auto overflow-hidden min-h-0 gap-3"
          >
            {/* Top Stat Ribbon (Fixed Height) */}
            <div className="shrink-0 bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark p-3 px-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-base">
                    🛡️
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs uppercase text-muted-light dark:text-muted-dark tracking-wider">
                      Admin Portal
                    </h3>
                    <p className="text-xs font-bold text-text-light dark:text-text-dark">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-6 border-l border-border-light dark:border-border-dark pl-6">
                  <div>
                    <span className="text-[0.65rem] uppercase font-extrabold text-muted-light dark:text-muted-dark block">
                      Decks
                    </span>
                    <span className="text-sm font-black text-primary">
                      {decks.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[0.65rem] uppercase font-extrabold text-muted-light dark:text-muted-dark block">
                      Total Cards
                    </span>
                    <span className="text-sm font-black text-primary">
                      {totalWordsAcrossDecks}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsNewDeckModalOpen(true)}
                  className="btn bg-primary text-accent text-xs font-black px-4 py-2 rounded-xl hover:scale-105 transition-all shadow-sm"
                >
                  + New Deck
                </button>
                <button
                  onClick={handleLogout}
                  className="border border-border-light dark:border-border-dark hover:border-error hover:text-error text-xs font-extrabold px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Main Single Viewport Grid Shell */}
            <div className="flex-1 grid lg:grid-cols-[260px_1fr] gap-4 min-h-0 overflow-hidden">
              {/* Left Column: Deck Menu (Internal Scroll Only) */}
              <div className="h-full flex flex-col bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark p-4 rounded-3xl overflow-hidden shadow-sm">
                <div className="shrink-0 flex justify-between items-center pb-3 border-b border-border-light dark:border-border-dark mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-light dark:text-muted-dark">
                    Category Decks
                  </span>
                  <span className="bg-primary/15 text-primary font-black text-xs px-2 py-0.5 rounded-full">
                    {decks.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
                  {decks.map((deck) => {
                    const isSelected = selectedDeckId === deck.id;
                    return (
                      <button
                        key={deck.id}
                        onClick={() => setSelectedDeckId(deck.id)}
                        className={`w-full flex items-center justify-between border-2 rounded-2xl p-3 text-left transition-all cursor-pointer shrink-0 ${
                          isSelected
                            ? "border-primary bg-primary/15 shadow-sm"
                            : "border-transparent bg-surface-card-light/60 dark:bg-surface-card-dark/60 hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className="text-lg shrink-0">{deck.icon}</span>
                          <div className="truncate">
                            <h4 className="font-extrabold text-xs truncate">
                              {deck.name}
                            </h4>
                            <p className="text-[0.7rem] text-muted-light dark:text-muted-dark font-semibold">
                              {deck.words.length} cards
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                      </button>
                    );
                  })}

                  {decks.length === 0 && (
                    <p className="text-center text-xs text-muted-light dark:text-muted-dark py-8">
                      No decks found.
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Workspace Panel (Internal Scroll Only) */}
              <div className="h-full flex flex-col bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark p-5 rounded-3xl overflow-hidden shadow-sm">
                <AnimatePresence mode="wait">
                  {!selectedDeck ? (
                    <motion.div
                      key="no-deck"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col items-center justify-center text-muted-light dark:text-muted-dark py-12 gap-3 text-center"
                    >
                      <div className="w-12 h-12 border-2 border-dashed border-border-light dark:border-border-dark rounded-2xl flex items-center justify-center text-xl opacity-40">
                        📂
                      </div>
                      <p className="max-w-xs text-xs font-semibold">
                        Select a category deck from the menu on the left to
                        start managing cards.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={selectedDeck.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col overflow-hidden min-h-0 gap-4"
                    >
                      {/* Workspace Header */}
                      <div className="shrink-0 flex justify-between items-center flex-wrap gap-3 border-b border-border-light dark:border-border-dark pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl p-2 rounded-xl bg-primary/10 border border-primary/20">
                            {selectedDeck.icon}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="font-black text-xl">
                                {selectedDeck.name}
                              </h2>
                              <button
                                onClick={() =>
                                  setIsEditingTitle((prev) => !prev)
                                }
                                className="text-xs text-primary hover:underline font-bold"
                              >
                                {isEditingTitle ? "Close Edit" : "✏️ Rename"}
                              </button>
                            </div>
                            <p className="text-[0.7rem] text-muted-light dark:text-muted-dark font-mono">
                              ID: {selectedDeck.id} •{" "}
                              {selectedDeck.words.length} cards
                            </p>
                          </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex items-center gap-1.5 bg-surface-card-light dark:bg-surface-card-dark p-1 rounded-xl border border-border-light dark:border-border-dark">
                          <button
                            onClick={() => setActiveTab("cards")}
                            className={`px-3 py-1.5 rounded-lg font-extrabold text-xs transition-all cursor-pointer ${
                              activeTab === "cards"
                                ? "bg-primary text-accent shadow-sm"
                                : "text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark"
                            }`}
                          >
                            🎴 Cards ({selectedDeck.words.length})
                          </button>
                          <button
                            onClick={() => setActiveTab("add")}
                            className={`px-3 py-1.5 rounded-lg font-extrabold text-xs transition-all cursor-pointer ${
                              activeTab === "add"
                                ? "bg-primary text-accent shadow-sm"
                                : "text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark"
                            }`}
                          >
                            ✨ Add & AI
                          </button>
                          <button
                            onClick={() => setActiveTab("settings")}
                            className={`px-3 py-1.5 rounded-lg font-extrabold text-xs transition-all cursor-pointer ${
                              activeTab === "settings"
                                ? "bg-primary text-accent shadow-sm"
                                : "text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark"
                            }`}
                          >
                            ⚙️ Settings
                          </button>
                        </div>
                      </div>

                      {/* Title Edit Form Drawer */}
                      <AnimatePresence>
                        {isEditingTitle && (
                          <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleUpdateDeckTitle}
                            className="shrink-0 bg-primary/10 border-2 border-primary p-3 rounded-2xl flex items-center gap-3 overflow-hidden"
                          >
                            <input
                              type="text"
                              className="w-14 text-center border-2 border-primary bg-surface-light dark:bg-surface-dark p-1.5 rounded-xl font-bold text-base"
                              value={editedDeckIcon}
                              onChange={(e) =>
                                setEditedDeckIcon(e.target.value)
                              }
                              placeholder="Emoji"
                              required
                            />
                            <input
                              type="text"
                              className="flex-1 border-2 border-primary bg-surface-light dark:bg-surface-dark p-1.5 px-3 rounded-xl font-black text-base text-text-light dark:text-text-dark"
                              value={editedDeckName}
                              onChange={(e) =>
                                setEditedDeckName(e.target.value)
                              }
                              placeholder="Deck Title"
                              required
                            />
                            <button
                              type="submit"
                              disabled={editTitleLoading}
                              className="bg-primary text-accent font-black text-xs px-4 py-2.5 rounded-xl hover:scale-105 transition-all shadow-sm shrink-0"
                            >
                              {editTitleLoading ? "Saving..." : "Save Title"}
                            </button>
                          </motion.form>
                        )}
                      </AnimatePresence>

                      {/* Tab 1: Live Cards Grid (Single Viewport Internal Scroll) */}
                      {activeTab === "cards" && (
                        <div className="flex-1 flex flex-col overflow-hidden min-h-0 gap-3">
                          <div className="shrink-0 flex justify-between items-center gap-3">
                            <input
                              type="text"
                              placeholder="🔍 Search cards in deck..."
                              value={wordSearchQuery}
                              onChange={(e) =>
                                setWordSearchQuery(e.target.value)
                              }
                              className="border-2 border-border-light dark:border-border-dark bg-surface-card-light dark:bg-surface-card-dark p-2 px-3 rounded-xl text-xs font-semibold outline-none focus:border-primary max-w-xs w-full"
                            />
                            <button
                              onClick={() => setActiveTab("add")}
                              className="btn bg-primary text-accent text-xs font-black px-3.5 py-2 rounded-xl hover:scale-105 transition-all"
                            >
                              + Add New Cards
                            </button>
                          </div>

                          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 auto-rows-max">
                            {filteredWords.map((word, idx) => (
                              <div
                                key={idx}
                                className="bg-surface-card-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark px-3 py-2 rounded-xl flex items-center justify-between text-xs font-bold shadow-sm hover:border-primary/50 transition-all group"
                              >
                                <span className="truncate pr-1">{word}</span>
                                <button
                                  onClick={() => handleDeleteWord(word)}
                                  className="text-muted-light dark:text-muted-dark hover:text-error text-xs font-black cursor-pointer transition-colors p-1 opacity-50 group-hover:opacity-100"
                                  title="Remove card"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}

                            {selectedDeck.words.length === 0 && (
                              <div className="col-span-full text-center py-16 text-muted-light dark:text-muted-dark">
                                <p className="text-xs font-bold">
                                  No cards in this deck yet.
                                </p>
                                <button
                                  onClick={() => setActiveTab("add")}
                                  className="text-xs text-primary font-black underline mt-1 inline-block"
                                >
                                  Add cards now →
                                </button>
                              </div>
                            )}

                            {selectedDeck.words.length > 0 &&
                              filteredWords.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-light dark:text-muted-dark">
                                  <p className="text-xs">
                                    No cards match "{wordSearchQuery}".
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                      {/* Tab 2: Add Cards & AI Generator (Single Viewport Layout) */}
                      {activeTab === "add" && (
                        <div className="flex-1 flex flex-col bg-surface-card-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark rounded-2xl p-5 overflow-hidden gap-4">
                          <div className="shrink-0 flex flex-col gap-0.5">
                            <h3 className="font-extrabold text-sm">
                              Add Cards or Generate with Gemini AI
                            </h3>
                            <p className="text-[0.75rem] text-muted-light dark:text-muted-dark">
                              Type card words separated by commas/newlines OR
                              enter a topic prompt for AI generation.
                            </p>
                          </div>

                          <textarea
                            className="flex-1 border-2 border-border-light dark:border-border-dark p-3 rounded-xl bg-surface-light dark:bg-surface-dark font-semibold text-xs w-full outline-none focus:border-primary resize-none"
                            placeholder="E.g., Sachin Tendulkar, Virat Kohli, MS Dhoni OR prompt like 'Famous Indian Cricketers'"
                            value={bulkInput}
                            onChange={(e) => setBulkInput(e.target.value)}
                          />

                          <div className="shrink-0 flex flex-wrap gap-3 items-center justify-between border-t border-border-light dark:border-border-dark pt-3">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={handleAddWords}
                                disabled={addWordsLoading || aiLoading}
                                className="btn bg-primary text-accent font-black px-5 py-2.5 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-md text-xs"
                              >
                                {addWordsLoading
                                  ? "Adding..."
                                  : "+ Add Manual Cards"}
                              </button>

                              <button
                                onClick={handleGenerateAI}
                                disabled={aiLoading || addWordsLoading}
                                className="btn border-2 border-primary bg-primary/10 text-primary font-black px-5 py-2.5 rounded-xl hover:bg-primary hover:text-accent disabled:opacity-50 cursor-pointer text-xs shadow-none"
                              >
                                ✨ Generate with AI
                              </button>
                            </div>

                            <div className="flex items-center gap-2 border border-border-light dark:border-border-dark px-3 py-1.5 rounded-xl bg-surface-light dark:bg-surface-dark">
                              <label
                                htmlFor="ai-count"
                                className="font-extrabold text-[0.7rem] uppercase text-muted-light dark:text-muted-dark"
                              >
                                AI Count:
                              </label>
                              <select
                                id="ai-count"
                                className="bg-transparent border-none outline-none font-bold text-xs text-text-light dark:text-text-dark cursor-pointer"
                                value={aiCount}
                                onChange={(e) =>
                                  setAiCount(parseInt(e.target.value))
                                }
                              >
                                <option value={10}>10 Cards</option>
                                <option value={15}>15 Cards</option>
                                <option value={25}>25 Cards</option>
                                <option value={50}>50 Cards</option>
                              </select>
                            </div>
                          </div>

                          {aiLoading && (
                            <div className="shrink-0 flex items-center gap-3 text-xs font-bold text-primary bg-primary/10 p-3 rounded-xl border border-primary/20">
                              <div className="spinner w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              <span>{aiStatusText}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tab 3: Settings & Delete Deck */}
                      {activeTab === "settings" && (
                        <div className="shrink-0 bg-surface-card-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark rounded-2xl p-5 flex flex-col gap-4">
                          <div className="flex flex-col gap-0.5">
                            <h3 className="font-extrabold text-sm">
                              Deck Configuration
                            </h3>
                            <p className="text-[0.75rem] text-muted-light dark:text-muted-dark">
                              Manage deck metadata or permanently remove this
                              deck from Firestore.
                            </p>
                          </div>

                          <div className="border border-error/30 bg-error/5 p-4 rounded-xl flex items-center justify-between gap-4">
                            <div>
                              <h4 className="font-black text-error text-xs uppercase">
                                Danger Zone
                              </h4>
                              <p className="text-[0.75rem] text-muted-light dark:text-muted-dark mt-0.5">
                                Delete deck{" "}
                                <strong>"{selectedDeck.name}"</strong> (
                                {selectedDeck.words.length} cards) permanently.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleDeleteDeck}
                              disabled={deleteDeckLoading}
                              className="btn bg-error text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-red-700 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm shrink-0"
                            >
                              {deleteDeckLoading
                                ? "Deleting..."
                                : "🗑️ Delete Deck"}
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create New Deck Modal */}
      <AnimatePresence>
        {isNewDeckModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleCreateDeck}
              className="bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark p-6 rounded-3xl max-w-md w-full flex flex-col gap-4 shadow-2xl text-left"
            >
              <div className="flex justify-between items-center border-b border-border-light dark:border-border-dark pb-3">
                <h3 className="font-black text-lg text-primary">
                  Create New Category Deck
                </h3>
                <button
                  type="button"
                  onClick={() => setIsNewDeckModalOpen(false)}
                  className="text-muted-light dark:text-muted-dark hover:text-text-light font-bold text-base p-1"
                >
                  ✕
                </button>
              </div>

              <div className="input-group flex flex-col">
                <label
                  htmlFor="modal-cat-id"
                  className="font-extrabold text-[0.7rem] uppercase mb-1"
                >
                  Deck ID (Firestore Slug)
                </label>
                <input
                  type="text"
                  className="input-control border-2 border-border-light dark:border-border-dark p-2.5 rounded-xl bg-surface-card-light dark:bg-surface-card-dark text-xs outline-none focus:border-primary"
                  id="modal-cat-id"
                  placeholder="e.g. cricket-fever"
                  value={newDeckId}
                  onChange={(e) => setNewDeckId(e.target.value)}
                  required
                />
              </div>

              <div className="input-group flex flex-col">
                <label
                  htmlFor="modal-cat-name"
                  className="font-extrabold text-[0.7rem] uppercase mb-1"
                >
                  Deck Name
                </label>
                <input
                  type="text"
                  className="input-control border-2 border-border-light dark:border-border-dark p-2.5 rounded-xl bg-surface-card-light dark:bg-surface-card-dark text-xs outline-none focus:border-primary"
                  id="modal-cat-name"
                  placeholder="e.g. Cricket Fever"
                  value={newDeckName}
                  onChange={handleNewDeckNameChange}
                  required
                />
              </div>

              <div className="input-group flex flex-col">
                <label
                  htmlFor="modal-cat-icon"
                  className="font-extrabold text-[0.7rem] uppercase mb-1"
                >
                  Deck Icon (Emoji)
                </label>
                <input
                  type="text"
                  className="input-control border-2 border-border-light dark:border-border-dark p-2.5 rounded-xl bg-surface-card-light dark:bg-surface-card-dark text-xs outline-none focus:border-primary"
                  id="modal-cat-icon"
                  placeholder="e.g. 🏏, 🎬, 🍕"
                  value={newDeckIcon}
                  onChange={(e) => setNewDeckIcon(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setIsNewDeckModalOpen(false)}
                  className="border border-border-light dark:border-border-dark text-xs font-bold px-4 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveDeckLoading}
                  className="btn bg-primary text-accent text-xs font-black px-5 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {saveDeckLoading ? "Saving..." : "Create Deck"}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
