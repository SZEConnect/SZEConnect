// forgotpassword.js - Forgot Password Handler
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import pool from './database.js';
import { sendForgotPasswordEmail as sendEmailViaService } from './services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

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
 * Send temporary password email (uses email service)
 * @param {Object} user - User object with email and username
 * @param {string} tempPassword - The temporary password to send
 * @returns {Promise<Object>} - Success status
 */
export async function sendForgotPasswordEmail(user, tempPassword) {
  console.log(`📧 Sending forgot password email via emailService to: ${user.email}`);
  
  try {
    const result = await sendEmailViaService(user, tempPassword);
    
    if (result.success) {
      console.log(`✅ Forgot password email sent successfully`);
    } else {
      console.error(`❌ Failed to send forgot password email:`, result.error);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ Error sending forgot password email:`, error.message);
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
