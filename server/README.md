# CanaryTalk Server

## Features
- User registration and authentication with JWT
- Real-time messaging via WebSocket (Socket.io)
- End-to-end encryption support (key exchange)
- Message persistence and delivery tracking
- User search functionality
- SQLite database for lightweight deployment

## Quick Start

### Installation
```bash
npm install
```

### Configuration
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Edit `.env`:
- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: Secret key for JWT tokens (change in production!)

### Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
  ```json
  {
    "username": "user123",
    "password": "password",
    "publicKey": "base64-encoded-public-key"
  }
  ```

- `POST /api/login` - Login user
  ```json
  {
    "username": "user123",
    "password": "password"
  }
  ```

### User Management
- `GET /api/users/:username/public-key` - Get user's public key
- `POST /api/users/public-key` - Update user's public key
- `GET /api/users/search/:query` - Search users

### WebSocket Events

Client → Server:
- `authenticate` - Authenticate with JWT token
- `send_message` - Send encrypted message
- `typing` - Notify typing status

Server → Client:
- `authenticated` - Authentication successful
- `new_message` - New message received
- `pending_messages` - Pending messages on connect
- `message_sent` - Message delivery confirmation
- `user_typing` - User is typing notification

## Deployment on Linux VPS

### Using Node.js directly

1. Install Node.js (v16 or higher):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Clone and setup:
```bash
git clone <repository-url>
cd CanaryTalk-Endtoend/server
npm install
cp .env.example .env
nano .env  # Edit configuration
```

3. Run with PM2 (process manager):
```bash
sudo npm install -g pm2
pm2 start server.js --name canarytalk-server
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

### Using Docker

1. Build and run:
```bash
docker build -t canarytalk-server .
docker run -d -p 3000:3000 --name canarytalk canarytalk-server
```

### Using Docker Compose

```bash
docker-compose up -d
```

### Nginx Reverse Proxy (Optional)

For HTTPS and domain setup:

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

## Security Notes

⚠️ **Important for Production:**
1. Change `JWT_SECRET` to a strong random value
2. Use HTTPS/WSS in production (setup SSL certificate)
3. Configure firewall rules
4. Regular backups of the database
5. Keep dependencies updated

## Database

The server uses SQLite for simplicity. The database file `canarytalk.db` is created automatically on first run.

### Tables
- `users` - User accounts and public keys
- `messages` - Message storage and delivery tracking

## Health Check

```bash
curl http://localhost:3000/health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "activeConnections": 5
}
```
