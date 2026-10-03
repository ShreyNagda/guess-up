import { NextResponse } from "next/server";
import { transporter } from "@/lib/mailer";
import { getTestersFromFirestore } from "@/lib/firestore";
import {
  getReleaseEmailHtml,
  getFeedbackEmailHtml,
  getCustomEmailHtml,
} from "@/lib/email_templates";

export const runtime = "nodejs";
export const maxDuration = 60;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipients, subject, messageBody, templateType, sendToAll } = body;

    if (!transporter) {
      return NextResponse.json(
        {
          success: false,
          error:
            "SMTP configuration missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in your environment variables.",
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
    let rawEmails: string[] = [];

    if (sendToAll) {
      const testers = await getTestersFromFirestore();
      rawEmails = testers.map((t) => t.email);
    } else if (Array.isArray(recipients) && recipients.length > 0) {
      rawEmails = recipients.map((e: string) => String(e));
    } else if (typeof recipients === "string" && recipients.trim()) {
      rawEmails = [recipients];
    }

    // Validate and deduplicate emails
    const targetEmails = Array.from(
      new Set(
        rawEmails
          .map((e) => (e || "").trim().toLowerCase())
          .filter((e) => EMAIL_REGEX.test(e)),
      ),
    );

    if (targetEmails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid playtester email addresses found to send.",
        },
        { status: 400 },
      );
    }

    const fromEmail =
      process.env.FROM_EMAIL || '"Bujho Team" <no-reply@bujho.app>';

    // Pick HTML body template based on selected template type
    let formattedHtmlBody = "";
    if (templateType === "release") {
      formattedHtmlBody = getReleaseEmailHtml(messageBody);
    } else if (templateType === "feedback") {
      formattedHtmlBody = getFeedbackEmailHtml(messageBody);
    } else {
      formattedHtmlBody = getCustomEmailHtml(subject, messageBody);
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    console.log(`[email-batch] Starting announcement send to ${targetEmails.length} recipients...`);

    // Chunk in groups of 3 with 1s delay to respect SMTP rate limits & avoid serverless timeout
    const CHUNK_SIZE = 3;
    for (let i = 0; i < targetEmails.length; i += CHUNK_SIZE) {
      const chunk = targetEmails.slice(i, i + CHUNK_SIZE);
      
      const chunkResults = await Promise.allSettled(
        chunk.map(async (email) => {
          console.log(`[email-batch] Dispatching to: ${email}`);
          const info = await transporter!.sendMail({
            from: fromEmail,
            to: email,
            subject: subject,
            text: messageBody,
            html: formattedHtmlBody,
          });
          console.log(`[email-batch] Sent to ${email}, messageId: ${info.messageId}`);
          return email;
        })
      );

      chunkResults.forEach((result, idx) => {
        const email = chunk[idx];
        if (result.status === "fulfilled") {
          successCount++;
        } else {
          failedCount++;
          const errMessage = result.reason?.message || String(result.reason);
          console.error(`[email-batch] Failed for ${email}:`, errMessage);
          errors.push(`${email}: ${errMessage}`);
        }
      });

      if (i + CHUNK_SIZE < targetEmails.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`[email-batch] Completed batch send. Success: ${successCount}, Failed: ${failedCount}`);

    if (successCount === 0 && failedCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to send emails to all recipients. Error: ${errors[0]}`,
          errors,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      messageSentCount: successCount,
      failedCount: failedCount,
      recipientsCount: targetEmails.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("[email-batch] Fatal send-email route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to send email via Nodemailer.",
      },
      { status: 500 },
    );
  }
}

