import dotenv from 'dotenv';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import pool, { testConnection } from './database.js';
import { sendWelcomeEmail, testEmailConnection } from './services/emailService.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

// Add this for ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary upload function
const uploadToCloudinary = (fileBuffer, folder = 'szeconnect') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    const stream = require('stream');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

// Add Multer configuration HERE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads')); // Use absolute path
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

console.log('🔧 Environment Check for Render:');
console.log('   IDATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('   PORT:', process.env.PORT);
// Add this right after your multer configuration
console.log('🔐 JWT_SECRET loaded:', process.env.JWT_SECRET ? 'YES' : 'NO');
console.log('🌐 Current NODE_ENV:', process.env.NODE_ENV);

const app = express();

// ✅ CRITICAL: Add CORS support BEFORE routes
app.use(cors({
  origin: '*', // for testing: allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
// Environment variables
const PORT = process.env.PORT || 4000;
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
// TEST ENV ROUTE - UPDATED FOR INTERNAL URL
// --------------------
app.get("/test-env", (req, res) => {
  res.json({
    port: process.env.PORT,
    secretSet: !!process.env.JWT_SECRET,
    database: {
      internalUrlSet: !!process.env.DATABASE_URL,
      externalUrlSet: !!process.env.DATABASE_URL,
      connectionType: process.env.DATABASE_URL ? 'INTERNAL' : 'EXTERNAL',
      allSet: !!(process.env.DATABASE_URL || process.env.DATABASE_URL)
    },
    api: {
      publicUrl: 'https://szeconnect.onrender.com',
      frontendAccess: 'Ready for friend\'s computer'
    },
    message: "Environment variables loaded successfully!"
  });
});

// --------------------
// TEST DATABASE CONNECTION - UPDATED FOR INTERNAL URL
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
        type: process.env.DATABASE_URL ? 'INTERNAL' : 'EXTERNAL',
        ssl: process.env.DATABASE_URL ? 'Disabled (Internal)' : 'Enabled (External)'
      },
      api: {
        status: 'Ready for frontend connections',
        url: 'https://szeconnect.onrender.com'
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: err.message,
      connectionDetails: {
        type: process.env.DATABASE_URL ? 'INTERNAL' : 'EXTERNAL',
        internalUrlSet: !!process.env.DATABASE_URL,
        externalUrlSet: !!process.env.DATABASE_URL
      }
    });
  }
});

const profileStorage = multer.memoryStorage(); // Use memory storage for Cloudinary

