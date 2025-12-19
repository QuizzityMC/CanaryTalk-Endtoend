# CanaryTalk Desktop

Cross-platform desktop application for CanaryTalk built with Electron.

## Features
- 🖥️ Native desktop experience
- 🔒 End-to-end encryption
- 💬 Real-time messaging
- 🔔 System notifications
- 📁 Secure local storage
- ⚡ Fast and responsive

## Supported Platforms
- Windows (7+)
- macOS (10.10+)
- Linux (Ubuntu, Debian, Fedora, etc.)

## Development

### Prerequisites
- Node.js 16 or higher
- The web app must be built first (see `/webapp` directory)

### Installation
```bash
npm install
```

### Build the Web App
```bash
cd ../webapp
npm install
npm run build
cd ../desktop
```

### Run in Development
```bash
npm start
```

## Building for Distribution

### Build for Current Platform
```bash
npm run build
```

### Build for Specific Platforms

Windows:
```bash
npm run build:win
```

macOS:
```bash
npm run build:mac
```

Linux:
```bash
npm run build:linux
```

The built applications will be in the `dist/` directory.

## Distribution Files

### Windows
- `CanaryTalk-Setup-1.0.0.exe` - Installer
- `CanaryTalk-1.0.0.exe` - Portable version

### macOS
- `CanaryTalk-1.0.0.dmg` - Disk image installer
- `CanaryTalk-1.0.0-mac.zip` - Zipped application

### Linux
- `CanaryTalk-1.0.0.AppImage` - Universal Linux package
- `canarytalk_1.0.0_amd64.deb` - Debian/Ubuntu package
- `canarytalk-1.0.0.x86_64.rpm` - Fedora/RHEL package

## Installation

### Windows
1. Download `CanaryTalk-Setup-1.0.0.exe`
2. Run the installer
3. Follow the installation wizard

Or use the portable version - no installation required!

### macOS
1. Download `CanaryTalk-1.0.0.dmg`
2. Open the DMG file
3. Drag CanaryTalk to Applications folder

### Linux

**AppImage** (Universal):
```bash
chmod +x CanaryTalk-1.0.0.AppImage
./CanaryTalk-1.0.0.AppImage
```

**Debian/Ubuntu**:
```bash
sudo dpkg -i canarytalk_1.0.0_amd64.deb
```

**Fedora/RHEL**:
```bash
sudo rpm -i canarytalk-1.0.0.x86_64.rpm
```

## Configuration

The desktop app uses the same web app interface but with native features:
- Automatic updates
- System tray integration
- Native notifications
- Better performance
- Offline key storage

## Connecting to Server

By default, the app will connect to `localhost:3000` in development.

For production, build the web app with the correct server URL configured.

## Troubleshooting

### App won't start
- Make sure the web app is built: `cd ../webapp && npm run build`
- Check that Node.js version is 16 or higher

### Can't connect to server
- Ensure the CanaryTalk server is running
- Check your firewall settings
- Verify the server URL in the configuration

### Linux: Missing dependencies
```bash
sudo apt-get install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libdrm2 libgbm1
```
