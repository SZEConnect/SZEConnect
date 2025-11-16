// server.js

import dotenv from 'dotenv';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import pool, { testConnection } from './database.js';
import { sendWelcomeEmail, testEmailConnection } from './services/emailService.js';

dotenv.config();

console.log('🔧 Environment Check:');
console.log('   DB_HOST:', process.env.DB_HOST);
console.log('   DB_USER:', process.env.DB_USER);
console.log('   DB_NAME:', process.env.DB_NAME);
console.log('   DB_PORT:', process.env.DB_PORT);

const app = express();

// ✅ CRITICAL: Add CORS support BEFORE routes
app.use(cors({
  origin: '*', // for testing: allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 3000;
const secret = process.env.JWT_SECRET;

// --------------------
// ROOT ROUTE
// --------------------
app.get("/", (req, res) => {
  res.json({ 
    message: "Authentication Server is running with PostgreSQL!",
    endpoints: {
      test: "GET /test-env",
      testDb: "GET /test-db",
      register: "POST /register",
      login: "POST /login", 
      profile: "GET /profile (requires auth)",
      users: "GET /users",
      groups: "GET /groups",
      userGroups: "GET /user/groups"
    }
  });
});

// --------------------
// TEST ENV ROUTE - UPDATED FOR NEW DB VARS
// --------------------
app.get("/test-env", (req, res) => {
  res.json({
    port: process.env.PORT,
    secretSet: !!process.env.JWT_SECRET,
    database: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      allSet: !!(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME && process.env.DB_PORT)
    },
    message: "Environment variables loaded successfully!"
  });
});

// --------------------
// TEST DATABASE CONNECTION
// --------------------
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    res.json({ 
      success: true, 
      message: 'PostgreSQL database connected!',
      time: result.rows[0].current_time,
      version: result.rows[0].postgres_version,
      connection: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: err.message,
      connectionDetails: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER
      }
    });
  }
});

