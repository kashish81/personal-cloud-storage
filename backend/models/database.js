const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// File model
const File = sequelize.define('File', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mimetype: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  aiTags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  aiSummary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  aiProcessed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  uploadDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Test connection and sync models
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models (creates tables if they don't exist)
    await sequelize.sync();
    console.log('Database models synchronized.');
    
    return true;
  } catch (error) {
    console.error('Unable to connect to database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  File,
  initDatabase
};