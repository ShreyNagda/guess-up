import React, { useState } from "react";
import { motion } from "motion/react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PhoneMockup } from "../components/PhoneMockup";
import { DeckModal } from "../components/DeckModal";

const FEATURES = [
  {
    icon: "IN",
    title: "Desi Pop-Culture Decks",
    desc: "Curated categories spanning Bollywood movies, Cricket legends, Indian delicacies (Samosa, Chai, Biryani), street-food classics, and regional festivals."
  },
  {
    icon: "FH",
    title: "Forehead Game Design",
    desc: "A classic heads-up party layout. Slide the phone onto your forehead, orient it horizontally, and let your friends guide you to the answers."
  },
  {
    icon: "TC",
    title: "Intuitive Tilt Controls",
    desc: "Built-in motion sensing. Tilt your screen downwards to mark a guess as Correct (+1 Point) or tilt it upwards to Pass. Simple and seamless!"
  },
  {
    icon: "MX",
    title: "Mix & Match Decks",
    desc: "Why limit yourself? Select multiple decks at the same time to create a randomized custom game session that keeps everyone guessing."
  },
  {
    icon: "CD",
    title: "Create Custom Decks",
    desc: "Add your own personal inside jokes, names of friends, or specific categories directly in settings. Save locally and launch immediately."
  },
  {
    icon: "OC",
    title: "Offline Cache & Play",
    desc: "Bad network? No worries. Play anytime with automatic Firestore content caching. Take Guess Up on roadtrips, flights, or remote getaways."
  }
];

const STEPS = [
  {
    num: 1,
    img: "/images/onboarding2.png",
    title: "1. Select Decks & Align",
    desc: "Pick one or more theme decks. Select your timer duration, then hold the phone up to your forehead facing your friends."
  },
  {
    num: 2,
    img: "/images/correct_mockup.png",
    title: "2. Got it Right? Tilt Down",
    desc: "If you guess the word based on clues, tilt the screen down toward the ground to score 1 point and load the next word."
  },
  {
    num: 3,
    img: "/images/pass_mockup.png",
    title: "3. Unsure? Tilt Up",
    desc: "If you guess a word that is too difficult or you're stuck, tilt the screen upwards to pass. No penalty is given, saving time!"
  }
];

const DECKS = [
  {
    deckId: "cricket",
    icon: "CF",
    title: "Cricket Fever",
    subtitle: "100+ Player names, events, & rules",
    words: "Cricket, Sachin Tendulkar, Virat Kohli, MS Dhoni, Boundary, Wicket, Cover Drive, Sixer, Lagaan, IPL"
  },
  {
    deckId: "bollywood",
    icon: "BH",
    title: "Bollywood Hitlist",
    subtitle: "Blockbusters, superstars, & movie songs",
    words: "Bollywood, Shah Rukh Khan, Amitabh Bachchan, Sholay, DDLJ, Popcorn, Intermission, Oscar, Item Number, Action Hero"
  },
  {
    deckId: "food",
    icon: "DC",
    title: "Desi Cravings",
    subtitle: "Mouth-watering snacks & local cuisines",
    words: "Samosa, Biryani, Chai, Dosa, Paneer, Roti, Lassi, Mango, Curry, Masala, Golgappa, Gulab Jamun"
  },
  {
    deckId: "places",
    icon: "II",
    title: "Incredible India",
    subtitle: "Historic places, landmarks, & heritage sites",
    words: "Taj Mahal, Lotus Temple, Gateway of India, Mumbai Local, Kolkata Tram, Rickshaw, Monsoon, Himalayas, Goa Beach"
  }
];

