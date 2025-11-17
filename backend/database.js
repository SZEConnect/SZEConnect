// database.js
import pg from 'pg';
const { Pool } = pg;

// Always use Render's internal URL
const connectionString = process.env.INTERNAL_DATABASE_URL;

if (!connectionString) {
  throw new Error("No INTERNAL_DATABASE_URL found in environment variables.");
}

// Render internal Postgres requires SSL, but we disable certificate verification
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000
});

// Optional: test connection helper
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now');
    console.log('✅ Database connected! Current time:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
};

export default pool;
