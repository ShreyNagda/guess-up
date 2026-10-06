import type { Metadata, Viewport } from "next";
import { Manrope, Lilita_One } from "next/font/google";
import "./globals.css";
import { ArcadeBackground } from "@/components/ui/ArcadeBackground";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bujho.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bujho - The Desi Charades Game | Ad-Free Party Game for India",
    template: "%s | Bujho - The Desi Charades Game",
  },
  description:
    "Bujho is the ultimate desi charades game for your next party! Act out Bollywood, cricket & street food clues. 100% ad-free, offline & hilariously chaotic. Get it now!",
  applicationName: "Bujho",
  keywords: [
    "Bujho",
    "The Desi Charades Game",
    "Desi Charades App",
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
    title: "Bujho - The Desi Charades Game | Ad-Free Party Game for India",
    description:
      "Bujho is the ultimate desi charades game for your next party! Act out Bollywood, cricket & street food clues. 100% ad-free, offline & hilariously chaotic. Get it now!",
    url: siteUrl,
    siteName: "Bujho",
    images: [
      {
        url: "/images/bujho-icon.png",
        width: 512,
        height: 512,
        alt: "Bujho The Desi Charades Game Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bujho - The Desi Charades Game | Ad-Free Party Game for India",
    description:
      "Bujho is the ultimate desi charades game for your next party! Act out Bollywood, cricket & street food clues. 100% ad-free, offline & hilariously chaotic. Get it now!",
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
    <html
      lang="en"
      className={`${manrope.variable} ${lilitaOne.variable}`}
      suppressHydrationWarning
    >
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
