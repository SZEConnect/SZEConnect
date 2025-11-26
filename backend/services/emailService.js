// services/emailService.js - SENDGRID VERSION
import nodemailer from 'nodemailer';

console.log('🔧 SendGrid Configuration:');
console.log('   SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET');
console.log('   EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey', // ← THIS MUST BE 'apikey' (literally)
    pass: process.env.SENDGRID_API_KEY
  }
});

// Send welcome email - keep your existing function
export async function sendWelcomeEmail(user) {
  const { email, username, neptun, major, startYear } = user;

  if (!process.env.SENDGRID_API_KEY) {
    console.log('❌ SendGrid not configured');
    return { 
      success: false, 
      error: 'SendGrid not configured. Set SENDGRID_API_KEY environment variable.' 
    };
  }

  const mailOptions = {
    from: {
      name: process.env.EMAIL_FROM_NAME || 'SzeConnect',
      address: process.env.EMAIL_FROM
    },
    to: email,
    subject: '🎉 Welcome to SzeConnect!',
    html: `...your existing HTML...`,
    text: `...your existing text...`
  };

  try {
    console.log(`📧 Attempting to send welcome email via SendGrid to: ${email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent successfully to: ${email}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
}
