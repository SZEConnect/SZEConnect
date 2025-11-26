// forgotpassword.js - Forgot Password Handler
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import pool from './database.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000,  // 10 seconds
  socketTimeout: 10000,       // 10 seconds
  greetingTimeout: 10000      // 10 seconds
});

/**
 * Generate a random 12-character password
 * @returns {string} - 12 character hexadecimal string
 */
export function generateTempPassword() {
  return crypto.randomBytes(6).toString('hex'); // 6 bytes = 12 hex characters
}

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

/**
 * Send temporary password email
 * @param {Object} user - User object with email and username
 * @param {string} tempPassword - The temporary password to send
 * @returns {Promise<Object>} - Success status
 */
export async function sendForgotPasswordEmail(user, tempPassword) {
  const { email, username } = user;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Cannot send email - credentials not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
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
    console.log(`📧 Sending password reset email to: ${email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent successfully to: ${email}`);
    console.log(`📨 Message ID: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main forgot password handler
 * @param {Object} req - Express request object with email in body
 * @param {Object} res - Express response object
 */
export async function handleForgotPassword(req, res) {
  try {
    const { email } = req.body;

    // Validation
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email exists in users table
    console.log(`🔍 Checking if email exists: ${normalizedEmail}`);
    const userResult = await pool.query(
      'SELECT user_id, email, username FROM users WHERE LOWER(email) = $1',
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      // For security: return same message even if email doesn't exist
      console.log(`⚠️ Email not found in database: ${normalizedEmail}`);
      return res.status(200).json({
        success: true,
        message: 'If the email exists in our database, a temporary password has been sent.'
      });
    }

    const user = userResult.rows[0];
    console.log(`✅ User found: ${user.username} (${user.email})`);

    // Generate temporary password (12 characters)
    const tempPassword = generateTempPassword();
    console.log(`🔐 Generated temporary password (${tempPassword.length} chars)`);

    // Hash the password
    const hashedPassword = await hashPassword(tempPassword);
    console.log(`🔒 Password hashed with bcrypt`);

    // Update password_hash in users table
    const updateResult = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE user_id = $2 RETURNING user_id, email, username',
      [hashedPassword, user.user_id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update password in database'
      });
    }

    console.log(`✅ Password updated in database for user: ${user.user_id}`);

    // Send email with temporary password
    const emailResult = await sendForgotPasswordEmail(user, tempPassword);

    if (!emailResult.success) {
      console.log(`⚠️ Email sending failed, but password was updated`);
      return res.status(500).json({
        success: false,
        error: 'Password reset initiated, but email could not be sent. Please try again later.'
      });
    }

    console.log(`✅ Forgot password process completed for: ${normalizedEmail}`);
    return res.status(200).json({
      success: true,
      message: 'Temporary password has been sent to your email address. Please check your inbox.'
    });

  } catch (error) {
    console.error('❌ Error in forgot password handler:', error.message);
    console.error(error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while processing your request. Please try again later.'
    });
  }
}

export default {
  generateTempPassword,
  hashPassword,
  sendForgotPasswordEmail,
  handleForgotPassword
};
