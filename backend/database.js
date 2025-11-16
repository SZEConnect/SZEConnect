// database.js - USING INTERNAL URL FOR RENDER
import pkg from 'pg';
const { Pool } = pkg;

console.log('🔧 Database Configuration for Render...');

// Use INTERNAL URL for Render, external for local development
const connectionString = process.env.INTERNAL_DATABASE_URL || process.env.DATABASE_URL;

console.log('   Using:', process.env.INTERNAL_DATABASE_URL ? 'INTERNAL_URL (Render)' : 'EXTERNAL_URL (Local)');
console.log('   Connection available:', !!connectionString);

if (connectionString) {
  const safeUrl = connectionString.replace(/:[^@]+@/, ':****@');
  console.log('   Connection:', safeUrl);
}

const pool = new Pool({
  connectionString: connectionString,
  // No SSL needed for internal connections on Render
  ssl: process.env.INTERNAL_DATABASE_URL ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

export const testConnection = async () => {
  let client;
  try {
    console.log('🔄 Testing database connection...');
    
    client = await pool.connect();
    const result = await client.query('SELECT NOW() as time, version() as version');
    
    console.log('✅ DATABASE CONNECTION SUCCESSFUL!');
    console.log('📊 Database time:', result.rows[0].time);
    console.log('🐘 PostgreSQL:', result.rows[0].version.split(',')[0]);
    console.log('📍 Connection type:', process.env.INTERNAL_DATABASE_URL ? 'INTERNAL' : 'EXTERNAL');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error:', error.message);
    console.error('   Connection type:', process.env.INTERNAL_DATABASE_URL ? 'INTERNAL' : 'EXTERNAL');
    
    return false;
  } finally {
    if (client) client.release();
  }
};

pool.on('connect', () => console.log('🔗 New database client connected'));
pool.on('error', (err) => console.error('❌ Database pool error:', err.message));

export default pool;
