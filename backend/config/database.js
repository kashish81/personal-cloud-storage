const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// Force IPv4 resolution
dns.setDefaultResultOrder('ipv4first');

console.log('=== SUPABASE CONNECTION ===');
console.log('Forcing IPv4 connection...');

// Use Supavisor pooler endpoint (IPv4 guaranteed)
const connectionConfig = {
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543, // Transaction mode port
  database: 'postgres',
  user: 'postgres.xlbrvoqqgfvrgramyovb',
  password: process.env.DB_PASSWORD || 'kash-divya90',
  ssl: {
    rejectUnauthorized: false
  },
  // Force IPv4
  connectionTimeoutMillis: 10000,
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000
};

const pool = new Pool(connectionConfig);

const testConnection = async () => {
  try {
    console.log('Connecting to:', connectionConfig.host + ':' + connectionConfig.port);
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL Connected via Supavisor!');
    console.log('📅 Time:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    console.error('Config:', {
      host: connectionConfig.host,
      port: connectionConfig.port,
      user: connectionConfig.user,
      passwordSet: !!connectionConfig.password
    });
    throw error;
  }
};

pool.on('error', (err) => {
  console.error('Database error:', err.message);
});

module.exports = { 
  pool,
  testConnection
};