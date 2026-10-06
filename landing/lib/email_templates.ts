export const PLAY_STORE_TESTING_URL =
  "https://play.google.com/apps/testing/com.shreynagda.guess_up";
export const PLAY_STORE_APP_URL =
  "https://play.google.com/store/apps/details?id=com.shreynagda.guess_up";

export const getSiteUrl = (): string =>
  process.env.NEXT_PUBLIC_SITE_URL || "https://bujho.vercel.app";

export const getWhatsAppUrl = (): string =>
  process.env.NEXT_PUBLIC_WHATSAPP_URL ||
  process.env.WHATSAPP_URL ||
  "https://wa.me/919405321984?text=Hi%20Shrey%2C%20I%20am%20currently%20testing%20Bujho%20and%20would%20like%20to%20give%20a%20feedback";

/**
 * Shared modular email styles — light & dark theme responsive card components
 */
export function getEmailStyles(): string {
  return `
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <style>
      :root {
        color-scheme: light dark;
        supported-color-schemes: light dark;
      }
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
      }

      /* Base Light Theme Defaults */
      .email-bg       { background-color: #F8FAFC; color: #0F172A; }
      .email-card     { background-color: #FFFFFF; border: 1px solid #E2E8F0; color: #0F172A; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
      .email-step-box { background-color: #F1F5F9; border: 1px solid #CBD5E1; color: #0F172A; }
      .email-heading  { color: #0F172A; }
      .email-text     { color: #334155; }
      .email-muted    { color: #64748B; }
      .email-brand    { color: #FF6B00; }
      .email-accent   { color: #FF1493; }
      .email-link     { color: #FF6B00; text-decoration: none; font-weight: 700; }

      /* Light Theme Overrides */
      @media (prefers-color-scheme: light) {
        .email-bg       { background-color: #F8FAFC !important; color: #0F172A !important; }
        .email-card     { background-color: #FFFFFF !important; border: 1px solid #E2E8F0 !important; color: #0F172A !important; box-shadow: 0 4px 16px rgba(0,0,0,0.04) !important; }
        .email-step-box { background-color: #F1F5F9 !important; border: 1px solid #CBD5E1 !important; color: #0F172A !important; }
        .email-heading  { color: #0F172A !important; }
        .email-text     { color: #334155 !important; }
        .email-muted    { color: #64748B !important; }
        .email-brand    { color: #FF6B00 !important; }
        .email-accent   { color: #FF1493 !important; }
        .email-link     { color: #FF6B00 !important; }
      }

      /* Dark Theme Overrides */
      @media (prefers-color-scheme: dark) {
        .email-bg       { background-color: #0B0813 !important; color: #F8FAFC !important; }
        .email-card     { background-color: #141024 !important; border: 1px solid rgba(255, 255, 255, 0.14) !important; color: #F8FAFC !important; box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important; }
        .email-step-box { background-color: #1A152E !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; color: #F8FAFC !important; }
        .email-heading  { color: #F8FAFC !important; }
        .email-text     { color: #CBD5E1 !important; }
        .email-muted    { color: #94A3B8 !important; }
        .email-brand    { color: #FFD600 !important; }
        .email-accent   { color: #FF1493 !important; }
        .email-link     { color: #FFD600 !important; }
      }
    </style>
  `;
}

/**
 * Shared Brand Header
 */
function getBrandHeader(): string {
  return `
    <div style="text-align: center; margin-bottom: 28px;">
      <div class="email-brand" style="font-size: 32px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; line-height: 1;">BUJHO</div>
      <div class="email-muted" style="margin-top: 6px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 800;">
        The Desi Charades Game • 100% Ad-Free
      </div>
    </div>
  `;
}

