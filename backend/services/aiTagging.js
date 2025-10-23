const axios = require('axios');
const fs = require('fs');

// Optional dependencies - will work without them
let pdfParse, mammoth, XLSX;
try {
  pdfParse = require('pdf-parse');
  mammoth = require('mammoth');
  XLSX = require('xlsx');
} catch (error) {
  console.log('⚠️ Some document parsing libraries not installed. Install with: npm install pdf-parse mammoth xlsx');
}

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

// DEBUG: Check if API key is loaded
console.log('🔑 Hugging Face API Key Status:', HUGGINGFACE_API_KEY ? 
  `Loaded (${HUGGINGFACE_API_KEY.substring(0, 6)}...)` : 
  '❌ NOT LOADED - Check .env file!'
);

// Extract text from PDF
async function extractPDFText(filePath) {
  if (!pdfParse) {
    console.log('pdf-parse not installed, skipping PDF text extraction');
    return '';
  }
  
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text.substring(0, 5000);
  } catch (error) {
    console.error('PDF extraction error:', error.message);
    return '';
  }
}

// Extract text from Word
async function extractWordText(filePath) {
  if (!mammoth) {
    console.log('mammoth not installed, skipping Word text extraction');
    return '';
  }
  
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value.substring(0, 5000);
  } catch (error) {
    console.error('Word extraction error:', error.message);
    return '';
  }
}

// Extract text from Excel
function extractExcelText(filePath) {
  if (!XLSX) {
    console.log('xlsx not installed, skipping Excel text extraction');
    return '';
  }
  
  try {
    const workbook = XLSX.readFile(filePath);
    let text = '';
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      text += XLSX.utils.sheet_to_txt(sheet);
    });
    return text.substring(0, 5000);
  } catch (error) {
    console.error('Excel extraction error:', error.message);
    return '';
  }
}

// AI Text Classification (Hugging Face) - UPDATED ENDPOINT
async function classifyText(text) {
  if (!text || text.length < 50) return [];
  if (!HUGGINGFACE_API_KEY) {
    console.log('⚠️ HUGGINGFACE_API_KEY not set, skipping AI classification');
    return [];
  }
  
  try {
    const response = await axios.post(
      'https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli',
      {
        inputs: text.substring(0, 1000),
        parameters: {
          candidate_labels: [
            'business', 'finance', 'technology', 'science', 'education',
            'health', 'legal', 'report', 'invoice', 'contract',
            'presentation', 'research', 'analysis', 'marketing'
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (response.data && response.data.labels && response.data.scores) {
      return response.data.labels
        .slice(0, 3)
        .filter((_, idx) => response.data.scores[idx] > 0.3);
    }
    return [];
  } catch (error) {
    console.error('Text classification error:', error.message);
    console.log('⚠️ Text classification failed, using keyword extraction instead');
    // Fallback to keyword extraction
    return extractKeywords(text).slice(0, 3);
  }
}

// ENHANCED: AI Image Analysis with Better Tag Extraction - UPDATED ENDPOINT
async function analyzeImage(filePath, filename) {
  // ALWAYS try fallback first for better UX, then enhance with AI if available
  const fallbackTags = getFallbackImageTags(filename);
  
  if (!HUGGINGFACE_API_KEY) {
    console.log('⚠️ HUGGINGFACE_API_KEY not set, using smart filename-based tags');
    return fallbackTags;
  }
  
  try {
    console.log('🖼️ Analyzing image with AI...');
    const fileBuffer = fs.readFileSync(filePath);
    
    // Using Microsoft's GIT model - UPDATED ENDPOINT
    const response = await axios.post(
      'https://router.huggingface.co/hf-inference/models/microsoft/git-base',
      fileBuffer,
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/octet-stream'
        },
        timeout: 30000,
        maxContentLength: 10 * 1024 * 1024
      }
    );

    if (response.data && response.data[0]?.generated_text) {
      const caption = response.data[0].generated_text;
      console.log('📝 Image caption:', caption);
      
      // Extract meaningful tags from caption
      const tags = extractImageTags(caption, filename);
      console.log('🏷️ Extracted image tags:', tags);
      
      return tags.length > 0 ? tags : fallbackTags;
    }
    
    return fallbackTags;
  } catch (error) {
    console.error('Image analysis error:', error.message);
    console.log('⚠️ Hugging Face API failed. Using smart filename tags.');
    
    // Return enhanced fallback tags
    return fallbackTags.length > 1 ? fallbackTags : ['image', 'photo'];
  }
}

// NEW: Analyze image objects (fallback method) - UPDATED ENDPOINT
async function analyzeImageObjects(filePath) {
  if (!HUGGINGFACE_API_KEY) return [];
  
  try {
    const fileBuffer = fs.readFileSync(filePath);
    // Using Google's ViT model for image classification - UPDATED ENDPOINT
    const response = await axios.post(
      'https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224',
      fileBuffer,
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/octet-stream'
        },
        timeout: 30000
      }
    );

    if (response.data && Array.isArray(response.data)) {
      // Extract detected labels with confidence > 0.3
      const detectedObjects = response.data
        .filter(item => item.score > 0.3)
        .map(item => item.label.toLowerCase())
        .slice(0, 5);
      
      console.log('🎯 Detected labels:', detectedObjects);
      return detectedObjects;
    }
    
    return [];
  } catch (error) {
    console.error('Object detection error:', error.message);
    return [];
  }
}

