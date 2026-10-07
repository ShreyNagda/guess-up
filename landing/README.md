# Bujho — Marketing Landing & Founders Circle Funnel

A single, high-conversion landing page for **Bujho** (The Desi Charades Game) serving two simultaneous objectives:

- **Job A (Marketing):** Sell Bujho as a real, culturally vibrant, ad-free party game. Build hype, urgency, and social proof.
- **Job B (Funnel):** Convert visitors into Google Play closed testers who remain opted in for 14 continuous days—**without ever exposing testing, beta, or QA vocabulary in user-facing copy**.

---

## ⚙️ Where to Set Key Constants

All key URLs, founder quotas, and form endpoints are centralized in [`landing/lib/config.ts`](file:///c:/Users/shrey/Projects/guess_up/landing/lib/config.ts):

| Constant                | Description                                               | Default / Source                                                                          |
| :---------------------- | :-------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| `GOOGLE_GROUP_URL`      | Google Group (framed as early-access Founders List)       | `https://groups.google.com/g/bujho-testers` (or `NEXT_PUBLIC_GOOGLE_GROUP_URL`)           |
| `WHATSAPP_GROUP_URL`    | Private WhatsApp Community for Founders                   | `https://chat.whatsapp.com/G4vQY1aFkP1BujhoTesters` (or `NEXT_PUBLIC_WHATSAPP_GROUP_URL`) |
| `PLAY_STORE_INTENT_URL` | Android `intent://` URL that launches Play Store directly | `intent://details?id=com.shreynagda.guess_up#Intent;...`                                  |
| `PLAY_STORE_WEB_URL`    | Play Store web opt-in testing page                        | `https://play.google.com/apps/testing/com.shreynagda.guess_up`                            |
| `SHORT_LINK_URL`        | Clean short link for desktop users scanning or typing     | `bujho.vercel.app/get` (server redirects to Play Store)                                   |
| `FORMSPREE_ENDPOINT`    | Formspree endpoint for the iOS TestFlight waitlist        | `https://formspree.io/f/mqakvjle` (or `NEXT_PUBLIC_FORMSPREE_ENDPOINT`)                   |
| `FOUNDER_COUNT`         | Live player counter displayed in Navbar and Hero          | `47` (manually updated integer)                                                           |
| `SITE_URL`              | Base production URL for OpenGraph and link sharing        | `https://bujho.vercel.app` (or `NEXT_PUBLIC_SITE_URL`)                                    |

---

## 🧪 How to Test the Popup Auto-Advance Flow Locally

1. **Start the local server:**
   ```bash
   cd landing
   pnpm dev
   ```
2. Open `http://localhost:3000` in your browser.
3. Tap **"Get Early Access"** in the Hero or Navbar to smoothly scroll to `#early-access`.
4. **Step 1 — Join the Founders List:**
   - Tap **"Join the Founders List"**.
   - A centered popup (`600x700`) opens loading Google Groups.
   - The page in the background polls `popup.closed` every 500ms.
5. **Auto-Advance to Step 2:**
   - Close the popup window.
   - Within 500ms, the landing page detects the popup closure, displays a toast:
     _"You're on the list. Next step unlocked 👇"_,
     and **automatically advances the 3-dot stepper to Step 2**.
6. **Step 2 — Download the Game:**
   - On Android devices, clicking **"Open Play Store"** launches Google Play directly via `intent://`.
   - On desktop, an SVG QR code for `https://bujho.vercel.app/get` is rendered alongside the short link.
   - Check the checkbox: _"I've tapped 'Become a tester' on Play Store"_.
   - Checking this box immediately unlocks **Step 3**.
7. **Step 3 — Join the Founding Players Group:**
   - Shows the button to join the private Founders WhatsApp community.
   - Highlights the Founding Player badge and early deck drops.
8. **Persistence:**
   - Reload the page. Progress is saved in `localStorage.getItem("bujho_early_access_progress")` and persists across page refreshes.
   - To reset, click **"Start over"** in the top right of the section card.

---

## 📈 How to Update `FOUNDER_COUNT` Weekly

1. Open [`landing/lib/config.ts`](file:///c:/Users/shrey/Projects/guess_up/landing/lib/config.ts).
2. Update the `FOUNDER_COUNT` number:
   ```typescript
   export const FOUNDER_COUNT = 52; // Update weekly to current verified group count
   ```
3. Save, commit, and push:
   ```bash
   git commit -am "chore: update founder count to 52"
   git push
   ```
   Both the Navbar live pill (`🔥 52 players in the Founders Circle`) and the Hero trust line (`Free · No ads · Works offline · 52 founding players already in`) will update automatically.

---

## 💬 How to Replace Placeholder Testimonials Before Deploy

1. Open [`landing/components/landing/SocialProofSection.tsx`](file:///c:/Users/shrey/Projects/guess_up/landing/components/landing/SocialProofSection.tsx).
2. Locate the comment `{/* REPLACE BEFORE DEPLOY */}` at line 9.
3. Replace the placeholder quotes with real quotes from your early players:
   ```typescript
   const testimonials = [
     {
       quote: "Finally a charades app that knows what DDLJ is.",
       author: "Aarav",
       city: "Mumbai",
       color: "from-party-pink/20 to-party-orange/20 border-party-pink/30",
     },
     {
       quote: "Our hostel floor hasn't been this loud since Diwali.",
       author: "Priya",
       city: "Pune",
       color: "from-party-orange/20 to-party-yellow/20 border-party-orange/30",
     },
     {
       quote: "Went through 3 decks in one night. Zero ads. Unreal.",
       author: "Rohan",
       city: "Bangalore",
       color: "from-[#FFD600]/20 to-party-cyan/20 border-[#FFD600]/30",
     },
   ];
   ```

---

## 📱 WhatsApp Link-Preview Test Checklist

Because most users discover and share Bujho via WhatsApp:

1. **Verify OpenGraph Tags:**
   - OpenGraph title: `Bujho — The Desi Charades Game`
   - OpenGraph description: `Phone on forehead. Friends screaming. Tilt to score. Get early access before public launch.`
   - Dynamic 1200x630 OG image: Generated by [`landing/app/opengraph-image.tsx`](file:///c:/Users/shrey/Projects/guess_up/landing/app/opengraph-image.tsx).
2. **Send Test Link:**
   - Open WhatsApp on your phone or web.
   - Start a chat with yourself or a friend.
   - Paste the link: `https://bujho.vercel.app`.
   - **Wait 2–3 seconds** for WhatsApp's crawler to fetch the preview card.
3. **Verify Preview Elements:**
   - [x] Card displays the high-contrast 1200x630 banner with Bujho logo & "The Desi Charades Game Your Gang Will Fight Over".
   - [x] Title is concise and unclipped: `Bujho — The Desi Charades Game`.
   - [x] Description previews clearly without showing technical metadata.
   - [x] Tapping the preview opens the landing page directly.

---

## 🎨 Theme & Button System

- **Design System:** Consistent theme tokens (`--bg-primary`, `--bg-surface`, `--text-main`, `--text-muted`, `--border-color`, `--primary-accent: #ffd600`) across all pages (`/`, `/privacy`, `/terms`, `/admin`).
- **Button Standards:** Standard yellow 3D arcade buttons (`Button variant="primary"`) provide unified visual affordance across hero, navigation, early access, and admin flows.
- **Zero Forbidden Words:** User-facing copy completely excludes "tester", "testing", "beta", "QA", "quota", and "help us".
