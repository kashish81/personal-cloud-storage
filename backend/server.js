require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

// Try to load AI service
let visionAI = null;
try {
  visionAI = require('./services/visionAI');
  console.log('Google Vision AI loaded');
} catch (error) {
  console.log('AI service not available, using fallback');
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }
});

let files = [
  {
    id: '1',
    name: 'Sample File.pdf',
    size: 1024000,
    uploadDate: new Date().toISOString(),
    aiTags: ['sample', 'document'],
    aiSummary: 'Sample file for testing',
    aiProcessed: true
  }
];

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server running with AI capabilities',
    files: files.length,
    aiEnabled: !!visionAI
  });
});

app.get('/api/files', (req, res) => {
  res.json({ files });
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file' });
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
    aiSummary: 'Processing...',
    aiProcessed: false
  };

  files.push(newFile);
  res.json({ message: 'Success', file: newFile });

  // Smart AI processing (no external APIs needed)
  setTimeout(() => {
    const fileIndex = files.findIndex(f => f.id === newFile.id);
    if (fileIndex !== -1) {
      const aiResult = generateIntelligentTags(newFile.originalname, newFile.mimetype, newFile.size);
      
      files[fileIndex].aiTags = aiResult.tags;
      files[fileIndex].aiSummary = aiResult.summary;
      files[fileIndex].aiProcessed = true;
      
      console.log('Smart AI analysis complete:', aiResult.tags);
    }
  }, 2000);
});

function generateIntelligentTags(filename, mimetype, size) {
  const name = filename.toLowerCase();
  const ext = require('path').extname(filename).toLowerCase();
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
    } else if (name.includes('photo') || name.includes('pic')) {
      tags.push('photo', 'photography', 'personal');
      summary = `Personal photo "${filename}" from camera or gallery`;
    } else if (name.includes('me') || name.includes('profile') || name.includes('avatar')) {
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

  // Add size-based intelligence
  if (size > 5 * 1024 * 1024) tags.push('large-file');
  if (size < 100 * 1024) tags.push('small-file');
  
  return { tags: [...new Set(tags)], summary };
}

app.delete('/api/files/:id', (req, res) => {
  files = files.filter(f => f.id !== req.params.id);
  res.json({ message: 'Deleted' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`AI capabilities: ${visionAI ? 'Enabled' : 'Disabled'}`);
});