export function getEmailFooterHtml(): string {
  const siteUrl = getSiteUrl();
  const whatsappUrl = getWhatsAppUrl();
  const feedbackUrl = `${siteUrl}/feedback`;
  const year = new Date().getFullYear();

  return `
    <div style="margin-top: 36px; text-align: center;">

      <!-- WhatsApp Reach-out Button -->
      <div style="margin-bottom: 22px;">
        <a href="${whatsappUrl}" target="_blank" style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-weight: 800; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase; padding: 12px 24px; border-radius: 999px; text-decoration: none; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);">
          💬 Reach out on WhatsApp
        </a>
      </div>

      <!-- Modular Footer Links -->
      <div style="margin-bottom: 16px; font-size: 13px; letter-spacing: 0.3px;">
        <a href="${siteUrl}" class="email-link">Website</a>
        <span class="email-muted" style="padding: 0 10px;">·</span>
        <a href="${feedbackUrl}" class="email-link">Submit Feedback</a>
        <span class="email-muted" style="padding: 0 10px;">·</span>
        <a href="${PLAY_STORE_TESTING_URL}" class="email-link">Google Play Beta</a>
      </div>

      <p class="email-text" style="margin: 0 0 6px 0; font-size: 13px; font-weight: 500; line-height: 1.6;">
        Bujho · Handcrafted for house parties, hostel hangouts & game nights.
      </p>
      <p class="email-muted" style="margin: 0; font-size: 11px; line-height: 1.6;">
        © ${year} Bujho. All rights reserved. 100% Ad-Free Party Charades.
      </p>
    </div>
  `;
}

/**
 * Standardized Plain Text Footer
 */
export function getEmailFooterText(): string {
  const siteUrl = getSiteUrl();
  const whatsappUrl = getWhatsAppUrl();
  const feedbackUrl = `${siteUrl}/feedback`;
  const year = new Date().getFullYear();

  return `
--------------------------------------------------
💬 REACH OUT FOR FEEDBACK:
• WhatsApp Chat Direct: ${whatsappUrl}
• Web Feedback Form: ${feedbackUrl}
• Official Website: ${siteUrl}

© ${year} Bujho • The Desi Charades Game
Handcrafted for house parties & game nights.
`;
}

/**
 * Initial Signup Welcome Email (WITHOUT ANY STEPS OR LINKS)
 * Welcomes tester and explains to wait 1-2 hours for testing access email.
 */
export function getWelcomeEmailHtml(name: string): string {
  const cleanName = name.trim() || "Playtester";

  return `
    <!DOCTYPE html>
    <html>
      <head>${getEmailStyles()}</head>
      <body class="email-bg">
        <div style="max-width: 580px; margin: 0 auto; padding: 32px 16px;">

          ${getBrandHeader()}

          <!-- Welcome Card WITHOUT links or steps -->
          <div class="email-card" style="padding: 32px 28px; border-radius: 24px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
            <h1 class="email-heading" style="font-size: 26px; font-weight: 900; line-height: 1.3; margin: 0 0 16px 0;">
              Welcome to Bujho, ${cleanName}!
            </h1>
            <p class="email-text" style="font-size: 16px; line-height: 1.65; margin: 0 0 16px 0;">
              Thank you for registering for early beta access to <strong>Bujho - The Desi Charades Game</strong>!
            </p>

            <div class="email-step-box" style="padding: 20px; border-radius: 18px; margin: 20px 0; border: 2px dashed #FF6B00; text-align: left;">
              <div style="font-size: 14px; font-weight: 800; color: #FF6B00; margin-bottom: 8px; text-transform: uppercase;">
                ⏳ What happens next?
              </div>
              <p class="email-text" style="font-size: 14px; line-height: 1.6; margin: 0;">
                Our team is preparing your Play Store testing account access. Please <strong>wait for 1-2 hours</strong>. An email with the complete initial steps and access links will be sent out to you shortly!
              </p>
            </div>

            <p class="email-muted" style="font-size: 13px; line-height: 1.6; margin: 0;">
              Get ready for 100% ad-free party charades, motion tilt sensing, and wild pop-culture decks!
            </p>
          </div>

          ${getEmailFooterHtml()}
        </div>
      </body>
    </html>
  `;
}

/**
 * Initial Signup Welcome Email Plain Text (WITHOUT LINKS OR STEPS)
 */
