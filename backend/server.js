require('dotenv').config();
const aiService = require('./services/aiService');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

// Import AI service (will use fallback if files don't exist yet)
try {
  aiService = require('./services/aiService');
  console.log('✅ AI Service loaded successfully');
} catch (error) {
  console.log('⚠️ AI Service not found, using fallback analysis');
}

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
const ensureUploadDir = async () => {
  try {
    await fs.access('uploads');
    console.log('📁 Uploads directory found');
  } catch (error) {
    await fs.mkdir('uploads', { recursive: true });
    console.log('📁 Created uploads directory');
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mp3|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: images, documents, videos, audio, zip'));
    }
  }
});

// In-memory storage for demo
let files = [
  {
    id: '1',
    name: 'Welcome Guide.pdf',
    originalname: 'Welcome Guide.pdf',
    filename: 'welcome-guide.pdf',
    mimetype: 'application/pdf',
    size: 1024000,
    uploadDate: new Date().toISOString(),
    aiTags: ['document', 'guide', 'welcome'],
    aiSummary: 'Welcome guide for new users explaining the cloud storage features.',
    aiProcessed: true
  },
  {
    id: '2',
    name: 'Sample Image.jpg',
    originalname: 'Sample Image.jpg', 
    filename: 'sample-image.jpg',
    mimetype: 'image/jpeg',
    size: 512000,
    uploadDate: new Date(Date.now() - 86400000).toISOString(),
    aiTags: ['image', 'photo', 'sample'],
    aiSummary: 'Sample image file for testing the cloud storage system.',
    aiProcessed: true
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '🚀 Cloud Storage API is running!',
    timestamp: new Date().toISOString(),
    filesCount: files.length,
    aiService: aiService ? 'Google Vision Ready' : 'Fallback Mode'
  });
});

app.get('/api/files', (req, res) => {
  console.log(`📋 Fetching ${files.length} files`);
  res.json({ 
    files: files.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
  });
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📤 File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename
    });

    const newFile = {
      id: Date.now().toString(),
      name: req.file.originalname,
      originalname: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date().toISOString(),
      aiTags: [],
      aiSummary: null,
      aiProcessed: false
    };

    files.push(newFile);
    console.log('✅ File added to memory storage');

    // AI Processing
setTimeout(async () => {
  const fileIndex = files.findIndex(f => f.id === newFile.id);
  if (fileIndex !== -1) {
    try {
      console.log(`🤖 Starting AI analysis for: ${newFile.name}`);
      
      const aiResult = await aiService.analyzeFile(
        req.file.path,
        req.file.originalname,
        req.file.mimetype,
        req.file.size
      );
      
      files[fileIndex].aiTags = aiResult.tags;
      files[fileIndex].aiSummary = aiResult.summary;
      files[fileIndex].aiProcessed = true;
      
      console.log(`✅ AI analysis complete for: ${newFile.name}`);
      console.log(`   Tags: ${aiResult.tags.join(', ')}`);
      
    } catch (error) {
      console.error(`❌ AI analysis error: ${error.message}`);
      files[fileIndex].aiProcessed = true;
    }
  }
}, 1500);

    console.log('✅ Sending success response');
    res.json({ 
      message: 'File uploaded successfully', 
      file: newFile 
    });
    
  } catch (error) {
    console.error('❌ Upload route error:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      details: error.message 
    });
  }
});

app.delete('/api/files/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    const fileIndex = files.findIndex(f => f.id === fileId);
    
    if (fileIndex === -1) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = files[fileIndex];
    console.log(`🗑️ Deleting: ${file.name}`);
    
    // Delete physical file if it exists
    if (file.filename && !file.filename.includes('sample') && !file.filename.includes('welcome')) {
      try {
        await fs.unlink(path.join('uploads', file.filename));
        console.log(`   Physical file deleted: ${file.filename}`);
      } catch (error) {
        console.warn(`   Warning: Could not delete physical file: ${error.message}`);
      }
    }

    files.splice(fileIndex, 1);
    res.json({ 
      message: 'File deleted successfully',
      deletedFile: file.name
    });
  } catch (error) {
    console.error('❌ Delete error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/files/:id/download', (req, res) => {
  const file = files.find(f => f.id === req.params.id);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  console.log(`📥 Download request: ${file.name}`);

  // For sample files, send a placeholder response
  if (file.filename.includes('sample') || file.filename.includes('welcome')) {
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.send(`This is a placeholder for: ${file.originalname}`);
    return;
  }

  const filePath = path.join(__dirname, 'uploads', file.filename);
  res.download(filePath, file.originalname, (err) => {
    if (err) {
      console.error('❌ Download error:', err.message);
      res.status(404).json({ error: 'File not found on disk' });
    }
  });
});

// Generate share link
app.post('/api/files/:id/share', (req, res) => {
  const file = files.find(f => f.id === req.params.id);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  const shareToken = Math.random().toString(36).substr(2, 16);
  const shareUrl = `http://localhost:${PORT}/share/${shareToken}`;
  
  console.log(`🔗 Generated share link for: ${file.name}`);
  
  res.json({
    shareUrl,
    expiresIn: '7 days',
    fileName: file.name
  });
});

// Fallback AI Analysis Function
function generateFallbackAnalysis(filename, mimetype, size) {
  let tags = [];
  let summary = '';

  const fileExt = path.extname(filename).toLowerCase();
  const baseName = path.basename(filename, fileExt).toLowerCase();

  // Generate tags based on file type and name
  if (mimetype.startsWith('image/')) {
    tags = ['image', 'photo', 'visual'];
    
    if (baseName.includes('screenshot')) {
      tags.push('screenshot', 'capture');
      summary = `Screenshot image "${filename}" captured for reference.`;
    } else {
      summary = `Image file "${filename}" (${formatFileSize(size)}) ready for viewing.`;
    }
  } 
  else if (mimetype.includes('pdf')) {
    tags = ['pdf', 'document', 'text'];
    summary = `PDF document "${filename}" (${formatFileSize(size)}) containing text content.`;
  }
  else if (mimetype.includes('word')) {
    tags = ['document', 'word', 'text'];
    summary = `Word document "${filename}" (${formatFileSize(size)}) ready for editing.`;
  }
  else {
    tags = ['file'];
    summary = `File "${filename}" (${formatFileSize(size)}) uploaded successfully.`;
  }

  // Add smart filename analysis
  if (baseName.includes('data')) tags.push('data');
  if (baseName.includes('mining')) tags.push('mining', 'analysis');
  if (baseName.includes('unit')) tags.push('unit', 'lesson');
  if (baseName.includes('resume')) tags.push('resume', 'career');

  return {
    tags: [...new Set(tags)],
    summary
  };
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
    }
  }
  
  console.error('❌ Server error:', error.message);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
ensureUploadDir().then(() => {
  app.listen(PORT, () => {
    console.log('🚀 ====================================');
    console.log(`🚀 Cloud Storage API Server Started!`);
    console.log(`🚀 Running on: http://localhost:${PORT}`);
    console.log(`🚀 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🚀 Files API: http://localhost:${PORT}/api/files`);
    console.log('🚀 ====================================');
    console.log(`📁 Files in storage: ${files.length}`);
    console.log(`🤖 AI Service: ${aiService ? 'Google Vision Ready' : 'Fallback Mode'}`);
    console.log('✅ Ready to accept file uploads!');
  });
}).catch(error => {
  console.error('❌ Failed to start server:', error);
});