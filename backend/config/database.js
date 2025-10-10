const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false,
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL Connected Successfully!');
    console.log('📅 Database Time:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL Connection Error:', error.message);
    console.error('\nCheck these settings:');
    console.error('1. DATABASE_URL is set in .env file');
    console.error('2. Supabase connection string is correct');
    console.error('3. Database password is correct');
    console.error('4. Network connection is working');
    throw error;
  }
};

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected database error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await pool.end();
    console.log('Database pool closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing pool:', err);
    process.exit(1);
  }
});

module.exports = { 
  pool,
  testConnection,
  query: (text, params) => pool.query(text, params)
};