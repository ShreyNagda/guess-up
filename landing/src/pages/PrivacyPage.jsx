import React from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const PrivacyPage = () => {
  return (
    <div className="flex flex-col min-h-screen text-text-light dark:text-text-dark bg-transparent">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-8">
        <div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase mb-2">
            PRIVACY POLICY FOR GUESS UP
          </h2>
          <p className="text-sm text-muted-light dark:text-muted-dark font-bold">
            Effective Date: August 23, 2026 | Last Updated: August 23, 2026
          </p>
        </div>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark border-b border-border-light dark:border-border-dark pb-2">
            1. INTRODUCTION
          </h3>
          <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            Welcome to Guess Up ("we," "our," or "us"), developed and maintained
            by Shrey Nagda. We are committed to protecting your privacy while
            delivering a fun and engaging party game experience.
          </p>
          <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            This Privacy Policy explains the types of data handled by the Guess
            Up mobile application ("App"), how technical data is processed, and
            your rights as a user.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark border-b border-border-light dark:border-border-dark pb-2">
            2. INFORMATION WE DO NOT COLLECT
          </h3>
          <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            Guess Up is designed as a standalone trivia and party game.
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            <li>
              <strong>No User Accounts:</strong> We do not require account
              creation, social logins, or personal profile setups.
            </li>
            <li>
              <strong>No Personally Identifiable Information (PII):</strong> We
              do not collect, store, or sell personal data such as your name,
              email address, phone number, physical address, contacts, or
              precise GPS location.
            </li>
            <li>
              <strong>No Audio/Video Recording:</strong> The App does not record
              audio or capture photos/videos during gameplay.
            </li>
            <li>
              <strong>On-Device Sensor Usage:</strong> The App utilizes
              on-device hardware sensors (such as the accelerometer) strictly in
              real-time to detect tilt gestures (tilt down for correct, tilt up
              to pass). This sensor data is processed solely in volatile device
              memory (RAM) and is never recorded, logged, or transmitted off
              your device.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark border-b border-border-light dark:border-border-dark pb-2">
            3. NETWORK CONNECTIVITY & THIRD-PARTY SERVICES (GOOGLE FIREBASE)
          </h3>
          <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            Guess Up connects to Google Firebase cloud infrastructure (Firestore
            / Realtime Database) solely to fetch updated word lists, game decks,
            and category content.
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            <li>
              <strong>Technical & Diagnostics Data:</strong> During content
              fetching, standard non-identifying technical metadata (such as IP
              addresses and device operating system versions) may be processed
              transiently by Google Cloud to establish secure connections and
              ensure service uptime.
            </li>
            <li>
              <strong>No User Profiling:</strong> We do not use Firebase to
              track user behavior, build advertising profiles, or store
              personalized user gameplay data.
            </li>
            <li>
              <strong>Third-Party Policy:</strong> For more details on Google’s
              data handling, please refer to the{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-bold hover:underline"
              >
                Google Privacy Policy
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark border-b border-border-light dark:border-border-dark pb-2">
            4. ADVERTISING AND MONETIZATION
          </h3>
          <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            The current release of Guess Up does not display third-party
            advertisements and does not include ad-tracking SDKs (such as AdMob
            or Unity Ads). If advertising or in-app purchases are integrated in
            future updates, this Privacy Policy will be revised prior to
            deployment.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark border-b border-border-light dark:border-border-dark pb-2">
            5. DATA RETENTION, SECURITY & DELETION
          </h3>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            <li>
              <strong>Data in Transit:</strong> All communication between the
              App and the Firebase backend is encrypted using industry-standard
              Transport Layer Security (TLS/HTTPS).
            </li>
            <li>
              <strong>Data Retention:</strong> Because we do not collect
              personal accounts or identify individual players, we do not store
              or retain personal data on our servers.
            </li>
            <li>
              <strong>Local Cache Deletion:</strong> Any word lists or game
              decks cached locally on your device can be removed at any time by
              clearing the App's storage via your device settings or by
              uninstalling the App.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark border-b border-border-light dark:border-border-dark pb-2">
            6. CHILDREN’S PRIVACY (COPPA & GLOBAL COMPLIANCE)
          </h3>
          <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            Guess Up is intended for general audiences (teens and adults). We do
            not knowingly collect or solicit personal information from children
            under the age of 13. If you believe technical information has been
            inadvertently collected in violation of applicable laws, please
            contact us immediately so we can investigate and remove it.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark border-b border-border-light dark:border-border-dark pb-2">
            7. CHANGES TO THIS PRIVACY POLICY
          </h3>
          <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            We may update this Privacy Policy from time to time to reflect game
            updates or legal requirements. Any modifications will be posted on
            this page with an updated "Last Updated" date.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark border-b border-border-light dark:border-border-dark pb-2">
            8. DEVELOPER & CONTACT INFORMATION
          </h3>
          <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            If you have any questions, feedback, or concerns regarding this
            Privacy Policy or the data practices of Guess Up, please contact:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            <li>
              <strong>Developer:</strong> Shrey Nagda
            </li>
            <li>
              <strong>Support Email:</strong>{" "}
              <a
                href="mailto:shreynagda@gmail.com"
                className="text-primary font-bold hover:underline"
              >
                shreynagda2714@gmail.com
              </a>
            </li>
            <li>
              <strong>Country:</strong> India
            </li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
};