const uploadProfile = multer({
  storage: profileStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for profile pics
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// --------------------
// REGISTER ENDPOINT WITH CLOUDINARY PROFILE PICTURES
// --------------------
app.post("/register", uploadProfile.single('profileImage'), async (req, res) => {
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
    console.log("📸 Profile file:", req.file ? `Uploaded: ${req.file.originalname}` : 'No file');

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

    // === UPLOAD PROFILE PICTURE TO CLOUDINARY ===
    let profileImageUrl = null;
    if (req.file) {
      try {
        console.log("☁️ Uploading profile picture to Cloudinary...");
        const cloudinaryResult = await uploadToCloudinary(req.file.buffer, 'szeconnect-profiles');
        profileImageUrl = cloudinaryResult.secure_url;
        console.log("✅ Profile picture uploaded to Cloudinary:", profileImageUrl);
      } catch (uploadError) {
        console.error("❌ Cloudinary upload failed:", uploadError);
        // Don't fail registration if image upload fails
        console.log("⚠️ Continuing registration without profile picture");
      }
    }

    // === HASH PASSWORD ===
    const hashedPassword = await bcrypt.hash(password, 12);

    // === SAVE USER TO DATABASE (POSTGRESQL) ===
    let result;
    try {
      result = await pool.query(
        `INSERT INTO users 
         (username, neptun_code, fullname, birthdate, gender, email, start_year, major, bio, password_hash, profile_picture_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
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
          hashedPassword,          // $10
          profileImageUrl          // $11 - Cloudinary URL or null
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
      profileImage: result.rows[0].profile_picture_url, // Cloudinary URL
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
        profileImage: newUser.profileImage, // Include Cloudinary URL
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
        profileImage: user.profile_picture_url,
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
      'SELECT user_id, username, email, neptun_code, major, start_year, profile_picture_url FROM users ORDER BY user_id'
    );
    
    res.json({
      totalUsers: result.rows.length,
      users: result.rows.map(u => ({
        id: u.user_id,
        username: u.username,
        email: u.email,
        neptun: u.neptun_code,
        major: u.major,
        startYear: u.start_year,
        profileImage: u.profile_picture_url
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
      SELECT 
        g.*, 
        u.username as creator_name,
        COUNT(f.user_id) as member_count
      FROM groupok g 
      LEFT JOIN users u ON g.creator_id = u.user_id
      LEFT JOIN followings f ON g.group_id = f.group_id
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

    query += ' GROUP BY g.group_id, u.username ORDER BY g.group_name';

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      total: result.rows.length,
      groups: result.rows.map(g => ({
        id: g.group_id,
        name: g.group_name,
        description: g.description,
        creator: g.creator_name,
        memberCount: parseInt(g.member_count) || 0,
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

// Check if user is following a group
app.get("/groups/:groupId/following", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.json({ 
        success: true, 
        following: false 
      });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    const decoded = jwt.verify(token, secret);
    
    const userId = decoded.id;
    const groupId = parseInt(req.params.groupId);
    
    // Check if user is following this group
    const followingResult = await pool.query(
      'SELECT * FROM followings WHERE user_id = $1 AND group_id = $2',
      [userId, groupId]
    );
    
    res.json({
      success: true,
      following: followingResult.rows.length > 0
    });
    
  } catch (error) {
    console.error("❌ Error checking follow status:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to check follow status" 
    });
  }
});

// --------------------
// POSTS ENDPOINTS
// --------------------
app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.post_id,
        p.title,
        p.content,
        p.post_date,
        p.user_id,
        p.group_id,
        p.image_video,
        u.username,
        u.major,
        g.group_name
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.user_id
      LEFT JOIN groupok g ON p.group_id = g.group_id
      ORDER BY p.post_date DESC
    `);

    res.json({
      success: true,
      total: result.rows.length,
      posts: result.rows.map(post => ({
        id: post.post_id,
        title: post.title,
        content: post.content,
        time: post.post_date,
        authorId: post.user_id,
        authorName: post.username,
        groupId: post.group_id,
        group: post.group_name,
        major: post.major,
        images: post.image_video ? JSON.parse(post.image_video) : [],
         hasImages: !!post.image_video
      }))
    });

  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch posts" 
    });
  }
});

// --------------------
// COMMENTS ENDPOINTS (UPDATED FOR NESTED COMMENTS)
// --------------------

// Get comments for a post (with nested replies)
app.get("/posts/:postId/comments", async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    
    // Get top-level comments (no parent)
    const result = await pool.query(`
      SELECT 
        c.comment_id,
        c.comment,
        c.comment_date,
        c.user_id,
        u.username,
        u.major
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.post_id = $1 AND c.parent_comment_id IS NULL AND c.comment_deleted IS NULL
      ORDER BY c.comment_date ASC
    `, [postId]);

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      result.rows.map(async (comment) => {
        const repliesResult = await pool.query(`
          SELECT 
            c.comment_id,
            c.comment,
            c.comment_date,
            c.user_id,
            u.username,
            u.major
          FROM comments c
          LEFT JOIN users u ON c.user_id = u.user_id
          WHERE c.parent_comment_id = $1 AND c.comment_deleted IS NULL
          ORDER BY c.comment_date ASC
        `, [comment.comment_id]);

        return {
          id: comment.comment_id,
          text: comment.comment,
          time: comment.comment_date,
          userId: comment.user_id,
          userName: comment.username,
          userMajor: comment.major,
          replies: repliesResult.rows.map(reply => ({
            id: reply.comment_id,
            text: reply.comment,
            time: reply.comment_date,
            userId: reply.user_id,
            userName: reply.username,
            userMajor: reply.major
          }))
        };
      })
    );

    res.json({
      success: true,
      total: commentsWithReplies.length,
      comments: commentsWithReplies
    });

  } catch (error) {
    console.error("❌ Error fetching comments:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch comments" 
    });
  }
});

