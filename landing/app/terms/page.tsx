import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import {
  FileText,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  AlertCircle,
  Mail,
  ArrowLeft,
  CheckCircle2,
  HardDrive,
  Scale,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Use | Bujho — The Desi Charades Game",
  description:
    "Bujho Terms of Use. Transparent terms for playing our motion charades party game, forehead tilt safety, and offline play guidelines.",
  keywords: [
    "Bujho Terms of Use",
    "Bujho Game Rules",
    "Party Charades Terms",
    "Motion Charades Safety",
    "Desi Party App Terms",
  ],
};

export default function TermsPage() {
  const highlights = [
    {
      label: "Completely Free",
      value: "Zero Ads / Zero Fees",
      icon: <Sparkles className="w-4 h-4 text-brand-primary" />,
    },
    {
      label: "Safety First",
      value: "Play Responsibly",
      icon: <AlertCircle className="w-4 h-4 text-party-orange" />,
    },
    {
      label: "Offline & Local",
      value: "No Account Required",
      icon: <HardDrive className="w-4 h-4 text-emerald-500" />,
    },
    {
      label: "Fair Usage",
      value: "For Fun With Friends",
      icon: <Users className="w-4 h-4 text-party-cyan" />,
    },
  ];

  const termsSections = [
    {
      id: "acceptance",
      icon: <Scale className="w-6 h-6 text-brand-primary" />,
      title: "1. Acceptance of Terms",
      content:
        "By downloading, installing, or playing Bujho, you agree to these Terms of Use. If you do not agree with any part of these terms, please do not use or install the game.",
    },
    {
      id: "license",
      icon: <CheckCircle2 className="w-6 h-6 text-brand-primary" />,
      title: "2. Personal License to Play",
      content:
        "We grant you a non-exclusive, non-transferable, revocable license to install and play Bujho on your personal Android or iOS device for personal, non-commercial entertainment with family and friends.",
    },
    {
      id: "motion-safety",
      icon: <Smartphone className="w-6 h-6 text-brand-primary" />,
      title: "3. Motion Sensors & Physical Safety Notice",
      content:
        "Bujho utilizes device motion tilt sensors for gameplay (placing the phone on your forehead and tilting to score or pass). You are responsible for holding your phone securely and being mindful of your physical environment, nearby people, and obstacles while playing. Bujho is not liable for device drops, damage, or accidental bumps during energetic gameplay.",
    },
    {
      id: "offline-data",
      icon: <HardDrive className="w-6 h-6 text-brand-primary" />,
      title: "4. Offline Gameplay & Device Storage",
      content:
        "Bujho does not require account creation, login credentials, or constant internet connectivity. Game settings and preferences are stored locally on your device. You may uninstall the game at any time to remove locally stored app data.",
    },
    {
      id: "custom-decks",
      icon: <Users className="w-6 h-6 text-brand-primary" />,
      title: "5. User Conduct & Custom Content",
      content:
        "When using features like custom deck creation or naming teams, you agree not to input content that is unlawful, defamatory, hateful, or abusive. Custom decks created on your device remain stored locally under your own control.",
    },
    {
      id: "ip",
      icon: <ShieldCheck className="w-6 h-6 text-brand-primary" />,
      title: "6. Intellectual Property & Cultural Tribute",
      content:
        "All visual branding, logos, sound effects, animations, and software code of Bujho are protected intellectual property. Cultural trivia terms, film titles, celebrity names, and song references featured in category decks are used in good faith under fair use for social trivia, parody, and entertainment purposes.",
    },
    {
      id: "liability",
      icon: <AlertCircle className="w-6 h-6 text-brand-primary" />,
      title: "7. Disclaimer of Warranties",
      content:
        "Bujho is provided 'AS IS' and 'AS AVAILABLE' without warranties of any kind. While we strive to deliver a smooth, bug-free, 60fps experience, we do not warrant that gameplay will be uninterrupted on all hardware configurations.",
    },
    {
      id: "contact",
      icon: <Mail className="w-6 h-6 text-brand-primary" />,
      title: "8. Questions & Contact",
      content:
        "If you have any questions or feedback regarding these Terms of Use, please reach out to us directly:",
      email: "shreynagda2714@gmail.com",
    },
  ];

  return (
    <main className="min-h-screen flex flex-col justify-between transition-colors duration-300 bg-brand-bg text-brand-text">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full grow">
        {/* Back Link Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-brand-muted hover:text-brand-text transition-colors mb-6 group"
          id="terms-back-home-link"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Hero Header Banner */}
        <div className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-brand-surface backdrop-blur-xl border border-brand-border shadow-xl mb-8 text-center">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-brand-primary via-brand-primary-hover to-brand-primary" />

          {/* Squircle Icon Badge */}
          <div className="inline-flex items-center justify-center p-4 mb-4 rounded-2xl bg-brand-primary/15 border-2 border-brand-primary/30 shadow-md">
            <FileText className="w-10 h-10 text-brand-primary" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-lilita font-black text-brand-text tracking-tight mb-2 uppercase">
            Terms of Use
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-brand-muted uppercase tracking-widest mb-4">
            Last updated: August 2026
          </p>

          <p className="text-sm sm:text-base text-brand-text font-medium max-w-2xl mx-auto leading-relaxed">
            Simple, transparent guidelines for playing Bujho with your squad,
            understanding forehead tilt safety, and enjoying offline games.
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-brand-surface border border-brand-border backdrop-blur-md flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                  {h.label}
                </span>
                {h.icon}
              </div>
              <span className="text-sm font-extrabold text-brand-text">
                {h.value}
              </span>
            </div>
          ))}
        </div>

        {/* Terms Sections */}
        <div className="space-y-4">
          {termsSections.map((section) => (
            <article
              key={section.id}
              id={section.id}
              className="p-6 rounded-2xl bg-brand-surface backdrop-blur-md border border-brand-border shadow-xs hover:border-brand-primary/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
                  {section.icon}
                </div>
                <h2 className="text-base sm:text-lg font-black text-brand-text tracking-tight">
                  {section.title}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-brand-muted font-medium leading-relaxed">
                {section.content}
              </p>
              {section.email && (
                <div className="mt-3 pt-3 border-t border-brand-border/60 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-brand-primary">
                  <Mail className="w-4 h-4" />
                  <a
                    href={`mailto:${section.email}`}
                    className="hover:underline"
                  >
                    {section.email}
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Bottom Brand Badge */}
        <div className="mt-12 text-center">
          <span className="text-xs font-extrabold text-brand-muted uppercase tracking-widest">
            Bujho • Party Charades
          </span>
        </div>
      </div>

      <Footer />
    </main>
  );
}
