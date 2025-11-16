// test-registration.js - ES Module version
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

async function testRegistration() {
  console.log('🧪 Testing Enhanced Registration Endpoint...\n');

  const testCases = [
    // ✅ Valid registration with all fields - Male (1)
    {
      name: 'Valid Registration (All Fields - Male)',
      data: {
        username: 'john_doe',
        neptun: 'ABC123',
        fullName: 'John Doe',
        birthYear: 2000,
        gender: 1,  // Male
        email: 'john@example.com',
        startYear: 2023,
        major: 'Computer Science',
        bio: 'Software engineering student',
        password: 'password123',
        passwordAgain: 'password123'
      },
      shouldPass: true
    },

    // ✅ Valid registration with all fields - Female (2)
    {
      name: 'Valid Registration (All Fields - Female)',
      data: {
        username: 'jane_smith',
        neptun: 'DEF456',
        fullName: 'Jane Smith',
        birthYear: 2001,
        gender: 2,  // Female
        email: 'jane@example.com',
        startYear: 2024,
        major: 'Mathematics',
        bio: 'Mathematics enthusiast',
        password: 'password123',
        passwordAgain: 'password123'
      },
      shouldPass: true
    },

    // ✅ Valid registration with all fields - Other (3)
    {
      name: 'Valid Registration (All Fields - Other)',
      data: {
        username: 'alex_jones',
        neptun: 'GHI789',
        fullName: 'Alex Jones',
        birthYear: 1999,
        gender: 3,  // Other
        email: 'alex@example.com',
        startYear: 2023,
        major: 'Physics',
        bio: 'Physics researcher',
        password: 'password123',
        passwordAgain: 'password123'
      },
      shouldPass: true
    },

    // ✅ Valid registration with all fields - Prefer not to say (4)
    {
      name: 'Valid Registration (All Fields - Prefer not to say)',
      data: {
        username: 'sam_wilson',
        neptun: 'JKL012',
        fullName: 'Sam Wilson',
        birthYear: 2000,
        gender: 4,  // Prefer not to say
        email: 'sam@example.com',
        startYear: 2024,
        major: 'Chemistry',
        bio: 'Chemistry student',
        password: 'password123',
        passwordAgain: 'password123'
      },
      shouldPass: true
    },

    // ✅ Valid registration with only mandatory fields (no gender)
    {
      name: 'Valid Registration (Mandatory Only - No Gender)',
      data: {
        username: 'bob_brown',
        neptun: 'MNO345',
        startYear: 2023,
        major: 'Engineering',
        email: 'bob@example.com',
        password: 'password123',
        passwordAgain: 'password123'
        // gender is optional
      },
      shouldPass: true
    },

    // ✅ Valid registration with birthYear only
    {
      name: 'Valid Registration (Birth Year Only)',
      data: {
        username: 'charlie_lee',
        neptun: 'PQR678',
        startYear: 2023,
        major: 'Biology',
        email: 'charlie@example.com',
        birthYear: 1999,
        password: 'password123',
        passwordAgain: 'password123'
      },
      shouldPass: true
    },

    // ❌ Invalid gender value
    {
      name: 'Invalid Gender Value',
      data: {
        username: 'testuser1',
        neptun: 'STU901',
        startYear: 2023,
        major: 'Economics',
        email: 'test1@example.com',
        gender: 5,  // Invalid - should be 1-4 only
        password: 'password123',
        passwordAgain: 'password123'
      },
      shouldPass: false
    },

    // ❌ Invalid gender type (string instead of number)
    {
      name: 'Invalid Gender Type',
      data: {
        username: 'testuser2',
        neptun: 'VWX234',
        startYear: 2023,
        major: 'Psychology',
        email: 'test2@example.com',
        gender: 'male',  // Invalid - should be number
        password: 'password123',
        passwordAgain: 'password123'
      },
      shouldPass: false
    },

    // ❌ Missing required field (major)
    {
      name: 'Missing Major',
      data: {
        username: 'testuser3',
        neptun: 'YZA567',
        startYear: 2023,
        email: 'test3@example.com',
        gender: 1,
        password: 'password123',
        passwordAgain: 'password123'
      },
      shouldPass: false
    },

    // ❌ Password mismatch
    {
      name: 'Password Mismatch',
      data: {
        username: 'testuser4',
        neptun: 'BCD890',
        startYear: 2023,
        major: 'Sociology',
        email: 'test4@example.com',
        gender: 2,
        password: 'password123',
        passwordAgain: 'different'
      },
      shouldPass: false
    },

    // ❌ Invalid start year
    {
      name: 'Invalid Start Year',
      data: {
        username: 'testuser5',
        neptun: 'EFG123',
        startYear: 1995, // Too old
        major: 'History',
        email: 'test5@example.com',
        gender: 3,
        password: 'password123',
        passwordAgain: 'password123'
      },
      shouldPass: false
    },

    // ❌ Duplicate username
    {
      name: 'Duplicate Username',
      data: {
        username: 'john_doe', // Same as first test case
        neptun: 'HIJ456',
        startYear: 2023,
        major: 'Political Science',
        email: 'different@example.com',
        gender: 1,
        password: 'password123',
        passwordAgain: 'password123'
      },
      shouldPass: false
    }
  ];

  let passedTests = 0;
  let failedTests = 0;

  // Gender mapping for better logging
  const genderMap = {
    1: 'Male',
    2: 'Female', 
    3: 'Other',
    4: 'Prefer not to say'
  };

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    
    // Format data for better logging
    const logData = { ...testCase.data };
    if (logData.gender && genderMap[logData.gender]) {
      logData.genderDisplay = `${logData.gender} (${genderMap[logData.gender]})`;
    }
    console.log(`   Data:`, JSON.stringify(logData, null, 2));
    
    try {
      const response = await axios.post(`${API_BASE}/register`, testCase.data);
      
      if (testCase.shouldPass) {
        console.log('✅ PASS - Registration successful');
        console.log('   User created with ID:', response.data.user?.id || 'N/A');
        console.log('   Response:', {
          username: response.data.user?.username,
          email: response.data.user?.email,
          neptun: response.data.user?.neptun,
          major: response.data.user?.major,
          gender: response.data.user?.gender
        });
        passedTests++;
      } else {
        console.log('❌ FAIL - Expected to fail but passed');
        console.log('   Response:', response.data);
        failedTests++;
      }
    } catch (error) {
      if (!testCase.shouldPass) {
        console.log('✅ PASS - Correctly failed as expected');
        console.log('   Error:', error.response?.data?.message || error.message);
        passedTests++;
      } else {
        console.log('❌ FAIL - Expected to pass but failed');
        console.log('   Error:', error.response?.data?.message || error.message);
        console.log('   Details:', error.response?.data);
        failedTests++;
      }
    }
    console.log('---'.repeat(20));
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('✅ Passed:', passedTests);
  console.log('❌ Failed:', failedTests);
  console.log('📈 Success Rate:', `${Math.round((passedTests / testCases.length) * 100)}%`);
  
  // Gender test summary
  console.log('\n🎯 Gender Enum Tests:');
  console.log('   1 - Male');
  console.log('   2 - Female');
  console.log('   3 - Other');
  console.log('   4 - Prefer not to say');
  console.log('   null/undefined - Optional (no gender provided)');
}

// Run test
testRegistration().catch(console.error);