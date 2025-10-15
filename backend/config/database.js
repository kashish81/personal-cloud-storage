const { Pool } = require('pg');
require('dotenv').config();

console.log('=== SUPABASE CONNECTION ===');
console.log('Using Session Pooler (IPv4 compatible)');

// Session Pooler - IPv4 compatible, port 5432
const connectionString = `postgresql://postgres.xlbrvoqqgfvrgramyovb:${process.env.DB_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`;

const pool = new Pool({
  connectionString: connectionString,
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
    console.log('✅ PostgreSQL Connected via Session Pooler!');
    console.log('📅 Database Time:', result.rows[0].now);
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