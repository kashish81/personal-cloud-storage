const { Pool } = require('pg');
require('dotenv').config();

console.log('=== SUPABASE CONNECTION DEBUG ===');
console.log('Attempting to connect to Supabase...');

const pool = new Pool({
  host: 'db.xlbrvoqqgfvrgramyovb.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  // Force IPv4 to avoid IPv6 issues on Render
  options: '-c client_encoding=UTF8'
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL Connected Successfully!');
    console.log('📅 Database Time:', result.rows[0].now);
    console.log('🔐 Password:', process.env.DB_PASSWORD ? 'Set' : 'Not Set');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL Connection Error:', error.message);
    console.error('Connection details:');
    console.error('- Host: db.xlbrvoqqgfvrgramyovb.supabase.co');
    console.error('- Port: 5432');
    console.error('- Database: postgres');
    console.error('- User: postgres');
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