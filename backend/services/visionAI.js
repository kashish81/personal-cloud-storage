const vision = require('@google-cloud/vision');
const fs = require('fs').promises;

class VisionAIService {
  constructor() {
    this.client = new vision.ImageAnnotatorClient({
      apiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY
    });
  }

  async analyzeImage(imagePath, filename) {
    console.log(`Analyzing image: ${filename}`);
    
    try {
      const imageBuffer = await fs.readFile(imagePath);
      
      // Get object/label detection
      const [labelResult] = await this.client.labelDetection({
        image: { content: imageBuffer },
        maxResults: 10
      });

      // Get text detection (OCR)
      const [textResult] = await this.client.textDetection({
        image: { content: imageBuffer }
      });

      return this.processResults(
        labelResult.labelAnnotations || [], 
        textResult.textAnnotations || [], 
        filename
      );
      
    } catch (error) {
      console.error('Google Vision error:', error.message);
      throw error;
    }
  }

  processResults(labels, textAnnotations, filename) {
    const tags = ['image'];
    let summary = `Image file "${filename}"`;
    
    // Process object labels
    if (labels.length > 0) {
      const highConfidenceLabels = labels
        .filter(label => label.score > 0.7)
        .map(label => label.description.toLowerCase())
        .slice(0, 6);
      
      tags.push(...highConfidenceLabels);
      
      const topObjects = highConfidenceLabels.slice(0, 3).join(', ');
      summary = `Image containing ${topObjects} (${Math.round(labels[0].score * 100)}% confidence)`;
    }
    
    // Process text detection
    if (textAnnotations.length > 0) {
      const detectedText = textAnnotations[0].description;
      tags.push('text', 'ocr');
      
      const wordCount = detectedText.split(' ').length;
      summary += `. Contains ${wordCount} words of readable text`;
    }
    
    return {
      tags: [...new Set(tags)].slice(0, 8),
      summary: summary
    };
  }
}

module.exports = new VisionAIService();