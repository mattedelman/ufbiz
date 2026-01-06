import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import { clubs } from '../src/data/clubs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '..', 'public', 'images', 'clubs');
const aboutImageUrl = 'https://media.licdn.com/dms/image/v2/D4E03AQEbgj0OkCWGDQ/profile-displayphoto-shrink_800_800/B4EZXt2yYvGYAc-/0/1743452319123?e=1764201600&v=beta&t=LoW3jHgoKlh275SEskfg_NGTHbjDpQ0_L0kkIkLCJ18';

// Ensure directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Helper function to sanitize filename
function sanitizeFilename(name) {
  return name
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// Helper function to get file extension from URL
function getExtensionFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const match = pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)(\?|$)/i);
    if (match) {
      return match[1].toLowerCase();
    }
    // Default to jpg if no extension found
    return 'jpg';
  } catch (e) {
    return 'jpg';
  }
}

// Download a single image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.linkedin.com/'
      }
    };
    
    protocol.get(options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        return downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filepath);
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Main function
async function main() {
  console.log('Starting image download process...\n');
  
  const imageMap = new Map(); // Maps old URL to new local path
  const downloadPromises = [];
  
  for (const club of clubs) {
    if (!club.image || club.image.trim() === '') {
      continue;
    }
    
    const url = club.image.trim();
    
    // Skip if already a local path
    if (url.startsWith('/images/') || !url.startsWith('http')) {
      console.log(`✓ Skipping ${club.name} (already local path)`);
      continue;
    }
    
    const sanitizedName = sanitizeFilename(club.name);
    const extension = getExtensionFromUrl(url);
    const filename = `${club.id}_${sanitizedName}.${extension}`;
    const filepath = path.join(imagesDir, filename);
    const localPath = `/images/clubs/${filename}`;
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`✓ Skipping ${club.name} (file already exists)`);
      imageMap.set(url, localPath);
      continue;
    }
    
    console.log(`Downloading ${club.name}...`);
    downloadPromises.push(
      downloadImage(url, filepath)
        .then(() => {
          console.log(`✓ Downloaded ${club.name}`);
          imageMap.set(url, localPath);
        })
        .catch((err) => {
          console.error(`✗ Failed to download ${club.name}: ${err.message}`);
          // Keep the original URL if download fails
          imageMap.set(url, url);
        })
    );
  }
  
  // Wait for all downloads to complete
  await Promise.all(downloadPromises);
  
  console.log('\n--- Updating clubs.js with local paths ---\n');
  
  // Read the clubs.js file
  const clubsFilePath = path.join(__dirname, '..', 'src', 'data', 'clubs.js');
  let clubsContent = fs.readFileSync(clubsFilePath, 'utf8');
  
  // Replace all image URLs with local paths
  let updatedCount = 0;
  for (const [oldUrl, newPath] of imageMap.entries()) {
    // Only update if we successfully downloaded (newPath is local, not the old URL)
    if (newPath === oldUrl) {
      continue; // Skip failed downloads
    }
    
    // Escape special regex characters in URL
    const escapedUrl = oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match various formats: image:"url", image: "url", image:"url"  }, etc.
    const regex = new RegExp(`image:\\s*["']${escapedUrl}["']`, 'g');
    
    if (regex.test(clubsContent)) {
      clubsContent = clubsContent.replace(regex, `image: "${newPath}"`);
      updatedCount++;
    }
  }
  
  // Write updated content
  fs.writeFileSync(clubsFilePath, clubsContent, 'utf8');
  
  console.log(`✓ Updated ${updatedCount} image references in clubs.js`);
  
  // Also download and update About.jsx image
  console.log('\n--- Updating About.jsx with local path ---\n');
  const aboutFilePath = path.join(__dirname, '..', 'src', 'pages', 'About.jsx');
  let aboutContent = fs.readFileSync(aboutFilePath, 'utf8');
  
  const aboutImagePath = '/images/matthew-edelman.jpg';
  const aboutImageFilepath = path.join(__dirname, '..', 'public', 'images', 'matthew-edelman.jpg');
  
  // Download About page image if it doesn't exist
  if (!fs.existsSync(aboutImageFilepath)) {
    console.log('Downloading Matthew Edelman profile image...');
    try {
      await downloadImage(aboutImageUrl, aboutImageFilepath);
      console.log('✓ Downloaded profile image');
    } catch (err) {
      console.error(`✗ Failed to download profile image: ${err.message}`);
    }
  } else {
    console.log('✓ Profile image already exists');
  }
  
  // Update About.jsx
  const escapedAboutUrl = aboutImageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const aboutRegex = new RegExp(`src=["']${escapedAboutUrl}["']`, 'g');
  if (aboutRegex.test(aboutContent)) {
    aboutContent = aboutContent.replace(aboutRegex, `src="${aboutImagePath}"`);
    fs.writeFileSync(aboutFilePath, aboutContent, 'utf8');
    console.log('✓ Updated About.jsx with local image path');
  }
  
  console.log('\nDone! All images have been downloaded and references updated.');
}

main().catch(console.error);

