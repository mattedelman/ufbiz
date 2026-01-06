# Image Download Guide

## Status

The image download script has been run and successfully downloaded **8 images** from external sources. However, many LinkedIn images returned 403 errors (likely due to bot protection or expired tokens).

## Successfully Downloaded Images

The following images were successfully downloaded and are now stored locally:

- Future Business Leaders of America (FBLA)
- Gator Business Book Club
- Gator Student Consulting Organization
- Personal Finance Club
- Pride in Business
- Product Space
- Retail Society
- Student Investment Club

These are stored in `public/images/clubs/` and their references in `clubs.js` have been updated.

## Images That Failed to Download

Most LinkedIn images failed with 403 errors. These images still have their original URLs in the code, which means:

1. **If the URLs are still valid**: They will continue to work, but may expire in the future
2. **If the URLs have expired**: You'll need to manually download these images

## Manual Download Instructions

For images that failed to download, you can:

### Option 1: Download via Browser
1. Open the image URL in your browser
2. Right-click the image and select "Save image as..."
3. Save it to `public/images/clubs/` with the filename format: `{club_id}_{sanitized_name}.{extension}`
4. Update the reference in `src/data/clubs.js` to: `image: "/images/clubs/{filename}"`

### Option 2: Re-run the Script
The script has been improved with User-Agent headers. You can try running it again:

```bash
node scripts/download-images.js
```

The script will skip images that already exist, so it's safe to run multiple times.

### Option 3: Find Alternative Sources
For LinkedIn images that are blocked, you can:
- Visit the organization's LinkedIn page and download the logo directly
- Check if the organization has a website with their logo
- Contact the organization for their logo

## Running the Download Script

To download images again (or for the first time):

```bash
node scripts/download-images.js
```

The script will:
- Download all images from external URLs
- Save them to `public/images/clubs/`
- Automatically update references in `clubs.js` and `About.jsx`
- Skip images that already exist locally

## File Structure

```
public/
  images/
    clubs/
      23_future_business_leaders_of_america_fbla.jpeg
      24_gator_business_book_club.jpeg
      27_gator_student_consulting_organization.png
      ... (other club images)
    matthew-edelman.jpg (if downloaded)
```

## Notes

- Images are named using the format: `{club_id}_{sanitized_club_name}.{extension}`
- The script preserves original URLs if downloads fail, so your site won't break
- Local images are served from `/images/clubs/` which maps to `public/images/clubs/` in Vite

