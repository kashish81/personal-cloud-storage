const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { generateTags } = require('../services/aiTagging');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000 * 1024 * 1024 // 100MB max file size
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

// STAR/UNSTAR FILE - PUT /api/files/:id/star
router.put('/:id/star', auth, async (req, res) => {
  try {
    const file = await File.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        isDeleted: false
      }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    await file.update({
      isStarred: !file.isStarred
    });

    res.json({
      success: true,
      message: file.isStarred ? 'File starred' : 'File unstarred',
      isStarred: file.isStarred
    });
  } catch (error) {
    console.error('Star error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to star file'
    });
  }
});

// GET STARRED FILES - GET /api/files/starred/list
router.get('/starred/list', auth, async (req, res) => {
  try {
    const files = await File.findAll({
      where: { 
        userId: req.user.id,
        isStarred: true,
        isDeleted: false
      },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'originalName', 'mimeType', 'size', 'createdAt', 'tags', 'isStarred']
    });

    res.json({
      success: true,
      files: files
    });
  } catch (error) {
    console.error('Get starred files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch starred files'
    });
  }
});

// GET BIN FILES - GET /api/files/bin/list
router.get('/bin/list', auth, async (req, res) => {
  try {
    const files = await File.findAll({
      where: { 
        userId: req.user.id,
        isDeleted: true
      },
      order: [['deletedAt', 'DESC']],
      attributes: ['id', 'originalName', 'mimeType', 'size', 'deletedAt', 'tags']
    });

    res.json({
      success: true,
      files: files
    });
  } catch (error) {
    console.error('Get bin files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bin files'
    });
  }
});

// GET FILE TYPE STATISTICS - GET /api/files/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const files = await File.findAll({
      where: { userId: req.user.id, isDeleted: false },
      attributes: ['mimeType', 'size']
    });

    const stats = {
      images: 0,
      documents: 0,
      videos: 0,
      audio: 0,
      others: 0
    };

    files.forEach(file => {
      const mime = file.mimeType.toLowerCase();
      if (mime.startsWith('image/')) {
        stats.images += parseInt(file.size);
      } else if (mime.includes('pdf') || mime.includes('document') || mime.includes('word') || mime.includes('text')) {
        stats.documents += parseInt(file.size);
      } else if (mime.startsWith('video/')) {
        stats.videos += parseInt(file.size);
      } else if (mime.startsWith('audio/')) {
        stats.audio += parseInt(file.size);
      } else {
        stats.others += parseInt(file.size);
      }
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// GET ALL FILES - GET /api/files
router.get('/', auth, async (req, res) => {
  try {
    const files = await File.findAll({
      where: { 
        userId: req.user.id,
        isDeleted: false
      },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'originalName', 'mimeType', 'size', 'createdAt', 'tags', 'isStarred']
    });

    res.json({
      success: true,
      files: files
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files'
    });
  }
});

// UPLOAD FILE - POST /api/files/upload
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const userId = req.user.id;
    const user = await User.findByPk(userId);

    const currentStorage = Number(user.storageUsed) || 0;
    const fileSize = Number(req.file.size) || 0;
    const newStorageUsed = currentStorage + fileSize;

    if (!Number.isSafeInteger(newStorageUsed) || newStorageUsed < 0) {
      fs.unlinkSync(req.file.path);
      return res.status(500).json({
        success: false,
        message: 'Storage calculation error'
      });
    }

    if (newStorageUsed > user.storageLimit) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Storage limit exceeded'
      });
    }

    // Generate AI tags
    console.log('Generating AI tags for:', req.file.originalname);
    const tags = await generateTags(req.file.path, req.file.originalname, req.file.mimetype);
    console.log('Generated tags:', tags);

    // Create file record
    const file = await File.create({
      userId: userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      tags: tags
    });

    // Update user's storage
    await user.update({
      storageUsed: newStorageUsed
    });

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        id: file.id,
        originalName: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        tags: file.tags,
        createdAt: file.createdAt
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Upload failed'
    });
  }
});

// RESTORE FILE - PUT /api/files/:id/restore
router.put('/:id/restore', auth, async (req, res) => {
  try {
    const file = await File.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        isDeleted: true
      }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found in bin'
      });
    }

    await file.update({
      isDeleted: false,
      deletedAt: null
    });

    res.json({
      success: true,
      message: 'File restored successfully'
    });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore file'
    });
  }
});

// DOWNLOAD FILE - GET /api/files/download/:id
router.get('/download/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.download(file.path, file.originalName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Download failed'
    });
  }
});

// DELETE FILE - Soft delete (move to bin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        isDeleted: false
      }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    await file.update({
      isDeleted: true,
      deletedAt: new Date()
    });

    res.json({
      success: true,
      message: 'File moved to bin'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed'
    });
  }
});

// PERMANENT DELETE - DELETE /api/files/:id/permanent
router.delete('/:id/permanent', auth, async (req, res) => {
  try {
    const file = await File.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        isDeleted: true
      }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found in bin'
      });
    }

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    const user = await User.findByPk(req.user.id);
    await user.update({
      storageUsed: Math.max(0, Number(user.storageUsed) - Number(file.size))
    });

    await file.destroy();

    res.json({
      success: true,
      message: 'File permanently deleted'
    });
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
});

module.exports = router;