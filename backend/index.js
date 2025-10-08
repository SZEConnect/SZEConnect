

// server.js
require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");  // ← ADD THIS LINE

const app = express();

// ✅ CRITICAL: Add CORS support BEFORE routes
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 3000;
const secret = process.env.JWT_SECRET;

// In-memory "database"
let users = [];
let userIdCounter = 1;

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
      users: "GET /users"
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
// ENHANCED REGISTER ROUTE WITH NEW FIELDS
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
		}
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
// 404 HANDLER
// --------------------
app.use((req, res) => {
  res.status(404).json({ 
    message: "Endpoint not found",
    availableEndpoints: {
      root: "GET /",
      test: "GET /test-env",
      register: "POST /register",
      login: "POST /login",
      profile: "GET /profile",
      users: "GET /users"
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
  if (!secret) {
    console.log("❌ WARNING: JWT_SECRET is not set in .env file!");
  }
});

// --------------------
// DEV UTILITY ENDPOINTS
// --------------------

// Clear all users (for testing)
app.delete('/dev/clear-users', (req, res) => {
	const previousCount = users.length;
	users = [];
	userIdCounter = 1;
	
	res.json({
	  message: `Cleared ${previousCount} users`,
	  usersCount: users.length
	});
  });
  
  // Get registration statistics
  app.get('/dev/stats', (req, res) => {
	res.json({
	  totalUsers: users.length,
	  lastUser: users[users.length - 1] || null,
	  serverUptime: process.uptime(),
	  memoryUsage: process.memoryUsage()
	});
  });
  
  // Test registration with sample data
  app.post('/dev/test-register', async (req, res) => {
	const testUser = {
	  username: 'test_' + Date.now(),
	  email: `test${Date.now()}@example.com`,
	  neptun: 'TST' + (Date.now() % 1000),
	  password: 'testpassword123'
	};
  
	try {
	  const hashedPassword = await bcrypt.hash(testUser.password, 10);
	  const newUser = {
		id: userIdCounter++,
		...testUser,
		password: hashedPassword,
		createdAt: new Date().toISOString()
	  };
	  
	  users.push(newUser);
	  
	  res.json({
		message: 'Test user created',
		user: {
		  id: newUser.id,
		  username: newUser.username,
		  email: newUser.email,
		  neptun: newUser.neptun
		}
	  });
	} catch (error) {
	  res.status(500).json({ error: 'Failed to create test user' });
	}
  });
  // Get server statistics
app.get('/dev/stats', (req, res) => {
	res.json({
	  totalUsers: users.length,
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
// 404 HANDLER 
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
		devStats: "GET /dev/stats",
		devClearUsers: "DELETE /dev/clear-users",
		devTestUser: "POST /dev/test-user"
	  }
	});
  });

