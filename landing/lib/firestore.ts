import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { getDb } from "./firebase";

export interface Tester {
  id?: string;
  name: string;
  email: string;
  createdAt: any;
}

export interface Deck {
  id?: string;
  name: string;
  description: string;
  icon: string;
  isAvailable: boolean;
  isTrending: boolean;
  sortOrder: number;
  words: string[];
  wordsCount: number;
  gradient?: string[];
  updatedAt?: any;

  // Compatibility aliases for UI code
  title?: string;
  cards?: string[];
  desc?: string;
}

export async function addTesterToFirestore(
  name: string,
  email: string,
): Promise<{ success: boolean; alreadyRegistered?: boolean; error?: string }> {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  try {
    const db = getDb();
    const docRef = doc(db, "testers", cleanEmail);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: false,
        alreadyRegistered: true,
        error: "This email is already registered for early access!",
      };
    }

    await setDoc(docRef, {
      name: cleanName,
      email: cleanEmail,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Firestore add tester error:", error);
    return {
      success: false,
      error: error?.message || "Something went wrong. Please try again.",
    };
  }
}

export async function getTestersFromFirestore(): Promise<Tester[]> {
  try {
    const db = getDb();
    const q = query(collection(db, "testers"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      let dateStr = new Date().toISOString();
      if (data.createdAt && typeof data.createdAt.toDate === "function") {
        dateStr = data.createdAt.toDate().toISOString();
      } else if (typeof data.createdAt === "string") {
        dateStr = data.createdAt;
      }
      return {
        id: docSnap.id,
        name: data.name || "Anonymous",
        email: data.email || "",
        createdAt: dateStr,
      };
    });
  } catch (error) {
    console.warn("Firestore get testers warning:", error);
    return [];
  }
}

export async function getDecksFromFirestore(): Promise<Deck[]> {
  try {
    const db = getDb();
    let snapshot;
    try {
      snapshot = await getDocs(collection(db, "categories"));
    } catch (e) {
      snapshot = await getDocs(collection(db, "decks"));
    }

    if (snapshot.empty) {
      try {
        const fallbackSnap = await getDocs(collection(db, "decks"));
        if (!fallbackSnap.empty) {
          snapshot = fallbackSnap;
        }
      } catch (e) {}
    }

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const nameVal = data.name || data.title || "Untitled Deck";
      const descVal = data.description || data.desc || "";
      const wordsList =
        Array.isArray(data.words) && data.words.length > 0
          ? data.words
          : Array.isArray(data.cards)
            ? data.cards
            : [];
      const cleanWords = wordsList
        .map((w: any) => String(w).replace(/"/g, "").trim())
        .filter((w: string) => w.length > 0);

      const countVal =
        typeof data.wordsCount === "number"
          ? data.wordsCount
          : cleanWords.length;

      const gradientList =
        Array.isArray(data.gradient) && data.gradient.length > 0
          ? data.gradient
              .map((c: any) => String(c).trim())
              .filter((c: string) => c.length > 0)
              .slice(0, 3)
          : undefined;

      return {
        id: docSnap.id,
        name: nameVal,
        title: nameVal,
        icon: data.icon || "🎬",
        description: descVal,
        desc: descVal,
        words: cleanWords,
        cards: cleanWords,
        wordsCount: countVal,
        gradient: gradientList,
        isAvailable:
          data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
        isTrending: Boolean(data.isTrending),
        sortOrder: Number(data.sortOrder || 0),
        updatedAt: data.updatedAt,
      };
    });
  } catch (error: any) {
    console.warn("Firestore get decks warning:", error?.message || error);
    return [];
  }
}

export function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "unnamed-deck"
  );
}

