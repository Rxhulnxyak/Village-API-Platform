import nodemailer from 'nodemailer';

/**
 * Transporter configuration using environment variables.
 * For production, use SMTP_PASS (SendGrid API Key).
 * For development, it fails gracefully if no credentials are found.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SMTP_PASS || '',
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.SMTP_PASS && process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: Email failed to send because SMTP_PASS is missing in production.');
    return;
  }

  if (!process.env.SMTP_PASS) {
    console.log('--- DEVELOPMENT EMAIL LOG ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('--- END LOG ---');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"VillageAPI" <noreply@villageapi.com>',
      to,
      subject,
      html,
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}
