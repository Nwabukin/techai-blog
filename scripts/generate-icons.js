import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'badge-72x72.png', size: 72 },
];

async function generateIcons() {
  const svgPath = join(__dirname, '../public/icons/icon-512x512.svg');
  const svgBuffer = readFileSync(svgPath);

  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(__dirname, '../public/icons', name));

    console.log(`Generated ${name}`);
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
