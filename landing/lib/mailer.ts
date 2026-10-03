import nodemailer from "nodemailer";

// Lazy / Singleton pooled Nodemailer transporter instance
const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const isConfigured = Boolean(smtpHost && smtpUser && smtpPass);

export const transporter = isConfigured
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for 587 (STARTTLS)
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      pool: true, // Reuse SMTP connection pool across serverless invocations
      maxConnections: 3, // Keep active connections lightweight for serverless
      maxMessages: 100, // Send up to 100 messages per connection
      connectionTimeout: 8000, // 8s connection timeout (shorter than Vercel 10s limit)
      greetingTimeout: 8000, // 8s greeting timeout
      socketTimeout: 8000, // 8s socket timeout
    })
  : null;

// Startup connection verifier for health checks & cold-starts
if (transporter) {
  transporter.verify().then(
    () => console.log("[mailer] SMTP connection verified & ready to send."),
    (err) => console.error("[mailer] SMTP verification failed on initialization:", err)
  );
}

export function isMailerConfigured(): boolean {
  return Boolean(transporter);
}