// Add a new comment to a post (top-level or reply)
app.post("/posts/:postId/comments", async (req, res) => {
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
    const postId = parseInt(req.params.postId);
    const { comment, parentCommentId } = req.body;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Comment text is required" 
      });
    }

    // Check if post exists
    const postResult = await pool.query(
      'SELECT * FROM posts WHERE post_id = $1',
      [postId]
    );
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Post not found" 
      });
    }

    // If it's a reply, check if parent comment exists
    if (parentCommentId) {
      const parentResult = await pool.query(
        'SELECT * FROM comments WHERE comment_id = $1 AND post_id = $2',
        [parentCommentId, postId]
      );
      
      if (parentResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "Parent comment not found" 
        });
      }
    }

    // Insert the comment
    const result = await pool.query(
      `INSERT INTO comments 
       (post_id, user_id, parent_comment_id, comment, comment_date, comment_update, comment_edited, comment_deleted)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        postId,
        userId,
        parentCommentId || null, // null for top-level comments
        comment.trim(),
        new Date(), // comment_date
        new Date(), // comment_update
        'N',        // comment_edited
        null        // comment_deleted
      ]
    );

    // Get user info for the response
    const userResult = await pool.query(
      'SELECT username, major FROM users WHERE user_id = $1',
      [userId]
    );

    const newComment = result.rows[0];
    const user = userResult.rows[0];

    console.log(`✅ User ${userId} commented on post ${postId}`);

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: {
        id: newComment.comment_id,
        text: newComment.comment,
        time: newComment.comment_date,
        userId: userId,
        userName: user.username,
        userMajor: user.major,
        replies: [] // New comments start with empty replies array
      }
    });
    
  } catch (error) {
    console.error("❌ Error adding comment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to add comment" 
    });
  }
});

// --------------------
// POST CREATION ENDPOINT WITH IMAGES - FIXED
// --------------------

// Create a wrapper function to extract token before multer
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: "Authorization token required" 
      });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    
    // Verify the token immediately
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Attach user to request
    next();
  } catch (error) {
    console.error("❌ JWT verification failed:", error.message);
    return res.status(403).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};

// Update the endpoint - authenticate FIRST, then multer
app.post("/posts", authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const userId = req.user.id; // Now we get user from the authenticated request
    const { title, content, groupId } = req.body;

    console.log("🔄 Creating post for user:", userId);

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Post title is required" 
      });
    }

    if (!groupId) {
      return res.status(400).json({ 
        success: false, 
        message: "Group selection is required" 
      });
    }

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

    // Check if user exists (optional, since we already authenticated)
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

    // Handle multiple images - store as JSON array
    let imageVideoUrl = null;
    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
      imageVideoUrl = JSON.stringify(imageUrls);
    }

    // Insert the post with image_video field
    const result = await pool.query(
      `INSERT INTO posts 
       (user_id, group_id, title, content, post_date, image_video)
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        userId,
        groupId,
        title.trim(),
        content ? content.trim() : null,
        new Date(),
        imageVideoUrl
      ]
    );

    // Get user and group info for the response
    const user = userResult.rows[0];
    const group = groupResult.rows[0];

    const newPost = result.rows[0];

    console.log(`✅ User ${userId} created post in group ${groupId} with ${req.files?.length || 0} images`);

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: {
        id: newPost.post_id,
        title: newPost.title,
        content: newPost.content,
        time: newPost.post_date,
        userId: userId,
        authorName: user.username,
        groupId: groupId,
        group: group.group_name,
        images: imageVideoUrl ? JSON.parse(imageVideoUrl) : []
      }
    });
    
  } catch (error) {
    console.error("❌ Error creating post:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create post" 
    });
  }
});

