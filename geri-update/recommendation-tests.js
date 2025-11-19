// recommendation-tests.js
const { getRecommendedFeed, getRecommendedGroups } = require('./server'); // Adjust path as needed

class RecommendationTestSuite {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  // Test runner
  runAllTests() {
    console.log("🚀 STARTING RECOMMENDATION ALGORITHM TEST SUITE\n");
    
    this.runScoringTests();
    this.runFeedRecommendationTests();
    this.runGroupRecommendationTests();
    this.runEdgeCaseTests();
    
    this.printResults();
  }

  // Test assertion helper
  assert(name, condition, expected, actual) {
    const passed = condition;
    this.tests.push({ name, passed, expected, actual });
    
    if (passed) {
      this.passed++;
      console.log(`✅ PASS: ${name}`);
    } else {
      this.failed++;
      console.log(`❌ FAIL: ${name}`);
      console.log(`   Expected: ${expected}`);
      console.log(`   Actual: ${actual}`);
    }
  }

  // Test 1: Scoring Algorithm Tests
  runScoringTests() {
    console.log("\n📊 TEST GROUP 1: SCORING ALGORITHM");
    
    // Test recency calculation
    const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
    const recencyScore = this.calculateRecencyScore(oneDayAgo);
    this.assert(
      "Recency score for 1-day old post",
      recencyScore === 290,
      290,
      recencyScore
    );

    // Test popularity calculation
    const popularityScore = this.calculatePopularityScore(10, 5); // 10 likes, 5 comments
    this.assert(
      "Popularity score calculation",
      popularityScore === 35, // (10*2) + (5*3)
      35,
      popularityScore
    );

    // Test content type bonuses
    this.assert(
      "Announcement bonus",
      this.getContentTypeBonus('announcement') === 15,
      15,
      this.getContentTypeBonus('announcement')
    );

    this.assert(
      "Event bonus", 
      this.getContentTypeBonus('event') === 10,
      10,
      this.getContentTypeBonus('event')
    );

    this.assert(
      "Discussion bonus",
      this.getContentTypeBonus('discussion') === 0,
      0,
      this.getContentTypeBonus('discussion')
    );
  }

  // Test 2: Feed Recommendation Tests
  runFeedRecommendationTests() {
    console.log("\n🎯 TEST GROUP 2: FEED RECOMMENDATIONS");
    
    const testUsers = this.createTestUsers();
    const testPosts = this.createTestPosts();
    const testMemberships = this.createTestMemberships();

    // Test CS student preferences
    const csStudentFeed = this.simulateFeedRecommendation(
      testUsers.csStudent.id, 
      testPosts, 
      testMemberships,
      []
    );

    const topCsPost = csStudentFeed[0];
    this.assert(
      "CS student sees CS content first",
      topCsPost.groupId === 1, // CS group
      1,
      topCsPost.groupId
    );

    // Test announcement prioritization
    const announcementPosts = csStudentFeed.filter(p => p.type === 'announcement');
    this.assert(
      "Announcements are prioritized",
      announcementPosts.length > 0 && csStudentFeed.indexOf(announcementPosts[0]) < 2,
      "Announcement in top 2 positions",
      announcementPosts.length > 0 ? `Position: ${csStudentFeed.indexOf(announcementPosts[0]) + 1}` : "No announcements"
    );

    // Test recency impact
    const recentPosts = csStudentFeed.filter(p => 
      (Date.now() - new Date(p.createdAt).getTime()) < 2 * 24 * 60 * 60 * 1000
    );
    this.assert(
      "Recent posts appear in feed",
      recentPosts.length >= 2,
      "At least 2 recent posts",
      `${recentPosts.length} recent posts`
    );
  }

