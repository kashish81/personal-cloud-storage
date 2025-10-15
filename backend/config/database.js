const { Pool } = require('pg');
require('dotenv').config();

console.log('=== SUPABASE CONNECTION ===');

// Use DATABASE_URL directly
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://postgres.xlbrvoqqgfvrgramyovb:${process.env.DB_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL Connected!');
    console.log('📅 Time:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    throw error;
  }
};

pool.on('error', (err) => {
  console.error('Database error:', err);
});

module.exports = { 
  pool,
  testConnection
};