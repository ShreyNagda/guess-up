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
            Privacy Policy & Data Safety
          </h2>
          <p className="text-sm text-muted-light dark:text-muted-dark font-bold">
            Last Updated: July 8, 2026
          </p>
        </div>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark border-b border-border-light dark:border-border-dark pb-2">
            1. Introduction
          </h3>
          <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            Welcome to <strong>Guess Up</strong> ("we", "our", "us"). We are committed to
            protecting your privacy. This Privacy Policy explains our data
            collection and handling practices when you install and play the Guess
            Up mobile application (the "App") on Android devices.
          </p>
          <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            Guess Up is a simple party game designed for family and group
            gatherings. By using our App, you agree to the terms outlined in this
            policy.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark border-b border-border-light dark:border-border-dark pb-2">
            2. Data Collection (Data Safety)
          </h3>
          <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            We believe in complete data transparency and user safety. <strong>Guess Up
            does not collect, transmit, store, or share any personal identifier or
            user data.</strong> You can play the game without creating any account,
            registering, or logging in.
          </p>

          <div className="overflow-x-auto border border-border-light dark:border-border-dark rounded-2xl shadow-sm">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-primary/10 dark:bg-white/5 border-b border-border-light dark:border-border-dark text-primary dark:text-text-dark font-black">
                  <th className="p-4 whitespace-nowrap">Data Category</th>
                  <th className="p-4 whitespace-nowrap">Collected?</th>
                  <th className="p-4 whitespace-nowrap">Purpose / Treatment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark text-muted-light dark:text-muted-dark">
                <tr>
                  <td className="p-4 font-semibold text-text-light dark:text-text-dark">Personal Identifiers (Name, Email, etc.)</td>
                  <td className="p-4 font-bold text-red-600 dark:text-red-400">No</td>
                  <td className="p-4">Not collected or required.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-text-light dark:text-text-dark">Device IDs & Analytics</td>
                  <td className="p-4 font-bold text-red-600 dark:text-red-400">No</td>
                  <td className="p-4">We do not track device footprints or crash statistics to a central server.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-text-light dark:text-text-dark">Custom Decks / Custom Words</td>
                  <td className="p-4 font-bold text-green-600 dark:text-green-400">Local Only</td>
                  <td className="p-4">Stored locally on your device storage using Android SharedPreferences. Never uploaded.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-text-light dark:text-text-dark">Firestore Game Decks</td>
                  <td className="p-4 font-bold text-blue-600 dark:text-blue-400">Read-Only</td>
                  <td className="p-4">Decks are downloaded from Google Cloud Firestore. No user metadata is transmitted.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark border-b border-border-light dark:border-border-dark pb-2">
            3. Device Permissions
          </h3>
          <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            To provide a fully interactive game experience, Guess Up requests
            access to specific hardware components on your device. Here is why we
            need them:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            <li>
              <strong>Device Sensors / Accelerometer:</strong> Used to recognize
              the orientation and tilt angle of your phone (tilting down for
              Correct, tilting up to Pass). No motion history is recorded or
              stored.
            </li>
            <li>
              <strong>Vibration Control:</strong> Used to trigger haptic feedback
              buzzes when answers are marked correct, passed, or when the round
              ends.
            </li>
            <li>
              <strong>Network Connectivity:</strong> Used to verify if you have an
              active internet connection to download updated word decks from our
              read-only database. If offline, the app switches to local cached
              files seamlessly.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark border-b border-border-light dark:border-border-dark pb-2">
            4. Children's Privacy (COPPA Compliance)
          </h3>
          <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            Our App is suitable for family gameplay and contains content
            appropriate for all ages. We do not knowingly collect or solicit any
            personal information from children under the age of 13. Since we do
            not collect any personal data whatsoever, we comply fully with GDPR
            and the Children's Online Privacy Protection Act (COPPA) guidelines.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark border-b border-border-light dark:border-border-dark pb-2">
            5. Updates to This Policy
          </h3>
          <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            We may update our Privacy Policy from time to time to align with App
            Store updates or feature expansions. We recommend checking this page
            periodically. Any modifications will be indicated by the "Last
            Updated" timestamp at the top of the policy.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-primary dark:text-text-dark border-b border-border-light dark:border-border-dark pb-2">
            6. Contact & Support
          </h3>
          <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            If you have any questions or feedback regarding this Privacy Policy or
            the security of our application, feel free to contact us:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
            <li>
              Email:{" "}
              <a
                href="mailto:support@guessup.com"
                className="text-primary font-bold hover:underline"
              >
                support@guessup.com
              </a>
            </li>
            <li>Developer: Shrey Nagda</li>
            <li>
              Website:{" "}
              <a href="/" className="text-primary font-bold hover:underline">
                guessup.com
              </a>
            </li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
};