// ENHANCED: Extract smart tags from image caption
function extractImageTags(caption, filename) {
  const tags = [];
  const captionLower = caption.toLowerCase();
  const filenameLower = filename.toLowerCase();
  
  // People & Portraits
  if (captionLower.match(/\b(person|people|man|woman|girl|boy|child|face|portrait)\b/)) {
    tags.push('person');
    if (captionLower.match(/\b(woman|girl|lady)\b/)) tags.push('woman');
    if (captionLower.match(/\b(man|boy|gentleman)\b/)) tags.push('man');
    if (captionLower.match(/\b(child|kid|baby)\b/)) tags.push('child');
    if (captionLower.match(/\b(smiling|smile|happy)\b/)) tags.push('portrait');
  }
  
  // Screenshots & UI
  if (filenameLower.includes('screenshot') || captionLower.match(/\b(screen|monitor|display|interface|website|app|software)\b/)) {
    tags.push('screenshot');
    tags.push('digital');
    if (captionLower.includes('website')) tags.push('web');
  }
  
  // Nature & Outdoor
  if (captionLower.match(/\b(tree|mountain|sky|cloud|beach|ocean|sea|forest|landscape|nature|outdoor)\b/)) {
    tags.push('nature');
    tags.push('outdoor');
    if (captionLower.includes('mountain')) tags.push('landscape');
    if (captionLower.match(/\b(ocean|sea|beach)\b/)) tags.push('water');
  }
  
  // Animals
  if (captionLower.match(/\b(dog|cat|bird|animal|pet)\b/)) {
    tags.push('animal');
    if (captionLower.match(/\b(dog|puppy)\b/)) tags.push('dog');
    if (captionLower.match(/\b(cat|kitten)\b/)) tags.push('cat');
  }
  
  // Food
  if (captionLower.match(/\b(food|meal|dish|plate|cuisine|cooking|restaurant|breakfast|lunch|dinner)\b/)) {
    tags.push('food');
    tags.push('meal');
  }
  
  // Architecture & Buildings
  if (captionLower.match(/\b(building|house|architecture|city|street|urban)\b/)) {
    tags.push('architecture');
    if (captionLower.includes('city')) tags.push('urban');
  }
  
  // Vehicles
  if (captionLower.match(/\b(car|vehicle|bike|motorcycle|truck|bus)\b/)) {
    tags.push('vehicle');
    tags.push('transport');
  }
  
  // Indoor
  if (captionLower.match(/\b(room|indoor|interior|furniture|desk|table|chair)\b/)) {
    tags.push('indoor');
  }
  
  // Technology
  if (captionLower.match(/\b(computer|laptop|phone|device|gadget|technology)\b/)) {
    tags.push('technology');
    tags.push('device');
  }
  
  // Extract additional keywords from caption
  const keywords = extractKeywords(caption);
  tags.push(...keywords.slice(0, 3));
  
  // Remove duplicates
  return [...new Set(tags)];
}

