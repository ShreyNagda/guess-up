import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { motion } from "motion/react";
import { db } from "../lib/firebase";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PhoneMockup } from "../components/PhoneMockup";
import { DeckModal } from "../components/DeckModal";

const FEATURES = [
  {
    icon: "⚔️",
    title: "Team Battle Mode",
    desc: "Split into Team Purple and Team Cyan for high-stakes multi-round battle matches! Real-time round scoring, turn handoffs, and instant winner celebrations.",
  },
  {
    icon: "🇮🇳",
    title: "Desi Pop-Culture Decks",
    desc: "Curated categories spanning Bollywood movies, Cricket legends, Indian delicacies (Samosa, Chai, Biryani), street-food classics, and regional festivals.",
  },
  {
    icon: "📱",
    title: "Forehead Placement & Auto-Start",
    desc: "Hold phone on forehead facing your friends. Auto-detects forehead positioning to launch the 3-second countdown before game starts!",
  },
  {
    icon: "🔄",
    title: "Protected Motion Controls",
    desc: "Tilt downwards for Correct (+1) or tilt upwards to Pass. Motion sensing is strictly active during live game timer to prevent accidental triggers.",
  },
  {
    icon: "🔍",
    title: "Deck Search & Word Previews",
    desc: "Instant search bar filtering across decks and words. Tap any deck to preview sample cards and inspect categories before playing.",
  },
  {
    icon: "✍️",
    title: "Create Custom Decks",
    desc: "Add your own personal inside jokes, names of friends, or custom categories. Save locally and launch immediately for party fun.",
  },
];

const STEPS = [
  {
    num: 1,
    img: "/images/onboarding2.png",
    title: "1. Select Decks & Mode",
    desc: "Pick your favorite decks or search keywords. Choose Solo or Team Battle mode, then hold the phone up to your forehead facing your friends.",
  },
  {
    num: 2,
    img: "/images/correct_mockup.png",
    title: "2. Got it Right? Tilt Down",
    desc: "If you guess the word based on clues, tilt the screen down toward the ground to score 1 point and load the next word.",
  },
  {
    num: 3,
    img: "/images/pass_mockup.png",
    title: "3. Unsure? Tilt Up",
    desc: "If you guess a word that is too difficult or you're stuck, tilt the screen upwards to pass. No penalty is given, saving time!",
  },
];

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

const playStoreUrl = import.meta.env.VITE_PLAY_STORE_URL || "#";

