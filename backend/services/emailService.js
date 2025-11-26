// services/emailService.js - SENDGRID WEB API VERSION
import sgMail from '@sendgrid/mail';

console.log('🎯 DEBUG: emailService.js LOADED - SENDGRID WEB API VERSION');
console.log('🔧 SendGrid Web API Configuration:');
console.log('   SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? `SET (length: ${process.env.SENDGRID_API_KEY.length})` : 'NOT SET');
console.log('   EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');
console.log('   EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME || 'Not set');

// Set SendGrid API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid API key configured');
} else {
  console.log('❌ SendGrid API key not configured');
}

// Send welcome email
export async function sendWelcomeEmail(user) {
  const { email, username, neptun, major, startYear } = user;

  console.log('🎯 DEBUG: sendWelcomeEmail called - SendGrid Web API');
  console.log('   Recipient:', email);

  if (!process.env.SENDGRID_API_KEY) {
    console.log('❌ SendGrid API Key not configured');
    return { 
      success: false, 
      error: 'SendGrid not configured. Set SENDGRID_API_KEY environment variable.' 
    };
  }

  const msg = {
    to: email,
    from: {
      email: process.env.EMAIL_FROM || 'szeconnect.projektmunka@gmail.com',
      name: process.env.EMAIL_FROM_NAME || 'SzeConnect'
    },
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
    console.log('📧 Sending email via SendGrid Web API...');
    console.log('   From:', msg.from);
    console.log('   To:', msg.to);
    console.log('   Subject:', msg.subject);
    
    const result = await sgMail.send(msg);
    
    console.log('✅ Email sent successfully via SendGrid Web API!');
    console.log('   Status Code:', result[0].statusCode);
    console.log('   Message ID:', result[0].headers['x-message-id']);
    
    return { 
      success: true, 
      messageId: result[0].headers['x-message-id'],
      statusCode: result[0].statusCode
    };
  } catch (error) {
    console.error('❌ SendGrid Web API error:');
    console.error('   Error message:', error.message);
    
    if (error.response) {
      console.error('   Status Code:', error.response.statusCode);
      console.error('   Response Body:', error.response.body);
      console.error('   Response Headers:', error.response.headers);
    }
    
    return { 
      success: false, 
      error: `SendGrid error: ${error.message}` 
    };
  }
}

// Optional: Test function for SendGrid
export async function testEmailConnection() {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('❌ SendGrid API Key not configured');
    return false;
  }
  
  console.log('✅ SendGrid API Key is configured');
  return true;
}

// Send forgot password email via SendGrid
export async function sendForgotPasswordEmail(user, tempPassword) {
  const { email, username } = user;

  console.log('🎯 DEBUG: sendForgotPasswordEmail called - SendGrid Web API');
  console.log('   Recipient:', email);

  if (!process.env.SENDGRID_API_KEY) {
    console.log('❌ SendGrid API Key not configured');
    return { 
      success: false, 
      error: 'SendGrid not configured. Set SENDGRID_API_KEY environment variable.' 
    };
  }

  const msg = {
    to: email,
    from: {
      email: process.env.EMAIL_FROM || 'szeconnect.projektmunka@gmail.com',
      name: process.env.EMAIL_FROM_NAME || 'SzeConnect'
    },
    subject: '🔐 Password Reset - SzeConnect',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1F3351, #E1860E); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .password-box { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border: 2px solid #E1860E;
            text-align: center;
          }
          .password-display { 
            font-size: 28px; 
            font-weight: bold; 
            font-family: 'Courier New', monospace; 
            color: #1F3351;
            letter-spacing: 2px;
            word-break: break-all;
          }
          .password-label { 
            font-size: 12px; 
            color: #666; 
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .instructions { 
            background: #fff3cd; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 4px solid #ffc107;
          }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { color: #dc3545; font-weight: bold; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>Your temporary password is ready</p>
          </div>
          <div class="content">
            <h2>Hello ${username}!</h2>
            <p>A password reset request was made for your SzeConnect account.</p>
            
            <div class="password-box">
              <div class="password-label">Your Temporary Password:</div>
              <div class="password-display">${tempPassword}</div>
            </div>

            <div class="instructions">
              <h3>📝 How to use your temporary password:</h3>
              <ol>
                <li>Go to the SzeConnect login page</li>
                <li>Enter your email and the temporary password above</li>
                <li>Once logged in, visit your <strong>Profile Page</strong></li>
                <li>Change your password to something secure that only you know</li>
              </ol>
            </div>

            <div class="warning">
              ⚠️ <strong>Security Notice:</strong> This temporary password is only valid for immediate use. Change it immediately after logging in.
            </div>

            <p style="margin-top: 20px; color: #666;">If you didn't request this password reset, please ignore this email.</p>
            
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
Password Reset - SzeConnect

Hello ${username}!

A password reset request was made for your SzeConnect account.

Your Temporary Password: ${tempPassword}

How to use your temporary password:
1. Go to the SzeConnect login page
2. Enter your email and the temporary password above
3. Once logged in, visit your Profile Page
4. Change your password to something secure that only you know

Security Notice: This temporary password is only valid for immediate use. 
Change it immediately after logging in.

If you didn't request this password reset, please ignore this email.

Best regards,
The SzeConnect Team

This is an automated message, please do not reply.
    `
  };

  try {
    console.log('📧 Sending password reset email via SendGrid Web API...');
    console.log('   From:', msg.from);
    console.log('   To:', msg.to);
    console.log('   Subject:', msg.subject);
    
    const result = await sgMail.send(msg);
    
    console.log('✅ Password reset email sent successfully via SendGrid Web API!');
    console.log('   Status Code:', result[0].statusCode);
    console.log('   Message ID:', result[0].headers['x-message-id']);
    
    return { 
      success: true, 
      messageId: result[0].headers['x-message-id'],
      statusCode: result[0].statusCode
    };
  } catch (error) {
    console.error('❌ SendGrid Web API error:');
    console.error('   Error message:', error.message);
    
    if (error.response) {
      console.error('   Status Code:', error.response.statusCode);
      console.error('   Response Body:', error.response.body);
      console.error('   Response Headers:', error.response.headers);
    }
    
    return { 
      success: false, 
      error: `SendGrid error: ${error.message}` 
    };
  }
}
