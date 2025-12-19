// Configuration for API endpoints
// Update these values for your production deployment

import { Platform } from 'react-native';

// For Android emulator: use 10.0.2.2 to access host machine's localhost
// For iOS simulator: use localhost
// For real devices: use your server's IP or domain

const getDefaultServerUrl = () => {
  if (__DEV__) {
    // Development mode
    return Platform.OS === 'android' 
      ? 'http://10.0.2.2:3005'  // Android emulator
      : 'http://localhost:3005'; // iOS simulator
  }
  // Production - update this with your server URL
  return 'https://your-server-domain.com';
};

export const API_URL = getDefaultServerUrl() + '/api';
export const SOCKET_URL = getDefaultServerUrl();
