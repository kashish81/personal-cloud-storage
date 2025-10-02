const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'cloud_storage',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Change to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      // Connection timeout
      connectTimeout: 60000
    }
  }
);

// Test database connection function
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected Successfully!');
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL Connection Error:', error.message);
    console.error('Check your .env file settings:');
    console.error('- DB_NAME:', process.env.DB_NAME);
    console.error('- DB_USER:', process.env.DB_USER);
    console.error('- DB_HOST:', process.env.DB_HOST);
    console.error('- DB_PORT:', process.env.DB_PORT);
    throw error;
  }
};

// Export both sequelize and testConnection
module.exports = { 
  sequelize, 
  testConnection 
};