# Icon Placeholder

For the desktop and mobile applications, you'll need to create proper icon files:

## Desktop Icons Needed

Place these in `desktop/assets/`:

- **Windows**: `icon.ico` (256x256 or multi-size ICO file)
- **macOS**: `icon.icns` (512x512 ICNS file)
- **Linux**: `icon.png` (512x512 PNG file)

## Mobile Icons Needed

### Android
Place in appropriate `android/app/src/main/res/` folders:
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

### iOS
Place in `ios/CanaryTalkMobile/Images.xcassets/AppIcon.appiconset/`:
- Various sizes from 20x20 to 1024x1024 (see Contents.json)

## Creating Icons

You can create icons from the canary logo in `webapp/public/canary.svg`:

### Tools to Use:
- **Online**: Use sites like https://www.appicon.co/ or https://icon.kitchen/
- **Local**: Use ImageMagick, GIMP, or Photoshop

### Example with ImageMagick:

```bash
# Convert SVG to PNG
convert -background none canary.svg -resize 512x512 icon.png

# Create ICO for Windows
convert icon.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico

# Create ICNS for macOS (requires iconutil on macOS)
mkdir icon.iconset
for size in 16 32 128 256 512; do
  convert icon.png -resize ${size}x${size} icon.iconset/icon_${size}x${size}.png
done
iconutil -c icns icon.iconset -o icon.icns
```

## Current Status

The applications will work without custom icons, using default Electron and React Native icons. However, for a professional release, custom icons are recommended.

You can generate icons from the green canary logo design used in the web app.
