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
 * Standardized Common Email Header Styles (Dark & Light theme responsive)
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
      }
      .email-bg {
        background-color: #0E0C1C;
        color: #F4F6FC;
        padding: 32px 16px;
      }
      .email-card {
        background-color: #18152B;
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #F4F6FC;
      }
      .email-text {
        color: #CBD5E1;
      }
      .email-muted {
        color: #94A3B8;
      }
      .email-footer-border {
        border-top: 1px solid rgba(255, 255, 255, 0.12);
      }
      .step-box {
        background-color: #0E0C1C;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      /* Light Theme Overrides */
      @media (prefers-color-scheme: light) {
        .email-bg {
          background-color: #F8FAFC !important;
          color: #0F172A !important;
        }
        .email-card {
          background-color: #FFFFFF !important;
          border: 1px solid #E2E8F0 !important;
          color: #0F172A !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .email-text {
          color: #334155 !important;
        }
        .email-muted {
          color: #64748B !important;
        }
        .email-footer-border {
          border-top: 1px solid #E2E8F0 !important;
        }
        .step-box {
          background-color: #F1F5F9 !important;
          border: 1px solid #CBD5E1 !important;
        }
      }

      /* Dark Theme Specifics */
      @media (prefers-color-scheme: dark) {
        .email-bg {
          background-color: #0E0C1C !important;
          color: #F4F6FC !important;
        }
        .email-card {
          background-color: #18152B !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          color: #F4F6FC !important;
        }
        .email-text {
          color: #CBD5E1 !important;
        }
        .email-muted {
          color: #94A3B8 !important;
        }
        .step-box {
          background-color: #0E0C1C !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
      }
    </style>
  `;
}

/**
 * Standardized Email Footer (with WhatsApp reach out option)
 */
export function getEmailFooterHtml(): string {
  const siteUrl = getSiteUrl();
  const whatsappUrl = getWhatsAppUrl();
  const feedbackUrl = `${siteUrl}/feedback`;
  const year = new Date().getFullYear();

  return `
    <div class="email-footer-border" style="margin-top: 32px; padding-top: 24px; text-align: center; font-size: 13px;">

      <!-- WhatsApp Reach Out Button -->
      <div style="margin-bottom: 20px;">
        <a href="${whatsappUrl}" target="_blank" style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-weight: 800; font-size: 14px; text-transform: uppercase; padding: 12px 22px; border-radius: 14px; text-decoration: none; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);">
          💬 Reach out on WhatsApp for Feedback
        </a>
      </div>

      <div style="margin-bottom: 16px;">
        <a href="${siteUrl}" style="color: #FFD600; text-decoration: none; font-weight: bold; margin: 0 8px;">🌐 Website</a> •
        <a href="${feedbackUrl}" style="color: #FFD600; text-decoration: none; font-weight: bold; margin: 0 8px;">⭐ Submit Feedback</a> •
        <a href="${PLAY_STORE_TESTING_URL}" style="color: #FFD600; text-decoration: none; font-weight: bold; margin: 0 8px;">📱 Google Play Beta</a>
      </div>

      <p class="email-text" style="margin: 6px 0; font-weight: 500;">
        Bujho • Handcrafted for house parties, hostel hangouts & game nights.
      </p>
      <p class="email-muted" style="margin: 4px 0 0 0; font-size: 11px;">
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
  const whatsappUrl = getWhatsAppUrl();
  const feedbackUrl = `${siteUrl}/feedback`;
  const year = new Date().getFullYear();

  return `
--------------------------------------------------
💬 REACH OUT FOR FEEDBACK:
• WhatsApp Chat Direct: ${whatsappUrl}
• Web Feedback Form: ${feedbackUrl}
• Official Website: ${siteUrl}
• Google Play Beta Link: ${PLAY_STORE_TESTING_URL}

© ${year} Bujho • 100% Ad-Free Party Charades
Handcrafted for house parties & game nights.
`;
}

/**
 * Generate Welcome Email HTML for new Playtester (Dark & Light Theme)
 * Sent automatically when a new tester joins the list!
 */
