const { Pool } = require('pg');
require('dotenv').config();

console.log('=== SUPABASE CONNECTION DEBUG ===');
console.log('Attempting to connect to Supabase via Transaction Pooler...');

const pool = new Pool({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.xlbrvoqqgfvrgramyovb',
  password: process.env.DB_PASSWORD,
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
    console.log('✅ PostgreSQL Connected Successfully via Pooler!');
    console.log('📅 Database Time:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL Connection Error:', error.message);
    console.error('Using Transaction Pooler:');
    console.error('- Host: aws-0-ap-southeast-1.pooler.supabase.com');
    console.error('- Port: 6543');
    console.error('- User: postgres.xlbrvoqqgfvrgramyovb');
    console.error('- Password set:', !!process.env.DB_PASSWORD);
    throw error;
  }
};

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

module.exports = { 
  pool,
  testConnection
};