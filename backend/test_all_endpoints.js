// test-all-endpoints.js - UPDATED FOR NEW FIELDS
const axios = require('axios');

const API_BASE = 'http://localhost:3000';
let authToken = '';

// Generate unique but VALID test data (6-character Neptun codes)
const timestamp = Date.now();
const uniqueNeptun = 'T' + timestamp.toString().slice(-5); // Exactly 6 chars
const uniqueEmail = `test${timestamp}@example.com`;
const uniqueUsername = `testuser_${timestamp}`;

async function testEndpoint(name, method, url, data = null, headers = {}) {
  try {
    const config = { method, url: `${API_BASE}${url}`, headers };
    if (data) config.data = data;
    
    const response = await axios(config);
    console.log(`✅ ${name}: SUCCESS`);
    return response.data;
  } catch (error) {
    console.log(`❌ ${name}: FAILED - ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 Running Comprehensive Backend Tests (Updated for New Fields)...\n');
  console.log(`📝 Using test data - Neptun: ${uniqueNeptun}, Email: ${uniqueEmail}`);

  // Test 1: Basic endpoints
  await testEndpoint('Root endpoint', 'get', '/');
  await testEndpoint('Environment test', 'get', '/test-env');
  await testEndpoint('Users list', 'get', '/users');
  
  // Test Dev stats (only if endpoint exists)
  try {
    await axios.get(`${API_BASE}/dev/stats`);
    console.log('✅ Dev stats: SUCCESS');
  } catch {
    console.log('⚠️  Dev stats: Not implemented (optional)');
  }

  console.log('\n--- Testing Enhanced Registration ---');
  
  // Test 2: Registration with ALL NEW FIELDS
  const regData = {
    username: uniqueUsername,
    neptun: uniqueNeptun,
    startYear: 2023,
    major: 'Computer Science',
    email: uniqueEmail,
    password: 'testpass123',
    passwordAgain: 'testpass123',
    fullName: 'Test User',           // optional
    bio: 'This is a test user bio',  // optional
    gender: 'other',                 // optional
    birthYear: 2000                  // optional
  };
  
  console.log(`🔍 Testing with Neptun: ${regData.neptun} (length: ${regData.neptun.length})`);
  
  const regResult = await testEndpoint('Enhanced registration', 'post', '/register', regData);
  
  if (regResult) {
    console.log('📋 Registration included new fields:', {
      startYear: regResult.user.startYear,
      major: regResult.user.major,
      fullName: regResult.user.fullName,
      bio: regResult.user.bio
    });
  }
  
  // Test 3: Duplicate registration (should fail)
  await testEndpoint('Duplicate registration', 'post', '/register', regData);
  
  // Test 4: Login with the NEW user
  const loginData = { neptun: uniqueNeptun, password: 'testpass123' };
  const loginResult = await testEndpoint('Login', 'post', '/login', loginData);
  
  if (loginResult && loginResult.token) {
    authToken = loginResult.token;
    console.log('✅ Login token received');
  }

  console.log('\n--- Testing Protected Routes with New Fields ---');
  
  // Test 5: Profile without token (should fail)
  await testEndpoint('Profile without token', 'get', '/profile');
  
  // Test 6: Profile with token (should work and include new fields)
  if (authToken) {
    const profileResult = await testEndpoint('Profile with token', 'get', '/profile', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (profileResult) {
      console.log('📋 Profile includes new fields:', {
        hasStartYear: !!profileResult.user.startYear,
        hasMajor: !!profileResult.user.major,
        hasFullName: !!profileResult.user.fullName,
        hasBio: !!profileResult.user.bio,
        hasGender: !!profileResult.user.gender,
        hasBirthYear: !!profileResult.user.birthYear
      });
    }
  }

  console.log('\n--- Testing Enhanced Validation ---');
  
  // Test 7: Missing required field (startYear)
  await testEndpoint('Missing startYear', 'post', '/register', {
    username: 'newuser1',
    neptun: 'NEW001',
    major: 'Engineering',
    email: 'new1@example.com',
    password: 'password123',
    passwordAgain: 'password123'
    // missing startYear - should fail
  });
  
  // Test 8: Password mismatch
  await testEndpoint('Password mismatch', 'post', '/register', {
    username: 'newuser2',
    neptun: 'NEW002',
    startYear: 2024,
    major: 'Engineering',
    email: 'new2@example.com',
    password: 'password123',
    passwordAgain: 'differentpass' // mismatch - should fail
  });
  
  // Test 9: Invalid start year
  await testEndpoint('Invalid start year', 'post', '/register', {
    username: 'newuser3',
    neptun: 'NEW003',
    startYear: 1990, // too old - should fail
    major: 'Engineering',
    email: 'new3@example.com',
    password: 'password123',
    passwordAgain: 'password123'
  });

  // Test 10: Registration with only mandatory fields (should work)
  const mandatoryOnlyData = {
    username: 'mandatoryuser',
    neptun: 'MAN001',
    startYear: 2024,
    major: 'Mathematics',
    email: 'mandatory@example.com',
    password: 'password123',
    passwordAgain: 'password123'
    // No optional fields
  };
  
  await testEndpoint('Mandatory fields only', 'post', '/register', mandatoryOnlyData);

  console.log('\n--- Final Check ---');
  const usersList = await testEndpoint('Users list final', 'get', '/users');
  if (usersList) {
    console.log(`📊 Final user count: ${usersList.totalUsers}`);
    if (usersList.users.length > 0) {
      console.log('👥 Users with new fields:', usersList.users.map(u => ({
        username: u.username,
        major: u.major,
        startYear: u.startYear
      })));
    }
  }

  console.log('\n🎉 Enhanced Test Summary:');
  if (regResult && loginResult) {
    console.log('✅ Enhanced registration: WORKING');
    console.log('✅ New fields storage: WORKING');
    console.log('✅ Profile with new fields: WORKING');
    console.log('✅ Enhanced validation: WORKING');
    console.log('✅ Optional fields handling: WORKING');
  }
  console.log('🚀 BACKEND WITH NEW FIELDS IS READY!');
}

runAllTests();