# Creating PWA Icons

To create the required PWA icons for your application, follow these steps:

## Option 1: Using Online Tools (Recommended)

1. **Visit PWA Icon Generator**: https://www.pwabuilder.com/imageGenerator
2. **Upload** your `public/icon.svg` file
3. **Download** the generated icons
4. **Place** the following files in the `public` folder:
   - `icon-192.png` (192x192 pixels)
   - `icon-512.png` (512x512 pixels)

## Option 2: Using Design Software

### Using Figma/Sketch/Adobe XD:
1. Open the `public/icon.svg` file
2. Export as PNG with these sizes:
   - **192x192 pixels** → Save as `icon-192.png`
   - **512x512 pixels** → Save as `icon-512.png`
3. Place both files in the `public` folder

### Using Photoshop:
1. Open `public/icon.svg`
2. Image → Image Size
3. Set width and height to 192px (for first icon)
4. File → Export → Export As → PNG
5. Save as `icon-192.png`
6. Repeat for 512x512 pixels → `icon-512.png`

## Option 3: Using Node.js (Sharp CLI)

If you have Node.js installed:

```bash
# Install sharp-cli globally
npm install -g sharp-cli

# Generate 192x192 icon
npx sharp-cli -i public/icon.svg -o public/icon-192.png resize 192 192

# Generate 512x512 icon
npx sharp-cli -i public/icon.svg -o public/icon-512.png resize 512 512
```

## Option 4: Temporary Placeholder

For quick testing, you can use the existing placeholder logo:

```bash
# Copy existing placeholder as temporary icons
copy public\placeholder-logo.png public\icon-192.png
copy public\placeholder-logo.png public\icon-512.png
```

## Verify Installation

After creating the icons:
1. Restart your development server: `npm run dev`
2. Open browser DevTools (F12)
3. Go to Application → Manifest
4. Check if icons are displayed correctly
5. Test the install prompt on your device

## Icon Design Tips

- **Use simple, recognizable symbols**
- **High contrast** for visibility on various backgrounds
- **Avoid text** below 20px (hard to read when scaled)
- **Safe area**: Keep important elements within central 80% of the canvas
- **Test on different backgrounds**: Light, dark, and colored

## Required Sizes for Full PWA Support

For a complete PWA, you may want these additional sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

The current setup uses only 192x192 and 512x512, which is sufficient for most browsers.