// ENHANCED: Smart fallback tags based on filename
function getFallbackImageTags(filename) {
  const tags = ['image'];
  const filenameLower = filename.toLowerCase();
  
  // Screenshots - PRIORITY CHECK
  if (filenameLower.includes('screenshot') || filenameLower.includes('screen shot') || 
      filenameLower.includes('screen_shot') || filenameLower.match(/\d{4}-\d{2}-\d{2}/)) {
    tags.push('screenshot', 'digital', 'screen');
  }
  
  // Photo types
  if (filenameLower.includes('photo') || filenameLower.includes('pic') || filenameLower.includes('img')) {
    tags.push('photo');
  }
  if (filenameLower.includes('selfie')) {
    tags.push('selfie', 'portrait', 'person');
  }
  if (filenameLower.includes('profile') || filenameLower.includes('avatar') || filenameLower.includes('dp')) {
    tags.push('profile', 'portrait', 'person');
  }
  
  // People
  if (filenameLower.match(/\b(me|myself|i|portrait)\b/)) {
    tags.push('person', 'portrait');
  }
  if (filenameLower.includes('group') || filenameLower.includes('team') || filenameLower.includes('friends')) {
    tags.push('people', 'group');
  }
  if (filenameLower.includes('family')) {
    tags.push('people', 'family');
  }
  
  // Messaging apps
  if (filenameLower.includes('whatsapp') || filenameLower.includes('telegram') || filenameLower.includes('wa')) {
    tags.push('messaging', 'chat');
  }
  
  // Nature & Places
  if (filenameLower.includes('landscape') || filenameLower.includes('scenery')) {
    tags.push('landscape', 'nature', 'outdoor');
  }
  if (filenameLower.match(/\b(beach|ocean|sea|mountain|hill|forest|park)\b/)) {
    tags.push('nature', 'outdoor');
  }
  if (filenameLower.match(/\b(city|urban|street|building)\b/)) {
    tags.push('urban', 'architecture');
  }
  
  // Food
  if (filenameLower.match(/\b(food|meal|dish|recipe|cooking|restaurant|cafe)\b/)) {
    tags.push('food', 'meal');
  }
  
  // Events
  if (filenameLower.match(/\b(birthday|party|celebration|event|wedding)\b/)) {
    tags.push('event', 'celebration');
  }
  if (filenameLower.match(/\b(vacation|holiday|trip|travel)\b/)) {
    tags.push('travel', 'vacation');
  }
  
  // Work/Professional
  if (filenameLower.match(/\b(work|office|meeting|presentation|project)\b/)) {
    tags.push('work', 'professional');
  }
  if (filenameLower.match(/\b(certificate|award|achievement)\b/)) {
    tags.push('certificate', 'achievement');
  }
  
  // Design & Creative
  if (filenameLower.match(/\b(design|graphic|art|drawing|sketch|illustration)\b/)) {
    tags.push('design', 'creative', 'art');
  }
  if (filenameLower.match(/\b(logo|banner|poster|flyer)\b/)) {
    tags.push('design', 'graphic');
  }
  
  // Documents
  if (filenameLower.includes('document') || filenameLower.includes('scan') || filenameLower.includes('pdf')) {
    tags.push('document', 'scan');
  }
  if (filenameLower.match(/\b(id|card|license|passport|aadhar|pan)\b/)) {
    tags.push('document', 'id', 'important');
  }
  
  // Education
  if (filenameLower.match(/\b(notes|study|assignment|homework|exam|test)\b/)) {
    tags.push('education', 'study');
  }
  
  // Personal
  if (filenameLower.includes('personal') || filenameLower.includes('private')) {
    tags.push('personal');
  }
  if (filenameLower.includes('backup')) {
    tags.push('backup');
  }
  
  // Date-based
  const year = new Date().getFullYear();
  if (filenameLower.includes(year.toString())) {
    tags.push(year.toString());
  }
  
  // Remove duplicates and limit
  return [...new Set(tags)].slice(0, 8);
}

// Extract keywords from text
function extractKeywords(text) {
  if (!text) return [];
  
  const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'that', 'this'];
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const filtered = words.filter(w => !stopWords.includes(w));
  const frequency = {};
  filtered.forEach(w => frequency[w] = (frequency[w] || 0) + 1);
  return Object.keys(frequency)
    .sort((a, b) => frequency[b] - frequency[a])
    .slice(0, 5);
}

// Main tagging function
async function generateTags(filePath, filename, mimeType) {
  let tags = [];
  let extractedText = '';

  try {
    console.log(`🔍 Processing: ${filename} (${mimeType})`);

    // Extract content based on file type
    if (mimeType.includes('pdf')) {
      tags.push('pdf', 'document');
      extractedText = await extractPDFText(filePath);
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      tags.push('word', 'document');
      extractedText = await extractWordText(filePath);
    } else if (mimeType.includes('sheet') || mimeType.includes('excel')) {
      tags.push('spreadsheet', 'data');
      extractedText = extractExcelText(filePath);
    } else if (mimeType.startsWith('image/')) {
      // ENHANCED IMAGE HANDLING
      const imageTags = await analyzeImage(filePath, filename);
      tags.push(...imageTags);
    } else if (mimeType.startsWith('video/')) {
      tags.push('video', 'media');
    } else if (mimeType.startsWith('audio/')) {
      tags.push('audio', 'media');
    } else if (mimeType.includes('text')) {
      tags.push('text');
      try {
        extractedText = fs.readFileSync(filePath, 'utf8').substring(0, 5000);
      } catch (error) {
        console.error('Text file read error:', error.message);
      }
    }

    // AI classification for text content
    if (extractedText) {
      const aiTags = await classifyText(extractedText);
      tags.push(...aiTags);
      
      // Extract keywords from content
      const keywords = extractKeywords(extractedText);
      tags.push(...keywords);
    }

    // Add filename-based tags
    const filenameLower = filename.toLowerCase();
    if (filenameLower.includes('report')) tags.push('report');
    if (filenameLower.includes('invoice')) tags.push('invoice');
    if (filenameLower.includes('resume')) tags.push('resume');
    if (filenameLower.includes('project')) tags.push('project');

    // Remove duplicates and limit
    const uniqueTags = [...new Set(tags)].slice(0, 10);
    console.log(`✅ Generated ${uniqueTags.length} tags:`, uniqueTags);
    
    return uniqueTags.length > 0 ? uniqueTags : ['untagged'];
  } catch (error) {
    console.error('Tag generation error:', error.message);
    return ['document', 'untagged'];
  }
}

module.exports = { generateTags };