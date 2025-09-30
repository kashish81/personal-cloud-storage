require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

// Database
const { File, initDatabase } = require('./models/database');

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// File upload configuration
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Ensure uploads directory exists
const ensureUploadDir = async () => {
  try {
    await fs.access('uploads');
  } catch (error) {
    await fs.mkdir('uploads', { recursive: true });
  }
};

// Routes
app.get('/api/health', async (req, res) => {
  try {
    const fileCount = await File.count();
    res.json({ 
      status: 'OK', 
      message: 'Server running with database',
      filesCount: fileCount,
      database: 'PostgreSQL'
    });
  } catch (error) {
    res.json({ 
      status: 'OK', 
      message: 'Server running (database error)',
      error: error.message
    });
  }
});

app.get('/api/files', async (req, res) => {
  try {
    const files = await File.findAll({
      order: [['uploadDate', 'DESC']]
    });
    res.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create file record in database
    const newFile = await File.create({
      name: req.file.originalname,
      originalname: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      aiTags: [],
      aiSummary: 'Processing...',
      aiProcessed: false
    });

    res.json({ 
      message: 'File uploaded successfully', 
      file: newFile 
    });

    // AI processing in background
    setTimeout(async () => {
      try {
        const aiResult = generateIntelligentTags(
          req.file.originalname, 
          req.file.mimetype, 
          req.file.size
        );
        
        await File.update(
          {
            aiTags: aiResult.tags,
            aiSummary: aiResult.summary,
            aiProcessed: true
          },
          {
            where: { id: newFile.id }
          }
        );
        
        console.log(`AI analysis complete for: ${newFile.name}`);
      } catch (error) {
        console.error('AI processing error:', error);
      }
    }, 2000);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.delete('/api/files/:id', async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete physical file
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.warn('Could not delete physical file:', error.message);
    }

    // Delete database record
    await File.destroy({
      where: { id: req.params.id }
    });

    res.json({ 
      message: 'File deleted successfully',
      deletedFile: file.name
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

app.get('/api/files/:id/download', async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(file.path, file.originalname);
  } catch (error) {
    res.status(500).json({ error: 'Download failed' });
  }
});

// AI tagging function (same as before)
function generateIntelligentTags(filename, mimetype, size) {
  const name = filename.toLowerCase();
  let tags = [];
  let summary = '';

  if (mimetype.startsWith('image/')) {
    tags = ['image', 'visual'];
    
    if (name.includes('screenshot') || name.includes('img-') || name.includes('capture')) {
      tags.push('screenshot', 'capture', 'interface');
      summary = `Screenshot image "${filename}" - likely interface capture`;
    } else if (name.includes('wa') || name.includes('whatsapp')) {
      tags.push('whatsapp', 'social', 'communication');
      summary = `WhatsApp shared image "${filename}" from social media`;
    } else if (name.includes('me') || name.includes('profile')) {
      tags.push('profile', 'personal', 'avatar');
      summary = `Profile or personal image "${filename}"`;
    } else {
      tags.push('photo');
      summary = `Image file "${filename}" ready for viewing`;
    }
  } else if (mimetype.includes('pdf')) {
    tags = ['pdf', 'document'];
    summary = `PDF document "${filename}"`;
  } else {
    tags = ['file'];
    summary = `File "${filename}" uploaded successfully`;
  }

  if (size > 5 * 1024 * 1024) tags.push('large-file');
  if (size < 100 * 1024) tags.push('small-file');
  
  return { tags: [...new Set(tags)], summary };
}

// Start server
const startServer = async () => {
  await ensureUploadDir();
  
  const dbConnected = await initDatabase();
  if (dbConnected) {
    console.log('Database initialized successfully');
  } else {
    console.log('Database connection failed - running without persistence');
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Database: ${dbConnected ? 'Connected' : 'Disconnected'}`);
  });
};

startServer();