export async function createDeckInFirestore(
  deck: Omit<Deck, "id">,
): Promise<Deck> {
  const db = getDb();
  const nameVal = (deck.name || deck.title || "Untitled Deck").trim();
  const iconVal = deck.icon || "🎬";
  const descVal = (deck.description || deck.desc || "").trim();
  const wordsList =
    Array.isArray(deck.words) && deck.words.length > 0
      ? deck.words
      : Array.isArray(deck.cards)
        ? deck.cards
        : [];
  const cleanWords = wordsList
    .map((w) => String(w).replace(/"/g, "").trim())
    .filter((w) => w.length > 0);

  const cleanGradient = Array.isArray(deck.gradient)
    ? deck.gradient
        .map((c) => String(c).trim())
        .filter((c) => c.length > 0)
        .slice(0, 3)
    : undefined;

  const docId = generateSlug(nameVal);

  const payload: Record<string, any> = {
    name: nameVal,
    description: descVal,
    icon: iconVal,
    isAvailable: deck.isAvailable !== false,
    isTrending: Boolean(deck.isTrending),
    sortOrder: Number(deck.sortOrder || 0),
    words: cleanWords,
    wordsCount: cleanWords.length,
    updatedAt: serverTimestamp(),
  };
  if (cleanGradient && cleanGradient.length > 0) {
    payload.gradient = cleanGradient;
  }

  await setDoc(doc(db, "categories", docId), payload);
  return {
    id: docId,
    name: nameVal,
    title: nameVal,
    icon: iconVal,
    description: descVal,
    desc: descVal,
    words: cleanWords,
    cards: cleanWords,
    wordsCount: cleanWords.length,
    gradient: cleanGradient,
    isAvailable: deck.isAvailable !== false,
    isTrending: Boolean(deck.isTrending),
    sortOrder: Number(deck.sortOrder || 0),
  };
}

export async function updateDeckInFirestore(
  id: string,
  deck: Omit<Deck, "id">,
): Promise<void> {
  const db = getDb();
  const nameVal = (deck.name || deck.title || "Untitled Deck").trim();
  const iconVal = deck.icon || "🎬";
  const descVal = (deck.description || deck.desc || "").trim();
  const wordsList =
    Array.isArray(deck.words) && deck.words.length > 0
      ? deck.words
      : Array.isArray(deck.cards)
        ? deck.cards
        : [];
  const cleanWords = wordsList
    .map((w) => String(w).replace(/"/g, "").trim())
    .filter((w) => w.length > 0);

  const cleanGradient = Array.isArray(deck.gradient)
    ? deck.gradient
        .map((c) => String(c).trim())
        .filter((c) => c.length > 0)
        .slice(0, 3)
    : undefined;

  const payload: Record<string, any> = {
    name: nameVal,
    description: descVal,
    icon: iconVal,
    isAvailable: deck.isAvailable !== false,
    isTrending: Boolean(deck.isTrending),
    sortOrder: Number(deck.sortOrder || 0),
    words: cleanWords,
    wordsCount: cleanWords.length,
    updatedAt: serverTimestamp(),
  };
  if (cleanGradient && cleanGradient.length > 0) {
    payload.gradient = cleanGradient;
  }

  try {
    const categoryRef = doc(db, "categories", id);
    await setDoc(categoryRef, payload);
  } catch (e) {
    const deckRef = doc(db, "decks", id);
    await setDoc(deckRef, payload);
  }
}

export async function deleteDeckFromFirestore(id: string): Promise<void> {
  const db = getDb();
  try {
    await deleteDoc(doc(db, "categories", id));
  } catch (e) {
    await deleteDoc(doc(db, "decks", id));
  }
}

export async function cleanAndSanitizeFirestoreDecks(): Promise<{
  success: boolean;
  count: number;
}> {
  try {
    const db = getDb();
    const snapshot = await getDocs(collection(db, "categories"));
    let count = 0;
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const nameVal = (data.name || data.title || "Untitled Deck").trim();
      const descVal = (data.description || data.desc || "").trim();
      const wordsList =
        Array.isArray(data.words) && data.words.length > 0
          ? data.words
          : Array.isArray(data.cards)
            ? data.cards
            : [];
      const cleanWords = wordsList
        .map((w: any) => String(w).replace(/"/g, "").trim())
        .filter((w: string) => w.length > 0);

      const cleanGradient = Array.isArray(data.gradient)
        ? data.gradient
            .map((c: any) => String(c).trim())
            .filter((c: string) => c.length > 0)
            .slice(0, 3)
        : undefined;

      const cleanPayload: Record<string, any> = {
        name: nameVal,
        description: descVal,
        icon: data.icon || "🎬",
        isAvailable:
          data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
        isTrending: Boolean(data.isTrending),
        sortOrder: Number(data.sortOrder || 0),
        words: cleanWords,
        wordsCount: cleanWords.length,
        updatedAt: serverTimestamp(),
      };
      if (cleanGradient && cleanGradient.length > 0) {
        cleanPayload.gradient = cleanGradient;
      }

      await setDoc(doc(db, "categories", docSnap.id), cleanPayload);
      count++;
    }
    return { success: true, count };
  } catch (error: any) {
    console.error("Error sanitizing Firestore decks:", error);
    return { success: false, count: 0 };
  }
}

export async function addFeedbackToFirestore(
  rating: number,
  feedback: string,
  name: string,
  role: string,
): Promise<{ success: boolean; error?: string }> {
  const cleanName = name.trim();
  const cleanRole = role.trim();
  const cleanFeedback = feedback.trim();

  if (!cleanName || !cleanRole || !cleanFeedback || rating < 1 || rating > 5) {
    return {
      success: false,
      error: "Please fill out all required fields with a valid star rating.",
    };
  }

  try {
    const db = getDb();
    await addDoc(collection(db, "feedback"), {
      rating,
      feedback: cleanFeedback,
      name: cleanName,
      role: cleanRole,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Firestore add feedback error:", error);
    return {
      success: false,
      error: error?.message || "Something went wrong. Please try again.",
    };
  }
}
