import puppeteer from 'puppeteer';
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
  let browser;
  try {
    // Check if SVG exists
    if (!fs.existsSync(svgPath)) {
      console.error('Error: favicon.svg not found at', svgPath);
      process.exit(1);
    }

    // Read SVG content
    const svgContent = fs.readFileSync(svgPath, 'utf-8');
    
    console.log('Generating favicon files from', svgPath);
    
    // Launch browser for proper emoji rendering
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set viewport to a large size for high-quality rendering
    await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 2 });
    
    // Create HTML with the SVG
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              width: 512px;
              height: 512px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            svg {
              width: 512px;
              height: 512px;
            }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `;
    
    await page.setContent(html);
    // Wait a bit for rendering (using Promise-based setTimeout)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Take screenshot at high resolution
    const screenshot = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: 512, height: 512 }
    });
    
    // Generate PNG files at different sizes using sharp
    for (const { name, size } of sizes) {
      const outputPath = path.join(publicDir, name);
      await sharp(screenshot)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${name} (${size}x${size})`);
    }

    // Generate favicon.ico (32x32 PNG)
    const icoPath = path.join(publicDir, 'favicon.ico');
    await sharp(screenshot)
      .resize(icoSize, icoSize, {
        fit: 'cover',
        position: 'center'
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
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

generateFavicons();

