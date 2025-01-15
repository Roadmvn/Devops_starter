import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';

// Écrans d'authentification
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Écrans principaux
import HomeScreen from '../screens/main/HomeScreen';
import ScannerScreen from '../screens/main/ScannerScreen';
import CartScreen from '../screens/main/CartScreen';
import ProductScreen from '../screens/main/ProductScreen';
import HistoryScreen from '../screens/main/HistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navigation principale avec tabs
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5
        }
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color }) => (
            <Ionicons name="scan-outline" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'Panier',
          tabBarIcon: ({ color }) => (
            <Ionicons name="cart-outline" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Historique',
          tabBarIcon: ({ color }) => (
            <Ionicons name="time-outline" size={24} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

// Navigation principale de l'application
export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      {user ? (
        // Écrans authentifiés
        <Stack.Group>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="Product" component={ProductScreen} />
        </Stack.Group>
      ) : (
        // Écrans non authentifiés
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
