// server.js
require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

// Import email service - make sure path is correct!
const { sendWelcomeEmail, testEmailConnection } = require('./services/emailService');

const app = express();

// ✅ CRITICAL: Add CORS support BEFORE routes
app.use(cors());
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 3000;
const secret = process.env.JWT_SECRET;

// In-memory "database"
let users = [];
let userIdCounter = 1;

// --------------------
// GROUPS DATA STRUCTURES
// --------------------
let groups = [];
let groupIdCounter = 1;
let groupMemberships = [];
let posts = [];
let postIdCounter = 1;

// Initialize with sample groups
const sampleGroups = [
  {
    id: groupIdCounter++,
    name: "Computer Science Majors",
    description: "Discussion group for Computer Science students at SZE",
    category: "academic",
    major: "Computer Science",
    tags: ["programming", "algorithms", "software engineering", "web development"],
    memberCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: groupIdCounter++,
    name: "Mathematics Students",
    description: "For students studying Mathematics and related fields",
    category: "academic", 
    major: "Mathematics",
    tags: ["calculus", "statistics", "linear algebra", "discrete math"],
    memberCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: groupIdCounter++,
    name: "Electrical Engineering",
    description: "Community for Electrical Engineering students",
    category: "academic",
    major: "Electrical Engineering", 
    tags: ["circuits", "electronics", "power systems", "signal processing"],
    memberCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: groupIdCounter++,
    name: "First Year Students",
    description: "Support and community for first year university students",
    category: "general",
    major: null,
    tags: ["freshman", "orientation", "campus life", "study tips"],
    memberCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: groupIdCounter++,
    name: "Programming Club",
    description: "For students interested in programming and software development",
    category: "hobby",
    major: null,
    tags: ["coding", "projects", "hackathons", "open source"],
    memberCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: groupIdCounter++,
    name: "Research Opportunities",
    description: "Share and discover research opportunities at the university",
    category: "academic",
    major: null,
    tags: ["research", "professors", "publications", "grants"],
    memberCount: 0,
    createdAt: new Date().toISOString()
  }
];

// Initialize groups array
groups = [...sampleGroups];

// --------------------
// ROOT ROUTE
// --------------------
app.get("/", (req, res) => {
  res.json({ 
    message: "Authentication Server is running!",
    endpoints: {
      test: "GET /test-env",
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
// TEST ENV ROUTE
// --------------------
app.get("/test-env", (req, res) => {
  res.json({
    port: process.env.PORT,
    secretSet: !!process.env.JWT_SECRET,
    message: "Environment variables loaded successfully!"
  });
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
      fullName,     // optional
      bio,          // optional  
      gender,       // optional
      birthYear     // optional
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
    
    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Neptun code (exactly 6 alphanumeric)
    const neptunRegex = /^[A-Z0-9]{6}$/i;
    if (!neptunRegex.test(neptun)) {
      return res.status(400).json({
        success: false,
        message: "Neptun code must be exactly 6 alphanumeric characters"
      });
    }

    // Start year validation (reasonable range: 2000-current year+1)
    const currentYear = new Date().getFullYear();
    if (startYear < 2000 || startYear > currentYear + 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid start year"
      });
    }

    // Password strength
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

    // === UNIQUENESS CHECKS ===
    if (users.find(u => u.email === normalizedEmail)) {
      return res.status(400).json({ 
        success: false,
        message: "Email already registered"
      });
    }
    
    if (users.find(u => u.username === normalizedUsername)) {
      return res.status(400).json({ 
        success: false,
        message: "Username already taken" 
      });
    }
    
    if (users.find(u => u.neptun === normalizedNeptun)) {
      return res.status(400).json({ 
        success: false,
        message: "Neptun code already registered" 
      });
    }

    // === CREATE USER OBJECT ===
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const newUser = { 
      id: userIdCounter++,
      // Mandatory fields
      username: normalizedUsername,
      email: normalizedEmail,
      neptun: normalizedNeptun,
      startYear: parseInt(startYear),
      major: normalizedMajor,
      password: hashedPassword,
      
      // Optional fields (only include if provided)
      ...(normalizedFullName && { fullName: normalizedFullName }),
      ...(normalizedBio && { bio: normalizedBio }),
      ...(gender && { gender }),
      ...(birthYear && { birthYear: parseInt(birthYear) }),
      
      // System fields
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true
    };
    
    // === SAVE USER ===
    users.push(newUser);

    console.log("✅ User registered successfully:", newUser.id);

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
    // Send response immediately (don't wait for email to complete)
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
      emailSent: true // Let frontend know we attempted to send email
    });

  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error during registration" 
    });
  }
});

