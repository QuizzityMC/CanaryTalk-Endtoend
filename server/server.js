const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'canarytalk-secret-key-change-in-production';

// Initialize database
const db = new Database('canarytalk.db');
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    public_key TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    from_user TEXT NOT NULL,
    to_user TEXT NOT NULL,
    encrypted_content TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    delivered INTEGER DEFAULT 0,
    FOREIGN KEY (from_user) REFERENCES users(id),
    FOREIGN KEY (to_user) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_messages_to_user ON messages(to_user, delivered);
  CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
`);

// Middleware
app.use(cors());
app.use(express.json());

// Serve web app static files
const webAppPath = path.join(__dirname, '../webapp/dist');
app.use(express.static(webAppPath));

// Store active connections
const activeUsers = new Map(); // userId -> socketId

// Helper functions
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// REST API endpoints
app.post('/api/register', async (req, res) => {
  const { username, password, publicKey } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare('INSERT INTO users (id, username, password_hash, public_key, created_at) VALUES (?, ?, ?, ?, ?)');
    stmt.run(userId, username, passwordHash, publicKey || null, Date.now());

    const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '30d' });
    
    res.json({ 
      success: true, 
      userId, 
      username,
      token 
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      userId: user.id,
      username: user.username,
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/users/public-key', (req, res) => {
  const { userId, publicKey } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || decoded.userId !== userId) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    const stmt = db.prepare('UPDATE users SET public_key = ? WHERE id = ?');
    stmt.run(publicKey, userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update public key' });
  }
});

app.get('/api/users/:username/public-key', (req, res) => {
  const { username } = req.params;

  try {
    const stmt = db.prepare('SELECT id, username, public_key FROM users WHERE username = ?');
    const user = stmt.get(username);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: user.id,
      username: user.username,
      publicKey: user.public_key
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get public key' });
  }
});

app.get('/api/users/search/:query', (req, res) => {
  const { query } = req.params;

  try {
    const stmt = db.prepare('SELECT id, username FROM users WHERE username LIKE ? LIMIT 20');
    const users = stmt.all(`%${query}%`);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('authenticate', (data) => {
    const { token } = data;
    const decoded = verifyToken(token);

    if (!decoded) {
      socket.emit('auth_error', { error: 'Invalid token' });
      return;
    }

    socket.userId = decoded.userId;
    socket.username = decoded.username;
    activeUsers.set(decoded.userId, socket.id);

    socket.emit('authenticated', { 
      userId: decoded.userId, 
      username: decoded.username 
    });

    // Send any pending messages
    try {
      const stmt = db.prepare('SELECT * FROM messages WHERE to_user = ? AND delivered = 0 ORDER BY timestamp ASC');
      const pendingMessages = stmt.all(decoded.userId);

      if (pendingMessages.length > 0) {
        socket.emit('pending_messages', { messages: pendingMessages });

        // Mark as delivered
        const updateStmt = db.prepare('UPDATE messages SET delivered = 1 WHERE to_user = ?');
        updateStmt.run(decoded.userId);
      }
    } catch (error) {
      console.error('Error fetching pending messages:', error);
    }

    console.log(`User authenticated: ${decoded.username} (${decoded.userId})`);
  });

  socket.on('send_message', (data) => {
    if (!socket.userId) {
      socket.emit('error', { error: 'Not authenticated' });
      return;
    }

    const { toUserId, encryptedContent } = data;
    const messageId = uuidv4();
    const timestamp = Date.now();

    try {
      // Store message in database
      const stmt = db.prepare('INSERT INTO messages (id, from_user, to_user, encrypted_content, timestamp, delivered) VALUES (?, ?, ?, ?, ?, ?)');
      const targetSocketId = activeUsers.get(toUserId);
      const delivered = targetSocketId ? 1 : 0;
      
      stmt.run(messageId, socket.userId, toUserId, encryptedContent, timestamp, delivered);

      // Send to recipient if online
      if (targetSocketId) {
        io.to(targetSocketId).emit('new_message', {
          messageId,
          fromUserId: socket.userId,
          fromUsername: socket.username,
          encryptedContent,
          timestamp
        });
      }

      // Confirm to sender
      socket.emit('message_sent', {
        messageId,
        timestamp,
        delivered
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { error: 'Failed to send message' });
    }
  });

  socket.on('typing', (data) => {
    if (!socket.userId) return;

    const { toUserId } = data;
    const targetSocketId = activeUsers.get(toUserId);

    if (targetSocketId) {
      io.to(targetSocketId).emit('user_typing', {
        fromUserId: socket.userId,
        fromUsername: socket.username
      });
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      console.log(`User disconnected: ${socket.username} (${socket.userId})`);
    } else {
      console.log('Client disconnected:', socket.id);
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    activeConnections: activeUsers.size
  });
});

// Serve web app for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(webAppPath, 'index.html'));
});

// Start server
server.listen(PORT, () => {
  console.log(`CanaryTalk server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`HTTP API endpoint: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    db.close();
    process.exit(0);
  });
});
