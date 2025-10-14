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

// AI Text Classification (Hugging Face)
async function classifyText(text) {
  if (!text || text.length < 50) return [];
  if (!HUGGINGFACE_API_KEY) {
    console.log('⚠️ HUGGINGFACE_API_KEY not set, skipping AI classification');
    return [];
  }
  
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
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
    return [];
  }
}

// AI Image Captioning
async function analyzeImage(filePath) {
  if (!HUGGINGFACE_API_KEY) {
    console.log('⚠️ HUGGINGFACE_API_KEY not set, skipping image analysis');
    return [];
  }
  
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base',
      fileBuffer,
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/octet-stream'
        },
        timeout: 15000,
        maxContentLength: 10 * 1024 * 1024
      }
    );

    const caption = response.data[0]?.generated_text || '';
    return extractKeywords(caption);
  } catch (error) {
    console.error('Image analysis error:', error.message);
    return [];
  }
}

// Extract keywords from text
function extractKeywords(text) {
  if (!text) return [];
  
  const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of'];
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
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
      tags.push('image');
      const imageTags = await analyzeImage(filePath);
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