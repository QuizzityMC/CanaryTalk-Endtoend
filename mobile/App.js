import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthScreen from './src/screens/AuthScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import ChatScreen from './src/screens/ChatScreen';
import encryptionService from './src/services/encryption';
import socketService from './src/services/socket';

const Stack = createStackNavigator();

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    await encryptionService.init();

    // Check if user is logged in
    try {
      const savedUser = await AsyncStorage.getItem('user');
      const savedToken = await AsyncStorage.getItem('token');

      if (savedUser && savedToken) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        socketService.connect(savedToken);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }

    setIsLoading(false);
  };

  const handleLogin = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    await AsyncStorage.setItem('token', userData.token);
    socketService.connect(userData.token);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    socketService.disconnect();
    setUser(null);
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4CAF50',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          {user ? (
            <>
              <Stack.Screen 
                name="ChatList" 
                options={{ title: 'CanaryTalk' }}
              >
                {props => <ChatListScreen {...props} user={user} onLogout={handleLogout} />}
              </Stack.Screen>
              <Stack.Screen 
                name="Chat"
                options={({ route }) => ({ title: route.params.contact.username })}
              >
                {props => <ChatScreen {...props} user={user} />}
              </Stack.Screen>
            </>
          ) : (
            <Stack.Screen 
              name="Auth" 
              options={{ headerShown: false }}
            >
              {props => <AuthScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;