// --------------------
// ENHANCED REGISTER ROUTE WITH NEW FIELDS + EMAIL
// --------------------
app.post("/register", async (req, res) => {
  try {
    const { 
      username, 
      neptun, 
      startYear, 
      major, 
      email, 
      password, 
      passwordAgain,
      fullName,     
      bio,          
      gender,       
      birthYear     
    } = req.body;

    console.log("📝 Registration attempt:", { username, email, neptun });

    // === MANDATORY FIELD VALIDATION ===
    const mandatoryFields = { username, neptun, startYear, major, email, password, passwordAgain };
    const missingFields = Object.entries(mandatoryFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields",
        missing: missingFields
      });
    }

    // === PASSWORD MATCH VALIDATION ===
    if (password !== passwordAgain) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    // === DATA VALIDATION ===
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    const neptunRegex = /^[A-Z0-9]{6}$/i;
    if (!neptunRegex.test(neptun)) {
      return res.status(400).json({
        success: false,
        message: "Neptun code must be exactly 6 alphanumeric characters"
      });
    }

    const currentYear = new Date().getFullYear();
    if (startYear < 2000 || startYear > currentYear + 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid start year"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // === NORMALIZE DATA ===
    const normalizedNeptun = neptun.toUpperCase().trim();
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();
    const normalizedMajor = major.trim();
    const normalizedFullName = fullName ? fullName.trim() : null;
    const normalizedBio = bio ? bio.trim() : null;

    // === UNIQUENESS CHECKS (POSTGRESQL) ===
    try {
      const existingUsers = await pool.query(
        `SELECT * FROM users WHERE email = $1 OR username = $2 OR neptun_code = $3`,
        [normalizedEmail, normalizedUsername, normalizedNeptun]
      );

      if (existingUsers.rows.length > 0) {
        const existing = existingUsers.rows[0];
        if (existing.email === normalizedEmail) {
          return res.status(400).json({ 
            success: false,
            message: "Email already registered"
          });
        }
        if (existing.username === normalizedUsername) {
          return res.status(400).json({ 
            success: false,
            message: "Username already taken" 
          });
        }
        if (existing.neptun_code === normalizedNeptun) {
          return res.status(400).json({ 
            success: false,
            message: "Neptun code already registered" 
          });
        }
      }
    } catch (dbError) {
      console.error("❌ Database error during uniqueness check:", dbError);
      return res.status(500).json({ 
        success: false,
        message: "Database error during validation",
        error: dbError.message
      });
    }

    // === HASH PASSWORD ===
    const hashedPassword = await bcrypt.hash(password, 12);

    // === SAVE USER TO DATABASE (POSTGRESQL) ===
    let result;
    try {
      result = await pool.query(
        `INSERT INTO users 
         (username, neptun_code, fullname, birthdate, gender, email, start_year, major, bio, password_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          normalizedUsername,      // $1
          normalizedNeptun,        // $2  
          normalizedFullName,      // $3
          birthYear ? `${birthYear}-01-01` : null,  // $4
          gender,                  // $5
          normalizedEmail,         // $6
          parseInt(startYear),     // $7
          normalizedMajor,         // $8
          normalizedBio,           // $9
          hashedPassword           // $10
        ]
      );

      console.log("✅ Database insert successful! New user:", result.rows[0]);
    } catch (insertError) {
      console.error("❌ Database insert error:", insertError);
      console.error("❌ Insert query details:", {
        username: normalizedUsername,
        email: normalizedEmail,
        neptun: normalizedNeptun,
        startYear: parseInt(startYear),
        major: normalizedMajor
      });
      return res.status(500).json({ 
        success: false,
        message: "Database error during user creation",
        error: insertError.message,
        code: insertError.code
      });
    }

    // === CREATE USER OBJECT FOR EMAIL ===
    const newUser = { 
      id: result.rows[0].user_id,
      username: result.rows[0].username,
      email: result.rows[0].email,
      neptun: result.rows[0].neptun_code,
      startYear: result.rows[0].start_year,
      major: result.rows[0].major,
      fullName: result.rows[0].fullname,
      bio: result.rows[0].bio,
      gender: result.rows[0].gender,
      birthYear: result.rows[0].birthdate ? new Date(result.rows[0].birthdate).getFullYear() : null,
      createdAt: result.rows[0].created_at || new Date().toISOString()
    };

    // ========================
    // 🎉 EMAIL INTEGRATION
    // ========================
    // Send welcome email ASYNCHRONOUSLY (don't wait for it)
    sendWelcomeEmail(newUser)
      .then(emailResult => {
        if (emailResult && emailResult.success) {
          console.log(`📧 Welcome email sent to ${newUser.email}`);
          console.log(`📨 Message ID: ${emailResult.messageId}`);
        } else {
          console.log(`⚠️  Email failed for ${newUser.email}:`, emailResult?.error || 'Unknown error');
        }
      })
      .catch(emailError => {
        console.log(`⚠️  Email error for ${newUser.email}: ${emailError.message}`);
      });

    // === SUCCESS RESPONSE ===
    res.status(201).json({ 
      success: true,
      message: "User registered successfully", 
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        neptun: newUser.neptun,
        startYear: newUser.startYear,
        major: newUser.major,
        fullName: newUser.fullName,
        bio: newUser.bio,
        gender: newUser.gender,
        birthYear: newUser.birthYear,
        createdAt: newUser.createdAt
      },
      emailSent: true
    });

  } catch (error) {
    console.error("❌ Unexpected registration error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error during registration",
      error: error.message
    });
  }
});

// --------------------
// LOGIN ROUTE (POSTGRESQL)
// --------------------
app.post("/login", async (req, res) => {
  try {
    const { neptun, password } = req.body;

    if (!neptun || !password) {
      return res.status(400).json({ message: "Neptun and password are required" });
    }

    // Query PostgreSQL database
    const result = await pool.query(
      'SELECT * FROM users WHERE neptun_code = $1',
      [neptun.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    
    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { 
        id: user.user_id,
        username: user.username,
        neptun: user.neptun_code 
      },
      secret,
      { expiresIn: "1h" }
    );

    res.json({ 
      message: "Login successful", 
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        neptun: user.neptun_code,
        major: user.major,
        start_year: user.start_year
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error during login" });
  }
});

// --------------------
// PROTECTED PROFILE ROUTE (POSTGRESQL)
// --------------------
app.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided. Use format: Authorization: Bearer <token>" });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    
    if (!token) {
      return res.status(401).json({ message: "Invalid authorization format. Use: Bearer <token>" });
    }

    const decoded = jwt.verify(token, secret);
    
    // Find user in PostgreSQL database
    const result = await pool.query(
      'SELECT * FROM users WHERE user_id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    res.json({ 
      message: `Hello ${decoded.username}, welcome to your profile!`,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        neptun: user.neptun_code,
        startYear: user.start_year,
        major: user.major,
        fullName: user.fullname,
        bio: user.bio,
        gender: user.gender,
        birthdate: user.birthdate,
        createdAt: user.created_at
      }
    });

  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// --------------------
// USERS LIST (POSTGRESQL)
// --------------------
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, username, email, neptun_code, major, start_year FROM users ORDER BY user_id'
    );
    
    res.json({
      totalUsers: result.rows.length,
      users: result.rows.map(u => ({
        id: u.user_id,
        username: u.username,
        email: u.email,
        neptun: u.neptun_code,
        major: u.major,
        startYear: u.start_year
      }))
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// --------------------
// GROUP ENDPOINTS (POSTGRESQL)
// --------------------

// Get all available groups from database
app.get("/groups", async (req, res) => {
  try {
    const { category, major, search } = req.query;
    
    let query = `
      SELECT g.*, u.username as creator_name 
      FROM groupok g 
      LEFT JOIN users u ON g.creator_id = u.user_id
    `;
    let params = [];
    let conditions = [];

    if (search) {
      conditions.push(`(g.group_name ILIKE $${params.length + 1} OR g.description ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY g.group_name';

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      total: result.rows.length,
      groups: result.rows.map(g => ({
        id: g.group_id,
        name: g.group_name,
        description: g.description,
        creator: g.creator_name,
        createdAt: g.created_at
      }))
    });

  } catch (error) {
    console.error("❌ Error fetching groups:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch groups" 
    });
  }
});

