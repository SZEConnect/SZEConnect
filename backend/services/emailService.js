// services/emailService.js - SENDGRID VERSION WITH DEBUG
import nodemailer from 'nodemailer';

console.log('🎯 DEBUG: emailService.js LOADED - SENDGRID VERSION');
console.log('🔧 SendGrid Configuration Check:');
console.log('   SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? `SET (length: ${process.env.SENDGRID_API_KEY.length})` : 'NOT SET');
console.log('   EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');
console.log('   EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME || 'Not set');

// Create transporter with error handling
let transporter;
try {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('❌ SendGrid API Key missing - transporter not created');
  } else {
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      },
      connectionTimeout: 30000, // Increase timeout
      socketTimeout: 30000
    });
    console.log('✅ SendGrid transporter created successfully');
    console.log('   Host:', transporter.options.host);
    console.log('   Port:', transporter.options.port);
  }
} catch (transporterError) {
  console.error('❌ Failed to create transporter:', transporterError.message);
  transporter = null;
}

// Send welcome email
export async function sendWelcomeEmail(user) {
  const { email, username, neptun, major, startYear } = user;

  console.log('🎯 DEBUG: sendWelcomeEmail function called');
  console.log('   Recipient:', email);
  console.log('   Transporter available:', !!transporter);

  if (!transporter) {
    const errorMsg = 'SendGrid transporter not available';
    console.log('❌', errorMsg);
    return { 
      success: false, 
      error: errorMsg 
    };
  }

  if (!process.env.SENDGRID_API_KEY) {
    const errorMsg = 'SendGrid API Key not configured';
    console.log('❌', errorMsg);
    return { 
      success: false, 
      error: errorMsg 
    };
  }

  const mailOptions = {
    from: {
      name: process.env.EMAIL_FROM_NAME || 'SzeConnect',
      address: process.env.EMAIL_FROM || 'noreply@szeconnect.com'
    },
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

  console.log('📧 Attempting to send welcome email via SendGrid...');
  console.log('   From:', mailOptions.from);
  console.log('   To:', mailOptions.to);
  console.log('   Subject:', mailOptions.subject);

  try {
    // Test connection first
    console.log('🔄 Testing SendGrid connection...');
    await transporter.verify();
    console.log('✅ SendGrid connection verified');

    // Send email
    console.log('🔄 Sending email...');
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Welcome email sent successfully via SendGrid!');
    console.log('   Message ID:', result.messageId);
    console.log('   Response:', result.response);
    
    return { 
      success: true, 
      messageId: result.messageId 
    };
  } catch (error) {
    console.error('❌ SendGrid email failed:');
    console.error('   Error:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Command:', error.command);
    
    return { 
      success: false, 
      error: `SendGrid error: ${error.message}` 
    };
  }
}