export function getWelcomeEmailHtml(name: string): string {
  const cleanName = name.trim();

  return `
    <!DOCTYPE html>
    <html>
      <head>
        ${getEmailStyles()}
      </head>
      <body class="email-bg">
        <div style="max-width: 600px; margin: 0 auto; padding: 24px;">

          <!-- Brand Header -->
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #FFD600; font-size: 32px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin: 0;">BUJHO</h1>
            <p class="email-muted" style="font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;">100% Ad-Free Desi Party Charades</p>
          </div>

          <!-- Welcome Card -->
          <div class="email-card" style="padding: 24px; border-radius: 20px; margin-bottom: 24px;">
            <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; margin-bottom: 12px;">Welcome Aboard, ${cleanName}! 🎉</h2>
            <p class="email-text" style="font-size: 15px; line-height: 1.6; margin-bottom: 12px;">
              You're officially on the priority list for <strong>Bujho Android Beta Access</strong>!
            </p>
            <p class="email-text" style="font-size: 15px; line-height: 1.6; margin: 0;">
              Get ready for 100% ad-free charades, 60 FPS tilt motion detection, curated Desi pop-culture decks, and custom deck creation with your squad.
            </p>
          </div>

          <!-- Installation Steps Box -->
          <div style="background: linear-gradient(135deg, rgba(255, 214, 0, 0.12), rgba(255, 214, 0, 0.05)); padding: 24px; border-radius: 20px; border: 1.5px solid rgba(255, 214, 0, 0.3); margin-bottom: 24px;">
            <h3 style="color: #FFD600; font-size: 16px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 0; margin-bottom: 16px; text-align: center;">
              📱 2 Simple Steps to Install Bujho on Your Phone:
            </h3>

            <!-- STEP 1 -->
            <div class="step-box" style="margin-bottom: 16px; padding: 16px; border-radius: 16px;">
              <div style="margin-bottom: 8px;">
                <span style="background-color: #FFD600; color: #0E0C1C; font-weight: 900; font-size: 11px; padding: 3px 8px; border-radius: 10px; margin-right: 8px;">STEP 1</span>
                <strong style="font-size: 14px;">Accept Google Play Tester Invite</strong>
              </div>
              <p class="email-muted" style="font-size: 13px; line-height: 1.5; margin-top: 4px; margin-bottom: 12px;">
                Open this link in your phone browser and tap <strong>"Become a Tester"</strong>:
              </p>
              <div style="text-align: center;">
                <a href="${PLAY_STORE_TESTING_URL}" style="display: inline-block; background-color: #FFD600; color: #0E0C1C; font-weight: 900; font-size: 12px; text-transform: uppercase; padding: 10px 18px; border-radius: 12px; text-decoration: none;">
                  👉 Step 1: Accept Invite (Web Link)
                </a>
              </div>
            </div>

            <!-- STEP 2 -->
            <div class="step-box" style="padding: 16px; border-radius: 16px;">
              <div style="margin-bottom: 8px;">
                <span style="background-color: #22C55E; color: #FFFFFF; font-weight: 900; font-size: 11px; padding: 3px 8px; border-radius: 10px; margin-right: 8px;">STEP 2</span>
                <strong style="font-size: 14px;">Download Normally from Play Store</strong>
              </div>
              <p class="email-muted" style="font-size: 13px; line-height: 1.5; margin-top: 4px; margin-bottom: 12px;">
                Once accepted, open the Google Play Store app link on your phone to download:
              </p>
              <div style="text-align: center;">
                <a href="${PLAY_STORE_APP_URL}" style="display: inline-block; background-color: #22C55E; color: #FFFFFF; font-weight: 900; font-size: 12px; text-transform: uppercase; padding: 10px 18px; border-radius: 12px; text-decoration: none;">
                  📲 Step 2: Download on Play Store
                </a>
              </div>
            </div>
          </div>

          <!-- FOOTER -->
          ${getEmailFooterHtml()}
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate Welcome Email Plain Text
 */
export function getWelcomeEmailText(name: string = "Playtester"): string {
  return (
    `Hi ${name},\n\n` +
    `Thank you for joining Bujho Early Access Beta! We're thrilled to have you test our 100% ad-free party charades game.\n\n` +
    `📱 2 SIMPLE STEPS TO INSTALL ON YOUR PHONE:\n\n` +
    `STEP 1: Accept the Google Play Beta Invitation (Web Browser Link):\n` +
    `${PLAY_STORE_TESTING_URL}\n` +
    `-> Tap "Become a Tester" on the webpage.\n\n` +
    `STEP 2: Download Normally from Google Play Store (App Link):\n` +
    `${PLAY_STORE_APP_URL}\n` +
    `-> Open directly in Play Store app to install Bujho!\n\n` +
    `💬 HAVE QUESTIONS OR FEEDBACK?\n` +
    `Reach out to us directly on WhatsApp: ${getWhatsAppUrl()}\n\n` +
    `Cheers,\nThe Bujho Team\n` +
    getEmailFooterText()
  );
}

/**
 * Generate New Release Update Email HTML (Dark & Light Theme)
 */