export function getWelcomeEmailText(name: string = "Playtester"): string {
  return (
    `Hi ${name},\n\n` +
    `Welcome to Bujho - The Desi Charades Game! 🎉\n\n` +
    `Thank you for registering for early beta access. Our team is preparing your Play Store testing account access.\n\n` +
    `⏳ WHAT HAPPENS NEXT?\n` +
    `Please wait for 1-2 hours. An email with the complete initial steps and access links will be sent out to you shortly!\n\n` +
    `Get ready for 100% ad-free charades with your squad.\n\n` +
    `Cheers,\nThe Bujho Team\n` +
    getEmailFooterText()
  );
}

/**
 * NEW EMAIL TEMPLATE: Initial Testing Steps Email
 * Contains step-by-step instructions, accept invite link, Play Store screenshot, & Play Store install link.
 */
export function getTesterStepsEmailHtml(name: string = "Playtester"): string {
  const cleanName = name.trim() || "Playtester";
  const siteUrl = getSiteUrl();
  const screenshotUrl = `${siteUrl}/images/play_invite_screenshot.png`;

  return `
    <!DOCTYPE html>
    <html>
      <head>${getEmailStyles()}</head>
      <body class="email-bg">
        <div style="max-width: 580px; margin: 0 auto; padding: 32px 16px;">

          ${getBrandHeader()}

          <!-- Header Card -->
          <div class="email-card" style="padding: 28px; border-radius: 24px; margin-bottom: 20px;">
            <h1 class="email-heading" style="font-size: 24px; font-weight: 900; line-height: 1.3; margin: 0 0 12px 0;">
              Your Testing Access is Ready, ${cleanName}! 🚀
            </h1>
            <p class="email-text" style="font-size: 15px; line-height: 1.65; margin: 0;">
              Follow the 2 simple steps below to join the Android beta program and install Bujho directly from the Google Play Store!
            </p>
          </div>

          <!-- STEP 1 CARD WITH SCREENSHOT -->
          <div class="email-card" style="padding: 28px; border-radius: 24px; margin-bottom: 20px;">
            <div style="margin-bottom: 12px;">
              <span style="background-color: #FF6B00; color: #FFFFFF; font-weight: 900; font-size: 12px; padding: 4px 10px; border-radius: 8px; margin-right: 8px; text-transform: uppercase;">STEP 1</span>
              <strong class="email-heading" style="font-size: 17px;">Accept Google Play Beta Invitation</strong>
            </div>

            <p class="email-text" style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
              Open the web link below in your mobile browser and tap the green <strong>"BECOME A TESTER"</strong> button:
            </p>

            <!-- Play Store Web Page Screenshot Visual -->
            <div style="margin: 16px 0; text-align: center; border-radius: 16px; overflow: hidden; border: 2px solid #E2E8F0;">
              <img src="${screenshotUrl}" alt="Google Play Accept Invite Screenshot" style="width: 100%; max-width: 100%; height: auto; display: block;" />
            </div>

            <div style="text-align: center; margin-top: 18px;">
              <a href="${PLAY_STORE_TESTING_URL}" target="_blank" style="display: inline-block; background-color: #FF6B00; color: #FFFFFF; font-weight: 900; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase; padding: 14px 28px; border-radius: 14px; text-decoration: none; box-shadow: 0 4px 14px rgba(255, 107, 0, 0.3);">
                👉 Step 1: Tap Here to Accept Invite
              </a>
            </div>
          </div>

          <!-- STEP 2 CARD -->
          <div class="email-card" style="padding: 28px; border-radius: 24px; margin-bottom: 20px;">
            <div style="margin-bottom: 12px;">
              <span style="background-color: #22C55E; color: #FFFFFF; font-weight: 900; font-size: 12px; padding: 4px 10px; border-radius: 8px; margin-right: 8px; text-transform: uppercase;">STEP 2</span>
              <strong class="email-heading" style="font-size: 17px;">Install App from Google Play Store</strong>
            </div>

            <p class="email-text" style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
              Once you have accepted the invitation, click below to open the official Play Store app listing and tap <strong>Install</strong>:
            </p>

            <div style="text-align: center;">
              <a href="${PLAY_STORE_APP_URL}" target="_blank" style="display: inline-block; background-color: #22C55E; color: #FFFFFF; font-weight: 900; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase; padding: 14px 28px; border-radius: 14px; text-decoration: none; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.3);">
                📲 Step 2: Download Bujho on Play Store
              </a>
            </div>
          </div>

          ${getEmailFooterHtml()}
        </div>
      </body>
    </html>
  `;
}

