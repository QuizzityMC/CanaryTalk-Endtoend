# CanaryTalk Deployment Guide

Complete guide for deploying CanaryTalk on various platforms.

## Table of Contents
1. [Server Deployment](#server-deployment)
2. [Web App Deployment](#web-app-deployment)
3. [Desktop App Distribution](#desktop-app-distribution)
4. [Mobile App Distribution](#mobile-app-distribution)

## Server Deployment

### Option 1: Simple VPS Deployment (Recommended)

This is the easiest way to get CanaryTalk running on a Linux VPS (Ubuntu, Debian, etc.)

#### Prerequisites
- A Linux VPS with SSH access
- Domain name (optional but recommended for HTTPS)
- Minimum 1GB RAM, 1 CPU core

#### Step-by-Step Guide

1. **Connect to your VPS**
```bash
ssh user@your-server-ip
```

2. **Update system**
```bash
sudo apt update && sudo apt upgrade -y
```

3. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Install Git**
```bash
sudo apt install git -y
```

5. **Clone the repository**
```bash
cd /opt
sudo git clone https://github.com/your-username/CanaryTalk-Endtoend.git
sudo chown -R $USER:$USER CanaryTalk-Endtoend
cd CanaryTalk-Endtoend
```

6. **Setup the server**
```bash
cd server
npm install
cp .env.example .env
nano .env
```

Edit the `.env` file:
```
PORT=3000
JWT_SECRET=your-very-secure-random-secret-key-here
NODE_ENV=production
```

7. **Build the web app**
```bash
cd ../webapp
npm install
npm run build
```

8. **Install PM2 (Process Manager)**
```bash
sudo npm install -g pm2
```

9. **Start the server**
```bash
cd ../server
pm2 start server.js --name canarytalk
pm2 save
pm2 startup
```

Follow the command output to enable PM2 startup on boot.

10. **Configure firewall**
```bash
sudo ufw allow 22     # SSH
sudo ufw allow 80     # HTTP
sudo ufw allow 443    # HTTPS
sudo ufw allow 3000   # CanaryTalk (if not using reverse proxy)
sudo ufw enable
```

Your server is now running at `http://your-server-ip:3000`

#### Setup HTTPS with Nginx and Let's Encrypt

1. **Install Nginx**
```bash
sudo apt install nginx -y
```

2. **Create Nginx configuration**
```bash
sudo nano /etc/nginx/sites-available/canarytalk
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. **Enable the site**
```bash
sudo ln -s /etc/nginx/sites-available/canarytalk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **Install SSL certificate**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Your server is now running with HTTPS at `https://yourdomain.com`

### Option 2: Docker Deployment

1. **Install Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose -y
```

2. **Clone and setup**
```bash
git clone https://github.com/your-username/CanaryTalk-Endtoend.git
cd CanaryTalk-Endtoend/server
```

3. **Build web app**
```bash
cd ../webapp
npm install
npm run build
cd ../server
```

4. **Start with Docker Compose**
```bash
docker-compose up -d
```

## Web App Deployment

The web app is served automatically by the server after building.

### Separate Static Hosting (Optional)

If you want to host the web app separately on services like Netlify, Vercel, or Cloudflare Pages:

1. **Build the web app**
```bash
cd webapp
npm install
npm run build
```

2. **Update API endpoint**
Edit `webapp/src/services/api.js` and `webapp/src/services/socket.js` to point to your server URL.

3. **Deploy the `dist/` folder** to your hosting service.

## Desktop App Distribution

### Building for All Platforms

You can build desktop apps on any platform, but some limitations apply:
- **Windows builds**: Can be built on Windows, Linux, or macOS
- **macOS builds**: Must be built on macOS
- **Linux builds**: Can be built on Linux or macOS

### Windows

1. **Build the web app**
```bash
cd webapp
npm install
npm run build
```

2. **Build desktop app**
```bash
cd ../desktop
npm install
npm run build:win
```

Output files in `desktop/dist/`:
- `CanaryTalk-Setup-1.0.0.exe` - Installer
- `CanaryTalk-1.0.0.exe` - Portable version

### macOS

1. **Build the web app**
```bash
cd webapp
npm install
npm run build
```

2. **Build desktop app**
```bash
cd ../desktop
npm install
npm run build:mac
```

Output files in `desktop/dist/`:
- `CanaryTalk-1.0.0.dmg` - Installer
- `CanaryTalk-1.0.0-mac.zip` - Zipped app

### Linux

1. **Build the web app**
```bash
cd webapp
npm install
npm run build
```

2. **Build desktop app**
```bash
cd ../desktop
npm install
npm run build:linux
```

Output files in `desktop/dist/`:
- `CanaryTalk-1.0.0.AppImage` - Universal Linux package
- `canarytalk_1.0.0_amd64.deb` - Debian/Ubuntu
- `canarytalk-1.0.0.x86_64.rpm` - Fedora/RHEL

### Distribution

Upload the built files to:
- GitHub Releases
- Your website
- File hosting service

Users can download and install the appropriate package for their platform.

## Mobile App Distribution

### Android

#### Prerequisites
- Android Studio
- Java Development Kit (JDK 11)
- Android SDK

#### Building APK

1. **Install dependencies**
```bash
cd mobile
npm install
```

2. **Update server URL**
Edit `mobile/src/services/api.js` and `mobile/src/services/socket.js` with your production server URL.

3. **Generate signing key**
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore canarytalk-release-key.keystore -alias canarytalk -keyalg RSA -keysize 2048 -validity 10000
```

4. **Configure signing**
Create `android/gradle.properties`:
```properties
CANARYTALK_UPLOAD_STORE_FILE=canarytalk-release-key.keystore
CANARYTALK_UPLOAD_KEY_ALIAS=canarytalk
CANARYTALK_UPLOAD_STORE_PASSWORD=your-password
CANARYTALK_UPLOAD_KEY_PASSWORD=your-password
```

5. **Build APK**
```bash
cd ../..
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

#### Distribution Options

1. **Google Play Store**
   - Create developer account ($25 one-time fee)
   - Upload APK/AAB
   - Complete store listing
   - Submit for review

2. **Direct Distribution**
   - Upload APK to your website
   - Share via GitHub Releases
   - Use services like APKPure (for testing)

### iOS

#### Prerequisites (macOS only)
- macOS
- Xcode 14+
- Apple Developer Account ($99/year)

#### Building IPA

1. **Install dependencies**
```bash
cd mobile
npm install
cd ios
pod install
cd ..
```

2. **Update server URL**
Edit `mobile/src/services/api.js` and `mobile/src/services/socket.js` with your production server URL.

3. **Open in Xcode**
```bash
open ios/CanaryTalkMobile.xcworkspace
```

4. **Configure signing**
- Select your development team
- Configure bundle identifier
- Enable capabilities

5. **Archive**
- Product → Archive
- Wait for archive to complete
- Distribute to App Store or export IPA

#### Distribution Options

1. **App Store**
   - Submit through App Store Connect
   - Complete app information
   - Submit for review

2. **TestFlight** (Beta Testing)
   - Upload to App Store Connect
   - Add internal/external testers
   - Share test link

## Maintenance

### Updating the Server

```bash
cd /opt/CanaryTalk-Endtoend
git pull
cd server
npm install
cd ../webapp
npm install
npm run build
cd ../server
pm2 restart canarytalk
```

### Monitoring

View server logs:
```bash
pm2 logs canarytalk
```

Monitor server status:
```bash
pm2 status
```

### Backup

Backup the database regularly:
```bash
cp /opt/CanaryTalk-Endtoend/server/canarytalk.db ~/backups/canarytalk-$(date +%Y%m%d).db
```

### Security Updates

Keep dependencies updated:
```bash
cd server && npm update
cd ../webapp && npm update
```

## Troubleshooting

### Server won't start
- Check logs: `pm2 logs canarytalk`
- Verify port 3000 is available: `sudo lsof -i :3000`
- Check .env configuration

### Can't connect from clients
- Verify firewall settings
- Check server is running: `pm2 status`
- Test with curl: `curl http://localhost:3000/health`

### HTTPS issues
- Verify domain DNS is pointing to server
- Check Nginx configuration: `sudo nginx -t`
- Review certbot logs: `sudo journalctl -u certbot`

## Support

For issues:
- Check the documentation in each folder
- Review GitHub issues
- Check server logs

---

**Security Reminder**: Always use HTTPS in production and keep your JWT_SECRET secure!
