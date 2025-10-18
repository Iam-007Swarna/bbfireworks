# Required Assets for Production

The following image assets need to be added to the `/public` folder before deploying to production.

## Required Images

### 1. Open Graph Image
**File**: `/public/og-image.jpg`
- **Size**: 1200x630 pixels
- **Format**: JPG or PNG
- **Purpose**: Social media previews (Facebook, Twitter, LinkedIn)
- **Content**: BB Fireworks logo/branding with background

### 2. Favicon
**File**: `/public/favicon.ico`
- **Size**: 32x32 pixels (or multi-size .ico)
- **Format**: ICO
- **Purpose**: Browser tab icon

### 3. Apple Touch Icon
**File**: `/public/apple-touch-icon.png`
- **Size**: 180x180 pixels
- **Format**: PNG
- **Purpose**: iOS home screen icon

### 4. PWA Icons
**File**: `/public/icon-192x192.png`
- **Size**: 192x192 pixels
- **Format**: PNG
- **Purpose**: Android home screen (small)

**File**: `/public/icon-512x512.png`
- **Size**: 512x512 pixels
- **Format**: PNG
- **Purpose**: Android splash screen (large)

## Quick Generation Guide

### Using a Logo/Brand Image

If you have a logo file, use these free tools:

1. **Favicon Generator**: https://favicon.io/
   - Upload your logo
   - Downloads all required sizes

2. **Open Graph Image**: https://www.canva.com/
   - Template: "Facebook Post" (1200x630)
   - Add your logo and text
   - Export as JPG

3. **PWA Icons**: https://realfavicongenerator.net/
   - Upload your logo
   - Generates all PWA icons

### Temporary Solution

Until you have proper branded assets, you can:

1. Use a solid color background with text
2. Use a generic fireworks stock image
3. Use your company logo on a plain background

## Testing

After adding the images, verify they work:

1. Check favicon in browser tab
2. Share a link on social media to test OG image
3. Add to home screen on mobile to test PWA icons
4. Inspect page metadata in browser DevTools

## Notes

- All images should be optimized (compressed) before upload
- Use TinyPNG or similar tools to reduce file size
- Maintain brand consistency across all assets
- Images should be relevant to BB Fireworks business