// --------------------
// LOGIN ROUTE
// --------------------
app.post("/login", async (req, res) => {
  try {
    const { neptun, password } = req.body;

    if (!neptun || !password) {
      return res.status(400).json({ message: "Neptun and password are required" });
    }

    const user = users.find(u => u.neptun === neptun.toUpperCase());
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        neptun: user.neptun 
      },
      secret,
      { expiresIn: "1h" }
    );

    res.json({ 
      message: "Login successful", 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        neptun: user.neptun
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error during login" });
  }
});

// --------------------
// PROTECTED PROFILE ROUTE
// --------------------
app.get("/profile", (req, res) => {
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
    
    // Find user in database
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: `Hello ${decoded.username}, welcome to your profile!`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        neptun: user.neptun,
        startYear: user.startYear,
        major: user.major,
        fullName: user.fullName,
        bio: user.bio,
        gender: user.gender,
        birthYear: user.birthYear,
        createdAt: user.createdAt,
        isActive: user.isActive
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
// USERS LIST (for testing)
// --------------------
app.get("/users", (req, res) => {
  res.json({
    totalUsers: users.length,
    users: users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      neptun: u.neptun,
      createdAt: u.createdAt
    }))
  });
});

// --------------------
// GROUP ENDPOINTS
// --------------------

