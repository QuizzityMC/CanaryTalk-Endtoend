import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Chat from './components/Chat';
import encryptionService from './services/encryption';
import socketService from './services/socket';
import { login, register, updatePublicKey } from './services/api';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    await encryptionService.init();

    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      socketService.connect(savedToken);
    }

    setLoading(false);
  };

  const handleLogin = async (username, password) => {
    const data = await login(username, password);
    
    const userData = {
      userId: data.userId,
      username: data.username,
      token: data.token
    };

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', data.token);

    setUser(userData);
    socketService.connect(data.token);

    // Update public key if needed
    const publicKey = encryptionService.getPublicKey();
    if (publicKey) {
      try {
        await updatePublicKey(data.userId, publicKey, data.token);
      } catch (error) {
        console.error('Failed to update public key:', error);
      }
    }
  };

  const handleRegister = async (username, password) => {
    const publicKey = encryptionService.getPublicKey();
    const data = await register(username, password, publicKey);
    
    const userData = {
      userId: data.userId,
      username: data.username,
      token: data.token
    };

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', data.token);

    setUser(userData);
    socketService.connect(data.token);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    socketService.disconnect();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading CanaryTalk...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {user ? (
        <Chat user={user} onLogout={handleLogout} />
      ) : (
        <Auth onLogin={handleLogin} onRegister={handleRegister} />
      )}
    </div>
  );
}
