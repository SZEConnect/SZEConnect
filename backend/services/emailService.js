// services/emailService.js - ES Module version
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with absolute path
const envPath = path.join(__dirname, '..', '.env');
console.log('🔧 Loading .env from:', envPath);
console.log('🔧 .env exists?', fs.existsSync(envPath));

dotenv.config({ path: envPath });

// Debug: Check ALL environment variables
console.log('🔧 All environment variables:');
console.log('   PORT:', process.env.PORT);
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('   EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('   EMAIL_USER:', process.env.EMAIL_USER);
console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'Not set');
console.log('   EMAIL_FROM:', process.env.EMAIL_FROM);

// Create transporter (Gmail connection)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test the email connection
export async function testEmailConnection() {
  try {
    // Additional check for credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('❌ Email credentials missing:');
      console.log('   EMAIL_USER:', process.env.EMAIL_USER || 'MISSING');
      console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'MISSING');
      return false;
    }
    
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email connection failed:', error.message);
    return false;
  }
}

// Send welcome email
export async function sendWelcomeEmail(user) {
  const { email, username, neptun, major, startYear } = user;

  // Check if we have email credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Cannot send email - credentials not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: '🎉 Welcome to SzeConnect!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1F3351, #E1860E); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to SzeConnect! 🎓</h1>
            <p>Your university connection platform</p>
          </div>
          <div class="content">
            <h2>Hello ${username}!</h2>
            <p>Your registration was successful and your account is now active.</p>
            
            <div class="details">
              <h3>📋 Registration Details:</h3>
              <p><strong>Username:</strong> ${username}</p>
              <p><strong>Neptun Code:</strong> ${neptun}</p>
              <p><strong>Major:</strong> ${major}</p>
              <p><strong>Start Year:</strong> ${startYear}</p>
              <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString('hu-HU')}</p>
            </div>

            <p>You can now log in to your account and start connecting with other students!</p>
            
            <div class="footer">
              <p>Best regards,<br>The SzeConnect Team</p>
              <p><small>This is an automated message, please do not reply.</small></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to SzeConnect!

Hello ${username}!

Your registration was successful and your account is now active.

Registration Details:
- Username: ${username}
- Neptun Code: ${neptun} 
- Major: ${major}
- Start Year: ${startYear}
- Registration Date: ${new Date().toLocaleDateString('hu-HU')}

You can now log in to your account and start connecting with other students!

Best regards,
The SzeConnect Team

This is an automated message, please do not reply.
    `
  };

  try {
    console.log(`📧 Attempting to send welcome email to: ${email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent successfully to: ${email}`);
    console.log(`📨 Message ID: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Alternative: You could also export as default
// export default { testEmailConnection, sendWelcomeEmail };