// Get all available groups
app.get("/groups", (req, res) => {
  try {
    const { category, major, search } = req.query;
    
    let filteredGroups = groups;

    // Filter by category if provided
    if (category) {
      filteredGroups = filteredGroups.filter(group => 
        group.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by major if provided  
    if (major) {
      filteredGroups = filteredGroups.filter(group => 
        group.major && group.major.toLowerCase() === major.toLowerCase()
      );
    }

    // Search in name, description, and tags
    if (search) {
      const searchLower = search.toLowerCase();
      filteredGroups = filteredGroups.filter(group =>
        group.name.toLowerCase().includes(searchLower) ||
        group.description.toLowerCase().includes(searchLower) ||
        group.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    res.json({
      success: true,
      total: filteredGroups.length,
      groups: filteredGroups.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description,
        category: g.category,
        major: g.major,
        tags: g.tags,
        memberCount: g.memberCount,
        createdAt: g.createdAt
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
app.get("/groups/:groupId", (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const group = groups.find(g => g.id === groupId);

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: "Group not found" 
      });
    }

    // Get members of this group
    const memberIds = groupMemberships
      .filter(gm => gm.groupId === groupId)
      .map(gm => gm.userId);
    
    const members = users.filter(u => memberIds.includes(u.id))
      .map(u => ({
        id: u.id,
        username: u.username,
        major: u.major,
        startYear: u.startYear
      }));

    res.json({
      success: true,
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        category: group.category,
        major: group.major,
        tags: group.tags,
        memberCount: group.memberCount,
        createdAt: group.createdAt,
        members: members
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
app.post("/groups/:groupId/join", (req, res) => {
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
    
    const group = groups.find(g => g.id === groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: "Group not found" 
      });
    }
    
    // Check if user exists
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Check if already joined
    const existingMembership = groupMemberships.find(
      gm => gm.userId === userId && gm.groupId === groupId
    );
    
    if (existingMembership) {
      return res.status(400).json({ 
        success: false, 
        message: "Already joined this group" 
      });
    }
    
    // Add membership
    groupMemberships.push({
      userId,
      groupId,
      joinedAt: new Date().toISOString(),
      engagement: 0.5 // Default engagement score
    });
    
    // Update member count
    group.memberCount++;

    console.log(`✅ User ${userId} joined group: ${group.name}`);

    res.json({
      success: true,
      message: `Successfully joined ${group.name}`,
      group: {
        id: group.id,
        name: group.name,
        memberCount: group.memberCount
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
app.post("/groups/:groupId/leave", (req, res) => {
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
    
    const group = groups.find(g => g.id === groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: "Group not found" 
      });
    }
    
    // Find membership
    const membershipIndex = groupMemberships.findIndex(
      gm => gm.userId === userId && gm.groupId === groupId
    );
    
    if (membershipIndex === -1) {
      return res.status(400).json({ 
        success: false, 
        message: "Not a member of this group" 
      });
    }
    
    // Remove membership
    groupMemberships.splice(membershipIndex, 1);
    
    // Update member count
    group.memberCount = Math.max(0, group.memberCount - 1);

    console.log(`✅ User ${userId} left group: ${group.name}`);

    res.json({
      success: true,
      message: `Successfully left ${group.name}`,
      group: {
        id: group.id,
        name: group.name,
        memberCount: group.memberCount
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
app.get("/user/groups", (req, res) => {
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
    
    const userMemberships = groupMemberships.filter(gm => gm.userId === userId);
    const userGroups = groups.filter(g => 
      userMemberships.some(gm => gm.groupId === g.id)
    );
    
    res.json({
      success: true,
      total: userGroups.length,
      groups: userGroups.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description,
        category: g.category,
        major: g.major,
        tags: g.tags,
        memberCount: g.memberCount,
        joinedAt: userMemberships.find(gm => gm.groupId === g.id).joinedAt
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
app.get('/dev/stats', (req, res) => {
  res.json({
    totalUsers: users.length,
    totalGroups: groups.length,
    totalMemberships: groupMemberships.length,
    lastUser: users[users.length - 1] || null,
    serverUptime: Math.floor(process.uptime()) + ' seconds',
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Clear all users (for testing)
app.delete('/dev/clear-users', (req, res) => {
  const previousCount = users.length;
  users = [];
  userIdCounter = 1;
  
  res.json({
    message: `Cleared ${previousCount} users`,
    usersCount: users.length,
    timestamp: new Date().toISOString()
  });
});

// Create test user quickly
app.post('/dev/test-user', async (req, res) => {
  try {
    const testId = Date.now().toString().slice(-4);
    const testUser = {
      username: 'testuser_' + testId,
      email: `test${testId}@example.com`,
      neptun: 'TST' + testId,
      password: 'testpass123'
    };

    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    const newUser = {
      id: userIdCounter++,
      ...testUser,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    res.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        neptun: newUser.neptun
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to create test user' 
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
      devClearUsers: "DELETE /dev/clear-users",
      devTestUser: "POST /dev/test-user",
      testEmail: "GET /test-email"
    }
  });
});

// --------------------
// START SERVER
// --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ CORS enabled - Frontend can connect!`);
  console.log(`📊 Environment: PORT=${PORT}, JWT_SECRET=${secret ? "Set" : "Not set!"}`);
  
  // Test email connection on startup
  testEmailConnection().then(connected => {
    if (connected) {
      console.log(`📧 Email service: READY`);
    } else {
      console.log(`❌ Email service: NOT CONFIGURED - Check your .env file`);
    }
  });
  
  console.log(`👥 Groups system: READY (${groups.length} groups available)`);
  
  if (!secret) {
    console.log("❌ WARNING: JWT_SECRET is not set in .env file!");
  }
});