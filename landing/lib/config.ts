/**
 * Bujho Configuration & Key Constants
 * Update these constants to update external URLs, founder counts, or form endpoints.
 */

// 1. Google Group URL (framed as the early-access Founders List)
export const GOOGLE_GROUP_URL =
  process.env.NEXT_PUBLIC_GOOGLE_GROUP_URL ||
  "https://groups.google.com/g/bujho-testers";

// 2. Play Store Android Intent URL (Opens Play Store App directly on Android)
export const PLAY_STORE_INTENT_URL =
  "intent://details?id=com.shreynagda.guess_up#Intent;scheme=market;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end";

// 3. Play Store Web URL (Web fallback & desktop QR link)
export const PLAY_STORE_WEB_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_WEB_URL ||
  "https://play.google.com/apps/testing/com.shreynagda.guess_up";

// 4. Short Link URL for mobile users typing from desktop
export const SHORT_LINK_URL = "bujho.vercel.app/get";

// 5. WhatsApp Community URL (Private Founders WhatsApp)
export const WHATSAPP_GROUP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ||
  "https://chat.whatsapp.com/G4vQY1aFkP1BujhoTesters";

// 6. Formspree / Form Endpoint for iOS Waitlist
export const FORMSPREE_ENDPOINT =
  process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ||
  "https://formspree.io/f/mqakvjle";

// 7. Manually Updated Founder Count (Update weekly)
export const FOUNDER_COUNT = 47;

// 8. Base Canonical Site URL
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bujho.vercel.app";
