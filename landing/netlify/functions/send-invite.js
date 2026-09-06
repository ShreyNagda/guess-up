import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import nodemailer from "nodemailer";

// Initialize Firebase Admin SDK
function getAdminDb() {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        };

    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return getFirestore();
}

// Initialize Nodemailer Transporter using Gmail SMTP
function createTransporter() {
  const user = process.env.GMAIL_USER || "game.guessup@gmail.com";
  const pass = process.env.GMAIL_APP_PASS;

  if (!pass) {
    throw new Error("GMAIL_APP_PASS environment variable is missing.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

// Generate User Invite HTML Email Template
function getUserInviteTemplate(email, packageName) {
  const playStoreLink = `https://play.google.com/apps/testing/${packageName}`;
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GuessUp Playtest Invitation</title>
      </head>
      <body style="margin:0; padding:0; background-color:#0e0c1c; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; color:#ffffff;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0e0c1c; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#1e1938; border-radius:24px; padding: 40px; border:1px solid #332a58;">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <h1 style="margin:0; font-size:32px; font-weight:900; color:#ffd600; text-transform:uppercase; letter-spacing:-1px;">
                      GuessUp 🎬
                    </h1>
                    <p style="margin:4px 0 0 0; font-size:14px; color:#a099c0; font-weight:600;">
                      Google Play Closed Beta Testing Invitation
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 24px; font-size:15px; line-height:1.6; color:#e2e8f0;">
                    <p style="margin:0 0 16px 0;">Hello Playtester,</p>
                    <p style="margin:0 0 16px 0;">
                      You have been selected to join the official closed beta for <strong>GuessUp</strong> on Android!
                    </p>
                    <p style="margin:0 0 24px 0; color:#a099c0;">
                      Please click the button below to accept the testing invitation using your Google Play account (<code>${email}</code>).
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <a href="${playStoreLink}" target="_blank" style="display:inline-block; background-color:#ffd600; color:#0e0c1c; font-size:16px; font-weight:900; text-decoration:none; padding:16px 36px; border-radius:16px; text-transform:uppercase; letter-spacing:0.5px; box-shadow:0 6px 20px rgba(255,214,0,0.3);">
                      Join Google Play Test 🚀
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="border-top:1px solid #332a58; padding-top:24px; font-size:12px; color:#a099c0; text-align:center; line-height:1.5;">
                    <p style="margin:0 0 8px 0;">Direct testing link: <a href="${playStoreLink}" style="color:#ffd600;">${playStoreLink}</a></p>
                    <p style="margin:0;">Developer: Shrey Nagda | Contact: <a href="mailto:game.guessup@gmail.com" style="color:#ffd600;">game.guessup@gmail.com</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

// Generate Admin Notification HTML Email Template
function getAdminNotificationTemplate(email, name, deviceType) {
  return `
    <div style="font-family:sans-serif; padding:20px; background:#f4f6fc; color:#0f0c1c;">
      <h2>🎉 New Beta Tester Registered!</h2>
      <p>A new playtester has joined the GuessUp beta pool:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Name:</strong> ${name || "N/A"}</li>
        <li><strong>Device:</strong> ${deviceType || "Android"}</li>
        <li><strong>Registered At:</strong> ${new Date().toISOString()}</li>
      </ul>
    </div>
  `;
}

// Escape HTML characters to prevent XSS/injection in email templates
function sanitizeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function handler(event) {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: JSON.stringify({ message: "OK" }) };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed. Use POST." }),
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const { email, name, deviceType } = data;

    // Standard Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Please provide a valid email address." }),
      };
    }

    const cleanEmail = sanitizeHtml(email.trim().toLowerCase());
    const cleanName = sanitizeHtml(name ? name.trim() : "");
    const cleanDevice = sanitizeHtml(deviceType || "Android");

    const db = getAdminDb();
    const testersRef = db.collection("testers");

    // 1. Check if email exists in Firestore
    const snapshot = await testersRef.where("email", "==", cleanEmail).get();
    let docId;

    if (!snapshot.empty) {
      docId = snapshot.docs[0].id;
    } else {
      // Create new tester document with status "pending"
      const newDoc = await testersRef.add({
        email: cleanEmail,
        name: cleanName,
        deviceType: cleanDevice,
        role: "Beta Tester",
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
      });
      docId = newDoc.id;
    }

    // 2. Prepare Nodemailer Transporter
    const transporter = createTransporter();
    const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME || "com.shreynagda.guessup";
    const adminEmail = process.env.GMAIL_USER || "game.guessup@gmail.com";

    // 3. Send Invite Email to the User
    await transporter.sendMail({
      from: `"GuessUp Team" <${adminEmail}>`,
      to: cleanEmail,
      subject: "You're Invited! Join the GuessUp Google Play Beta 🚀",
      html: getUserInviteTemplate(cleanEmail, packageName),
    });

    // 4. Send Admin Notification Email
    await transporter.sendMail({
      from: `"GuessUp System" <${adminEmail}>`,
      to: adminEmail,
      subject: `[New Beta Tester] ${cleanEmail} registered for GuessUp`,
      html: getAdminNotificationTemplate(cleanEmail, cleanName, cleanDevice),
    });

    // 5. Update Firestore document status from "pending" to "sent"
    await testersRef.doc(docId).update({
      status: "sent",
      invitedAt: FieldValue.serverTimestamp(),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Invite sent successfully and status updated to 'sent'!",
        docId,
      }),
    };
  } catch (error) {
    console.error("Error sending invite notification:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || "Failed to process email invite request.",
      }),
    };
  }
}