export const LandingPage = () => {
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
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
            Put it on your <span className="block text-primary dark:text-text-dark drop-shadow-[4px_4px_0px_var(--color-accent)] dark:drop-shadow-[4px_4px_0px_var(--color-primary)]">FOREHEAD!</span>
          </h2>
          <p className="text-lg md:text-xl font-extrabold text-primary-dark dark:text-text-dark">
            The Ultimate Charades & Party Game
          </p>
          <p className="text-muted-light dark:text-muted-dark leading-relaxed max-w-xl text-base">
            Guess Up brings endless laughter to your house parties, get-togethers, and family nights! Designed specifically for Indian youths, guess words from Bollywood, Cricket, Food, Culture, and more while your friends mime, shout, and enact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a href="#download" className="btn bg-primary text-accent text-center justify-center font-extrabold px-8 py-3.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md">
              Play Now
            </a>
            <a href="#features" className="border-2 border-primary dark:border-border-dark bg-transparent text-text-light dark:text-text-dark text-center justify-center font-extrabold px-8 py-3.5 rounded-xl hover:bg-primary hover:text-accent dark:hover:bg-white/5 transition-all shadow-none">
              Learn More
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <PhoneMockup />
        </motion.div>
      </section>

      {/* Key Features Grid */}
      <section className="bg-surface-card-light/50 dark:bg-[#1e1e1e]/50 border-y border-border-light dark:border-border-dark py-16 md:py-24 px-4 md:px-8 backdrop-blur-sm transition-colors duration-300" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Packed with Energy</h2>
            <p className="text-muted-light dark:text-muted-dark text-base md:text-lg">
              Features crafted to ensure your next group hangout is filled with pure chaos and fun.
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
                <div className="w-[52px] h-[52px] rounded-2xl bg-primary/10 border-2.5 border-primary dark:bg-white/5 dark:border-border-dark flex items-center justify-center font-black text-primary dark:text-text-dark text-lg select-none">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-light dark:text-muted-dark text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How to Play Steps */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24" id="how-to-play">
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">How To Play</h2>
          <p className="text-muted-light dark:text-muted-dark text-base md:text-lg">
            Easy rules to learn in less than 30 seconds. Perfect for players of all ages!
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
              <div className="relative w-full h-[150px] bg-surface-light dark:bg-surface-dark border-3 border-border-light dark:border-border-dark rounded-2xl overflow-hidden shadow-md flex items-center justify-center">
                <img className="w-full h-full object-cover" src={step.img} alt={step.title} />
                <span className="w-9 h-9 rounded-full bg-primary text-accent font-black text-sm flex items-center justify-center absolute top-2 left-2 shadow-md">
                  {step.num}
                </span>
              </div>
              <h3 className="text-lg font-black">{step.title}</h3>
              <p className="text-muted-light dark:text-muted-dark text-sm leading-relaxed max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Explore Decks Showcase */}
      <section className="bg-surface-card-light/30 dark:bg-[#1e1e1e]/20 border-t border-border-light dark:border-border-dark py-16 md:py-24 px-4 md:px-8 backdrop-blur-sm transition-colors duration-300" id="decks">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Explore Word Decks</h2>
            <p className="text-muted-light dark:text-muted-dark text-base md:text-lg">
              Click a deck to preview a sample of the cards you'll be guessing in the game!
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {DECKS.map((deck, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ scale: 1.03, borderColor: "var(--color-primary)" }}
                onClick={() => openDeckModal(deck)}
                className="bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark rounded-2xl p-6 flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary dark:bg-white/5 dark:border-border-dark flex items-center justify-center font-black text-primary dark:text-text-dark text-lg select-none">
                  {deck.icon}
                </div>
                <div>
                  <h4 className="font-extrabold text-[1.05rem] mb-0.5">{deck.title}</h4>
                  <p className="text-muted-light dark:text-muted-dark text-[0.8rem]">{deck.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* App Download CTA */}
      <section className="max-w-5xl mx-auto w-full my-12 sm:my-24 px-6 py-12 sm:py-20 bg-primary text-accent rounded-[32px] sm:rounded-[36px] flex flex-col items-center text-center gap-6 shadow-xl relative overflow-hidden" id="download">
        {/* Radial sheen overlay */}
        <div className="absolute inset-0 bg-radial from-white/15 to-transparent pointer-events-none" />
        
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-none z-10">Ready to Guess Up?</h2>
        <p className="font-bold text-base sm:text-xl max-w-xl leading-relaxed z-10">
          Download now and turn your screen into the ultimate charades scoreboard!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-xs sm:max-w-none z-10">
          <a href="#" className="bg-accent text-white px-6 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-md hover:scale-105 active:scale-95 hover:bg-black transition-all">
            Google Play Store
          </a>
          <a href="#" className="bg-accent text-white px-6 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-md hover:scale-105 active:scale-95 hover:bg-black transition-all">
            Apple App Store
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
