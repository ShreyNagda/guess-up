import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getTestersFromFirestore } from "@/lib/firestore";
import {
  getReleaseEmailHtml,
  getFeedbackEmailHtml,
  getCustomEmailHtml,
} from "@/lib/email_templates";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipients, subject, messageBody, templateType, sendToAll } = body;

    // SMTP Configuration
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail =
      process.env.FROM_EMAIL || '"Bujho Team" <no-reply@bujho.app>';

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        {
          success: false,
          error:
            "SMTP configuration missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in your .env file.",
        },
        { status: 400 },
      );
    }

    if (!subject || !messageBody) {
      return NextResponse.json(
        { success: false, error: "Subject and Message Body are required." },
        { status: 400 },
      );
    }

    // Determine target email list
    let targetEmails: string[] = [];

    if (sendToAll) {
      const testers = await getTestersFromFirestore();
      targetEmails = Array.from(
        new Set(
          testers.map((t) => t.email.trim().toLowerCase()).filter(Boolean),
        ),
      );
    } else if (Array.isArray(recipients) && recipients.length > 0) {
      targetEmails = Array.from(
        new Set(
          recipients
            .map((e: string) => String(e).trim().toLowerCase())
            .filter(Boolean),
        ),
      );
    } else if (typeof recipients === "string" && recipients.trim()) {
      targetEmails = [recipients.trim().toLowerCase()];
    }

    if (targetEmails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No target playtester email addresses found.",
        },
        { status: 400 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Pick HTML body template based on selected template type
    let formattedHtmlBody = "";
    if (templateType === "release") {
      formattedHtmlBody = getReleaseEmailHtml(messageBody);
    } else if (templateType === "feedback") {
      formattedHtmlBody = getFeedbackEmailHtml(messageBody);
    } else {
      formattedHtmlBody = getCustomEmailHtml(subject, messageBody);
    }

    // Send SEPARATE individual emails to each recipient (NO BCC leakage)
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const email of targetEmails) {
      try {
        await transporter.sendMail({
          from: fromEmail,
          to: email, // Individual To field for complete privacy
          subject: subject,
          text: messageBody,
          html: formattedHtmlBody,
        });
        successCount++;
      } catch (err: any) {
        failedCount++;
        errors.push(`Failed for ${email}: ${err?.message || err}`);
      }
    }

    if (successCount === 0 && failedCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to send emails. Error: ${errors[0]}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      messageSentCount: successCount,
      failedCount: failedCount,
      recipientsCount: targetEmails.length,
    });
  } catch (error: any) {
    console.error("Nodemailer send-email error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to send email via Nodemailer.",
      },
      { status: 500 },
    );
  }
}
