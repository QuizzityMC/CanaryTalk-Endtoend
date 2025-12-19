# CanaryTalk - End-to-End Encrypted Chat

A complete, production-ready end-to-end encrypted chat application with clients for **Web**, **Windows**, **Linux**, **macOS**, **Android**, and **iOS**.

## 🚀 Features

- 🔒 **End-to-End Encryption** using libsodium (NaCl crypto library)
- 💬 **Real-time Messaging** via WebSocket
- 🌐 **Cross-Platform**: Web, Desktop (Windows/Linux/macOS), Mobile (Android/iOS)
- 👤 **User Authentication** with JWT
- 🔍 **User Search** functionality
- ⚡ **Fast & Lightweight** SQLite database
- 🐳 **Docker Support** for easy deployment
- 📱 **Responsive Design** for all platforms
- 🔔 **Typing Indicators** and delivery status
- 💾 **Message Persistence** and offline delivery

## 📦 What's Included

### Server (`/server`)
- Node.js + Express backend
- Socket.io for real-time communication
- SQLite database
- JWT authentication
- Docker & Docker Compose support
- Easy VPS deployment

### Web App (`/webapp`)
- React + Vite
- Modern, responsive UI
- Runs directly in browser
- Served by the server in production

### Desktop App (`/desktop`)
- Electron-based application
- Cross-platform builds for:
  - Windows (installer + portable)
  - macOS (DMG)
  - Linux (AppImage, DEB, RPM)

### Mobile App (`/mobile`)
- React Native application
- Native apps for:
  - Android (APK)
  - iOS (IPA)

## 🛠️ Quick Start

### 1. Server Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

Server will run on `http://localhost:3000`

### 2. Web App (Development)

```bash
cd webapp
npm install
npm run dev
```

Web app will run on `http://localhost:5173`

### 3. Web App (Production - served by server)

```bash
cd webapp
npm install
npm run build
# The build is automatically served by the server
```

### 4. Desktop App

```bash
# First, build the web app
cd webapp
npm install
npm run build

# Then build desktop app
cd ../desktop
npm install
npm start  # Run in development
# OR
npm run build  # Build for distribution
```

### 5. Mobile App

```bash
cd mobile
npm install

# For Android
npm run android

# For iOS (macOS only)
cd ios && pod install && cd ..
npm run ios
```

## 📖 Documentation

Detailed documentation for each component:

- [Server Documentation](server/README.md) - API, deployment, configuration
- [Web App Documentation](webapp/README.md) - Development and deployment
- [Desktop Documentation](desktop/README.md) - Building for all platforms
- [Mobile Documentation](mobile/README.md) - Android and iOS setup

## 🚢 Deployment

### Easy VPS Deployment (Recommended)

The simplest way to deploy CanaryTalk on a Linux VPS:

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <your-repo-url>
cd CanaryTalk-Endtoend

# Setup server
cd server
npm install
cp .env.example .env
nano .env  # Edit JWT_SECRET and other settings

# Build web app
cd ../webapp
npm install
npm run build

# Start server with PM2
cd ../server
sudo npm install -g pm2
pm2 start server.js --name canarytalk
pm2 save
pm2 startup
```

### Docker Deployment

```bash
cd server
docker-compose up -d
```

### With Nginx (for HTTPS)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then setup SSL with Let's Encrypt:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 🔐 Security

### Encryption
- Uses **libsodium** (NaCl) for cryptography
- **Public-key encryption** (X25519)
- Each user has a unique key pair
- Private keys **never leave the client device**
- Messages encrypted client-side before transmission

### Authentication
- JWT tokens for session management
- Bcrypt password hashing
- Token expiration and refresh

### Best Practices
- Change `JWT_SECRET` in production
- Use HTTPS/WSS in production
- Regular dependency updates
- Secure key storage on devices

## 📊 Architecture

```
┌─────────────┐
│   Clients   │
│ Web/Desktop │
│   /Mobile   │
└──────┬──────┘
       │
       │ WebSocket (Socket.io)
       │ HTTPS/REST API
       │
┌──────▼──────┐
│   Server    │
│  Node.js    │
│  Socket.io  │
└──────┬──────┘
       │
┌──────▼──────┐
│   SQLite    │
│  Database   │
└─────────────┘
```

### Data Flow
1. **Registration**: Client generates key pair → sends public key to server
2. **Login**: Server issues JWT token → client connects via WebSocket
3. **Sending**: Client encrypts message with recipient's public key → sends to server
4. **Receiving**: Server relays encrypted message → client decrypts with private key

## 🛠️ Technology Stack

### Server
- Node.js
- Express
- Socket.io
- SQLite (better-sqlite3)
- JWT (jsonwebtoken)
- Bcrypt

### Web
- React 18
- Vite
- libsodium-wrappers
- Socket.io-client

### Desktop
- Electron
- Same web app as frontend

### Mobile
- React Native
- react-native-sodium
- Socket.io-client

## 📱 Platform Requirements

### Server
- Node.js 16+
- Linux/Windows/macOS

### Web
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)

### Desktop
- Windows 7+
- macOS 10.10+
- Linux (Ubuntu 18.04+, Debian 10+, Fedora 32+)

### Mobile
- Android 8.0+ (API 26+)
- iOS 13.0+

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- libsodium for encryption
- Socket.io for real-time communication
- React and React Native teams
- Electron team

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation in each folder
- Review the troubleshooting sections

## 🔄 Roadmap

- [ ] Group chats
- [ ] File sharing (encrypted)
- [ ] Voice calls
- [ ] Video calls
- [ ] Read receipts
- [ ] Message editing/deletion
- [ ] Profile pictures
- [ ] Status messages
- [ ] Dark mode

---

**Made with ❤️ for privacy and security**

🐦 **CanaryTalk** - Your conversations, encrypted and private.
