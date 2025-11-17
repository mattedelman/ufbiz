# Favicon Setup Instructions

I've created the SVG favicon and updated the HTML with proper favicon links. However, you'll need to generate PNG versions for better compatibility.

## Current Status

✅ Created: `public/favicon.svg` - SVG favicon (works in modern browsers)
✅ Created: `public/site.webmanifest` - Web app manifest
✅ Updated: `index.html` - Added comprehensive favicon links

## Required PNG Files

You need to create these PNG files in the `public/` folder:

1. **favicon-16x16.png** - 16x16 pixels
2. **favicon-32x32.png** - 32x32 pixels  
3. **apple-touch-icon.png** - 180x180 pixels (for iOS)
4. **favicon-192x192.png** - 192x192 pixels (for Android)
5. **favicon-512x512.png** - 512x512 pixels (for Android)

## How to Generate PNG Files

### Option 1: Online Tool (Easiest)
1. Go to https://realfavicongenerator.net/
2. Upload `public/favicon.svg`
3. Configure settings:
   - iOS: Enable Apple touch icon
   - Android: Enable Chrome/Android icons
   - Windows: Optional
4. Download the generated files
5. Place all PNG files in the `public/` folder

### Option 2: Image Editor
1. Open `public/favicon.svg` in an image editor (Photoshop, GIMP, Figma, etc.)
2. Export at the required sizes
3. Save as PNG files in the `public/` folder

### Option 3: Command Line (if you have ImageMagick)
```bash
# Convert SVG to PNG at different sizes
convert -background none -resize 16x16 public/favicon.svg public/favicon-16x16.png
convert -background none -resize 32x32 public/favicon.svg public/favicon-32x32.png
convert -background none -resize 180x180 public/favicon.svg public/apple-touch-icon.png
convert -background none -resize 192x192 public/favicon.svg public/favicon-192x192.png
convert -background none -resize 512x512 public/favicon.svg public/favicon-512x512.png
```

## Design Specifications

The favicon uses:
- **Background**: UF Blue (#0021A5)
- **"UF" text**: UF Orange (#FA4616), bold, large
- **"biz" text**: White (#FFFFFF), smaller
- **Rounded corners**: 20px radius

## Testing

After adding PNG files:
1. Clear browser cache
2. Test on desktop browsers
3. Test on mobile devices (iOS Safari, Android Chrome)
4. Check Google Search Console for favicon recognition
5. Use https://realfavicongenerator.net/favicon_checker to verify

## Current Behavior

Right now, the SVG favicon will work in modern browsers. Older browsers and some mobile devices may show a default icon until PNG files are added.