export function getReleaseEmailHtml(customNotes?: string): string {
  const notesContent =
    customNotes?.trim() ||
    `• Added 30+ new secret cards across Bollywood & Cricket Decks\n• Improved 60 FPS motion tilt detection & spring animations\n• Instant 9:16 Instagram Story victory scorecard sharing\n• Performance & battery usage optimizations`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        ${getEmailStyles()}
      </head>
      <body class="email-bg">
        <div style="max-width: 600px; margin: 0 auto; padding: 24px;">

          <!-- Brand Header -->
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #FFD600; font-size: 32px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin: 0;">BUJHO</h1>
            <p class="email-muted" style="font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;">100% Ad-Free Desi Party Charades</p>
          </div>

          <!-- Main Release Card -->
          <div class="email-card" style="padding: 24px; border-radius: 20px; margin-bottom: 24px;">
            <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; margin-bottom: 12px; color: #FFD600;">🚀 New Beta Update Available!</h2>
            <p class="email-text" style="font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
              A brand new update for Bujho is now live on Google Play Beta! Check out what's new and update your app to get the latest features.
            </p>

            <div class="step-box" style="padding: 16px; border-radius: 16px; margin-bottom: 16px;">
              <h4 style="margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #FFD600;">✨ What's New:</h4>
              <div class="email-text" style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${notesContent}</div>
            </div>

            <div style="text-align: center; margin-top: 20px;">
              <a href="${PLAY_STORE_APP_URL}" style="display: inline-block; background-color: #22C55E; color: #FFFFFF; font-weight: 900; font-size: 13px; text-transform: uppercase; padding: 12px 22px; border-radius: 14px; text-decoration: none; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);">
                📲 Update / Install on Play Store
              </a>
            </div>
          </div>

          <!-- FOOTER -->
          ${getEmailFooterHtml()}
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate New Release Update Email Plain Text
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
 * Generate Feedback Email HTML (Dark & Light Theme)
 */
export function getFeedbackEmailHtml(customMessage?: string): string {
  const siteUrl = getSiteUrl();
  const whatsappUrl = getWhatsAppUrl();
  const messageContent =
    customMessage?.trim() ||
    `We hope you're having fun playing Bujho with your squad! 🎮\n\nAs an early beta tester, your feedback is crucial in shaping the future of the game. Tell us about your favorite deck, tilt sensitivity, or any feature/deck you'd love to see added next!`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        ${getEmailStyles()}
      </head>
      <body class="email-bg">
        <div style="max-width: 600px; margin: 0 auto; padding: 24px;">

          <!-- Brand Header -->
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #FFD600; font-size: 32px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin: 0;">BUJHO</h1>
            <p class="email-muted" style="font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;">100% Ad-Free Desi Party Charades</p>
          </div>

          <!-- Main Feedback Card -->
          <div class="email-card" style="padding: 24px; border-radius: 20px; margin-bottom: 24px;">
            <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; margin-bottom: 12px; color: #FFD600;">⭐ We'd Love Your Feedback!</h2>
            <div class="email-text" style="font-size: 15px; line-height: 1.6; margin-bottom: 20px; white-space: pre-wrap;">${messageContent}</div>

            <div style="text-align: center; margin-bottom: 12px;">
              <a href="${whatsappUrl}" target="_blank" style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-weight: 800; font-size: 14px; text-transform: uppercase; padding: 12px 22px; border-radius: 14px; text-decoration: none; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);">
                💬 Chat directly on WhatsApp
              </a>
            </div>
            <div style="text-align: center;">
              <a href="${siteUrl}/feedback" target="_blank" style="display: inline-block; background-color: #FFD600; color: #0E0C1C; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 10px 18px; border-radius: 12px; text-decoration: none;">
                ⭐ Fill Web Feedback Form
              </a>
            </div>
          </div>

          <!-- FOOTER -->
          ${getEmailFooterHtml()}
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate Feedback Request Email Plain Text
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
 * Generate Custom Announcement Email HTML (Dark & Light Theme)
 */
export function getCustomEmailHtml(
  subject: string,
  messageBody: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        ${getEmailStyles()}
      </head>
      <body class="email-bg">
        <div style="max-width: 600px; margin: 0 auto; padding: 24px;">

          <!-- Brand Header -->
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #FFD600; font-size: 32px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin: 0;">BUJHO</h1>
            <p class="email-muted" style="font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;">100% Ad-Free Desi Party Charades</p>
          </div>

          <!-- Main Announcement Card -->
          <div class="email-card" style="padding: 24px; border-radius: 20px; margin-bottom: 24px;">
            <h2 style="font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 16px; color: #FFD600;">${subject}</h2>
            <div class="email-text" style="font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${messageBody}</div>
          </div>

          <!-- FOOTER -->
          ${getEmailFooterHtml()}
        </div>
      </body>
    </html>
  `;
}