// --------------------
// LIKES ENDPOINTS (UPDATED FOR post_likes TABLE)
// --------------------

// Get likes for a post
app.get("/posts/:postId/likes", async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    
    // Get like counts from post_likes table
    const countsResult = await pool.query(`
      SELECT 
        COUNT(CASE WHEN post_like = true THEN 1 END) as upvotes,
        COUNT(CASE WHEN post_dislike = true THEN 1 END) as downvotes
      FROM post_likes 
      WHERE post_id = $1
    `, [postId]);

    // Get user's like if authenticated
    let userVote = 0;
    const authHeader = req.headers["authorization"];
    if (authHeader) {
      try {
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        const decoded = jwt.verify(token, secret);
        
        const userLikeResult = await pool.query(
          'SELECT post_like, post_dislike FROM post_likes WHERE user_id = $1 AND post_id = $2',
          [decoded.id, postId]
        );
        
        if (userLikeResult.rows.length > 0) {
          const like = userLikeResult.rows[0];
          if (like.post_like) userVote = 1;
          else if (like.post_dislike) userVote = -1;
        }
      } catch (authError) {
        // Token is invalid, treat as anonymous user
      }
    }

    res.json({
      success: true,
      likes: {
        up: parseInt(countsResult.rows[0].upvotes) || 0,
        down: parseInt(countsResult.rows[0].downvotes) || 0,
        my: userVote
      }
    });

  } catch (error) {
    console.error("❌ Error fetching likes:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch likes" 
    });
  }
});

// Add/update like (UPDATED FOR post_likes TABLE)
app.post("/posts/:postId/like", async (req, res) => {
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
    const postId = parseInt(req.params.postId);
    const { likeType } = req.body; // 1 for like, -1 for dislike, 0 to remove

    // Validate like type
    if (![1, -1, 0].includes(likeType)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid like type" 
      });
    }

    // Check if post exists
    const postResult = await pool.query(
      'SELECT * FROM posts WHERE post_id = $1',
      [postId]
    );
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Post not found" 
      });
    }

    // Check if user already has a reaction to this post
    const existingReaction = await pool.query(
      'SELECT * FROM post_likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );

    if (likeType === 0) {
      // Remove like/dislike
      if (existingReaction.rows.length > 0) {
        await pool.query(
          'DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2',
          [userId, postId]
        );
      }
    } else {
      const post_like = likeType === 1;
      const post_dislike = likeType === -1;
      
      if (existingReaction.rows.length > 0) {
        // Update existing reaction
        await pool.query(
          'UPDATE post_likes SET post_like = $1, post_dislike = $2 WHERE user_id = $3 AND post_id = $4',
          [post_like, post_dislike, userId, postId]
        );
      } else {
        // Insert new reaction
        await pool.query(
          'INSERT INTO post_likes (user_id, post_id, post_like, post_dislike) VALUES ($1, $2, $3, $4)',
          [userId, postId, post_like, post_dislike]
        );
      }
    }

    // Get updated counts
    const countsResult = await pool.query(`
      SELECT 
        COUNT(CASE WHEN post_like = true THEN 1 END) as upvotes,
        COUNT(CASE WHEN post_dislike = true THEN 1 END) as downvotes
      FROM post_likes 
      WHERE post_id = $1
    `, [postId]);

    const actionMessages = {
      1: "Post liked",
      [-1]: "Post disliked", 
      0: "Vote removed"
    };

    console.log(`✅ User ${userId} ${actionMessages[likeType]} post ${postId}`);

    res.json({
      success: true,
      message: actionMessages[likeType],
      likes: {
        up: parseInt(countsResult.rows[0].upvotes) || 0,
        down: parseInt(countsResult.rows[0].downvotes) || 0,
        my: likeType
      }
    });
    
  } catch (error) {
    console.error("❌ Error updating like:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update like" 
    });
  }
});

// --------------------
// SEARCH ENDPOINTS
// --------------------

