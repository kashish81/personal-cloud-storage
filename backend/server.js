const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running', files: files.length });
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});