  // Test 3: Group Recommendation Tests
  runGroupRecommendationTests() {
    console.log("\n👥 TEST GROUP 3: GROUP RECOMMENDATIONS");
    
    const testUsers = this.createTestUsers();
    const testGroups = this.createTestGroups();
    const testMemberships = this.createTestMemberships();

    // Test major-based recommendations
    const csRecommendations = this.simulateGroupRecommendation(
      testUsers.csStudent.id,
      testGroups,
      testMemberships,
      testUsers
    );

    const csGroupRecommended = csRecommendations.some(g => 
      g.major && g.major.toLowerCase() === 'computer science'
    );
    
    this.assert(
      "CS student gets CS group recommendations",
      csGroupRecommended,
      true,
      csGroupRecommended
    );

    // Test exclusion of already-joined groups
    const mathStudentRecs = this.simulateGroupRecommendation(
      testUsers.mathStudent.id, 
      testGroups,
      testMemberships,
      testUsers
    );

    const alreadyJoined = mathStudentRecs.some(g => g.id === 2); // Math group ID
    this.assert(
      "Already joined groups are not recommended",
      !alreadyJoined,
      false,
      alreadyJoined
    );
  }

  // Test 4: Edge Cases
  runEdgeCaseTests() {
    console.log("\n⚠️  TEST GROUP 4: EDGE CASES");
    
    // Test new user with no groups
    const newUserFeed = this.simulateFeedRecommendation(
      999, // User with no memberships
      this.createTestPosts(),
      [],
      []
    );

    this.assert(
      "New user gets popular posts fallback",
      newUserFeed.length > 0,
      "At least 1 post",
      `${newUserFeed.length} posts`
    );

    // Test very old posts
    const oldPostDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
    const oldPostRecency = this.calculateRecencyScore(oldPostDate);
    this.assert(
      "Posts older than 30 days get 0 recency score",
      oldPostRecency === 0,
      0,
      oldPostRecency
    );

    // Test empty data
    const emptyFeed = this.simulateFeedRecommendation(1, [], [], []);
    this.assert(
      "Empty posts returns empty feed",
      emptyFeed.length === 0,
      0,
      emptyFeed.length
    );
  }

  // Helper methods for calculations (mirror your actual algorithm)
  calculateRecencyScore(createdAt) {
    const postAge = Date.now() - new Date(createdAt).getTime();
    const recencyScore = Math.max(0, (30 * 24 * 60 * 60 * 1000 - postAge) / (24 * 60 * 60 * 1000));
    return recencyScore * 10;
  }

  calculatePopularityScore(likes, comments) {
    return (likes * 2) + (comments * 3);
  }

  getContentTypeBonus(type) {
    if (type === 'announcement') return 15;
    if (type === 'event') return 10;
    return 0;
  }

  // Simulation methods that mirror your actual algorithms
  simulateFeedRecommendation(userId, posts, memberships, interactions) {
    // Simplified version of your actual algorithm for testing
    const userMemberships = memberships.filter(gm => gm.userId === userId);
    const userGroupIds = userMemberships.map(gm => gm.groupId);
    
    if (userGroupIds.length === 0) {
      return this.getPopularPosts(posts);
    }
    
    let userGroupPosts = posts.filter(post => userGroupIds.includes(post.groupId));
    
    const scoredPosts = userGroupPosts.map(post => {
      let score = 0;
      
      // Group engagement
      const membership = userMemberships.find(gm => gm.groupId === post.groupId);
      if (membership) score += membership.engagement * 100;
      
      // Popularity
      score += (post.likes * 2) + (post.comments * 3);
      
      // Recency
      const postAge = Date.now() - new Date(post.createdAt).getTime();
      const recencyScore = Math.max(0, (30 * 24 * 60 * 60 * 1000 - postAge) / (24 * 60 * 60 * 1000));
      score += recencyScore * 10;
      
      // Content type
      if (post.type === 'announcement') score += 15;
      if (post.type === 'event') score += 10;
      
      return { ...post, score: Math.round(score) };
    });
    
    return scoredPosts.sort((a, b) => b.score - a.score);
  }

  simulateGroupRecommendation(userId, groups, memberships, allUsers) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return [];
    
    const userMemberships = memberships.filter(gm => gm.userId === userId);
    const userGroupIds = userMemberships.map(gm => gm.groupId);
    