// Search groups
app.get("/search/groups", async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        groups: []
      });
    }

    const searchTerm = `%${q.trim()}%`;
    
    const result = await pool.query(`
      SELECT 
        g.*, 
        u.username as creator_name,
        COUNT(f.user_id) as member_count,
        COUNT(p.post_id) as post_count
      FROM groupok g 
      LEFT JOIN users u ON g.creator_id = u.user_id
      LEFT JOIN followings f ON g.group_id = f.group_id
      LEFT JOIN posts p ON g.group_id = p.group_id
      WHERE g.group_name ILIKE $1 OR g.description ILIKE $1
      GROUP BY g.group_id, u.username
      ORDER BY g.group_name
    `, [searchTerm]);

    res.json({
      success: true,
      groups: result.rows.map(g => ({
        id: g.group_id,
        name: g.group_name,
        description: g.description,
        creator: g.creator_name,
        memberCount: parseInt(g.member_count) || 0,
        postCount: parseInt(g.post_count) || 0,
        createdAt: g.created_at
      }))
    });

  } catch (error) {
    console.error("❌ Error searching groups:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to search groups" 
    });
  }
});

// Search users
app.get("/search/users", async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        users: []
      });
    }

    const searchTerm = `%${q.trim()}%`;
    
    const result = await pool.query(`
      SELECT 
        user_id,
        username,
        email,
        neptun_code,
        major,
        start_year,
        fullname,
        profile_picture_url
      FROM users 
      WHERE username ILIKE $1 
         OR email ILIKE $1 
         OR neptun_code ILIKE $1 
         OR fullname ILIKE $1
      ORDER BY username
    `, [searchTerm]);

    res.json({
      success: true,
      users: result.rows.map(u => ({
        id: u.user_id,
        username: u.username,
        email: u.email,
        neptun: u.neptun_code,
        major: u.major,
        startYear: u.start_year,
        fullName: u.fullname,
        profileImage: u.profile_picture_url
      }))
    });

  } catch (error) {
    console.error("❌ Error searching users:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to search users" 
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
  console.log('🚀 SERVER STARTING ON RENDER...');
  console.log('='.repeat(60));
  console.log(`📊 PORT: ${PORT}`);
  console.log(`🔐 JWT_SECRET: ${secret ? 'SET' : 'NOT SET!'}`);
  console.log(`🗃️ DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET!'}`);
  console.log(`🌐 Public API URL: https://szeconnect.onrender.com`);
  
  // Test database connection
  console.log('🔄 Testing database connection...');
  const dbConnected = await testConnection();
  
  console.log('='.repeat(60));
  if (dbConnected) {
    console.log('✅ SERVER STARTED SUCCESSFULLY!');
    console.log('   Backend → Database: INTERNAL URL ✓');
    console.log('   Frontend → Backend: https://szeconnect.onrender.com ✓');
    console.log('   Friend\'s computer can connect to API ✓');
  } else {
    console.log('⚠️  SERVER STARTED BUT DATABASE CONNECTION FAILED');
    console.log('💡 Check DATABASE_URL in Render environment');
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

// --------------------
// STATUS ENDPOINT (for frontend testing)
// --------------------
app.get("/status", async (req, res) => {
  try {
    // Test database connection
    const dbResult = await pool.query('SELECT NOW() as db_time');
    
    res.json({
      success: true,
      message: "SzeConnect Backend is running!",
      services: {
        database: "Connected",
        server: "Running", 
        api: "Ready for frontend connections",
        connection: process.env.DATABASE_URL ? "Internal URL" : "External URL"
      },
      database: {
        time: dbResult.rows[0].db_time,
        connection: process.env.DATABASE_URL ? "Internal" : "External",
        ssl: process.env.DATABASE_URL ? "Disabled" : "Enabled"
      },
      api: {
        baseUrl: "https://szeconnect.onrender.com",
        frontendInstructions: "Your friend can connect their frontend to this URL",
        exampleEndpoints: [
          "GET /status",
          "POST /register", 
          "POST /login",
          "GET /groups",
          "GET /users"
        ]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Backend running but database connection failed",
      error: error.message,
      connection: process.env.DATABASE_URL ? "Internal URL" : "External URL"
    });
  }
});
