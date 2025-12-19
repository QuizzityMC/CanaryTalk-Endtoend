# CanaryTalk Web App

Modern web-based E2E encrypted chat application built with React and Vite.

## Features
- 🔒 End-to-end encryption using libsodium
- 💬 Real-time messaging with WebSocket
- 🔍 User search functionality
- 📱 Responsive design
- 🎨 Modern, clean UI
- ⚡ Fast and lightweight

## Development

### Prerequisites
- Node.js 16 or higher
- Running CanaryTalk server (see `/server` directory)

### Installation
```bash
npm install
```

### Running Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production
```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

## Deployment

### Serve with the CanaryTalk Server

1. Build the web app:
```bash
npm run build
```

2. Copy the `dist` directory contents to the server's public directory

3. Update the server to serve static files (already configured in the server)

### Standalone Deployment

You can deploy the built `dist/` directory to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront
- Any web server (nginx, Apache, etc.)

**Important**: Make sure to configure the API endpoint in production. The app automatically detects localhost and uses the appropriate server URL.

## Environment Variables

The app automatically detects the environment:
- Development: Uses `http://localhost:3000` for the API
- Production: Uses the same origin as the web app

## Security

- All messages are encrypted client-side before sending
- Private keys never leave the user's device
- Keys are stored in browser's localStorage
- End-to-end encryption using the NaCl crypto library (libsodium)

## Browser Compatibility

Works on all modern browsers that support:
- ES6+
- WebSocket
- LocalStorage
- Modern CSS (Flexbox, Grid)

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
