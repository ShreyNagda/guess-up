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

const DECKS = [
  {
    deckId: "bollywood_blockbusters",
    icon: "🎬",
    title: "Bollywood Blockbusters",
    subtitle: "Iconic movies, dialogues, & superstars",
    category: "movies",
    words:
      "Sholay, Dilwale Dulhania Le Jayenge, 3 Idiots, KGF, Pathaan, Lagaan, Dangal, Gadar, Bahubali, Kabir Singh, Om Shanti Om, ZNMD, Pushpa, Jawan, Stree 2",
  },
  {
    deckId: "cricket_mania",
    icon: "🏏",
    title: "Cricket Mania",
    subtitle: "Legends, IPL moments, & iconic shots",
    category: "sports",
    words:
      "Virat Kohli, MS Dhoni, Sachin Tendulkar, IPL Trophy, Yorker, Super Over, Wankhede, Helicopter Shot, Bouncer, Rohit Sharma, Jasprit Bumrah, World Cup",
  },
  {
    deckId: "desi_foodies",
    icon: "🍔",
    title: "Desi Foodies",
    subtitle: "Street snacks, delicacies, & cravings",
    category: "food",
    words:
      "Butter Chicken, Pani Puri, Biryani, Samosa, Pav Bhaji, Gulab Jamun, Chole Bhature, Dosa, Vada Pav, Jalebi, Tapri Chai, Momos",
  },
  {
    deckId: "desi_youth_vibes",
    icon: "😎",
    title: "Desi Youth & Vibes",
    subtitle: "College life, memes, & hostel moments",
    category: "youth",
    words:
      "Bunking Class, Maggi at 2 AM, Auto Rickshaw, Goa Trip Plan, Tapri Chai, Backbenchers, Reel Creator, Jugaad, Shaadi Dance, Street Shopping, Canteen Gossip",
  },
];

const CATEGORY_FILTERS = [
  { id: "all", label: "All Decks" },
  { id: "movies", label: "Bollywood" },
  { id: "sports", label: "Cricket" },
  { id: "food", label: "Desi Food" },
  { id: "youth", label: "Youth Vibes" },
];

export const LandingPage = () => {
  const [liveDecks, setLiveDecks] = useState([]);
  const [deckSearch, setDeckSearch] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const nameLower = (data.name || "").toLowerCase();
          list.push({
            deckId: docSnap.id,
            id: docSnap.id,
            icon: data.icon || "🎮",
            title: data.name || docSnap.id,
            subtitle: `${data.words?.length || 0} cards in deck`,
            words: data.words || [],
            category:
              nameLower.includes("movie") || nameLower.includes("bollywood")
                ? "movies"
                : nameLower.includes("cricket") || nameLower.includes("sport")
                  ? "sports"
                  : nameLower.includes("food") || nameLower.includes("snack")
                    ? "food"
                    : "youth",
          });
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
    const sub = (deck.subtitle || "").toLowerCase();
    const query = deckSearch.toLowerCase();
    const matchesSearch = title.includes(query) || sub.includes(query);
    const matchesCategory =
      activeCategoryFilter === "all" || deck.category === activeCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen text-text-light dark:text-text-dark bg-transparent overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Origin & Developer Story */}
      <Story />

      {/* Feature Bento Grid */}
      <BentoGrid />

      {/* Explore Decks Showcase (Interactive Inline Board & Flashcard Simulator) */}
      <DeckShowcase
        decks={filteredDecks}
        categoryFilters={CATEGORY_FILTERS}
        activeFilter={activeCategoryFilter}
        onFilterChange={setActiveCategoryFilter}
        searchQuery={deckSearch}
        onSearchChange={setDeckSearch}
      />

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