/**
 * Initial Testing Steps Email Plain Text
 */
export function getTesterStepsEmailText(name: string = "Playtester"): string {
  return (
    `Hi ${name},\n\n` +
    `Your Bujho Android Beta testing access is now active! 🚀\n\n` +
    `📱 2 SIMPLE STEPS TO INSTALL ON YOUR PHONE:\n\n` +
    `STEP 1: Accept the Google Play Web Invitation:\n` +
    `${PLAY_STORE_TESTING_URL}\n` +
    `-> Tap "BECOME A TESTER" on the webpage.\n\n` +
    `STEP 2: Download directly from Play Store app:\n` +
    `${PLAY_STORE_APP_URL}\n` +
    `-> Open in Play Store to install Bujho!\n\n` +
    `💬 HAVE QUESTIONS OR FEEDBACK?\n` +
    `Reach out to us directly on WhatsApp: ${getWhatsAppUrl()}\n\n` +
    `Cheers,\nThe Bujho Team\n` +
    getEmailFooterText()
  );
}

/**
 * Release Update Email HTML
 */
export function getReleaseEmailHtml(customNotes?: string): string {
  const notesContent =
    customNotes?.trim() ||
    `• Added 30+ new secret cards across Bollywood & Cricket Decks
• Improved 60 FPS motion tilt detection & spring animations
• Instant 9:16 Instagram Story victory scorecard sharing
• Performance & battery usage optimizations`;

  return `
    <!DOCTYPE html>
    <html>
      <head>${getEmailStyles()}</head>
      <body class="email-bg">
        <div style="max-width: 580px; margin: 0 auto; padding: 32px 16px;">

          ${getBrandHeader()}

          <!-- Main Release Card -->
          <div class="email-card" style="padding: 28px; border-radius: 20px; margin-bottom: 20px;">
            <h1 class="email-brand" style="font-size: 22px; font-weight: 800; line-height: 1.3; margin: 0 0 12px 0;">
              🚀 New Beta Update Available!
            </h1>
            <p class="email-text" style="font-size: 15px; line-height: 1.65; margin: 0 0 18px 0;">
              A brand new update for Bujho is now live on Google Play Beta! Check out what's new and update your app to get the latest features.
            </p>

            <div class="email-step-box" style="padding: 18px; border-radius: 16px; margin-bottom: 20px;">
              <div class="email-brand" style="font-size: 13px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">
                ✨ What's New in this Build:
              </div>
              <div class="email-text" style="font-size: 14px; line-height: 1.65; white-space: pre-wrap;">${notesContent}</div>
            </div>

            <div style="text-align: center;">
              <a href="${PLAY_STORE_APP_URL}" style="display: inline-block; background-color: #22C55E; color: #FFFFFF; font-weight: 900; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase; padding: 12px 24px; border-radius: 14px; text-decoration: none; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);">
                📲 Update / Install on Play Store
              </a>
            </div>
          </div>

          ${getEmailFooterHtml()}
        </div>
      </body>
    </html>
  `;
}

/**
 * Release Update Email Plain Text
 */
export function getReleaseEmailText(): string {
  return (
    `Hi Playtesters,\n\n` +
    `A new update for Bujho is now live on Google Play Beta! 🚀\n\n` +
    `WHAT'S NEW IN THIS RELEASE:\n` +
    `• Added 30+ new secret cards across Bollywood & Cricket Decks\n` +
    `• Improved 60 FPS motion tilt detection & spring animations\n` +
    `• Instant 9:16 Instagram Story victory scorecard sharing\n` +
    `• Performance & battery usage optimizations\n\n` +
    `📱 HOW TO UPDATE / INSTALL ON PHONE:\n` +
    `1. Accept Web Beta Invite: ${PLAY_STORE_TESTING_URL}\n` +
    `2. Open Play Store App: ${PLAY_STORE_APP_URL}\n\n` +
    `💬 HAVE FEEDBACK OR BUG REPORTS?\n` +
    `Reach out directly on WhatsApp: ${getWhatsAppUrl()}\n\n` +
    `Happy Charades,\nThe Bujho Team\n` +
    getEmailFooterText()
  );
}

