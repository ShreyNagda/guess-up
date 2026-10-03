import { NextResponse } from "next/server";
import { transporter } from "@/lib/mailer";
import { addTesterToFirestore } from "@/lib/firestore";
import {
  getWelcomeEmailHtml,
  getWelcomeEmailText,
} from "@/lib/email_templates";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid name." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Save to Firestore
    const firestoreResult = await addTesterToFirestore(cleanName, cleanEmail);

    if (!firestoreResult.success && firestoreResult.alreadyRegistered) {
      return NextResponse.json(
        {
          success: false,
          alreadyRegistered: true,
          error:
            firestoreResult.error ||
            "This email is already registered for early access!",
        },
        { status: 409 },
      );
    }

    // 2. Dispatch Server-Side Email via Pooled Nodemailer Transporter
    const fromEmail =
      process.env.FROM_EMAIL || '"Bujho Team" <no-reply@bujho.app>';
    const notificationEmail =
      process.env.NOTIFICATION_EMAIL || "shreynagda2714@gmail.com";

    let emailSent = false;
    let emailError: string | null = null;

    if (transporter) {
      try {
        console.log("[signup-email] Dispatching welcome email to:", cleanEmail);

        // Send Welcome Email to User using template generator
        const userMailOptions = {
          from: fromEmail,
          to: cleanEmail,
          subject: "🎉 Welcome to Bujho Priority Beta Access!",
          text: getWelcomeEmailText(cleanName),
          html: getWelcomeEmailHtml(cleanName),
        };

        // Send Admin Notification Email
        const adminMailOptions = {
          from: fromEmail,
          to: notificationEmail,
          subject: `🔥 New Bujho Playtester: ${cleanName}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>New Waitlist Sign-up</h2>
              <p><strong>Name:</strong> ${cleanName}</p>
              <p><strong>Email:</strong> ${cleanEmail}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
            </div>
          `,
        };

        const results = await Promise.allSettled([
          transporter.sendMail(userMailOptions),
          transporter.sendMail(adminMailOptions),
        ]);

        const userMailResult = results[0];
        const adminMailResult = results[1];

        if (userMailResult.status === "fulfilled") {
          console.log(
            "[signup-email] Welcome email sent successfully to",
            cleanEmail,
            "messageId:",
            userMailResult.value.messageId
          );
          emailSent = true;
        } else {
          emailError = userMailResult.reason?.message || String(userMailResult.reason);
          console.error("[signup-email] Welcome email failed for", cleanEmail, ":", emailError);
        }

        if (adminMailResult.status === "fulfilled") {
          console.log(
            "[signup-email] Admin notification sent successfully for",
            cleanEmail,
            "messageId:",
            adminMailResult.value.messageId
          );
        } else {
          console.error(
            "[signup-email] Admin notification failed for",
            cleanEmail,
            ":",
            adminMailResult.reason?.message || adminMailResult.reason
          );
        }
      } catch (mailError: any) {
        emailError = mailError?.message || String(mailError);
        console.error("[signup-email] Exception sending signup email:", mailError);
      }
    } else {
      console.warn(
        "[signup-email] SMTP environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS) not set. Skipping email dispatch."
      );
    }

    return NextResponse.json({
      success: true,
      firestoreSaved: firestoreResult.success,
      emailDispatched: emailSent,
      emailError: emailError || undefined,
      message: "Successfully added to early access waitlist!",
    });
  } catch (error: any) {
    console.error("Waitlist API route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error. Please try again.",
      },
      { status: 500 },
    );
  }
}

