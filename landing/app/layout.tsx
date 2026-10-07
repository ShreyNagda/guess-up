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
  title: "Bujho — The Desi Charades Game",
  description:
    "Phone on forehead. Friends screaming. Tilt to score. Get early access before public launch.",
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
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Bujho — The Desi Charades Game",
    description:
      "Phone on forehead. Friends screaming. Tilt to score. Get early access before public launch.",
    url: SITE_URL,
    siteName: "Bujho",
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Bujho — The Desi Charades Game | Get Early Access",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bujho — The Desi Charades Game",
    description:
      "Phone on forehead. Friends screaming. Tilt to score. Get early access before public launch.",
    images: [`${SITE_URL}/opengraph-image`],
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
    { media: "(prefers-color-scheme: dark)", color: "#0D0D12" },
  ],
};

const jsonLdApp = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "Bujho",
  alternateName: "Bujho — The Desi Charades Game",
  description:
    "The desi charades party game. Phone on forehead, friends act out clues, tilt to score.",
  applicationCategory: "GameApplication",
  operatingSystem: "Android",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
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
