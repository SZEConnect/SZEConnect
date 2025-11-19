import dotenv from 'dotenv';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import pool, { testConnection } from './database.js';
import { sendWelcomeEmail, testEmailConnection } from './services/emailService.js';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Cloudinary Configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('🔧 Environment Check for Render:');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('   CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET');
console.log('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
console.log('   PORT:', process.env.PORT);

const app = express();

// ✅ CRITICAL: Add CORS support BEFORE routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 4000;
const secret = process.env.JWT_SECRET;

// Configure multer to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'szeconnect-posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    public_id: (req, file) => {
      return 'post-' + Date.now() + '-' + Math.round(Math.random() * 1E9);
    },
  },
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
          normalizedUsername,
          normalizedNeptun,
          normalizedFullName,
          birthYear ? `${birthYear}-01-01` : null,
          gender,
          normalizedEmail,
          parseInt(startYear),
          normalizedMajor,
          normalizedBio,
          hashedPassword
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
// COMMENTS ENDPOINTS
// --------------------
app.get("/posts/:postId/comments", async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    
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

    const result = await pool.query(
      `INSERT INTO comments 
       (post_id, user_id, parent_comment_id, comment, comment_date, comment_update, comment_edited, comment_deleted)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        postId,
        userId,
        parentCommentId || null,
        comment.trim(),
        new Date(),
        new Date(),
        'N',
        null
      ]
    );

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
        replies: []
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
// POST CREATION ENDPOINT WITH CLOUDINARY
// --------------------
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
    
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ JWT verification failed:", error.message);
    return res.status(403).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};

app.post("/posts", authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    console.log("🔄 POST /posts - Starting request with Cloudinary");
    
    const userId = req.user.id;
    const { title, content, groupId } = req.body;

    console.log("📝 Request data:", { userId, title, groupId });
    console.log("📁 Files received:", req.files ? req.files.length : 0);

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

    // Handle images with Cloudinary
    let imageVideoUrl = null;
    if (req.files && req.files.length > 0) {
      console.log("🖼️ Processing images with Cloudinary...");
      
      // Cloudinary automatically provides URLs in file.path
      const imageUrls = req.files.map(file => file.path);
      imageVideoUrl = JSON.stringify(imageUrls);
      
      console.log("✅ Cloudinary URLs:", imageUrls);
    }

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

    console.log("✅ Post inserted successfully");

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
    console.error("❌ Error creating post:", {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: "Failed to create post" 
    });
  }
});

// --------------------
// DEV UTILITY ENDPOINTS
// --------------------
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

app.get('/test-email', async (req, res) => {
  try {
    const connectionTest = await testEmailConnection();
    
    if (!connectionTest) {
      return res.status(500).json({
        success: false,
        message: "Email server connection failed. Check your .env configuration."
      });
    }

    const testUser = {
      email: process.env.EMAIL_USER,
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
  console.log(`☁️  CLOUDINARY: ${process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET!'}`);
  console.log(`🌐 Public API URL: https://szeconnect.onrender.com`);
  
  const dbConnected = await testConnection();
  
  console.log('='.repeat(60));
  if (dbConnected) {
    console.log('✅ SERVER STARTED SUCCESSFULLY!');
    console.log('   Backend → Database: INTERNAL URL ✓');
    console.log('   Image Storage → Cloudinary ✓');
    console.log('   Frontend → Backend: https://szeconnect.onrender.com ✓');
  } else {
    console.log('⚠️  SERVER STARTED BUT DATABASE CONNECTION FAILED');
  }
  console.log(`🌐 Server running on port ${PORT}`);
  console.log('='.repeat(60));
  
  testEmailConnection().then(connected => {
    if (connected) {
      console.log(`📧 Email service: READY`);
    } else {
      console.log(`❌ Email service: NOT CONFIGURED`);
    }
  });
});

app.get("/status", async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW() as db_time');
    
    res.json({
      success: true,
      message: "SzeConnect Backend is running!",
      services: {
        database: "Connected",
        server: "Running", 
        cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? "Ready" : "Not configured",
        api: "Ready for frontend connections"
      },
      database: {
        time: dbResult.rows[0].db_time,
        connection: process.env.DATABASE_URL ? "Internal" : "External"
      },
      api: {
        baseUrl: "https://szeconnect.onrender.com",
        frontendInstructions: "Your friend can connect their frontend to this URL"
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Backend running but database connection failed",
      error: error.message
    });
  }
});