export const LandingPage = () => {
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
                    : "trending",
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

  const openDeckModal = (deck) => {
    setSelectedDeck(deck);
    setIsModalOpen(true);
  };

  const closeDeckModal = () => {
    setIsModalOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 380, damping: 24 },
    },
  };

  return (
    <div className="flex flex-col min-h-screen text-text-light dark:text-text-dark bg-transparent">
      <Header />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-24 grid lg:grid-cols-[1.2fr_1fr] items-center gap-12 text-center lg:text-left">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6 items-center lg:items-start"
        >
          <span className="bg-primary/15 border border-primary text-primary dark:border-accent dark:text-text-dark px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest self-center lg:self-start">
            Now Trending in India
          </span>

          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black leading-none tracking-tight uppercase">
            Put it on your{" "}
            <span className="block text-primary dark:text-text-dark drop-shadow-[4px_4px_0px_var(--color-accent)] dark:drop-shadow-[4px_4px_0px_var(--color-primary)]">
              FOREHEAD!
            </span>
          </h2>
          <p className="text-lg md:text-xl font-extrabold text-primary-dark dark:text-text-dark">
            The Ultimate Charades & Party Game
          </p>
          <p className="text-muted-light dark:text-muted-dark leading-relaxed max-w-xl text-base">
            Guess Up brings endless laughter to your house parties,
            get-togethers, and family nights! Designed specifically for Indian
            youths, guess words from Bollywood, Cricket, Food, Culture, and more
            while your friends mime, shout, and enact.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a
              href="#download"
              className="btn bg-primary text-accent text-center justify-center font-extrabold px-8 py-3.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              Play Now
            </a>
            <a
              href="#decks"
              className="border-2 border-primary dark:border-border-dark bg-transparent text-text-light dark:text-text-dark text-center justify-center font-extrabold px-8 py-3.5 rounded-xl hover:bg-primary hover:text-accent dark:hover:bg-white/5 transition-all shadow-none"
            >
              Explore Decks
            </a>
          </div>
        </motion.div>

        {/* Hero Gameplay GIF / Phone Mockup Loop */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <PhoneMockup />
        </motion.div>
      </section>

      {/* Social Proof Stats Banner */}
      <section className="bg-surface-card-light/40 dark:bg-surface-dark/40 border-y border-border-light dark:border-border-dark py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col">
            <span className="text-2xl md:text-3xl font-black text-primary">
              50,000+
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted-light dark:text-muted-dark mt-1">
              Cards Guessed
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl md:text-3xl font-black text-primary">
              100+
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted-light dark:text-muted-dark mt-1">
              Party Decks
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl md:text-3xl font-black text-primary">
              4.9★
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted-light dark:text-muted-dark mt-1">
              Party Rating
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl md:text-3xl font-black text-primary">
              100% Free
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted-light dark:text-muted-dark mt-1">
              No Ads / Unlimited
            </span>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section
        className="bg-surface-card-light/50 dark:bg-surface-dark/50 border-b border-border-light dark:border-border-dark py-16 md:py-24 px-4 md:px-8 backdrop-blur-sm transition-colors duration-300"
        id="features"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              Packed with Energy
            </h2>
            <p className="text-muted-light dark:text-muted-dark text-base md:text-lg">
              Features crafted to ensure your next group hangout is filled with
              pure chaos and fun.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -8, borderColor: "var(--color-primary)" }}
                className="bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark rounded-3xl p-8 flex flex-col gap-4 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-13 h-13 rounded-2xl bg-primary/10 border-2.5 border-primary dark:bg-white/5 dark:border-border-dark flex items-center justify-center font-black text-primary dark:text-text-dark text-lg select-none">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-light dark:text-muted-dark text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How to Play Steps */}
      <section
        className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24"
        id="how-to-play"
      >
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">
            How To Play
          </h2>
          <p className="text-muted-light dark:text-muted-dark text-base md:text-lg">
            Easy rules to learn in less than 30 seconds. Perfect for players of
            all ages!
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {STEPS.map((step, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="flex flex-col items-center text-center gap-6"
            >
              <div className="relative w-full h-37.5 bg-surface-light dark:bg-surface-dark border-3 border-border-light dark:border-border-dark rounded-2xl overflow-hidden shadow-md flex items-center justify-center">
                <img
                  className="w-full h-full object-cover"
                  src={step.img}
                  alt={step.title}
                />
                <span className="w-9 h-9 rounded-full bg-primary text-accent font-black text-sm flex items-center justify-center absolute top-2 left-2 shadow-md">
                  {step.num}
                </span>
              </div>
              <h3 className="text-lg font-black">{step.title}</h3>
              <p className="text-muted-light dark:text-muted-dark text-sm leading-relaxed max-w-xs">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Explore Decks Showcase */}
      <section
        className="bg-surface-card-light/30 dark:bg-surface-dark/30 border-t border-border-light dark:border-border-dark py-16 md:py-24 px-4 md:px-8 backdrop-blur-sm transition-colors duration-300"
        id="decks"
      >
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              Explore Word Decks
            </h2>
            <p className="text-muted-light dark:text-muted-dark text-base md:text-lg">
              Click a deck to preview a sample of the cards you'll be guessing
              in the game!
            </p>
          </div>

          {/* Decks Search & Category Filter Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto w-full bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark p-3 px-5 rounded-2xl shadow-sm">
            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1">
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryFilter(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all whitespace-nowrap cursor-pointer ${
                    activeCategoryFilter === cat.id
                      ? "bg-primary text-accent shadow-sm scale-105"
                      : "bg-surface-card-light dark:bg-surface-card-dark text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Deck Search Bar */}
            <div className="w-full md:w-64 shrink-0">
              <input
                type="text"
                placeholder="Search decks..."
                value={deckSearch}
                onChange={(e) => setDeckSearch(e.target.value)}
                className="w-full text-xs font-semibold p-2 px-3 rounded-xl border border-border-light dark:border-border-dark bg-surface-card-light dark:bg-surface-card-dark outline-none focus:border-primary transition-all placeholder:text-muted-light dark:placeholder:text-muted-dark"
              />
            </div>
          </div>

          {/* Deck Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredDecks.map((deck, idx) => (
              <motion.div
                key={deck.deckId || idx}
                variants={itemVariants}
                whileHover={{
                  scale: 1.03,
                  borderColor: "var(--color-primary)",
                }}
                onClick={() => openDeckModal(deck)}
                className="bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark rounded-2xl p-6 flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary dark:bg-white/5 dark:border-border-dark flex items-center justify-center font-black text-primary dark:text-text-dark text-lg select-none">
                  {deck.icon}
                </div>
                <div>
                  <h4 className="font-extrabold text-[1.05rem] mb-0.5">
                    {deck.title || deck.name}
                  </h4>
                  <p className="text-muted-light dark:text-muted-dark text-[0.8rem]">
                    {deck.subtitle}
                  </p>
                </div>
              </motion.div>
            ))}

            {filteredDecks.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-light dark:text-muted-dark">
                <p className="text-sm font-bold">
                  No decks match "{deckSearch}". Try a different filter!
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* App Download CTA */}
      <section
        className="max-w-5xl mx-auto w-full my-12 sm:my-24 px-6 py-12 sm:py-20 bg-primary text-accent rounded-8 sm:rounded-[36px] flex flex-col items-center text-center gap-6 shadow-xl relative overflow-hidden"
        id="download"
      >
        {/* Radial sheen overlay */}
        <div className="absolute inset-0 bg-radial from-white/15 to-transparent pointer-events-none" />

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-none z-10">
          Ready to Guess Up?
        </h2>
        <p className="font-bold text-base sm:text-xl max-w-xl leading-relaxed z-10">
          Download now and turn your screen into the ultimate charades
          scoreboard!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-xs sm:max-w-none z-10">
          <a
            href={playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent text-white px-6 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-md hover:scale-105 active:scale-95 hover:bg-black transition-all"
          >
            Google Play Store
          </a>
        </div>
      </section>

      <Footer />

      {/* Deck Preview Modal */}
      <DeckModal
        isOpen={isModalOpen}
        deck={selectedDeck}
        onClose={closeDeckModal}
      />
    </div>
  );
};
