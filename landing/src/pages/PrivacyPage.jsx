import React from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import {
  ShieldCheck,
  Lock,
  Cpu,
  Database,
  Trash2,
  Users,
  Mail,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  ArrowUp,
  FileText,
} from "lucide-react";

export const PrivacyPage = () => {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen text-text-light dark:text-text-dark bg-bg-light dark:bg-bg-dark transition-colors duration-300">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-10">
        {/* Document Header Hero */}
        <div className="flex flex-col gap-4 border-b border-border-light dark:border-border-dark pb-8">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Google Play Verification Ready
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 font-bold text-xs">
              Official Legal Policy
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase text-text-light dark:text-text-dark leading-tight">
            Privacy Policy for <span className="text-primary">Guess Up</span>
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-light dark:text-muted-dark">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" />
              <span>
                Developer: <strong>Shrey Nagda</strong>
              </span>
            </div>
            <span>•</span>
            <div>
              Effective Date: <strong>August 31, 2026</strong>
            </div>
            <span>•</span>
            <div>
              Last Updated: <strong>August 31, 2026</strong>
            </div>
          </div>
        </div>

        {/* Play Console Verification Summary Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-text-light dark:text-text-dark">
              Zero PII Data
            </h4>
            <p className="text-xs text-muted-light dark:text-muted-dark leading-relaxed">
              No accounts, emails, phone numbers, or user tracking collected.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-text-light dark:text-text-dark">
              On-Device RAM Sensors
            </h4>
            <p className="text-xs text-muted-light dark:text-muted-dark leading-relaxed">
              Tilt gestures read in RAM only. Never recorded or transmitted.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-text-light dark:text-text-dark">
              TLS Encrypted Sync
            </h4>
            <p className="text-xs text-muted-light dark:text-muted-dark leading-relaxed">
              Secure cloud database used for deck updates via encrypted HTTPS.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-text-light dark:text-text-dark">
              Data Erasure Control
            </h4>
            <p className="text-xs text-muted-light dark:text-muted-dark leading-relaxed">
              Clear local preferences anytime via Android Settings.
            </p>
          </div>
        </div>

        {/* Quick Jump Index Bar */}
        <div className="p-5 rounded-2xl bg-surface-light dark:bg-surface-card-dark border border-border-light dark:border-border-dark flex flex-col gap-3">
          <span className="text-xs font-black uppercase text-primary tracking-wider">
            Quick Table of Contents
          </span>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            {[
              { id: "sec-1", title: "1. Identity & Scope" },
              { id: "sec-2", title: "2. Zero PII Policy" },
              { id: "sec-3", title: "3. Hardware Sensors" },
              { id: "sec-4", title: "4. Cloud Database & Network" },
              { id: "sec-5", title: "5. Local Storage" },
              { id: "sec-6", title: "6. Data Deletion" },
              { id: "sec-7", title: "7. Children's Privacy" },
              { id: "sec-8", title: "8. Contact Info" },
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className="px-3 py-1.5 rounded-xl bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark hover:border-primary text-text-light dark:text-text-dark hover:text-primary transition-all cursor-pointer flex items-center gap-1"
              >
                <span>{sec.title}</span>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>
        </div>

        {/* Legal Policy Content Sections */}
        <div className="flex flex-col gap-10">
          {/* SECTION 1 */}
          <section id="sec-1" className="flex flex-col gap-4 scroll-mt-24">
            <div className="flex items-center gap-3 border-b border-border-light dark:border-border-dark pb-3">
              <h2 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark tracking-tight">
                1. INTRODUCTION & IDENTITY
              </h2>
            </div>
            <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
              Welcome to <strong>Guess Up</strong> ("we," "our," or "us"), an
              interactive party charades mobile application developed and
              operated by <strong>Shrey Nagda</strong>. Guess Up is designed to
              deliver a fun, motion-activated party game experience where
              players place their phone on their forehead while friends shout
              clues.
            </p>
            <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
              This Privacy Policy details our data governance practices,
              hardware permissions, and security measures for the Guess Up
              mobile application on the Google Play Store. We strictly adhere to
              Google Play Developer Program Policies and global data protection
              guidelines.
            </p>
          </section>

          {/* SECTION 2 */}
          <section id="sec-2" className="flex flex-col gap-4 scroll-mt-24">
            <div className="flex items-center gap-3 border-b border-border-light dark:border-border-dark pb-3">
              <h2 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark tracking-tight">
                2. INFORMATION WE DO NOT COLLECT (ZERO PII POLICY)
              </h2>
            </div>
            <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
              Guess Up operates as a standalone offline and online party game.
              We strictly follow a <strong>Zero Personal Information</strong>{" "}
              policy:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-text-light dark:text-text-dark block font-extrabold mb-0.5">
                    No User Accounts
                  </strong>
                  <span className="text-muted-light dark:text-muted-dark">
                    No sign-up, email registration, password creation, or social
                    logins required.
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-text-light dark:text-text-dark block font-extrabold mb-0.5">
                    No PII Storage
                  </strong>
                  <span className="text-muted-light dark:text-muted-dark">
                    We do not collect names, phone numbers, email addresses,
                    physical locations, or contacts.
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-text-light dark:text-text-dark block font-extrabold mb-0.5">
                    No Audio/Video Recording
                  </strong>
                  <span className="text-muted-light dark:text-muted-dark">
                    The App does NOT record audio, access the microphone,
                    capture camera footage, or store media.
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-text-light dark:text-text-dark block font-extrabold mb-0.5">
                    No Advertising Tracking
                  </strong>
                  <span className="text-muted-light dark:text-muted-dark">
                    We do not employ ad tracking SDKs (such as IDFA or AAID
                    tracking) for ad profiling.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3 */}
          <section id="sec-3" className="flex flex-col gap-4 scroll-mt-24">
            <div className="flex items-center gap-3 border-b border-border-light dark:border-border-dark pb-3">
              <h2 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark tracking-tight">
                3. HARDWARE SENSORS & MOTION DATA (ACCELEROMETER)
              </h2>
            </div>
            <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
              Guess Up uses on-device motion hardware to provide hands-free
              gesture control during active game rounds:
            </p>
            <div className="p-5 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex flex-col gap-3">
              <div className="flex items-center gap-2 font-bold text-sm text-text-light dark:text-text-dark">
                <Cpu className="w-5 h-5 text-primary" />
                <span>Real-Time Forehead Tilt Gesture Detection</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-light dark:text-muted-dark leading-relaxed">
                The App accesses the device's built-in Accelerometer and
                Gyroscope hardware strictly in real-time to recognize physical
                tilt gestures (e.g., tilting the device forward/down to mark a
                correct answer, or tilting upward to pass).
              </p>
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-text-light dark:text-text-dark">
                <strong>Crucial Privacy Note:</strong> All sensor data streams
                are processed strictly in volatile device memory (RAM) during
                active gameplay. Motion sensor data is NEVER logged to disk,
                saved locally, or transmitted across the internet to any
                external server.
              </div>
            </div>
          </section>

          {/* SECTION 4 */}
          <section id="sec-4" className="flex flex-col gap-4 scroll-mt-24">
            <div className="flex items-center gap-3 border-b border-border-light dark:border-border-dark pb-3">
              <h2 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark tracking-tight">
                4. NETWORK CONNECTIVITY & CLOUD SERVICES
              </h2>
            </div>
            <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
              Guess Up connects to secure cloud infrastructure to download
              updated trivia word decks, categories, and game parameters:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-2 text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
              <li>
                <strong>Encrypted Communications:</strong> All network
                communication between the mobile app and cloud backend is
                enforced via industry-standard Transport Layer Security
                (TLS/HTTPS).
              </li>
              <li>
                <strong>Technical Metadata:</strong> When requesting content
                updates, standard non-identifying technical headers (such as
                device OS version and IP address) are processed transiently by
                cloud servers to establish secure sockets and maintain server
                health.
              </li>
              <li>
                <strong>Cloud Infrastructure Privacy:</strong> Cloud
                infrastructure is hosted on secure enterprise cloud servers. For
                complete information on enterprise data infrastructure privacy
                practices, please view the{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                >
                  Privacy Policy <ExternalLink className="w-3.5 h-3.5" />
                </a>
                .
              </li>
            </ul>
          </section>

          {/* SECTION 5 */}
          <section id="sec-5" className="flex flex-col gap-4 scroll-mt-24">
            <div className="flex items-center gap-3 border-b border-border-light dark:border-border-dark pb-3">
              <h2 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark tracking-tight">
                5. LOCAL DATA STORAGE & USER PREFERENCES
              </h2>
            </div>
            <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
              To maintain user convenience across game launches, Guess Up saves
              non-personal game configuration settings locally on your physical
              device using native <code>SharedPreferences</code> storage:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-1.5 text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
              <li>Sound effects (SFX) toggle status (ON/OFF)</li>
              <li>Background music toggle status (ON/OFF)</li>
              <li>Haptic vibration feedback status (ON/OFF)</li>
              <li>Forehead tilt sensitivity preference (Low, Normal, High)</li>
              <li>Active theme mode choice (Dark, Light, System)</li>
              <li>Custom game decks created locally by the user</li>
            </ul>
          </section>

          {/* SECTION 6 */}
          <section id="sec-6" className="flex flex-col gap-4 scroll-mt-24">
            <div className="flex items-center gap-3 border-b border-border-light dark:border-border-dark pb-3">
              <h2 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark tracking-tight">
                6. DATA DELETION & ERASURE POLICY
              </h2>
            </div>
            <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
              In full compliance with Google Play’s Data Deletion Policy
              requirements:
            </p>
            <div className="p-5 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex flex-col gap-3">
              <div className="flex items-center gap-2 font-extrabold text-sm text-text-light dark:text-text-dark">
                <Trash2 className="w-5 h-5 text-emerald-500" />
                <span>How to Delete Your Data</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-light dark:text-muted-dark leading-relaxed">
                Because Guess Up does not store user profiles or personal
                information on remote servers, no cloud data deletion request is
                necessary. Users hold 100% control over their local data:
              </p>
              <ol className="list-decimal pl-6 flex flex-col gap-1 text-xs sm:text-sm text-muted-light dark:text-muted-dark leading-relaxed">
                <li>
                  <strong>Clear App Storage:</strong> Open Android Device
                  Settings → Apps → Guess Up → Storage & Cache → Tap "Clear
                  Data" or "Clear Storage". This instantly erases all stored
                  local preferences and custom decks.
                </li>
                <li>
                  <strong>Uninstall App:</strong> Uninstalling the Guess Up
                  application automatically purges all locally cached app files
                  from your device.
                </li>
              </ol>
            </div>
          </section>

          {/* SECTION 7 */}
          <section id="sec-7" className="flex flex-col gap-4 scroll-mt-24">
            <div className="flex items-center gap-3 border-b border-border-light dark:border-border-dark pb-3">
              <h2 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark tracking-tight">
                7. CHILDREN’S PRIVACY (COPPA & GLOBAL COMPLIANCE)
              </h2>
            </div>
            <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
              Guess Up is designed for general family audiences, teenagers, and
              adult party groups. We fully comply with the Children’s Online
              Privacy Protection Act (COPPA) and international child protection
              regulations.
            </p>
            <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
              We do not knowingly collect, request, or process personal data
              from children under the age of 13. If you are a parent or guardian
              and believe that any technical information has been inadvertently
              submitted, please contact us immediately so we can promptly
              address your inquiry.
            </p>
          </section>

          {/* SECTION 8 */}
          <section id="sec-8" className="flex flex-col gap-4 scroll-mt-24">
            <div className="flex items-center gap-3 border-b border-border-light dark:border-border-dark pb-3">
              <h2 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark tracking-tight">
                8. DEVELOPER & CONTACT INFORMATION
              </h2>
            </div>
            <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
              If you have any questions, inquiries, or feedback regarding this
              Privacy Policy or data transparency in Guess Up, please contact
              the developer:
            </p>

            <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase font-black tracking-wider text-primary">
                  Developer & Data Controller
                </span>
                <span className="text-xl font-black text-text-light dark:text-text-dark">
                  Shrey Nagda
                </span>
                <span className="text-xs text-muted-light dark:text-muted-dark font-semibold">
                  Location: India | App: Guess Up Mobile
                </span>
              </div>

              <a
                href="mailto:shreynagda2714@gmail.com"
                className="px-5 py-3 rounded-xl bg-primary text-accent font-black text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer self-start sm:self-auto"
              >
                <Mail className="w-4 h-4" /> shreynagda2714@gmail.com
              </a>
            </div>
          </section>
        </div>

        {/* Back To Top Action */}
        <div className="flex justify-center pt-8 border-t border-border-light dark:border-border-dark">
          <button
            onClick={scrollToTop}
            className="px-5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:border-primary text-xs font-extrabold text-muted-light dark:text-muted-dark hover:text-primary transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowUp className="w-4 h-4 text-primary" /> Back to Top of Page
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};
