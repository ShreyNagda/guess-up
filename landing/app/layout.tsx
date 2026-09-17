import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ArcadeBackground } from "@/components/ui/ArcadeBackground";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bujho.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bujho - #1 Ad-Free Desi Party Charades Mobile Game",
    template: "%s | Bujho Party Charades",
  },
  description:
    "Flip your phone to your forehead! Let your friends enact wild clues, tilt down for correct & up to pass. Handcrafted Desi pop-culture decks, dual tilt & tap control modes, and 100% ad-free offline gameplay for Indian party nights.",
  applicationName: "Bujho",
  keywords: [
    "Bujho",
    "Bujho Game",
    "Bujho App",
    "Party Charades India",
    "Desi Party Game",
    "Bollywood Charades App",
    "Headbands Game India",
    "Ad Free Charades",
    "Offline Party Game",
    "Android Motion Charades",
    "Cricket Trivia Game",
  ],
  authors: [{ name: "Shrey Nagda" }],
  creator: "Bujho",
  publisher: "Bujho",
  icons: {
    icon: "/images/bujho-splash-icon.png",
    shortcut: "/images/bujho-splash-icon.png",
    apple: "/images/bujho-splash-icon.png",
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Bujho - #1 Ad-Free Desi Party Charades Mobile Game",
    description:
      "Put your phone on your forehead, let your crew enact wild clues, and nod down to score! Handcrafted for Indian youth, house parties, and hostel hangouts.",
    url: siteUrl,
    siteName: "Bujho",
    images: [
      {
        url: "/images/bujho-icon.png",
        width: 512,
        height: 512,
        alt: "Bujho Party Charades Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bujho - #1 Ad-Free Desi Party Charades Game",
    description:
      "Flip your phone on your forehead! 100% ad-free offline charades built for Indian house parties.",
    images: ["/images/bujho-icon.png"],
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
    { media: "(prefers-color-scheme: dark)", color: "#0E0C1C" },
  ],
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Bujho",
  url: siteUrl,
  logo: `${siteUrl}/images/bujho-icon.png`,
  sameAs: [],
};

const jsonLdApp = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "Bujho",
  operatingSystem: "Android, iOS",
  applicationCategory: "GameApplication",
  genre: "Party Game / Charades / Trivia",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  description:
    "The #1 ad-free party charades game for India with motion tilt sensing and custom Desi pop-culture decks.",
  image: `${siteUrl}/images/bujho-icon.png`,
};

const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Bujho completely free of ads?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Bujho is built for 100% uninterrupted party gameplay with zero ad popups.",
      },
    },
    {
      "@type": "Question",
      name: "How does motion tilt detection work on mobile?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bujho utilizes your phone's built-in accelerometer. Tilting down registers a Correct point (+1) and tilting up passes to the next card.",
      },
    },
    {
      "@type": "Question",
      name: "Can I play Bujho offline without Wi-Fi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! All built-in decks and custom decks work 100% offline.",
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
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      </head>
      <body className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-300 font-sans selection:bg-brand-primary selection:text-brand-text relative">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <ArcadeBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
