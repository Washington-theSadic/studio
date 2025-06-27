'use server';

import nodemailer from 'nodemailer';

// This is the email of the administrator who will receive the notifications.
// In a real application, you might fetch a list of admins from a database.
const ADMIN_EMAIL = 'jcimports@gmail.com';

// This function now uses Nodemailer to simulate sending a real email.
// In a real production app, you would replace the Ethereal account
// with your actual email service provider's credentials (e.g., SendGrid, Gmail).
// These credentials should be stored securely in environment variables.
async function createTransporter() {
  // For development, we'll use a free Ethereal test account.
  // Ethereal creates a fake SMTP server and a mailbox to preview sent emails.
  // This avoids sending real emails during development and testing.
  // The account is created on-the-fly, so no setup is needed.
  let testAccount = await nodemailer.createTestAccount();

  // Create a reusable transporter object using the Ethereal SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  return transporter;
}

/**
 * Sends a notification to the administrator via email.
 * @param subject The subject of the notification.
 * @param body The body of the notification, can be plain text or HTML.
 */
export async function sendAdminNotification(subject: string, body: string): Promise<void> {
  try {
    const transporter = await createTransporter();

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"JC Marketplace" <noreply@jcmarketplace.com>', // sender address
      to: ADMIN_EMAIL, // list of receivers
      subject: subject, // Subject line
      text: body, // plain text body
      html: `<pre>${body.replace(/\n/g, '<br>')}</pre>`, // html body
    });
    
    console.log('--- Admin Notification Email Sent ---');
    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    console.log('------------------------------------');
    // In production, you would not log the preview URL. This is for development convenience.

  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    // In a real app, you might want to add more robust error handling,
    // like a retry mechanism or logging to a monitoring service.
  }
}
