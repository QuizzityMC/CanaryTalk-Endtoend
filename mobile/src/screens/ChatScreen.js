import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import encryptionService from '../services/encryption';
import socketService from '../services/socket';
import { getUserPublicKey } from '../services/api';

export default function ChatScreen({ route, user }) {
  const { contact } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    setupSocketListeners();
    
    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('user_typing', handleUserTyping);
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const setupSocketListeners = () => {
    socketService.on('new_message', handleNewMessage);
    socketService.on('user_typing', handleUserTyping);
  };

  const handleNewMessage = async (data) => {
    const { fromUserId, fromUsername, encryptedContent, timestamp } = data;
    
    if (fromUserId !== contact.userId) return;

    try {
      const userData = await getUserPublicKey(fromUsername);
      const decryptedMessage = await encryptionService.decrypt(
        JSON.parse(encryptedContent),
        userData.publicKey
      );

      const message = {
        id: timestamp.toString(),
        fromUserId,
        content: decryptedMessage,
        timestamp,
        sent: false
      };

      setMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('Failed to decrypt message:', error);
    }
  };

  const handleUserTyping = (data) => {
    if (data.fromUserId === contact.userId) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const recipientData = await getUserPublicKey(contact.username);
      const encrypted = await encryptionService.encrypt(
        newMessage,
        recipientData.publicKey
      );

      const message = {
        id: Date.now().toString(),
        fromUserId: user.userId,
        content: newMessage,
        timestamp: Date.now(),
        sent: true
      };

      setMessages(prev => [...prev, message]);
      socketService.sendMessage(contact.userId, JSON.stringify(encrypted));
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleTyping = () => {
    socketService.sendTyping(contact.userId);
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.message, item.sent ? styles.sentMessage : styles.receivedMessage]}>
      <Text style={[styles.messageText, item.sent && styles.sentMessageText]}>
        {item.content}
      </Text>
      <Text style={[styles.messageTime, item.sent && styles.sentMessageTime]}>
        {new Date(item.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>{contact.username} is typing...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={(text) => {
            setNewMessage(text);
            handleTyping();
          }}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    padding: 15,
    gap: 10,
  },
  message: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 12,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  sentMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#666',
    textAlign: 'right',
  },
  sentMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  typingIndicator: {
    padding: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  typingText: {
    fontSize: 13,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
