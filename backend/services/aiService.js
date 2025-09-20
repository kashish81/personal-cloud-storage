const path = require('path');

// Try to load Google Vision, fallback if not available
let visionAI = null;
try {
  visionAI = require('./visionAI');
  console.log('✅ Google Vision AI loaded');
} catch (error) {
  console.log('⚠️ Google Vision not available, using enhanced fallback');
}

class AIService {
  async analyzeFile(filePath, filename, mimetype, size) {
    console.log(`🤖 AI analyzing: ${filename}`);
    
    try {
      if (mimetype.startsWith('image/') && visionAI) {
        // Use Google Vision for images
        return await visionAI.analyzeImage(filePath, filename);
      } else {
        // Enhanced pattern analysis
        return this.enhancedAnalysis(filename, mimetype, size);
      }
    } catch (error) {
      console.error(`❌ AI analysis failed: ${error.message}`);
      return this.enhancedAnalysis(filename, mimetype, size);
    }
  }

  enhancedAnalysis(filename, mimetype, size) {
    const baseName = filename.toLowerCase();
    const ext = path.extname(filename).toLowerCase();
    let tags = [];
    let summary = '';

    if (mimetype.startsWith('image/')) {
      tags = ['image', 'photo', 'visual'];
      
      // Smart filename analysis for images
      if (baseName.includes('me') || baseName.includes('profile')) {
        tags.push('profile', 'personal', 'portrait');
        summary = `Personal profile image "${filename}"`;
      } else if (baseName.includes('pricing') || baseName.includes('price')) {
        tags.push('pricing', 'business', 'commercial');
        summary = `Pricing-related image "${filename}" for business use`;
      } else if (baseName.includes('screenshot')) {
        tags.push('screenshot', 'capture', 'interface');
        summary = `Screenshot image "${filename}" captured for reference`;
      } else {
        summary = `Image file "${filename}" ready for viewing`;
      }
    } 
    else if (mimetype.includes('pdf')) {
      tags = ['pdf', 'document', 'text'];
      
      if (baseName.includes('guide') || baseName.includes('manual')) {
        tags.push('guide', 'reference', 'documentation');
      }
      
      summary = `PDF document "${filename}" containing text content`;
    }
    else if (mimetype.includes('word')) {
      tags = ['document', 'word', 'text'];
      summary = `Word document "${filename}" ready for editing`;
    }
    else {
      tags = ['file', 'data'];
      summary = `File "${filename}" uploaded successfully`;
    }

    return {
      tags: [...new Set(tags)],
      summary,
      source: 'enhanced-analysis'
    };
  }
}

module.exports = new AIService();