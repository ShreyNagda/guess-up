export const VIBRANT_PALETTE = [
  "#E50914", // Red
  "#FFD600", // Yellow
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#8B5CF6", // Purple
  "#EC4899", // Hot Pink
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#F43F5E", // Rose
  "#84CC16", // Lime
  "#A855F7", // Violet
  "#0284C7", // Sky Blue
  "#D97706", // Amber
  "#E11D48", // Crimson
  "#059669", // Dark Emerald
  "#4F46E5", // Deep Indigo
  "#7C3AED", // Deep Purple
  "#DB2777", // Magenta
  "#EA580C", // Deep Orange
  "#0891B2", // Dark Cyan
  "#C026D3", // Fuchsia
  "#CA8A04", // Deep Gold
];

/**
 * Normalizes hex color string to uppercase formatted hex.
 */
export const normalizeHexColor = (val) => {
  if (!val) return "";
  let formatted = val.trim();
  if (!formatted.startsWith("#")) {
    formatted = "#" + formatted;
  }
  return formatted.toUpperCase();
};

/**
 * Calculates a slightly darker shade of a given hex color.
 * @param {string} hex - Color hex string (e.g., "#FFD600")
 * @param {number} factor - Scale factor between 0 and 1 (default 0.70 = 30% darker)
 * @returns {string} Darker hex string (e.g., "#B29500")
 */
export const getDarkerShade = (hex, factor = 0.70) => {
  if (!hex || typeof hex !== "string") return "#B29500";
  let c = hex.trim().replace(/^#/, "");
  if (!/^([0-9A-F]{3}){1,2}$/i.test(c)) return "#B29500";
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  const num = parseInt(c, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r = Math.max(0, Math.floor(r * factor));
  g = Math.max(0, Math.floor(g * factor));
  b = Math.max(0, Math.floor(b * factor));

  const toHex = (n) => n.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Selects a random vibrant color that is not currently used by any deck in existingDecks.
 * @param {Array} existingDecks - List of deck objects from Firestore
 * @returns {string} Hex color string
 */
export const getRandomUnusedColor = (existingDecks = []) => {
  const used = new Set();
  existingDecks.forEach((deck) => {
    if (deck.color) used.add(normalizeHexColor(deck.color));
    if (deck.gradientEnd) used.add(normalizeHexColor(deck.gradientEnd));
  });

  // Filter palette for unused colors
  const unusedFromPalette = VIBRANT_PALETTE.filter(
    (colorHex) => !used.has(normalizeHexColor(colorHex))
  );

  if (unusedFromPalette.length > 0) {
    const randomIndex = Math.floor(Math.random() * unusedFromPalette.length);
    return normalizeHexColor(unusedFromPalette[randomIndex]);
  }

  // Fallback: Generate a random vibrant HSL color that is not used
  for (let attempt = 0; attempt < 100; attempt++) {
    const hue = Math.floor(Math.random() * 360);
    const hex = hslToHex(hue, 85, 55);
    if (!used.has(hex)) {
      return hex;
    }
  }

  return "#FFD600";
};

// Helper to convert HSL to Hex
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}
