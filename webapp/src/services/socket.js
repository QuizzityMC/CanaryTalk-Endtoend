import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  connect(token) {
    // Use environment variable if set, otherwise auto-detect
    const serverUrl = import.meta.env.VITE_SERVER_URL ||
      (window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : window.location.origin);

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connected = true;
      this.socket.emit('authenticate', { token });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected = false;
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    const events = [
      'authenticated',
      'auth_error',
      'new_message',
      'pending_messages',
      'message_sent',
      'user_typing',
      'error'
    ];

    events.forEach(event => {
      this.socket.on(event, (data) => {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => callback(data));
      });
    });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  sendMessage(toUserId, encryptedContent) {
    if (!this.socket || !this.connected) {
      throw new Error('Not connected to server');
    }
    this.socket.emit('send_message', { toUserId, encryptedContent });
  }

  sendTyping(toUserId) {
    if (!this.socket || !this.connected) return;
    this.socket.emit('typing', { toUserId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
}

export default new SocketService();