/**
 * Feedback Request Email HTML
 */
export function getFeedbackEmailHtml(customMessage?: string): string {
  const siteUrl = getSiteUrl();
  const whatsappUrl = getWhatsAppUrl();
  const messageContent =
    customMessage?.trim() ||
    `We hope you're having fun playing Bujho with your squad! 🎮\n\nAs an early beta tester, your feedback shapes the future of the game. Tell us about your favourite deck, tilt sensitivity, or any feature you'd love to see next.`;

  return `
    <!DOCTYPE html>
    <html>
      <head>${getEmailStyles()}</head>
      <body class="email-bg">
        <div style="max-width: 580px; margin: 0 auto; padding: 32px 16px;">

          ${getBrandHeader()}

          <!-- Feedback Card -->
          <div class="email-card" style="padding: 28px; border-radius: 20px; margin-bottom: 20px;">
            <h1 class="email-brand" style="font-size: 22px; font-weight: 800; line-height: 1.3; margin: 0 0 14px 0;">
              ⭐ We'd Love Your Feedback!
            </h1>
            <div class="email-text" style="font-size: 15px; line-height: 1.65; white-space: pre-wrap; margin-bottom: 22px;">${messageContent}</div>

            <!-- Action Buttons inside Card -->
            <div style="text-align: center; margin-bottom: 12px;">
              <a href="${whatsappUrl}" target="_blank" style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-weight: 800; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase; padding: 12px 24px; border-radius: 14px; text-decoration: none; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);">
                💬 Chat directly on WhatsApp
              </a>
            </div>
            <div style="text-align: center;">
              <a href="${siteUrl}/feedback" target="_blank" style="display: inline-block; background-color: #FFD600; color: #0E0C1C; font-weight: 800; font-size: 12px; letter-spacing: 0.5px; text-transform: uppercase; padding: 10px 20px; border-radius: 12px; text-decoration: none;">
                ⭐ Fill Web Feedback Form
              </a>
            </div>
          </div>

          ${getEmailFooterHtml()}
        </div>
      </body>
    </html>
  `;
}

/**
 * Feedback Request Email Plain Text
 */
export function getFeedbackEmailText(): string {
  const siteUrl = getSiteUrl();
  const whatsappUrl = getWhatsAppUrl();

  return (
    `Hi Playtesters,\n\n` +
    `We hope you're having fun playing Bujho with your squad! 🎮\n\n` +
    `As an early beta tester, your feedback is crucial in shaping the future of the game. Could you take 1 minute to share your thoughts?\n\n` +
    `💬 Chat directly on WhatsApp: ${whatsappUrl}\n` +
    `⭐ Submit Web Feedback: ${siteUrl}/feedback\n\n` +
    `Tell us about your favorite deck, tilt sensitivity, or any feature/deck you'd love to see added next!\n\n` +
    `Thanks for building Bujho with us,\nThe Bujho Team\n` +
    getEmailFooterText()
  );
}

/**
 * Custom Announcement Email HTML
 */
export function getCustomEmailHtml(
  subject: string,
  messageBody: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>${getEmailStyles()}</head>
      <body class="email-bg">
        <div style="max-width: 580px; margin: 0 auto; padding: 32px 16px;">

          ${getBrandHeader()}

          <!-- Custom Message Card -->
          <div class="email-card" style="padding: 28px; border-radius: 20px; margin-bottom: 20px;">
            <h1 class="email-brand" style="font-size: 22px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0;">
              ${subject}
            </h1>
            <div class="email-text" style="font-size: 15px; line-height: 1.65; white-space: pre-wrap;">${messageBody}</div>
          </div>

          ${getEmailFooterHtml()}
        </div>
      </body>
    </html>
  `;
}
