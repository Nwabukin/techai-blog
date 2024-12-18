const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Icon sizes to generate
const sizes = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'badge-72x72.png', size: 72 },
];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Function to draw the icon
function drawIcon(ctx, size) {
  // Set background
  ctx.fillStyle = '#1e293b'; // Dark blue background
  ctx.fillRect(0, 0, size, size);

  // Calculate dimensions
  const padding = size * 0.15;
  const innerSize = size - padding * 2;

  // Draw outer circle
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, innerSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#0ea5e9'; // Light blue
  ctx.fill();

  // Draw "T" letter
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${innerSize * 0.6}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('T', size / 2, size / 2);

  // Draw AI indicator
  ctx.font = `bold ${innerSize * 0.2}px Inter, sans-serif`;
  ctx.fillText('AI', size / 2, size / 2 + innerSize * 0.3);
}

// Generate icons for each size
sizes.forEach(({ name, size }) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Draw the icon
  drawIcon(ctx, size);

  // Save the file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, name), buffer);

  console.log(`Generated ${name}`);
});

console.log('All icons generated successfully!');