// Get a specific group by ID
app.get("/groups/:groupId", async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    
    const groupResult = await pool.query(
      `SELECT g.*, u.username as creator_name 
       FROM groupok g 
       LEFT JOIN users u ON g.creator_id = u.user_id 
       WHERE g.group_id = $1`,
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Group not found" 
      });
    }

    const group = groupResult.rows[0];

    // Get members of this group
    const membersResult = await pool.query(
      `SELECT u.user_id, u.username, u.major, u.start_year 
       FROM followings f
       JOIN users u ON f.user_id = u.user_id
       WHERE f.group_id = $1`,
      [groupId]
    );

    res.json({
      success: true,
      group: {
        id: group.group_id,
        name: group.group_name,
        description: group.description,
        creator: group.creator_name,
        memberCount: membersResult.rows.length,
        createdAt: group.created_at,
        members: membersResult.rows
      }
    });

  } catch (error) {
    console.error("❌ Error fetching group:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch group" 
    });
  }
});

// Join a group
app.post("/groups/:groupId/join", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: "Authorization token required" 
      });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    const decoded = jwt.verify(token, secret);
    
    const userId = decoded.id;
    const groupId = parseInt(req.params.groupId);
    
    // Check if group exists
    const groupResult = await pool.query(
      'SELECT * FROM groupok WHERE group_id = $1',
      [groupId]
    );
    
    if (groupResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Group not found" 
      });
    }
    
    const group = groupResult.rows[0];
    
    // Check if user exists
    const userResult = await pool.query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Check if already joined
    const existingMembership = await pool.query(
      'SELECT * FROM followings WHERE user_id = $1 AND group_id = $2',
      [userId, groupId]
    );
    
    if (existingMembership.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Already joined this group" 
      });
    }
    
    // Add membership
    await pool.query(
      'INSERT INTO followings (user_id, group_id) VALUES ($1, $2)',
      [userId, groupId]
    );

    console.log(`✅ User ${userId} joined group: ${group.group_name}`);

    res.json({
      success: true,
      message: `Successfully joined ${group.group_name}`,
      group: {
        id: group.group_id,
        name: group.group_name
      }
    });
    
  } catch (error) {
    console.error("❌ Error joining group:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to join group" 
    });
  }
});

// Leave a group
app.post("/groups/:groupId/leave", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: "Authorization token required" 
      });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    const decoded = jwt.verify(token, secret);
    
    const userId = decoded.id;
    const groupId = parseInt(req.params.groupId);
    
    // Check if group exists
    const groupResult = await pool.query(
      'SELECT * FROM groupok WHERE group_id = $1',
      [groupId]
    );
    
    if (groupResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Group not found" 
      });
    }
    
    const group = groupResult.rows[0];
    
    // Remove membership
    const result = await pool.query(
      'DELETE FROM followings WHERE user_id = $1 AND group_id = $2',
      [userId, groupId]
    );
    
    if (result.rowCount === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Not a member of this group" 
      });
    }

    console.log(`✅ User ${userId} left group: ${group.group_name}`);

    res.json({
      success: true,
      message: `Successfully left ${group.group_name}`,
      group: {
        id: group.group_id,
        name: group.group_name
      }
    });
    
  } catch (error) {
    console.error("❌ Error leaving group:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to leave group" 
    });
  }
});

// Get user's joined groups
app.get("/user/groups", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: "Authorization token required" 
      });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    const decoded = jwt.verify(token, secret);
    
    const userId = decoded.id;
    
    const result = await pool.query(
      `SELECT g.*, u.username as creator_name 
       FROM followings f
       JOIN groupok g ON f.group_id = g.group_id
       LEFT JOIN users u ON g.creator_id = u.user_id
       WHERE f.user_id = $1`,
      [userId]
    );
    
    res.json({
      success: true,
      total: result.rows.length,
      groups: result.rows.map(g => ({
        id: g.group_id,
        name: g.group_name,
        description: g.description,
        creator: g.creator_name,
        memberCount: g.member_count || 0
      }))
    });
    
  } catch (error) {
    console.error("❌ Error fetching user groups:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get user groups" 
    });
  }
});

