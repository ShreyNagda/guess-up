import React, { useState, useEffect } from "react";
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
import { Footer } from "../components/Footer";

const DECK_EMOJI_MAPPING = {
  CF: "🏏",
  BH: "🎬",
  DC: "🍔",
  II: "🗻",
  HP: "🎧",
  GU: "📺"
};

const getDeckEmoji = (icon) => {
  return DECK_EMOJI_MAPPING[icon] || icon;
};

export const AdminPage = () => {
  const { showToast } = useToast();

  // Auth state
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("admin@guessup.com");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Decks list & Selected Deck
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState(null);

  // Form states
  const [isNewDeckOpen, setIsNewDeckOpen] = useState(false);
  const [newDeckId, setNewDeckId] = useState("");
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckIcon, setNewDeckIcon] = useState("📺");
  const [saveDeckLoading, setSaveDeckLoading] = useState(false);

  // Words / AI states
  const [bulkInput, setBulkInput] = useState("");
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

  // Sync Categories list in real time
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

  // Update selected deck state when list updates or selection changes
  useEffect(() => {
    if (selectedDeckId && decks.length > 0) {
      const match = decks.find((d) => d.id === selectedDeckId);
      setSelectedDeck(match || null);
    } else {
      setSelectedDeck(null);
    }
  }, [selectedDeckId, decks]);

  // Auth Logic
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

  // Deck Management Logic
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
      setIsNewDeckOpen(false);
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

  // Word Management Logic
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
      }
    } catch (err) {
      showToast(`Add failed: ${err.message}`, "error");
    } finally {
      setAddWordsLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedDeckId || !selectedDeck) {
      showToast("Please select a deck first.", "error");
      return;
    }

    const promptVal = bulkInput.trim();
    if (!promptVal) {
      showToast(
        "Please enter a topic or theme description in the text box first (e.g. 'cricket players from India').",
        "error",
      );
      return;
    }

    setAiLoading(true);
    setAiStatusText("Connecting to Gemini AI...");

    try {
      // 1. Fetch live fresh data from Firestore
      setAiStatusText("Querying live database...");
      const categoryDoc = await getDoc(doc(db, "categories", selectedDeckId));
      const liveData = categoryDoc.data();
      const currentWords = liveData ? liveData.words || [] : [];

      // 2. Generate
      setAiStatusText("Generating cards with Gemini...");
      const generated = await generateAICards(
        selectedDeck.name,
        promptVal,
        aiCount,
      );

      // 3. Deduplicate
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

      // 4. Update
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
    } catch (err) {
      showToast(`AI generation failed: ${err.message}`, "error");
    } finally {
      setAiLoading(false);
      setAiStatusText("");
    }
  };

  const handleDeleteWord = async (word) => {
    if (!selectedDeckId) return;

    const confirmDel = window.confirm(
      `Are you sure you want to remove the word "${word}"?`,
    );
    if (!confirmDel) return;

    try {
      await updateDoc(doc(db, "categories", selectedDeckId), {
        words: arrayRemove(word),
      });
      showToast(`Removed word: "${word}"`, "success");
    } catch (err) {
      showToast(`Remove failed: ${err.message}`, "error");
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen text-text-light dark:text-text-dark bg-transparent">
        <Header />
        <div className="flex-1 flex justify-center items-center">
          <div className="spinner w-8 h-8 border-4" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-text-light dark:text-text-dark bg-transparent">
      <Header />

      <AnimatePresence mode="wait">
        {!user ? (
          /* Auth Wall */
          <motion.div
            key="auth-wall"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col justify-center items-center px-4 py-12"
          >
            <div className="bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark rounded-3xl p-6 sm:p-12 max-w-md w-full shadow-xl flex flex-col gap-6 text-center">
              <div className="flex flex-col gap-2 items-center">
                <h2 className="text-3xl font-black text-primary dark:text-text-dark drop-shadow-[2px_2px_0px_var(--color-accent)] dark:drop-shadow-[2px_2px_0px_var(--color-primary)] uppercase">
                  Firebase Login
                </h2>
                <p className="text-sm text-muted-light dark:text-muted-dark">
                  Connect to Firestore to perform secure writes
                </p>
              </div>

              <div className="bg-primary/5 border border-dashed border-primary rounded-2xl p-4 text-left text-xs leading-relaxed flex flex-col gap-2">
                <strong className="font-extrabold uppercase">
                  Security Notice:
                </strong>
                <p>
                  This is a secure area. Log in with your registered
                  administrator account. Unauthorized access attempts are
                  monitored and blocked.
                </p>
              </div>

              <form
                onSubmit={handleLogin}
                className="flex flex-col gap-4 text-left"
              >
                <div className="input-group">
                  <label htmlFor="fb-email">Admin Email</label>
                  <input
                    type="email"
                    className="input-control"
                    id="fb-email"
                    placeholder="admin@guessup.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="fb-password">Password</label>
                  <input
                    type="password"
                    className="input-control"
                    id="fb-password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="btn bg-primary text-accent w-full font-black py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-md mt-2 disabled:opacity-50 cursor-pointer"
                >
                  {loginLoading ? "Authenticating..." : "Authenticate & Access"}
                </button>
              </form>

              {loginError && (
                <div className="text-error font-black text-sm border border-error/20 bg-error/5 p-3 rounded-xl leading-snug">
                  {loginError}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Admin Dashboard Dashboard */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-8"
          >
            {/* User Logged in Info bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark p-4 rounded-2xl gap-4 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center font-black text-primary">
                  AD
                </div>
                <div className="text-left">
                  <h3 className="font-extrabold text-sm uppercase text-muted-light dark:text-muted-dark">
                    Admin Console
                  </h3>
                  <p className="text-sm font-semibold">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="border-2 border-primary dark:border-border-dark text-text-light dark:text-text-dark font-extrabold text-sm px-4 py-2 rounded-xl hover:bg-primary hover:text-accent dark:hover:bg-white/5 active:scale-95 transition-all cursor-pointer w-full sm:w-auto"
              >
                Logout
              </button>
            </div>

            {/* Main Panel Content Grid */}
            <div className="grid lg:grid-cols-[1fr_2.2fr] gap-6 items-start">
              {/* Left Pane: Categories List */}
              <div className="bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark p-6 rounded-3xl flex flex-col gap-6 shadow-sm">
                <div className="flex justify-between items-center border-b border-border-light dark:border-border-dark pb-4">
                  <span className="text-xl font-black">Decks</span>
                  <button
                    onClick={() => setIsNewDeckOpen((prev) => !prev)}
                    className="btn bg-primary text-accent text-xs font-black px-4 py-2 rounded-xl cursor-pointer hover:scale-105 transition-all shadow-sm"
                  >
                    {isNewDeckOpen ? "Cancel" : "+ Add Deck"}
                  </button>
                </div>

                {/* Create New Deck form */}
                <AnimatePresence>
                  {isNewDeckOpen && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleCreateDeck}
                      className="bg-surface-card-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark p-4 rounded-2xl flex flex-col gap-4 overflow-hidden text-left"
                    >
                      <h4 className="font-extrabold text-sm uppercase text-primary">
                        Create New Deck
                      </h4>
                      <div className="input-group">
                        <label htmlFor="cat-id">Deck ID (slug)</label>
                        <input
                          type="text"
                          className="input-control"
                          id="cat-id"
                          placeholder="cricket-fever"
                          value={newDeckId}
                          onChange={(e) => setNewDeckId(e.target.value)}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label htmlFor="cat-name">Deck Name</label>
                        <input
                          type="text"
                          className="input-control"
                          id="cat-name"
                          placeholder="Cricket Fever"
                          value={newDeckName}
                          onChange={handleNewDeckNameChange}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label htmlFor="cat-icon">Deck Icon (Emoji)</label>
                        <input
                          type="text"
                          className="input-control"
                          id="cat-icon"
                          placeholder="e.g. 🏏, 🎬, 🍔"
                          value={newDeckIcon}
                          onChange={(e) => setNewDeckIcon(e.target.value)}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={saveDeckLoading}
                        className="btn bg-primary text-accent w-full font-black py-2.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {saveDeckLoading ? "Saving..." : "Save Deck"}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Decks selection list */}
                <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-3 max-h-75 lg:max-h-125 lg:overflow-y-auto pr-0 lg:pr-1">
                  {decks.map((deck) => (
                    <div
                      key={deck.id}
                      onClick={() => setSelectedDeckId(deck.id)}
                      className={`flex items-center justify-between border-2 rounded-2xl p-4 cursor-pointer shrink-0 lg:shrink min-width-[200px] lg:min-width-0 transition-all ${
                        selectedDeckId === deck.id
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-surface-card-light dark:bg-surface-card-dark hover:border-border-light dark:hover:border-border-dark hover:-translate-y-0.5 lg:hover:translate-x-0.5 lg:hover:translate-y-0"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${selectedDeckId === deck.id ? "bg-primary/15 text-primary border border-primary/20" : "bg-black/5 dark:bg-white/5"}`}
                        >
                          {deck.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-extrabold text-sm">
                            {deck.name}
                          </div>
                          <div className="text-xs text-muted-light dark:text-muted-dark">
                            {deck.words.length} cards
                          </div>
                        </div>
                      </div>
                      <div className="w-5 h-5 flex items-center justify-center opacity-40">
                        {/* CSS Chevron */}
                        <div className="w-2 h-2 border-r-2 border-b-2 border-text-light dark:border-text-dark transform -rotate-45" />
                      </div>
                    </div>
                  ))}
                  {decks.length === 0 && (
                    <p className="text-center text-muted-light dark:text-muted-dark py-8 w-full">
                      No decks found in Firestore.
                    </p>
                  )}
                </div>
              </div>

              {/* Right Pane: Selected Category Details Editor */}
              <div className="bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark p-6 rounded-3xl flex flex-col gap-6 shadow-sm min-h-100">
                <div className="flex justify-between items-center border-b border-border-light dark:border-border-dark pb-4">
                  <span className="text-xl font-black">Cards Editor</span>
                  {selectedDeck && (
                    <span className="selected-category-badge visible uppercase tracking-wide font-black text-xs">
                      {selectedDeck.icon} {selectedDeck.name}
                    </span>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {!selectedDeck ? (
                    /* Editor Empty State */
                    <motion.div
                      key="empty-editor"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col items-center justify-center text-muted-light dark:text-muted-dark py-16 gap-3 text-center"
                    >
                      <div className="w-12 h-12 border-2 border-border-light dark:border-border-dark rounded-full flex items-center justify-center opacity-40">
                        {/* Chevron pointing left */}
                        <div className="w-3 h-3 border-l-2 border-b-2 border-text-light dark:border-text-dark transform rotate-45 translate-x-0.5" />
                      </div>
                      <p className="max-w-xs text-sm">
                        Select a category deck from the list to view, edit, or
                        add word cards.
                      </p>
                    </motion.div>
                  ) : (
                    /* Editor Workspace */
                    <motion.div
                      key="active-editor"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex flex-col gap-6 text-left"
                    >
                      {/* Active Deck Header */}
                      <div className="flex justify-between items-start flex-wrap gap-4 border-b border-border-light dark:border-border-dark pb-4">
                        <div>
                          <h3 className="font-black text-2xl">
                            {selectedDeck.name}
                          </h3>
                          <p className="text-xs text-muted-light dark:text-muted-dark font-mono mt-1">
                            ID: {selectedDeck.id}
                          </p>
                        </div>
                        <button
                          onClick={handleDeleteDeck}
                          disabled={deleteDeckLoading}
                          className="btn bg-error text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-red-700 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
                        >
                          {deleteDeckLoading ? "Deleting..." : "Delete Deck"}
                        </button>
                      </div>

                      {/* Add cards box */}
                      <div className="bg-surface-card-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark rounded-2xl p-4 sm:p-6 flex flex-col gap-4">
                        <div className="input-group">
                          <label htmlFor="bulk-words">
                            Enter Words (Comma/newline separated) OR Topic
                            Description (for AI generation)
                          </label>
                          <textarea
                            className="input-control font-semibold"
                            id="bulk-words"
                            rows={3}
                            placeholder="E.g., Virat Kohli, MS Dhoni OR prompt like 'cricket players from India'"
                            value={bulkInput}
                            onChange={(e) => setBulkInput(e.target.value)}
                            style={{ resize: "vertical" }}
                          />
                        </div>

                        <div className="flex flex-wrap gap-3 items-center">
                          <button
                            onClick={handleAddWords}
                            disabled={addWordsLoading || aiLoading}
                            className="btn bg-primary text-accent font-black px-6 py-3 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-md text-sm"
                          >
                            {addWordsLoading ? "Adding..." : "Add Word(s)"}
                          </button>

                          <button
                            onClick={handleGenerateAI}
                            disabled={aiLoading || addWordsLoading}
                            className="btn border-2 border-primary bg-transparent text-text-light dark:text-text-dark font-black px-6 py-3 rounded-xl hover:bg-primary hover:text-accent disabled:opacity-50 cursor-pointer text-sm shadow-none"
                          >
                            Generate with AI
                          </button>

                          <div className="flex items-center gap-2 border border-border-light dark:border-border-dark px-3 py-1.5 rounded-xl bg-surface-light dark:bg-surface-dark">
                            <label
                              htmlFor="ai-count"
                              className="font-extrabold text-[0.8rem] uppercase text-muted-light dark:text-muted-dark tracking-wide"
                            >
                              Qty:
                            </label>
                            <select
                              id="ai-count"
                              className="bg-transparent border-none outline-none font-bold text-sm text-text-light dark:text-text-dark cursor-pointer pr-2"
                              value={aiCount}
                              onChange={(e) =>
                                setAiCount(parseInt(e.target.value))
                              }
                            >
                              <option value={10}>10</option>
                              <option value={15}>15</option>
                              <option value={25}>25</option>
                              <option value={50}>50</option>
                            </select>
                          </div>
                        </div>

                        {/* AI status indicator */}
                        {aiLoading && (
                          <div className="flex items-center gap-3 text-sm font-bold text-primary mt-2">
                            <div className="spinner w-4 h-4 border-2" />
                            <span>{aiStatusText}</span>
                          </div>
                        )}
                      </div>

                      {/* Current cards list */}
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center font-extrabold">
                          <span className="text-base">Current Cards</span>
                          <span className="text-primary text-lg">
                            {selectedDeck.words.length}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 max-h-100 overflow-y-auto border border-border-light dark:border-border-dark p-4 rounded-2xl bg-surface-card-light/20 dark:bg-surface-card-dark/25">
                          {selectedDeck.words.map((word, idx) => (
                            <div
                              key={idx}
                              className="bg-surface-card-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark px-3.5 py-1.5 rounded-xl inline-flex items-center gap-2 text-sm font-semibold shadow-sm"
                            >
                              <span>{word}</span>
                              <button
                                onClick={() => handleDeleteWord(word)}
                                className="text-muted-light dark:text-muted-dark hover:text-error text-base font-bold cursor-pointer transition-colors leading-none"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                          {selectedDeck.words.length === 0 && (
                            <p className="text-muted-light dark:text-muted-dark text-sm w-full text-center py-8">
                              No words in this deck. Add some cards above!
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};
