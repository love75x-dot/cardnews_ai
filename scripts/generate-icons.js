/**
 * Generate favicon and app icons
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3b82f6');
  gradient.addColorStop(0.5, '#8b5cf6');
  gradient.addColorStop(1, '#ec4899');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Add rounded corners for larger icons
  if (size >= 180) {
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    const radius = size * 0.2;
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  
  // Draw card icon in center
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  const cardWidth = size * 0.4;
  const cardHeight = size * 0.5;
  const cardX = (size - cardWidth) / 2;
  const cardY = (size - cardHeight) / 2;
  const cornerRadius = size * 0.05;
  
  // Main card
  ctx.beginPath();
  ctx.moveTo(cardX + cornerRadius, cardY);
  ctx.lineTo(cardX + cardWidth - cornerRadius, cardY);
  ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + cornerRadius);
  ctx.lineTo(cardX + cardWidth, cardY + cardHeight - cornerRadius);
  ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - cornerRadius, cardY + cardHeight);
  ctx.lineTo(cardX + cornerRadius, cardY + cardHeight);
  ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - cornerRadius);
  ctx.lineTo(cardX, cardY + cornerRadius);
  ctx.quadraticCurveTo(cardX, cardY, cardX + cornerRadius, cardY);
  ctx.closePath();
  ctx.fill();
  
  // Card lines (text representation)
  ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
  const lineY1 = cardY + cardHeight * 0.3;
  const lineY2 = cardY + cardHeight * 0.5;
  const lineY3 = cardY + cardHeight * 0.7;
  const lineX = cardX + cardWidth * 0.2;
  const lineWidth = cardWidth * 0.6;
  const lineHeight = size * 0.04;
  
  ctx.fillRect(lineX, lineY1, lineWidth, lineHeight);
  ctx.fillRect(lineX, lineY2, lineWidth * 0.7, lineHeight);
  ctx.fillRect(lineX, lineY3, lineWidth * 0.5, lineHeight);
  
  // Save
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(__dirname, '..', 'public', filename);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Generated: ${filename} (${size}x${size})`);
}

// Generate various sizes
console.log('🎨 Generating app icons...\n');
generateIcon(512, 'icon.png');
generateIcon(192, 'icon-192.png');
generateIcon(180, 'apple-touch-icon.png');
generateIcon(32, 'favicon-32x32.png');
generateIcon(16, 'favicon-16x16.png');

// Generate ICO file (using 32x32 as base)
const canvas32 = createCanvas(32, 32);
const ctx32 = canvas32.getContext('2d');

const gradient = ctx32.createLinearGradient(0, 0, 32, 32);
gradient.addColorStop(0, '#3b82f6');
gradient.addColorStop(0.5, '#8b5cf6');
gradient.addColorStop(1, '#ec4899');
ctx32.fillStyle = gradient;
ctx32.fillRect(0, 0, 32, 32);

ctx32.fillStyle = 'rgba(255, 255, 255, 0.9)';
const cardW = 13;
const cardH = 16;
const cardX = (32 - cardW) / 2;
const cardY = (32 - cardH) / 2;

ctx32.fillRect(cardX, cardY, cardW, cardH);

ctx32.fillStyle = 'rgba(59, 130, 246, 0.6)';
ctx32.fillRect(cardX + 2, cardY + 5, 9, 1);
ctx32.fillRect(cardX + 2, cardY + 8, 6, 1);
ctx32.fillRect(cardX + 2, cardY + 11, 5, 1);

const icoBuffer = canvas32.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), icoBuffer);
console.log('✅ Generated: favicon.ico (32x32)');

console.log('\n✨ All icons generated successfully!');
console.log('📁 Location: /public/');
