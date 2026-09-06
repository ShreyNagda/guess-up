/**
 * Normalizes Firestore category document data to match the unified Guess Up Category model schema.
 * Aligns properties across mobile app contracts and web landing page components.
 *
 * @param {string} docId - Document ID or slug
 * @param {Object} data - Raw Firestore data object
 * @returns {Object} Normalized Category object
 */
export const normalizeCategory = (docId, data = {}) => {
  const name = (data.name || data.title || docId || "Untitled Deck").trim();

  // Standardize words array
  let wordsList = [];
  if (Array.isArray(data.words)) {
    wordsList = data.words.map((w) => w.toString().trim()).filter(Boolean);
  } else if (typeof data.words === "string") {
    wordsList = data.words
      .split(/[\n,]+/)
      .map((w) => w.trim())
      .filter(Boolean);
  }

  const primaryColor = data.color || data.colorHex || "#FFD600";
  const gradientEnd = data.gradientEnd || "#FF9100";

  return {
    id: docId,
    deckId: docId,
    name,
    title: name,
    icon: data.icon && data.icon.trim() ? data.icon.trim() : "🎮",
    words: wordsList,
    wordsCount:
      typeof data.wordsCount === "number"
        ? data.wordsCount
        : wordsList.length,
    description: (data.description || data.subtitle || data.desc || "").trim(),
    subtitle: (data.description || data.subtitle || "Fun party deck inside").trim(),
    color: primaryColor,
    colorHex: primaryColor,
    gradientEnd,
    isTrending: data.isTrending === true,
    isAvailable: data.isAvailable !== false,
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
    isCustom: data.isCustom === true || docId.startsWith("custom"),
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
};

/**
 * Returns a dark shade hex string for subtle gradient contrast
 */
export const getDarkerShade = (hexColor = "#FFD600") => {
  try {
    let clean = hexColor.replace("#", "");
    if (clean.length === 3) {
      clean = clean
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const num = parseInt(clean, 16);
    let r = (num >> 16) - 50;
    let g = ((num >> 8) & 0x00ff) - 50;
    let b = (num & 0x0000ff) - 50;

    r = Math.max(0, r);
    g = Math.max(0, g);
    b = Math.max(0, b);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch {
    return "#FF9100";
  }
};
