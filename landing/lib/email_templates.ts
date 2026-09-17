export const PLAY_STORE_TESTING_URL =
  "https://play.google.com/apps/testing/com.shreynagda.guess_up";
export const PLAY_STORE_APP_URL =
  "https://play.google.com/store/apps/details?id=com.shreynagda.guess_up";

export const getSiteUrl = (): string =>
  process.env.NEXT_PUBLIC_SITE_URL || "https://bujho.netlify.app";

/**
 * Standardized Common Email Footer for all Bujho HTML Emails
 */
export function getEmailFooterHtml(): string {
  const siteUrl = getSiteUrl();
  const feedbackUrl = `${siteUrl}/feedback`;
  const year = new Date().getFullYear();

  return `
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.12); text-align: center; font-size: 13px; color: #94A3B8;">
      <div style="margin-bottom: 16px;">
        <a href="${siteUrl}" style="color: #FFD600; text-decoration: none; font-weight: bold; margin: 0 10px;">🌐 Official Website</a> •
        <a href="${feedbackUrl}" style="color: #FFD600; text-decoration: none; font-weight: bold; margin: 0 10px;">⭐ Submit Feedback</a> •
        <a href="${PLAY_STORE_TESTING_URL}" style="color: #FFD600; text-decoration: none; font-weight: bold; margin: 0 10px;">📱 Google Play Beta Link</a>
      </div>
      <p style="margin: 6px 0; color: #CBD5E1; font-weight: 500;">
        Bujho • Handcrafted for house parties, hostel hangouts & game nights.
      </p>
      <p style="margin: 4px 0 0 0; color: #64748B; font-size: 11px;">
        © ${year} Bujho. All rights reserved. 100% Ad-Free Party Charades.
      </p>
    </div>
  `;
}

/**
 * Standardized Common Email Footer for Plain Text Emails
 */
export function getEmailFooterText(): string {
  const siteUrl = getSiteUrl();
  const feedbackUrl = `${siteUrl}/feedback`;
  const year = new Date().getFullYear();

  return `
--------------------------------------------------
🔗 QUICK LINKS & FOOTER:
• Official Website: ${siteUrl}
• Submit Player Feedback: ${feedbackUrl}
• Google Play Beta: ${PLAY_STORE_TESTING_URL}

© ${year} Bujho • 100% Ad-Free Party Charades
Handcrafted for house parties & game nights.
`;
}

/**
 * Generate Welcome Email HTML for new Playtester
 */
