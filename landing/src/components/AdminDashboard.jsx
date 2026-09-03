import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LogOut,
  Search,
  Users,
  MessageSquare,
  RefreshCw,
  FileSpreadsheet,
  FileJson,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Layers,
  Flame,
  Tag,
  Eye,
  EyeOff,
  AlertTriangle,
  Smile,
  SlidersHorizontal,
  Wand2,
} from "lucide-react";
import { ColorPicker } from "./ColorPicker";
import { getRandomUnusedColor, getDarkerShade } from "../utils/colorUtils";

const EMOJI_PALETTE = [
  "🎬",
  "🏏",
  "🍔",
  "😎",
  "🎵",
  "🏆",
  "✈️",
  "🎭",
  "🧠",
  "🍿",
  "🎨",
  "🎮",
  "🚗",
  "🚀",
  "🎯",
];

const ADMIN_SECRET_KEY = import.meta.env.VITE_ADMIN_SECRET || "admin123";

export const AdminDashboard = () => {
  const { isAdminLoggedIn, logout, openAuthModal } = useAdminAuth();
  const navigate = useNavigate();

  // 2 Master Sections: "decks" | "testers"
  const [activeSection, setActiveSection] = useState("decks");

  // Sub-tab for Testers section: "registrations" | "feedback"
  const [testersSubTab, setTestersSubTab] = useState("registrations");

  // Data states
  const [decksList, setDecksList] = useState([]);
  const [testersList, setTestersList] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);

  // Loading states
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [loadingTesters, setLoadingTesters] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false); // Deck Info Dialog (Metadata + View Words)
  const [isAddWordsModalOpen, setIsAddWordsModalOpen] = useState(false); // Add New Words Dialog
  const [editingDeck, setEditingDeck] = useState(null); // null = Create, object = Edit
  const [deleteConfirmDeck, setDeleteConfirmDeck] = useState(null);

  // Form Fields for Deck Info (Category model)
  const [deckId, setDeckId] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [deckName, setDeckName] = useState("");
  const [deckIcon, setDeckIcon] = useState("🎮");
  const [deckDesc, setDeckDesc] = useState("");
  const [deckColor, setDeckColor] = useState("#FFD600");
  const [deckGradientEnd, setDeckGradientEnd] = useState("#FF9100");
  const [deckIsTrending, setDeckIsTrending] = useState(false);
  const [deckIsAvailable, setDeckIsAvailable] = useState(true);
  const [deckSortOrder, setDeckSortOrder] = useState(0);
  const [deckWordsInput, setDeckWordsInput] = useState("");

  // Search inside Deck Info words list
  const [infoWordsSearch, setInfoWordsSearch] = useState("");

  // New Words Dialog single combined field state
  const [newWordsInput, setNewWordsInput] = useState("");
  const [savingDeck, setSavingDeck] = useState(false);
  const [savingNewWords, setSavingNewWords] = useState(false);

  // Listen to 'categories' collection in Firestore
  useEffect(() => {
    if (!isAdminLoggedIn) return;
    setLoadingDecks(true);

    let unsub = () => {};
    try {
      unsub = onSnapshot(
        collection(db, "categories"),
        (snapshot) => {
          const list = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              name: data.name || data.title || docSnap.id,
              icon: data.icon || "🎮",
              words: Array.isArray(data.words) ? data.words : [],
              description: data.description || data.desc || "",
              color: data.color || data.colorHex || "#FFD600",
              gradientEnd: data.gradientEnd || "#FF9100",
              isTrending: data.isTrending === true,
              isAvailable: data.isAvailable !== false,
              sortOrder:
                typeof data.sortOrder === "number" ? data.sortOrder : 0,
            });
          });
          list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setDecksList(list);
          setLoadingDecks(false);
        },
        (err) => {
          console.warn("Firestore categories fallback:", err);
          setLoadingDecks(false);
        },
      );
    } catch (_) {
      setLoadingDecks(false);
    }

    return () => unsub();
  }, [isAdminLoggedIn]);

  // Listen to 'testers' collection
  useEffect(() => {
    if (!isAdminLoggedIn) return;
    setLoadingTesters(true);

    let unsub = () => {};
    try {
      const q = query(collection(db, "testers"), orderBy("createdAt", "desc"));
      unsub = onSnapshot(
        q,
        (snapshot) => {
          const list = [];
          snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
          setTestersList(list);
          setLoadingTesters(false);
        },
        (err) => {
          console.warn("Firestore testers fallback:", err);
          const local = JSON.parse(
            localStorage.getItem("guessup_testers") || "[]",
          );
          setTestersList(local);
          setLoadingTesters(false);
        },
      );
    } catch (_) {
      const local = JSON.parse(localStorage.getItem("guessup_testers") || "[]");
      setTestersList(local);
      setLoadingTesters(false);
    }

    return () => unsub();
  }, [isAdminLoggedIn]);

  // Listen to 'feedback' collection
  useEffect(() => {
    if (!isAdminLoggedIn) return;
    setLoadingFeedback(true);

    let unsub = () => {};
    try {
      const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
      unsub = onSnapshot(
        q,
        (snapshot) => {
          const list = [];
          snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
          setFeedbackList(list);
          setLoadingFeedback(false);
        },
        (err) => {
          console.warn("Firestore feedback fallback:", err);
          const local = JSON.parse(
            localStorage.getItem("guessup_feedback") || "[]",
          );
          setFeedbackList(local);
          setLoadingFeedback(false);
        },
      );
    } catch (_) {
      const local = JSON.parse(
        localStorage.getItem("guessup_feedback") || "[]",
      );
      setFeedbackList(local);
      setLoadingFeedback(false);
    }

    return () => unsub();
  }, [isAdminLoggedIn]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black mb-2">Admin Dashboard Locked</h2>
        <p className="text-muted-dark text-sm max-w-sm mb-6">
          Please enter the internal admin passkey to access deck management and
          playtesters.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-2xl border border-border-dark font-extrabold text-xs hover:bg-white/5 transition-all cursor-pointer"
          >
            Back to Home
          </button>
          <button
            onClick={openAuthModal}
            className="px-6 py-3 rounded-2xl bg-primary text-accent font-black text-xs hover:scale-105 transition-all shadow-md cursor-pointer"
          >
            Enter Passkey
          </button>
        </div>
      </div>
    );
  }

  // --- DYNAMIC SLUG GENERATION ---
  const handleNameChange = (val) => {
    setDeckName(val);
    if (!editingDeck && autoSlug) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      setDeckId(generated);
    }
  };

  const handleInlineToggleAvailable = async (deck) => {
    try {
      await updateDoc(doc(db, "categories", deck.id), {
        isAvailable: !deck.isAvailable,
        adminSecret: ADMIN_SECRET_KEY,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error toggling deck visibility:", err);
    }
  };

  // --- DECK CRUD MODAL ACTIONS ---
  const openCreateDeckModal = () => {
    setEditingDeck(null);
    setAutoSlug(true);
    setDeckId("");
    setDeckName("");
    setDeckIcon("🎮");
    setDeckDesc("");

    const randomPrimary = getRandomUnusedColor(decksList);
    const darkerEnd = getDarkerShade(randomPrimary);
    setDeckColor(randomPrimary);
    setDeckGradientEnd(darkerEnd);

    setDeckIsTrending(false);
    setDeckIsAvailable(true);
    setDeckSortOrder(decksList.length);
    setDeckWordsInput("");
    setInfoWordsSearch("");
    setIsDeckModalOpen(true);
  };

  const openEditDeckModal = (deck) => {
    setEditingDeck(deck);
    setAutoSlug(false);
    setDeckId(deck.id);
    setDeckName(deck.name);
    setDeckIcon(deck.icon || "🎮");
    setDeckDesc(deck.description || "");
    setDeckColor(deck.color || "#FFD600");
    setDeckGradientEnd(deck.gradientEnd || "#FF9100");
    setDeckIsTrending(deck.isTrending === true);
    setDeckIsAvailable(deck.isAvailable !== false);
    setDeckSortOrder(deck.sortOrder || 0);
    setDeckWordsInput((deck.words || []).join(", "));
    setInfoWordsSearch("");
    setIsDeckModalOpen(true);
  };

  const openAddWordsModal = (deck) => {
    setEditingDeck(deck);
    setNewWordsInput("");
    setIsAddWordsModalOpen(true);
  };

  const handleSaveDeck = async (e) => {
    e.preventDefault();
    if (!deckName.trim()) return;

    setSavingDeck(true);

    const slugId =
      deckId
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_") ||
      deckName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_");

    const parsedWords = deckWordsInput
      .split(/[\n,]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    const targetDocId = editingDeck ? editingDeck.id : slugId;

    const payload = {
      name: deckName.trim(),
      icon: deckIcon.trim() || "🎮",
      description: deckDesc.trim(),
      color: deckColor,
      gradientEnd: deckGradientEnd,
      isTrending: deckIsTrending,
      isAvailable: deckIsAvailable,
      sortOrder: Number(deckSortOrder) || 0,
      words: parsedWords,
      wordsCount: parsedWords.length,
      adminSecret: ADMIN_SECRET_KEY,
      updatedAt: serverTimestamp(),
    };

    if (editingDeck) {
      payload.accentColor = deleteField();
      payload.colorHex = deleteField();
      payload.title = deleteField();
      payload.status = deleteField();
      payload.isLocked = deleteField();
      payload.lockReason = deleteField();
      payload.theme = deleteField();
    } else {
      payload.createdAt = serverTimestamp();
    }

    try {
      await setDoc(doc(db, "categories", targetDocId), payload, {
        merge: true,
      });
      setIsDeckModalOpen(false);
    } catch (err) {
      console.error("Error saving deck to Firestore:", err);
      alert("Failed to save deck: " + err.message);
    } finally {
      setSavingDeck(false);
    }
  };

  const handleSaveNewWordsOnly = async (e) => {
    e.preventDefault();
    if (!editingDeck) return;

    const wordsToAdd = newWordsInput
      .split(/[\n,]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (wordsToAdd.length === 0) {
      alert("Please enter at least one word to add.");
      return;
    }

    setSavingNewWords(true);

    const existingWords = Array.isArray(editingDeck.words)
      ? [...editingDeck.words]
      : [];
    const mergedWords = [...existingWords];

    wordsToAdd.forEach((w) => {
      if (!mergedWords.includes(w)) {
        mergedWords.push(w);
      }
    });

    try {
      await updateDoc(doc(db, "categories", editingDeck.id), {
        words: mergedWords,
        wordsCount: mergedWords.length,
        adminSecret: ADMIN_SECRET_KEY,
        updatedAt: serverTimestamp(),
      });
      setIsAddWordsModalOpen(false);
      setDeckWordsInput(mergedWords.join(", "));
    } catch (err) {
      console.error("Error adding new words:", err);
      alert("Failed to add words: " + err.message);
    } finally {
      setSavingNewWords(false);
    }
  };

  const handleDeleteDeck = async () => {
    if (!deleteConfirmDeck) return;
    try {
      await deleteDoc(doc(db, "categories", deleteConfirmDeck.id));
      setDeleteConfirmDeck(null);
    } catch (err) {
      console.error("Error deleting deck:", err);
      alert("Failed to delete deck: " + err.message);
    }
  };

  const handleRemoveSingleWordFromInfo = (wordToRemove) => {
    const currentWords = deckWordsInput
      .split(/[\n,]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0 && w !== wordToRemove);
    setDeckWordsInput(currentWords.join(", "));
  };

  // Filtered Decks
  const filteredDecks = decksList.filter((deck) => {
    const q = searchQuery.toLowerCase();
    return (
      (deck.name || "").toLowerCase().includes(q) ||
      (deck.id || "").toLowerCase().includes(q) ||
      (deck.description || "").toLowerCase().includes(q)
    );
  });

  // Filtered Testers & Feedback
  const filteredTesters = testersList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.name || "").toLowerCase().includes(q) ||
      (item.email || "").toLowerCase().includes(q)
    );
  });

  const filteredFeedback = feedbackList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.email || "").toLowerCase().includes(q) ||
      (item.feedbackText || "").toLowerCase().includes(q)
    );
  });

  // CSV Export Handler
  const exportCSV = () => {
    if (activeSection === "decks") {
      if (decksList.length === 0) return;
      const headers = [
        "ID (Slug)",
        "Deck Name",
        "Icon",
        "Cards Count",
        "Trending",
        "Available",
        "Words List",
      ];
      const rows = decksList.map((d) => [
        `"${d.id}"`,
        `"${(d.name || "").replace(/"/g, '""')}"`,
        `"${d.icon || ""}"`,
        d.words ? d.words.length : 0,
        d.isTrending ? "YES" : "NO",
        d.isAvailable ? "YES" : "NO",
        `"${(d.words || []).join("; ").replace(/"/g, '""')}"`,
      ]);
      downloadCSV(
        `guessup_decks_export_${new Date().toISOString().split("T")[0]}.csv`,
        headers,
        rows,
      );
    } else {
      const data =
        testersSubTab === "registrations" ? testersList : feedbackList;
      if (data.length === 0) return;
      let headers = [];
      let rows = [];

      if (testersSubTab === "registrations") {
        headers = ["ID", "Name", "Email", "Registered Date"];
        rows = data.map((item) => [
          `"${item.id || ""}"`,
          `"${(item.name || "").replace(/"/g, '""')}"`,
          `"${(item.email || "").replace(/"/g, '""')}"`,
          `"${item.submittedAt || ""}"`,
        ]);
      } else {
        headers = ["ID", "Email", "Feedback Note", "Submitted Date"];
        rows = data.map((item) => [
          `"${item.id || ""}"`,
          `"${(item.email || "").replace(/"/g, '""')}"`,
          `"${(item.feedbackText || "").replace(/"/g, '""')}"`,
          `"${item.submittedAt || ""}"`,
        ]);
      }
      downloadCSV(
        `guessup_${testersSubTab}_export_${new Date().toISOString().split("T")[0]}.csv`,
        headers,
        rows,
      );
    }
  };

  const downloadCSV = (filename, headers, rows) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export Handler
  const exportJSON = () => {
    let data = decksList;
    if (activeSection === "testers") {
      data = testersSubTab === "registrations" ? testersList : feedbackList;
    }
    if (data.length === 0) return;

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute(
      "download",
      `guessup_${activeSection}_export_${new Date().toISOString().split("T")[0]}.json`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentDeckWords = deckWordsInput
    .split(/[\n,]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  const filteredCurrentWords = currentDeckWords.filter((w) =>
    w.toLowerCase().includes(infoWordsSearch.toLowerCase()),
  );

  // Parsed list of new words for preview inside Add Words dialog
  const parsedNewWordsList = newWordsInput
    .split(/[\n,]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-8 text-text-dark">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-dark border-2 border-border-dark p-6 rounded-3xl shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">
                Admin Master Dashboard
              </h1>
              <span className="text-[0.65rem] font-extrabold uppercase px-2 py-0.5 rounded-full bg-success/20 text-success border border-success/30">
                Firestore Sync
              </span>
            </div>
            <p className="text-xs text-muted-dark mt-0.5">
              Manage Game Decks & Word Catalog, Beta Testers, and User Feedback.
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2.5 rounded-xl border border-border-dark bg-white/5 hover:bg-white/10 font-extrabold text-xs text-muted-dark hover:text-white transition-all flex items-center gap-2 cursor-pointer self-end sm:self-center"
        >
          <LogOut className="w-4 h-4" /> End Session
        </button>
      </div>

      {/* TWO MASTER SECTIONS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Section 1: Decks Management */}
        <div
          onClick={() => setActiveSection("decks")}
          className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4 ${
            activeSection === "decks"
              ? "bg-surface-dark border-primary shadow-xl ring-2 ring-primary/20"
              : "bg-surface-dark/50 border-border-dark opacity-75 hover:opacity-100"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase font-black tracking-wider text-primary flex items-center gap-2">
              <Layers className="w-4 h-4" /> Section 1: Deck Management
            </span>
            <span className="text-3xl font-black text-white">
              {decksList.length} Decks
            </span>
            <span className="text-xs text-muted-dark font-semibold">
              {decksList.reduce(
                (acc, curr) => acc + (curr.words ? curr.words.length : 0),
                0,
              )}{" "}
              word cards configured
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black">
            <Layers className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Section 2: Testers & Feedback */}
        <div
          onClick={() => setActiveSection("testers")}
          className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4 ${
            activeSection === "testers"
              ? "bg-surface-dark border-primary shadow-xl ring-2 ring-primary/20"
              : "bg-surface-dark/50 border-border-dark opacity-75 hover:opacity-100"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase font-black tracking-wider text-primary flex items-center gap-2">
              <Users className="w-4 h-4" /> Section 2: Testers & Feedback
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-white">
                {testersList.length} Testers
              </span>
              <span className="text-xs text-primary font-bold">
                ({feedbackList.length} notes)
              </span>
            </div>
            <span className="text-xs text-muted-dark font-semibold">
              Beta list signups & user feedback entries
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black">
            <Users className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Section Controls & Actions Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-dark border-2 border-border-dark p-4 rounded-2xl">
        {activeSection === "decks" ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30">
              <Layers className="w-4 h-4" /> Deck Catalog ({decksList.length})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-surface-card-dark p-1.5 rounded-xl border border-border-dark w-full md:w-auto">
            <button
              onClick={() => setTestersSubTab("registrations")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                testersSubTab === "registrations"
                  ? "bg-primary text-accent shadow-sm"
                  : "text-muted-dark hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Beta Testers List (
              {testersList.length})
            </button>

            <button
              onClick={() => setTestersSubTab("feedback")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                testersSubTab === "feedback"
                  ? "bg-primary text-accent shadow-sm"
                  : "text-muted-dark hover:text-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Feedback Notes (
              {feedbackList.length})
            </button>
          </div>
        )}

        {/* Search & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="relative w-full md:w-56">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-dark" />
            <input
              type="text"
              placeholder={`Search ${activeSection}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-card-dark border border-border-dark text-xs font-semibold placeholder:text-muted-dark outline-none focus:border-primary transition-all"
            />
          </div>

          {activeSection === "decks" && (
            <button
              onClick={openCreateDeckModal}
              className="px-4 py-2 rounded-xl bg-primary text-accent font-black text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create New Deck
            </button>
          )}

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={exportCSV}
              className="px-3.5 py-2 rounded-xl border border-border-dark bg-white/5 hover:bg-white/10 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Export as CSV"
            >
              <FileSpreadsheet className="w-4 h-4" /> CSV
            </button>
            <button
              onClick={exportJSON}
              className="px-3.5 py-2 rounded-xl border border-border-dark bg-white/5 hover:bg-white/10 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Export as JSON"
            >
              <FileJson className="w-4 h-4" /> JSON
            </button>
          </div>
        </div>
      </div>

      {/* --- SECTION 1: DECKS MANAGEMENT (CRUD & TOGGLES) --- */}
      {activeSection === "decks" && (
        <div className="flex flex-col gap-6">
          {loadingDecks ? (
            <div className="flex items-center justify-center p-12 text-muted-dark gap-3 text-sm bg-surface-dark border-2 border-border-dark rounded-3xl">
              <RefreshCw className="w-5 h-5 animate-spin text-primary" />{" "}
              Syncing Firestore decks catalog...
            </div>
          ) : filteredDecks.length === 0 ? (
            <div className="text-center p-12 text-muted-dark bg-surface-dark border-2 border-border-dark rounded-3xl">
              <p className="text-sm font-bold">No decks found in Firestore.</p>
              <button
                onClick={openCreateDeckModal}
                className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-accent font-black text-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create First Deck
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDecks.map((deck) => (
                <motion.div
                  key={deck.id}
                  whileHover={{ y: -4 }}
                  className="bg-surface-dark border-2 border-border-dark rounded-3xl p-6 flex flex-col justify-between gap-6 shadow-md relative overflow-hidden group"
                  style={{
                    borderColor: deck.color
                      ? `${deck.color}40`
                      : "var(--color-border-dark)",
                  }}
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl border-2 shadow-inner"
                        style={{
                          backgroundColor: deck.color
                            ? `${deck.color}20`
                            : "rgba(255,214,0,0.15)",
                          borderColor: deck.color || "var(--color-primary)",
                        }}
                      >
                        {deck.icon || "🎮"}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                          {deck.name}
                        </h3>
                        <span className="text-[0.7rem] font-mono text-muted-dark block">
                          id: {deck.id}
                        </span>
                      </div>
                    </div>

                    {deck.isTrending && (
                      <span
                        className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs"
                        title="Trending 🔥"
                      >
                        <Flame className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  {/* Description & Word Count */}
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-muted-dark leading-relaxed line-clamp-2">
                      {deck.description ||
                        "No description provided for this deck."}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-border-dark/60 text-xs font-bold">
                      <span className="text-primary flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />{" "}
                        {deck.words ? deck.words.length : 0} Word Cards
                      </span>
                      <button
                        onClick={() => openAddWordsModal(deck)}
                        className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Words
                      </button>
                    </div>
                  </div>

                  {/* QUICK INLINE VISIBILITY TOGGLE SWITCH */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-card-dark/60 border border-border-dark">
                    <div className="flex items-center gap-2">
                      {deck.isAvailable ? (
                        <Eye className="w-4 h-4 text-success" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-dark" />
                      )}
                      <span className="text-xs font-bold text-white">
                        {deck.isAvailable
                          ? "Visible to Players"
                          : "Hidden from Players"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInlineToggleAvailable(deck)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                        deck.isAvailable ? "bg-success" : "bg-white/20"
                      }`}
                      title={
                        deck.isAvailable
                          ? "Hide deck from players"
                          : "Show deck to players"
                      }
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          deck.isAvailable ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => openEditDeckModal(deck)}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-primary hover:text-accent font-black text-xs flex items-center justify-center gap-1.5 transition-all border border-border-dark cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> View Deck Info
                    </button>
                    <button
                      onClick={() => openAddWordsModal(deck)}
                      className="py-2.5 px-3.5 rounded-xl bg-primary/15 text-primary hover:bg-primary hover:text-accent font-black text-xs flex items-center justify-center gap-1 transition-all border border-primary/30 cursor-pointer"
                      title="Add New Words Dialog"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Words
                    </button>
                    <button
                      onClick={() => setDeleteConfirmDeck(deck)}
                      className="p-2.5 rounded-xl bg-error/15 text-error hover:bg-error hover:text-white transition-all border border-error/30 cursor-pointer"
                      title="Delete Deck"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- SECTION 2: TESTERS & FEEDBACK LISTS --- */}
      {activeSection === "testers" && (
        <div className="bg-surface-dark border-2 border-border-dark rounded-3xl overflow-hidden shadow-lg">
          {testersSubTab === "registrations" ? (
            loadingTesters ? (
              <div className="flex items-center justify-center p-12 text-muted-dark gap-3 text-sm">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />{" "}
                Loading beta testers...
              </div>
            ) : filteredTesters.length === 0 ? (
              <div className="text-center p-12 text-muted-dark">
                <p className="text-sm font-bold">
                  No beta testers registered yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-card-dark border-b border-border-dark uppercase font-black tracking-wider text-muted-dark">
                    <tr>
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Email Address</th>
                      <th className="py-4 px-6">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark">
                    {filteredTesters.map((item, index) => (
                      <tr
                        key={item.id || index}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-6 font-black text-white flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />{" "}
                          {item.name || "Anonymous"}
                        </td>
                        <td className="py-4 px-6 font-semibold text-primary">
                          <a
                            href={`mailto:${item.email}`}
                            className="hover:underline flex items-center gap-1.5"
                          >
                            <Mail className="w-3.5 h-3.5 text-muted-dark" />{" "}
                            {item.email}
                          </a>
                        </td>
                        <td className="py-4 px-6 text-muted-dark">
                          {item.submittedAt
                            ? new Date(item.submittedAt).toLocaleDateString()
                            : "Recent"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : loadingFeedback ? (
            <div className="flex items-center justify-center p-12 text-muted-dark gap-3 text-sm">
              <RefreshCw className="w-5 h-5 animate-spin text-primary" />{" "}
              Loading feedback notes...
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="text-center p-12 text-muted-dark">
              <p className="text-sm font-bold">No feedback entries found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-card-dark border-b border-border-dark uppercase font-black tracking-wider text-muted-dark">
                  <tr>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Feedback & Comments</th>
                    <th className="py-4 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark">
                  {filteredFeedback.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6 font-black text-primary shrink-0">
                        <a
                          href={`mailto:${item.email}`}
                          className="hover:underline flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5 text-muted-dark" />{" "}
                          {item.email}
                        </a>
                      </td>
                      <td className="py-4 px-6 font-medium text-text-dark leading-relaxed">
                        {item.feedbackText}
                      </td>
                      <td className="py-4 px-6 text-muted-dark shrink-0">
                        {item.submittedAt
                          ? new Date(item.submittedAt).toLocaleDateString()
                          : "Recent"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- DIALOG 1: DECK INFO DIALOG (METADATA + VIEW WORDS) --- */}
      <AnimatePresence>
        {isDeckModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-surface-dark border-2 border-border-dark p-6 sm:p-8 rounded-3xl shadow-2xl text-text-dark my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsDeckModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-dark hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title Header */}
              <div className="flex items-center gap-3 mb-6 border-b border-border-dark pb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-black text-xl">
                  {deckIcon || "🎮"}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">
                    {editingDeck
                      ? `Deck Info: ${editingDeck.name}`
                      : "Create New Category Deck"}
                  </h3>
                  <p className="text-xs text-muted-dark">
                    Configure deck metadata, dynamic slug, emoji picker, and
                    view existing words.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveDeck} className="flex flex-col gap-6">
                {/* Field 1: Deck Title (Dynamic Slug Generation) */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-extrabold uppercase text-muted-dark">
                      Deck Title / Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bollywood Blockbusters"
                      value={deckName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      className="w-full p-3.5 rounded-2xl bg-surface-card-dark border border-border-dark text-xs font-semibold outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[0.7rem] font-extrabold uppercase text-muted-dark">
                        Deck ID / Slug (Firestore Document ID) *
                      </label>
                      {!editingDeck && (
                        <button
                          type="button"
                          onClick={() => setAutoSlug(!autoSlug)}
                          className="text-[0.65rem] font-bold text-primary hover:underline cursor-pointer"
                        >
                          {autoSlug ? "⚡ Auto Slug ON" : "✏️ Manual Override"}
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. bollywood_blockbusters"
                      value={deckId}
                      onChange={(e) => {
                        setAutoSlug(false);
                        setDeckId(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_]/g, "_"),
                        );
                      }}
                      disabled={!!editingDeck}
                      required
                      className="w-full p-3.5 rounded-2xl bg-surface-card-dark border border-border-dark text-xs font-mono font-semibold outline-none focus:border-primary disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Field 2: Emoji Selection Palette */}
                <div className="flex flex-col gap-2">
                  <label className="text-[0.7rem] font-extrabold uppercase text-muted-dark flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-primary" /> Choose Emoji
                    Icon *
                  </label>

                  <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-surface-card-dark/60 border border-border-dark">
                    {EMOJI_PALETTE.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setDeckIcon(emoji)}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                          deckIcon === emoji
                            ? "bg-primary text-accent scale-110 shadow-md ring-2 ring-primary"
                            : "bg-white/5 hover:bg-white/10 text-white"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                    <div className="flex items-center gap-1.5">
                      <label
                        htmlFor="custom_emoji_field"
                        className="text-sm text-white"
                      >
                        Use custom emoji
                      </label>
                      <input
                        type="text"
                        id="custom_emoji_field"
                        placeholder="Custom..."
                        value={deckIcon}
                        onChange={(e) => setDeckIcon(e.target.value)}
                        className="w-24 p-2 rounded-xl bg-surface-card-dark border border-border-dark text-center text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Field 3: Colors & Sort Order */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[0.7rem] font-extrabold uppercase text-muted-dark tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />{" "}
                      Deck Theme & Gradient Colors
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomHex = getRandomUnusedColor(decksList);
                        setDeckColor(randomHex);
                        setDeckGradientEnd(getDarkerShade(randomHex));
                      }}
                      className="text-[0.7rem] font-black text-primary hover:underline flex items-center gap-1 cursor-pointer bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg border border-primary/30 transition-all"
                      title="Fetch a random vibrant color not used by existing decks"
                    >
                      <Wand2 className="w-3 h-3 text-primary" /> Auto-Randomize
                      Unused
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 items-end">
                    <ColorPicker
                      label="Primary Deck Color"
                      value={deckColor}
                      defaultValue="#FFD600"
                      onChange={(newHex) => {
                        setDeckColor(newHex);
                        setDeckGradientEnd(getDarkerShade(newHex));
                      }}
                    />

                    <ColorPicker
                      label="Gradient End Color"
                      value={deckGradientEnd}
                      defaultValue="#FF9100"
                      onChange={(newHex) => setDeckGradientEnd(newHex)}
                    />

                    <div className="flex flex-col gap-2 bg-surface-card-dark/60 p-3.5 rounded-2xl border border-border-dark justify-between h-full">
                      <label className="text-[0.7rem] font-extrabold uppercase text-muted-dark tracking-wider">
                        Sort Order Number
                      </label>
                      <input
                        type="number"
                        value={deckSortOrder}
                        onChange={(e) => setDeckSortOrder(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-surface-dark border border-border-dark text-xs font-semibold text-white outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Subtitle / Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] font-extrabold uppercase text-muted-dark">
                    Deck Subtitle / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Iconic movies, dialogues, & superstars"
                    value={deckDesc}
                    onChange={(e) => setDeckDesc(e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-card-dark border border-border-dark text-xs font-semibold outline-none focus:border-primary"
                  />
                </div>

                {/* TOGGLE SWITCHES (Visibility & Trending) */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Toggle Switch 1: Visibility */}
                  <div
                    onClick={() => setDeckIsAvailable(!deckIsAvailable)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-surface-card-dark border border-border-dark cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      {deckIsAvailable ? (
                        <Eye className="w-5 h-5 text-success" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-muted-dark" />
                      )}
                      <div>
                        <span className="text-xs font-black text-white block">
                          {deckIsAvailable
                            ? "Visible to Players"
                            : "Hidden from Players"}
                        </span>
                        <span className="text-[0.65rem] text-muted-dark">
                          {deckIsAvailable
                            ? "Active in mobile app deck carousel"
                            : "Hidden from game play screen"}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                        deckIsAvailable ? "bg-success" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          deckIsAvailable ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Toggle Switch 2: Trending */}
                  <div
                    onClick={() => setDeckIsTrending(!deckIsTrending)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-surface-card-dark border border-border-dark cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <Flame
                        className={`w-5 h-5 ${deckIsTrending ? "text-orange-400" : "text-muted-dark"}`}
                      />
                      <div>
                        <span className="text-xs font-black text-white block">
                          {deckIsTrending
                            ? "Marked as Trending 🔥"
                            : "Standard Deck"}
                        </span>
                        <span className="text-[0.65rem] text-muted-dark">
                          Displays 🔥 badge on deck card
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                        deckIsTrending ? "bg-orange-500" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          deckIsTrending ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* VIEW EXISTING WORD CARDS IN INFO DIALOG */}
                <div className="flex flex-col gap-3 pt-4 border-t border-border-dark">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
                      <Tag className="w-4 h-4" /> View Word Cards (
                      {currentDeckWords.length})
                    </label>

                    {editingDeck && (
                      <button
                        type="button"
                        onClick={() => openAddWordsModal(editingDeck)}
                        className="px-3.5 py-1.5 rounded-xl bg-primary text-accent font-extrabold text-xs flex items-center gap-1 hover:scale-105 transition-all cursor-pointer shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add New Words
                      </button>
                    )}
                  </div>

                  {/* Search inside Info Dialog words */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-dark" />
                    <input
                      type="text"
                      placeholder="Filter words inside deck..."
                      value={infoWordsSearch}
                      onChange={(e) => setInfoWordsSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-card-dark border border-border-dark text-xs font-semibold placeholder:text-muted-dark outline-none focus:border-primary"
                    />
                  </div>

                  {/* Existing Word Chips */}
                  <div className="max-h-40 overflow-y-auto p-3 rounded-2xl bg-surface-card-dark/40 border border-border-dark flex flex-wrap gap-2">
                    {filteredCurrentWords.map((word, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-white/5 border border-border-dark text-xs font-bold text-white flex items-center gap-2 group hover:border-error/50 transition-all"
                      >
                        <span>{word}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSingleWordFromInfo(word)}
                          className="text-muted-dark hover:text-error transition-colors cursor-pointer"
                          title="Remove word"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                    {filteredCurrentWords.length === 0 && (
                      <p className="text-xs text-muted-dark py-4 text-center w-full">
                        {infoWordsSearch
                          ? "No words matching search."
                          : "No word cards in this deck yet."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border-dark">
                  <button
                    type="button"
                    onClick={() => setIsDeckModalOpen(false)}
                    className="px-5 py-3 rounded-xl border border-border-dark text-muted-dark font-extrabold text-xs hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingDeck}
                    className="px-6 py-3 rounded-xl bg-primary text-accent font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {savingDeck
                      ? "Saving Deck..."
                      : editingDeck
                        ? "Save Deck Info"
                        : "Create Deck"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DIALOG 2: DEDICATED ADD NEW WORDS DIALOG (SINGLE COMBINED FIELD) --- */}
      <AnimatePresence>
        {isAddWordsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-surface-dark border-2 border-border-dark p-6 sm:p-8 rounded-3xl shadow-2xl text-text-dark my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsAddWordsModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-dark hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Dialog Header */}
              <div className="flex items-center gap-3 border-b border-border-dark pb-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-black text-xl">
                  {editingDeck?.icon || "🎮"}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">
                    Add New Words: {editingDeck?.name || "Deck"}
                  </h3>
                  <p className="text-xs text-muted-dark">
                    Enter a single word card or paste multiple comma-separated
                    words below.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSaveNewWordsOnly}
                className="flex flex-col gap-5"
              >
                {/* SINGLE COMBINED INPUT FIELD */}
                <div className="flex flex-col gap-2">
                  <label className="text-[0.7rem] font-extrabold uppercase text-muted-dark flex items-center justify-between">
                    <span>
                      Enter Word Card(s) — Single or Comma Separated *
                    </span>
                    {parsedNewWordsList.length > 0 && (
                      <span className="text-primary font-black text-xs lowercase">
                        {parsedNewWordsList.length} card(s) ready to append
                      </span>
                    )}
                  </label>

                  <textarea
                    rows={4}
                    placeholder="e.g. Sholay, Lagaan, 3 Idiots, Dangal, Pushpa"
                    value={newWordsInput}
                    onChange={(e) => setNewWordsInput(e.target.value)}
                    autoFocus
                    required
                    className="w-full p-4 rounded-2xl bg-surface-card-dark border border-border-dark text-xs font-semibold outline-none focus:border-primary transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Parsed Live Chips Preview */}
                {parsedNewWordsList.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[0.65rem] font-black uppercase text-muted-dark">
                      Cards Preview ({parsedNewWordsList.length}):
                    </span>
                    <div className="max-h-28 overflow-y-auto p-3 rounded-xl bg-surface-card-dark/60 border border-border-dark flex flex-wrap gap-1.5">
                      {parsedNewWordsList.map((word, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-primary/15 border border-primary/30 text-xs font-bold text-primary"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border-dark">
                  <button
                    type="button"
                    onClick={() => setIsAddWordsModalOpen(false)}
                    className="px-5 py-3 rounded-xl border border-border-dark text-muted-dark font-extrabold text-xs hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingNewWords || parsedNewWordsList.length === 0}
                    className="px-6 py-3 rounded-xl bg-primary text-accent font-black text-xs hover:scale-105 active:scale-98 transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />{" "}
                    {savingNewWords
                      ? "Appending Words..."
                      : `Save & Append ${parsedNewWordsList.length > 0 ? `${parsedNewWordsList.length} Word(s)` : "Words"}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 3: DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {deleteConfirmDeck && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface-dark border-2 border-border-dark p-6 sm:p-8 rounded-3xl max-w-md w-full flex flex-col gap-4 text-center shadow-2xl"
            >
              <div className="w-14 h-14 rounded-full bg-error/20 border-2 border-error text-error flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Delete Deck?</h3>
              <p className="text-xs text-muted-dark leading-relaxed">
                Are you sure you want to permanently delete deck{" "}
                <strong>"{deleteConfirmDeck.name}"</strong>? This will remove
                all{" "}
                {deleteConfirmDeck.words ? deleteConfirmDeck.words.length : 0}{" "}
                word cards from Firestore.
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setDeleteConfirmDeck(null)}
                  className="flex-1 py-3 rounded-xl border border-border-dark font-extrabold text-xs text-muted-dark hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDeck}
                  className="flex-1 py-3 rounded-xl bg-error text-white font-black text-xs hover:scale-105 transition-all shadow-md cursor-pointer"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
