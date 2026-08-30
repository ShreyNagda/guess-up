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
import { useToast } from "../context/ToastContext";
import { useInactivityLogout } from "../hooks/useInactivityLogout";
import { Header } from "../components/Header";
import { DeckModal } from "../components/DeckModal";

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
  // Deck Configuration Editing States
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedDeckName, setEditedDeckName] = useState("");
  const [editedDeckIcon, setEditedDeckIcon] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedColorHex, setEditedColorHex] = useState("#FFC107");
  const [editedIsAvailable, setEditedIsAvailable] = useState(true);
  const [editedIsLocked, setEditedIsLocked] = useState(false);
  const [editedLockReason, setEditedLockReason] = useState("");
  const [editedBadgeText, setEditedBadgeText] = useState("");
  const [saveSettingsLoading, setSaveSettingsLoading] = useState(false);

  // Form states (Create New Deck Modal & Deck Preview Modal)
  const [isNewDeckModalOpen, setIsNewDeckModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [newDeckId, setNewDeckId] = useState("");
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckIcon, setNewDeckIcon] = useState("📺");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [newDeckColorHex, setNewDeckColorHex] = useState("#FFC107");
  const [newDeckIsAvailable, setNewDeckIsAvailable] = useState(true);
  const [newDeckIsLocked, setNewDeckIsLocked] = useState(false);
  const [newDeckLockReason, setNewDeckLockReason] = useState("");
  const [newDeckBadgeText, setNewDeckBadgeText] = useState("");
  const [saveDeckLoading, setSaveDeckLoading] = useState(false);

  // Words & Search states
  const [bulkInput, setBulkInput] = useState("");
  const [wordSearchQuery, setWordSearchQuery] = useState("");
  const [deckSearchQuery, setDeckSearchQuery] = useState("");
  const [addWordsLoading, setAddWordsLoading] = useState(false);
  const [aiCount, setAiCount] = useState(15);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatusText, setAiStatusText] = useState("");
  const [deleteDeckLoading, setDeleteDeckLoading] = useState(false);

  // Bulk Card Selection & Inline Editing States
  const [selectedCards, setSelectedCards] = useState([]);
  const [editingWord, setEditingWord] = useState(null);
  const [editedWordText, setEditedWordText] = useState("");

  // AI Review Staging Drawer States
  const [isAiReviewOpen, setIsAiReviewOpen] = useState(false);
  const [aiStagingWords, setAiStagingWords] = useState([]);
  const [selectedAiWords, setSelectedAiWords] = useState([]);

  // File Import Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importWordsPreview, setImportWordsPreview] = useState([]);
  const [selectedImportWords, setSelectedImportWords] = useState([]);

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
            description: data.description || data.desc || "",
            colorHex: data.colorHex || data.color || "#FFC107",
            isAvailable:
              data.isAvailable !== false && data.status !== "inactive",
            isLocked: data.isLocked || false,
            lockReason: data.lockReason || "",
            theme: data.theme || {},
          });
        });
        setDecks(categoriesList);

        // Keep current selected deck if it exists; only auto-select first deck if none selected
        setSelectedDeckId((currentId) => {
          if (currentId && categoriesList.some((d) => d.id === currentId)) {
            return currentId;
          }
          return categoriesList.length > 0 ? categoriesList[0].id : null;
        });
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
        setEditedDeckName(match.name || "");
        setEditedDeckIcon(match.icon || "🎮");
        setEditedDescription(match.description || "");
        setEditedColorHex(match.colorHex || "#FFC107");
        setEditedIsAvailable(
          match.isAvailable !== false && match.status !== "inactive",
        );
        setEditedIsLocked(match.isLocked || false);
        setEditedLockReason(match.lockReason || "");
        setEditedBadgeText(match.theme?.badgeText || "");
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
      showToast("ID, Name, and Icon are required", "error");
      return;
    }

    setSaveDeckLoading(true);

    try {
      await setDoc(doc(db, "categories", id), {
        name,
        icon,
        words: [],
        description: newDeckDescription.trim(),
        colorHex: newDeckColorHex.trim(),
        color: newDeckColorHex.trim(),
        isAvailable: newDeckIsAvailable,
        status: newDeckIsAvailable ? "active" : "inactive",
        isLocked: newDeckIsLocked,
        lockReason: newDeckLockReason.trim(),
        theme: {
          badgeText: newDeckBadgeText.trim(),
          accentColor: newDeckColorHex.trim(),
        },
      });
      showToast(`Deck "${name}" created successfully!`, "success");
      setIsNewDeckModalOpen(false);
      setNewDeckId("");
      setNewDeckName("");
      setNewDeckIcon("📺");
      setNewDeckDescription("");
      setNewDeckColorHex("#FFC107");
      setNewDeckIsAvailable(true);
      setNewDeckIsLocked(false);
      setNewDeckLockReason("");
      setNewDeckBadgeText("");
      setSelectedDeckId(id);
    } catch (err) {
      showToast(`Save failed: ${err.message}`, "error");
    } finally {
      setSaveDeckLoading(false);
    }
  };

  // Save Deck Configuration Settings Handler
  const handleSaveDeckSettings = async (e) => {
    e.preventDefault();
    if (!selectedDeckId) return;

    setSaveSettingsLoading(true);
    try {
      await updateDoc(doc(db, "categories", selectedDeckId), {
        name: editedDeckName.trim(),
        icon: editedDeckIcon.trim(),
        description: editedDescription.trim(),
        colorHex: editedColorHex.trim(),
        color: editedColorHex.trim(),
        isAvailable: editedIsAvailable,
        status: editedIsAvailable ? "active" : "inactive",
        isLocked: editedIsLocked,
        lockReason: editedLockReason.trim(),
        theme: {
          ...(selectedDeck?.theme || {}),
          badgeText: editedBadgeText.trim(),
          accentColor: editedColorHex.trim(),
        },
      });
      showToast("Deck settings updated successfully!", "success");
    } catch (err) {
      showToast(`Update failed: ${err.message}`, "error");
    } finally {
      setSaveSettingsLoading(false);
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
        showToast(`Successfully added ${addedCount} new card(s)!`, "success");
        setBulkInput("");
        setActiveTab("cards");
      }
    } catch (err) {
      showToast(`Add failed: ${err.message}`, "error");
    } finally {
      setAddWordsLoading(false);
    }
  };

  // AI Generator Handler (Staged in AI Review Queue Drawer)
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
        currentWords,
      );

      setAiStatusText("Filtering duplicates...");
      const currentLower = new Set(currentWords.map((w) => w.toLowerCase()));
      const newUnique = [];

      for (const word of generated) {
        const cleaned = word.trim();
        if (!cleaned) continue;
        if (!currentLower.has(cleaned.toLowerCase())) {
          currentLower.add(cleaned.toLowerCase());
          newUnique.push(cleaned);
        }
      }

      if (newUnique.length === 0) {
        showToast(
          `All ${generated.length} AI generated words already exist in this deck!`,
          "info",
        );
        return;
      }

      setAiStagingWords(newUnique);
      setSelectedAiWords(newUnique);
      setIsAiReviewOpen(true);
      showToast(
        `Generated ${newUnique.length} card candidate(s) for review!`,
        "success",
      );
    } catch (err) {
      showToast(`AI generation failed: ${err.message}`, "error");
    } finally {
      setAiLoading(false);
      setAiStatusText("");
    }
  };

  // Commit Approved AI Staged Cards to Firestore
  const handleCommitAiReview = async () => {
    if (!selectedDeckId || selectedAiWords.length === 0) return;

    try {
      const categoryRef = doc(db, "categories", selectedDeckId);
      const currentWords = selectedDeck ? selectedDeck.words || [] : [];
      const updatedWords = [...currentWords, ...selectedAiWords];
      await updateDoc(categoryRef, { words: updatedWords });

      showToast(
        `Added ${selectedAiWords.length} card(s) to "${selectedDeck.name}"!`,
        "success",
      );
      setIsAiReviewOpen(false);
      setAiStagingWords([]);
      setSelectedAiWords([]);
      setBulkInput("");
      setActiveTab("cards");
    } catch (err) {
      showToast(`Save failed: ${err.message}`, "error");
    }
  };

  // Card Bulk Selection Handlers
  const handleToggleCardSelection = (word) => {
    setSelectedCards((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word],
    );
  };

  const handleSelectAllCards = () => {
    if (!selectedDeck) return;
    if (selectedCards.length === selectedDeck.words.length) {
      setSelectedCards([]);
    } else {
      setSelectedCards([...selectedDeck.words]);
    }
  };

  const handleBatchDeleteCards = async () => {
    if (!selectedDeckId || selectedCards.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedCards.length} selected card(s)?`,
    );
    if (!confirmDelete) return;

    try {
      const remainingWords = selectedDeck.words.filter(
        (w) => !selectedCards.includes(w),
      );
      await updateDoc(doc(db, "categories", selectedDeckId), {
        words: remainingWords,
      });
      showToast(`Deleted ${selectedCards.length} card(s).`, "success");
      setSelectedCards([]);
    } catch (err) {
      showToast(`Batch delete failed: ${err.message}`, "error");
    }
  };

  // Inline Card Editing Handlers
  const handleStartInlineEdit = (word) => {
    setEditingWord(word);
    setEditedWordText(word);
  };

  const handleSaveInlineEdit = async (oldWord) => {
    const cleanWord = editedWordText.trim();
    if (!selectedDeckId || !cleanWord || cleanWord === oldWord) {
      setEditingWord(null);
      return;
    }

    try {
      const updatedWords = selectedDeck.words.map((w) =>
        w === oldWord ? cleanWord : w,
      );
      await updateDoc(doc(db, "categories", selectedDeckId), {
        words: updatedWords,
      });
      showToast(`Card updated to "${cleanWord}"`, "success");
      setEditingWord(null);
    } catch (err) {
      showToast(`Edit failed: ${err.message}`, "error");
    }
  };

  // Export Deck Handlers
  const handleExportDeckJSON = () => {
    if (!selectedDeck) return;
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(selectedDeck, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${selectedDeck.id}-deck.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${selectedDeck.name} as JSON`, "info");
  };

  const handleExportDeckCSV = () => {
    if (!selectedDeck) return;
    const csvContent =
      "data:text/csv;charset=utf-8,Word\n" +
      selectedDeck.words.map((w) => `"${w.replace(/"/g, '""')}"`).join("\n");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `${selectedDeck.id}-words.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${selectedDeck.name} words as CSV`, "info");
  };

  // File Import Handlers
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content !== "string") return;

      let extracted = [];
      if (file.name.endsWith(".json")) {
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            extracted = parsed
              .map((item) =>
                typeof item === "string" ? item : item.word || item.name || "",
              )
              .filter(Boolean);
          } else if (parsed.words && Array.isArray(parsed.words)) {
            extracted = parsed.words;
          }
        } catch {
          showToast("Invalid JSON file format.", "error");
          return;
        }
      } else {
        // CSV or TXT line-separated
        extracted = content
          .split(/[,\r\n]+/)
          .map((w) => w.replace(/^["']|["']$/g, "").trim())
          .filter((w) => w.length > 0 && w.toLowerCase() !== "word");
      }

      if (extracted.length === 0) {
        showToast("No words found in uploaded file.", "error");
        return;
      }

      const uniqueExtracted = Array.from(new Set(extracted));
      setImportWordsPreview(uniqueExtracted);
      setSelectedImportWords(uniqueExtracted);
      setIsImportModalOpen(true);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCommitFileImport = async () => {
    if (!selectedDeckId || selectedImportWords.length === 0) return;

    try {
      const categoryRef = doc(db, "categories", selectedDeckId);
      const currentWords = selectedDeck ? selectedDeck.words || [] : [];
      const combined = [...currentWords, ...selectedImportWords];
      const uniqueWords = Array.from(new Set(combined));

      await updateDoc(categoryRef, { words: uniqueWords });
      showToast(`Imported ${selectedImportWords.length} card(s)!`, "success");
      setIsImportModalOpen(false);
      setImportWordsPreview([]);
      setSelectedImportWords([]);
      setActiveTab("cards");
    } catch (err) {
      showToast(`Import failed: ${err.message}`, "error");
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

                <div className="hidden lg:flex items-center gap-6 border-l border-border-light dark:border-border-dark pl-6">
                  <div>
                    <span className="text-[0.65rem] uppercase font-extrabold text-muted-light dark:text-muted-dark block">
                      Total Decks
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
                  <div>
                    <span className="text-[0.65rem] uppercase font-extrabold text-muted-light dark:text-muted-dark block">
                      Active Decks
                    </span>
                    <span className="text-sm font-black text-emerald-500">
                      {decks.filter((d) => d.isAvailable).length}
                    </span>
                  </div>
                  {decks.filter((d) => (d.words?.length || 0) < 10).length >
                    0 && (
                    <div>
                      <span className="text-[0.65rem] uppercase font-extrabold text-amber-500 block">
                        ⚠️ Low Cards Decks
                      </span>
                      <span className="text-sm font-black text-amber-500">
                        {
                          decks.filter((d) => (d.words?.length || 0) < 10)
                            .length
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsNewDeckModalOpen(true)}
                  className="btn bg-primary text-accent text-xs font-black px-4 py-2 rounded-xl hover:scale-105 transition-all shadow-sm cursor-pointer"
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
                <div className="shrink-0 flex justify-between items-center pb-2.5 border-b border-border-light dark:border-border-dark mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-light dark:text-muted-dark">
                    Category Decks
                  </span>
                  <span className="bg-primary/15 text-primary font-black text-xs px-2 py-0.5 rounded-full">
                    {decks.length}
                  </span>
                </div>

                {/* Deck Search Input */}
                <div className="shrink-0 mb-2">
                  <input
                    type="text"
                    placeholder="Search decks..."
                    value={deckSearchQuery}
                    onChange={(e) => setDeckSearchQuery(e.target.value)}
                    className="w-full text-xs font-semibold p-2 px-3 rounded-xl border border-border-light dark:border-border-dark bg-surface-card-light dark:bg-surface-card-dark outline-none focus:border-primary transition-all placeholder:text-muted-light dark:placeholder:text-muted-dark"
                  />
                </div>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
                  {decks
                    .filter(
                      (d) =>
                        d.name
                          .toLowerCase()
                          .includes(deckSearchQuery.toLowerCase()) ||
                        d.id
                          .toLowerCase()
                          .includes(deckSearchQuery.toLowerCase()),
                    )
                    .map((deck) => {
                      const isSelected = selectedDeckId === deck.id;
                      return (
                        <button
                          key={deck.id}
                          onClick={() => setSelectedDeckId(deck.id)}
                          className={`w-full flex items-center justify-between border-2 rounded-2xl p-3 text-left transition-all duration-150 active:scale-98 cursor-pointer shrink-0 ${
                            isSelected
                              ? "border-primary bg-primary/15 shadow-sm"
                              : "border-transparent bg-surface-card-light/60 dark:bg-surface-card-dark/60 hover:bg-black/5 dark:hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <span className="text-lg shrink-0">
                              {deck.icon}
                            </span>
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
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
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
                              <button
                                onClick={() => setIsPreviewModalOpen(true)}
                                className="text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-bold px-2 py-0.5 rounded-lg transition-all"
                              >
                                👁️ Preview Deck Modal
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
                            Add & AI
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
                          {/* Cards Action Bar */}
                          <div className="shrink-0 flex flex-wrap justify-between items-center gap-3 bg-surface-card-light/60 dark:bg-surface-card-dark/60 p-2.5 px-3 rounded-2xl border border-border-light dark:border-border-dark">
                            <div className="flex items-center gap-3">
                              <input
                                type="text"
                                placeholder="🔍 Search cards in deck..."
                                value={wordSearchQuery}
                                onChange={(e) =>
                                  setWordSearchQuery(e.target.value)
                                }
                                className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-2 px-3 rounded-xl text-xs font-semibold outline-none focus:border-primary w-48 sm:w-64"
                              />

                              {selectedDeck.words.length > 0 && (
                                <button
                                  onClick={handleSelectAllCards}
                                  className="text-xs font-bold text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-lg border border-border-light dark:border-border-dark"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      selectedCards.length > 0 &&
                                      selectedCards.length ===
                                        selectedDeck.words.length
                                    }
                                    onChange={() => {}}
                                    className="cursor-pointer accent-primary"
                                  />
                                  <span>
                                    {selectedCards.length ===
                                    selectedDeck.words.length
                                      ? "Deselect All"
                                      : "Select All"}
                                  </span>
                                </button>
                              )}

                              {selectedCards.length > 0 && (
                                <button
                                  onClick={handleBatchDeleteCards}
                                  className="bg-error/15 text-error border border-error/30 hover:bg-error hover:text-white font-extrabold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
                                >
                                  🗑️ Delete ({selectedCards.length})
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Export Dropdown */}
                              <div className="flex items-center gap-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-1 rounded-xl">
                                <span className="text-[0.65rem] font-bold text-muted-light dark:text-muted-dark px-1.5 uppercase">
                                  Export:
                                </span>
                                <button
                                  onClick={handleExportDeckJSON}
                                  className="text-xs font-bold px-2 py-0.5 rounded-lg hover:bg-primary/20 text-primary transition-all"
                                  title="Export deck as JSON"
                                >
                                  JSON
                                </button>
                                <button
                                  onClick={handleExportDeckCSV}
                                  className="text-xs font-bold px-2 py-0.5 rounded-lg hover:bg-primary/20 text-primary transition-all"
                                  title="Export deck words as CSV"
                                >
                                  CSV
                                </button>
                              </div>

                              {/* Import File Button */}
                              <label className="btn border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:border-primary text-text-light dark:text-text-dark font-extrabold text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-sm">
                                <span>📥 Import File</span>
                                <input
                                  type="file"
                                  accept=".csv,.json,.txt"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                />
                              </label>

                              <button
                                onClick={() => setActiveTab("add")}
                                className="btn bg-primary text-accent text-xs font-black px-3.5 py-2 rounded-xl hover:scale-105 transition-all shadow-sm"
                              >
                                + Add Cards
                              </button>
                            </div>
                          </div>

                          {/* Live Cards List */}
                          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 auto-rows-max">
                            {filteredWords.map((word, idx) => {
                              const isSelected = selectedCards.includes(word);
                              const isEditing = editingWord === word;

                              return (
                                <div
                                  key={idx}
                                  className={`border p-2 px-3 rounded-xl flex items-center justify-between text-xs font-bold shadow-sm transition-all group ${
                                    isSelected
                                      ? "border-primary bg-primary/10"
                                      : "bg-surface-card-light dark:bg-surface-card-dark border-border-light dark:border-border-dark hover:border-primary/50"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() =>
                                        handleToggleCardSelection(word)
                                      }
                                      className="cursor-pointer accent-primary shrink-0"
                                    />
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        autoFocus
                                        value={editedWordText}
                                        onChange={(e) =>
                                          setEditedWordText(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter")
                                            handleSaveInlineEdit(word);
                                          if (e.key === "Escape")
                                            setEditingWord(null);
                                        }}
                                        onBlur={() =>
                                          handleSaveInlineEdit(word)
                                        }
                                        className="w-full bg-surface-light dark:bg-surface-dark border border-primary p-0.5 px-1 rounded font-bold text-xs outline-none"
                                      />
                                    ) : (
                                      <span
                                        onDoubleClick={() =>
                                          handleStartInlineEdit(word)
                                        }
                                        className="truncate cursor-pointer"
                                        title="Double click to edit text"
                                      >
                                        {word}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() =>
                                        handleStartInlineEdit(word)
                                      }
                                      className="text-muted-light dark:text-muted-dark hover:text-primary p-0.5 text-[0.7rem]"
                                      title="Edit card text"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeleteWord(word)}
                                      className="text-muted-light dark:text-muted-dark hover:text-error text-xs font-black cursor-pointer p-0.5"
                                      title="Remove card"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

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

                      {/* Tab 2: Add Cards (Single Viewport Layout) */}
                      {activeTab === "add" && (
                        <div className="flex-1 flex flex-col bg-surface-card-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark rounded-2xl p-5 overflow-hidden gap-4">
                          <div className="shrink-0 flex flex-col gap-1">
                            <h3 className="font-extrabold text-sm flex items-center justify-between">
                              <span>Add Cards Manually</span>
                              <span className="text-[0.7rem] text-primary font-mono font-extrabold">
                                {selectedDeck.name}
                              </span>
                            </h3>
                            <p className="text-[0.75rem] text-muted-light dark:text-muted-dark">
                              Type or paste card words separated by commas or
                              new lines.
                            </p>
                          </div>

                          <textarea
                            className="flex-1 border-2 border-border-light dark:border-border-dark p-3 rounded-xl bg-surface-light dark:bg-surface-dark font-semibold text-xs w-full outline-none focus:border-primary resize-none"
                            placeholder="E.g., Sachin Tendulkar, Virat Kohli, MS Dhoni..."
                            value={bulkInput}
                            onChange={(e) => setBulkInput(e.target.value)}
                          />

                          <div className="shrink-0 flex items-center justify-between border-t border-border-light dark:border-border-dark pt-3">
                            <button
                              onClick={handleAddWords}
                              disabled={addWordsLoading}
                              className="btn bg-primary text-accent font-black px-6 py-2.5 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-md text-xs"
                            >
                              {addWordsLoading
                                ? "Adding..."
                                : "+ Add Cards to Deck"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Tab 3: Settings & All Category Model Fields */}
                      {activeTab === "settings" && (
                        <form
                          onSubmit={handleSaveDeckSettings}
                          className="flex-1 flex flex-col bg-surface-card-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark rounded-2xl p-5 overflow-y-auto gap-4 text-left"
                        >
                          <div className="flex flex-col gap-0.5 border-b border-border-light dark:border-border-dark pb-3">
                            <h3 className="font-extrabold text-sm flex items-center gap-2">
                              <span>⚙️ Full Deck Configuration</span>
                              <span
                                className="text-[0.65rem] font-black uppercase px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: `${editedColorHex}25`,
                                  color: editedColorHex,
                                }}
                              >
                                {selectedDeck.id}
                              </span>
                            </h3>
                            <p className="text-[0.75rem] text-muted-light dark:text-muted-dark">
                              Update all fields for this category in Firestore
                              database.
                            </p>
                          </div>

                          {/* 1. Name & Icon */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex flex-col">
                              <label className="font-extrabold text-[0.7rem] uppercase mb-1">
                                Category Name
                              </label>
                              <input
                                type="text"
                                className="border-2 border-border-light dark:border-border-dark p-2.5 rounded-xl bg-surface-light dark:bg-surface-dark text-xs outline-none focus:border-primary font-bold"
                                value={editedDeckName}
                                onChange={(e) =>
                                  setEditedDeckName(e.target.value)
                                }
                                required
                              />
                            </div>

                            <div className="flex flex-col">
                              <label className="font-extrabold text-[0.7rem] uppercase mb-1">
                                Emoji Icon
                              </label>
                              <div className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  className="w-16 border-2 border-border-light dark:border-border-dark p-2.5 text-center rounded-xl bg-surface-light dark:bg-surface-dark text-base outline-none focus:border-primary font-bold"
                                  value={editedDeckIcon}
                                  onChange={(e) =>
                                    setEditedDeckIcon(e.target.value)
                                  }
                                  required
                                />
                                <div className="flex gap-1 overflow-x-auto py-1">
                                  {[
                                    "🏏",
                                    "🎬",
                                    "🍕",
                                    "🎮",
                                    "🚀",
                                    "👑",
                                    "🔥",
                                    "💡",
                                    "🎵",
                                    "🍔",
                                  ].map((emoji) => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => setEditedDeckIcon(emoji)}
                                      className="w-8 h-8 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:border-primary flex items-center justify-center text-sm cursor-pointer"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 2. Color Accent Picker */}
                          <div className="flex flex-col gap-1.5">
                            <label className="font-extrabold text-[0.7rem] uppercase">
                              Accent Color (Hex)
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={
                                  editedColorHex.startsWith("#")
                                    ? editedColorHex
                                    : `#${editedColorHex}`
                                }
                                onChange={(e) =>
                                  setEditedColorHex(e.target.value)
                                }
                                className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                              />
                              <input
                                type="text"
                                className="w-28 border-2 border-border-light dark:border-border-dark p-2 rounded-xl bg-surface-light dark:bg-surface-dark text-xs outline-none font-mono font-bold uppercase"
                                value={editedColorHex}
                                onChange={(e) =>
                                  setEditedColorHex(e.target.value)
                                }
                              />
                              <div className="flex gap-1.5 flex-wrap">
                                {[
                                  "#FFC107",
                                  "#4CAF50",
                                  "#00BCD4",
                                  "#9C27B0",
                                  "#E91E63",
                                  "#FF5722",
                                  "#3F51B5",
                                  "#009688",
                                ].map((hex) => (
                                  <button
                                    key={hex}
                                    type="button"
                                    onClick={() => setEditedColorHex(hex)}
                                    className="w-6 h-6 rounded-full border border-white/40 cursor-pointer hover:scale-110 transition-all"
                                    style={{ backgroundColor: hex }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* 3. Category Description */}
                          <div className="flex flex-col">
                            <label className="font-extrabold text-[0.7rem] uppercase mb-1">
                              Deck Overview / Description
                            </label>
                            <textarea
                              rows={3}
                              className="border-2 border-border-light dark:border-border-dark p-2.5 rounded-xl bg-surface-light dark:bg-surface-dark text-xs outline-none focus:border-primary font-medium resize-none"
                              placeholder="Short engaging description for app deck info modal..."
                              value={editedDescription}
                              onChange={(e) =>
                                setEditedDescription(e.target.value)
                              }
                            />
                          </div>

                          {/* 4. Badge Text */}
                          <div className="flex flex-col">
                            <label className="font-extrabold text-[0.7rem] uppercase mb-1">
                              Badge Tag Text (e.g. FESTIVE 🪔, IPL 🏏)
                            </label>
                            <input
                              type="text"
                              className="border-2 border-border-light dark:border-border-dark p-2.5 rounded-xl bg-surface-light dark:bg-surface-dark text-xs outline-none focus:border-primary font-bold"
                              placeholder="e.g. POPULAR, HOT 🔥, NEW 🚀"
                              value={editedBadgeText}
                              onChange={(e) =>
                                setEditedBadgeText(e.target.value)
                              }
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border-light dark:border-border-dark">
                            <div className="p-3 border border-border-light dark:border-border-dark rounded-xl bg-surface-light dark:bg-surface-dark flex items-center justify-between">
                              <div>
                                <span className="font-extrabold text-xs block">
                                  Hide Deck 👁️‍🗨️
                                </span>
                                <span className="text-[0.65rem] text-muted-light dark:text-muted-dark font-medium">
                                  {!editedIsAvailable
                                    ? "Hidden from players"
                                    : "Visible to players (default)"}
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                checked={!editedIsAvailable}
                                onChange={(e) =>
                                  setEditedIsAvailable(!e.target.checked)
                                }
                                className="w-5 h-5 cursor-pointer accent-error"
                              />
                            </div>

                            <div className="p-3 border border-border-light dark:border-border-dark rounded-xl bg-surface-light dark:bg-surface-dark flex items-center justify-between">
                              <div>
                                <span className="font-extrabold text-xs block">
                                  Lock Status 🔒
                                </span>
                                <span className="text-[0.65rem] text-muted-light dark:text-muted-dark">
                                  {editedIsLocked
                                    ? "Locked / Premium Deck"
                                    : "Unlocked / Free"}
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                checked={editedIsLocked}
                                onChange={(e) =>
                                  setEditedIsLocked(e.target.checked)
                                }
                                className="w-5 h-5 cursor-pointer accent-primary"
                              />
                            </div>
                          </div>

                          {editedIsLocked && (
                            <div className="flex flex-col">
                              <label className="font-extrabold text-[0.7rem] uppercase mb-1">
                                Lock Reason Text
                              </label>
                              <input
                                type="text"
                                className="border-2 border-border-light dark:border-border-dark p-2.5 rounded-xl bg-surface-light dark:bg-surface-dark text-xs outline-none focus:border-primary font-bold"
                                placeholder="e.g. Unlock with Pro Pass"
                                value={editedLockReason}
                                onChange={(e) =>
                                  setEditedLockReason(e.target.value)
                                }
                              />
                            </div>
                          )}

                          {/* Save Configuration Button */}
                          <button
                            type="submit"
                            disabled={saveSettingsLoading}
                            className="btn bg-primary text-accent font-black py-3 rounded-xl hover:scale-[1.01] active:scale-95 transition-all shadow-md text-xs cursor-pointer disabled:opacity-50 mt-1"
                          >
                            {saveSettingsLoading
                              ? "Saving to Firestore..."
                              : "Save Deck Settings"}
                          </button>

                          {/* Danger Zone */}
                          <div className="border border-error/30 bg-error/5 p-4 rounded-xl flex items-center justify-between gap-4 mt-2">
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
                        </form>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create New Deck Modal with All Category Fields */}
      <AnimatePresence>
        {isNewDeckModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleCreateDeck}
              className="bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark p-6 rounded-3xl max-w-lg w-full flex flex-col gap-4 shadow-2xl text-left max-h-[90vh] overflow-y-auto"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="input-group flex flex-col">
                  <label
                    htmlFor="modal-cat-id"
                    className="font-extrabold text-[0.7rem] uppercase mb-1"
                  >
                    Deck ID (Slug)
                  </label>
                  <input
                    type="text"
                    className="input-control border-2 border-border-light dark:border-border-dark p-2.5 rounded-xl bg-surface-card-light dark:bg-surface-card-dark text-xs outline-none focus:border-primary font-mono"
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
                    className="input-control border-2 border-border-light dark:border-border-dark p-2.5 rounded-xl bg-surface-card-light dark:bg-surface-card-dark text-xs outline-none focus:border-primary font-bold"
                    id="modal-cat-name"
                    placeholder="e.g. Cricket Fever"
                    value={newDeckName}
                    onChange={handleNewDeckNameChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group flex flex-col">
                <label
                  htmlFor="modal-cat-icon"
                  className="font-extrabold text-[0.7rem] uppercase mb-1"
                >
                  Deck Icon (Emoji)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    className="w-16 input-control border-2 border-border-light dark:border-border-dark p-2.5 text-center rounded-xl bg-surface-card-light dark:bg-surface-card-dark text-base outline-none focus:border-primary font-bold"
                    id="modal-cat-icon"
                    value={newDeckIcon}
                    onChange={(e) => setNewDeckIcon(e.target.value)}
                    required
                  />
                  <div className="flex gap-1 overflow-x-auto py-1">
                    {[
                      "🏏",
                      "🎬",
                      "🍕",
                      "🎮",
                      "🚀",
                      "👑",
                      "🔥",
                      "💡",
                      "🎵",
                      "🍔",
                    ].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewDeckIcon(emoji)}
                        className="w-8 h-8 rounded-lg bg-surface-card-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark hover:border-primary flex items-center justify-center text-sm cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="input-group flex flex-col">
                <label
                  htmlFor="modal-cat-color"
                  className="font-extrabold text-[0.7rem] uppercase mb-1"
                >
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={
                      newDeckColorHex.startsWith("#")
                        ? newDeckColorHex
                        : `#${newDeckColorHex}`
                    }
                    onChange={(e) => setNewDeckColorHex(e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    className="w-28 border-2 border-border-light dark:border-border-dark p-2 rounded-xl bg-surface-card-light dark:bg-surface-card-dark text-xs outline-none font-mono font-bold uppercase"
                    value={newDeckColorHex}
                    onChange={(e) => setNewDeckColorHex(e.target.value)}
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      "#FFC107",
                      "#4CAF50",
                      "#00BCD4",
                      "#9C27B0",
                      "#E91E63",
                      "#FF5722",
                      "#3F51B5",
                      "#009688",
                    ].map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setNewDeckColorHex(hex)}
                        className="w-6 h-6 rounded-full border border-white/40 cursor-pointer hover:scale-110 transition-all"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="input-group flex flex-col">
                <label
                  htmlFor="modal-cat-desc"
                  className="font-extrabold text-[0.7rem] uppercase mb-1"
                >
                  Deck Overview / Description
                </label>
                <textarea
                  id="modal-cat-desc"
                  rows={2}
                  className="input-control border-2 border-border-light dark:border-border-dark p-2.5 rounded-xl bg-surface-card-light dark:bg-surface-card-dark text-xs outline-none focus:border-primary resize-none"
                  placeholder="Short engaging deck description for app info sheet..."
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                />
              </div>

              <div className="input-group flex flex-col">
                <label
                  htmlFor="modal-cat-badge"
                  className="font-extrabold text-[0.7rem] uppercase mb-1"
                >
                  Badge Tag (Optional)
                </label>
                <input
                  type="text"
                  className="input-control border-2 border-border-light dark:border-border-dark p-2.5 rounded-xl bg-surface-card-light dark:bg-surface-card-dark text-xs outline-none focus:border-primary font-bold"
                  id="modal-cat-badge"
                  placeholder="e.g. NEW 🚀, IPL 🏏, HOT 🔥"
                  value={newDeckBadgeText}
                  onChange={(e) => setNewDeckBadgeText(e.target.value)}
                />
              </div>

              <div className="p-3 border border-border-light dark:border-border-dark rounded-xl bg-surface-card-light dark:bg-surface-card-dark flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-xs block">
                    Hide Deck 👁️‍🗨️
                  </span>
                  <span className="text-[0.65rem] text-muted-light dark:text-muted-dark font-medium">
                    {!newDeckIsAvailable
                      ? "Hidden from players"
                      : "Visible to players (default)"}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={!newDeckIsAvailable}
                  onChange={(e) => setNewDeckIsAvailable(!e.target.checked)}
                  className="w-5 h-5 cursor-pointer accent-error"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2 border-t border-border-light dark:border-border-dark pt-3">
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

        {/* Gemini AI Card Review Staging Drawer / Modal */}
        {isAiReviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-surface-light dark:bg-surface-dark border-2 border-primary rounded-3xl p-6 max-w-xl w-full shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-hidden"
            >
              <div className="flex justify-between items-center border-b border-border-light dark:border-border-dark pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <div>
                    <h3 className="font-black text-base">
                      Review Gemini AI Generated Cards
                    </h3>
                    <p className="text-[0.7rem] text-muted-light dark:text-muted-dark">
                      Select or uncheck cards before adding them to "
                      {selectedDeck?.name}"
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiReviewOpen(false)}
                  className="text-lg font-black text-muted-light hover:text-text-light dark:hover:text-text-dark"
                >
                  ✕
                </button>
              </div>

              {/* Cards Checkbox List */}
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-2 auto-rows-max my-1">
                {aiStagingWords.map((word, idx) => {
                  const isChecked = selectedAiWords.includes(word);
                  return (
                    <label
                      key={idx}
                      className={`p-2.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 cursor-pointer transition-all ${
                        isChecked
                          ? "border-primary bg-primary/10"
                          : "border-border-light dark:border-border-dark bg-surface-card-light dark:bg-surface-card-dark opacity-60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setSelectedAiWords((prev) =>
                            prev.includes(word)
                              ? prev.filter((w) => w !== word)
                              : [...prev, word],
                          )
                        }
                        className="accent-primary cursor-pointer"
                      />
                      <span className="truncate">{word}</span>
                    </label>
                  );
                })}
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between border-t border-border-light dark:border-border-dark pt-3 shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <button
                    onClick={() =>
                      setSelectedAiWords(
                        selectedAiWords.length === aiStagingWords.length
                          ? []
                          : [...aiStagingWords],
                      )
                    }
                    className="text-primary hover:underline"
                  >
                    {selectedAiWords.length === aiStagingWords.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  <span className="text-muted-light dark:text-muted-dark">
                    ({selectedAiWords.length} of {aiStagingWords.length}{" "}
                    selected)
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAiReviewOpen(false)}
                    className="border border-border-light dark:border-border-dark px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCommitAiReview}
                    disabled={selectedAiWords.length === 0}
                    className="btn bg-primary text-accent font-black text-xs px-5 py-2 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-md cursor-pointer"
                  >
                    Approve & Add ({selectedAiWords.length})
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* File Import Preview Modal */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark rounded-3xl p-6 max-w-xl w-full shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-hidden"
            >
              <div className="flex justify-between items-center border-b border-border-light dark:border-border-dark pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📥</span>
                  <div>
                    <h3 className="font-black text-base">
                      File Import Word Preview
                    </h3>
                    <p className="text-[0.7rem] text-muted-light dark:text-muted-dark">
                      Parsed {importWordsPreview.length} card(s) from uploaded
                      file.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="text-lg font-black text-muted-light hover:text-text-light dark:hover:text-text-dark"
                >
                  ✕
                </button>
              </div>

              {/* Cards Checkbox List */}
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-2 auto-rows-max my-1">
                {importWordsPreview.map((word, idx) => {
                  const isChecked = selectedImportWords.includes(word);
                  return (
                    <label
                      key={idx}
                      className={`p-2.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 cursor-pointer transition-all ${
                        isChecked
                          ? "border-primary bg-primary/10"
                          : "border-border-light dark:border-border-dark bg-surface-card-light dark:bg-surface-card-dark opacity-60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setSelectedImportWords((prev) =>
                            prev.includes(word)
                              ? prev.filter((w) => w !== word)
                              : [...prev, word],
                          )
                        }
                        className="accent-primary cursor-pointer"
                      />
                      <span className="truncate">{word}</span>
                    </label>
                  );
                })}
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between border-t border-border-light dark:border-border-dark pt-3 shrink-0">
                <span className="text-xs font-bold text-muted-light dark:text-muted-dark">
                  {selectedImportWords.length} cards selected
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="border border-border-light dark:border-border-dark px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCommitFileImport}
                    disabled={selectedImportWords.length === 0}
                    className="btn bg-primary text-accent font-black text-xs px-5 py-2 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-md cursor-pointer"
                  >
                    Commit Import ({selectedImportWords.length})
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deck Preview Modal */}
      <DeckModal
        isOpen={isPreviewModalOpen}
        deck={selectedDeck}
        onClose={() => setIsPreviewModalOpen(false)}
      />
    </div>
  );
};
