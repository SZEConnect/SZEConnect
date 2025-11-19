import pool from './database.js';

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    console.log('✅ Connected to MySQL! Server time is:', rows[0].now);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

testConnection();
