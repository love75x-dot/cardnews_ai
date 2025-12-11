/**
 * Generate Open Graph image for social media sharing
 * This script creates a 1200x630 PNG image for link previews
 */

const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Canvas dimensions for OG image (recommended size)
const WIDTH = 1200;
const HEIGHT = 630;

// Create canvas
const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

// Background gradient
const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
gradient.addColorStop(0, '#0f172a');
gradient.addColorStop(0.5, '#1e293b');
gradient.addColorStop(1, '#0f172a');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Add subtle pattern
ctx.globalAlpha = 0.05;
for (let i = 0; i < 50; i++) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(Math.random() * WIDTH, Math.random() * HEIGHT, 2, 2);
}
ctx.globalAlpha = 1;

// Draw card-like shapes in background
ctx.save();
ctx.globalAlpha = 0.1;
ctx.fillStyle = '#3b82f6';
ctx.fillRect(100, 80, 300, 400);
ctx.fillStyle = '#8b5cf6';
ctx.fillRect(450, 120, 300, 400);
ctx.fillStyle = '#ec4899';
ctx.fillRect(800, 80, 300, 400);
ctx.restore();

// Add glow effect
ctx.save();
ctx.globalAlpha = 0.3;
const glowGradient = ctx.createRadialGradient(600, 315, 0, 600, 315, 400);
glowGradient.addColorStop(0, '#3b82f6');
glowGradient.addColorStop(1, 'transparent');
ctx.fillStyle = glowGradient;
ctx.fillRect(0, 0, WIDTH, HEIGHT);
ctx.restore();

// Main title
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 80px Arial, sans-serif';
ctx.textAlign = 'center';
ctx.fillText('AI 카드뉴스 생성기', WIDTH / 2, 240);

// Subtitle
ctx.fillStyle = '#94a3b8';
ctx.font = '40px Arial, sans-serif';
ctx.fillText('클릭 한 번으로 전문가급 콘텐츠 제작', WIDTH / 2, 320);

// Feature badges
const features = [
  { text: '🤖 AI 자동 생성', x: 250, y: 450 },
  { text: '🎨 다양한 스타일', x: 600, y: 450 },
  { text: '⚡ 빠른 제작', x: 950, y: 450 }
];

features.forEach(feature => {
  // Badge background
  ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  const badgeWidth = 200;
  const badgeHeight = 60;
  const badgeX = feature.x - badgeWidth / 2;
  const badgeY = feature.y - badgeHeight / 2;
  const radius = 10;
  
  ctx.beginPath();
  ctx.moveTo(badgeX + radius, badgeY);
  ctx.lineTo(badgeX + badgeWidth - radius, badgeY);
  ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY, badgeX + badgeWidth, badgeY + radius);
  ctx.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - radius);
  ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY + badgeHeight, badgeX + badgeWidth - radius, badgeY + badgeHeight);
  ctx.lineTo(badgeX + radius, badgeY + badgeHeight);
  ctx.quadraticCurveTo(badgeX, badgeY + badgeHeight, badgeX, badgeY + badgeHeight - radius);
  ctx.lineTo(badgeX, badgeY + radius);
  ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Badge text
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(feature.text, feature.x, feature.y + 8);
});

// Powered by text
ctx.fillStyle = '#64748b';
ctx.font = '20px Arial, sans-serif';
ctx.textAlign = 'center';
ctx.fillText('Gemini 2.0 Flash × Imagen 3', WIDTH / 2, 560);

// Save the image
const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outputPath, buffer);

console.log('✅ OG image generated successfully:', outputPath);
console.log('📏 Size: 1200x630px');
console.log('📁 Location: /public/og-image.png');