// --------------------
// DEV UTILITY ENDPOINTS
// --------------------

// Get server statistics
app.get('/dev/stats', async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const groupsCount = await pool.query('SELECT COUNT(*) FROM groupok');
    const membershipsCount = await pool.query('SELECT COUNT(*) FROM followings');
    const lastUser = await pool.query('SELECT * FROM users ORDER BY user_id DESC LIMIT 1');

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalGroups: parseInt(groupsCount.rows[0].count),
      totalMemberships: parseInt(membershipsCount.rows[0].count),
      lastUser: lastUser.rows[0] || null,
      serverUptime: Math.floor(process.uptime()) + ' seconds',
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create test user quickly
app.post('/dev/test-user', async (req, res) => {
  try {
    const testId = Date.now().toString().slice(-4);
    const testUser = {
      username: 'testuser_' + testId,
      email: `test${testId}@example.com`,
      neptun: 'TST' + testId,
      password: 'testpass123',
      startYear: 2024,
      major: 'Computer Science'
    };

    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    
    const result = await pool.query(
      `INSERT INTO users 
       (username, neptun_code, email, start_year, major, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        testUser.username,
        testUser.neptun,
        testUser.email,
        testUser.startYear,
        testUser.major,
        hashedPassword
      ]
    );

    const newUser = result.rows[0];
    
    res.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        neptun: newUser.neptun_code
      }
    });
  } catch (error) {
    console.error("Error creating test user:", error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create test user',
      error: error.message
    });
  }
});

// --------------------
// EMAIL TEST ENDPOINT
// --------------------
app.get('/test-email', async (req, res) => {
  try {
    // Test email configuration
    const connectionTest = await testEmailConnection();
    
    if (!connectionTest) {
      return res.status(500).json({
        success: false,
        message: "Email server connection failed. Check your .env configuration."
      });
    }

    // Test sending an email
    const testUser = {
      email: process.env.EMAIL_USER, // Send to yourself for testing
      username: "TestUser",
      neptun: "TEST99",
      major: "Computer Science",
      startYear: 2024
    };

    const emailResult = await sendWelcomeEmail(testUser);
    
    if (emailResult.success) {
      res.json({
        success: true,
        message: "Test email sent successfully! Check your inbox.",
        messageId: emailResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send test email",
        error: emailResult.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Email test failed",
      error: error.message
    });
  }
});

// --------------------
// 404 HANDLER (KEEP THIS LAST)
// --------------------
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Endpoint not found",
    path: req.path,
    method: req.method,
    availableEndpoints: {
      root: "GET /",
      test: "GET /test-env",
      testDb: "GET /test-db",
      register: "POST /register",
      login: "POST /login",
      profile: "GET /profile",
      users: "GET /users",
      groups: "GET /groups",
      groupDetail: "GET /groups/:id",
      joinGroup: "POST /groups/:id/join",
      leaveGroup: "POST /groups/:id/leave",
      userGroups: "GET /user/groups",
      devStats: "GET /dev/stats",
      devTestUser: "POST /dev/test-user",
      testEmail: "GET /test-email"
    }
  });
});

// --------------------
// START SERVER
// --------------------
app.listen(PORT, async () => {
  console.log('='.repeat(60));
  console.log('🚀 SERVER STARTING...');
  console.log('='.repeat(60));
  console.log(`📊 PORT: ${PORT}`);
  console.log(`🔐 JWT_SECRET: ${secret ? 'SET' : 'NOT SET!'}`);
  console.log(`🏠 DB_HOST: ${process.env.DB_HOST}`);
  console.log(`👤 DB_USER: ${process.env.DB_USER}`);
  console.log(`🗃️ DB_NAME: ${process.env.DB_NAME}`);
  
  // Test database connection
  console.log('🔄 Testing database connection...');
  const dbConnected = await testConnection();
  
  console.log('='.repeat(60));
  if (dbConnected) {
    console.log('✅ SERVER STARTED SUCCESSFULLY WITH DATABASE!');
  } else {
    console.log('⚠️  SERVER STARTED BUT DATABASE CONNECTION FAILED');
  }
  console.log(`🌐 Server running on port ${PORT}`);
  console.log('='.repeat(60));
  
  // Test email connection
  testEmailConnection().then(connected => {
    if (connected) {
      console.log(`📧 Email service: READY`);
    } else {
      console.log(`❌ Email service: NOT CONFIGURED`);
    }
  });
});
