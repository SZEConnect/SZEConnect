// testAuth.js
const axios = require("axios");

const BASE_URL = "http://localhost:3000";
let authToken = null;

// Helper function to wait for server to be ready
async function waitForServer(maxAttempts = 10) {
  console.log("⏳ Waiting for server to be ready...");
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await axios.get(`${BASE_URL}/test-env`);
      console.log("✅ Server is ready!");
      console.log("📊 Server info:", response.data);
      return true;
    } catch (err) {
      if (attempt === maxAttempts) {
        console.error("❌ Server not responding after %d attempts", maxAttempts);
        console.error("💡 Make sure you run 'node index.js' in another terminal first");
        return false;
      }
      process.stdout.write(`Attempt ${attempt}/${maxAttempts}... `);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Test registration
async function testRegister() {
  console.log("\n📝 === TESTING REGISTRATION ===");
  
  try {
    const userData = {
      username: "testuser",
      email: "test@example.com",
      neptun: "ABC123",
      password: "mypassword123"
    };

    const response = await axios.post(`${BASE_URL}/register`, userData);
    console.log("✅ Registration successful:");
    console.log("   Response:", response.data);
    
    return true;
  } catch (error) {
    if (error.response) {
      console.error("❌ Registration failed:");
      console.error("   Status:", error.response.status);
      console.error("   Error:", error.response.data);
    } else {
      console.error("❌ Network error:", error.message);
    }
    return false;
  }
}

// Test login
async function testLogin() {
  console.log("\n🔐 === TESTING LOGIN ===");
  
  try {
    const loginData = {
      neptun: "ABC123",
      password: "mypassword123"
    };

    const response = await axios.post(`${BASE_URL}/login`, loginData);
    console.log("✅ Login successful:");
    console.log("   Token received:", response.data.token ? "Yes" : "No");
    console.log("   User:", response.data.user);
    
    authToken = response.data.token;
    return true;
  } catch (error) {
    if (error.response) {
      console.error("❌ Login failed:");
      console.error("   Status:", error.response.status);
      console.error("   Error:", error.response.data);
    } else {
      console.error("❌ Network error:", error.message);
    }
    return false;
  }
}

// Test protected profile route
async function testProfile() {
  console.log("\n👤 === TESTING PROTECTED PROFILE ===");
  
  if (!authToken) {
    console.error("❌ No authentication token available");
    return false;
  }

  try {
    const response = await axios.get(`${BASE_URL}/profile`, {
      headers: { 
        Authorization: `Bearer ${authToken}` 
      }
    });
    
    console.log("✅ Profile access successful:");
    console.log("   Message:", response.data.message);
    console.log("   User data:", response.data.user);
    
    return true;
  } catch (error) {
    if (error.response) {
      console.error("❌ Profile access failed:");
      console.error("   Status:", error.response.status);
      console.error("   Error:", error.response.data);
    } else {
      console.error("❌ Network error:", error.message);
    }
    return false;
  }
}

// Test error cases
async function testErrorCases() {
  console.log("\n🚨 === TESTING ERROR CASES ===");
  
  // Test invalid login
  try {
    await axios.post(`${BASE_URL}/login`, {
      neptun: "INVALID",
      password: "wrongpassword"
    });
  } catch (error) {
    console.log("✅ Invalid login handled correctly:", error.response.data.message);
  }

  // Test profile without token
  try {
    await axios.get(`${BASE_URL}/profile`);
  } catch (error) {
    console.log("✅ Unauthorized access handled correctly:", error.response.data.message);
  }
}

// Main test function
async function runAllTests() {
  console.log("🎯 Starting Authentication System Tests...");
  console.log("===========================================");

  // Wait for server
  const serverReady = await waitForServer();
  if (!serverReady) {
    console.error("❌ Cannot proceed without server");
    return;
  }

  // Run tests in sequence
  const tests = [
    { name: "Registration", func: testRegister },
    { name: "Login", func: testLogin },
    { name: "Profile Access", func: testProfile },
    { name: "Error Handling", func: testErrorCases }
  ];

  let allPassed = true;

  for (const test of tests) {
    const passed = await test.func();
    if (!passed) {
      allPassed = false;
      console.error(`❌ ${test.name} test failed!`);
    }
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Final summary
  console.log("\n===========================================");
  if (allPassed) {
    console.log("🎉 ALL TESTS PASSED! Authentication system is working correctly.");
    console.log("\n📋 Next steps:");
    console.log("   1. Keep server running in Terminal 1");
    console.log("   2. You can now test with other clients (Postman, frontend app, etc.)");
    console.log("   3. Check /users endpoint to see registered users");
  } else {
    console.log("❌ SOME TESTS FAILED! Check the errors above.");
  }
  console.log("===========================================");
}

// Run the tests
runAllTests().catch(error => {
  console.error("💥 Unexpected error:", error);
});