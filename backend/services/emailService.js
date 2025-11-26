// services/emailService.js - RENDER COMPATIBLE
import nodemailer from 'nodemailer';

// Debug: Check email environment variables for RENDER
console.log('🔧 Email Configuration Check on RENDER:');
console.log('   EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'Not set');
console.log('   EMAIL_USER:', process.env.EMAIL_USER || 'Not set');
console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'Not set');
console.log('   EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');

// Check if email is configured
const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;
console.log('   📧 Email service available:', isEmailConfigured ? 'YES' : 'NO');

let transporter = null;

// Only create transporter if credentials exist (RENDER environment)
if (isEmailConfigured) {
  try {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Timeout settings for RENDER
      connectionTimeout: 15000,
      socketTimeout: 15000,
      greetingTimeout: 10000
    });
    console.log('✅ Email transporter created for RENDER');
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
    transporter = null;
  }
} else {
  console.log('⚠️ Email not configured on RENDER');
  console.log('💡 Set EMAIL_USER and EMAIL_PASS in RENDER Environment Variables');
}

// Test the email connection
export async function testEmailConnection() {
  try {
    if (!transporter) {
      console.log('❌ Email transporter not available on RENDER');
      return false;
    }
    
    console.log('🔄 Testing email connection on RENDER...');
    await transporter.verify();
    console.log('✅ Email server is ready to send messages from RENDER');
    return true;
  } catch (error) {
    console.error('❌ Email connection failed on RENDER:', error.message);
    return false;
  }
}

// Send welcome email
export async function sendWelcomeEmail(user) {
  const { email, username, neptun, major, startYear } = user;

  // Check if email is configured on RENDER
  if (!transporter) {
    console.log('❌ Email service not configured on RENDER');
    return { 
      success: false, 
      error: 'Email service not configured on RENDER. Please set EMAIL_USER and EMAIL_PASS environment variables.' 
    };
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
    console.log(`📧 Attempting to send welcome email from RENDER to: ${email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent successfully from RENDER to: ${email}`);
    console.log(`📨 Message ID: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email from RENDER to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Check if email is configured
export function isEmailConfigured() {
  return !!transporter;
}
