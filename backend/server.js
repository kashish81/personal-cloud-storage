const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
const ensureUploadDir = async () => {
  try {
    await fs.access('uploads');
  } catch (error) {
    await fs.mkdir('uploads', { recursive: true });
  }
};

// Configure multer
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mp3|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// In-memory storage with sample data
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
    message: 'Cloud Storage API is running!',
    timestamp: new Date().toISOString(),
    filesCount: files.length
  });
});

app.get('/api/files', (req, res) => {
  res.json({ 
    files: files.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
  });
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

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

    // Simple AI processing (no complex loops)
    setTimeout(() => {
      const fileIndex = files.findIndex(f => f.id === newFile.id);
      if (fileIndex !== -1) {
        const aiResult = generateSimpleAI(newFile.originalname, newFile.mimetype);
        files[fileIndex].aiTags = aiResult.tags;
        files[fileIndex].aiSummary = aiResult.summary;
        files[fileIndex].aiProcessed = true;
      }
    }, 2000);

    res.json({ 
      message: 'File uploaded successfully', 
      file: newFile 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    
    // Delete physical file
    if (file.filename && !file.filename.includes('sample') && !file.filename.includes('welcome')) {
      try {
        await fs.unlink(path.join('uploads', file.filename));
      } catch (error) {
        console.warn('Could not delete physical file:', error.message);
      }
    }

    files.splice(fileIndex, 1);
    res.json({ 
      message: 'File deleted successfully',
      deletedFile: file.name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/files/:id/download', (req, res) => {
  const file = files.find(f => f.id === req.params.id);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  if (file.filename.includes('sample') || file.filename.includes('welcome')) {
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.send(`This is a placeholder for: ${file.originalname}`);
    return;
  }

  const filePath = path.join(__dirname, 'uploads', file.filename);
  res.download(filePath, file.originalname);
});

app.post('/api/files/:id/share', (req, res) => {
  const file = files.find(f => f.id === req.params.id);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  const shareToken = Math.random().toString(36).substr(2, 16);
  const shareUrl = `http://localhost:${PORT}/share/${shareToken}`;
  
  res.json({
    shareUrl,
    expiresIn: '7 days',
    fileName: file.name
  });
});

// Simple AI function (no heavy processing)
function generateSimpleAI(filename, mimetype) {
  const baseName = filename.toLowerCase();
  let tags = [];
  let summary = '';

  if (mimetype.startsWith('image/')) {
    tags = ['image', 'visual'];
    if (baseName.includes('screenshot')) tags.push('screenshot');
    if (baseName.includes('photo')) tags.push('photo');
    summary = `Image file "${filename}" ready for viewing.`;
  } else if (mimetype.includes('pdf')) {
    tags = ['pdf', 'document'];
    if (baseName.includes('report')) tags.push('report');
    summary = `PDF document "${filename}" containing text content.`;
  } else {
    tags = ['file'];
    summary = `File "${filename}" uploaded successfully.`;
  }

  return { tags, summary };
}

// Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
ensureUploadDir().then(() => {
  app.listen(PORT, () => {
    console.log(`Cloud Storage API running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
});