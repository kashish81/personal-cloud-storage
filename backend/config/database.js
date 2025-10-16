const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: 'postgresql://postgres:kash-divya90@db.xlbrvoqqgfvrgramyovb.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database Connected!');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ DB Error:', error.message);
    throw error;
  }
};

pool.on('error', (err) => console.error('DB error:', err));

module.exports = { pool, testConnection };