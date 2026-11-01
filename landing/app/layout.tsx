import type { Metadata, Viewport } from "next";
import { Manrope, Lilita_One } from "next/font/google";
import "./globals.css";
import { ArcadeBackground } from "@/components/ui/ArcadeBackground";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SITE_URL } from "@/lib/config";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const lilitaOne = Lilita_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lilita",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Bujho – The Desi Charades & Offline Party Game | Android Party Game",
  description:
    "Bujho is India's favorite desi charades and offline party game. Put phone on forehead, guess Bollywood movies, cricket, food & desi memes, and tilt to score. 100% free, works offline, no ads.",
  applicationName: "Bujho",
  keywords: [
    "Bujho",
    "Bujho game",
    "Bujho app",
    "desi charades",
    "desi charades game",
    "desi charades app",
    "offline party game",
    "offline party game android",
    "headbands game india",
    "heads up hindi",
    "bollywood charades app",
    "indian party games",
    "charades with friends offline",
    "free offline party games",
    "bujho early access",
    "tilt charades game",
    "party games for hostel and house party",
  ],
  authors: [{ name: "Shrey Nagda" }],
  creator: "Shrey Nagda",
  publisher: "Bujho",
  icons: {
    icon: "/images/bujho-splash-icon.png",
    shortcut: "/images/bujho-splash-icon.png",
    apple: "/images/bujho-splash-icon.png",
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Bujho – The Desi Charades & Offline Party Game",
    description:
      "Phone on forehead. Friends screaming clues. Tilt to score. The ultimate 100% ad-free offline desi charades party game for Android.",
    url: SITE_URL,
    siteName: "Bujho",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Bujho – The Desi Charades & Offline Party Game",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bujho – The Desi Charades & Offline Party Game",
    description:
      "Phone on forehead. Friends screaming clues. Tilt to score. The ultimate 100% ad-free offline desi charades party game for Android.",
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F6FC" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0D12" },
  ],
};

// Rich Structured Data (JSON-LD) for Google Search
const jsonLdApp = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "Bujho",
  alternateName: [
    "Bujho - The Desi Charades Game",
    "Bujho Offline Party Game",
    "Bujho Desi Charades App",
  ],
  description:
    "The desi charades game, built by an indie dev. Phone on forehead, friends act out clues, tilt to score. 8 hand-crafted desi decks. 100% free, works offline, no ads.",
  applicationCategory: "GameApplication",
  operatingSystem: "Android 8.0 and above",
  genre: ["Party Game", "Word Game", "Charades", "Multiplayer Game"],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  featureList: [
    "100% Offline Game",
    "Zero Ads",
    "No Signups Required",
    "8 Curated Desi Decks",
    "Tilt To Score Sensor Controls",
    "2-Team Party Mode",
    "Custom Scorecards",
  ],
  author: {
    "@type": "Person",
    name: "Shrey Nagda",
  },
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Bujho",
  alternateName: "Bujho - The Desi Charades & Offline Party Game",
  url: SITE_URL,
};

const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Bujho?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bujho is a desi charades and offline party game for Android. You place your phone on your forehead while your friends act out clues from Bollywood, cricket, Indian food, and memes, and you tilt down for correct (+1) or tilt up to pass.",
      },
    },
    {
      "@type": "Question",
      name: "Does Bujho work offline without internet?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Bujho is 100% offline. Once installed, it requires zero Wi-Fi or mobile data, making it ideal for house parties, road trips, hostel rooms, and flights.",
      },
    },
    {
      "@type": "Question",
      name: "Is Bujho free and does it have ads?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bujho is completely free with zero ads, zero video popups, and no paywalled decks.",
      },
    },
    {
      "@type": "Question",
      name: "What Android version do I need to play Bujho?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bujho runs on Android 8.0 and above. Any Android phone with tilt sensors (accelerometer) runs the game smoothly at 60 FPS.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${lilitaOne.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-300 font-sans selection:bg-brand-primary selection:text-brand-text relative">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <ArcadeBackground />
          {children}
        </ThemeProvider>
        {/* Structured Data for Google Ranking */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      </body>
    </html>
  );
}
