import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import {
  ShieldCheck,
  UserX,
  Smartphone,
  HardDrive,
  Cloud,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Lock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Bujho - Motion Charades & Party Game",
  description:
    "Bujho Privacy Policy. We collect zero personal data, process motion sensors strictly on-device, and require no account registration for party charades.",
  keywords: [
    "Bujho Privacy Policy",
    "Bujho Game",
    "No Data Collection Party App",
    "Motion Charades Privacy",
    "Privacy First Party Game",
  ],
};

export default function PrivacyPage() {
  const policySections = [
    {
      id: "no-data",
      icon: <UserX className="w-6 h-6 text-brand-primary" />,
      title: "1. No Account or Personal Data Collection",
      content:
        "Bujho does not require any registration, email address, phone number, or personal user account. We do not track, collect, sell, or rent your personal identifiable information to third parties.",
    },
    {
      id: "motion-sensors",
      icon: <Smartphone className="w-6 h-6 text-brand-primary" />,
      title: "2. Motion Sensors & Forehead Tilt",
      content:
        "The game utilizes your device's built-in accelerometer and gyroscope strictly for real-time forehead tilt controls (tilting down for Correct, tilting up to Pass). Sensor data is computed locally on your device and is never stored or transmitted anywhere.",
    },
    {
      id: "local-storage",
      icon: <HardDrive className="w-6 h-6 text-brand-primary" />,
      title: "3. Local Storage Preferences",
      content:
        "Game settings (such as music, sound effects, haptics, tilt sensitivity, and custom deck data) are stored locally on your device using encrypted key-value storage. Clearing app data or uninstalling the app will clear these local preferences.",
    },
    {
      id: "cloud-categories",
      icon: <Cloud className="w-6 h-6 text-brand-primary" />,
      title: "4. Cloud Categories & Data Access",
      content:
        "Pre-built game categories are retrieved anonymously from secure cloud storage. No telemetry or user device identifiers are attached to these category fetch requests.",
    },
    {
      id: "contact-us",
      icon: <Mail className="w-6 h-6 text-brand-primary" />,
      title: "5. Contact Us",
      content:
        "If you have any questions or feedback regarding this Privacy Policy, feel free to reach out at:",
      email: "shreynagda2714@gmail.com",
    },
  ];

  const highlights = [
    {
      label: "Personal Data Collected",
      value: "None (0 Bytes)",
      icon: <Lock className="w-4 h-4 text-emerald-500" />,
    },
    {
      label: "Account Registration",
      value: "Not Required",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    },
    {
      label: "Motion Sensor Data",
      value: "100% On-Device",
      icon: <Smartphone className="w-4 h-4 text-amber-500" />,
    },
    {
      label: "Third-Party Ad Tracking",
      value: "Zero Ads / Zero Trackers",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
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
          id="privacy-back-home-link"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Hero Header Banner */}
        <div className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-brand-surface backdrop-blur-xl border border-brand-border shadow-xl mb-8 text-center">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-brand-primary via-brand-primary-hover to-brand-primary" />

          {/* Squircle Icon Badge */}
          <div className="inline-flex items-center justify-center p-4 mb-4 rounded-2xl bg-brand-primary/15 border-2 border-brand-primary/30 shadow-md">
            <ShieldCheck className="w-10 h-10 text-brand-primary" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-brand-text tracking-tight mb-2 uppercase">
            Your Privacy Matters
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-brand-muted uppercase tracking-widest mb-4">
            Last updated: August 2026
          </p>

          <p className="text-sm sm:text-base text-brand-text font-medium max-w-2xl mx-auto leading-relaxed">
            Bujho is designed to bring people together for fun party games
            without compromising your privacy or personal data.
          </p>
        </div>

        {/* Privacy Highlights Grid */}
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

        {/* Policy Sections */}
        <div className="space-y-4">
          {policySections.map((section) => (
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
