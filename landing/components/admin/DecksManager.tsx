"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  Search,
  RefreshCw,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  Deck,
  getDecksFromFirestore,
  createDeckInFirestore,
  updateDeckInFirestore,
  deleteDeckFromFirestore,
  cleanAndSanitizeFirestoreDecks,
} from "../../lib/firestore";

const EMOJI_OPTIONS = [
  "🎬",
  "🏏",
  "🍔",
  "😎",
  "🎵",
  "🏆",
  "📺",
  "💃",
  "⚡",
  "🚀",
  "🎉",
  "🔥",
  "🧠",
  "🎯",
];

const PRESET_GRADIENTS = [
  ["#FFD600", "#BE4141"],
  ["#00F2FE", "#4FACFE"],
  ["#FF0844", "#FFB199"],
  ["#F12711", "#F5AF19"],
  ["#B224EF", "#7579FF"],
  ["#11998E", "#38EF7D"],
  ["#8E2DE2", "#4A00E0"],
  ["#F857A6", "#FF5858"],
];

export function DecksManager() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [sanitizing, setSanitizing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  // Form states matching screenshot fields
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎬");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isTrending, setIsTrending] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [gradientStart, setGradientStart] = useState("#FFD600");
  const [gradientEnd, setGradientEnd] = useState("#BE4141");
  const [wordsInput, setWordsInput] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchDecks = async () => {
    setLoading(true);
    const data = await getDecksFromFirestore();
    setDecks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const handleSanitize = async () => {
    if (
      !confirm(
        "This will sanitize all Firestore deck documents by overwriting them with clean 9-field documents (name, description, icon, isAvailable, isTrending, sortOrder, words, wordsCount, updatedAt) and purging all redundant fields. Proceed?",
      )
    ) {
      return;
    }
    setSanitizing(true);
    try {
      const res = await cleanAndSanitizeFirestoreDecks();
      if (res.success) {
        alert(
          `Successfully cleaned ${res.count} Firestore documents! All redundant fields were purged.`,
        );
        fetchDecks();
      } else {
        alert(
          "Failed to sanitize Firestore documents. Check console or security rules.",
        );
      }
    } catch (e: any) {
      alert("Error sanitizing Firestore documents: " + e.message);
    } finally {
      setSanitizing(false);
    }
  };

  const openCreateModal = () => {
    setEditingDeck(null);
    setName("");
    setIcon("🎬");
    setDescription("");
    setIsAvailable(true);
    setIsTrending(false);
    setSortOrder(0);
    setGradientStart("#FFD600");
    setGradientEnd("#BE4141");
    setWordsInput("");
    setIsModalOpen(true);
  };

  const openEditModal = (deck: Deck) => {
    setEditingDeck(deck);
    const deckName = deck.name || deck.title || "";
    const deckWords =
      (deck.words && deck.words.length > 0 ? deck.words : deck.cards) || [];
    setName(deckName);
    setIcon(deck.icon || "🎬");
    setDescription(deck.description || deck.desc || "");
    setIsAvailable(deck.isAvailable !== false);
    setIsTrending(Boolean(deck.isTrending));
    setSortOrder(Number(deck.sortOrder || 0));
    if (deck.gradient && deck.gradient.length > 0) {
      setGradientStart(deck.gradient[0] || "#FFD600");
      setGradientEnd(
        deck.gradient.length > 1
          ? deck.gradient[1]
          : deck.gradient[0] || "#BE4141",
      );
    } else {
      setGradientStart("#FFD600");
      setGradientEnd("#BE4141");
    }
    setWordsInput(deckWords.join(", "));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const wordsArray = wordsInput
      .split(/[\n,]+/)
      .map((c) => c.replace(/"/g, "").trim())
      .filter((c) => c.length > 0);

    const gradient = [gradientStart.trim(), gradientEnd.trim()].filter(Boolean);

    const deckData = {
      name: name.trim(),
      description: description.trim(),
      icon,
      isAvailable,
      isTrending,
      sortOrder,
      words: wordsArray,
      wordsCount: wordsArray.length,
      gradient: gradient.length > 0 ? gradient : undefined,
    };

    try {
      if (editingDeck && editingDeck.id) {
        await updateDeckInFirestore(editingDeck.id, deckData);
      } else {
        await createDeckInFirestore(deckData);
      }
      setIsModalOpen(false);
      fetchDecks();
    } catch (err: any) {
      console.error("Firestore save deck error:", err);
      alert(
        "Failed to save deck to Firestore. Check security rules or console.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, deckName: string) => {
    if (
      confirm(`Are you sure you want to delete "${deckName}" from Firestore?`)
    ) {
      try {
        await deleteDeckFromFirestore(id);
        fetchDecks();
      } catch (err: any) {
        console.error("Firestore delete error:", err);
        alert("Failed to delete deck. Check security rules or console.");
      }
    }
  };

  const filteredDecks = decks.filter(
    (d) =>
      (d.name || d.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (d.description || d.desc || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const parsedWordsCount = wordsInput
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-brand-text flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-primary" />
            <span>Firebase Decks ({decks.length})</span>
          </h2>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* <Button
            variant="secondary"
            size="sm"
            onClick={handleSanitize}
            disabled={sanitizing || loading}
            className="shrink-0 text-xs font-bold gap-1.5"
            title="Clean all existing Firestore deck documents to exact 9-field schema"
          >
            <Sparkles
              className={`w-3.5 h-3.5 ${sanitizing ? "animate-spin" : ""}`}
            />
            <span>{sanitizing ? "Cleaning..." : "Clean Firestore"}</span>
          </Button> */}

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDecks}
            disabled={loading}
            className="shrink-0"
            title="Refresh decks from Firestore"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create Deck</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md">
        <Input
          placeholder="Search Firebase decks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Decks Grid */}
      {loading ? (
        <div className="py-12 text-center text-sm font-medium text-brand-muted">
          Fetching live decks from Firebase...
        </div>
      ) : filteredDecks.length === 0 ? (
        <div className="py-12 px-4 text-center text-xs sm:text-sm text-brand-muted bg-brand-surface rounded-2xl border border-brand-border">
          No decks found in Firebase Firestore. Click "Create Deck" to add your
          first category!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDecks.map((deck) => {
            const hasCustomGradient = deck.gradient && deck.gradient.length > 0;
            const cardBgStyle = hasCustomGradient
              ? {
                  background: `linear-gradient(135deg, ${deck.gradient![0]}, ${
                    deck.gradient!.length > 1
                      ? deck.gradient![1]
                      : deck.gradient![0]
                  })`,
                }
              : undefined;

            return (
              <div
                key={deck.id}
                style={cardBgStyle}
                className={`p-5 rounded-3xl border border-white/20 flex flex-col justify-between hover:border-amber-300/80 transition-all shadow-lg relative overflow-hidden group ${
                  hasCustomGradient ? "" : "bg-[#1e1938]"
                }`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3 pt-0.5">
                    <div className="w-11 h-11 rounded-2xl bg-black/25 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/30">
                      <span>{deck.icon || "🎬"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {deck.isTrending && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40 backdrop-blur-md">
                          🔥 Trending
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md ${
                          deck.isAvailable !== false
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                            : "bg-neutral-800 text-neutral-300 border border-white/20"
                        }`}
                      >
                        {deck.isAvailable !== false ? "Active" : "Inactive"}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-black/40 text-white text-xs font-black border border-white/30 backdrop-blur-md">
                        {deck.wordsCount ||
                          (deck.words || deck.cards || []).length}{" "}
                        words
                      </span>
                    </div>
                  </div>

                  <h3 className="font-black text-white text-xl mb-1 drop-shadow-sm tracking-wide">
                    {deck.name || deck.title}
                  </h3>
                  <p className="text-xs text-white/80 mb-3.5 leading-relaxed font-medium line-clamp-2">
                    {deck.description ||
                      deck.desc ||
                      "No description provided."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 relative z-10">
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Order: {deck.sortOrder || 0}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(deck)}
                      className="bg-black/30 hover:bg-black/50 text-white border border-white/20 text-xs px-3 py-1 rounded-xl"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      <span>Edit</span>
                    </Button>
                    {deck.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDelete(
                            deck.id!,
                            deck.name || deck.title || "Deck",
                          )
                        }
                        className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs px-2.5 py-1 rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#17132e] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-indigo-500/20">
              <h3 className="text-lg font-black tracking-wide text-white flex items-center gap-2">
                <span>
                  {editingDeck ? "Edit Firebase Deck" : "Create New Deck"}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form
              onSubmit={handleSave}
              className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1 text-xs"
            >
              {/* Name & Icon Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                    DECK NAME (name) *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Cricket Fever, Bollywood Buff..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                    ICON (icon)
                  </label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#252044] border border-indigo-500/20 text-white font-bold text-center text-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Emoji Picker Presets */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  PRESET ICONS
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setIcon(e)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-transform active:scale-95 ${
                        icon === e
                          ? "bg-amber-400 text-black shadow-md scale-105"
                          : "bg-[#252044] hover:bg-white/10 text-white border border-white/10"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  DESCRIPTION (description)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="From batting masterclasses to deadly yorkers—guess legendary..."
                  className="w-full px-4 py-3 rounded-xl bg-[#252044] border border-indigo-500/20 text-white font-medium text-xs focus:outline-none leading-relaxed"
                />
              </div>

              {/* Custom Gradient Picker */}
              <div className="p-4 rounded-2xl bg-[#252044]/60 border border-indigo-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-neutral-300">
                    DECK CARD GRADIENT (gradient)
                  </label>
                  <span className="text-[10px] text-amber-400 font-bold font-mono">
                    {gradientStart} → {gradientEnd}
                  </span>
                </div>

                {/* Live Preview Box */}
                <div
                  className="w-full h-11 rounded-xl border border-white/20 flex items-center justify-between px-4 shadow-inner transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
                  }}
                >
                  <span className="text-white font-black text-xs drop-shadow-md flex items-center gap-2">
                    <span>{icon}</span>
                    <span>{name || "Gradient Card Preview"}</span>
                  </span>
                  <Sparkles className="w-4 h-4 text-white/80" />
                </div>

                {/* Hex Inputs + Color Pickers */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Start Color
                    </span>
                    <div className="flex items-center gap-2 bg-[#1b1735] border border-indigo-500/20 rounded-xl p-1.5">
                      <input
                        type="color"
                        value={
                          gradientStart.startsWith("#")
                            ? gradientStart
                            : "#FFD600"
                        }
                        onChange={(e) =>
                          setGradientStart(e.target.value.toUpperCase())
                        }
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={gradientStart}
                        onChange={(e) => setGradientStart(e.target.value)}
                        className="w-full bg-transparent text-white font-mono text-xs uppercase focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      End Color
                    </span>
                    <div className="flex items-center gap-2 bg-[#1b1735] border border-indigo-500/20 rounded-xl p-1.5">
                      <input
                        type="color"
                        value={
                          gradientEnd.startsWith("#") ? gradientEnd : "#BE4141"
                        }
                        onChange={(e) =>
                          setGradientEnd(e.target.value.toUpperCase())
                        }
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={gradientEnd}
                        onChange={(e) => setGradientEnd(e.target.value)}
                        className="w-full bg-transparent text-white font-mono text-xs uppercase focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Gradient Chips */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                    PRESET GRADIENTS
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_GRADIENTS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setGradientStart(p[0]);
                          setGradientEnd(p[1]);
                        }}
                        className={`h-6 px-2 rounded-lg border flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                          gradientStart === p[0] && gradientEnd === p[1]
                            ? "border-amber-400 ring-2 ring-amber-400/50 scale-105"
                            : "border-white/10 hover:border-white/30 opacity-80 hover:opacity-100"
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${p[0]}, ${p[1]})`,
                        }}
                      >
                        <span className="text-[9px] font-bold text-white shadow-sm font-mono">
                          {p[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  SORT ORDER (sortOrder)
                </label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              {/* Status Toggles: Active & Trending */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#252044] border border-indigo-500/20">
                  <span className="font-black text-xs uppercase tracking-wider text-white">
                    isAvailable
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAvailable(!isAvailable)}
                    className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center cursor-pointer ${
                      isAvailable
                        ? "bg-amber-400 justify-end"
                        : "bg-neutral-700 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-black shadow-md" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#252044] border border-indigo-500/20">
                  <span className="font-black text-xs uppercase tracking-wider text-white">
                    isTrending
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsTrending(!isTrending)}
                    className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center cursor-pointer ${
                      isTrending
                        ? "bg-amber-400 justify-end"
                        : "bg-neutral-700 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-black shadow-md" />
                  </button>
                </div>
              </div>

              {/* Words List Textarea with Count Badge */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                    WORDS (words / wordsCount: {parsedWordsCount})
                  </label>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    Comma-separated list
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={wordsInput}
                  onChange={(e) => setWordsInput(e.target.value)}
                  placeholder="Sachin Tendulkar, Virat Kohli, MS Dhoni, Jasprit Bumrah..."
                  className="w-full px-4 py-3 rounded-xl bg-[#252044] border border-indigo-500/20 text-white font-mono text-xs focus:outline-none leading-relaxed"
                />
              </div>

              {/* Actions: Cancel & Save */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-indigo-500/20">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingDeck
                      ? "Save Changes"
                      : "Create Deck"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
