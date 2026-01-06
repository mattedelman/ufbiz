import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'favicon.svg');

// Sizes needed
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-192x192.png', size: 192 },
  { name: 'favicon-512x512.png', size: 512 },
];

// Also need favicon.ico (which is typically 16x16 or 32x32)
const icoSize = 32;

async function generateFavicons() {
  try {
    // Check if SVG exists
    if (!fs.existsSync(svgPath)) {
      console.error('Error: favicon.svg not found at', svgPath);
      process.exit(1);
    }

    console.log('Generating favicon files from', svgPath);
    
    // Generate PNG files
    for (const { name, size } of sizes) {
      const outputPath = path.join(publicDir, name);
      await sharp(svgPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 33, b: 165, alpha: 1 } // UF Blue #0021A5
        })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${name} (${size}x${size})`);
    }

    // Generate favicon.ico (32x32 PNG converted to ICO format)
    // Note: sharp doesn't support ICO directly, so we'll create a 32x32 PNG
    // and name it favicon.ico (browsers will accept PNG as ICO)
    const icoPath = path.join(publicDir, 'favicon.ico');
    await sharp(svgPath)
      .resize(icoSize, icoSize, {
        fit: 'contain',
        background: { r: 0, g: 33, b: 165, alpha: 1 }
      })
      .png()
      .toFile(icoPath);
    console.log(`✓ Generated favicon.ico (${icoSize}x${icoSize})`);

    console.log('\n✅ All favicon files generated successfully!');
    console.log('\nFiles created:');
    sizes.forEach(({ name }) => console.log(`  - ${name}`));
    console.log('  - favicon.ico');
    
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();