export function getWelcomeEmailHtml(name: string): string {
  const cleanName = name.trim();

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #0E0C1C; color: #F4F6FC; border-radius: 24px; border: 2px solid rgba(255, 214, 0, 0.25);">
      
      <!-- Brand Header -->
      <div style="text-align: center; margin-bottom: 28px;">
        <h1 style="color: #FFD600; font-size: 32px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin: 0;">BUJHO</h1>
        <p style="color: #94A3B8; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;">100% Ad-Free Desi Party Charades</p>
      </div>

      <!-- Welcome Message Box -->
      <div style="background-color: #18152B; padding: 24px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 24px;">
        <h2 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin-top: 0; margin-bottom: 12px;">Welcome Aboard, ${cleanName}! 🎉</h2>
        <p style="color: #CBD5E1; font-size: 15px; line-height: 1.6; margin-bottom: 12px;">
          You're officially on the priority list for <strong>Bujho Android Beta Access</strong>!
        </p>
        <p style="color: #CBD5E1; font-size: 15px; line-height: 1.6; margin: 0;">
          Get ready for 100% ad-free charades, 60 FPS tilt motion detection, curated Desi pop-culture decks, and custom deck creation with your squad.
        </p>
      </div>

      <!-- STEPS TO DOWNLOAD ON PHONE -->
      <div style="background: linear-gradient(135deg, rgba(255, 214, 0, 0.12), rgba(255, 214, 0, 0.05)); padding: 24px; border-radius: 20px; border: 1.5px solid rgba(255, 214, 0, 0.3); margin-bottom: 24px;">
        <h3 style="color: #FFD600; font-size: 17px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 0; margin-bottom: 16px; text-align: center;">
          📱 2 Simple Steps to Install Bujho on Your Phone:
        </h3>

        <!-- STEP 1 -->
        <div style="margin-bottom: 20px; padding: 16px; background-color: #0E0C1C; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08);">
          <div style="margin-bottom: 8px;">
            <span style="background-color: #FFD600; color: #0E0C1C; font-weight: 900; font-size: 12px; padding: 4px 10px; border-radius: 12px; margin-right: 8px;">STEP 1</span>
            <strong style="color: #FFFFFF; font-size: 15px;">Accept Google Play Tester Invite</strong>
          </div>
          <p style="color: #94A3B8; font-size: 13px; line-height: 1.5; margin-top: 4px; margin-bottom: 12px;">
            Open this web link in your phone browser and tap the <strong>"Become a Tester"</strong> button:
          </p>
          <div style="text-align: center;">
            <a href="${PLAY_STORE_TESTING_URL}" style="display: inline-block; background-color: #FFD600; color: #0E0C1C; font-weight: 900; font-size: 13px; text-transform: uppercase; padding: 12px 20px; border-radius: 14px; text-decoration: none;">
              👉 Step 1: Accept Invite (Web Link)
            </a>
          </div>
        </div>

        <!-- STEP 2 -->
        <div style="padding: 16px; background-color: #0E0C1C; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08);">
          <div style="margin-bottom: 8px;">
            <span style="background-color: #22C55E; color: #FFFFFF; font-weight: 900; font-size: 12px; padding: 4px 10px; border-radius: 12px; margin-right: 8px;">STEP 2</span>
            <strong style="color: #FFFFFF; font-size: 15px;">Download Normally from Play Store</strong>
          </div>
          <p style="color: #94A3B8; font-size: 13px; line-height: 1.5; margin-top: 4px; margin-bottom: 12px;">
            Once accepted, open the Google Play Store app link on your phone to download the game:
          </p>
          <div style="text-align: center;">
            <a href="${PLAY_STORE_APP_URL}" style="display: inline-block; background-color: #22C55E; color: #FFFFFF; font-weight: 900; font-size: 13px; text-transform: uppercase; padding: 12px 20px; border-radius: 14px; text-decoration: none;">
              📲 Step 2: Download on Play Store
            </a>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      ${getEmailFooterHtml()}
    </div>
  `;
}

/**
 * Generate Welcome Email Plain Text for Admin Broadcast / Fallback
 */
export function getWelcomeEmailText(name: string = "Playtester"): string {
  return `Hi ${name},\n\n` +
    `Thank you for joining Bujho Early Access Beta! We're thrilled to have you test our 100% ad-free party charades game.\n\n` +
    `📱 2 SIMPLE STEPS TO INSTALL ON YOUR PHONE:\n\n` +
    `STEP 1: Accept the Google Play Beta Invitation (Web Browser Link):\n` +
    `${PLAY_STORE_TESTING_URL}\n` +
    `-> Tap "Become a Tester" on the webpage.\n\n` +
    `STEP 2: Download Normally from Google Play Store (App Link):\n` +
    `${PLAY_STORE_APP_URL}\n` +
    `-> Open directly in Play Store app to install Bujho!\n\n` +
    `WHAT TO EXPECT:\n` +
    `• 100% Ad-Free charades with 60 FPS motion tilt sensing\n` +
    `• Curated Desi pop-culture decks & custom deck studio\n` +
    `• Play 100% offline at house parties & hostel hangouts\n\n` +
    `Please test the build and let us know your thoughts!\n\n` +
    `Cheers,\nThe Bujho Team\n` +
    getEmailFooterText();
}

/**
 * Generate Release Update Email Plain Text for Admin Broadcast
 */
export function getReleaseEmailText(): string {
  return `Hi Playtesters,\n\n` +
    `A new update for Bujho is now live on Google Play Beta!\n\n` +
    `WHAT'S NEW IN THIS RELEASE:\n` +
    `• Added 30+ new secret cards across Bollywood & Cricket Decks\n` +
    `• Improved 60 FPS motion tilt detection & spring animations\n` +
    `• Instant 9:16 Instagram Story victory scorecard sharing\n` +
    `• Performance & battery usage optimizations\n\n` +
    `📱 HOW TO UPDATE / INSTALL ON PHONE:\n` +
    `1. Accept Web Beta Invite: ${PLAY_STORE_TESTING_URL}\n` +
    `2. Open Play Store App: ${PLAY_STORE_APP_URL}\n\n` +
    `Let us know your thoughts & score records!\n\n` +
    `Happy Charades,\nThe Bujho Team\n` +
    getEmailFooterText();
}
