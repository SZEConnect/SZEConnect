// database.js
import pg from 'pg';
const { Pool } = pg;

// Render provides an INTERNAL_DATABASE_URL for services on the same network.
// Locally, you use DATABASE_URL from your .env file.
const connectionString =
  process.env.INTERNAL_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("No DATABASE_URL or INTERNAL_DATABASE_URL found in env variables.");
}

// Render requires SSL, local Postgres does not.
const pool = new Pool({
  connectionString,
  ssl: process.env.RENDER 
    ? { rejectUnauthorized: false } 
    : false
});

export default pool;
