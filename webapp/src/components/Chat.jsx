import React, { useState, useEffect, useRef } from 'react';
import encryptionService from '../services/encryption';
import socketService from '../services/socket';
import { getUserPublicKey, searchUsers } from '../services/api';
import './Chat.css';

export default function Chat({ user, onLogout }) {
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    setupSocketListeners();
    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('pending_messages', handlePendingMessages);
      socketService.off('user_typing', handleUserTyping);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeContact]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const setupSocketListeners = () => {
    socketService.on('new_message', handleNewMessage);
    socketService.on('pending_messages', handlePendingMessages);
    socketService.on('user_typing', handleUserTyping);
  };

  const handleNewMessage = (data) => {
    const { fromUserId, fromUsername, encryptedContent, timestamp } = data;
    
    addContactIfNeeded(fromUserId, fromUsername);
    
    getUserPublicKey(fromUsername).then(userData => {
      const decryptedMessage = encryptionService.decrypt(
        JSON.parse(encryptedContent),
        userData.publicKey
      );

      const message = {
        id: Date.now(),
        fromUserId,
        fromUsername,
        content: decryptedMessage,
        timestamp,
        sent: false
      };

      setMessages(prev => ({
        ...prev,
        [fromUserId]: [...(prev[fromUserId] || []), message]
      }));
    });
  };

  const handlePendingMessages = (data) => {
    data.messages.forEach(msg => {
      handleNewMessage({
        fromUserId: msg.from_user,
        fromUsername: 'User',
        encryptedContent: msg.encrypted_content,
        timestamp: msg.timestamp
      });
    });
  };

  const handleUserTyping = (data) => {
    const { fromUserId } = data;
    setTypingUsers(prev => new Set(prev).add(fromUserId));
    
    setTimeout(() => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(fromUserId);
        return next;
      });
    }, 3000);
  };

  const addContactIfNeeded = (userId, username) => {
    setContacts(prev => {
      const exists = prev.some(c => c.userId === userId);
      if (!exists) {
        return [...prev, { userId, username }];
      }
      return prev;
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchUsers(searchQuery);
      setSearchResults(data.users.filter(u => u.id !== user.userId));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const startChat = (contact) => {
    addContactIfNeeded(contact.id, contact.username);
    setActiveContact({ userId: contact.id, username: contact.username });
    setSearchQuery('');
    setSearchResults([]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeContact) return;

    try {
      const recipientData = await getUserPublicKey(activeContact.username);
      const encrypted = encryptionService.encrypt(
        newMessage,
        recipientData.publicKey
      );

      const message = {
        id: Date.now(),
        fromUserId: user.userId,
        fromUsername: user.username,
        content: newMessage,
        timestamp: Date.now(),
        sent: true
      };

      setMessages(prev => ({
        ...prev,
        [activeContact.userId]: [...(prev[activeContact.userId] || []), message]
      }));

      socketService.sendMessage(activeContact.userId, JSON.stringify(encrypted));
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleTyping = () => {
    if (activeContact) {
      socketService.sendTyping(activeContact.userId);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      handleTyping();
    }
  };

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>CanaryTalk</h2>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>

        <div className="user-info">
          <div className="user-avatar">{user.username[0].toUpperCase()}</div>
          <div className="user-details">
            <div className="username">{user.username}</div>
            <div className="status">🔒 Encrypted</div>
          </div>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? '...' : '🔍'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="search-results">
            <div className="search-results-header">Search Results</div>
            {searchResults.map(contact => (
              <div
                key={contact.id}
                className="contact-item"
                onClick={() => startChat(contact)}
              >
                <div className="contact-avatar">{contact.username[0].toUpperCase()}</div>
                <div className="contact-name">{contact.username}</div>
              </div>
            ))}
          </div>
        )}

        <div className="contacts-list">
          <div className="contacts-header">Conversations</div>
          {contacts.length === 0 ? (
            <div className="no-contacts">Search for users to start chatting</div>
          ) : (
            contacts.map(contact => (
              <div
                key={contact.userId}
                className={`contact-item ${activeContact?.userId === contact.userId ? 'active' : ''}`}
                onClick={() => setActiveContact(contact)}
              >
                <div className="contact-avatar">{contact.username[0].toUpperCase()}</div>
                <div className="contact-name">{contact.username}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-main">
        {activeContact ? (
          <>
            <div className="chat-header">
              <div className="chat-contact-info">
                <div className="chat-avatar">{activeContact.username[0].toUpperCase()}</div>
                <div>
                  <div className="chat-contact-name">{activeContact.username}</div>
                  {typingUsers.has(activeContact.userId) && (
                    <div className="typing-indicator">typing...</div>
                  )}
                </div>
              </div>
            </div>

            <div className="messages-container">
              {(messages[activeContact.userId] || []).map(msg => (
                <div
                  key={msg.id}
                  className={`message ${msg.sent ? 'sent' : 'received'}`}
                >
                  <div className="message-content">{msg.content}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message... (Enter to send)"
                rows="1"
              />
              <button onClick={sendMessage} disabled={!newMessage.trim()}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="welcome-message">
              <h2>Welcome to CanaryTalk</h2>
              <p>Select a conversation or search for users to start chatting</p>
              <p className="encryption-note">🔒 All messages are end-to-end encrypted</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
