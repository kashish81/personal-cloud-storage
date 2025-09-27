require('dotenv').config();
const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient({
  apiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY
});

console.log('API Key loaded:', !!process.env.GOOGLE_CLOUD_VISION_API_KEY);
console.log('Vision client created successfully');