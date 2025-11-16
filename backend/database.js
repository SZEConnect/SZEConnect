// database.js - FIXED for SSL
import pkg from 'pg';
const { Pool } = pkg;

console.log('🔧 Database Configuration:');
console.log('   DB_HOST:', process.env.DB_HOST);
console.log('   DB_USER:', process.env.DB_USER);
console.log('   DB_NAME:', process.env.DB_NAME);
console.log('   DB_PORT:', process.env.DB_PORT);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // This is required for Render
    require: true // Add this line to force SSL
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const testConnection = async () => {
  let client;
  try {
    console.log('🔄 Attempting SSL connection to:', process.env.DB_HOST);
    client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ SSL Database connection successful!');
    console.log('📊 Server time:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    
    // More detailed SSL error info
    if (error.message.includes('SSL')) {
      console.error('💡 SSL Issue Detected:');
      console.error('   - Render PostgreSQL requires SSL');
      console.error('   - Make sure ssl: { require: true } is set');
    }
    return false;
  } finally {
    if (client) client.release();
  }
};

pool.on('connect', () => console.log('🔗 New SSL client connected'));
pool.on('error', (err) => console.error('❌ Pool error:', err.message));

export default pool;
