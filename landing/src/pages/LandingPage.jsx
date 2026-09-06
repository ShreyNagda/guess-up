import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { TrustBar } from "../components/TrustBar";
import { ProblemAgitation } from "../components/ProblemAgitation";
import { ValuePropositions } from "../components/ValuePropositions";
import { DeckShowcase } from "../components/DeckShowcase";
import { BentoGrid } from "../components/BentoGrid";
import { Story } from "../components/Story";
import { TestersWall } from "../components/TestersWall";
import { FeedbackForm } from "../components/FeedbackForm";
import { PrivacyPolicy } from "../components/PrivacyPolicy";
import { FaqSection } from "../components/FaqSection";
import { ClosingCta } from "../components/ClosingCta";
import { AdminAuthModal } from "../components/AdminAuthModal";
import { PatternCanvas } from "../components/PatternCanvas";
import { normalizeCategory } from "../utils/categoryModel";

const DECKS = [
  {
    deckId: "bollywood_buff",
    icon: "🎬",
    title: "Bollywood Buff",
    name: "Bollywood Buff",
    subtitle: "Iconic movies, dialogues, & superstars",
    description: "Iconic movies, dialogues, & superstars",
    color: "#FFD600",
    gradientEnd: "#FF9100",
    words: ["Sholay", "DDLJ", "3 Idiots", "Pushpa", "Stree 2", "SRK", "Deepika Padukone", "Dangal"],
  },
  {
    deckId: "cricket_fever",
    icon: "🏏",
    title: "Cricket Fever",
    name: "Cricket Fever",
    subtitle: "Legends, IPL moments, & iconic shots",
    description: "Legends, IPL moments, & iconic shots",
    color: "#2196F3",
    gradientEnd: "#0D47A1",
    words: ["Sachin Tendulkar", "MS Dhoni", "Virat Kohli", "Super Over", "Wankhede", "Helicopter Shot", "IPL Trophy"],
  },
  {
    deckId: "sweet_spicy",
    icon: "🍔",
    title: "Sweet & Spicy",
    name: "Sweet & Spicy",
    subtitle: "Street snacks, delicacies, & 2 AM cravings",
    description: "Street snacks, delicacies, & 2 AM cravings",
    color: "#FF9800",
    gradientEnd: "#E65100",
    words: ["Pani Puri", "Biryani", "Butter Chicken", "Samosa", "Pav Bhaji", "Tapri Chai", "Gulab Jamun"],
  },
  {
    deckId: "incredible_india",
    icon: "🇮🇳",
    title: "Incredible India",
    name: "Incredible India",
    subtitle: "Monuments, festivals, & desi quirks",
    description: "Monuments, festivals, & desi quirks",
    color: "#4CAF50",
    gradientEnd: "#1B5E20",
    words: ["Taj Mahal", "Auto Rickshaw", "Diwali", "Jugaad", "Yoga", "Monsoon", "Rickshaw"],
  },
  {
    deckId: "aamchi_mumbai",
    icon: "🏙️",
    title: "Aamchi Mumbai",
    name: "Aamchi Mumbai",
    subtitle: "Local train vibes, Marine Drive, & vada pav",
    description: "Local train vibes, Marine Drive, & vada pav",
    color: "#E91E63",
    gradientEnd: "#880E4F",
    words: ["Vada Pav", "Marine Drive", "Local Train", "Gateway of India", "Cutting Chai", "CST Station"],
  },
];

export const LandingPage = () => {
  const [liveDecks, setLiveDecks] = useState([]);
  const [deckSearch, setDeckSearch] = useState("");

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

  const handleCreateCustomDeckClick = () => {
    window.location.href = "/admin";
  };

  return (
    <div className="flex flex-col min-h-screen text-text bg-bg transition-colors duration-300 overflow-x-hidden relative">
      {/* Dynamic Animated Pattern Background Canvas */}
      <PatternCanvas />

      {/* Header */}
      <Header />

      {/* SECTION 1: Hero Section + Embedded Playable Demo */}
      <Hero />

      {/* SECTION 2: Social Proof / Trust Bar */}
      <TrustBar />

      {/* SECTION 3: Problem Agitation Section */}
      <ProblemAgitation />

      {/* SECTION 4: Solution & 3 Value Propositions */}
      <ValuePropositions />

      {/* SECTION 5: Deep-Dive Feature Grid & Decks Vault */}
      <DeckShowcase
        decks={filteredDecks}
        searchQuery={deckSearch}
        onSearchChange={setDeckSearch}
        onCreateCustomDeckClick={handleCreateCustomDeckClick}
      />

      <BentoGrid />

      <Story />

      {/* SECTION 6: Detailed Social Proof & Testers Wall */}
      <TestersWall />

      <FeedbackForm />

      <PrivacyPolicy />

      {/* SECTION 7: Overcoming Objections (FAQ) */}
      <FaqSection />

      {/* SECTION 8: Final Closing CTA */}
      <ClosingCta />

      {/* Footer */}
      <Footer />

      {/* Firebase Admin Auth Modal */}
      <AdminAuthModal />
    </div>
  );
};
