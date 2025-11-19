// test_email.js - IMPROVED VERSION
const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testEmailSystem() {
  console.log('📧 Testing Email System...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Checking server connection...');
    try {
      await axios.get(`${API_BASE}/`);
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running. Start it with: node index.js');
      return;
    }

    // Test 2: Register a test user (this will trigger the welcome email)
    console.log('\n2. Testing registration with email...');
    
    const timestamp = Date.now();
    const testUser = {
      username: `emailtest_${timestamp}`,
      neptun: `E${timestamp.toString().slice(-5)}`, // Ensure 6 characters
      startYear: 2024,
      major: 'Computer Science',
      email: 'szeconnect.projektmunka@gmail.com', // ← Your email
      password: 'testpassword123',
      passwordAgain: 'testpassword123',
      fullName: 'Email Test User',
      bio: 'Testing the email system functionality'
    };

    console.log(`📝 Registering test user: ${testUser.username}`);
    console.log(`📧 Email will be sent to: ${testUser.email}`);

    try {
      const registrationResponse = await axios.post(`${API_BASE}/register`, testUser);
      
      if (registrationResponse.data.success) {
        console.log('✅ User registered successfully!');
        console.log('📋 User ID:', registrationResponse.data.user.id);
        
        // Check server logs for email sending
        console.log('\n⏳ Checking server logs for email status...');
        console.log('💡 Look at your SERVER TERMINAL for: "Welcome email sent to"');
        console.log('📬 Check your email inbox for the welcome message!');
        console.log('⏰ Email should arrive within 30 seconds...');
        
        // Wait a moment and check if we can login
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Test login
        console.log('\n3. Testing login with registered user...');
        try {
          const loginResponse = await axios.post(`${API_BASE}/login`, {
            neptun: testUser.neptun,
            password: testUser.password
          });
          
          if (loginResponse.data.token) {
            console.log('✅ Login successful!');
            console.log('🔑 Authentication system working correctly');
          }
        } catch (loginError) {
          console.log('⚠️  Login test failed:', loginError.response?.data?.message);
        }

        console.log('\n🎉 REGISTRATION TEST COMPLETED!');
        console.log('\n📋 What to check now:');
        console.log('   1. Look at your SERVER TERMINAL - should show "Welcome email sent to"');
        console.log('   2. Check your email inbox at: szeconnect.projektmunka@gmail.com');
        console.log('   3. Check spam folder if not in inbox');
        console.log('   4. Email subject: "🎉 Welcome to SzeConnect!"');
        
      } else {
        console.log('❌ Registration failed:', registrationResponse.data.message);
      }
      
    } catch (registrationError) {
      if (registrationError.response?.data?.message === 'Email already registered') {
        console.log('⚠️  Test user already exists. Email was likely sent during previous registration.');
        console.log('💡 Check your email inbox for previous welcome emails');
      } else {
        console.log('❌ Registration error:', registrationError.response?.data?.message || registrationError.message);
      }
    }

  } catch (error) {
    console.error('💥 Unexpected error during email testing:', error.message);
  }
}

// Run the test
testEmailSystem();