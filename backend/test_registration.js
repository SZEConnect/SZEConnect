// test-registration.js - UPDATED
const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testRegistration() {
  console.log('🧪 Testing Enhanced Registration Endpoint...\n');

  const testCases = [
    // Valid registration with all fields
    {
      name: 'Valid Registration (All Fields)',
      data: {
        username: 'john_doe',
        neptun: 'ABC123',
        startYear: 2023,
        major: 'Computer Science',
        email: 'john@example.com',
        password: 'password123',
        passwordAgain: 'password123',
        fullName: 'John Doe',
        bio: 'Software engineering student',
        gender: 'male',
        birthYear: 2000
      },
      shouldPass: true
    },
    // Valid registration with only mandatory fields
    {
      name: 'Valid Registration (Mandatory Only)',
      data: {
        username: 'jane_smith',
        neptun: 'DEF456',
        startYear: 2024,
        major: 'Mathematics',
        email: 'jane@example.com',
        password: 'password123',
        passwordAgain: 'password123'
      },
      shouldPass: true
    },
    // Missing required field
    {
      name: 'Missing Major',
      data: {
        username: 'testuser',
        neptun: 'GHI789',
        startYear: 2023,
        email: 'test@example.com',
        password: 'password123',
        passwordAgain: 'password123'
      },
      shouldPass: false
    },
    // Password mismatch
    {
      name: 'Password Mismatch',
      data: {
        username: 'testuser2',
        neptun: 'JKL012',
        startYear: 2023,
        major: 'Physics',
        email: 'test2@example.com',
        password: 'password123',
        passwordAgain: 'different'
      },
      shouldPass: false
    },
    // Invalid start year
    {
      name: 'Invalid Start Year',
      data: {
        username: 'testuser3',
        neptun: 'MNO345',
        startYear: 1995, // Too old
        major: 'Chemistry',
        email: 'test3@example.com',
        password: 'password123',
        passwordAgain: 'password123'
      },
      shouldPass: false
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    
    try {
      const response = await axios.post(`${API_BASE}/register`, testCase.data);
      
      if (testCase.shouldPass) {
        console.log('✅ PASS - Registration successful');
        console.log('   User created with ID:', response.data.user.id);
      } else {
        console.log('❌ FAIL - Expected to fail but passed');
      }
    } catch (error) {
      if (!testCase.shouldPass) {
        console.log('✅ PASS - Correctly failed as expected');
        console.log('   Error:', error.response?.data?.message);
      } else {
        console.log('❌ FAIL - Expected to pass but failed');
        console.log('   Error:', error.response?.data?.message);
      }
    }
    console.log('---');
  }
}

// Run test
testRegistration();