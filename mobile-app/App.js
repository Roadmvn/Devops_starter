import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import AuthProvider from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';

export default function App() {
  return (
    <NavigationContainer
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      }
    >
      <AuthProvider>
        <CartProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </CartProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
