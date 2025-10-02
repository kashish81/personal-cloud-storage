require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
const connectDB = async () => {
  try {
    await testConnection();
    await sequelize.sync({ force: false });
    console.log('✅ Database synced successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

connectDB();

// ===== ROUTES =====

// Import Routes
const fileRoutes = require('./routes/files');

// Use Routes
app.use('/api/files', fileRoutes);

// Test Route - Root
app.get('/', (req, res) => {
  res.json({ 
    message: 'Cloud Storage API is running! ✅',
    database: 'PostgreSQL',
    status: 'Connected',
    endpoints: {
      auth: '/api/auth',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me (requires token)'
    }
  });
});

// Import Auth Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log(`💾 Database: PostgreSQL`);
});