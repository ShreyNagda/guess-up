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
  title: "Bujho - The Desi Charades Game | Ad-Free Party Game",
  description:
    "The desi charades game. Phone on forehead. Friends act out clues. Tilt to score. 50+ desi decks. Ad-free. Offline. Free on Android.",
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
    title: "Bujho - The Desi Charades Game",
    description:
      "Phone on forehead. Friends screaming clues. Tilt to score. Zero ads. Zero Wi-Fi. 50+ desi decks.",
    url: siteUrl,
    siteName: "Bujho",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        alt: "Bujho - The Desi Charades Game",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bujho - The Desi Charades Game",
    description: "Phone on forehead. Friends screaming clues. Tilt to score.",
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
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

const jsonLdApp = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "Bujho",
  alternateName: "Bujho - The Desi Charades Game",
  description:
    "The desi charades party game. Phone on forehead, friends act out clues, tilt to score.",
  applicationCategory: "GameApplication",
  operatingSystem: "Android",
  offers: { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
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

