// database.js - PostgreSQL version for Render
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // Required for Render PostgreSQL
  },
  // Optional: Connection pool settings
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // how long to wait for a connection
  maxUses: 7500, // close a client after it has been used this many times
});

// Test connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL database connected successfully to Render');
    
    // Test query to verify everything works
    const result = await client.query('SELECT NOW() as current_time');
    console.log('📊 Database time:', result.rows[0].current_time);
    
    client.release();
  } catch (error) {
    console.error('❌ PostgreSQL database connection failed:', error.message);
    console.error('💡 Make sure your DATABASE_URL environment variable is set correctly');
  }
}

// Event listeners for connection monitoring
pool.on('connect', () => {
  console.log('🔗 New client connected to PostgreSQL pool');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
});

pool.on('remove', () => {
  console.log('🔌 Client removed from PostgreSQL pool');
});

// Test connection on startup
testConnection();

// Export the pool
export default pool;
