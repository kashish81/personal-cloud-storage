const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(express.json({ limit: '10mb' }));

// Simple file storage
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// In-memory file list (simplified)
let files = [
  {
    id: '1',
    name: 'Sample File.pdf',
    size: 1024000,
    uploadDate: new Date().toISOString(),
    aiTags: ['sample', 'document'],
    aiSummary: 'Sample file for testing'
  }
];

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server running',
    files: files.length
  });
});

app.get('/api/files', (req, res) => {
  res.json({ files });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file' });
  }

  const newFile = {
    id: Date.now().toString(),
    name: req.file.originalname,
    size: req.file.size,
    uploadDate: new Date().toISOString(),
    aiTags: ['uploaded', 'new'],
    aiSummary: `File ${req.file.originalname} uploaded successfully`
  };

  files.push(newFile);
  res.json({ message: 'Success', file: newFile });
});

app.delete('/api/files/:id', (req, res) => {
  const fileId = req.params.id;
  files = files.filter(f => f.id !== fileId);
  res.json({ message: 'Deleted' });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Error:', error.message);
  res.status(500).json({ error: 'Server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});