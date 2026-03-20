import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { UserProvider } from './src/context/UserContext';
import { AuthProvider } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { WatchHistoryProvider } from './src/context/WatchHistoryContext';
import { NotificationProvider } from './src/context/NotificationContext';
import RootNavigator from './src/navigation/RootNavigator';
import { linking } from './src/navigation/linking';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <UserProvider>
          <AuthProvider>
            <FavoritesProvider>
              <WatchHistoryProvider>
                <NotificationProvider>
                  <NavigationContainer
                    linking={linking}
                    theme={{
                      dark: true,
                      colors: {
                        primary: '#FFD369',
                        background: '#0f0f23',
                        card: '#1a1a2e',
                        text: '#ffffff',
                        border: '#2a2a4a',
                        notification: '#ff4444',
                      },
                    }}
                  >
                    <StatusBar style="light" />
                    <RootNavigator />
                  </NavigationContainer>
                </NotificationProvider>
              </WatchHistoryProvider>
            </FavoritesProvider>
          </AuthProvider>
        </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
