import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imgPath = path.join(__dirname, 'public', 'praying_hands.jpg');
const imgBuffer = fs.readFileSync(imgPath);

async function generateIcons() {
  await sharp(imgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, 'public', 'pwa-192x192.png'));
    
  await sharp(imgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, 'public', 'pwa-512x512.png'));
    
  // also create an apple-touch-icon
  await sharp(imgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));
    
  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);
