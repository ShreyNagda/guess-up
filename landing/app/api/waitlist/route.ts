import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { addTesterToFirestore } from "@/lib/firestore";
import {
  getWelcomeEmailHtml,
  getWelcomeEmailText,
} from "@/lib/email_templates";

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

    // 2. Dispatch Server-Side Email via Nodemailer (if SMTP configured)
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail =
      process.env.FROM_EMAIL || '"Bujho Team" <no-reply@bujho.app>';
    const notificationEmail =
      process.env.NOTIFICATION_EMAIL || "shreynagda2714@gmail.com";

    let emailSent = false;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

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

        await Promise.all([
          transporter.sendMail(userMailOptions),
          transporter.sendMail(adminMailOptions),
        ]);
        emailSent = true;
      } catch (mailError) {
        console.error("Server email dispatch error:", mailError);
      }
    } else {
      console.log(
        "SMTP environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS) not set. Skipped direct email dispatch.",
      );
    }

    return NextResponse.json({
      success: true,
      firestoreSaved: firestoreResult.success,
      emailDispatched: emailSent,
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
