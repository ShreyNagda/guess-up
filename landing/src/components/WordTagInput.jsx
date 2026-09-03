import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, Tag, AlertCircle, Trash2, Search, Sparkles } from "lucide-react";

export const WordTagInput = ({
  words = [],
  onChange,
  placeholder = "Type words separated by commas or enter...",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const handleAddWords = (rawText) => {
    if (!rawText || !rawText.trim()) return;

    const newTokens = rawText
      .split(/[\n,]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (newTokens.length === 0) return;

    const existingLower = new Set(words.map((w) => w.toLowerCase()));
    const addedList = [...words];
    let hasDuplicates = false;

    newTokens.forEach((token) => {
      if (existingLower.has(token.toLowerCase())) {
        hasDuplicates = true;
      } else {
        existingLower.add(token.toLowerCase());
        addedList.push(token);
      }
    });

    if (hasDuplicates) {
      setDuplicateWarning("Some duplicate words were automatically ignored.");
      setTimeout(() => setDuplicateWarning(null), 3000);
    }

    onChange(addedList);
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddWords(inputValue);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    handleAddWords(pasted);
  };

  const handleRemoveWord = (indexToRemove) => {
    const updated = words.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleClearAll = () => {
    if (words.length === 0) return;
    if (window.confirm("Are you sure you want to clear all words in this deck?")) {
      onChange([]);
    }
  };

  const filteredWords = words.filter((w) =>
    w.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Input Header Bar */}
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-black uppercase tracking-wider text-muted-light dark:text-muted-dark flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-primary" /> Deck Words ({words.length} Cards)
        </label>

        {words.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[0.7rem] font-extrabold text-error/80 hover:text-error transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>

      {/* Input Field Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-surface-card-light dark:bg-surface-card-dark text-text-light dark:text-text-dark outline-none focus:border-primary transition-all placeholder:text-muted-light dark:placeholder:text-muted-dark shadow-inner"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-black uppercase px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 pointer-events-none hidden sm:inline-block">
            Press Enter or Comma
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleAddWords(inputValue)}
          disabled={!inputValue.trim()}
          className="px-4 py-2.5 rounded-xl bg-primary text-accent font-black text-xs flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Card
        </button>
      </div>

      {/* Duplicate Warning Indicator */}
      <AnimatePresence>
        {duplicateWarning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {duplicateWarning}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Search Bar for Large Word Decks */}
      {words.length > 10 && (
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-dark" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search deck words..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-[0.75rem] font-medium outline-none focus:border-primary transition-all"
          />
        </div>
      )}

      {/* Interactive Tag Chips Container */}
      <div className="min-h-24 max-h-56 overflow-y-auto p-3 rounded-2xl bg-surface-card-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark flex flex-wrap gap-2 shadow-inner">
        {filteredWords.length > 0 ? (
          <AnimatePresence>
            {filteredWords.map((word, idx) => {
              const originalIndex = words.indexOf(word);
              return (
                <motion.span
                  key={`${word}-${idx}`}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark shadow-sm group hover:border-primary transition-all"
                >
                  <span className="text-[0.65rem] text-muted-dark font-extrabold mr-0.5">
                    #{originalIndex + 1}
                  </span>
                  <span>{word}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWord(originalIndex)}
                    className="p-0.5 rounded-md hover:bg-error/20 text-muted-dark hover:text-error transition-all cursor-pointer ml-1"
                    title="Remove word"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.span>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-6 text-center text-muted-dark gap-1">
            <Sparkles className="w-5 h-5 text-primary opacity-60" />
            <p className="text-xs font-bold">
              {words.length === 0
                ? "No cards in deck yet. Type words above to start!"
                : "No matching words found for search filter."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
