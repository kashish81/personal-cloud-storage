const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');
const { authenticateToken } = require('./auth');

// Import AI tagging service
const { generateTags: generateAITags } = require('../services/aiTagging');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

// Fallback simple tags (if AI fails)
const generateSimpleTags = (filename, mimeType) => {
  const tags = [];
  const nameLower = filename.toLowerCase();
  
  if (mimeType.startsWith('image/')) tags.push('image');
  else if (mimeType.startsWith('video/')) tags.push('video');
  else if (mimeType.startsWith('audio/')) tags.push('audio');
  else if (mimeType.includes('pdf')) tags.push('document', 'pdf');
  else if (mimeType.includes('word')) tags.push('document', 'word');
  else if (mimeType.includes('sheet') || mimeType.includes('excel')) tags.push('spreadsheet', 'data');
  else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) tags.push('presentation');
  else tags.push('file');
  
  if (nameLower.includes('report')) tags.push('report');
  if (nameLower.includes('invoice')) tags.push('invoice', 'finance');
  if (nameLower.includes('resume') || nameLower.includes('cv')) tags.push('resume', 'career');
  if (nameLower.includes('photo')) tags.push('photo');
  if (nameLower.includes('screenshot')) tags.push('screenshot');
  if (nameLower.includes('backup')) tags.push('backup');
  if (nameLower.includes('project')) tags.push('project', 'work');
  if (nameLower.includes('personal')) tags.push('personal');
  
  const year = new Date().getFullYear();
  if (nameLower.includes(year.toString())) tags.push(year.toString());
  
  return tags;
};

const generateDescription = (filename, mimeType, tags) => {
  const type = mimeType.split('/')[0];
  const extension = path.extname(filename).substring(1).toUpperCase();
  
  if (tags.length > 0) {
    return `This ${type} file contains ${tags.slice(0, 3).join(', ')} content. Format: ${extension}`;
  }
  return `${extension} ${type} file uploaded to cloud storage.`;
};

// ===== UPLOAD FILE =====
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const userId = req.user.id;
    const { originalname, filename, mimetype, size, path: filePath } = req.file;

    // Generate AI-powered tags
    let tags = [];
    try {
      console.log('🤖 Generating AI tags for:', originalname);
      tags = await generateAITags(filePath, originalname, mimetype);
      console.log('✅ AI Tags generated:', tags);
    } catch (aiError) {
      console.error('⚠️ AI tagging failed:', aiError.message);
      console.log('Using fallback simple tags...');
      tags = generateSimpleTags(originalname, mimetype);
    }

    const description = generateDescription(originalname, mimetype, tags);

    const result = await pool.query(
      `INSERT INTO files (user_id, original_name, stored_name, mime_type, size, tags, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, originalname, filename, mimetype, size, tags, description]
    );

    const fileRecord = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        id: fileRecord.id,
        originalName: fileRecord.original_name,
        mimeType: fileRecord.mime_type,
        size: fileRecord.size,
        tags: fileRecord.tags,
        description: fileRecord.description,
        createdAt: fileRecord.created_at
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    if (req.file) {
      const errorFilePath = path.join(uploadsDir, req.file.filename);
      if (fs.existsSync(errorFilePath)) {
        fs.unlinkSync(errorFilePath);
      }
    }

    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
});

// ===== GET ALL FILES =====
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM files WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const files = result.rows.map(file => ({
      id: file.id,
      originalName: file.original_name,
      mimeType: file.mime_type,
      size: file.size,
      tags: file.tags,
      description: file.description,
      createdAt: file.created_at
    }));

    res.json({
      success: true,
      files: files
    });
  } catch (error) {
    console.error('Fetch files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files',
      error: error.message
    });
  }
});

// ===== DOWNLOAD FILE =====
router.get('/download/:id', authenticateToken, async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM files WHERE id = $1 AND user_id = $2',
      [fileId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const file = result.rows[0];
    const filePath = path.join(uploadsDir, file.stored_name);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.download(filePath, file.original_name);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'File download failed',
      error: error.message
    });
  }
});

// ===== DELETE FILE =====
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM files WHERE id = $1 AND user_id = $2',
      [fileId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const file = result.rows[0];

    const filePath = path.join(uploadsDir, file.stored_name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM files WHERE id = $1', [fileId]);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'File deletion failed',
      error: error.message
    });
  }
});

// ===== SEARCH FILES =====
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query required'
      });
    }

    const result = await pool.query(
      `SELECT * FROM files 
       WHERE user_id = $1 
       AND (
         original_name ILIKE $2 
         OR description ILIKE $2 
         OR $3 = ANY(tags)
       )
       ORDER BY created_at DESC`,
      [userId, `%${q}%`, q]
    );

    const files = result.rows.map(file => ({
      id: file.id,
      originalName: file.original_name,
      mimeType: file.mime_type,
      size: file.size,
      tags: file.tags,
      description: file.description,
      createdAt: file.created_at
    }));

    res.json({
      success: true,
      count: files.length,
      files: files
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

module.exports = router;