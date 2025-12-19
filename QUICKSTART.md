# CanaryTalk Quick Start Guide

Get CanaryTalk up and running in 5 minutes!

## Prerequisites

- Node.js 16 or higher
- npm (comes with Node.js)

## Quick Start (All Platforms)

### 1. Start the Server & Web App

```bash
# Clone the repository
git clone <your-repo-url>
cd CanaryTalk-Endtoend

# Install server dependencies
cd server
npm install

# Build the web app
cd ../webapp
npm install
npm run build

# Start the server (which serves the web app)
cd ../server
npm start
```

The server will start on `http://localhost:3000`

Open your browser and go to `http://localhost:3000` to use the web app!

### 2. Test It Out

1. **Register** a new account (e.g., username: `alice`, password: `test123`)
2. Open another browser (or incognito window)
3. **Register** another account (e.g., username: `bob`, password: `test123`)
4. In one browser, **search** for the other user
5. Start **chatting** with end-to-end encryption! 🔒

## What's Next?

### Desktop App

```bash
cd desktop
npm install
npm start  # Run in development

# Or build for distribution
npm run build         # Current platform
npm run build:win     # Windows
npm run build:mac     # macOS
npm run build:linux   # Linux
```

### Mobile App

#### Android
```bash
cd mobile
npm install
npm run android  # Requires Android Studio & emulator/device
```

#### iOS (macOS only)
```bash
cd mobile
npm install
cd ios && pod install && cd ..
npm run ios  # Requires Xcode & simulator/device
```

## Development Mode

For development, you can run the web app and server separately:

**Terminal 1 - Server:**
```bash
cd server
npm install
npm start
```

**Terminal 2 - Web App (with hot reload):**
```bash
cd webapp
npm install
npm run dev
```

The web app will run on `http://localhost:5173` with hot reload.

## Deploy to Production

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for:
- Linux VPS deployment
- Docker deployment
- HTTPS setup with Nginx
- Desktop app distribution
- Mobile app publishing

## Troubleshooting

### Port 3000 already in use
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
```

### Cannot connect to server
- Make sure the server is running on port 3000
- Check your firewall settings
- For mobile apps, update the server URL in `src/services/api.js` and `src/services/socket.js`

### Build fails
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Features

- ✅ End-to-end encryption (libsodium/NaCl)
- ✅ Real-time messaging (WebSocket)
- ✅ User authentication (JWT)
- ✅ User search
- ✅ Typing indicators
- ✅ Message persistence
- ✅ Offline message delivery
- ✅ Cross-platform (Web, Desktop, Mobile)

## Architecture

```
Browser/Desktop/Mobile
        ↓
    WebSocket/API
        ↓
   Server (Node.js)
        ↓
   SQLite Database
```

All messages are encrypted **client-side** before being sent to the server. The server only relays encrypted messages and never has access to the decryption keys.

## Need Help?

- Check the main [README.md](README.md)
- Review [DEPLOYMENT.md](DEPLOYMENT.md)
- Check component READMEs in `/server`, `/webapp`, `/desktop`, and `/mobile`

---

Happy secure chatting! 🐦🔒
