const vision = require('@google-cloud/vision');
const fs = require('fs').promises;

class VisionAIService {
  constructor() {
    // Initialize Vision API client
    this.client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // If using service account
      // OR for API key method:
      apiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY
    });
    console.log('👁️ Google Vision AI initialized');
  }

  async analyzeImage(imagePath, filename) {
    console.log(`📸 Google Vision analyzing: ${filename}`);
    
    try {
      // Read the image file
      const imageBuffer = await fs.readFile(imagePath);
      
      // Call Google Vision API for label detection
      const [labelResult] = await this.client.labelDetection({
        image: { content: imageBuffer },
        maxResults: 10
      });

      // Call for text detection (OCR)
      const [textResult] = await this.client.textDetection({
        image: { content: imageBuffer }
      });

      return this.processResults(
        labelResult.labelAnnotations || [], 
        textResult.textAnnotations || [], 
        filename
      );
      
    } catch (error) {
      console.error('❌ Google Vision error:', error.message);
      
      if (error.message.includes('API key')) {
        console.log('💡 Tip: Make sure your Google Cloud Vision API key is set in .env file');
      }
      
      throw error;
    }
  }

  processResults(labels, textAnnotations, filename) {
    const tags = ['image'];
    let summary = `Image file "${filename}"`;
    
    // Process object/concept labels
    if (labels.length > 0) {
      const highConfidenceLabels = labels
        .filter(label => label.score > 0.6) // 60% confidence threshold
        .map(label => label.description.toLowerCase())
        .slice(0, 8);
      
      tags.push(...highConfidenceLabels);
      
      const topObjects = highConfidenceLabels.slice(0, 3).join(', ');
      const confidence = Math.round(labels[0].score * 100);
      summary = `Image containing ${topObjects} (${confidence}% confidence)`;
    }
    
    // Process text detection (OCR)
    if (textAnnotations.length > 0) {
      const detectedText = textAnnotations[0].description;
      tags.push('text', 'ocr');
      
      const wordCount = detectedText.split(' ').length;
      summary += `. Contains ${wordCount} words of readable text`;
      
      // Smart context detection
      const text = detectedText.toLowerCase();
      if (text.includes('screenshot') || text.includes('capture')) {
        tags.push('screenshot');
      }
      if (text.includes('price') || text.includes('$')) {
        tags.push('pricing', 'business');
      }
      if (text.includes('email') || text.includes('@')) {
        tags.push('contact', 'email');
      }
    }
    
    // Remove duplicates and limit tags
    const uniqueTags = [...new Set(tags)].slice(0, 12);
    
    console.log(`✅ Google Vision analysis complete!`);
    console.log(`   Tags: ${uniqueTags.join(', ')}`);
    
    return {
      tags: uniqueTags,
      summary: summary
    };
  }
}

module.exports = new VisionAIService();