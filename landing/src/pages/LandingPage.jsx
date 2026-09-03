import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { Story } from "../components/Story";
import { BentoGrid } from "../components/BentoGrid";
import { DeckShowcase } from "../components/DeckShowcase";
import { JoinBetaForm } from "../components/JoinBetaForm";
import { FeedbackForm } from "../components/FeedbackForm";
import { PrivacyPolicy } from "../components/PrivacyPolicy";
import { AdminAuthModal } from "../components/AdminAuthModal";
import { UserCheck } from "lucide-react";
import { normalizeCategory } from "../utils/categoryModel";

const DECKS = [
  {
    deckId: "bollywood_blockbusters",
    icon: "🎬",
    title: "Bollywood Blockbusters",
    name: "Bollywood Blockbusters",
    subtitle: "Iconic movies, dialogues, & superstars",
    description: "Iconic movies, dialogues, & superstars",
    color: "#FFD600",
    gradientEnd: "#FF9100",
    words: [
      "Sholay",
      "Dilwale Dulhania Le Jayenge",
      "3 Idiots",
      "KGF",
      "Pathaan",
      "Lagaan",
      "Dangal",
      "Gadar",
      "Bahubali",
      "Kabir Singh",
      "Om Shanti Om",
      "ZNMD",
      "Pushpa",
      "Jawan",
      "Stree 2",
    ],
  },
  {
    deckId: "cricket_mania",
    icon: "🏏",
    title: "Cricket Mania",
    name: "Cricket Mania",
    subtitle: "Legends, IPL moments, & iconic shots",
    description: "Legends, IPL moments, & iconic shots",
    color: "#2196F3",
    gradientEnd: "#0D47A1",
    words: [
      "Virat Kohli",
      "MS Dhoni",
      "Sachin Tendulkar",
      "IPL Trophy",
      "Yorker",
      "Super Over",
      "Wankhede",
      "Helicopter Shot",
      "Bouncer",
      "Rohit Sharma",
      "Jasprit Bumrah",
      "World Cup",
    ],
  },
  {
    deckId: "desi_foodies",
    icon: "🍔",
    title: "Desi Foodies",
    name: "Desi Foodies",
    subtitle: "Street snacks, delicacies, & cravings",
    description: "Street snacks, delicacies, & cravings",
    color: "#FF9800",
    gradientEnd: "#E65100",
    words: [
      "Butter Chicken",
      "Pani Puri",
      "Biryani",
      "Samosa",
      "Pav Bhaji",
      "Gulab Jamun",
      "Chole Bhature",
      "Dosa",
      "Vada Pav",
      "Jalebi",
      "Tapri Chai",
      "Momos",
    ],
  },
  {
    deckId: "desi_youth_vibes",
    icon: "😎",
    title: "Desi Youth & Vibes",
    name: "Desi Youth & Vibes",
    subtitle: "College life, memes, & hostel moments",
    description: "College life, memes, & hostel moments",
    color: "#E91E63",
    gradientEnd: "#880E4F",
    words: [
      "Bunking Class",
      "Maggi at 2 AM",
      "Auto Rickshaw",
      "Goa Trip Plan",
      "Tapri Chai",
      "Backbenchers",
      "Reel Creator",
      "Jugaad",
      "Shaadi Dance",
      "Street Shopping",
      "Canteen Gossip",
    ],
  },
];

export const LandingPage = () => {
  const [liveDecks, setLiveDecks] = useState([]);
  const [deckSearch, setDeckSearch] = useState("");
  const [selectedDeckForGame, setSelectedDeckForGame] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          const norm = normalizeCategory(docSnap.id, docSnap.data());
          list.push(norm);
        });
        if (list.length > 0) {
          setLiveDecks(list);
        }
      },
      () => {},
    );
    return unsubscribe;
  }, []);

  const baseDecks = liveDecks.length > 0 ? liveDecks : DECKS;

  const filteredDecks = baseDecks.filter((deck) => {
    const title = (deck.title || deck.name || "").toLowerCase();
    const desc = (deck.description || deck.subtitle || "").toLowerCase();
    const query = deckSearch.toLowerCase().trim();
    if (!query) return true;
    return title.includes(query) || desc.includes(query);
  });

  const activeDeck = selectedDeckForGame || baseDecks[0];

  const handlePlayDemoFromHUD = () => {
    const heroDemoEl = document.getElementById("interactive-hero-demo");
    if (heroDemoEl) {
      heroDemoEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCreateCustomDeckClick = () => {
    window.location.href = "/admin";
  };

  return (
    <div className="flex flex-col min-h-screen text-text-light dark:text-text-dark bg-transparent overflow-x-hidden">
      <Header />

      {/* Hero Section with Interactive Demo & Sticky Action HUD */}
      <Hero
        activeDeck={activeDeck}
        onPlayDemoClick={handlePlayDemoFromHUD}
      />

      {/* Explore Decks Matrix (App Search Bar + 2-Column Supercell 3D Cards) */}
      <DeckShowcase
        decks={filteredDecks}
        searchQuery={deckSearch}
        onSearchChange={setDeckSearch}
        onSelectDeckForGame={setSelectedDeckForGame}
        onCreateCustomDeckClick={handleCreateCustomDeckClick}
      />

      {/* Origin & Developer Story */}
      <Story />

      {/* Feature Bento Grid */}
      <BentoGrid />

      {/* Side-by-Side Responsive Forms Container */}
      <section
        className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20 w-full grid lg:grid-cols-2 gap-8 items-stretch"
        id="forms"
      >
        <JoinBetaForm />
        <FeedbackForm />
      </section>

      {/* Privacy Policy */}
      <PrivacyPolicy />

      {/* App Download CTA */}
      <section
        className="max-w-5xl mx-auto w-full my-12 sm:my-20 px-6 py-12 sm:py-20 bg-primary text-accent rounded-3xl sm:rounded-[36px] flex flex-col items-center text-center gap-6 shadow-xl relative overflow-hidden"
        id="download"
      >
        <div className="absolute inset-0 bg-radial from-white/20 to-transparent pointer-events-none" />

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-none z-10">
          Ready to Guess Up?
        </h2>
        <p className="font-bold text-base sm:text-xl max-w-xl leading-relaxed z-10">
          Join our beta list above or download the testing build to turn your
          device into the ultimate party charades scoreboard!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-xs sm:max-w-none z-10">
          <a
            href="#join-beta"
            className="bg-accent text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <UserCheck className="w-5 h-5" /> Register for Beta
          </a>
        </div>
      </section>

      <Footer />

      {/* Admin Passkey Auth Modal */}
      <AdminAuthModal />
    </div>
  );
};
