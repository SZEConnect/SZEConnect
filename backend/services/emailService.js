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

// Add these functions to your existing emailService.js file:

// Send warning email
export async function sendWarningEmail(user, warningCount, reason) {
  const { email, username } = user;

  console.log('🎯 DEBUG: sendWarningEmail called - SendGrid Web API');
  console.log('   Recipient:', email);
  console.log('   Warning Count:', warningCount);
  console.log('   Reason:', reason);

  if (!process.env.SENDGRID_API_KEY) {
    console.log('❌ SendGrid API Key not configured');
    return { 
      success: false, 
      error: 'SendGrid not configured. Set SENDGRID_API_KEY environment variable.' 
    };
  }

  const subject = warningCount === 3 
    ? '🚨 Final Warning - Your account will be banned' 
    : `⚠️ Warning: You received a warning on SzeConnect`;

  const isFinalWarning = warningCount === 3;
  const isSecondWarning = warningCount === 2;

  const msg = {
    to: email,
    from: {
      email: process.env.EMAIL_FROM || 'szeconnect.projektmunka@gmail.com',
      name: process.env.EMAIL_FROM_NAME || 'SzeConnect Moderation'
    },
    subject: subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { 
            background: linear-gradient(135deg, ${isFinalWarning ? '#dc2626, #991b1b' : '#f59e0b, #d97706'}); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
          }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning-details { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border: 2px solid ${isFinalWarning ? '#dc2626' : '#f59e0b'};
          }
          .warning-count { 
            font-size: 24px; 
            font-weight: bold; 
            text-align: center;
            margin: 15px 0;
            color: ${isFinalWarning ? '#dc2626' : '#d97706'};
          }
          .ban-notice { 
            background: #fee2e2; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 4px solid #dc2626;
          }
          .second-warning { 
            background: #fef3c7; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
          }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isFinalWarning ? '🚨 Final Warning' : '⚠️ Content Warning'}</h1>
            <p>${isFinalWarning ? 'Account suspension notice' : 'Community guidelines violation'}</p>
          </div>
          <div class="content">
            <h2>Hello ${username}!</h2>
            <p>Your content on SzeConnect has been reported for violating community guidelines.</p>
            
            <div class="warning-details">
              <h3>📋 Report Details:</h3>
              <p><strong>Reason:</strong> ${reason}</p>
              <div class="warning-count">
                Current warning count: ${warningCount}/3
              </div>
              <p><strong>Report Date:</strong> ${new Date().toLocaleDateString('hu-HU')}</p>
            </div>

            ${isFinalWarning ? `
            <div class="ban-notice">
              <h3>🚨 Account Suspension</h3>
              <p>You have reached <strong>3 warnings</strong> for community violations.</p>
              <p>Your account has been <strong>temporarily banned for 2 hours</strong>.</p>
              <p><strong>During this ban, you cannot:</strong></p>
              <ul>
                <li>Create new posts or comments</li>
                <li>Like or interact with content</li>
                <li>Join or create groups</li>
              </ul>
              <p>Your account will be automatically reinstated after the ban period ends.</p>
            </div>
            ` : isSecondWarning ? `
            <div class="second-warning">
              <h3>⚠️ Important Notice</h3>
              <p>This is your <strong>second warning</strong>.</p>
              <p>One more violation will result in a <strong>2-hour account ban</strong>.</p>
              <p>Please review our community guidelines to avoid further violations.</p>
            </div>
            ` : ''}

            <p>Please ensure your future content follows our community guidelines to maintain a positive environment for all users.</p>
            
            <div class="footer">
              <p>This is an automated message from SzeConnect moderation system.</p>
              <p><small>Please do not reply to this email.</small></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
${isFinalWarning ? '🚨 FINAL WARNING' : '⚠️ WARNING'}

Hello ${username}!

Your content on SzeConnect has been reported for violating community guidelines.

Report Details:
- Reason: ${reason}
- Warning count: ${warningCount}/3
- Date: ${new Date().toLocaleDateString('hu-HU')}

${isFinalWarning ? `
🚨 ACCOUNT SUSPENSION
You have reached 3 warnings for community violations.
Your account has been temporarily banned for 2 hours.

During this ban, you cannot:
- Create new posts or comments
- Like or interact with content  
- Join or create groups

Your account will be automatically reinstated after the ban period ends.
` : isSecondWarning ? `
⚠️ IMPORTANT NOTICE
This is your second warning.
One more violation will result in a 2-hour account ban.
Please review our community guidelines to avoid further violations.
` : ''}

Please ensure your future content follows our community guidelines.

This is an automated message from SzeConnect moderation system.
Please do not reply to this email.
    `
  };

  try {
    console.log('📧 Sending warning email via SendGrid Web API...');
    console.log('   From:', msg.from);
    console.log('   To:', msg.to);
    console.log('   Subject:', msg.subject);
    
    const result = await sgMail.send(msg);
    
    console.log('✅ Warning email sent successfully via SendGrid Web API!');
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

// Send ban notification email
export async function sendBanNotificationEmail(user, banDurationHours) {
  const { email, username } = user;

  console.log('🎯 DEBUG: sendBanNotificationEmail called - SendGrid Web API');
  console.log('   Recipient:', email);
  console.log('   Ban Duration:', banDurationHours, 'hours');

  if (!process.env.SENDGRID_API_KEY) {
    console.log('❌ SendGrid API Key not configured');
    return { 
      success: false, 
      error: 'SendGrid not configured. Set SENDGRID_API_KEY environment variable.' 
    };
  }

  const banEndTime = new Date(Date.now() + banDurationHours * 60 * 60 * 1000);

  const msg = {
    to: email,
    from: {
      email: process.env.EMAIL_FROM || 'szeconnect.projektmunka@gmail.com',
      name: process.env.EMAIL_FROM_NAME || 'SzeConnect Moderation'
    },
    subject: '🚨 Account Temporarily Banned - SzeConnect',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { 
            background: linear-gradient(135deg, #dc2626, #991b1b); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
          }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .ban-details { 
            background: #fee2e2; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border: 2px solid #dc2626;
          }
          .time-display { 
            font-size: 22px; 
            font-weight: bold; 
            text-align: center;
            margin: 15px 0;
            color: #dc2626;
            background: white;
            padding: 15px;
            border-radius: 6px;
          }
          .restrictions { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 4px solid #dc2626;
          }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .countdown { 
            font-size: 18px; 
            font-weight: bold;
            color: #dc2626;
            text-align: center;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Account Temporarily Banned</h1>
            <p>Community guidelines violation</p>
          </div>
          <div class="content">
            <h2>Hello ${username}!</h2>
            <p>Your SzeConnect account has been temporarily suspended due to multiple community guidelines violations.</p>
            
            <div class="ban-details">
              <h3>📋 Ban Details:</h3>
              
              <div class="time-display">
                Ban Duration: ${banDurationHours} hours
              </div>
              
              <p><strong>Ban Started:</strong> ${new Date().toLocaleString('hu-HU')}</p>
              <p><strong>Ban Ends:</strong> ${banEndTime.toLocaleString('hu-HU')}</p>
              
              <div class="countdown">
                ⏰ Time remaining: ${banDurationHours} hours
              </div>
              
              <p><strong>Reason:</strong> Received 3 warnings for community violations</p>
            </div>

            <div class="restrictions">
              <h3>🚫 Account Restrictions:</h3>
              <p>During this ban period, you will not be able to:</p>
              <ul>
                <li>Create new posts or comments</li>
                <li>Like, dislike, or interact with content</li>
                <li>Join or create groups</li>
                <li>Send messages to other users</li>
                <li>Update your profile</li>
              </ul>
              <p>You can still view content, but all interactive features are disabled.</p>
            </div>

            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>📝 After the Ban:</h3>
              <p>Once the ban period ends:</p>
              <ol>
                <li>Your warning count will be <strong>reset to 0</strong></li>
                <li>All account features will be restored automatically</li>
                <li>You can resume using SzeConnect normally</li>
              </ol>
              <p>Please review our community guidelines before posting again to avoid future violations.</p>
            </div>

            <p style="text-align: center; color: #666;">
              This ban is automated based on our community guidelines enforcement system.
            </p>
            
            <div class="footer">
              <p>This is an automated message from SzeConnect moderation system.</p>
              <p><small>Please do not reply to this email.</small></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
🚨 ACCOUNT TEMPORARILY BANNED

Hello ${username}!

Your SzeConnect account has been temporarily suspended due to multiple community guidelines violations.

Ban Details:
- Duration: ${banDurationHours} hours
- Started: ${new Date().toLocaleString('hu-HU')}
- Ends: ${banEndTime.toLocaleString('hu-HU')}
- Reason: Received 3 warnings for community violations

Account Restrictions:
During this ban period, you cannot:
- Create new posts or comments
- Like, dislike, or interact with content
- Join or create groups
- Send messages to other users
- Update your profile

You can still view content, but all interactive features are disabled.

After the Ban:
1. Your warning count will be reset to 0
2. All account features will be restored automatically
3. You can resume using SzeConnect normally

Please review our community guidelines before posting again.

This is an automated message from SzeConnect moderation system.
Please do not reply to this email.
    `
  };

  try {
    console.log('📧 Sending ban notification email via SendGrid Web API...');
    console.log('   From:', msg.from);
    console.log('   To:', msg.to);
    console.log('   Subject:', msg.subject);
    
    const result = await sgMail.send(msg);
    
    console.log('✅ Ban notification email sent successfully via SendGrid Web API!');
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