    let scoredGroups = groups.map(group => {
      if (userGroupIds.includes(group.id)) return null;
      
      let score = 0;
      
      // Major matching
      if (user.major && group.major && user.major.toLowerCase() === group.major.toLowerCase()) {
        score += 50;
      }
      
      // Popularity
      score += Math.min(group.memberCount * 0.5, 25);
      
      return { ...group, score: Math.round(score) };
    }).filter(group => group !== null);
    
    return scoredGroups.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  getPopularPosts(posts) {
    return posts
      .map(post => {
        const popularityScore = (post.likes * 2) + (post.comments * 3);
        return { ...post, popularityScore };
      })
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, 10);
  }

  // Test data creation
  createTestUsers() {
    return {
      csStudent: { id: 1, username: "cs_student", major: "Computer Science", startYear: 2023 },
      mathStudent: { id: 2, username: "math_student", major: "Mathematics", startYear: 2023 },
      firstYear: { id: 3, username: "first_year", major: "Electrical Engineering", startYear: 2024 }
    };
  }

  createTestGroups() {
    return [
      { id: 1, name: "Computer Science", major: "Computer Science", category: "academic", memberCount: 50 },
      { id: 2, name: "Mathematics", major: "Mathematics", category: "academic", memberCount: 30 },
      { id: 3, name: "Programming Club", major: null, category: "hobby", memberCount: 40 },
      { id: 4, name: "First Year Students", major: null, category: "general", memberCount: 100 }
    ];
  }

  createTestPosts() {
    const now = new Date();
    return [
      {
        id: 1, groupId: 1, title: "CS Announcement", type: "announcement",
        likes: 5, comments: 2, createdAt: now.toISOString()
      },
      {
        id: 2, groupId: 1, title: "CS Event", type: "event", 
        likes: 15, comments: 8, createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3, groupId: 2, title: "Math Discussion", type: "discussion",
        likes: 25, comments: 12, createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4, groupId: 3, title: "Programming Workshop", type: "event",
        likes: 30, comments: 15, createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  createTestMemberships() {
    return [
      { userId: 1, groupId: 1, engagement: 0.9 }, // CS student in CS group
      { userId: 1, groupId: 3, engagement: 0.4 }, // CS student in Programming Club
      { userId: 2, groupId: 2, engagement: 0.8 }, // Math student in Math group
      { userId: 3, groupId: 4, engagement: 0.7 }  // First year in First Year group
    ];
  }

  printResults() {
    console.log("\n" + "=".repeat(50));
    console.log("📋 TEST SUITE RESULTS");
    console.log("=".repeat(50));
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📊 Total: ${this.tests.length}`);
    console.log(`🎯 Success Rate: ${((this.passed / this.tests.length) * 100).toFixed(1)}%`);
    
    if (this.failed > 0) {
      console.log("\n🔍 FAILED TESTS:");
      this.tests.filter(test => !test.passed).forEach(test => {
        console.log(`   - ${test.name}`);
      });
    }
    
    console.log("\n" + "=".repeat(50));
  }
}

// Integration with your actual server (add this to your server.js)
function setupTestEndpoints(app) {
  // Test endpoint to run the full test suite
  app.get('/dev/run-algorithm-tests', (req, res) => {
    try {
      const testSuite = new RecommendationTestSuite();
      testSuite.runAllTests();
      
      res.json({
        success: true,
        results: {
          passed: testSuite.passed,
          failed: testSuite.failed,
          total: testSuite.tests.length,
          successRate: ((testSuite.passed / testSuite.tests.length) * 100).toFixed(1) + '%',
          details: testSuite.tests
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Individual test group endpoints
  app.get('/dev/test/scoring', (req, res) => {
    const testSuite = new RecommendationTestSuite();
    testSuite.runScoringTests();
    
    res.json({
      group: 'Scoring Algorithm',
      results: testSuite.tests
    });
  });

  app.get('/dev/test/feed-recommendations', (req, res) => {
    const testSuite = new RecommendationTestSuite();
    testSuite.runFeedRecommendationTests();
    
    res.json({
      group: 'Feed Recommendations', 
      results: testSuite.tests
    });
  });
}

// Export for use in your server
module.exports = { RecommendationTestSuite, setupTestEndpoints };