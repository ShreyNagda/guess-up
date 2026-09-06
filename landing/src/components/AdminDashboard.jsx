import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  addDoc,
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
  X,
  Layers,
  Flame,
  Tag,
  Eye,
  EyeOff,
  Smile,
  Archive,
  AlertCircle,
  Smartphone,
  Loader2,
} from "lucide-react";
import { ColorPicker } from "./ColorPicker";
import { Switch } from "./Switch";
import { getRandomUnusedColor, getDarkerShade } from "../utils/colorUtils";
import { normalizeCategory } from "../utils/categoryModel";

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

export const AdminDashboard = () => {
  const { user, isAdminLoggedIn, login, logout } = useAdminAuth();
  const navigate = useNavigate();

  // Embedded Auth Form State
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  // 2 Master Sections: "decks" | "testers"
  const [activeSection, setActiveSection] = useState("decks");

  // Sub-tab for Testers section: "registrations" | "feedback"
  const [testersSubTab, setTestersSubTab] = useState("registrations");

  // Feedback filter state: category & status
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState("all");
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState("all"); // "all" | "active" | "archived"

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
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [isAddWordsModalOpen, setIsAddWordsModalOpen] = useState(false);
  const [isTesterModalOpen, setIsTesterModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [deleteConfirmDeck, setDeleteConfirmDeck] = useState(null);
  const [deleteConfirmTester, setDeleteConfirmTester] = useState(null);
  const [deleteConfirmFeedback, setDeleteConfirmFeedback] = useState(null);

  // Form Fields for Tester Modal
  const [testerName, setTesterName] = useState("");
  const [testerEmail, setTesterEmail] = useState("");
  const [testerDevice, setTesterDevice] = useState("iOS");
  const [testerRole, setTesterRole] = useState("Beta Tester");
  const [editingTester, setEditingTester] = useState(null);
  const [savingTester, setSavingTester] = useState(false);

  // Form Fields for Deck Info
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
  const [newWordsInput, setNewWordsInput] = useState("");
  const [savingDeck, setSavingDeck] = useState(false);
  const [savingNewWords, setSavingNewWords] = useState(false);

  // Handle Embedded Login
  const handleEmbeddedLogin = async (e) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword) {
      setAuthError("Please enter your admin email and password.");
      return;
    }
    setAuthError("");
    setAuthSubmitting(true);
    const res = await login(authEmail, authPassword);
    setAuthSubmitting(false);
    if (!res.success) {
      setAuthError(res.message);
    }
  };

  // Listen to 'categories' collection in Firestore
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    let unsub = () => {};
    try {
      unsub = onSnapshot(
        collection(db, "categories"),
        (snapshot) => {
          const list = [];
          snapshot.forEach((docSnap) => {
            list.push(normalizeCategory(docSnap.id, docSnap.data()));
          });
          list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setDecksList(list);
          setLoadingDecks(false);
        },
        (err) => {
          console.warn("Firestore categories fetch fallback:", err);
          setLoadingDecks(false);
        },
      );
    } catch {
      queueMicrotask(() => setLoadingDecks(false));
    }

    return () => unsub();
  }, [isAdminLoggedIn]);

  // Listen to 'testers' collection
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    let unsub = () => {};
    try {
      const q = query(collection(db, "testers"), orderBy("createdAt", "desc"));
      unsub = onSnapshot(
        q,
        (snapshot) => {
          const list = [];
          snapshot.forEach((docSnap) =>
            list.push({ id: docSnap.id, ...docSnap.data() }),
          );
          setTestersList(list);
          setLoadingTesters(false);
        },
        (err) => {
          console.warn("Firestore testers fetch error:", err);
          setLoadingTesters(false);
        },
      );
    } catch {
      queueMicrotask(() => setLoadingTesters(false));
    }

    return () => unsub();
  }, [isAdminLoggedIn]);

  // Listen to 'feedback' collection
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    let unsub = () => {};
    try {
      const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
      unsub = onSnapshot(
        q,
        (snapshot) => {
          const list = [];
          snapshot.forEach((docSnap) =>
            list.push({ id: docSnap.id, ...docSnap.data() }),
          );
          setFeedbackList(list);
          setLoadingFeedback(false);
        },
        (err) => {
          console.warn("Firestore feedback fetch error:", err);
          setLoadingFeedback(false);
        },
      );
    } catch {
      queueMicrotask(() => setLoadingFeedback(false));
    }

    return () => unsub();
  }, [isAdminLoggedIn]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // RENDER LOGIN SCREEN IF NOT AUTHENTICATED
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-surface border-2 border-border p-8 rounded-3xl shadow-2xl text-text flex flex-col items-center gap-6"
        >
          <div className="w-16 h-16 rounded-3xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
              Admin Portal Access
            </h2>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              Sign in with your Firebase Administrator credentials to manage
              beta testers, user feedback, and game decks.
            </p>
          </div>

          <form
            onSubmit={handleEmbeddedLogin}
            className="w-full flex flex-col gap-4 text-left"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.7rem] font-black uppercase text-muted">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  placeholder="admin@guessup.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-surface-card border text-xs font-semibold outline-none focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.7rem] font-black uppercase text-muted">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-surface-card border text-xs font-semibold outline-none focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-error/15 border border-error/40 text-error text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 py-3 rounded-2xl border border-border text-muted font-extrabold text-xs hover:bg-surface-card transition-all cursor-pointer"
              >
                Return Home
              </button>
              <button
                type="submit"
                disabled={authSubmitting}
                className="flex-1 py-3 rounded-2xl bg-primary text-accent font-black text-xs hover:scale-102 active:scale-98 transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>
        </motion.div>
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
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error toggling deck visibility:", err);
    }
  };

  // --- TESTERS MANAGEMENT ACTIONS ---
  const openCreateTesterModal = () => {
    setEditingTester(null);
    setTesterName("");
    setTesterEmail("");
    setTesterDevice("iOS");
    setTesterRole("Beta Tester");
    setIsTesterModalOpen(true);
  };

  const openEditTesterModal = (tester) => {
    setEditingTester(tester);
    setTesterName(tester.name || "");
    setTesterEmail(tester.email || "");
    setTesterDevice(tester.deviceType || tester.device || "iOS");
    setTesterRole(tester.role || "Beta Tester");
    setIsTesterModalOpen(true);
  };

  const handleSaveTester = async (e) => {
    e.preventDefault();
    if (!testerName.trim() || !testerEmail.trim()) return;

    setSavingTester(true);
    const payload = {
      name: testerName.trim(),
      email: testerEmail.trim().toLowerCase(),
      deviceType: testerDevice,
      role: testerRole,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingTester) {
        await updateDoc(doc(db, "testers", editingTester.id), payload);
      } else {
        payload.createdAt = serverTimestamp();
        payload.submittedAt = new Date().toISOString();
        await addDoc(collection(db, "testers"), payload);
      }
      setIsTesterModalOpen(false);
    } catch (err) {
      console.error("Error saving tester:", err);
      alert("Failed to save tester: " + err.message);
    } finally {
      setSavingTester(false);
    }
  };

  const handleDeleteTester = async () => {
    if (!deleteConfirmTester) return;
    try {
      await deleteDoc(doc(db, "testers", deleteConfirmTester.id));
      setDeleteConfirmTester(null);
    } catch (err) {
      console.error("Error deleting tester:", err);
      alert("Failed to delete tester: " + err.message);
    }
  };

  // --- FEEDBACK MANAGEMENT ACTIONS ---
  const handleToggleArchiveFeedback = async (item) => {
    try {
      await updateDoc(doc(db, "feedback", item.id), {
        archived: !item.archived,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error archiving feedback:", err);
    }
  };

  const handleDeleteFeedback = async () => {
    if (!deleteConfirmFeedback) return;
    try {
      await deleteDoc(doc(db, "feedback", deleteConfirmFeedback.id));
      setDeleteConfirmFeedback(null);
    } catch (err) {
      console.error("Error deleting feedback:", err);
      alert("Failed to delete feedback: " + err.message);
    }
  };

  // --- DECK CRUD ACTIONS ---
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

  // Filtered Decks
  const filteredDecks = decksList.filter((deck) => {
    const q = searchQuery.toLowerCase();
    return (
      (deck.name || "").toLowerCase().includes(q) ||
      (deck.id || "").toLowerCase().includes(q) ||
      (deck.description || "").toLowerCase().includes(q)
    );
  });

  // Filtered Testers
  const filteredTesters = testersList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.name || "").toLowerCase().includes(q) ||
      (item.email || "").toLowerCase().includes(q) ||
      (item.role || "").toLowerCase().includes(q)
    );
  });

  // Filtered Feedback
  const filteredFeedback = feedbackList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (item.name || "").toLowerCase().includes(q) ||
      (item.email || "").toLowerCase().includes(q) ||
      (item.feedbackText || "").toLowerCase().includes(q);

    const category = (item.feedbackType || item.category || "").toLowerCase();
    const matchesCategory =
      feedbackCategoryFilter === "all" ||
      category.includes(feedbackCategoryFilter);

    const matchesStatus =
      feedbackStatusFilter === "all" ||
      (feedbackStatusFilter === "archived" && item.archived === true) ||
      (feedbackStatusFilter === "active" && !item.archived);

    return matchesSearch && matchesCategory && matchesStatus;
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
        headers = ["Email"];
        rows = data
          .map((item) => (item.email || "").trim())
          .filter(Boolean)
          .map((email) => [`"${email.replace(/"/g, '""')}"`]);
      } else {
        headers = ["Email"];
        rows = data
          .map((item) => (item.email || "").trim())
          .filter(Boolean)
          .map((email) => [`"${email.replace(/"/g, '""')}"`]);
      }
      downloadCSV(
        `guessup_${testersSubTab}_emails_${new Date().toISOString().split("T")[0]}.csv`,
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

  const parsedNewWordsList = newWordsInput
    .split(/[\n,]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-8 text-text">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface border-2 border-border p-6 rounded-3xl shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-xs text-muted">
              {user?.email || "Admin Session"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-3.5 py-2 rounded-xl border border-border bg-surface-card hover:bg-black/5 dark:hover:bg-white/5 font-extrabold text-xs text-muted hover:text-text transition-all flex items-center gap-2 cursor-pointer self-end sm:self-center"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* TWO MASTER SECTIONS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Section 1: Decks Management */}
        <div
          onClick={() => setActiveSection("decks")}
          className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4 ${
            activeSection === "decks"
              ? "bg-surface border-primary shadow-lg ring-2 ring-primary/20"
              : "bg-surface/50 border-border opacity-80 hover:opacity-100"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="text-[0.7rem] uppercase font-black tracking-wider text-primary flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Decks Catalog
            </span>
            <span className="text-2xl sm:text-3xl font-black text-text">
              {decksList.length} Decks
            </span>
            <span className="text-xs text-muted font-bold">
              {decksList.reduce(
                (acc, curr) => acc + (curr.words ? curr.words.length : 0),
                0,
              )}{" "}
              Total Words
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black shrink-0">
            <Layers className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Section 2: Testers & Feedback */}
        <div
          onClick={() => setActiveSection("testers")}
          className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4 ${
            activeSection === "testers"
              ? "bg-surface border-primary shadow-lg ring-2 ring-primary/20"
              : "bg-surface/50 border-border opacity-80 hover:opacity-100"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="text-[0.7rem] uppercase font-black tracking-wider text-primary flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Testers & Notes
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-text">
                {testersList.length} Testers
              </span>
            </div>
            <span className="text-xs text-muted font-bold">
              {feedbackList.length} Feedback Notes
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black shrink-0">
            <Users className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Section Controls & Actions Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface border-2 border-border p-4 rounded-2xl">
        {activeSection === "decks" ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30">
              <Layers className="w-4 h-4" /> Decks ({decksList.length})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-surface-card p-1 rounded-xl border border-border w-full md:w-auto">
            <button
              onClick={() => setTestersSubTab("registrations")}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                testersSubTab === "registrations"
                  ? "bg-primary text-accent shadow-xs"
                  : "text-muted hover:text-text"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Testers ({testersList.length})
            </button>
            <button
              onClick={() => setTestersSubTab("feedback")}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                testersSubTab === "feedback"
                  ? "bg-primary text-accent shadow-xs"
                  : "text-muted hover:text-text"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Feedback (
              {feedbackList.length})
            </button>
          </div>
        )}

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <div className="relative w-full md:w-52">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-card border text-xs font-semibold outline-none focus:border-primary transition-all"
            />
          </div>

          {activeSection === "decks" && (
            <button
              onClick={openCreateDeckModal}
              className="px-3.5 py-2 rounded-xl bg-primary text-accent font-black text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />{" "}
              <span className="hidden sm:inline">Create</span> Deck
            </button>
          )}

          {activeSection === "testers" && testersSubTab === "registrations" && (
            <button
              onClick={openCreateTesterModal}
              className="px-3.5 py-2 rounded-xl bg-primary text-accent font-black text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />{" "}
              <span className="hidden sm:inline">Add</span> Tester
            </button>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={exportCSV}
              className="px-3 py-2 rounded-xl border border-border bg-surface-card hover:bg-black/5 dark:hover:bg-white/5 font-extrabold text-xs text-muted hover:text-text flex items-center gap-1 transition-all cursor-pointer"
              title="Export CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={exportJSON}
              className="px-3 py-2 rounded-xl border border-border bg-surface-card hover:bg-black/5 dark:hover:bg-white/5 font-extrabold text-xs text-muted hover:text-text flex items-center gap-1 transition-all cursor-pointer"
              title="Export JSON"
            >
              <FileJson className="w-3.5 h-3.5" /> JSON
            </button>
          </div>
        </div>
      </div>

      {/* --- SECTION 1: DECKS MANAGEMENT --- */}
      {activeSection === "decks" && (
        <div className="flex flex-col gap-6">
          {loadingDecks ? (
            <div className="flex items-center justify-center p-12 text-muted gap-3 text-sm bg-surface border-2 border-border rounded-3xl">
              <RefreshCw className="w-5 h-5 animate-spin text-primary" />{" "}
              Loading decks...
            </div>
          ) : filteredDecks.length === 0 ? (
            <div className="text-center p-12 text-muted bg-surface border-2 border-border rounded-3xl">
              <p className="text-sm font-bold">No decks found.</p>
              <button
                onClick={openCreateDeckModal}
                className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-accent font-black text-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create Deck
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredDecks.map((deck) => (
                <motion.div
                  key={deck.id}
                  whileHover={{ y: -3 }}
                  className="bg-surface border-2 border-border rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between gap-5 shadow-sm relative overflow-hidden group"
                  style={{
                    borderColor: deck.color
                      ? `${deck.color}40`
                      : "var(--color-border)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xl border-2 shadow-inner shrink-0"
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
                        <h3 className="font-extrabold text-base text-text flex items-center gap-2">
                          {deck.name}
                        </h3>
                        <span className="text-[0.65rem] font-mono text-muted block">
                          id: {deck.id}
                        </span>
                      </div>
                    </div>

                    {deck.isTrending && (
                      <span
                        className="p-1 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs"
                        title="Trending"
                      >
                        <Flame className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {deck.description && (
                      <p className="text-xs text-muted leading-relaxed line-clamp-2">
                        {deck.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs font-bold">
                      <span className="text-primary flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />{" "}
                        {deck.words ? deck.words.length : 0} Words
                      </span>
                      <button
                        onClick={() => openAddWordsModal(deck)}
                        className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Words
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-card border border-border/80">
                    <div className="flex items-center gap-2">
                      {deck.isAvailable ? (
                        <Eye className="w-4 h-4 text-success" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted" />
                      )}
                      <span className="text-xs font-bold text-text">
                        {deck.isAvailable ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <Switch
                      checked={deck.isAvailable}
                      onChange={() => handleInlineToggleAvailable(deck)}
                      ariaLabel={deck.isAvailable ? "Hide deck" : "Show deck"}
                      size="sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      onClick={() => openEditDeckModal(deck)}
                      className="flex-1 py-2.5 rounded-xl bg-surface-card hover:bg-primary hover:text-accent font-black text-xs flex items-center justify-center gap-1.5 transition-all border border-border cursor-pointer text-text"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Deck
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
        <div className="flex flex-col gap-6">
          {testersSubTab === "registrations" ? (
            loadingTesters ? (
              <div className="flex items-center justify-center p-12 text-muted gap-3 text-sm bg-surface border-2 border-border rounded-3xl">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />{" "}
                Loading beta testers...
              </div>
            ) : filteredTesters.length === 0 ? (
              <div className="text-center p-12 text-muted bg-surface border-2 border-border rounded-3xl">
                <p className="text-sm font-bold">
                  No beta testers registered yet.
                </p>
                <button
                  onClick={openCreateTesterModal}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-accent font-black text-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add First Beta Tester
                </button>
              </div>
            ) : (
              <div className="bg-surface border-2 border-border rounded-3xl overflow-hidden shadow-lg">
                {/* Mobile Stacked Card View (<md) */}
                <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                  {filteredTesters.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="p-4 rounded-2xl bg-surface-card border border-border flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-text text-sm flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />{" "}
                          {item.name || "Anonymous"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[0.65rem] font-bold uppercase tracking-wider">
                          {item.role || "Beta Tester"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 text-xs">
                        <a
                          href={`mailto:${item.email}`}
                          className="text-primary font-semibold hover:underline flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5 text-muted" />{" "}
                          {item.email}
                        </a>
                        <div className="flex items-center justify-between text-muted pt-1">
                          <span className="flex items-center gap-1">
                            <Smartphone className="w-3.5 h-3.5" />{" "}
                            {item.deviceType || item.device || "iOS"}
                          </span>
                          <span>
                            {item.submittedAt
                              ? new Date(item.submittedAt).toLocaleDateString()
                              : "Recent"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                        <button
                          onClick={() => openEditTesterModal(item)}
                          className="px-3 py-1.5 rounded-xl bg-surface hover:bg-primary hover:text-accent text-text transition-all border border-border font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmTester(item)}
                          className="px-3 py-1.5 rounded-xl bg-error/15 text-error hover:bg-error hover:text-white transition-all border border-error/30 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Horizontal Scroll Table (md+) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-card border-b border-border uppercase font-black tracking-wider text-muted">
                      <tr>
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-6">Email Address</th>
                        <th className="py-4 px-6">Role / Badge</th>
                        <th className="py-4 px-6">Device</th>
                        <th className="py-4 px-6">Joined Date</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredTesters.map((item, index) => (
                        <tr
                          key={item.id || index}
                          className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 px-6 font-black text-text flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />{" "}
                            {item.name || "Anonymous"}
                          </td>
                          <td className="py-4 px-6 font-semibold text-primary">
                            <a
                              href={`mailto:${item.email}`}
                              className="hover:underline flex items-center gap-1.5"
                            >
                              <Mail className="w-3.5 h-3.5 text-muted" />{" "}
                              {item.email}
                            </a>
                          </td>
                          <td className="py-4 px-6 font-bold">
                            <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-[0.65rem] uppercase tracking-wider">
                              {item.role || "Beta Tester"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-muted font-medium flex items-center gap-1">
                            <Smartphone className="w-3.5 h-3.5 text-muted" />{" "}
                            {item.deviceType || item.device || "iOS"}
                          </td>
                          <td className="py-4 px-6 text-muted">
                            {item.submittedAt
                              ? new Date(item.submittedAt).toLocaleDateString()
                              : "Recent"}
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={() => openEditTesterModal(item)}
                              className="p-2 rounded-xl bg-surface-card hover:bg-primary hover:text-accent text-text transition-all border border-border cursor-pointer inline-flex"
                              title="Edit Tester"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmTester(item)}
                              className="p-2 rounded-xl bg-error/15 text-error hover:bg-error hover:text-white transition-all border border-error/30 cursor-pointer inline-flex"
                              title="Delete Tester"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            /* FEEDBACK SUB-TAB */
            <div className="flex flex-col gap-4">
              {/* Feedback Filters */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border-2 border-border p-4 rounded-2xl">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs font-black uppercase text-muted mr-2">
                    Category:
                  </span>
                  {["all", "bug", "feature", "deck", "general"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFeedbackCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs capitalize transition-all cursor-pointer ${
                        feedbackCategoryFilter === cat
                          ? "bg-primary text-accent shadow-sm"
                          : "bg-surface-card text-muted hover:text-text border border-border"
                      }`}
                    >
                      {cat === "bug"
                        ? "Bug Reports"
                        : cat === "feature"
                          ? "Feature Requests"
                          : cat === "deck"
                            ? "Deck Ideas"
                            : cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-muted mr-2">
                    Status:
                  </span>
                  {["all", "active", "archived"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFeedbackStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs capitalize transition-all cursor-pointer ${
                        feedbackStatusFilter === st
                          ? "bg-primary text-accent shadow-sm"
                          : "bg-surface-card text-muted hover:text-text border border-border"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {loadingFeedback ? (
                <div className="flex items-center justify-center p-12 text-muted gap-3 text-sm bg-surface border-2 border-border rounded-3xl">
                  <RefreshCw className="w-5 h-5 animate-spin text-primary" />{" "}
                  Loading feedback notes...
                </div>
              ) : filteredFeedback.length === 0 ? (
                <div className="text-center p-12 text-muted bg-surface border-2 border-border rounded-3xl">
                  <p className="text-sm font-bold">
                    No feedback entries match criteria.
                  </p>
                </div>
              ) : (
                <div className="bg-surface border-2 border-border rounded-3xl overflow-hidden shadow-lg">
                  {/* Mobile Stacked Card View (<md) */}
                  <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                    {filteredFeedback.map((item, index) => (
                      <div
                        key={item.id || index}
                        className={`p-4 rounded-2xl bg-surface-card border border-border flex flex-col gap-3 ${item.archived ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-text text-sm">
                            {item.name || "Anonymous"}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-surface text-muted border border-border font-bold text-[0.65rem] uppercase">
                            {item.feedbackType || item.category || "General"}
                          </span>
                        </div>

                        <a
                          href={`mailto:${item.email}`}
                          className="text-primary font-semibold text-xs hover:underline flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3 text-muted" /> {item.email}
                        </a>

                        <p className="text-xs font-medium text-text leading-relaxed bg-surface/50 p-3 rounded-xl border border-border">
                          {item.feedbackText}
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[0.65rem] text-muted">
                            Device: {item.deviceType || "Web"}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleArchiveFeedback(item)}
                              className={`p-2 rounded-xl border transition-all cursor-pointer inline-flex ${
                                item.archived
                                  ? "bg-primary/15 text-primary border-primary/30 hover:bg-primary hover:text-accent"
                                  : "bg-surface text-muted border-border hover:text-text"
                              }`}
                              title={item.archived ? "Unarchive" : "Archive"}
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmFeedback(item)}
                              className="p-2 rounded-xl bg-error/15 text-error hover:bg-error hover:text-white transition-all border border-error/30 cursor-pointer inline-flex"
                              title="Delete Feedback"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Horizontal Scroll Table (md+) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-card border-b border-border uppercase font-black tracking-wider text-muted">
                        <tr>
                          <th className="py-4 px-6">Submitter</th>
                          <th className="py-4 px-6">Type & Device</th>
                          <th className="py-4 px-6">Feedback Note</th>
                          <th className="py-4 px-6">Status</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredFeedback.map((item, index) => (
                          <tr
                            key={item.id || index}
                            className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${item.archived ? "opacity-60" : ""}`}
                          >
                            <td className="py-4 px-6 shrink-0">
                              <div className="font-black text-text">
                                {item.name || "Anonymous"}
                              </div>
                              <a
                                href={`mailto:${item.email}`}
                                className="text-primary font-semibold hover:underline flex items-center gap-1"
                              >
                                <Mail className="w-3 h-3 text-muted" />{" "}
                                {item.email}
                              </a>
                            </td>
                            <td className="py-4 px-6 shrink-0">
                              <span className="px-2.5 py-1 rounded-full bg-surface-card text-muted border border-border font-bold text-[0.65rem] uppercase block w-max">
                                {item.feedbackType ||
                                  item.category ||
                                  "General"}
                              </span>
                              <span className="text-[0.65rem] text-muted mt-1 block">
                                Device: {item.deviceType || "Web"}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-medium text-text leading-relaxed max-w-md">
                              {item.feedbackText}
                            </td>
                            <td className="py-4 px-6 shrink-0">
                              {item.archived ? (
                                <span className="px-2.5 py-1 rounded-full bg-text/10 text-muted border border-border text-[0.65rem] uppercase font-bold">
                                  Archived
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-success/20 text-success border border-success/30 text-[0.65rem] uppercase font-bold">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right shrink-0 space-x-2">
                              <button
                                onClick={() =>
                                  handleToggleArchiveFeedback(item)
                                }
                                className={`p-2 rounded-xl border transition-all cursor-pointer inline-flex ${
                                  item.archived
                                    ? "bg-primary/15 text-primary border-primary/30 hover:bg-primary hover:text-accent"
                                    : "bg-surface-card text-muted border-border hover:text-text"
                                }`}
                                title={item.archived ? "Unarchive" : "Archive"}
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmFeedback(item)}
                                className="p-2 rounded-xl bg-error/15 text-error hover:bg-error hover:text-white transition-all border border-error/30 cursor-pointer inline-flex"
                                title="Delete Feedback"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- DIALOG 1: ADD/EDIT TESTER MODAL --- */}
      <AnimatePresence>
        {isTesterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-surface border-2 border-border p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl text-text"
            >
              <button
                onClick={() => setIsTesterModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-surface-card hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-text transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5 border-b border-border pb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-black">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-text">
                    {editingTester ? "Edit Tester" : "Add Tester"}
                  </h3>
                </div>
              </div>

              <form
                onSubmit={handleSaveTester}
                className="flex flex-col gap-3.5"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-[0.7rem] font-extrabold uppercase text-muted">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={testerName}
                    onChange={(e) => setTesterName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-surface-card border text-xs font-semibold outline-none focus:border-primary transition-all text-text"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[0.7rem] font-extrabold uppercase text-muted">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={testerEmail}
                    onChange={(e) => setTesterEmail(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-surface-card border text-xs font-semibold outline-none focus:border-primary transition-all text-text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.7rem] font-extrabold uppercase text-muted">
                      Device
                    </label>
                    <select
                      value={testerDevice}
                      onChange={(e) => setTesterDevice(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-surface-card border text-xs font-semibold outline-none focus:border-primary transition-all text-text"
                    >
                      <option value="Android">Android</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[0.7rem] font-extrabold uppercase text-muted">
                      Role
                    </label>
                    <select
                      value={testerRole}
                      onChange={(e) => setTesterRole(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-surface-card border text-xs font-semibold outline-none focus:border-primary transition-all text-text"
                    >
                      <option value="Beta Tester">Beta Tester</option>
                      <option value="Alpha Crew">Alpha Crew</option>
                      <option value="Top Contributor">Top Contributor</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setIsTesterModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border text-muted font-extrabold text-xs hover:bg-surface-card transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingTester}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-accent font-black text-xs hover:scale-102 active:scale-98 transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingTester ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DIALOG 2: DECK INFO DIALOG --- */}
      <AnimatePresence>
        {isDeckModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-surface border-2 border-border p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-2xl text-text my-6 max-h-[88vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsDeckModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-surface-card hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-text transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5 border-b border-border pb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-black text-lg">
                  {deckIcon || "🎮"}
                </div>
                <div>
                  <h3 className="text-lg font-black text-text">
                    {editingDeck ? editingDeck.name : "New Deck"}
                  </h3>
                </div>
              </div>

              <form onSubmit={handleSaveDeck} className="flex flex-col gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.7rem] font-extrabold uppercase text-muted">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bollywood"
                      value={deckName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl bg-surface-card border text-xs font-semibold outline-none focus:border-primary transition-all text-text"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[0.7rem] font-extrabold uppercase text-muted">
                        Slug
                      </label>
                      {!editingDeck && (
                        <button
                          type="button"
                          onClick={() => setAutoSlug(!autoSlug)}
                          className="text-[0.65rem] font-bold text-primary hover:underline cursor-pointer"
                        >
                          {autoSlug ? "Auto" : "Manual"}
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="slug_id"
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
                      className="w-full p-2.5 rounded-xl bg-surface-card border text-xs font-mono font-semibold outline-none focus:border-primary disabled:opacity-50 transition-all text-text"
                    />
                  </div>
                </div>

                {/* Emoji Selection Palette */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] font-extrabold uppercase text-muted flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5 text-primary" /> Emoji
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-surface-card border border-border">
                    {EMOJI_PALETTE.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setDeckIcon(emoji)}
                        className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all cursor-pointer ${
                          deckIcon === emoji
                            ? "bg-primary scale-110 shadow-xs"
                            : "hover:bg-black/5 dark:hover:bg-white/10"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[0.7rem] font-extrabold uppercase text-muted">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short description..."
                    value={deckDesc}
                    onChange={(e) => setDeckDesc(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface-card border text-xs font-semibold outline-none focus:border-primary transition-all resize-none text-text"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <ColorPicker
                    label="Primary Color"
                    color={deckColor}
                    onChange={setDeckColor}
                  />
                  <ColorPicker
                    label="Gradient End"
                    color={deckGradientEnd}
                    onChange={setDeckGradientEnd}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-card border border-border">
                  <span className="text-xs font-bold text-text">
                    Active Status
                  </span>
                  <Switch
                    checked={deckIsAvailable}
                    onChange={setDeckIsAvailable}
                    ariaLabel="Deck Visibility"
                  />
                </div>

                {/* Words Editor */}
                <div className="flex flex-col gap-1.5 border-t border-border pt-3">
                  <label className="text-[0.7rem] font-extrabold uppercase text-muted">
                    Words ({currentDeckWords.length})
                  </label>

                  <textarea
                    rows={4}
                    placeholder="Words separated by commas..."
                    value={deckWordsInput}
                    onChange={(e) => setDeckWordsInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface-card border text-xs font-semibold outline-none focus:border-primary transition-all text-text"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDeckModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border text-muted font-extrabold text-xs hover:bg-surface-card transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingDeck}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-accent font-black text-xs hover:scale-102 active:scale-98 transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingDeck ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DIALOG 3: ADD WORDS ONLY DIALOG --- */}
      <AnimatePresence>
        {isAddWordsModalOpen && editingDeck && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-surface border-2 border-border p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl text-text"
            >
              <button
                onClick={() => setIsAddWordsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-surface-card hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-text transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5 border-b border-border pb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-black text-lg">
                  {editingDeck.icon || "🎮"}
                </div>
                <div>
                  <h3 className="text-lg font-black text-text">
                    Add Words: {editingDeck.name}
                  </h3>
                </div>
              </div>

              <form
                onSubmit={handleSaveNewWordsOnly}
                className="flex flex-col gap-3.5"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-[0.7rem] font-extrabold uppercase text-muted">
                    New Words
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter words separated by commas or newlines..."
                    value={newWordsInput}
                    onChange={(e) => setNewWordsInput(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-surface-card border text-xs font-semibold outline-none focus:border-primary transition-all text-text"
                  />
                </div>

                {parsedNewWordsList.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-surface-card border border-border flex flex-col gap-1">
                    <span className="text-[0.65rem] font-bold uppercase text-primary">
                      Preview ({parsedNewWordsList.length} words):
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {parsedNewWordsList.map((w, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-text/10 text-text text-[0.65rem] font-mono"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddWordsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border text-muted font-extrabold text-xs hover:bg-surface-card transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingNewWords}
                    className="flex-1 py-3 rounded-2xl bg-primary text-accent font-black text-xs hover:scale-102 active:scale-98 transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingNewWords ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Append Words"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRMATION MODAL DELETE DECK --- */}
      <AnimatePresence>
        {deleteConfirmDeck && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-surface border-2 border-border p-6 rounded-3xl shadow-2xl text-text flex flex-col items-center text-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-error/15 text-error border border-error/30 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-text">
                Delete "{deleteConfirmDeck.name}"?
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                This action will permanently delete this category deck and all
                associated word cards from Firestore.
              </p>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setDeleteConfirmDeck(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-extrabold text-xs text-muted hover:bg-surface-card cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDeck}
                  className="flex-1 py-2.5 rounded-xl bg-error text-white font-black text-xs hover:bg-error/90 cursor-pointer shadow-md"
                >
                  Delete Deck
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRMATION MODAL DELETE TESTER --- */}
      <AnimatePresence>
        {deleteConfirmTester && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-surface border-2 border-border p-6 rounded-3xl shadow-2xl text-text flex flex-col items-center text-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-error/15 text-error border border-error/30 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-text">
                Remove Tester "{deleteConfirmTester.name}"?
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                This action will permanently remove this tester from the beta
                list in Firestore.
              </p>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setDeleteConfirmTester(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-extrabold text-xs text-muted hover:bg-surface-card cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTester}
                  className="flex-1 py-2.5 rounded-xl bg-error text-white font-black text-xs hover:bg-error/90 cursor-pointer shadow-md"
                >
                  Remove Tester
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRMATION MODAL DELETE FEEDBACK --- */}
      <AnimatePresence>
        {deleteConfirmFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-surface border-2 border-border p-6 rounded-3xl shadow-2xl text-text flex flex-col items-center text-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-error/15 text-error border border-error/30 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-text">
                Delete Feedback Note?
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                This action will permanently delete this feedback entry from
                Firestore.
              </p>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setDeleteConfirmFeedback(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-extrabold text-xs text-muted hover:bg-surface-card cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteFeedback}
                  className="flex-1 py-2.5 rounded-xl bg-error text-white font-black text-xs hover:bg-error/90 cursor-pointer shadow-md"
                >
                  Delete Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
